import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const formData = await request.formData();
        const priceId = formData.get('priceId') as string;

        if (!priceId) {
            return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
        }

        // Get or create Stripe customer
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id, full_name')
            .eq('id', user.id)
            .single() as { data: { stripe_customer_id: string | null; full_name: string | null } | null };

        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: profile?.full_name || undefined,
                metadata: { supabase_user_id: user.id },
            });
            customerId = customer.id;

            await (supabase.from('profiles') as any)
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plans?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plans?canceled=true`,
            metadata: { supabase_user_id: user.id },
            subscription_data: {
                metadata: { supabase_user_id: user.id },
            },
        });

        return NextResponse.redirect(session.url!, 303);
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
