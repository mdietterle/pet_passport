export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            plans: {
                Row: Plan;
                Insert: Omit<Plan, 'id' | 'created_at'>;
                Update: Partial<Omit<Plan, 'id' | 'created_at'>>;
            };
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
            };
            pets: {
                Row: Pet;
                Insert: Omit<Pet, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Pet, 'id' | 'created_at'>>;
            };
            vaccinations: {
                Row: Vaccination;
                Insert: Omit<Vaccination, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Vaccination, 'id' | 'created_at'>>;
            };
            vet_consultations: {
                Row: VetConsultation;
                Insert: Omit<VetConsultation, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<VetConsultation, 'id' | 'created_at'>>;
            };
            occurrences: {
                Row: Occurrence;
                Insert: Omit<Occurrence, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Occurrence, 'id' | 'created_at'>>;
            };
            pet_weights: {
                Row: PetWeight;
                Insert: Omit<PetWeight, 'id' | 'created_at'>;
                Update: Partial<Omit<PetWeight, 'id' | 'created_at'>>;
            };
            parasite_controls: {
                Row: ParasiteControl;
                Insert: Omit<ParasiteControl, 'id' | 'created_at'>;
                Update: Partial<Omit<ParasiteControl, 'id' | 'created_at'>>;
            };
            medications: {
                Row: Medication;
                Insert: Omit<Medication, 'id' | 'created_at'>;
                Update: Partial<Omit<Medication, 'id' | 'created_at'>>;
            };
        };
        Views: {
            pet_record_counts: {
                Row: PetRecordCount;
            };
        };
        Functions: {};
        Enums: {};
    };
}

export interface Plan {
    id: string;
    name: 'free' | 'basic' | 'pro' | 'premium';
    display_name: string;
    price_brl: number;
    stripe_price_id: string | null;
    max_pets: number | null;
    max_vaccinations_per_pet: number | null;
    max_consultations_per_pet: number | null;
    max_occurrences_per_pet: number | null;
    features: string[];
    sort_order: number;
    created_at: string;
}

export interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    plan_id: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_status: string | null;
    cellphone: string | null;
    tax_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProfileWithPlan extends Profile {
    plans: Plan | null;
}

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'reptile' | 'other';
export type PetSex = 'male' | 'female' | 'unknown';

export interface Pet {
    id: string;
    owner_id: string;
    name: string;
    species: PetSpecies;
    breed: string | null;
    birth_date: string | null;
    sex: PetSex | null;
    weight_kg: number | null;
    photo_url: string | null;
    microchip: string | null;
    color: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Vaccination {
    id: string;
    pet_id: string;
    vaccine_name: string;
    date: string;
    next_due_date: string | null;
    vet_name: string | null;
    clinic: string | null;
    batch: string | null;
    manufacturer: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface VetConsultation {
    id: string;
    pet_id: string;
    date: string;
    vet_name: string | null;
    clinic: string | null;
    reason: string;
    diagnosis: string | null;
    prescription: string | null;
    cost_brl: number | null;
    follow_up_date: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export type OccurrenceType =
    | 'food_purchase'
    | 'grooming'
    | 'bath'
    | 'vomit'
    | 'diarrhea'
    | 'injury'
    | 'medication'
    | 'other';

export interface Occurrence {
    id: string;
    pet_id: string;
    type: OccurrenceType;
    date: string;
    description: string | null;
    cost_brl: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface PetRecordCount {
    pet_id: string;
    owner_id: string;
    vaccination_count: number;
    consultation_count: number;
    occurrence_count: number;
}

export interface PetWeight {
    id: string;
    pet_id: string;
    date: string;
    weight_kg: number;
    notes: string | null;
    created_at: string;
}

export type ParasiteControlType = 'flea_tick' | 'deworming';

export interface ParasiteControl {
    id: string;
    pet_id: string;
    type: ParasiteControlType;
    date: string;
    next_due_date: string | null;
    medication_name: string;
    weight_at_time_kg: number | null;
    notes: string | null;
    created_at: string;
}

export interface Medication {
    id: string;
    pet_id: string;
    medication_name: string;
    dosage: string;
    frequency: string | null;
    start_date: string;
    end_date: string | null;
    active: boolean;
    notes: string | null;
    created_at: string;
}

export interface ExamAttachment {
    id: string;
    pet_id: string;
    consultation_id: string | null;
    name: string;
    file_url: string;
    file_type: string;
    uploaded_at: string;
}
