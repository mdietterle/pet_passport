import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { validateFileContent, type AllowedKind } from '@/lib/fileValidation';

const ALLOWED_KINDS: AllowedKind[] = ['jpg', 'png', 'webp', 'heic'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rl = rateLimit(`avatar:${user.id}`, 10, 60 * 1000);
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
            { status: 429, headers: { 'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } },
        );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ error: 'Arquivo obrigatório' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'Arquivo muito grande (máx. 5 MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = validateFileContent(buffer, file.type, ALLOWED_KINDS);
    if (!kind) {
        return NextResponse.json(
            { error: 'Use JPG, PNG, WEBP ou HEIC.' },
            { status: 400 },
        );
    }

    const storagePath = `${user.id}/avatar.${kind}`;

    const adminClient = getAdminClient();

    // Upsert replaces the file; explicit remove avoids stale extension variants (e.g. old .png when uploading .jpg)
    await adminClient.storage.from('avatars').remove([storagePath]);

    const { data: uploadData, error: uploadError } = await adminClient.storage
        .from('avatars')
        .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
        console.error('[Avatar] Storage error:', uploadError);
        return NextResponse.json({ error: 'Falha ao enviar avatar' }, { status: 500 });
    }

    const { data: { publicUrl } } = adminClient.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

    // Cache-busting suffix ensures browsers reload the new image immediately
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: profileError } = await (supabase.from('profiles') as any)
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

    if (profileError) {
        console.error('[Avatar] Profile update error:', profileError);
        return NextResponse.json({ error: 'Falha ao atualizar perfil' }, { status: 500 });
    }

    return NextResponse.json({ url: avatarUrl });
}
