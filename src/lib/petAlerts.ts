/**
 * Rule-based smart health alert engine.
 * Generates personalized alerts for each pet based on species, breed, and age.
 */

export type AlertSeverity = 'info' | 'warning' | 'urgent';

export interface PetAlert {
    petName: string;
    petId: string;
    message: string;
    severity: AlertSeverity;
    icon: string;
    tip: string;
}

const SENIOR_DOG_BREEDS_PRONE_TO_JOINT = [
    'golden retriever', 'labrador', 'labrador retriever', 'rottweiler',
    'german shepherd', 'pastor alemão', 'golden', 'bernese', 'são bernardo',
    'great dane', 'doberman',
];

const BREEDS_PRONE_TO_HEART = [
    'cavalier king charles', 'cavalier', 'boxer', 'dachshund', 'teckel', 'salsicha',
    'poodle', 'chihuahua', 'yorkshire', 'yorkshire terrier',
];

const BREEDS_PRONE_TO_DENTAL = [
    'bulldog', 'buldogue', 'pug', 'shih tzu', 'maltês', 'maltese',
    'lhasa apso', 'chihuahua', 'yorkshire', 'pomeranian', 'lulu da pomerânia',
];

function ageInYears(birthDate: string | null | undefined): number | null {
    if (!birthDate) return null;
    const [y, m, d] = birthDate.split('-').map(Number);
    const birth = new Date(y, m - 1, d);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear())
        - (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
}

function daysSince(dateStr: string | null | undefined): number | null {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return Math.floor((Date.now() - date.getTime()) / 86400000);
}

export function generatePetAlerts(pet: any, vaccinations: any[], weights: any[]): PetAlert[] {
    const alerts: PetAlert[] = [];
    const age = ageInYears(pet.birth_date);
    const breed = (pet.breed || '').toLowerCase();
    const species = (pet.species || '').toLowerCase();

    // ─── Latest vaccination date ─────────────────────────────────────────────
    const latestVaccDate = vaccinations.length > 0
        ? vaccinations.reduce((latest, v) => v.date > latest ? v.date : latest, vaccinations[0].date)
        : null;
    const daysSinceVacc = daysSince(latestVaccDate);

    if (daysSinceVacc === null || daysSinceVacc > 365) {
        alerts.push({
            petName: pet.name,
            petId: pet.id,
            message: `${pet.name} não tem vacinas registradas no último ano`,
            severity: 'warning',
            icon: '💉',
            tip: 'Verifique se a carteira de vacinação está em dia. Vacinas vencidas podem deixar seu pet sem proteção.',
        });
    }

    // ─── Latest weight date ──────────────────────────────────────────────────
    const latestWeightDate = weights.length > 0
        ? weights.reduce((latest, w) => w.date > latest ? w.date : latest, weights[0].date)
        : null;
    const daysSinceWeight = daysSince(latestWeightDate);

    if (daysSinceWeight === null || daysSinceWeight > 90) {
        alerts.push({
            petName: pet.name,
            petId: pet.id,
            message: `Peso de ${pet.name} não foi registrado há mais de 3 meses`,
            severity: 'info',
            icon: '⚖️',
            tip: 'Monitorar o peso regularmente ajuda a identificar problemas de saúde precocemente.',
        });
    }

    if (age === null) return alerts;

    // ─── Dogs ────────────────────────────────────────────────────────────────
    if (species === 'dog') {
        const isJointBreed = SENIOR_DOG_BREEDS_PRONE_TO_JOINT.some(b => breed.includes(b));
        const isHeartBreed = BREEDS_PRONE_TO_HEART.some(b => breed.includes(b));
        const isDentalBreed = BREEDS_PRONE_TO_DENTAL.some(b => breed.includes(b));

        if (age >= 7) {
            alerts.push({
                petName: pet.name,
                petId: pet.id,
                message: `${pet.name} é um cão sênior (${age} anos)`,
                severity: 'warning',
                icon: '🐕',
                tip: 'Cães acima de 7 anos devem fazer check-up completo com hemograma e urinálise semestralmente.',
            });
        }

        if (isJointBreed && age >= 5) {
            alerts.push({
                petName: pet.name,
                petId: pet.id,
                message: `${pet.name} tem predisposição genética a problemas nas articulações`,
                severity: 'warning',
                icon: '🦴',
                tip: `${pet.breed} é uma raça propensa à displasia. Exame radiológico das articulações é recomendado anualmente a partir dos 5 anos.`,
            });
        }

        if (isHeartBreed && age >= 5) {
            alerts.push({
                petName: pet.name,
                petId: pet.id,
                message: `${pet.name} tem predisposição a doenças cardíacas`,
                severity: 'warning',
                icon: '❤️',
                tip: `${pet.breed} é mais suscetível à doença valvar mitral. Ausculta cardíaca anual é recomendada.`,
            });
        }

        if (isDentalBreed) {
            alerts.push({
                petName: pet.name,
                petId: pet.id,
                message: `${pet.name} tem predisposição a problemas dentários`,
                severity: 'info',
                icon: '🦷',
                tip: `Cães de focinho curto ou pequeno porte acumulam tártaro mais rápido. Limpeza dentária anual é recomendada.`,
            });
        }

        if (age >= 8) {
            alerts.push({
                petName: pet.name,
                petId: pet.id,
                message: `${pet.name} está na fase geriátrica — check-up completo recomendado`,
                severity: 'urgent',
                icon: '🏥',
                tip: 'Cães geriátricos se beneficiam de exames de função renal e hepática a cada 6 meses.',
            });
        }
    }

    // ─── Cats ────────────────────────────────────────────────────────────────
    if (species === 'cat') {
        if (age >= 7 && age < 11) {
            alerts.push({
                petName: pet.name,
                petId: pet.id,
                message: `${pet.name} está na meia-idade felina (${age} anos)`,
                severity: 'info',
                icon: '🐱',
                tip: 'Gatos de meia-idade devem fazer check-up anual com exame de pressão arterial e fator renal.',
            });
        }

        if (age >= 11) {
            alerts.push({
                petName: pet.name,
                petId: pet.id,
                message: `${pet.name} é um gato sênior — atenção à tireoide e função renal`,
                severity: 'warning',
                icon: '🏥',
                tip: 'Gatos acima de 11 anos têm alta incidência de hipertireoidismo e doença renal crônica. Exames semestrais são recomendados.',
            });
        }
    }

    // ─── Rabbits ─────────────────────────────────────────────────────────────
    if (species === 'rabbit' && age >= 3) {
        alerts.push({
            petName: pet.name,
            petId: pet.id,
            message: `${pet.name} precisa de check-up dental anual`,
            severity: 'info',
            icon: '🐰',
            tip: 'Coelhos adultos têm os dentes em crescimento contínuo. Problemas dentários são comuns e podem causar anorexia.',
        });
    }

    // ─── Birds ───────────────────────────────────────────────────────────────
    if (species === 'bird' && age >= 5) {
        alerts.push({
            petName: pet.name,
            petId: pet.id,
            message: `${pet.name} precisa de avaliação clínica anual`,
            severity: 'info',
            icon: '🐦',
            tip: 'Aves frequentemente escondem sinais de doença. Uma avaliação clínica anual por veterinário especialista é recomendada.',
        });
    }

    return alerts;
}
