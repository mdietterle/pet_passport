import type { Plan } from './supabase/types';

export interface PlanLimits {
    canAddPet: boolean;
    canAddVaccination: boolean;
    canAddConsultation: boolean;
    canAddOccurrence: boolean;
    petsRemaining: number | null;
    vaccinationsRemaining: number | null;
    consultationsRemaining: number | null;
    occurrencesRemaining: number | null;
}

export function checkPlanLimits(
    plan: Plan,
    currentPetCount: number,
    currentVaccinationCount: number,
    currentConsultationCount: number,
    currentOccurrenceCount: number
): PlanLimits {
    const canAddPet = plan.max_pets === null || currentPetCount < plan.max_pets;
    const canAddVaccination =
        plan.max_vaccinations_per_pet === null ||
        currentVaccinationCount < plan.max_vaccinations_per_pet;
    const canAddConsultation =
        plan.max_consultations_per_pet === null ||
        currentConsultationCount < plan.max_consultations_per_pet;
    const canAddOccurrence =
        plan.max_occurrences_per_pet === null ||
        currentOccurrenceCount < plan.max_occurrences_per_pet;

    return {
        canAddPet,
        canAddVaccination,
        canAddConsultation,
        canAddOccurrence,
        petsRemaining:
            plan.max_pets === null ? null : Math.max(0, plan.max_pets - currentPetCount),
        vaccinationsRemaining:
            plan.max_vaccinations_per_pet === null
                ? null
                : Math.max(0, plan.max_vaccinations_per_pet - currentVaccinationCount),
        consultationsRemaining:
            plan.max_consultations_per_pet === null
                ? null
                : Math.max(0, plan.max_consultations_per_pet - currentConsultationCount),
        occurrencesRemaining:
            plan.max_occurrences_per_pet === null
                ? null
                : Math.max(0, plan.max_occurrences_per_pet - currentOccurrenceCount),
    };
}

export function getPlanBadgeColor(planName: string): string {
    switch (planName) {
        case 'free':
            return 'var(--color-gray)';
        case 'basic':
            return 'var(--color-teal)';
        case 'pro':
            return 'var(--color-amber)';
        case 'premium':
            return 'var(--color-purple)';
        default:
            return 'var(--color-gray)';
    }
}

export const OCCURRENCE_TYPE_LABELS: Record<string, string> = {
    food_purchase: '🛒 Compra de Ração',
    grooming: '✂️ Tosa',
    bath: '🛁 Banho',
    vomit: '🤢 Vômito',
    diarrhea: '💊 Diarreia',
    injury: '🩹 Machucado',
    medication: '💉 Medicação',
    other: '📝 Outro',
};

export const SPECIES_LABELS: Record<string, string> = {
    dog: '🐶 Cachorro',
    cat: '🐱 Gato',
    bird: '🐦 Pássaro',
    rabbit: '🐰 Coelho',
    fish: '🐟 Peixe',
    reptile: '🦎 Réptil',
    other: '🐾 Outro',
};

export const SEX_LABELS: Record<string, string> = {
    male: 'Macho',
    female: 'Fêmea',
    unknown: 'Não informado',
};
