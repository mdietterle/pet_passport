import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PHOTOS_PER_PET = 10;

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check premium plan
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', user.id)
        .single();

    const plan = (profile as any)?.plans;
    if (plan?.name !== 'premium') {
        return NextResponse.json({ error: 'Recurso disponível apenas no plano Premium' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const petId = formData.get('pet_id') as string | null;

    if (!file || !petId) {
        return NextResponse.json({ error: 'file e pet_id são obrigatórios' }, { status: 400 });
    }

    // Verify pet ownership
    const { data: pet } = await supabase
        .from('pets')
        .select('id')
        .eq('id', petId)
        .eq('owner_id', user.id)
        .single();

    if (!pet) {
        return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
            { error: 'Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou HEIC.' },
            { status: 400 }
        );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'Arquivo muito grande (máx. 10 MB)' }, { status: 400 });
    }

    // Check photo count limit
    const adminClient = getAdminClient();
    const { count } = await (adminClient.from('pet_photos') as any)
        .select('*', { count: 'exact', head: true })
        .eq('pet_id', petId);

    if ((count ?? 0) >= MAX_PHOTOS_PER_PET) {
        return NextResponse.json(
            { error: `Limite de ${MAX_PHOTOS_PER_PET} fotos por pet atingido` },
            { status: 400 }
        );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const storagePath = `${user.id}/${petId}/photos/${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await adminClient.storage
        .from('pet-documents')
        .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
        console.error('[PetPhotos] Storage error:', uploadError);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = adminClient.storage
        .from('pet-documents')
        .getPublicUrl(uploadData.path);

    const { data: photo, error: insertError } = await (adminClient.from('pet_photos') as any)
        .insert({
            pet_id: petId,
            file_url: publicUrl,
            file_name: file.name,
            file_type: file.type,
            sort_order: (count ?? 0),
        })
        .select()
        .single();

    if (insertError) {
        console.error('[PetPhotos] Insert error:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(photo);
}

export async function DELETE(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { photoId } = await request.json();
    if (!photoId) {
        return NextResponse.json({ error: 'photoId é obrigatório' }, { status: 400 });
    }

    const adminClient = getAdminClient();

    // Fetch photo and verify ownership via pet
    const { data: photo } = await (adminClient.from('pet_photos') as any)
        .select('*, pets!inner(owner_id)')
        .eq('id', photoId)
        .single();

    if (!photo || photo.pets.owner_id !== user.id) {
        return NextResponse.json({ error: 'Foto não encontrada' }, { status: 404 });
    }

    // Extract storage path from URL
    const url = new URL(photo.file_url);
    const pathMatch = url.pathname.match(/\/object\/public\/pet-documents\/(.+)/);
    if (pathMatch) {
        await adminClient.storage.from('pet-documents').remove([pathMatch[1]]);
    }

    await (adminClient.from('pet_photos') as any).delete().eq('id', photoId);

    return NextResponse.json({ success: true });
}
