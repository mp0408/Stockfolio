-- ==============================================================================
-- STOCKFOLIO — 20 DUMMY PRODUCTS SEED (SHOES & BAGS)
-- ==============================================================================
-- Seeds 20 realistic products (10 Shoes + 10 Bags) and initial inventory logs
-- for all existing stores in the database.
-- ==============================================================================

DO $$
DECLARE
  store_record RECORD;
  prod RECORD;
  new_prod_id UUID;
BEGIN
  FOR store_record IN SELECT id, owner_id FROM public.stores LOOP
    FOR prod IN
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
      INSERT INTO public.products (store_id, name, sku, quantity, low_stock_threshold)
      VALUES (store_record.id, prod.name, prod.sku, prod.quantity, prod.low_stock_threshold)
      ON CONFLICT (store_id, sku) DO NOTHING
      RETURNING id INTO new_prod_id;

      IF new_prod_id IS NOT NULL THEN
        INSERT INTO public.inventory_logs (
          product_id,
          store_id,
          change_type,
          quantity_delta,
          note,
          created_by
        ) VALUES (
          new_prod_id,
          store_record.id,
          'manual_adjust',
          prod.quantity,
          'Initial catalog load',
          store_record.owner_id
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
