# TableServe 🍔☕

> Full-stack smart food ordering system — Next.js 14, Supabase, NextAuth.js, Tailwind CSS.
> **No ORM. No Prisma. Direct Supabase JS client for all database operations.**

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup — Step by Step](#setup--step-by-step)
- [Environment Variables](#environment-variables)
- [Supabase Database Setup](#supabase-database-setup)
- [Supabase Storage Setup](#supabase-storage-setup)
- [Default Accounts After Seed](#default-accounts-after-seed)
- [All Routes](#all-routes)
- [How Passwords Work](#how-passwords-work)
- [Payment Flow — UPI Deep Link](#payment-flow--upi-deep-link)
- [Database Tables Reference](#database-tables-reference)
- [API Reference](#api-reference)
- [QR Code per Table](#qr-code-per-table)
- [Deployment — Vercel](#deployment--vercel)
- [Common Issues & Fixes](#common-issues--fixes)
- [Roadmap](#roadmap)

---

## Overview

Three portals in one Next.js app:

- **Customer** — Scan QR at table → browse menu → cart → UPI or counter payment → live status
- **Staff** — Live order dashboard → confirm payments → mark delivered
- **Admin** — Manage tables, menu, categories, staff, UPI settings, full order log

No separate backend. No ORM. Supabase handles everything: database, auth queries, image storage.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| DB Client | @supabase/supabase-js (direct, no ORM) |
| Auth | NextAuth.js v4 (JWT + Credentials) |
| Password Hashing | bcryptjs |
| Styling | Tailwind CSS 3 |
| Image Storage | Supabase Storage |
| Payment | UPI Deep Links (no gateway) |
| Icons | react-icons |
| Toasts | react-hot-toast |
| Hosting | Vercel |

---

## Project Structure

```
tableserve/
│
├── app/
│   ├── page.js                        # Customer: table selection
│   ├── layout.js                      # Root layout
│   ├── globals.css                    # Tailwind + component classes
│   │
│   ├── order/
│   │   ├── page.js                    # Customer: menu + cart + order
│   │   └── confirm/page.js            # Customer: confirmation + live status
│   │
│   ├── login/page.js                  # Staff/Admin login
│   │
│   ├── staff/
│   │   ├── layout.js                  # Staff layout with top nav
│   │   ├── page.js                    # Live orders dashboard
│   │   └── history/page.js            # Order history + filters
│   │
│   ├── admin/
│   │   ├── layout.js                  # Admin layout with sidebar
│   │   ├── page.js                    # Stats dashboard
│   │   ├── tables/page.js             # Table management
│   │   ├── menu/page.js               # Menu item management
│   │   ├── categories/page.js         # Category management
│   │   ├── staff/page.js              # Staff management
│   │   ├── upi/page.js                # UPI settings
│   │   └── orders/page.js             # Full order log
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.js
│       ├── tables/route.js            # GET, POST
│       ├── tables/[id]/route.js       # PATCH, DELETE
│       ├── menu/route.js              # GET, POST
│       ├── menu/[id]/route.js         # PATCH, DELETE
│       ├── categories/route.js        # GET, POST
│       ├── categories/[id]/route.js   # PATCH, DELETE
│       ├── orders/route.js            # GET (filtered), POST
│       ├── orders/[id]/route.js       # GET, PATCH
│       ├── staff/route.js             # GET, POST
│       ├── staff/[id]/route.js        # PATCH, DELETE
│       ├── upi-config/route.js        # GET, PATCH
│       └── upload/route.js            # POST image upload
│
├── src/
│   ├── components/
│   │   ├── SessionProvider.js
│   │   ├── staff/
│   │   │   ├── StaffNav.js
│   │   │   └── PaymentBadge.js
│   │   └── admin/
│   │       └── AdminNav.js
│   └── lib/
│       ├── supabase.js                # supabaseAdmin + supabase clients
│       └── auth.js                    # NextAuth config (queries Supabase directly)
│
├── supabase/
│   └── setup.sql                      # ← PASTE THIS IN SUPABASE SQL EDITOR
│
├── middleware.js                      # Route protection by role
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
├── .env.example
└── package.json
```

---

## Setup — Step by Step

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your three Supabase values + NextAuth secret (see [Environment Variables](#environment-variables)).

### 3. Run the SQL setup in Supabase

This is the key step that replaces all Prisma migrations and seeding:

1. Open your Supabase project → **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase/setup.sql` from this project
4. Paste the entire contents into the editor
5. Click **Run** (or press `Ctrl+Enter`)

That's it. All tables, indexes, triggers, enums, and seed data are created in one shot.

### 4. Set up Supabase Storage

See [Supabase Storage Setup](#supabase-storage-setup) below.

### 5. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Create `.env` in the project root:

```env
# ─── NEXTAUTH ─────────────────────────────────────────────
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-random-string"
NEXTAUTH_URL="http://localhost:3000"

# ─── SUPABASE ─────────────────────────────────────────────
# Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

**Where to find these in Supabase:**
- Go to your project → **Project Settings** → **API**
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `anon` `public` key
- `SUPABASE_SERVICE_ROLE_KEY` = `service_role` key (keep this secret — server-side only)

> ⚠️ Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It is only used in API routes.

---

## Supabase Database Setup

### Run setup.sql

The file `supabase/setup.sql` creates everything from scratch:

```
✓ Drops and recreates all tables (safe to re-run)
✓ Creates ENUMs: food_type, payment_status, staff_role
✓ Creates all 7 tables with correct columns and foreign keys
✓ Creates indexes for performance
✓ Creates auto-update trigger for orders.updated_at
✓ Disables RLS (Row Level Security) on all tables
✓ Seeds: 3 staff accounts, 6 tables, 4 categories, 10 menu items, UPI config
```

**To re-seed cleanly** (e.g. after testing), just run `setup.sql` again — it drops and recreates everything.

### Tables created

| Table | Purpose |
|---|---|
| `tables` | Restaurant tables with number, capacity, location |
| `categories` | Menu categories with sort order |
| `menu_items` | Menu items linked to categories |
| `orders` | Customer orders with payment + delivery status |
| `order_items` | Individual items within an order |
| `staff` | Staff accounts with hashed passwords |
| `upi_config` | Single-row UPI payment settings |

---

## Supabase Storage Setup

Menu item images are stored in Supabase Storage. Set this up once:

1. In Supabase dashboard → **Storage** (left sidebar)
2. Click **New bucket**
3. Name: `menu-images`
4. Toggle **Public bucket** → **ON**
5. Click **Create bucket**

The image upload API (`/api/upload`) handles the rest automatically.

**If uploads fail with a permission error**, add a policy:
- Storage → `menu-images` → **Policies** → **New policy**
- Allow `INSERT` for `service_role`

---

## Default Accounts After Seed

The `setup.sql` seed creates these accounts. **Change passwords after first login** via Admin → Staff panel.

| Role | Email | Password | PIN |
|---|---|---|---|
| Admin | admin@tableserve.com | admin123 | 0000 |
| Manager | manager@tableserve.com | staff123 | 2222 |
| Staff | staff1@tableserve.com | staff123 | 1111 |

> The SQL file contains bcrypt hashes. The hash in the SQL is for `"password"` as a placeholder.
> Use the app's Admin → Staff panel to set real passwords immediately after setup.
> Or generate correct hashes with: `node -e "const b=require('bcryptjs'); console.log(b.hashSync('yourpassword',10))"`
> Then paste them directly into the SQL before running.

---

## All Routes

| Path | Portal | Auth | Description |
|---|---|---|---|
| `/` | Customer | None | Table selection grid |
| `/order` | Customer | None | Menu + cart + payment |
| `/order/confirm` | Customer | None | Order status (live polling) |
| `/login` | Shared | None | Staff/Admin login |
| `/staff` | Staff | STAFF+ | Live orders dashboard |
| `/staff/history` | Staff | STAFF+ | Order history + filters |
| `/admin` | Admin | ADMIN | Stats overview |
| `/admin/tables` | Admin | ADMIN | Table CRUD |
| `/admin/menu` | Admin | ADMIN | Menu item CRUD + image upload |
| `/admin/categories` | Admin | ADMIN | Category CRUD + reorder |
| `/admin/staff` | Admin | ADMIN | Staff management |
| `/admin/upi` | Admin | ADMIN | UPI configuration |
| `/admin/orders` | Admin | ADMIN | Full order log + overrides |

---

## How Passwords Work

Passwords are hashed with **bcryptjs** (cost factor 10) before storing in the `password_hash` column. Plain text passwords are never stored anywhere.

**To generate a bcrypt hash manually** (for seeding):
```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('mypassword123', 10))"
```

**To change a staff password** after setup: use Admin → Staff panel → Edit → enter new password → Save. The API route hashes it automatically.

---

## Payment Flow — UPI Deep Link

### How the link is built

```
upi://pay?pa=UPI_ID&pn=MERCHANT_NAME&am=AMOUNT&cu=INR&tn=ORDER_REF
```

| Parameter | Source | Example |
|---|---|---|
| `pa` | Admin → UPI Settings → UPI ID | `mycafe@upi` |
| `pn` | Admin → UPI Settings → Merchant Name | `TableServe Cafe` |
| `am` | Cart total | `247.00` |
| `cu` | Always INR | `INR` |
| `tn` | Last 6 chars of order ID | `Order-A3F2C1` |

### Full sequence

```
Customer taps "Pay via UPI"
    ↓
Browser fires UPI deep link → GPay / PhonePe / Paytm opens
    ↓
Customer pays → returns to browser → taps "I've Paid"
    ↓
Order: UPI_PENDING
    ↓
Staff sees "Confirm UPI Payment" button on order card
Staff checks their UPI app notification → confirms
    ↓
Order: PAID_UPI ✓
```

### Payment status flow

```
New order
   ├── UPI    → UPI_PENDING  → (staff confirms) → PAID_UPI
   └── Offline → PENDING_OFFLINE → (staff confirms) → PAID_OFFLINE
                        ↓
               Staff marks delivered → is_delivered = true
```

---

## Database Tables Reference

### tables
| Column | Type | Notes |
|---|---|---|
| id | text (uuid) | Primary key |
| number | integer (unique) | Table number |
| capacity | integer | Seating capacity |
| location_label | text | e.g. "Window Side" |
| is_active | boolean | false = hidden from customers |
| created_at | timestamptz | Auto-set |

### categories
| Column | Type | Notes |
|---|---|---|
| id | text (uuid) | Primary key |
| name | text (unique) | Category name |
| sort_order | integer | Controls menu tab order |
| created_at | timestamptz | Auto-set |

### menu_items
| Column | Type | Notes |
|---|---|---|
| id | text (uuid) | Primary key |
| name | text | Item name |
| category_id | text | FK → categories |
| description | text | Optional |
| price | numeric(10,2) | In ₹ |
| image_url | text | Supabase Storage URL |
| is_available | boolean | false = hidden from menu |
| food_type | enum | VEG / NON_VEG / VEGAN |

### orders
| Column | Type | Notes |
|---|---|---|
| id | text (uuid) | Primary key |
| table_id | text | FK → tables |
| payment_status | enum | PENDING_OFFLINE / UPI_PENDING / PAID_UPI / PAID_OFFLINE |
| is_delivered | boolean | Toggled by staff |
| total_amount | numeric(10,2) | Server-calculated |
| notes | text | Customer instructions |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-updated via trigger |

### order_items
| Column | Type | Notes |
|---|---|---|
| id | text (uuid) | Primary key |
| order_id | text | FK → orders (CASCADE delete) |
| menu_item_id | text | FK → menu_items |
| quantity | integer | |
| unit_price | numeric(10,2) | Price snapshot at order time |

### staff
| Column | Type | Notes |
|---|---|---|
| id | text (uuid) | Primary key |
| name | text | Display name |
| email | text (unique) | Login email |
| password_hash | text | bcrypt hash, never plain text |
| pin | text | Optional short PIN |
| role | enum | STAFF / MANAGER / ADMIN |
| phone | text | Optional |
| is_active | boolean | false = cannot log in |

### upi_config (single row)
| Column | Type | Notes |
|---|---|---|
| id | text (uuid) | Primary key |
| upi_id | text | e.g. `shop@upi` |
| merchant_name | text | Shown on UPI payment screen |
| updated_at | timestamptz | Auto-updated |

---

## API Reference

All routes are under `/app/api/`. They use the `supabaseAdmin` client (service role).

### Tables

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tables` | All tables with nested active orders |
| POST | `/api/tables` | Create table `{ number, capacity, locationLabel }` |
| PATCH | `/api/tables/:id` | Update any field |
| DELETE | `/api/tables/:id` | Delete table |

### Menu

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/menu` | All items with nested category |
| POST | `/api/menu` | Create item `{ name, categoryId, price, foodType, ... }` |
| PATCH | `/api/menu/:id` | Update any field incl. `isAvailable` |
| DELETE | `/api/menu/:id` | Delete item |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | All categories with item count |
| POST | `/api/categories` | Create `{ name }` |
| PATCH | `/api/categories/:id` | Update `{ name, sortOrder }` |
| DELETE | `/api/categories/:id` | Delete (fails if items exist) |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | Filtered list. Params: `status`, `delivered`, `tableId`, `limit` |
| POST | `/api/orders` | Place order — see body below |
| GET | `/api/orders/:id` | Single order (used for customer polling) |
| PATCH | `/api/orders/:id` | Update `{ paymentStatus, isDelivered }` |

**POST /api/orders body:**
```json
{
  "tableId": "uuid-of-table",
  "items": [
    { "menuItemId": "uuid", "quantity": 2 },
    { "menuItemId": "uuid", "quantity": 1 }
  ],
  "notes": "No onions please",
  "paymentMethod": "upi"
}
```
`paymentMethod`: `"upi"` → `UPI_PENDING`, `"offline"` → `PENDING_OFFLINE`

### Staff

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/staff` | All staff (password excluded) |
| POST | `/api/staff` | Create `{ name, email, password, pin, role, phone }` |
| PATCH | `/api/staff/:id` | Update any field; password auto-hashed if provided |
| DELETE | `/api/staff/:id` | Delete |

### UPI Config

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/upi-config` | Get current UPI settings |
| PATCH | `/api/upi-config` | Update `{ upiId, merchantName }` |

### Upload

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Multipart form upload, returns `{ url }` |

---

## QR Code per Table

Each table should have a printed QR pointing to:

```
https://yourdomain.com/order?table=TABLE_ID&tableNum=TABLE_NUMBER
```

**Getting the Table ID:**

Open Supabase dashboard → **Table Editor** → `tables` table → copy the `id` column value for each table.

Or run this in SQL Editor:
```sql
SELECT number, id FROM tables ORDER BY number;
```

**Free QR generators:**
- [qr-code-generator.com](https://www.qr-code-generator.com/)
- [goqr.me](https://goqr.me/)
- [qrcode-monkey.com](https://www.qrcode-monkey.com/) — supports logo

Print, laminate, place on tables.

---

## Deployment — Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "TableServe initial commit"
git remote add origin https://github.com/yourname/tableserve.git
git push -u origin main
```

### 2. Import on Vercel

1. [vercel.com](https://vercel.com) → New Project → Import your repo
2. Framework: **Next.js** (auto-detected)
3. Add environment variables (all 5 from your `.env`)
4. Set `NEXTAUTH_URL` to your production URL e.g. `https://tableserve.vercel.app`
5. Deploy

### 3. After deploy

Update `NEXTAUTH_URL` in Vercel env vars to your actual live URL and redeploy once.

---

## Common Issues & Fixes

**`supabaseAdmin is not defined` or auth fails on first run**
→ Check all 3 Supabase env vars are set correctly in `.env`. The `SUPABASE_SERVICE_ROLE_KEY` is not the anon key — it's the longer `service_role` key from Project Settings → API.

**Login fails even with correct password**
→ The SQL seed uses a placeholder bcrypt hash. Go to Admin → Staff → Edit each account → set a real password. Or regenerate hashes:
```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('admin123',10))"
```
Paste the output hash into the SQL file's staff INSERT and re-run.

**UPI deep link does nothing on desktop**
→ Works only on mobile with a UPI app installed. Always test on Android/iOS.

**Images not showing after upload**
→ Confirm `menu-images` bucket is set to **Public** in Supabase Storage. Private buckets return signed URLs that expire.

**`406 Not Acceptable` from Supabase on `.single()`**
→ The query returned 0 rows. Usually means the record doesn't exist or a filter is wrong. Check your Supabase table has data by running `setup.sql` again.

**Staff can still access old portal after role change**
→ Role is stored in the JWT. User must log out and log back in to get a fresh token with the updated role.

**Categories not ordered correctly on customer menu**
→ Re-run `setup.sql` to reset seed data, or use Admin → Categories to reorder manually with the up/down arrows.

**`P2002` or `23505` error on table/email creation**
→ Unique constraint violation. Table number or staff email already exists. Use a different value.

---

## Roadmap

- [ ] Built-in QR code generator in Admin → Tables panel
- [ ] Real-time updates via Supabase Realtime (replace polling)
- [ ] Kitchen Display Screen (KDS) — prep-only view
- [ ] Razorpay / Cashfree for automatic UPI confirmation
- [ ] Multi-outlet support under one admin account
- [ ] Customer WhatsApp notification when order is ready
- [ ] Thermal printer receipt via ESC/POS
- [ ] Inventory / stock tracking per item
- [ ] Table reservation with time slots
- [ ] Promo codes / discount at checkout
- [ ] PWA for faster repeat visits
- [ ] Dark mode

---

*Built with Next.js 14 + Supabase + NextAuth.js + Tailwind CSS*
