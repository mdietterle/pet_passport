/**
 * User-related utility functions shared across components.
 */

/**
 * Derives display initials from a full name or email fallback.
 * - Two+ words → first letter of first + last word
 * - One word   → first two letters
 * - No name    → first two letters of email
 */
export function getInitials(
    name: string | null | undefined,
    email: string | null | undefined
): string {
    if (name) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'US';
}
