-- Remove Stripe related columns from plans table
ALTER TABLE plans DROP COLUMN IF EXISTS stripe_price_id;

-- Remove Stripe related columns from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS stripe_subscription_id;
