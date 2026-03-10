/**
 * Parse a date-only string (YYYY-MM-DD) as local time.
 * Using new Date("YYYY-MM-DD") interprets it as UTC midnight,
 * which in Brazil (UTC-3) shows the previous day. This function
 * constructs the date in local timezone to avoid that.
 */
export function parseLocalDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Format a date-only string for display in pt-BR (dd/MM/yyyy).
 * Returns '—' if null.
 */
export function formatDate(dateStr: string | null | undefined): string {
    const d = parseLocalDate(dateStr);
    if (!d) return '—';
    return d.toLocaleDateString('pt-BR');
}

/**
 * How many years/months since a birth date string.
 */
export function petAge(birthDate: string | null | undefined): string {
    const birth = parseLocalDate(birthDate);
    if (!birth) return 'Idade desconhecida';
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear()
        - (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    if (years >= 1) return `${years} ano${years > 1 ? 's' : ''}`;
    const months = (now.getFullYear() - birth.getFullYear()) * 12
        + now.getMonth() - birth.getMonth()
        - (now.getDate() < birth.getDate() ? 1 : 0);
    return `${months} mês${months !== 1 ? 'es' : ''}`;
}

/**
 * Formats a number as BRL currency (R$ 0,00).
 */
export function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}
