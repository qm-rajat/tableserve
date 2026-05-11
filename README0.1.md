# TableServe 🍔☕

A full-stack smart food ordering system built with **Next.js 14**, **Prisma**, **Supabase**, **NextAuth.js**, and **Tailwind CSS**.

---

## Features

- **Customer Portal** — Table selection, menu browsing, cart, UPI/offline payment
- **Staff Portal** — Live order dashboard, payment confirmation, delivery tracking
- **Admin Portal** — Tables, menu, categories, staff, UPI config, order log management

---

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```

Fill in your `.env`:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Set up Supabase Storage
In your Supabase dashboard:
- Go to **Storage** → **New bucket**
- Name it `menu-images`
- Set it to **Public**

### 4. Push database schema
```bash
npm run db:generate
npm run db:push
```

### 5. Seed the database
```bash
npm run db:seed
```

This creates:
- 1 Admin, 1 Manager, 1 Staff account
- 6 tables, 4 categories, 10 menu items
- UPI config placeholder

### 6. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tableserve.com | admin123 |
| Manager | manager@tableserve.com | staff123 |
| Staff | staff1@tableserve.com | staff123 |

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Customer table selection |
| `/order?table=ID&tableNum=N` | Customer menu & ordering |
| `/order/confirm?orderId=ID` | Order status (live polling) |
| `/login` | Staff/Admin login |
| `/staff` | Staff live orders dashboard |
| `/staff/history` | Staff order history |
| `/admin` | Admin dashboard |
| `/admin/tables` | Table management |
| `/admin/menu` | Menu item management |
| `/admin/categories` | Category management |
| `/admin/staff` | Staff management |
| `/admin/upi` | UPI settings |
| `/admin/orders` | Full order log |

---

## QR Code per Table

Each table can have a QR code pointing to:
```
https://yourdomain.com/order?table=TABLE_DB_ID&tableNum=TABLE_NUMBER
```

Generate QR codes from [qr-code-generator.com](https://www.qr-code-generator.com/) using those URLs.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js (JWT)
- **Styling**: Tailwind CSS
- **Image Storage**: Supabase Storage
- **Payment**: UPI Deep Links (no gateway needed)
- **Hosting**: Vercel (recommended)
