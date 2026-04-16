import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildPaymentLinkUrl } from '@/lib/planUtils';
import { rateLimit } from '@/lib/rateLimit';

/**
 * POST /api/stripe/checkout
 *
 * Redirects the authenticated user to the correct Stripe Payment Link for
 * the selected plan. The Payment Link is a professionally hosted Stripe page
 * that includes the product name, description, price, and marketing features.
 *
 * Query params injected into the Stripe URL:
 *  - prefilled_email  → pre-fills the customer e-mail field
 *  - client_reference_id → links the purchase to the Supabase user ID
 *    (consumed by the Stripe webhook to update the user's plan)
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            if (authError) console.error('[checkout] Auth error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rl = rateLimit(`checkout:${user.id}`, 10, 60 * 1000);
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
                { status: 429, headers: { 'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } },
            );
        }

        // Accept both form-data (HTML <form> POST) and JSON
        let planId: string | null = null;
        const contentType = request.headers.get('content-type') ?? '';

        if (contentType.includes('application/json')) {
            const body = await request.json();
            planId = body?.planId ?? null;
        } else {
            const formData = await request.formData();
            planId = (formData.get('planId') as string | null)?.trim() ?? null;
        }

        if (!planId) {
            return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
        }

        // Resolve plan details from Supabase
        const { data: planData, error: planError } = await supabase
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (planError || !planData) {
            console.error('[checkout] Plan not found:', planId, planError);
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        const plan = planData as any;

        if (plan.price_brl === 0) {
            return NextResponse.json({ error: 'Cannot checkout a free plan' }, { status: 400 });
        }

        // ──────────────────────────────────────────────────────────────────────
        // PRIMARY PATH: redirect to the pre-configured Stripe Payment Link.
        // The Payment Link is a professionally hosted Stripe page that already
        // contains the product info, price and marketing features configured
        // via the Stripe dashboard / MCP. We only need to append query params
        // so Stripe can pre-fill the customer's email and tag the purchase with
        // the Supabase user ID for the webhook to pick up.
        // ──────────────────────────────────────────────────────────────────────
        const paymentLinkUrl = buildPaymentLinkUrl(
            plan.name,          // e.g. 'basic' | 'pro' | 'premium'
            user.email,
            user.id,
        );

        if (paymentLinkUrl) {
            console.info('[checkout] Redirecting to Stripe Payment Link for plan:', plan.name);
            return NextResponse.redirect(paymentLinkUrl, 303);
        }

        // ──────────────────────────────────────────────────────────────────────
        // FALLBACK PATH: create a dynamic Stripe Checkout Session.
        // Used only if no Payment Link is registered for this plan.
        // ──────────────────────────────────────────────────────────────────────
        console.warn('[checkout] No Payment Link for plan, falling back to Checkout Session:', plan.name);

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            console.error('[checkout] STRIPE_SECRET_KEY not set');
            return NextResponse.json(
                { error: 'Payment gateway configuration error' },
                { status: 500 },
            );
        }

        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(stripeSecretKey);

        const amountInCents = Math.round(plan.price_brl * 100);
        const domainURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: `Plano ${plan.display_name}`,
                            description: `Assinatura Pet Passport — ${plan.display_name}`,
                        },
                        unit_amount: amountInCents,
                        recurring: { interval: 'month' },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${domainURL}/dashboard/plans?stripe_success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domainURL}/dashboard/plans?stripe_canceled=true`,
            customer_email: user.email ?? undefined,
            client_reference_id: user.id,
            metadata: {
                supabase_user_id: user.id,
                plan_id: plan.id,
                type: 'subscription_upgrade',
            },
        });

        if (session.url) {
            return NextResponse.redirect(session.url, 303);
        }

        return NextResponse.json(
            { error: 'Failed to create checkout session URL' },
            { status: 500 },
        );
    } catch (error: any) {
        console.error('[checkout] Unexpected error:', {
            message: error?.message,
            type: error?.type,
            code: error?.code,
        });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
