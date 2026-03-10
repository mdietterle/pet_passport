/**
 * Supabase Admin Client (service-role)
 *
 * Bypasses Row Level Security — use ONLY in trusted server-side contexts
 * (API routes, webhooks). Never expose to the browser.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error(
            'Missing required env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
        );
    }

    return createClient<Database>(url, key);
}

// Lazy singleton — instantiated on first use, not at module load time
let _adminClient: ReturnType<typeof createAdminClient> | null = null;

export function getAdminClient() {
    if (!_adminClient) {
        _adminClient = createAdminClient();
    }
    return _adminClient;
}
