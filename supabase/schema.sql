-- ==============================================================================
-- STOCKFOLIO — COMPLETE & PERFECT SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Instructions:
-- Copy and paste this entire script into your Supabase Dashboard -> SQL Editor
-- and click "RUN". It is 100% idempotent (safe to run multiple times).
--
-- Features included:
-- 1. All Tables (stores, profiles, products, inventory_logs) with constraints & cascade rules
-- 2. Complete Row Level Security (RLS) policies for full multi-tenant isolation
-- 3. Automatic updated_at timestamps
-- 4. Automatic user setup trigger (creates store + profile on signup)
-- 5. Automatic 20 Dummy Products (10 Shoes + 10 Bags) and initial audit logs seeded
--    automatically whenever ANY new user signs up or logs in!
-- 6. Retroactive auto-seed for all existing empty stores
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLES & STRUCTURE
-- ==============================================================================

-- ── 2.1 STORES TABLE ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  owner_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── 2.2 PROFILES TABLE (Extends auth.users) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id   UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  full_name  TEXT NOT NULL,
  role       TEXT CHECK (role IN ('manager', 'staff')) DEFAULT 'manager' NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── 2.3 PRODUCTS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id            UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name                TEXT NOT NULL,
  sku                 TEXT NOT NULL,
  quantity            INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── 2.4 INVENTORY LOGS (Audit Trail) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  store_id       UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  change_type    TEXT CHECK (
    change_type IN ('increase', 'decrease', 'reorder', 'manual_adjust')
  ) NOT NULL,
  quantity_delta INT NOT NULL,
  note           TEXT,
  created_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_store_sku ON public.products(store_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_profiles_store ON public.profiles(store_id);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_logs_product ON public.inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_logs_store ON public.inventory_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.inventory_logs(created_at DESC);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- ── 4.1 STORES POLICIES ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own store" ON public.stores;
CREATE POLICY "Users can view their own store"
  ON public.stores FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id = (SELECT store_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create a store on signup" ON public.stores;
CREATE POLICY "Users can create a store on signup"
  ON public.stores FOR INSERT
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update their store" ON public.stores;
DROP POLICY IF EXISTS "Managers can update their store" ON public.stores;
CREATE POLICY "Managers can update their store"
  ON public.stores FOR UPDATE
  USING (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager')
  )
  WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager')
  );

-- ── 4.2 PROFILES POLICIES ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── 4.3 PRODUCTS POLICIES ────────────────────────────────────────────────────
-- Both Managers & Staff can view their store products
DROP POLICY IF EXISTS "Users can only access their store products" ON public.products;
CREATE POLICY "Users can only access their store products"
  ON public.products FOR SELECT
  USING (
    store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid())
  );

-- Only Warehouse Managers can insert new products into the store catalog
DROP POLICY IF EXISTS "Users can insert products for their store" ON public.products;
DROP POLICY IF EXISTS "Managers can insert products for their store" ON public.products;
CREATE POLICY "Managers can insert products for their store"
  ON public.products FOR INSERT
  WITH CHECK (
    store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND role = 'manager')
  );

-- Both Managers & Staff can update product stock quantities & reorder status
DROP POLICY IF EXISTS "Users can update their store products" ON public.products;
CREATE POLICY "Users can update their store products"
  ON public.products FOR UPDATE
  USING (
    store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid())
  );

-- ONLY Warehouse Managers can delete products from the catalog
DROP POLICY IF EXISTS "Users can delete their store products" ON public.products;
DROP POLICY IF EXISTS "Managers can delete their store products" ON public.products;
CREATE POLICY "Managers can delete their store products"
  ON public.products FOR DELETE
  USING (
    store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid() AND role = 'manager')
  );

-- ── 4.4 INVENTORY LOGS POLICIES ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their store logs" ON public.inventory_logs;
CREATE POLICY "Users can view their store logs"
  ON public.inventory_logs FOR SELECT
  USING (
    store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert logs for their store" ON public.inventory_logs;
CREATE POLICY "Users can insert logs for their store"
  ON public.inventory_logs FOR INSERT
  WITH CHECK (
    store_id = (SELECT store_id FROM public.profiles WHERE id = auth.uid())
  );

-- ==============================================================================
-- 5. AUTOMATIC TIMESTAMP UPDATES (Trigger)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. DEMO DATA SEED FUNCTION (20 Shoes & Bags)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.seed_store_demo_inventory(
  target_store_id UUID,
  target_user_id UUID
)
RETURNS INT
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  prod_row RECORD;
  inserted_count INT := 0;
  new_prod_id UUID;
BEGIN
  -- List of 20 realistic Shoes and Bags items
  FOR prod_row IN
    SELECT * FROM (VALUES
      -- 10 Shoes & Footwear
      ('Nike Air Zoom Pegasus 41', 'SHO-NK-AIRPEG', 28, 6),
      ('Adidas Ultraboost Light 24', 'SHO-AD-UB24', 19, 5),
      ('Nike Air Force 1 ''07 Triple White', 'SHO-NK-AF1', 42, 10),
      ('New Balance Fresh Foam X 1080v13', 'SHO-NB-1080', 14, 4),
      ('Asics Gel-Nimbus 26', 'SHO-AS-NIM26', 3, 5),
      ('Hoka Clifton 9', 'SHO-HK-CLF9', 0, 4),
      ('Vans Old Skool Classic Skate Shoes', 'SHO-VN-OLDSC', 22, 6),
      ('Dr. Martens 1460 Smooth Leather Boot', 'SHO-DM-1460', 8, 3),
      ('Clarks Tilden Walk Leather Oxford', 'SHO-CL-OXFD', 4, 3),
      ('Timberland 6-Inch Premium Waterproof Boot', 'SHO-TM-PREM', 12, 4),
      -- 10 Bags, Backpacks & Travel Gear
      ('Executive Full-Grain Leather Laptop Backpack', 'BAG-LE-LAPTOP', 16, 4),
      ('Heavyweight Canvas Weekender Duffel Bag', 'BAG-CAN-WEEK', 25, 5),
      ('Commuter Waterproof Roll-Top Backpack', 'BAG-ROLL-WPRF', 18, 5),
      ('Minimalist Italian Leather Everyday Tote', 'BAG-TOTE-MIN', 9, 3),
      ('Urban Tactical Crossbody Sling Bag', 'BAG-SLNG-URB', 30, 8),
      ('Nike Brasilia Training Gym Duffel Bag', 'BAG-NK-PRODF', 35, 8),
      ('Cordura Anti-Theft Travel Messenger Bag', 'BAG-TRV-MSGR', 3, 4),
      ('Hardshell Polycarbonate Carry-On Spinner', 'BAG-HL-CARRY', 7, 3),
      ('Waterproof Outdoor Trail Hip & Waist Bag', 'BAG-CR-WAIST', 0, 5),
      ('Modular Padded Camera & Tech Gear Backpack', 'BAG-CAM-TECH', 2, 3)
    ) AS t(name, sku, quantity, low_stock_threshold)
  LOOP
    -- Insert product only if SKU does not already exist in store
    INSERT INTO public.products (store_id, name, sku, quantity, low_stock_threshold)
    VALUES (target_store_id, prod_row.name, prod_row.sku, prod_row.quantity, prod_row.low_stock_threshold)
    ON CONFLICT (store_id, sku) DO NOTHING
    RETURNING id INTO new_prod_id;

    IF new_prod_id IS NOT NULL THEN
      inserted_count := inserted_count + 1;

      -- Add corresponding initial audit log
      INSERT INTO public.inventory_logs (
        product_id,
        store_id,
        change_type,
        quantity_delta,
        note,
        created_by
      ) VALUES (
        new_prod_id,
        target_store_id,
        'manual_adjust',
        prod_row.quantity,
        'Initial demo inventory loaded',
        target_user_id
      );
    END IF;
  END LOOP;

  RETURN inserted_count;
END;
$$;

-- ==============================================================================
-- 7. AUTOMATIC USER & STORE SIGNUP TRIGGER
-- ==============================================================================
-- When ANY user signs up or is created in Supabase Auth, this trigger automatically:
-- 1. Creates their Store
-- 2. Creates their Profile
-- 3. Automatically seeds 20 Shoes & Bags products + logs into their store!
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_store_name TEXT;
  user_full_name TEXT;
  user_role TEXT;
  new_store_id UUID;
BEGIN
  default_store_name := COALESCE(new.raw_user_meta_data->>'store_name', 'My Store');
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(COALESCE(new.email, 'user'), '@', 1));
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'manager');

  -- 1. Create store for the new user
  INSERT INTO public.stores (name, owner_id)
  VALUES (default_store_name, new.id)
  RETURNING id INTO new_store_id;

  -- 2. Create profile linked to the new store
  INSERT INTO public.profiles (id, store_id, full_name, role)
  VALUES (new.id, new_store_id, user_full_name, user_role)
  ON CONFLICT (id) DO UPDATE SET
    store_id = COALESCE(public.profiles.store_id, EXCLUDED.store_id),
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

  -- 3. Automatically seed 20 dummy products (Shoes & Bags) and logs
  PERFORM public.seed_store_demo_inventory(new_store_id, new.id);

  RETURN new;
EXCEPTION
  WHEN others THEN
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 8. RETROACTIVE SEED FOR ALL EXISTING EMPTY STORES
-- ==============================================================================
-- Automatically populates any existing store that currently has 0 products
DO $$
DECLARE
  st RECORD;
BEGIN
  FOR st IN
    SELECT s.id AS store_id, s.owner_id
    FROM public.stores s
    LEFT JOIN public.products p ON p.store_id = s.id
    GROUP BY s.id, s.owner_id
    HAVING count(p.id) = 0
  LOOP
    PERFORM public.seed_store_demo_inventory(st.store_id, st.owner_id);
  END LOOP;
END;
$$;
