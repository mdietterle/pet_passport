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
      console.error(`Webhook Error: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Initialize Supabase Admin for DB updates bypassing RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Logging for debug purposes
    await supabaseAdmin.from('webhook_logs').insert([{ payload: event }]);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Extract metadata
      const userId = session.metadata?.supabase_user_id;
      const planId = session.metadata?.plan_id;
      const type = session.metadata?.type;
      
      const paymentMethodTypes = session.payment_method_types;
      // Convert Stripe's method names ('card', 'pix') to string for DB
      const paymentMethod = paymentMethodTypes && paymentMethodTypes.length > 0 ? paymentMethodTypes[0].toUpperCase() : 'UNKNOWN';

      if (type === 'subscription_upgrade' && userId && planId) {
        
        // Expiration in 30 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            plan_id: planId,
            subscription_status: 'active',
            payment_method: paymentMethod,
            plan_expires_at: expiresAt.toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('Failed to update user profile via Stripe webhook:', error);
          return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
        }
        
        console.log(`Successfully upgraded user ${userId} to plan ${planId} via Stripe (${paymentMethod})`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Stripe Webhook Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
