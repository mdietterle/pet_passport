import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Only accept same-origin paths that start with a single '/' followed by a
// non-slash, non-backslash character — blocks '//evil.com' and '/\evil.com'
// protocol-less redirects.
const SAFE_NEXT_PATH = /^\/[^/\\]/;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const rawNext = searchParams.get('next');
    const next = rawNext && SAFE_NEXT_PATH.test(rawNext) ? rawNext : '/dashboard';

    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = next;
    redirectTo.search = '';

    if (token_hash && type) {
        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({ type, token_hash });

        if (!error) {
            return NextResponse.redirect(redirectTo);
        }
    }

    // On error (e.g. token invalid or expired), redirect to login with a
    // stable error code. The login page maps the code to a hardcoded message
    // so attackers can't inject phishing text via the URL.
    redirectTo.pathname = '/login';
    redirectTo.search = '?error=confirm_invalid';
    return NextResponse.redirect(redirectTo);
}
