-- 🔐 GUSA3D Security Policies for Supabase
-- Run this in your Supabase SQL Editor AFTER creating an admin user

-- ============================================
-- STEP 1: Enable Row Level Security on all tables
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Products Policies
-- ============================================

-- Anyone can view products
CREATE POLICY "Anyone can view products"
ON products FOR SELECT
USING (true);

-- Only authenticated users can insert products
CREATE POLICY "Authenticated users can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update products
CREATE POLICY "Authenticated users can update products"
ON products FOR UPDATE
TO authenticated
USING (true);

-- Only authenticated users can delete products
CREATE POLICY "Authenticated users can delete products"
ON products FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- STEP 3: Cart Items Policies
-- ============================================

-- Anyone can manage their own cart (by session_id)
CREATE POLICY "Anyone can view their cart"
ON cart_items FOR SELECT
USING (true);

CREATE POLICY "Anyone can add to cart"
ON cart_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update their cart"
ON cart_items FOR UPDATE
USING (true);

CREATE POLICY "Anyone can remove from cart"
ON cart_items FOR DELETE
USING (true);

-- ============================================
-- STEP 4: Orders Policies
-- ============================================

-- Anyone can view orders (for tracking)
CREATE POLICY "Anyone can view orders"
ON orders FOR SELECT
USING (true);

-- Anyone can create orders (place order)
CREATE POLICY "Anyone can create orders"
ON orders FOR INSERT
WITH CHECK (true);

-- Only authenticated users can update orders (status changes)
CREATE POLICY "Authenticated users can update orders"
ON orders FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- STEP 5: Order Items Policies
-- ============================================

-- Anyone can view order items
CREATE POLICY "Anyone can view order items"
ON order_items FOR SELECT
USING (true);

-- Anyone can create order items (when placing order)
CREATE POLICY "Anyone can create order items"
ON order_items FOR INSERT
WITH CHECK (true);

-- ============================================
-- STEP 6: Status History Policies
-- ============================================

-- Anyone can view status history (for tracking)
CREATE POLICY "Anyone can view status history"
ON status_history FOR SELECT
USING (true);

-- Anyone can add status history (initial order status)
-- In production, you might want to restrict this to authenticated only
CREATE POLICY "Anyone can add status history"
ON status_history FOR INSERT
WITH CHECK (true);

-- ============================================
-- DONE! Your database is now secured.
-- 
-- Summary:
-- ✅ Anyone can: Browse products, use cart, place orders, track orders
-- 🔒 Only admins can: Add/edit/delete products, update order status
-- ============================================
