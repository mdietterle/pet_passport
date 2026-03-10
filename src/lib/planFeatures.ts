import type { Plan } from './supabase/types';

// ─── Plan Feature Flags ──────────────────────────────────────────────────────

/** PDF Passport export — Pro and Premium only */
export function canExportPDF(plan: Plan | null | undefined): boolean {
    return plan?.name === 'pro' || plan?.name === 'premium';
}

/** QR Code public profile — Pro and Premium only */
export function canUseQRCode(plan: Plan | null | undefined): boolean {
    return plan?.name === 'pro' || plan?.name === 'premium';
}

/** Exam gallery file upload — Basic, Pro, Premium */
export function canUploadExams(plan: Plan | null | undefined): boolean {
    return plan?.name !== 'free' && plan != null;
}

/** Smart health alerts — Basic, Pro, Premium */
export function canSeeAlerts(plan: Plan | null | undefined): boolean {
    return plan?.name !== 'free' && plan != null;
}
