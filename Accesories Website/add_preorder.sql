-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Adds preorder support columns to the products table

ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_preorder boolean DEFAULT false;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS preorder_days integer DEFAULT NULL;

-- Once run, the admin can set products as preorders with shipping estimates!
