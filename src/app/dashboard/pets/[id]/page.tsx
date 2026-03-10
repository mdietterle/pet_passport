import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';
import { ArrowLeft, Edit, FileText, Lock } from 'lucide-react';
import { petAge, formatDate } from '@/lib/dateUtils';
import PetTabs from '@/components/pets/PetTabs';
import PetQRCode from '@/components/pets/PetQRCode';
import PetPassportPrint from '@/components/pets/PetPassportPrint';
import { canExportPDF, canUseQRCode } from '@/lib/planFeatures';

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐶', cat: '🐱', bird: '🐦', rabbit: '🐰', fish: '🐟', reptile: '🦎', other: '🐾',
};



export default async function PetDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: petRaw } = await supabase
    .from('pets')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single();

  const pet = petRaw as any;

  if (!pet) notFound();

  // Fetch profile with plan for limit checking
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, plans(*)')
    .eq('id', user.id)
    .single();

  // Fetch all records for this pet
  const [
    { data: vaccinations },
    { data: consultations },
    { data: occurrences },
    { data: weights },
    { data: parasites },
    { data: medications },
    { data: examAttachments },
  ] = await Promise.all([
    supabase.from('vaccinations').select('*').eq('pet_id', pet.id).order('date', { ascending: false }) as any,
    supabase.from('vet_consultations').select('*').eq('pet_id', pet.id).order('date', { ascending: false }) as any,
    supabase.from('occurrences').select('*').eq('pet_id', pet.id).order('date', { ascending: false }) as any,
    supabase.from('pet_weights').select('*').eq('pet_id', pet.id).order('date', { ascending: false }) as any,
    supabase.from('parasite_controls').select('*').eq('pet_id', pet.id).order('date', { ascending: false }) as any,
    supabase.from('medications').select('*').eq('pet_id', pet.id).order('start_date', { ascending: false }) as any,
    supabase.from('exam_attachments').select('*').eq('pet_id', pet.id).order('uploaded_at', { ascending: false }) as any,
  ]);

  const plan = (profile as any)?.plans;

  return (
    <div className="page-container">
      <Link href="/dashboard/pets" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)' }}>
        <ArrowLeft size={16} /> Meus Pets
      </Link>

      {/* Pet Header */}
      <div className="pet-header card">
        <div className="pet-header-avatar">
          {pet.photo_url ? (
            <img src={pet.photo_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            SPECIES_EMOJI[pet.species] || '🐾'
          )}
        </div>
        <div className="pet-header-info">
          <div className="pet-header-top">
            <h1 className="pet-header-name">{pet.name}</h1>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Link href={`/dashboard/pets/${pet.id}/report`} className="btn btn-secondary btn-sm">
                <FileText size={14} /> Relatório
              </Link>
              <Link href={`/dashboard/pets/${pet.id}/edit`} className="btn btn-secondary btn-sm">
                <Edit size={14} /> Editar
              </Link>
            </div>
          </div>
          <div className="pet-header-meta">
            {pet.breed && <span className="pet-meta-item">{pet.breed}</span>}
            <span className="pet-meta-item">{petAge(pet.birth_date)}</span>
            {pet.sex && pet.sex !== 'unknown' && (
              <span className="pet-meta-item">
                {pet.sex === 'male' ? '♂ Macho' : '♀ Fêmea'}
              </span>
            )}
            {pet.weight_kg && <span className="pet-meta-item">{pet.weight_kg} kg</span>}
          </div>
          <div className="pet-header-details">
            {pet.color && <span className="pet-detail">🎨 {pet.color}</span>}
            {pet.microchip && <span className="pet-detail">💾 Microchip: {pet.microchip}</span>}
            {pet.birth_date && (
              <span className="pet-detail">
                🎂 {formatDate(pet.birth_date)}
              </span>
            )}
          </div>
          {pet.notes && (
            <p className="pet-header-notes">{pet.notes}</p>
          )}
        </div>
      </div>

      {/* Tabs with records */}
      <PetTabs
        pet={pet}
        vaccinations={vaccinations || []}
        consultations={consultations || []}
        occurrences={occurrences || []}
        weights={weights || []}
        parasites={parasites || []}
        medications={medications || []}
        examAttachments={examAttachments || []}
        plan={plan}
      />

      {/* QR Code Section — Pro/Premium only */}
      {canUseQRCode(plan) ? (
        <PetQRCode
          petId={pet.id}
          qrToken={pet.qr_token || ''}
          petName={pet.name}
          publicEnabled={pet.public_profile_enabled || false}
        />
      ) : (
        <div className="feature-gate-card">
          <div className="feature-gate-icon"><Lock size={22} /></div>
          <div>
            <div className="feature-gate-title">QR Code & Perfil Público</div>
            <p className="feature-gate-desc">Gere um QR Code único para a coleira do {pet.name}. Disponível no plano <strong>Pro</strong> ou superior.</p>
          </div>
          <Link href="/dashboard/plans" className="btn btn-primary btn-sm">Fazer Upgrade</Link>
        </div>
      )}

      {/* PDF Export — Pro/Premium only */}
      {canExportPDF(plan) ? (
        <div className="card" style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title">📄 Exportar Passaporte</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Gera um PDF com os dados do pet, vacinas e medicações ativas.
            </p>
          </div>
          <PetPassportPrint
            pet={pet}
            vaccinations={vaccinations || []}
            consultations={consultations || []}
            parasites={parasites || []}
            medications={medications || []}
          />
        </div>
      ) : (
        <div className="feature-gate-card">
          <div className="feature-gate-icon">📄</div>
          <div>
            <div className="feature-gate-title">Exportar Passaporte (PDF)</div>
            <p className="feature-gate-desc">Gere um PDF com a ficha completa do {pet.name}. Disponível no plano <strong>Pro</strong> ou superior.</p>
          </div>
          <Link href="/dashboard/plans" className="btn btn-primary btn-sm">Fazer Upgrade</Link>
        </div>
      )}

      <style>{`
        .pet-header {
          display: flex;
          gap: var(--space-6);
          margin-bottom: var(--space-6);
          align-items: flex-start;
        }
        .pet-header-avatar {
          font-size: 4rem;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border-radius: 50%;
          border: 2px solid var(--color-border);
          flex-shrink: 0;
        }
        .pet-header-info { flex: 1; }
        .pet-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-2);
        }
        .pet-header-name {
          font-size: 1.75rem;
          font-weight: 700;
        }
        .pet-header-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }
        .pet-meta-item {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          background: var(--color-bg-tertiary);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
          text-transform: capitalize;
        }
        .pet-header-details {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-4);
          margin-bottom: var(--space-2);
        }
        .pet-detail {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
        .pet-header-notes {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          margin-top: var(--space-2);
          font-style: italic;
        }
        @media (max-width: 600px) {
          .pet-header { flex-direction: column; align-items: center; text-align: center; }
          .pet-header-top { flex-direction: column; gap: var(--space-3); }
          .pet-header-meta { justify-content: center; }
          .pet-header-details { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
