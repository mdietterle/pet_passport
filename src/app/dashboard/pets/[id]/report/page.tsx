import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { ArrowLeft } from 'lucide-react';
import PetReport from '@/components/pets/PetReport';
import { formatDate } from '@/lib/dateUtils';

export default async function PetReportPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Verify ownership
    const { data: petData } = await (supabase.from('pets') as any)
        .select('*')
        .eq('id', params.id)
        .eq('owner_id', user.id)
        .single();

    const pet = petData as any;

    if (!pet) notFound();

    // Owner display name from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email:id')
        .eq('id', user.id)
        .single();

    const ownerName = (profile as any)?.full_name || user.email || 'Tutor';

    // Fetch all pet records in parallel
    const [{ data: vaccinationsData }, { data: consultationsData }, { data: occurrencesData }] = await Promise.all([
        (supabase.from('vaccinations') as any).select('*').eq('pet_id', pet.id).order('date', { ascending: false }),
        (supabase.from('vet_consultations') as any).select('*').eq('pet_id', pet.id).order('date', { ascending: false }),
        (supabase.from('occurrences') as any).select('*').eq('pet_id', pet.id).order('date', { ascending: false }),
    ]);

    const vaccinations = vaccinationsData as any[] | null;
    const consultations = consultationsData as any[] | null;
    const occurrences = occurrencesData as any[] | null;

    // Fetch documents using service role to avoid potential RLS issues
    const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: documents } = await serviceClient
        .from('documents')
        .select('file_url, file_name, file_type, reference_id, reference_type')
        .eq('pet_id', pet.id);

    const generatedAt = new Date().toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
    });

    return (
        <>
            {/* Back link — hidden on print */}
            <div className="no-print" style={{ padding: '12px 32px', background: 'var(--color-bg)' }}>
                <Link href={`/dashboard/pets/${pet.id}`} className="btn btn-ghost btn-sm">
                    <ArrowLeft size={16} /> Voltar para {pet.name}
                </Link>
            </div>

            <PetReport
                pet={pet}
                ownerName={ownerName}
                vaccinations={vaccinations || []}
                consultations={consultations || []}
                occurrences={occurrences || []}
                documents={documents || []}
                generatedAt={generatedAt}
            />
        </>
    );
}
