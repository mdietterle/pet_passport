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
        
        // Initialize Supabase Admin strictly for logging so we don't need a session
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

        // ALWAYS LOG THE INCOMING PAYLOAD TO DATABASE TO DEBUG ABACATEPAY
        await supabaseAdmin.from('webhook_logs').insert([{ payload: payload }]);

        // We only care about PAID status or "billing.paid"
        if (status === 'PAID' || eventType === 'billing.paid') {
            const customer = billing.customer;
            
            // Extract the user and plan IDs
            let userId = customer?.metadata?.supabase_user_id; // Keeping for backwards compatibility
            let planId = customer?.metadata?.plan_id;
            let paymentMethod = 'PIX'; // Default to PIX
            
            if (!userId || !planId) {
                // Try parsing from completionUrl in metadata
                const completionUrlStr = billing.metadata?.completionUrl;
                if (completionUrlStr) {
                    try {
                        const url = new URL(completionUrlStr, 'http://localhost'); // base url fallback just in case
                        const urlUserId = url.searchParams.get('user');
                        const urlPlanId = url.searchParams.get('plan');
                        const urlMethod = url.searchParams.get('method');
                        if (urlUserId) userId = urlUserId;
                        if (urlPlanId) planId = urlPlanId;
                        if (urlMethod) paymentMethod = urlMethod;
                    } catch (e) {
                         console.error("Failed to parse completionUrl", e);
                    }
                }

                // Fallback to externalId if completionUrl didn't work and externalId exists
                if (!userId || !planId) {
                    if (billing.products && billing.products.length > 0 && billing.products[0].externalId) {
                        const parts = billing.products[0].externalId.split('_');
                        if (parts.length === 2) {
                            userId = parts[0];
                            planId = parts[1];
                        }
                    }
                }
            }
            
            if (userId && planId) {
                // Determine expiration (30 days from now)
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);

                // Update the user's plan by User ID
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
