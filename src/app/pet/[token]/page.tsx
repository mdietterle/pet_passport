import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { formatDate, petAge } from '@/lib/dateUtils';

const SPECIES_LABEL: Record<string, string> = {
    dog: 'Cachorro', cat: 'Gato', bird: 'Pássaro', rabbit: 'Coelho',
    fish: 'Peixe', reptile: 'Réptil', other: 'Outro',
};
const SPECIES_EMOJI: Record<string, string> = {
    dog: '🐶', cat: '🐱', bird: '🐦', rabbit: '🐰', fish: '🐟', reptile: '🦎', other: '🐾',
};

// Public (anon) client — só lê dados de pets públicos
function getPublicClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export async function generateMetadata({ params }: { params: { token: string } }) {
    const supabase = getPublicClient();
    const { data: pet } = await supabase.from('pets').select('name').eq('qr_token', params.token).single();
    return {
        title: pet ? `${pet.name} — Pet Passport` : 'Pet não encontrado',
    };
}

export default async function PublicPetPage({ params }: { params: { token: string } }) {
    const supabase = getPublicClient();

    const { data: petRaw } = await supabase
        .from('pets')
        .select('*')
        .eq('qr_token', params.token)
        .eq('public_profile_enabled', true)
        .single();

    if (!petRaw) notFound();
    const pet = petRaw as any;

    // Vacinas ativas (com próxima data futura ou sem data de vencimento)
    const today = new Date().toISOString().split('T')[0];
    const { data: vaccRaw } = await supabase
        .from('vaccinations')
        .select('vaccine_name, date, next_due_date')
        .eq('pet_id', pet.id)
        .order('date', { ascending: false })
        .limit(10);

    const vaccinations = (vaccRaw as any[] | null) || [];

    // Medicações ativas
    const { data: medsRaw } = await supabase
        .from('medications')
        .select('medication_name, dosage, frequency')
        .eq('pet_id', pet.id)
        .eq('active', true);

    const medications = (medsRaw as any[] | null) || [];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF 50%, #EFF9FF 100%)',
            fontFamily: "'Inter', -apple-system, sans-serif",
            color: '#2C3E50',
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #FF9300, #CC7600)',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                color: 'white',
            }}>
                <div style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '0.25rem' }}>🐾 Pet Passport</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Perfil Público</div>
            </div>

            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
                {/* Pet Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    marginBottom: '1.25rem',
                    textAlign: 'center',
                }}>
                    {pet.photo_url ? (
                        <img
                            src={pet.photo_url}
                            alt={pet.name}
                            style={{
                                width: '120px', height: '120px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '4px solid #FF9300',
                                marginBottom: '1rem',
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FFF4E6, #FFE0B2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '3.5rem', margin: '0 auto 1rem',
                            border: '4px solid #FF9300',
                        }}>
                            {SPECIES_EMOJI[pet.species] || '🐾'}
                        </div>
                    )}

                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>{pet.name}</h1>
                    <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '0.75rem' }}>
                        {SPECIES_LABEL[pet.species] || pet.species}
                        {pet.breed ? ` · ${pet.breed}` : ''}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        {pet.birth_date && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Idade</div>
                                <div style={{ fontWeight: 600, marginTop: '2px' }}>{petAge(pet.birth_date)}</div>
                            </div>
                        )}
                        {pet.sex && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sexo</div>
                                <div style={{ fontWeight: 600, marginTop: '2px' }}>{pet.sex === 'male' ? '♂ Macho' : pet.sex === 'female' ? '♀ Fêmea' : 'N/A'}</div>
                            </div>
                        )}
                        {pet.microchip && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Microchip</div>
                                <div style={{ fontWeight: 600, marginTop: '2px', fontSize: '0.85rem' }}>{pet.microchip}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Emergency Contact */}
                {pet.emergency_contact && (
                    <div style={{
                        background: 'linear-gradient(135deg, #FF9300, #CC7600)',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        color: 'white',
                        marginBottom: '1.25rem',
                    }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            📞 Contato de Emergência
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{pet.emergency_contact}</div>
                    </div>
                )}

                {/* Notes (medical needs) */}
                {pet.notes && (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        marginBottom: '1.25rem',
                        borderLeft: '4px solid #F8F246',
                    }}>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            ⚕️ Necessidades Médicas
                        </div>
                        <div style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{pet.notes}</div>
                    </div>
                )}

                {/* Active Medications */}
                {medications.length > 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        marginBottom: '1.25rem',
                    }}>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            💊 Medicações em Uso
                        </div>
                        {medications.map((m: any, i: number) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.6rem 0',
                                borderBottom: i < medications.length - 1 ? '1px solid #F1F5F9' : 'none',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{m.medication_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{m.dosage}{m.frequency ? ` · ${m.frequency}` : ''}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Vaccinations */}
                {vaccinations.length > 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        marginBottom: '1.25rem',
                    }}>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            💉 Carteira de Vacinação
                        </div>
                        {vaccinations.map((v: any, i: number) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.6rem 0',
                                borderBottom: i < vaccinations.length - 1 ? '1px solid #F1F5F9' : 'none',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{v.vaccine_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Aplicada em {formatDate(v.date)}</div>
                                </div>
                                {v.next_due_date && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        background: new Date(v.next_due_date) < new Date() ? '#FEF2F2' : '#ECFDF5',
                                        color: new Date(v.next_due_date) < new Date() ? '#DC2626' : '#059669',
                                        padding: '3px 8px',
                                        borderRadius: '999px',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        Refazer {formatDate(v.next_due_date)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem', marginTop: '2rem' }}>
                    <div>🐾 Gerado pelo Pet Passport</div>
                    <div style={{ marginTop: '4px' }}>Informações fornecidas pelo tutor</div>
                </div>
            </div>
        </div>
    );
}
