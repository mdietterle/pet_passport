import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rl = rateLimit(`toggle-public:${user.id}`, 30, 60 * 1000);
    if (!rl.ok) {
        return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const petId = body?.petId;
    const enabled = body?.enabled;

    if (!petId || typeof petId !== 'string' || !UUID_REGEX.test(petId)) {
        return NextResponse.json({ error: 'petId inválido' }, { status: 400 });
    }
    if (typeof enabled !== 'boolean') {
        return NextResponse.json({ error: 'enabled deve ser boolean' }, { status: 400 });
    }

    const { error } = await (supabase.from('pets') as any)
        .update({ public_profile_enabled: enabled })
        .eq('id', petId)
        .eq('owner_id', user.id);

    if (error) {
        console.error('[toggle-public] error:', error);
        return NextResponse.json({ error: 'Falha ao atualizar' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
