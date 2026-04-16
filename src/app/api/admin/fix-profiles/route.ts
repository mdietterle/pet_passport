import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

/**
 * Admin endpoint to create missing profiles for users whose auth trigger
 * didn't fire. Requires an authenticated session belonging to a user with
 * `profiles.is_admin = true`.
 *
 * POST /api/admin/fix-profiles
 */
export async function POST(_request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rl = rateLimit(`admin-fix:${user.id}`, 5, 60 * 1000);
    if (!rl.ok) {
        return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!(profile as any)?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = getAdminClient();

    // 1. Get all auth users
    const { data: { users }, error: usersErr } = await admin.auth.admin.listUsers();
    if (usersErr) {
        console.error('[admin/fix-profiles] listUsers error:', usersErr);
        return NextResponse.json({ error: 'Falha ao listar usuários' }, { status: 500 });
    }

    // 2. Get all existing profile IDs
    const { data: profiles } = await (admin.from('profiles') as any).select('id');
    const existingIds = new Set((profiles || []).map((p: any) => p.id));

    // 3. Find users without a profile
    const missing = users.filter(u => !existingIds.has(u.id));

    if (missing.length === 0) {
        return NextResponse.json({ message: 'Nenhum usuário sem profile encontrado', fixed: 0 });
    }

    // 4. Get the free plan ID
    const { data: freePlan } = await (admin.from('plans') as any)
        .select('id')
        .eq('name', 'free')
        .single();

    if (!freePlan) {
        return NextResponse.json({ error: 'Plano free não encontrado' }, { status: 500 });
    }

    // 5. Insert missing profiles
    const toInsert = missing.map(u => ({
        id: u.id,
        full_name: u.user_metadata?.full_name || null,
        plan_id: freePlan.id,
    }));

    const { error: insertErr } = await (admin.from('profiles') as any).insert(toInsert);

    if (insertErr) {
        console.error('[admin/fix-profiles] insert error:', insertErr);
        return NextResponse.json({ error: 'Falha ao criar profiles' }, { status: 500 });
    }

    return NextResponse.json({
        message: `Profiles criados para ${missing.length} usuário(s)`,
        fixed: missing.length,
    });
}
