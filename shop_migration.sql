-- ============================================
-- Shop & Supplements Database Schema
-- ============================================

-- 1. Products Table (gym can manage their shop inventory)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('supplements', 'accessories', 'merchandise', 'nutrition')),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    rating DECIMAL(2, 1) DEFAULT 0,
    image_url TEXT,
    tags TEXT[],
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Member Addresses Table
CREATE TABLE IF NOT EXISTS member_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Member Cart Items Table
CREATE TABLE IF NOT EXISTS member_cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(member_id, product_id)
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    address_id UUID REFERENCES member_addresses(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    delivery_notes TEXT,
    payment_method TEXT DEFAULT 'cod',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Enable Row Level Security
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Products: Public read (anyone can view products)
CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    USING (true);

-- Member Addresses: Members can only manage their own addresses
CREATE POLICY "Members can view own addresses"
    ON member_addresses FOR SELECT
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

CREATE POLICY "Members can insert own addresses"
    ON member_addresses FOR INSERT
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

CREATE POLICY "Members can update own addresses"
    ON member_addresses FOR UPDATE
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

CREATE POLICY "Members can delete own addresses"
    ON member_addresses FOR DELETE
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- Cart Items: Members can only manage their own cart
CREATE POLICY "Members can view own cart"
    ON member_cart_items FOR SELECT
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

CREATE POLICY "Members can add to own cart"
    ON member_cart_items FOR INSERT
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

CREATE POLICY "Members can update own cart"
    ON member_cart_items FOR UPDATE
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

CREATE POLICY "Members can remove from own cart"
    ON member_cart_items FOR DELETE
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- Orders: Members can only view/create their own orders
CREATE POLICY "Members can view own orders"
    ON orders FOR SELECT
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

CREATE POLICY "Members can create own orders"
    ON orders FOR INSERT
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- Order Items: Members can view items from their own orders
CREATE POLICY "Members can view own order items"
    ON order_items FOR SELECT
    USING (order_id IN (
        SELECT id FROM orders WHERE member_id IN (
            SELECT id FROM members WHERE auth_id = auth.uid()
        )
    ));

CREATE POLICY "Members can insert order items for own orders"
    ON order_items FOR INSERT
    WITH CHECK (order_id IN (
        SELECT id FROM orders WHERE member_id IN (
            SELECT id FROM members WHERE auth_id = auth.uid()
        )
    ));

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_member_addresses_member_id ON member_addresses(member_id);
CREATE INDEX IF NOT EXISTS idx_member_cart_items_member_id ON member_cart_items(member_id);
CREATE INDEX IF NOT EXISTS idx_orders_member_id ON orders(member_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ============================================
-- Sample Products Data
-- ============================================

INSERT INTO products (name, description, category, price, original_price, rating, image_url, tags, in_stock, stock_quantity) VALUES
-- Supplements
('Whey Protein Isolate', 'Premium whey protein isolate with 25g protein per serving. Fast absorbing for post-workout recovery.', 'supplements', 2499, 2999, 4.8, 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400', ARRAY['protein', 'muscle', 'recovery'], true, 50),
('Creatine Monohydrate', 'Pure creatine monohydrate for strength and power. 5g per serving, unflavored.', 'supplements', 899, 1199, 4.7, 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400', ARRAY['strength', 'power', 'muscle'], true, 100),
('Pre-Workout Ignite', 'High-energy pre-workout formula with caffeine, beta-alanine, and citrulline.', 'supplements', 1499, 1799, 4.5, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', ARRAY['energy', 'focus', 'pump'], true, 30),
('BCAA Recovery', 'Branch chain amino acids for muscle recovery and reduced soreness.', 'supplements', 1299, 1599, 4.6, 'https://images.unsplash.com/photo-1579722820903-4b770b9f0748?w=400', ARRAY['recovery', 'amino', 'muscle'], true, 45),
('Omega-3 Fish Oil', 'High-quality fish oil capsules with EPA and DHA for heart and brain health.', 'supplements', 699, 899, 4.4, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', ARRAY['health', 'omega', 'heart'], true, 80),
('Multivitamin Pro', 'Complete daily multivitamin with essential vitamins and minerals.', 'supplements', 599, 799, 4.3, 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400', ARRAY['vitamins', 'health', 'daily'], true, 120),
-- Accessories
('Lifting Gloves Pro', 'Premium leather lifting gloves with wrist support and padded palms.', 'accessories', 799, 999, 4.5, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400', ARRAY['gloves', 'lifting', 'grip'], true, 25),
('Resistance Bands Set', 'Set of 5 resistance bands with varying resistance levels for versatile training.', 'accessories', 649, 899, 4.6, 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=400', ARRAY['bands', 'resistance', 'training'], true, 40),
('Foam Roller', 'High-density foam roller for muscle recovery and myofascial release.', 'accessories', 549, 699, 4.4, 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=400', ARRAY['recovery', 'massage', 'flexibility'], true, 35),
('Premium Shaker Bottle', 'Leak-proof shaker bottle with mixing ball and storage compartment.', 'accessories', 349, 449, 4.7, 'https://images.unsplash.com/photo-1576666987937-b8c90f9d7c66?w=400', ARRAY['shaker', 'bottle', 'protein'], true, 60),
('Gym Bag Elite', 'Large capacity gym bag with shoe compartment and wet pocket.', 'accessories', 1299, 1699, 4.5, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', ARRAY['bag', 'storage', 'gym'], true, 20),
-- Merchandise
('Performance T-Shirt', 'Moisture-wicking athletic t-shirt with gym logo. Available in multiple colors.', 'merchandise', 699, 899, 4.4, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', ARRAY['tshirt', 'apparel', 'workout'], true, 100),
('Training Hoodie', 'Comfortable cotton-blend hoodie perfect for warm-ups and casual wear.', 'merchandise', 1499, 1899, 4.6, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', ARRAY['hoodie', 'apparel', 'warm'], true, 40),
('Gym Towel Premium', 'Quick-dry microfiber gym towel with antibacterial properties.', 'merchandise', 399, 499, 4.3, 'https://images.unsplash.com/photo-1583922606661-0822ed0bd916?w=400', ARRAY['towel', 'hygiene', 'gym'], true, 80),
('Sports Cap', 'Breathable sports cap with adjustable strap and moisture management.', 'merchandise', 449, 599, 4.2, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', ARRAY['cap', 'apparel', 'sun'], true, 50),
-- Nutrition
('Protein Bars (Box of 12)', 'Delicious protein bars with 20g protein each. Mixed flavors box.', 'nutrition', 899, 1099, 4.5, 'https://images.unsplash.com/photo-1622484211148-c51aa20dfc58?w=400', ARRAY['bars', 'protein', 'snack'], true, 70),
('Peanut Butter Natural', '100% natural peanut butter with no added sugar or preservatives.', 'nutrition', 449, 549, 4.7, 'https://images.unsplash.com/photo-1615989485044-bb6553e62ac6?w=400', ARRAY['peanut', 'protein', 'healthy'], true, 55),
('Instant Oats', 'Quick-cooking oats fortified with protein and fiber. Perfect pre-workout meal.', 'nutrition', 299, 399, 4.4, 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400', ARRAY['oats', 'carbs', 'breakfast'], true, 90),
('Electrolyte Mix', 'Sugar-free electrolyte powder for hydration during intense workouts.', 'nutrition', 549, 699, 4.6, 'https://images.unsplash.com/photo-1595981234058-a9302fb97229?w=400', ARRAY['electrolytes', 'hydration', 'energy'], true, 65);
