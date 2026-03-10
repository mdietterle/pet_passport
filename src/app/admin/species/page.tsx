import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SpeciesEditor from '@/components/admin/SpeciesEditor';

export default async function AdminSpeciesPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Load species from app_config if it exists
    let species: Array<{ value: string; label: string }> = [];
    const { data: config } = await supabase
        .from('app_config' as any)
        .select('value')
        .eq('key', 'species')
        .maybeSingle() as { data: { value: string } | null };

    if (config?.value) {
        try { species = JSON.parse(config.value); } catch { }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Espécies</h1>
                <p className="page-subtitle">Gerencie as espécies disponíveis nos formulários de cadastro de pets.</p>
            </div>
            <SpeciesEditor initial={species} />
        </div>
    );
}
