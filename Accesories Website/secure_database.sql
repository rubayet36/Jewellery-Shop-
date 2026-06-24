-- ── SECURE DATABASE: RLS & TRIGGER MIGRATION ────────────────────────────
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Run

-- 1. Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Products policies: public read, authenticated write
DROP POLICY IF EXISTS "Allow public read on products" ON products;
CREATE POLICY "Allow public read on products" ON products 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated write on products" ON products;
CREATE POLICY "Allow authenticated write on products" ON products 
  FOR ALL TO authenticated USING (true);

-- 3. Categories policies: public read, authenticated write
DROP POLICY IF EXISTS "Allow public read on categories" ON categories;
CREATE POLICY "Allow public read on categories" ON categories 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated write on categories" ON categories;
CREATE POLICY "Allow authenticated write on categories" ON categories 
  FOR ALL TO authenticated USING (true);

-- 4. Orders policies: public insert, authenticated read/write
DROP POLICY IF EXISTS "Allow public inserts on orders" ON orders;
CREATE POLICY "Allow public inserts on orders" ON orders 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read/write on orders" ON orders;
CREATE POLICY "Allow authenticated read/write on orders" ON orders 
  FOR ALL TO authenticated USING (true);

-- 5. Automated Stock Decrement Trigger (Thread-Safe & Secure)
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  item json;
  item_id int;
  item_qty int;
BEGIN
  -- Loop through the JSONB array of items in the new order
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items::jsonb) LOOP
    item_id := (item->>'id')::int;
    item_qty := (item->>'qty')::int;
    
    -- Subtract quantity from products table, clamping at 0
    UPDATE products 
    SET stock = GREATEST(0, stock - item_qty) 
    WHERE id = item_id;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_decrement_product_stock ON orders;
CREATE TRIGGER trg_decrement_product_stock
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION decrement_product_stock();
