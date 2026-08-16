import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import readline from "readline";

// Read .env.local for Supabase credentials
const envPath = path.resolve(process.cwd(), ".env.local");
let supabaseUrl = "";
let supabaseAnonKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.replace("NEXT_PUBLIC_SUPABASE_URL=", "").trim();
    }
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
      supabaseAnonKey = trimmed.replace("NEXT_PUBLIC_SUPABASE_ANON_KEY=", "").trim();
    }
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EMAIL = "manndp7@gmail.com";
const FULL_NAME = "Mann Patel";
const STORE_NAME = "one8";

// Shoe inventory — 30 products
const SHOE_PRODUCTS = [
  { name: "Nike Air Zoom Pegasus 41", sku: "RUN-NK-PEG41", quantity: 24, low_stock_threshold: 6 },
  { name: "Adidas Ultraboost Light 24", sku: "RUN-AD-UBL24", quantity: 18, low_stock_threshold: 5 },
  { name: "New Balance Fresh Foam X 1080v13", sku: "RUN-NB-1080V13", quantity: 12, low_stock_threshold: 4 },
  { name: "Asics Gel-Nimbus 26", sku: "RUN-AS-NIM26", quantity: 3, low_stock_threshold: 5 },
  { name: "Hoka Clifton 9", sku: "RUN-HK-CLF9", quantity: 0, low_stock_threshold: 4 },
  { name: "Puma Velocity Nitro 3", sku: "RUN-PM-VN3", quantity: 30, low_stock_threshold: 8 },
  { name: "Nike Air Force 1 '07 White", sku: "SNK-NK-AF1W", quantity: 45, low_stock_threshold: 10 },
  { name: "Adidas Stan Smith Classic", sku: "SNK-AD-STNSMTH", quantity: 38, low_stock_threshold: 8 },
  { name: "Puma Suede Classic XXI", sku: "SNK-PM-SUEXXL", quantity: 5, low_stock_threshold: 6 },
  { name: "Converse Chuck Taylor All Star", sku: "SNK-CV-CTAS", quantity: 22, low_stock_threshold: 5 },
  { name: "Reebok Club C 85 Vintage", sku: "SNK-RB-CC85V", quantity: 0, low_stock_threshold: 4 },
  { name: "Vans Old Skool Black/White", sku: "SNK-VN-OLDSKBW", quantity: 16, low_stock_threshold: 5 },
  { name: "Clarks Tilden Walk Oxford Brown", sku: "FRM-CL-TLDNBRN", quantity: 8, low_stock_threshold: 3 },
  { name: "Cole Haan OriginalGrand Wingtip", sku: "FRM-CH-OGWT", quantity: 6, low_stock_threshold: 3 },
  { name: "Steve Madden Kingpin Loafer", sku: "FRM-SM-KNGPN", quantity: 2, low_stock_threshold: 3 },
  { name: "Dockers Agent Cap Toe Oxford", sku: "FRM-DC-AGNTBLK", quantity: 0, low_stock_threshold: 2 },
  { name: "Timberland 6-Inch Premium Wheat", sku: "BTS-TM-6INWHT", quantity: 14, low_stock_threshold: 4 },
  { name: "Dr. Martens 1460 Smooth Leather", sku: "BTS-DM-1460SM", quantity: 9, low_stock_threshold: 3 },
  { name: "Red Wing Heritage Iron Ranger", sku: "BTS-RW-IRNRNG", quantity: 4, low_stock_threshold: 3 },
  { name: "Blundstone 500 Chelsea Boot", sku: "BTS-BL-500CH", quantity: 0, low_stock_threshold: 2 },
  { name: "Birkenstock Arizona Soft Footbed", sku: "SND-BK-ARZSF", quantity: 20, low_stock_threshold: 5 },
  { name: "Nike Benassi JDI Slides", sku: "SND-NK-BNJDI", quantity: 35, low_stock_threshold: 8 },
  { name: "Adidas Adilette Comfort Slides", sku: "SND-AD-ADLCMF", quantity: 28, low_stock_threshold: 6 },
  { name: "Crocs Classic Clog", sku: "SND-CR-CLSCCLG", quantity: 4, low_stock_threshold: 5 },
  { name: "Nike Metcon 9 Training Shoe", sku: "TRN-NK-MTC9", quantity: 11, low_stock_threshold: 4 },
  { name: "Under Armour Project Rock 6", sku: "TRN-UA-PR6", quantity: 7, low_stock_threshold: 3 },
  { name: "Reebok Nano X4 CrossFit", sku: "TRN-RB-NNX4", quantity: 3, low_stock_threshold: 4 },
  { name: "Nike Air Max 270 Kids", sku: "KID-NK-AM270K", quantity: 19, low_stock_threshold: 5 },
  { name: "Adidas Superstar Kids Classic", sku: "KID-AD-SSPRKD", quantity: 15, low_stock_threshold: 4 },
  { name: "New Balance 574 Kids", sku: "KID-NB-574K", quantity: 1, low_stock_threshold: 3 },
];

// Prompt for password securely (not stored in source)
function askPassword() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question("Enter password for the account: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function seed() {
  console.log("\n========================================");
  console.log(`Seeding data for ${EMAIL}...`);
  console.log("========================================\n");

  const password = await askPassword();
  if (!password) {
    console.error("Password is required.");
    process.exit(1);
  }

  let authUser = null;

  // Sign in or sign up
  console.log(`Authenticating ${EMAIL}...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password,
  });

  if (signInError) {
    console.log(`Sign-in failed: ${signInError.message}. Trying sign-up...`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: EMAIL,
      password,
      options: {
        data: { full_name: FULL_NAME, store_name: STORE_NAME, role: "manager" },
      },
    });

    if (signUpError) {
      console.error(`Sign-up failed: ${signUpError.message}`);
      process.exit(1);
    }
    authUser = signUpData.user;
  } else {
    authUser = signInData.user;
  }

  if (!authUser) {
    console.error("Could not authenticate.");
    process.exit(1);
  }

  console.log(`Authenticated (ID: ${authUser.id})`);

  // Ensure store exists
  let { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", authUser.id)
    .maybeSingle();

  if (!store) {
    console.log(`Creating store "${STORE_NAME}"...`);
    const { data: newStore, error: storeErr } = await supabase
      .from("stores")
      .insert({ name: STORE_NAME, owner_id: authUser.id })
      .select()
      .single();

    if (storeErr) { console.error("Store creation failed:", storeErr); process.exit(1); }
    store = newStore;
  } else {
    // Update store name
    await supabase.from("stores").update({ name: STORE_NAME }).eq("id", store.id);
  }

  // Ensure profile exists
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (!profile) {
    const { error: profileErr } = await supabase.from("profiles").insert({
      id: authUser.id,
      store_id: store.id,
      full_name: FULL_NAME,
      role: "manager",
    });
    if (profileErr) { console.error("Profile creation failed:", profileErr); process.exit(1); }
  }

  // Insert products (skip existing SKUs)
  const { data: existing } = await supabase.from("products").select("sku").eq("store_id", store.id);
  const existingSkus = new Set((existing || []).map((p) => p.sku));

  const toInsert = SHOE_PRODUCTS
    .filter((p) => !existingSkus.has(p.sku))
    .map((p) => ({ store_id: store.id, ...p }));

  if (toInsert.length === 0) {
    console.log("All products already exist.");
  } else {
    console.log(`Inserting ${toInsert.length} products...`);
    const { data: inserted, error: insertErr } = await supabase.from("products").insert(toInsert).select();
    if (insertErr) { console.error("Insert failed:", insertErr); process.exit(1); }

    // Audit logs
    const logs = (inserted || []).map((p) => ({
      product_id: p.id,
      store_id: store.id,
      change_type: "manual_adjust",
      quantity_delta: p.quantity,
      note: "Initial inventory load",
      created_by: authUser.id,
    }));
    await supabase.from("inventory_logs").insert(logs);
    console.log(`Inserted ${inserted?.length || 0} products with audit logs.`);
  }

  // Summary
  const { data: all } = await supabase
    .from("products")
    .select("quantity, low_stock_threshold")
    .eq("store_id", store.id);

  const total = all?.length || 0;
  const inStock = all?.filter((p) => p.quantity > p.low_stock_threshold).length || 0;
  const lowStock = all?.filter((p) => p.quantity > 0 && p.quantity <= p.low_stock_threshold).length || 0;
  const outOfStock = all?.filter((p) => p.quantity === 0).length || 0;

  console.log("\n========================================");
  console.log("SEEDING COMPLETE!");
  console.log(`Store: ${STORE_NAME} | User: ${EMAIL}`);
  console.log(`Total: ${total} | In Stock: ${inStock} | Low: ${lowStock} | Out: ${outOfStock}`);
  console.log("========================================\n");
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
