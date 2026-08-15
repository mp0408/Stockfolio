# Stockfolio

**Your inventory, portfolio-grade.**

A premium B2B SaaS inventory stock management application for warehouse and store managers. Built with Next.js, Supabase, TypeScript, and Tailwind CSS.

## Features

- **Authentication** — Sign up, sign in, and secure session management with Supabase Auth
- **Protected Routes** — Dashboard routes require authentication; auth pages redirect logged-in users
- **Inventory Management** — Add, update, and delete products with real-time stock tracking
- **Stock Health Dashboard** — In-stock, low-stock, and out-of-stock summary with progress indicators
- **Search & Filter** — Debounced search by product name or SKU, filter by stock status
- **Compound Components** — InventoryCard built with Header, Body, Actions sub-components
- **Audit Logging** — Every stock change writes to inventory_logs for traceability
- **Dark Mode** — Three-state toggle (light/dark/system) persisted across reloads
- **Skeleton Loaders** — Content-shaped loading states, never blank screens
- **Custom Empty States** — Designed empty states for no products and no search results
- **Responsive Design** — Works from mobile (375px) to desktop
- **Form Validation** — react-hook-form + Zod with inline error messages

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript strict mode)
- **Auth & Database:** Supabase (Auth + PostgreSQL with Row Level Security)
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Forms:** react-hook-form + Zod schema validation
- **Icons:** Lucide React
- **Fonts:** Geist (sans/mono) + Fraunces (display)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mp0408/Stockfolio.git
   cd Stockfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase URL and anon key in `.env.local`.

4. **Set up the database**
   - Go to your Supabase project → SQL Editor
   - Run the contents of `supabase/migrations/001_initial_schema.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & signup pages
│   ├── (dashboard)/     # Protected dashboard with inventory
│   ├── globals.css      # Design system (light/dark tokens)
│   ├── layout.tsx       # Root layout with fonts & metadata
│   └── providers.tsx    # Client-side context providers
├── components/
│   ├── inventory-card/  # Compound component (Header, Body, Actions)
│   ├── empty-states/    # No products, no results
│   ├── skeletons/       # Content-shaped loading states
│   └── ui/              # Toast, dark mode toggle, user badge
├── hooks/               # useAuth, useInventory, useDebounce, useStockSummary
├── lib/
│   ├── supabase/        # Client, server, middleware helpers
│   ├── validators/      # Zod schemas (auth, product, stock)
│   ├── types.ts         # Database type definitions
│   └── utils.ts         # cn() class merge utility
├── context/             # AuthProvider
└── middleware.ts         # Route protection & session refresh
```

## License

MIT
