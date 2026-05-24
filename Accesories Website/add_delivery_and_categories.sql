-- ── DB MIGRATION: CATEGORY IMAGES & SHIPPING CHARGES ───────────────────
-- Copy this entire script and run it in your Supabase SQL Editor:
-- Supabase Dashboard → SQL Editor → New Query → Run

-- 1. Add image_url to the categories table for circular previews
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;

-- 2. Add delivery tracking columns to the orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge integer DEFAULT 80;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_outside_dhaka boolean DEFAULT false;

-- 3. Seed default category images for dynamic homepage circles
-- (This updates the existing categories or inserts them if they are missing)
UPDATE categories SET image_url = '/ring.jpg' WHERE name = 'Rings';
UPDATE categories SET image_url = '/neckless.jpg' WHERE name = 'Necklaces';
UPDATE categories SET image_url = '/bracelts.jpg' WHERE name = 'Bracelets';
UPDATE categories SET image_url = '/earerings.jpg' WHERE name = 'Earrings';

-- Insert default categories if they are not already in your table
INSERT INTO categories (name, image_url)
SELECT 'Rings', '/ring.jpg'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Rings');

INSERT INTO categories (name, image_url)
SELECT 'Necklaces', '/neckless.jpg'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Necklaces');

INSERT INTO categories (name, image_url)
SELECT 'Bracelets', '/bracelts.jpg'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Bracelets');

INSERT INTO categories (name, image_url)
SELECT 'Earrings', '/earerings.jpg'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Earrings');
