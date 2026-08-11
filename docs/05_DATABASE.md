# 🗄️ Database Documentation

## 📖 რა არის ეს ფაილი?

ამ ფაილში ინახება მონაცემთა ბაზასთან დაკავშირებული ინფორმაცია.

მაგალითად:

- Tables
- Relationships
- SQL Scripts
- RLS Policies
- Storage Buckets
- Migrations

ეს დოკუმენტი გამოიყენება მონაცემთა ბაზის სტრუქტურის სამართავად.

---
# Database Documentation

---

## Tables

- products
- brands
- categories
- product_images
- product_categories
- orders
- order_items

---

## Orders (application-level fields evidenced by code)

Fields written/read by the application:

- `id` — returned after insert / used by Admin UI
- `customer_name`
- `customer_phone`
- `customer_email` — nullable in mapper (`null` when omitted)
- `customer_address`
- `customer_note` — nullable in mapper (`null` when omitted)
- `total_price` — calculated server-side from resolved items (`price * quantity`)
- `status` — see supported statuses below
- `created_at` — read by Admin Orders list / detail

Exact PostgreSQL column types, defaults, indexes, and constraints are
**not documented in the repository** (implementation-dependent / live DB).

### Supported order statuses (current)

Stored DB values (never rewritten for i18n):

- `pending` — set on create
- `confirmed`
- `processing`
- `shipped`
- `completed` — terminal
- `cancelled` — terminal

Presentation (Admin / storefront) maps these codes to KA/EN labels.
The database values themselves are **not** translated.

**Not a current DB status:** `ready_for_pickup`
(planned for the Delivery / Pickup milestone).

### Forward status workflow (current Admin Orders)

`pending → confirmed → processing → shipped → completed`

One-step forward only; server validates transitions.

### Cancellation rules (current)

Allowed from: `pending` / `confirmed` / `processing`

Not allowed from: `shipped` / `completed`

`cancelled` is terminal.

### Historical record behavior

`completed` and `cancelled` orders are historical business records.

They remain stored and visible in Admin.

Hard delete for orders is **not** part of the current architecture.

---

## Order Items (application-level fields evidenced by code)

Fields written/read by the application:

- `id` — selected in Admin / get-order queries
- `order_id`
- `product_id`
- `product_title` — snapshot from authoritative DB product title at order time
- `product_price` — snapshot from authoritative DB product price at order time
- `quantity`

No image snapshot column on `order_items`.
Admin Order Items do not currently display product thumbnails.

---

## Storage

Bucket

- product-images

---

## Relationships

products

↓

product_images

↓

product_categories

↓

categories

↓

brands

orders

↓

order_items (`order_id` → `orders.id`)

order_items

↓

products (`product_id` → `products.id`)

Foreign-key constraint definitions are assumed by application usage but are
**not confirmed by repository SQL migrations**.

---

## Order Behavior (code-backed)

- Browser does **not** provide authoritative price / title / total
- `createOrder` resolves products from `products` (`id`, `title`, `price`, `stock`)
- Duplicate `productId` lines are consolidated before stock validation
- Stock is validated before order creation
- `total_price` is computed only from resolved item prices × quantities
- Order line title/price are snapshotted onto `order_items`
- After successful `orders` + `order_items` insert, product `stock` is decremented
- Partial-failure compensation deletes / stock restore are best-effort
  (not a full DB transaction / RPC for **order creation**)

### Cancellation + stock restore (RPC-backed)

- App cancel path: privileged Server Action → `rpc("cancel_order")` only
- Database function: `public.cancel_order(p_order_id uuid)`
- Runs in a PostgreSQL transaction with order row locking
- Sets order `status` → `cancelled`
- Restores ordered quantities **additively** to product `stock`
- Designed for exactly-once / idempotent cancellation
  (concurrent double-cancel protected)
- Application TypeScript does **not** perform stock restoration on cancel

Exact RPC SQL is managed in the live Supabase database and is
**not checked into this repository** as a migration file.

---

## RLS / Access Architecture

- RLS remains enabled
- Public/anon broad Orders access is **not** intentionally opened
- Sensitive server order writes and Admin Orders reads use the
  server-only privileged Supabase client (`src/lib/supabase/admin.ts`)
- Privileged env var names (never commit real values):
  - `SUPABASE_SECRET_KEY` (preferred)
  - `SUPABASE_SERVICE_ROLE_KEY` (fallback)
- Normal storefront product reads continue via the anon server client
  (`src/lib/supabase/server.ts`)

### Existing catalog RLS notes

- Products
- Brands
- Categories
- Product Images
- Product Categories

Exact Orders RLS policy SQL is not stored in this repository.

---

## SQL Scripts

აქ შეინახება ყველა Migration და SQL Script.

Repository currently does not contain checked-in Orders migrations.
