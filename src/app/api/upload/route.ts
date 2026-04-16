import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { validateFileContent, sanitizeFileName, type AllowedKind } from '@/lib/fileValidation';

const ALLOWED_KINDS: AllowedKind[] = ['jpg', 'png', 'webp', 'heic', 'pdf'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rl = rateLimit(`upload:${user.id}`, 30, 60 * 1000);
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
            { status: 429, headers: { 'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } },
        );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const petId = formData.get('pet_id') as string | null;
    const consultationId = formData.get('consultation_id') as string | null;

    if (!file || !petId) {
        return NextResponse.json({ error: 'file e pet_id são obrigatórios' }, { status: 400 });
    }

    if (!UUID_REGEX.test(petId)) {
        return NextResponse.json({ error: 'pet_id inválido' }, { status: 400 });
    }
    if (consultationId && !UUID_REGEX.test(consultationId)) {
        return NextResponse.json({ error: 'consultation_id inválido' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'Arquivo muito grande (máx. 10 MB)' }, { status: 400 });
    }

    // Verify pet ownership before anything else.
    const { data: pet } = await supabase
        .from('pets')
        .select('id')
        .eq('id', petId)
        .eq('owner_id', user.id)
        .single();

    if (!pet) {
        return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 });
    }

    // If a consultation was provided, ensure it belongs to the same pet.
    if (consultationId) {
        const { data: consultation } = await supabase
            .from('vet_consultations')
            .select('id')
            .eq('id', consultationId)
            .eq('pet_id', petId)
            .single();

        if (!consultation) {
            return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 });
        }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = validateFileContent(buffer, file.type, ALLOWED_KINDS);
    if (!kind) {
        return NextResponse.json(
            { error: 'Tipo de arquivo não permitido ou conteúdo inválido. Use JPG, PNG, WEBP, HEIC ou PDF.' },
            { status: 400 },
        );
    }

    const safeName = sanitizeFileName(file.name);
    const storagePath = `${user.id}/${petId}/${Date.now()}.${kind}`;

    const adminClient = getAdminClient();

    const { data: uploadData, error: uploadError } = await adminClient.storage
        .from('pet-documents')
        .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
        console.error('[Upload] Storage error:', uploadError);
        return NextResponse.json({ error: 'Falha ao enviar arquivo' }, { status: 500 });
    }

    const { data: { publicUrl } } = adminClient.storage
        .from('pet-documents')
        .getPublicUrl(uploadData.path);

    if (consultationId) {
        const { error: insertError } = await (supabase.from('exam_attachments') as any).insert({
            pet_id: petId,
            consultation_id: consultationId,
            name: safeName,
            file_url: publicUrl,
            file_type: file.type,
        });
        if (insertError) {
            console.error('[Upload] Attachment insert error:', insertError);
            return NextResponse.json({ error: 'Falha ao registrar anexo' }, { status: 500 });
        }
    }

    return NextResponse.json({ url: publicUrl, path: uploadData.path, name: safeName, type: file.type });
}
