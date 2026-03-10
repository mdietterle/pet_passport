import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Use service role for webhooks

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        
        // Very basic validation (should ideally verify HMAC signature but AbacateSDK node might not provide an easy helper or we don't have the secret yet)
        if (!payload || !payload.data) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const billing = payload.data;
        const status = billing.status;
        const eventType = payload.event;
        
        // We only care about PAID status or "billing.paid"
        if (status === 'PAID' || eventType === 'billing.paid') {
            const customer = billing.customer;
            
            // Extract the user and plan IDs from the composite externalId we set during checkout
            let userId = customer?.metadata?.supabase_user_id; // Keeping for backwards compatibility if metadata ever gets supported
            let planId = customer?.metadata?.plan_id;
            
            if (!userId || !planId) {
                if (billing.products && billing.products.length > 0 && billing.products[0].externalId) {
                    const parts = billing.products[0].externalId.split('_');
                    if (parts.length === 2) {
                        userId = parts[0];
                        planId = parts[1];
                    }
                }
            }
            
            // Initialize Supabase with Service Role to bypass RLS
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
            
            if (!supabaseUrl || !supabaseKey) {
                console.error("Missing Supabase Service Role configuration");
                return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
            }
            
            const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

            if (userId && planId) {
                // Update the user's plan by User ID
                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        plan_id: planId,
                        subscription_status: 'active'
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Failed to update user profile via webhook:', error);
                    return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
                }
                
                console.log(`Successfully upgraded user ${userId} to plan ${planId}`);
            } else {
                console.error("Could not determine userId and planId from webhook payload:", { customer, products: billing.products });
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
