import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import AbacatePay from 'abacatepay-nodejs-sdk';

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

        // Fetch user profile to get names, taxId, cellphone
        const { data: profileRaw } = await supabase
            .from('profiles')
            .select('full_name, tax_id, cellphone')
            .eq('id', user.id)
            .single();

        const profile = profileRaw as any;

        if (!profile?.tax_id || !profile?.cellphone) {
            return NextResponse.json({ error: 'User profile must have cellphone and tax_id (CPF/CNPJ) for PIX payments.' }, { status: 400 });
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

        // Initialize Abacate Pay SDK
        const apiKey = process.env.ABACATEPAY_API_KEY;
        if (!apiKey) {
            console.error('ABACATEPAY_API_KEY is not defined in environment variables');
            return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
        }

        const abacate = AbacatePay(apiKey);

        // Calculate amount in cents (e.g., 29.90 -> 2990)
        const amountInCents = Math.round(plan.price_brl * 100);

        // Instead of using the SDK to create billing, we use raw fetch to get proper error messages
        const apiUrl = 'https://api.abacatepay.com/v1/billing/create';
        
        const payload = {
            frequency: "ONE_TIME",
            methods: ["PIX"],
            products: [
                {
                    externalId: `${user.id}_${plan.id}`,
                    name: `Plano ${plan.display_name}`,
                    description: `Assinatura Pet Passport - ${plan.display_name}`,
                    quantity: 1,
                    price: amountInCents,
                },
            ],
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plans`,
            completionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plans?abacate_success=true&plan=${plan.id}`,
            customer: {
                name: profile?.full_name || 'Usuário',
                email: user.email || '',
                cellphone: profile.cellphone,
                taxId: profile.tax_id, 
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const billingData = await response.json();

        if (!response.ok) {
            console.error('AbacatePay API Error:', response.status, billingData);
            return NextResponse.json({ error: 'Failed to create billing session', details: billingData }, { status: response.status });
        }

        const billingUrl = billingData.data?.url;

        // For simplicity, we just redirect the user to the generated payment URL.
        if (billingUrl) {
            return NextResponse.redirect(billingUrl, 303);
        } else {
            console.error('AbacatePay API missing URL:', billingData);
            return NextResponse.json({ error: 'Failed to create billing session', details: "Missing URL" }, { status: 500 });
        }

    } catch (error) {
        console.error('Abacate Pay Checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
