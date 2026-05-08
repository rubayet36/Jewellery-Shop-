-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Adds the buying_price column to the products table

ALTER TABLE products
ADD COLUMN IF NOT EXISTS buying_price numeric DEFAULT NULL;

-- That's it! The column will now store the buying/cost price per product.
