-- ============================================================
-- TABLESERVE — Complete Database Setup
-- Paste this entire file into Supabase SQL Editor and click RUN
-- ============================================================

-- ─── DROP EXISTING TABLES (safe re-run) ─────────────────────
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS upi_config CASCADE;

-- ─── DROP EXISTING TYPES ────────────────────────────────────
DROP TYPE IF EXISTS food_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS staff_role CASCADE;

-- ─── ENUMS ──────────────────────────────────────────────────
CREATE TYPE food_type AS ENUM ('VEG', 'NON_VEG', 'VEGAN');
CREATE TYPE payment_status AS ENUM ('PENDING_OFFLINE', 'UPI_PENDING', 'PAID_UPI', 'PAID_OFFLINE');
CREATE TYPE staff_role AS ENUM ('STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN');

-- ─── TABLES ─────────────────────────────────────────────────
CREATE TABLE tables (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  number        INTEGER UNIQUE NOT NULL,
  capacity      INTEGER NOT NULL,
  location_label TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name       TEXT UNIQUE NOT NULL,
  image_url  TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_items (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name         TEXT NOT NULL,
  category_id  TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL,
  image_url    TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  food_type    food_type DEFAULT 'VEG',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  table_id       TEXT NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
  payment_status payment_status DEFAULT 'PENDING_OFFLINE',
  is_delivered   BOOLEAN DEFAULT FALSE,
  total_amount   NUMERIC(10,2) NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity     INTEGER NOT NULL,
  unit_price   NUMERIC(10,2) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE staff (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  pin           TEXT,
  role          staff_role DEFAULT 'STAFF',
  phone         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE upi_config (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  upi_id        TEXT NOT NULL,
  merchant_name TEXT NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUTO-UPDATE updated_at TRIGGER ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_is_delivered ON orders(is_delivered);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);

-- ─── SEED: UPI CONFIG ────────────────────────────────────────
INSERT INTO upi_config (upi_id, merchant_name)
VALUES ('tableserve@upi', 'TableServe Cafe');

-- ─── SEED: STAFF ─────────────────────────────────────────────
-- Passwords below are bcrypt hashes:
--   admin@tableserve.com  → admin123
--   others                → staff123
INSERT INTO staff (name, email, password_hash, pin, role, phone) VALUES
  ('Admin User',   'admin@tableserve.com',   '$2a$10$gVb36KL2utUDcY/PnF27G.aBQ7elsJvdbmd/ORfFJkQELlU8kh/8m', '0000', 'ADMIN',   NULL),
  ('Rajat Dash',   'rajatdash2004@gmail.com', '$2a$10$9F.hNsLrdBw4YKNNYK1lJOC.fkunW8Je.pdi/.r/zA8ZI.Yd9LP02', '2004', 'ADMIN',   NULL),
  ('Staff One',    'staff1@tableserve.com',  '$2a$10$li6Q1fZjnx9nlfqoKhLqeuUhB5gtsR6E2.CKt3Bv8XPutJBan4Flm', '1111', 'STAFF',   '9876543210'),
  ('Manager Sam',  'manager@tableserve.com', '$2a$10$li6Q1fZjnx9nlfqoKhLqeuUhB5gtsR6E2.CKt3Bv8XPutJBan4Flm', '2222', 'MANAGER', '9876543211');

-- Passwords: admin@tableserve.com = admin123 | others = staff123
-- Change these after first login via Admin → Staff panel.

-- ─── SEED: TABLES ────────────────────────────────────────────
INSERT INTO tables (number, capacity, location_label) VALUES
  (1, 2,  'Window Side'),
  (2, 4,  'Window Side'),
  (3, 4,  'Center'),
  (4, 6,  'Center'),
  (5, 2,  'Outdoor'),
  (6, 8,  'Private Room');

-- ─── SEED: CATEGORIES ────────────────────────────────────────
INSERT INTO categories (id, name, sort_order) VALUES
  ('cat-burgers',  'Burgers',  1),
  ('cat-drinks',   'Drinks',   2),
  ('cat-sides',    'Sides',    3),
  ('cat-desserts', 'Desserts', 4);

-- ─── SEED: MENU ITEMS ────────────────────────────────────────
INSERT INTO menu_items (name, category_id, description, price, food_type) VALUES
  ('Classic Veggie Burger',  'cat-burgers',  'Crispy veggie patty, lettuce, tomato, mayo',         149.00, 'VEG'),
  ('Spicy Chicken Burger',   'cat-burgers',  'Grilled spicy chicken, jalapeños, sriracha sauce',   189.00, 'NON_VEG'),
  ('Double Smash Burger',    'cat-burgers',  'Double beef patty, cheese, caramelized onions',      249.00, 'NON_VEG'),
  ('Vegan Mushroom Burger',  'cat-burgers',  'Portobello mushroom, avocado, vegan sauce',          179.00, 'VEGAN'),
  ('Cold Coffee',            'cat-drinks',   'Chilled coffee with milk and ice cream',              99.00, 'VEG'),
  ('Fresh Lime Soda',        'cat-drinks',   'Fresh lime with sparkling water and mint',            69.00, 'VEGAN'),
  ('Masala Fries',           'cat-sides',    'Crispy fries with Indian spice blend',                89.00, 'VEGAN'),
  ('Cheese Loaded Fries',    'cat-sides',    'Golden fries smothered in melted cheese sauce',      119.00, 'VEG'),
  ('Chocolate Lava Cake',    'cat-desserts', 'Warm cake with molten chocolate center',             129.00, 'VEG'),
  ('Mango Sorbet',           'cat-desserts', 'Fresh mango sorbet, dairy free',                      99.00, 'VEGAN');

-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────────
-- Disable RLS for all tables so the service role key has full access.
-- For production you can add policies per table as needed.
ALTER TABLE tables     DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders     DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff      DISABLE ROW LEVEL SECURITY;
ALTER TABLE upi_config DISABLE ROW LEVEL SECURITY;

-- ─── DONE ────────────────────────────────────────────────────
-- Tables created: tables, categories, menu_items, orders, order_items, staff, upi_config
-- Seed data inserted: 3 staff, 6 tables, 4 categories, 10 menu items, 1 upi config
-- Go to Admin > Staff panel and update passwords after first login.
