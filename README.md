# Stockfolio

**Your inventory, portfolio-grade.**

A production-ready inventory stock management dashboard for warehouse and store managers. Built with Next.js 16, Supabase, TypeScript, and Tailwind CSS.

## Features

### Core
- **Sign Up & Login** — Email/password authentication with Supabase Auth
- **Forgot Password** — Email-based password reset with magic link flow
- **Protected Routes** — Middleware-level route protection with session refresh
- **Row Level Security** — All data is scoped to the user's store via Supabase RLS

### Dashboard
- **Overview** — Stock health summary, urgent items, category breakdown, quick actions
- **Inventory Management** — Add, update, delete products with optimistic UI updates
- **Search & Filter** — Debounced search (300ms) by product name or SKU, filter by stock status
- **Stock Actions** — Increase/decrease quantity, mark as reordered, delete products

### AI Insights
- **Reorder Alerts** — Products that need restocking
- **Stock Velocity** — Products closest to running out
- **Reorder Timeline** — Estimated days before reorder is needed
- **Category Health** — Health scores by product category (SKU prefix)

### Settings
- **Profile** — Update your name
- **Change Password** — Set a new password with validation
- **Store Settings** — Update your store/warehouse name

### UI/UX
- **Sidebar Navigation** — Collapsible sidebar with 5 sections
- **Dark Mode** — Three-state toggle (light/dark/system) persisted to localStorage
- **Skeleton Loaders** — Content-shaped loading states for every page
- **Toast Notifications** — Themed, dismissible alerts for all actions
- **Empty States** — Custom designed states for no products and no search results
- **Responsive** — Works from 375px mobile to wide desktop
- **Activity Logs** — Full audit trail of every inventory change

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| Auth & DB | Supabase Auth + PostgreSQL with RLS |
| Styling | Tailwind CSS v4 with custom design tokens |
| Forms | react-hook-form + Zod schema validation |
| Icons | Lucide React |
| Fonts | Geist (sans/mono) + Fraunces (display) |

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project — [supabase.com](https://supabase.com)

### 1. Clone and Install

```bash
git clone https://github.com/mp0408/Stockfolio.git
cd Stockfolio
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase project URL and anon key (found in Settings → API).

### 3. Set Up Database

Go to your Supabase project → SQL Editor and run the contents of:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables (`stores`, `profiles`, `products`, `inventory_logs`), indexes, RLS policies, and auto-provisioning triggers.

### 4. Seed Demo Data (Optional)

```bash
npm run seed
```

This will prompt for a password and create an account with 30 shoe products.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/                    # Public auth pages
│   │   ├── login/                 # Sign in
│   │   ├── signup/                # Create account
│   │   ├── forgot-password/       # Request password reset
│   │   └── reset-password/        # Set new password
│   ├── (dashboard)/               # Protected pages (sidebar layout)
│   │   ├── dashboard/             # Overview with summary cards
│   │   ├── inventory/             # Product list with CRUD
│   │   ├── ai-insights/           # Smart stock analysis
│   │   ├── activity/              # Audit trail logs
│   │   └── settings/              # Profile, password, store
│   ├── globals.css                # Design system tokens
│   ├── layout.tsx                 # Root layout with fonts
│   └── providers.tsx              # Auth + Toast context
├── components/
│   ├── inventory-card/            # Compound component (Header, Body, Actions)
│   ├── empty-states/              # No products, no search results
│   ├── skeletons/                 # Loading state placeholders
│   └── ui/                        # Sidebar, toast, dark mode, user badge
├── hooks/
│   ├── use-auth.ts                # Re-export from auth context
│   ├── use-inventory.ts           # CRUD + optimistic updates
│   ├── use-activity-logs.ts       # Audit log fetching
│   ├── use-debounce.ts            # Search debounce (300ms)
│   └── use-stock-summary.ts       # Memoized stock health stats
├── lib/
│   ├── supabase/                  # Client, server, middleware helpers
│   ├── validators/                # Zod schemas (auth, product, stock)
│   ├── demo-products.ts           # Shoe inventory seed data
│   ├── types.ts                   # TypeScript type definitions
│   └── utils.ts                   # cn() class merge utility
├── context/
│   └── auth-context.tsx           # AuthProvider with full auth API
└── middleware.ts                   # Route protection + session refresh
```

## Key Implementation Details

### Authentication Flow
1. Supabase Auth handles password hashing (bcrypt) server-side
2. On signup, a database trigger auto-creates `stores` and `profiles` records
3. The auth context also has self-healing logic to create these if the trigger fails
4. Middleware refreshes sessions and enforces route protection on every request

### Compound Components
`InventoryCard` uses React Context to share product data between sub-components:
```tsx
<InventoryCard product={product} onUpdateStock={...} onDelete={...}>
  <InventoryCard.Header />   {/* name, SKU, status badge */}
  <InventoryCard.Body />     {/* quantity, threshold, timestamp */}
  <InventoryCard.Actions />  {/* +/- stock, reorder, delete */}
</InventoryCard>
```

### Stock Health Calculation
The health summary uses `useMemo` to recompute whenever products change:
```
healthPercentage = (inStockProducts / totalProducts) × 100
```
Stock status is always derived from `quantity` vs `low_stock_threshold`, never stored.

### Design System
- Custom CSS variables for light/dark themes (not default Tailwind)
- Warm off-white (`#FAFAF8`) / near-black (`#0B0C0E`) base palette
- Deep teal accent (`#1A7A6D` light, `#2DD4B8` dark)
- Muted status colors with icon pairing for accessibility
- Fraunces display font + Geist sans/mono for premium typography

## License

MIT
