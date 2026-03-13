import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const rawPlanId = formData.get('planId') as string;
        const planId = rawPlanId?.trim();

        if (!planId) {
            return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
        }

        // Fetch user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, tax_id, cellphone')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // Fetch plan details from database
        const { data: planData, error: planError } = await supabase
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (planError || !planData) {
            console.error('Plan not found:', planError);
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        const plan = planData as any;

        if (plan.price_brl === 0) {
            return NextResponse.json({ error: 'Cannot checkout a free plan' }, { status: 400 });
        }

        // Initialize Stripe
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            console.error('STRIPE_SECRET_KEY is not defined in environment variables');
            return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
        }

        const stripe = new Stripe(stripeSecretKey);

        // Calculate amount in cents (e.g., 29.90 -> 2990)
        const amountInCents = Math.round(plan.price_brl * 100);

        // Build domain URL
        const domainURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'pix'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: `Plano ${plan.display_name}`,
                            description: `Assinatura Pet Passport - ${plan.display_name}`,
                        },
                        unit_amount: amountInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${domainURL}/dashboard/plans?stripe_success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domainURL}/dashboard/plans?stripe_canceled=true`,
            customer_email: user.email,
            client_reference_id: user.id, // Good practice
            metadata: {
                supabase_user_id: user.id,
                plan_id: plan.id,
                // Forcing generic identifier so webhook knows it's an app subscription
                type: 'subscription_upgrade' 
            }
        });

        if (session.url) {
            return NextResponse.redirect(session.url, 303);
        } else {
            return NextResponse.json({ error: 'Failed to create checkout session URL' }, { status: 500 });
        }

    } catch (error) {
        console.error('Stripe Checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
