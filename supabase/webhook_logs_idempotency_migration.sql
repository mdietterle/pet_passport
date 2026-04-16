-- Migration: webhook_logs idempotency support
--
-- The stripe webhook handler stops replays by checking for an existing row
-- with the same Stripe event_id. This migration ensures the columns exist
-- and that event_id is unique. Also drops the legacy `payload` column so
-- we stop persisting raw Stripe payloads (emails, payment metadata, etc.).

-- Add new columns (no-op if they already exist)
alter table if exists webhook_logs
    add column if not exists event_id text,
    add column if not exists event_type text,
    add column if not exists created_at timestamptz default now();

-- Unique index so concurrent webhook retries can't double-process
create unique index if not exists webhook_logs_event_id_key
    on webhook_logs (event_id)
    where event_id is not null;

-- Drop the old raw-payload column if it still exists
alter table if exists webhook_logs
    drop column if exists payload;
