import { getAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * One-time admin endpoint to create missing profiles for users
 * whose auth trigger didn't fire.
 *
 * POST /api/admin/fix-profiles
 * Header: x-admin-key = SUPABASE_SERVICE_ROLE_KEY (as a simple auth check)
 */
export async function POST(request: NextRequest) {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = getAdminClient();

    // 1. Get all auth users
    const { data: { users }, error: usersErr } = await admin.auth.admin.listUsers();
    if (usersErr) {
        return NextResponse.json({ error: usersErr.message }, { status: 500 });
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
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
        message: `Profiles criados para ${missing.length} usuário(s)`,
        fixed: missing.length,
        users: missing.map(u => ({ id: u.id, email: u.email })),
    });
}
