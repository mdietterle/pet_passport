import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus, PawPrint } from 'lucide-react';
import { petAge } from '@/lib/dateUtils';

const SPECIES_EMOJI: Record<string, string> = {
    dog: '🐶', cat: '🐱', bird: '🐦', rabbit: '🐰', fish: '🐟', reptile: '🦎', other: '🐾',
};



export default async function PetsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', user.id)
        .single();

    const { data: petsRaw } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    const pets = petsRaw as any[] | null;

    const plan = (profile as any)?.plans;
    const petCount = pets?.length || 0;
    // If plan is null (plan_id not set yet), allow adding pets
    const canAddPet = !plan || plan.max_pets === null || petCount < plan.max_pets;

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="page-title">Meus Pets</h1>
                    <p className="page-subtitle">
                        {petCount} {petCount === 1 ? 'pet cadastrado' : 'pets cadastrados'}
                        {plan?.max_pets && ` de ${plan.max_pets}`}
                    </p>
                </div>
                {canAddPet ? (
                    <Link href="/dashboard/pets/new" className="btn btn-primary">
                        <Plus size={18} /> Adicionar Pet
                    </Link>
                ) : (
                    <Link href="/dashboard/plans" className="btn btn-secondary">
                        Fazer upgrade para adicionar mais
                    </Link>
                )}
            </div>

            {petCount === 0 ? (
                <div className="empty-state card">
                    <div className="empty-state-icon">🐾</div>
                    <h2 className="empty-state-title">Nenhum pet cadastrado ainda</h2>
                    <p className="empty-state-text">
                        Adicione seu primeiro pet para começar a registrar vacinas, consultas e muito mais!
                    </p>
                    <Link href="/dashboard/pets/new" className="btn btn-primary">
                        <Plus size={18} /> Adicionar meu primeiro pet
                    </Link>
                </div>
            ) : (
                <div className="pets-grid">
                    {(pets || []).map((pet) => (
                        <Link key={pet.id} href={`/dashboard/pets/${pet.id}`} className="pet-card">
                            <div className="pet-card-avatar">
                                {(pet as any).photo_url
                                    ? <img src={(pet as any).photo_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                    : SPECIES_EMOJI[pet.species] || '🐾'}
                            </div>
                            <div className="pet-card-body">
                                <h3 className="pet-card-name">{pet.name}</h3>
                                <p className="pet-card-breed">{pet.breed || pet.species}</p>
                                <div className="pet-card-meta">
                                    <span className="pet-card-age">{petAge(pet.birth_date)}</span>
                                    {pet.sex && (
                                        <span className="pet-card-sex">
                                            {pet.sex === 'male' ? '♂ Macho' : pet.sex === 'female' ? '♀ Fêmea' : ''}
                                        </span>
                                    )}
                                </div>
                                {pet.weight_kg && (
                                    <p className="pet-card-weight">{pet.weight_kg} kg</p>
                                )}
                            </div>
                            <div className="pet-card-arrow">→</div>
                        </Link>
                    ))}

                    {/* Add pet card */}
                    {canAddPet && (
                        <Link href="/dashboard/pets/new" className="pet-card pet-card-add">
                            <Plus size={32} />
                            <span>Adicionar pet</span>
                        </Link>
                    )}
                </div>
            )}

            <style>{`
        .pets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: var(--space-4);
        }
        .pet-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-3);
          transition: all var(--transition-base);
          position: relative;
          cursor: pointer;
        }
        .pet-card:hover {
          border-color: var(--color-teal);
          box-shadow: 0 0 20px var(--color-teal-glow);
          transform: translateY(-3px);
        }
        .pet-card-avatar {
          font-size: 3rem;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border-radius: 50%;
          border: 2px solid var(--color-border);
        }
        .pet-card-body { width: 100%; }
        .pet-card-name {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .pet-card-breed {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          text-transform: capitalize;
          margin-bottom: var(--space-2);
        }
        .pet-card-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
        .pet-card-weight {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: var(--space-1);
        }
        .pet-card-arrow {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          color: var(--color-text-muted);
          font-size: 1rem;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .pet-card:hover .pet-card-arrow { opacity: 1; }
        .pet-card-add {
          border-style: dashed;
          color: var(--color-text-muted);
          flex-direction: column;
          justify-content: center;
          min-height: 180px;
          gap: var(--space-2);
          font-size: 0.9rem;
        }
        .pet-card-add:hover {
          color: var(--color-teal-light);
          border-color: var(--color-teal);
          background: rgba(13, 148, 136, 0.05);
        }
      `}</style>
        </div>
    );
}
