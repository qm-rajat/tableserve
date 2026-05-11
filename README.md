# TableServe 🍔☕

> A full-stack, role-based smart ordering system for cafés, burger joints, and food outlets — built with Next.js 14, Prisma, Supabase, NextAuth.js, and Tailwind CSS.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo Flow](#live-demo-flow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Supabase Configuration](#supabase-configuration)
- [Authentication & Roles](#authentication--roles)
- [Payment Flow — UPI Deep Link](#payment-flow--upi-deep-link)
- [Customer Portal](#customer-portal)
- [Staff Portal](#staff-portal)
- [Admin Portal](#admin-portal)
- [QR Code per Table](#qr-code-per-table)
- [Deployment — Vercel](#deployment--vercel)
- [Default Seed Accounts](#default-seed-accounts)
- [All Routes](#all-routes)
- [Common Issues & Fixes](#common-issues--fixes)
- [Roadmap / Future Ideas](#roadmap--future-ideas)

---

## Overview

TableServe is a self-contained ordering system where:

- **Customers** scan a QR code at their table → browse the menu → add to cart → pay via UPI or at the counter — all from their phone, no app install needed.
- **Staff** see a live dashboard of all active orders, confirm payments, and mark orders as delivered.
- **Admins** manage tables, menu items, categories, staff accounts, and UPI payment settings from a sidebar panel.

Everything runs in a single Next.js app — no separate backend server required.

---

## Live Demo Flow

```
Customer scans QR at Table 3
        ↓
Lands on /order?table=<id>&tableNum=3
        ↓
Browses menu by category (Burgers, Drinks, Sides...)
        ↓
Adds items to cart → reviews order → taps Place Order
        ↓
Chooses payment:
  ├── Pay via UPI  → UPI app opens → customer pays → taps "I've Paid"
  │                  → order status: UPI_PENDING
  └── Pay at Counter → order status: PENDING_OFFLINE
        ↓
Confirmation screen shows live status (polls every 10s)
        ↓
Staff sees order on dashboard
  ├── Confirms UPI  → status: PAID_UPI
  └── Marks offline → status: PAID_OFFLINE
        ↓
Staff marks "Delivered" → order moves to history
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack — frontend + API routes in one project |
| Database | Supabase (PostgreSQL) | Hosted relational database |
| ORM | Prisma 5 | Type-safe DB queries, schema management, migrations |
| Auth | NextAuth.js v4 | JWT-based session auth for staff and admin |
| Styling | Tailwind CSS 3 | Utility-first CSS, mobile-first design |
| Image Storage | Supabase Storage | Hosting menu item images |
| Payment | UPI Deep Links | No payment gateway — direct UPI app launch |
| Icons | react-icons | FI and MD icon sets |
| Toasts | react-hot-toast | User feedback notifications |
| Hosting | Vercel (recommended) | Zero-config Next.js deployment |

---

## Project Structure

```
tableserve/
│
├── app/                          # Next.js App Router
│   ├── page.js                   # Customer: Table selection home
│   ├── layout.js                 # Root layout with SessionProvider + Toaster
│   ├── globals.css               # Tailwind base + custom component classes
│   │
│   ├── order/
│   │   ├── page.js               # Customer: Menu browse + cart + order placement
│   │   └── confirm/
│   │       └── page.js           # Customer: Order confirmation + live status polling
│   │
│   ├── login/
│   │   └── page.js               # Shared login page for staff and admin
│   │
│   ├── staff/
│   │   ├── layout.js             # Staff layout with top nav
│   │   ├── page.js               # Staff: Live orders dashboard
│   │   └── history/
│   │       └── page.js           # Staff: Order history with filters
│   │
│   ├── admin/
│   │   ├── layout.js             # Admin layout with sidebar nav
│   │   ├── page.js               # Admin: Stats dashboard
│   │   ├── tables/page.js        # Admin: Table management (CRUD)
│   │   ├── menu/page.js          # Admin: Menu item management (CRUD + image upload)
│   │   ├── categories/page.js    # Admin: Category management + reordering
│   │   ├── staff/page.js         # Admin: Staff management (CRUD)
│   │   ├── upi/page.js           # Admin: UPI ID + merchant name settings
│   │   └── orders/page.js        # Admin: Full order log with manual overrides
│   │
│   └── api/                      # Backend API routes (Next.js Route Handlers)
│       ├── auth/[...nextauth]/route.js
│       ├── tables/route.js        # GET all, POST new
│       ├── tables/[id]/route.js   # PATCH, DELETE
│       ├── menu/route.js          # GET all, POST new
│       ├── menu/[id]/route.js     # PATCH, DELETE
│       ├── categories/route.js    # GET all, POST new
│       ├── categories/[id]/route.js
│       ├── orders/route.js        # GET (filtered), POST new order
│       ├── orders/[id]/route.js   # GET single, PATCH status
│       ├── staff/route.js         # GET all, POST new
│       ├── staff/[id]/route.js    # PATCH, DELETE
│       ├── upi-config/route.js    # GET, PATCH
│       └── upload/route.js        # POST image to Supabase Storage
│
├── src/
│   ├── components/
│   │   ├── SessionProvider.js     # Wraps app with NextAuth session
│   │   ├── staff/
│   │   │   ├── StaffNav.js        # Top nav for staff portal
│   │   │   └── PaymentBadge.js    # Color-coded payment status badge
│   │   └── admin/
│   │       └── AdminNav.js        # Sidebar nav for admin portal
│   └── lib/
│       ├── prisma.js              # Prisma client singleton
│       ├── auth.js                # NextAuth config + credential provider
│       └── supabase.js            # Supabase client + image upload helper
│
├── prisma/
│   ├── schema.prisma              # Full DB schema with enums and relations
│   └── seed.js                    # Seeds demo data (tables, menu, staff)
│
├── middleware.js                  # Route protection by role (STAFF / ADMIN)
├── next.config.js                 # Next.js config — Supabase image domains
├── tailwind.config.js             # Tailwind theme — brand orange palette
├── jsconfig.json                  # Path alias: @/* → src/*
├── .env.example                   # All required environment variables
└── package.json
```

---

## Database Schema

### Enums

```prisma
enum FoodType       { VEG | NON_VEG | VEGAN }
enum PaymentStatus  { PENDING_OFFLINE | UPI_PENDING | PAID_UPI | PAID_OFFLINE }
enum StaffRole      { STAFF | MANAGER | ADMIN }
```

### Models

**Table**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| number | Int (unique) | Table number shown to customer |
| capacity | Int | Seating capacity |
| locationLabel | String? | e.g. "Window Side", "Outdoor" |
| isActive | Boolean | false = hidden from customer |
| orders | Order[] | All orders for this table |

**Category**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String (unique) | e.g. "Burgers", "Drinks" |
| sortOrder | Int | Controls display order on customer menu |
| menuItems | MenuItem[] | Items in this category |

**MenuItem**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Display name |
| categoryId | String | FK → Category |
| description | String? | Short description |
| price | Float | In Indian Rupees (₹) |
| imageUrl | String? | Supabase Storage public URL |
| isAvailable | Boolean | false = hidden from customer menu |
| foodType | FoodType | VEG / NON_VEG / VEGAN |

**Order**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| tableId | String | FK → Table |
| paymentStatus | PaymentStatus | See payment flow below |
| isDelivered | Boolean | Toggled by staff |
| totalAmount | Float | Calculated at order creation |
| notes | String? | Customer's special instructions |
| createdAt | DateTime | Order timestamp |
| updatedAt | DateTime | Auto-updated on any change |

**OrderItem**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| orderId | String | FK → Order |
| menuItemId | String | FK → MenuItem |
| quantity | Int | Number of this item ordered |
| unitPrice | Float | Price at time of order (snapshot) |

**Staff**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Display name |
| email | String (unique) | Login email |
| passwordHash | String | bcryptjs hashed, never stored plain |
| pin | String? | Optional short PIN (for quick reference) |
| role | StaffRole | Controls portal access |
| phone | String? | Contact number |
| isActive | Boolean | false = cannot log in |

**UpiConfig** *(single-row settings table)*
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| upiId | String | e.g. `yourshop@upi` or `yourshop@okaxis` |
| merchantName | String | Shown on customer's UPI payment screen |

---

## API Reference

All API routes live under `/app/api/`. They accept and return JSON unless noted.

### Tables

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/tables` | None | Get all tables with active order count |
| POST | `/api/tables` | Admin | Create a new table |
| PATCH | `/api/tables/:id` | Admin | Update table (number, capacity, label, isActive) |
| DELETE | `/api/tables/:id` | Admin | Delete table |

### Menu

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/menu` | None | Get all menu items with category info |
| POST | `/api/menu` | Admin | Create new menu item |
| PATCH | `/api/menu/:id` | Admin | Update item (any field including isAvailable) |
| DELETE | `/api/menu/:id` | Admin | Delete item |

### Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | None | Get all categories sorted by sortOrder |
| POST | `/api/categories` | Admin | Create category |
| PATCH | `/api/categories/:id` | Admin | Update name or sortOrder |
| DELETE | `/api/categories/:id` | Admin | Delete category |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/orders` | Staff | Get orders — supports `?status=`, `?delivered=`, `?tableId=`, `?limit=` |
| POST | `/api/orders` | None | Place new order (validates items + calculates total) |
| GET | `/api/orders/:id` | None | Get single order (used for customer status polling) |
| PATCH | `/api/orders/:id` | Staff | Update paymentStatus or isDelivered |

**POST /api/orders — Request Body:**
```json
{
  "tableId": "clxxx...",
  "items": [
    { "menuItemId": "clyyy...", "quantity": 2 },
    { "menuItemId": "clzzz...", "quantity": 1 }
  ],
  "notes": "No onions please",
  "paymentMethod": "upi"
}
```
`paymentMethod` accepts `"upi"` (sets `UPI_PENDING`) or `"offline"` (sets `PENDING_OFFLINE`).

### Staff

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/staff` | Admin | Get all staff (passwords excluded) |
| POST | `/api/staff` | Admin | Create staff account (auto-hashes password) |
| PATCH | `/api/staff/:id` | Admin | Update any field; password re-hashed if provided |
| DELETE | `/api/staff/:id` | Admin | Delete staff account |

### UPI Config

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/upi-config` | None | Get current UPI ID and merchant name |
| PATCH | `/api/upi-config` | Admin | Update UPI settings (upserts single row) |

### Upload

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Admin | Upload image to Supabase Storage, returns `{ url }` |

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- npm or yarn

### Step 1 — Extract and Install

```bash
unzip tableserve.zip -d tableserve
cd tableserve
npm install
```

### Step 2 — Copy environment file

```bash
cp .env.example .env
```

Then fill in all values (see [Environment Variables](#environment-variables) below).

### Step 3 — Configure Supabase Storage

See [Supabase Configuration](#supabase-configuration) section below.

### Step 4 — Push the database schema

```bash
# Generates the Prisma client
npm run db:generate

# Pushes schema to your Supabase PostgreSQL database
npm run db:push
```

### Step 5 — Seed demo data

```bash
npm run db:seed
```

This creates:
- **3 staff accounts** (Admin, Manager, Staff)
- **6 tables** across different locations
- **4 categories** (Burgers, Drinks, Sides, Desserts)
- **10 menu items** (mix of Veg, Non-Veg, Vegan)
- **UPI config** placeholder

### Step 6 — Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Create a `.env` file in the root with the following:

```env
# ─── DATABASE ────────────────────────────────────────────
# From Supabase: Project Settings → Database → Connection String → URI
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# ─── NEXTAUTH ────────────────────────────────────────────
# Any random string — generate one with: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-random-string"

# Your app URL (change to production URL when deploying)
NEXTAUTH_URL="http://localhost:3000"

# ─── SUPABASE ────────────────────────────────────────────
# From Supabase: Project Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Service role key — for server-side image uploads (keep this secret!)
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

> ⚠️ Never commit your `.env` file to Git. It is excluded by Next.js `.gitignore` by default.

---

## Supabase Configuration

### Getting your credentials

1. Go to [supabase.com](https://supabase.com) → open your project
2. **Database URL**: Project Settings → Database → Connection String → URI mode
3. **API Keys**: Project Settings → API → copy `anon public` and `service_role`

### Creating the Storage bucket for menu images

1. In Supabase dashboard → **Storage** (left sidebar)
2. Click **New bucket**
3. Name: `menu-images`
4. Toggle **Public bucket** → ON
5. Click **Create bucket**

The upload API route handles the rest automatically.

### Optional — Storage policy if uploads fail

If you get storage permission errors, add this in Supabase:
- Storage → `menu-images` → Policies → New policy
- Allow `INSERT` and `SELECT` for `service_role`

---

## Authentication & Roles

TableServe uses **NextAuth.js with the Credentials provider** (email + password).

### Role hierarchy

| Role | Can Access |
|---|---|
| `STAFF` | `/staff` — live orders, payment confirm, delivery toggle, history |
| `MANAGER` | `/staff` — same as STAFF |
| `ADMIN` | `/staff` + `/admin` — full control over all settings |

### How it works

1. Staff/Admin log in at `/login` with email + password
2. Password is verified against bcrypt hash stored in DB
3. A JWT token is issued containing `{ id, name, email, role }`
4. `middleware.js` reads the token on every request to `/staff/*` and `/admin/*`
5. Wrong role → redirected to `/login?error=unauthorized`
6. Customers access `/` and `/order` with no login required

### Changing a password

Use the Admin → Staff panel to update any staff member's password. The new value is automatically hashed before saving — plain-text passwords are never stored.

---

## Payment Flow — UPI Deep Link

TableServe uses **UPI deep links** — a standard supported by all Indian UPI apps (GPay, PhonePe, Paytm, BHIM, etc.) with zero payment gateway fees.

### How the deep link is built

```
upi://pay?pa=SHOP_UPI_ID&pn=MERCHANT_NAME&am=AMOUNT&cu=INR&tn=ORDER_REF
```

| Parameter | Value | Example |
|---|---|---|
| `pa` | UPI ID from settings | `mycafe@upi` |
| `pn` | Merchant name from settings | `TableServe Cafe` |
| `am` | Order total | `247.00` |
| `cu` | Currency (always INR) | `INR` |
| `tn` | Transaction note | `Order-A3F2C1` |

### Full UPI payment sequence

```
1. Customer taps "Pay via UPI"
2. Browser opens UPI deep link → UPI app launches with pre-filled details
3. Customer completes payment in their UPI app
4. Customer returns to browser → taps "I've Paid"
5. Order status → UPI_PENDING
6. Staff checks their UPI app / bank notification
7. Staff taps "Confirm UPI Payment" on the order card
8. Order status → PAID_UPI ✓
```

> **Why manual verification?** UPI deep links don't return a callback to the merchant (unlike payment gateways). Manual staff verification is the standard approach for small businesses and is completely reliable.

### Order payment status flow

```
                    ┌─────────────────┐
                    │  Order Created  │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    Customer picks UPI             Customer picks Counter
              │                             │
              ▼                             ▼
       UPI_PENDING                  PENDING_OFFLINE
              │                             │
     Staff confirms                Staff marks paid
              │                             │
              ▼                             ▼
          PAID_UPI                    PAID_OFFLINE
              │                             │
              └──────────────┬──────────────┘
                             │
                    Staff marks delivered
                             │
                             ▼
                     isDelivered = true
                      (moves to history)
```

---

## Customer Portal

**No login required.** Designed mobile-first for phones.

### Pages

#### `/` — Table Selection
- Grid of all active tables
- Shows table number, seating capacity, location label
- Green dot = available, Amber = occupied (has active orders), Grey = inactive
- Tapping an available table navigates to the menu

#### `/order?table=<id>&tableNum=<n>` — Menu & Cart
- Category tab bar at top for quick filtering
- Each item card: food type badge (🟢/🔴/🌿), name, description, price, Add button
- Quantity controls inline on the card once added
- Floating cart button shows item count + total
- Cart drawer slides up from bottom with full order review
- Special instructions text field
- Two payment buttons: **Pay via UPI** and **Pay at Counter**

#### `/order/confirm?orderId=<id>` — Confirmation
- Order ID + table number
- Live payment status badge (updates every 10 seconds via polling)
- 3-step progress indicator: Order Placed → Being Prepared → Delivered
- Full item list with subtotals
- UPI pending notice if applicable

---

## Staff Portal

**Requires login** (any role: STAFF, MANAGER, ADMIN).

### Pages

#### `/staff` — Live Orders Dashboard
- Auto-refreshes every 15 seconds
- One card per active (undelivered) order
- Card header: table number + location + time ago
- Card body: all ordered items with quantities, special notes highlighted
- Card footer: payment badge + total amount + action buttons
- **Actions available:**
  - If `UPI_PENDING` → "Confirm UPI Payment" button
  - If `PENDING_OFFLINE` → "Mark as Paid Offline" button
  - Always → "Mark as Delivered" button (removes card from view)

#### `/staff/history` — Order History
- Full scrollable log of all orders
- Filters: payment status, delivery status
- Compact row layout: table number, items summary, timestamp, badges, amount

---

## Admin Portal

**Requires ADMIN role login.**

### Pages

#### `/admin` — Dashboard
- Stats cards: total tables, menu items, staff, today's orders, today's revenue
- Revenue counts only confirmed paid orders (PAID_UPI + PAID_OFFLINE)
- Each card links to its management page

#### `/admin/tables` — Table Management
- Add, edit, delete tables
- Toggle active/inactive (inactive tables hidden from customers)
- Fields: table number, seating capacity, location label

#### `/admin/menu` — Menu Item Management
- Filter by category
- Add, edit, delete menu items
- Toggle available/unavailable per item (quick hide without deleting)
- Image upload directly to Supabase Storage
- Fields: name, category, description, price, food type, image, availability

#### `/admin/categories` — Category Management
- Add, rename, delete categories
- Reorder with up/down arrows (controls customer menu tab order)
- Shows item count per category

#### `/admin/staff` — Staff Management
- Add, edit, delete staff accounts
- Toggle active/inactive (inactive staff cannot log in)
- Fields: name, email, password, PIN, role, phone
- Passwords are never shown — only re-settable

#### `/admin/upi` — UPI Settings
- Set UPI ID and merchant name
- Live preview of the generated deep link
- Explanation card describing the manual verification flow

#### `/admin/orders` — Order Log
- Complete order history with expand-to-view item details
- Filters: payment status, delivery status
- Admin can manually override payment status or delivery status on any order
- Useful for correcting mistakes or handling edge cases

---

## QR Code per Table

Each table should have a printed QR code linking directly to its order page. The URL pre-fills the table so customers skip the selection screen.

### URL format

```
https://yourdomain.com/order?table=TABLE_DB_ID&tableNum=TABLE_NUMBER
```

### How to get the Table DB ID

Option A — Prisma Studio:
```bash
npm run db:studio
```
Open [http://localhost:5555](http://localhost:5555) → Table model → copy the `id` column value.

Option B — Browser DevTools:
1. Open `/admin/tables`
2. DevTools → Network → find the `/api/tables` request
3. In the JSON response, each table has an `id` field (e.g. `clxyz123abc...`)

### Generating QR codes (free tools)

- [qr-code-generator.com](https://www.qr-code-generator.com/)
- [goqr.me](https://goqr.me/)
- [qrcode-monkey.com](https://www.qrcode-monkey.com/) — supports logo embedding

Print on cardstock and laminate one per table.

---

## Deployment — Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial TableServe setup"
git remote add origin https://github.com/yourname/tableserve.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your repo
3. Framework preset: **Next.js** (auto-detected)

### Step 3 — Add environment variables

In Vercel project settings → Environment Variables, add all five variables:

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL            ← set to your Vercel production URL e.g. https://tableserve.vercel.app
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Step 4 — Deploy

Click **Deploy**. Vercel builds and deploys automatically on every push to `main`.

> After first deploy, update `NEXTAUTH_URL` to your actual production URL and redeploy once.

---

## Default Seed Accounts

After running `npm run db:seed`:

| Role | Email | Password | PIN |
|---|---|---|---|
| Admin | admin@tableserve.com | admin123 | 0000 |
| Manager | manager@tableserve.com | staff123 | 2222 |
| Staff | staff1@tableserve.com | staff123 | 1111 |

> ⚠️ Change all passwords before going live in production. Use Admin → Staff panel to update them.

---

## All Routes

| Path | Portal | Auth Required | Description |
|---|---|---|---|
| `/` | Customer | None | Table selection grid |
| `/order` | Customer | None | Menu browse + cart + order placement |
| `/order/confirm` | Customer | None | Order confirmation + live status polling |
| `/login` | Shared | None | Staff/Admin login form |
| `/staff` | Staff | STAFF / MANAGER / ADMIN | Live orders dashboard |
| `/staff/history` | Staff | STAFF / MANAGER / ADMIN | Order history with filters |
| `/admin` | Admin | ADMIN only | Stats dashboard |
| `/admin/tables` | Admin | ADMIN only | Table CRUD |
| `/admin/menu` | Admin | ADMIN only | Menu item CRUD + image upload |
| `/admin/categories` | Admin | ADMIN only | Category CRUD + reorder |
| `/admin/staff` | Admin | ADMIN only | Staff account management |
| `/admin/upi` | Admin | ADMIN only | UPI payment configuration |
| `/admin/orders` | Admin | ADMIN only | Full order log + manual overrides |

---

## Common Issues & Fixes

**`PrismaClientInitializationError` on startup**
Your `DATABASE_URL` is wrong or Supabase is unreachable. Double-check the connection string in `.env`. Make sure you're using the **URI** format (starts with `postgresql://`), not the individual host/port fields.

**`next-auth` session not persisting after login**
Ensure `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` exactly matches the URL you're visiting — including `http://` vs `https://` and the port number in development.

**Image uploads returning 500**
Verify that your Supabase `menu-images` bucket exists and is set to **Public**. Also confirm `SUPABASE_SERVICE_ROLE_KEY` is the full service role key from Project Settings → API, not the anon key.

**Staff with updated role can still access old areas**
Role is stored in the JWT token at login time. If you change a staff member's role in the DB, they must log out and log back in to get a new token with the updated role.

**UPI deep link does nothing on desktop**
UPI deep links only work on mobile devices with a UPI app installed. On desktop browsers they will silently fail. Always test on a real Android or iOS device with GPay, PhonePe, or Paytm installed.

**`P2002 Unique constraint failed` when seeding**
You've already seeded before. The seed script uses `deleteMany()` before inserting, so just run `npm run db:seed` again — it will clear and re-seed cleanly.

**Prisma schema out of sync after editing `schema.prisma`**
Run `npm run db:push` again after any schema changes. In production environments, use `npx prisma migrate dev` instead for proper migration tracking.

**Tables showing as "Occupied" when there are no active orders**
An order exists for the table with `isDelivered: false`. Staff needs to mark it as delivered, or an Admin can manually set `isDelivered: true` via the Order Log in the admin panel.

---

## Roadmap / Future Ideas

- [ ] **QR code generator built into Admin** — auto-generate printable QR per table from the dashboard
- [ ] **WebSockets / Server-Sent Events** — replace polling with real-time push updates for instant order notifications
- [ ] **Kitchen Display Screen (KDS)** — dedicated full-screen view for kitchen staff showing only food prep items
- [ ] **Razorpay / Cashfree gateway** — automatic UPI payment confirmation without manual staff verification
- [ ] **Multi-outlet support** — separate menus, tables, and staff per branch under one admin account
- [ ] **Customer SMS / WhatsApp notification** — notify customer when order is ready for pickup
- [ ] **Thermal printer integration** — auto-print kitchen receipt on new order via ESC/POS
- [ ] **Inventory tracking** — mark items out-of-stock when quantity runs out, auto-hide from menu
- [ ] **Daily summary email** — end-of-day summary of orders and revenue sent to admin
- [ ] **Table reservation system** — pre-book tables with time slots and party size
- [ ] **Discount / coupon codes** — apply promo codes at checkout for percentage or flat discounts
- [ ] **PWA support** — installable web app on customer phones for faster repeat visits
- [ ] **Dark mode** — system-preference-aware dark theme across all portals

---

## License

MIT — free to use, modify, and deploy for personal or commercial projects.

---

*Built with Next.js 14 + Supabase + Prisma + NextAuth.js + Tailwind CSS*
