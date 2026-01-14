-- 🖨️ Kids 3D Print Store - Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  in_stock INTEGER DEFAULT 10,
  print_time TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  session_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  address TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  tracking_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  product_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL
);

-- Order status history table
CREATE TABLE IF NOT EXISTS status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_status_history_order ON status_history(order_id);

-- Seed sample products (only if products table is empty)
INSERT INTO products (name, description, price, image_url, category, in_stock, print_time, created_by)
SELECT * FROM (VALUES
  ('Cute Dragon', 'A friendly little dragon that glows in the dark! Perfect desk buddy.', 8.50, '/images/dragon.png', 'Fantasy', 15, '3 hours', 'Emma (12)'),
  ('Rocket Ship', 'Blast off with this awesome rocket! Has movable fins.', 12.00, '/images/rocket.png', 'Space', 10, '4 hours', 'Jake (11)'),
  ('Phone Stand', 'Cool geometric phone stand. Holds any phone!', 5.00, '/images/phonestand.png', 'Useful', 25, '2 hours', 'Mia (13)'),
  ('Dino T-Rex', 'Roar! This T-Rex has articulated joints and can pose.', 15.00, '/images/trex.png', 'Dinosaurs', 8, '5 hours', 'Lucas (12)'),
  ('Minecraft Creeper', 'Ssssss... Don''t worry, this one won''t explode!', 7.00, '/images/creeper.png', 'Gaming', 20, '2.5 hours', 'Sophie (11)'),
  ('Fidget Spinner', 'Super smooth spinning action. Satisfying clicks!', 4.50, '/images/spinner.png', 'Fidgets', 30, '1.5 hours', 'Noah (13)'),
  ('Unicorn', 'Magical rainbow unicorn with sparkly finish.', 10.00, '/images/unicorn.png', 'Fantasy', 12, '3.5 hours', 'Emma (12)'),
  ('Articulated Snake', 'Wiggly snake that actually moves! So satisfying.', 6.00, '/images/snake.png', 'Animals', 18, '2 hours', 'Jake (11)'),
  ('Pencil Holder', 'Keep your desk organized with this cool holder!', 5.50, '/images/pencilholder.png', 'Useful', 22, '2.5 hours', 'Mia (13)'),
  ('Baby Yoda', 'The cutest little guy from the galaxy far far away.', 11.00, '/images/babyyoda.png', 'Movies', 14, '3 hours', 'Lucas (12)'),
  ('Flexi Octopus', 'Eight wiggly tentacles! Stress relief champion.', 8.00, '/images/octopus.png', 'Animals', 16, '3 hours', 'Sophie (11)'),
  ('Keychain Set', 'Pack of 3 custom keychains - heart, star, and moon!', 6.50, '/images/keychains.png', 'Accessories', 35, '1 hour', 'Noah (13)')
) AS v(name, description, price, image_url, category, in_stock, print_time, created_by)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Enable Row Level Security (optional but recommended for production)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for this demo)
-- CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
-- CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
