import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('plan_id, subscription_status, stripe_subscription_id, plans(name, price_brl)')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
        }

        const plan = (profile as any).plans;

        if (!plan || plan.price_brl === 0 || plan.name === 'free') {
            return NextResponse.json({ error: 'Você já está no plano gratuito' }, { status: 400 });
        }

        if ((profile as any).subscription_status === 'canceled') {
            return NextResponse.json({ error: 'Assinatura já cancelada' }, { status: 400 });
        }

        // Cancel in Stripe if we have the subscription ID
        const stripeSubId = (profile as any).stripe_subscription_id;
        if (stripeSubId) {
            try {
                await stripe.subscriptions.cancel(stripeSubId);
            } catch (stripeErr: any) {
                // If already canceled in Stripe, continue to update the DB
                if (stripeErr?.code !== 'resource_missing') {
                    console.error('[cancel-subscription] Stripe cancel failed:', stripeErr?.message);
                    return NextResponse.json({ error: 'Erro ao cancelar no Stripe' }, { status: 500 });
                }
            }
        }

        // Resolve free plan ID
        const { data: freePlan } = await supabase
            .from('plans')
            .select('id')
            .eq('name', 'free')
            .maybeSingle();

        const { error: updateError } = await (supabase as any)
            .from('profiles')
            .update({
                plan_id: (freePlan as any)?.id ?? null,
                subscription_status: 'canceled',
                plan_expires_at: null,
                stripe_subscription_id: null,
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('[cancel-subscription] DB update failed:', updateError);
            return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 });
        }

        console.info('[cancel-subscription] User downgraded to free:', user.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[cancel-subscription] Exception:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
