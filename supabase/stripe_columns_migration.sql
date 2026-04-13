-- ============================================================
-- Migration: Add Stripe payment columns to profiles
-- Description:
--   Adds payment_method and plan_expires_at columns used by the
--   Stripe webhook to track subscription payment info and expiry.
--   The dashboard layout reads these for the renewal banner.
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
