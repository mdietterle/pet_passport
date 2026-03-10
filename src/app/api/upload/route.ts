import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const petId = formData.get('pet_id') as string | null;
    const consultationId = formData.get('consultation_id') as string | null;

    if (!file || !petId) {
        return NextResponse.json({ error: 'file e pet_id são obrigatórios' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
            { error: 'Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou PDF.' },
            { status: 400 }
        );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'Arquivo muito grande (máx. 10 MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const storagePath = `${user.id}/${petId}/${Date.now()}.${ext}`;

    const adminClient = getAdminClient();

    const { data: uploadData, error: uploadError } = await adminClient.storage
        .from('pet-documents')
        .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
        console.error('[Upload] Storage error:', uploadError);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = adminClient.storage
        .from('pet-documents')
        .getPublicUrl(uploadData.path);

    if (consultationId) {
        await (supabase.from('exam_attachments') as any).insert({
            pet_id: petId,
            consultation_id: consultationId,
            name: file.name,
            file_url: publicUrl,
            file_type: file.type,
        });
    }

    return NextResponse.json({ url: publicUrl, path: uploadData.path, name: file.name, type: file.type });
}
