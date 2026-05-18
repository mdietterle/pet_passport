import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json({ error: 'No signature' }, { status: 400 });
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error('[stripe/webhook] signature verification failed:', err?.message);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

        // Idempotency: if we've already handled this event, short-circuit.
        const { data: existing } = await supabaseAdmin
            .from('webhook_logs')
            .select('id')
            .eq('event_id', event.id)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ received: true, deduped: true }, { status: 200 });
        }

        // Log only non-sensitive metadata, not the full payload.
        await supabaseAdmin.from('webhook_logs').insert([{
            event_id: event.id,
            event_type: event.type,
        }]);

        // ──────────────────────────────────────────────────────────────────────
        // checkout.session.completed / checkout.session.async_payment_succeeded
        // → Upgrade user to the purchased plan.
        // ──────────────────────────────────────────────────────────────────────
        if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
            const session = event.data.object as Stripe.Checkout.Session;

            const userId = session.metadata?.supabase_user_id;
            const planId = session.metadata?.plan_id;
            const type = session.metadata?.type;

            if (type !== 'subscription_upgrade' || !userId || !planId) {
                return NextResponse.json({ received: true }, { status: 200 });
            }

            // Validate the plan exists in our DB before updating the profile.
            const { data: plan } = await supabaseAdmin
                .from('plans')
                .select('id')
                .eq('id', planId)
                .maybeSingle();

            if (!plan) {
                console.error('[stripe/webhook] plan not found for event', event.id);
                return NextResponse.json({ error: 'Plan not found' }, { status: 400 });
            }

            const paymentMethodTypes = session.payment_method_types;
            const paymentMethod = paymentMethodTypes && paymentMethodTypes.length > 0
                ? paymentMethodTypes[0].toUpperCase()
                : 'UNKNOWN';

            // Prefer the real subscription period from Stripe; fall back to 30 days.
            let expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            if (session.subscription && typeof session.subscription === 'string') {
                try {
                    const sub = await stripe.subscriptions.retrieve(session.subscription) as any;
                    const periodEnd = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end;
                    if (typeof periodEnd === 'number') {
                        expiresAt = new Date(periodEnd * 1000);
                    }
                } catch (err) {
                    console.warn('[stripe/webhook] could not retrieve subscription period:', err);
                }
            }

            const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
            const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;

            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    plan_id: planId,
                    subscription_status: 'active',
                    payment_method: paymentMethod,
                    plan_expires_at: expiresAt.toISOString(),
                    ...(stripeSubscriptionId ? { stripe_subscription_id: stripeSubscriptionId } : {}),
                    ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
                })
                .eq('id', userId);

            if (error) {
                console.error('[stripe/webhook] profile update failed:', error);
                return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
            }

            console.info('[stripe/webhook] plan upgraded for user', userId, '→ plan', planId);
        }

        // ──────────────────────────────────────────────────────────────────────
        // customer.subscription.deleted
        // → Downgrade user back to the free plan upon cancellation.
        // ──────────────────────────────────────────────────────────────────────
        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            const supabaseUserId = subscription.metadata?.supabase_user_id;

            if (!supabaseUserId) {
                console.warn('[stripe/webhook] subscription.deleted: no supabase_user_id in metadata', subscription.id);
                return NextResponse.json({ received: true }, { status: 200 });
            }

            // Resolve the free plan ID
            const { data: freePlan } = await supabaseAdmin
                .from('plans')
                .select('id')
                .eq('name', 'free')
                .maybeSingle();

            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    plan_id: freePlan?.id ?? null,
                    subscription_status: 'canceled',
                    plan_expires_at: null,
                })
                .eq('id', supabaseUserId);

            if (error) {
                console.error('[stripe/webhook] subscription.deleted update failed:', error);
                return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
            }

            console.info('[stripe/webhook] subscription canceled, user downgraded to free:', supabaseUserId);
        }

        // ──────────────────────────────────────────────────────────────────────
        // customer.subscription.updated
        // → Sync plan_expires_at when Stripe renews or changes the period.
        // ──────────────────────────────────────────────────────────────────────
        if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object as Stripe.Subscription;
            const supabaseUserId = subscription.metadata?.supabase_user_id;

            if (!supabaseUserId) {
                return NextResponse.json({ received: true }, { status: 200 });
            }

            const periodEnd = (subscription as any).current_period_end;
            const newExpiresAt = typeof periodEnd === 'number'
                ? new Date(periodEnd * 1000).toISOString()
                : null;

            const newStatus = subscription.status === 'active' ? 'active' : subscription.status;

            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    subscription_status: newStatus,
                    ...(newExpiresAt ? { plan_expires_at: newExpiresAt } : {}),
                })
                .eq('id', supabaseUserId);

            if (error) {
                console.error('[stripe/webhook] subscription.updated sync failed:', error);
                return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
            }

            console.info('[stripe/webhook] subscription updated for user', supabaseUserId, '→ status', newStatus);
        }

        // ──────────────────────────────────────────────────────────────────────
        // invoice.payment_failed
        // → Mark subscription as past_due so the UI can warn the user.
        // ──────────────────────────────────────────────────────────────────────
        if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;

            if (!customerId) {
                return NextResponse.json({ received: true }, { status: 200 });
            }

            // Look up the user by their Stripe customer ID stored in profiles.
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .maybeSingle();

            if (!profile) {
                console.warn('[stripe/webhook] invoice.payment_failed: no profile for customer', customerId);
                return NextResponse.json({ received: true }, { status: 200 });
            }

            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ subscription_status: 'past_due' })
                .eq('id', profile.id);

            if (error) {
                console.error('[stripe/webhook] invoice.payment_failed update failed:', error);
                return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
            }

            console.warn('[stripe/webhook] payment failed, user marked past_due:', profile.id);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error('[stripe/webhook] exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
