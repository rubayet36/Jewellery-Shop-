-- ── DB MIGRATION: MULTIPLE IMAGES & TRANSACTION ID ───────────────────────
-- Copy this entire script and run it in your Supabase SQL Editor:
-- Supabase Dashboard → SQL Editor → New Query → Run

-- 1. Add additional_images to the products table to support multiple gallery images
ALTER TABLE products ADD COLUMN IF NOT EXISTS additional_images text DEFAULT '';

-- 2. Add transaction_id to the orders table to track advance bKash/Nagad payments
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_id text DEFAULT '';
