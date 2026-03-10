import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAdminClient } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('[Webhook] Signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        await handleStripeEvent(event);
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[Webhook] Handler error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

async function handleStripeEvent(event: Stripe.Event): Promise<void> {
    const supabase = getAdminClient();

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.supabase_user_id;
            const subscriptionId = session.subscription as string;
            if (!userId || !subscriptionId) return;

            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0]?.price.id;
            const plan = await findPlanByPriceId(supabase, priceId);

            if (plan) {
                await (supabase.from('profiles') as any).update({
                    plan_id: plan.id,
                    stripe_subscription_id: subscriptionId,
                    subscription_status: 'active',
                }).eq('id', userId);
            }
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.supabase_user_id;
            if (!userId) return;

            const priceId = subscription.items.data[0]?.price.id;
            const plan = await findPlanByPriceId(supabase, priceId);

            if (plan) {
                await (supabase.from('profiles') as any).update({
                    plan_id: plan.id,
                    subscription_status: subscription.status,
                }).eq('id', userId);
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.supabase_user_id;
            if (!userId) return;

            const { data: freePlan } = await (supabase.from('plans') as any)
                .select('id')
                .eq('name', 'free')
                .single() as { data: { id: string } | null };

            if (freePlan) {
                await (supabase.from('profiles') as any).update({
                    plan_id: freePlan.id,
                    stripe_subscription_id: null,
                    subscription_status: 'canceled',
                }).eq('id', userId);
            }
            break;
        }
    }
}

async function findPlanByPriceId(
    supabase: ReturnType<typeof getAdminClient>,
    priceId: string | undefined
): Promise<{ id: string } | null> {
    if (!priceId) return null;
    const { data } = await (supabase.from('plans') as any)
        .select('id')
        .eq('stripe_price_id', priceId)
        .single();
    return data ?? null;
}
