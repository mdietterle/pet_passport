/**
 * Plan display constants shared across components and pages.
 *
 * Note: plan feature flags live in planFeatures.ts
 *       plan limit logic lives in planLimits.ts
 *       this file holds only presentation-layer constants.
 */

export const PLAN_COLORS: Record<string, string> = {
    free: 'var(--color-gray)',
    basic: 'var(--color-teal)',
    pro: 'var(--color-amber-dark)',
    premium: 'var(--color-purple)',
};

export const PLAN_ICONS: Record<string, string> = {
    free: '🐾',
    basic: '⭐',
    pro: '🚀',
    premium: '👑',
};
