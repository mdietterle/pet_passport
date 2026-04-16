/**
 * Lightweight in-memory sliding-window rate limiter.
 *
 * Limitation: state lives per Node.js process, so on serverless platforms
 * (Vercel, Lambda) each cold-started instance has its own counters. For a
 * small SaaS this still meaningfully raises the cost of abuse; upgrade to
 * Upstash Redis / Vercel KV when traffic grows.
 */

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

export type RateLimitResult = {
    ok: boolean;
    remaining: number;
    resetAt: number;
};

export function rateLimit(
    key: string,
    limit: number,
    windowMs: number,
): RateLimitResult {
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || entry.resetAt <= now) {
        const resetAt = now + windowMs;
        buckets.set(key, { count: 1, resetAt });
        return { ok: true, remaining: limit - 1, resetAt };
    }

    if (entry.count >= limit) {
        return { ok: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count += 1;
    return { ok: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function clientKey(req: Request, userId?: string | null): string {
    if (userId) return `u:${userId}`;
    const fwd = req.headers.get('x-forwarded-for') || '';
    const ip = fwd.split(',')[0]?.trim() || 'unknown';
    return `ip:${ip}`;
}
