-- ============================================================
-- Migration: Stripe columns + profiles INSERT policy
-- Description:
--   1. Adds payment_method and plan_expires_at columns used by
--      the Stripe webhook and the renewal banner.
--   2. Adds INSERT RLS policy on profiles so that the fallback
--      profile creation works when the auth trigger doesn't fire.
--      Without this policy the INSERT is silently blocked by RLS,
--      leaving the user without a profile row — which then causes
--      "pets_owner_id_fkey" foreign key violations on pet creation.
-- ============================================================

-- Stripe payment columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- Allow users to create their own profile (fallback for when trigger fails)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
