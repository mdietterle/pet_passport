/**
 * Plan display constants shared across components and pages.
 *
 * Note: plan feature flags live in planFeatures.ts
 *       plan limit logic lives in planLimits.ts
 *       this file holds only presentation-layer constants.
 *
 * PAYMENT_LINKS maps each plan name to its Stripe Payment Link URL.
 * These links are hosted by Stripe and include professional checkout pages
 * with the product name, price, description, and marketing features.
 * Generated via Stripe MCP on 2026-04-12.
 */

export const PLAN_COLORS: Record<string, string> = {
    free: 'var(--color-gray)',
    basic: 'var(--color-orange)',
    pro: 'var(--color-gold-dark)',
    premium: 'var(--color-primary)',
};

/**
 * Stripe Payment Link URLs per plan (test mode).
 * Each URL points to a hosted Stripe product page with:
 *  - Plan name, description, and marketing features
 *  - Monthly recurring price in BRL
 *  - Custom submit message and promo codes enabled
 *  - Redirect back to /dashboard/plans after payment
 *
 * Use `buildPaymentLinkUrl(planName, email, userId)` to append
 * prefilled_email and client_reference_id query params.
 */
export const PAYMENT_LINKS: Record<string, string> = {
    basic: 'https://buy.stripe.com/test_8x29AU9WJ67FbSp7Tdgbm01',
    pro: 'https://buy.stripe.com/test_7sYbJ27OB3Zxg8FehBgbm02',
    premium: 'https://buy.stripe.com/test_dRm00kgl7brZ1dLb5pgbm03',
};

/**
 * Builds a Stripe Payment Link URL with prefilled customer data.
 * Stripe supports `prefilled_email` and `client_reference_id` as query params.
 */
export function buildPaymentLinkUrl(
    planName: string,
    email?: string | null,
    userId?: string | null,
): string | null {
    const base = PAYMENT_LINKS[planName];
    if (!base) return null;

    const url = new URL(base);
    if (email) url.searchParams.set('prefilled_email', email);
    if (userId) url.searchParams.set('client_reference_id', userId);
    return url.toString();
}

export const PLAN_ICONS: Record<string, string> = {
    free: '🐾',
    basic: '⭐',
    pro: '🚀',
    premium: '👑',
};
