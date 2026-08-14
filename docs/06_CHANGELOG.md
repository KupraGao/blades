# 📝 Changelog

## 📖 რა არის ეს ფაილი?

ამ ფაილში ინახება პროექტის განვითარების ისტორია.

ყოველი მნიშვნელოვანი განახლება, ახალი ფუნქცია ან დასრულებული ეტაპი ემატება ახალი ვერსიის სახით.

ეს საშუალებას იძლევა მომავალში ზუსტად ვიცოდეთ რა შეიცვალა და როდის.

---

# Changelog

---

## v1.14.0

### Admin Route Protection (S3) ✅

- Protected Admin pages live under `src/app/admin/(protected)/`
  (URLs unchanged — route group does not appear in paths)
- Server layout gate: `getAuthorizedAdmin()` → null → `redirect("/admin/login")`
- Single lookup also supplies Admin `displayName` for the shell
- `/admin/login` remains public; active Admin → `redirect("/admin")`
- Proxy remains session-refresh only (no Admin authorization / service-role)
- Guests, non-Admins, and disabled Admins cannot access protected Admin UI routes

#### Explicitly not included

- `requireAdmin()` on privileged Server Actions (**S4**)
- Catalog anon write / RLS hardening
- Customer Auth / OAuth

---

## v1.13.0

### Admin Authentication + Authorization (S2A / S2B) ✅

#### S2A — Authentication foundation

- Supabase Auth email/password Admin login (`/admin/login`)
- Cookie-aware SSR clients + session refresh proxy
- `getAuthUser()` for verified Auth identity
- Logout clears Auth session only (guest cart/wishlist untouched)
- Customers remain Guests (no storefront accounts)

#### S2B — Explicit Admin authorization

- Live `public.admin_users` (UUID → `auth.users`, `display_name`, `is_active`)
- RLS enabled; anon/authenticated have no table privileges
- `getAuthorizedAdmin()` — Auth UUID + active Admin row (privileged lookup)
- Login requires active Admin authorization; non-Admin / disabled → signOut +
  generic error (no role leakage)
- Admin shell shows app-controlled `display_name` + localized Administrator label
- Multi-Admin ready (additional Auth user + `admin_users` row; no code allowlist)

#### Explicitly not included (later)

- `/admin/**` route protection (**S3**) — completed in v1.14.0
- `requireAdmin()` on privileged Server Actions (**S4**)
- Catalog anon write / RLS hardening
- Customer Auth / Google / Facebook OAuth

---

## v1.12.0

### Delivery / Pickup + Delivery Failed + Returned to Store ✅

#### Fulfillment foundation

- Checkout fulfillment method: `delivery` | `pickup`
- Delivery requires trimmed address; Pickup stores `customer_address = NULL`
- Server validation + mapper stale-address protection
- Checkout Success / Admin Details: fulfillment presentation
- Pickup hides Address row; Delivery shows Address
- Admin early-status Delivery ↔ Pickup change (status/stock unchanged)

#### Pickup workflow

`pending → confirmed → processing → ready_for_pickup → completed`

- Backward corrections supported for early/ready states
- Cancel allowed through `ready_for_pickup` (Pickup)
- Pickup never enters `delivery_failed` / `returned_to_store`

#### Delivery workflow

Normal:

`pending → confirmed → processing → shipped → completed`

Exceptional (W2):

`shipped → delivery_failed → shipped` (Retry Delivery)

- Admin at `shipped`: Complete Order + Delivery Failed
- KA: `მიწოდება ვერ მოხერხდა` / EN: Delivery Failed
- No stock change on fail/retry
- `delivery_failed → completed` / `cancelled` forbidden

#### Returned to Store (W3)

`delivery_failed → returned_to_store`

- Terminal status distinct from `cancelled`
- Dedicated PostgreSQL RPC: `public.return_delivery_to_store(uuid)`
- Transactional status change + additive stock restore
- Exactly-once / idempotent (`already_returned`) manually verified
- Application TypeScript does **not** restore stock
- Existing `cancel_order` remained unchanged
  (MD5 `69efa557c03975d0acce40378ff7ce02`)
- Return RPC MD5 `522f9bffa5a2cfa34ddb5f54901fa6e2`

#### Admin / i18n

- Fulfillment-aware `order-status.ts` transition maps
- Order Management actions for fail / retry / return
- Status badges + KA/EN labels for new statuses/actions
- Live status CHECK includes:
  `ready_for_pickup` / `delivery_failed` / `returned_to_store`

#### Legacy data cleanup (subsequent)

- `#10010`: `pickup` + `shipped` → `pickup` + `ready_for_pickup`
- Stock unchanged (stock-neutral correction)
- Remaining invalid Pickup + Delivery-only status rows = 0

#### Explicitly not included

- Refunds / payment reversal
- Customer returns after successful completion
- Exchanges / partial returns / RMA
- Courier tracking

---

## v1.11.0

### Admin Orders List Management + Order Number ✅

#### Admin Orders List Management

- Server-side Admin Orders search, status filter, newest/oldest sort
- Server-side pagination with exact count
- Page size options: `10` / `25` / `50` / `100`
- Results counter (`Showing X–Y of Z orders`)
- Responsive Orders toolbar (search, status, sort, limit)
- URL-driven list state:
  `search` / `status` / `sort` / `page` / `limit`
- Search / filter / sort / limit changes reset page appropriately
- KA/EN labels via existing dictionaries
- Distinct empty states:
  no orders yet vs no matches for active search/filters
- Responsive Admin Orders table (`sm+`) + mobile cards

#### Order search behavior

Server-side via Supabase / `getOrders`:

- Customer name / phone / email (substring `ilike`)
- Full UUID exact match on `orders.id`
- Customer-facing Order Number exact match on `orders.order_number`

Order Number search accepts:

- `10004`
- `#10004`

Both resolve to exact `order_number = 10004`.

Partial Order Number search (for example `100` / `1000`) is **not**
implemented.

PostgREST `.or()` numeric search was corrected:

- exact `order_number` equality (no `ilike` on BIGINT)
- quoted text `ilike` patterns
- optional leading `#` normalized for matching
- full UUID exact search preserved

#### Customer-facing Order Number

Live Supabase / PostgreSQL:

- `orders.id` — UUID internal primary key (unchanged)
- `orders.order_number` — `BIGINT UNIQUE NOT NULL`
- Sequence: `public.orders_order_number_seq`
- Existing orders backfilled chronologically (`10001`+)
- New orders continue automatically (`10004`, `10005`, …)
- DB stores numeric value; UI presents `#10004`

Order Number is shown in:

- Admin Orders List
- Admin Order Details (primary human-readable reference;
  UUID remains secondary/internal)
- Checkout / Order Confirmation
  (success route remains UUID-based; customer sees `#…`)

UUID continues to power:

- `order_items.order_id` FK
- `/admin/orders/[id]`
- `/checkout/success/[orderId]`
- `cancel_order` RPC
- internal relations

#### Responsive Orders table fix

- Desktop/tablet table avoids Georgian header collision
  (for example `მომხმარებელი` / `სულ`) at narrower widths
- Horizontal overflow + minimum table width
- Mobile card layout unchanged

#### Explicitly unchanged / deferred

- Order status workflow and cancellation rules
- `cancel_order` + PostgreSQL stock restore
  (TypeScript still does **not** restore stock)
- Order Management remains the final Admin Order Details block
- Delivery / Pickup fulfillment (**next** milestone — not started)
- Auth, Payments, Shipping pricing, Taxes, Coupons, Invoice, Email,
  Customer Account / My Orders, Analytics, archive/hard delete,
  advanced order editing, createOrder transaction RPC

---

## v1.10.0

### Admin Orders polish + Admin KA/EN ✅

#### Admin Orders presentation

- Final Order Details section order:
  Page Header → Order Header → Customer Information →
  Order Items + Order Total → Order Management (`OrderStatusActions`, last)
- Compact Orders Action column label (`ordersAction`)
- Shortened Order Management action labels:
  KA `დადასტურება` / `გაუქმება`, EN `Confirm` / `Cancel`
- Numeric stock badges on Admin Products list (presentation only)
- Compact non-wrapping Edit/Delete actions on Admin Products

#### Admin / storefront i18n

- Storefront and Admin CMS share the existing
  `LanguageContext` / `useLanguage()` / `dictionaries` architecture
- Admin Orders list, details, status badges, and actions are localized KA/EN
- Database status values remain untranslated:
  `pending` / `confirmed` / `processing` / `shipped` / `completed` / `cancelled`
- Only presentation labels are translated

#### Deterministic Admin dates

- `src/lib/i18n/format-admin-date.ts`
- Fixed timezone `Asia/Tbilisi` + assembled date strings
- Avoids SSR/client hydration mismatch from `toLocaleDateString` / `toLocaleString`

#### Explicitly deferred

- Product thumbnails in Admin Order Items
  (considered/tested; intentionally **not** shipped;
  `get-single-order` stays on simple `order_items` select)
- Delivery / Pickup fulfillment

---

## v1.9.0

### Admin Orders Management ✅

#### Phase A — Admin Order Details

- `/admin/orders` list with responsive desktop/tablet table
- Responsive mobile order cards
- View action → `/admin/orders/[id]`
- Full order details: header, customer information, items, totals, metadata

#### Phase B — Controlled Status Management

- Forward workflow only:
  `pending → confirmed → processing → shipped → completed`
- Centralized status architecture (`src/lib/orders/order-status.ts`)
- Server Action `updateOrderStatus` with one-step transition validation
- Conditional/optimistic status update (stale/duplicate protection)
- `completed` is terminal

#### Phase C — Transactional Cancellation

- Cancel allowed from: `pending` / `confirmed` / `processing`
- Cancel not allowed from: `shipped` / `completed`
- `cancelled` is terminal
- Server Action `cancelOrder` invokes privileged
  `public.cancel_order(p_order_id uuid)` RPC only
- PostgreSQL transaction: order lock → cancel → additive stock restore
- Exactly-once / idempotent cancellation behavior
- No TypeScript-side stock restoration
- Live-tested with multi-product stock restore

#### Phase D — Admin Orders UX Polish

- Reusable `OrderStatusBadge`
- Polished list + Order Details presentation
- Full-width info rows for Order Header / Customer Information
  (aligned with Order Items density)
- Order Management focused on actions (not duplicate status metadata)
- Terminal Completed / Cancelled informational messages
- Completed / cancelled orders retained as historical records
- Hard delete for orders is **not** part of the architecture

#### Explicitly Not Included

- Delivery / Pickup fulfillment methods
- `ready_for_pickup` status
- Authentication / Protected Admin Routes
- Customer Account / My Orders
- Payments / Shipping pricing / Taxes / Coupons
- Invoice / Email notifications
- Advanced order editing / archive / hard delete
- Dashboard analytics

---

## v1.8.0

### Checkout → Orders Integration ✅

#### Checkout

- Checkout Page (`/checkout`)
- Modular Checkout UI (`CheckoutPageContent`, form, summary)
- Controlled Customer Information Form
- Client-side Customer Validation
- Phone validation aligned with Orders backend (min 9)
- Live Cart Order Summary
- Place Order submission wired to `createOrder`
- Duplicate-submit protection while request is in flight
- In-checkout success / error status (no confirmation page yet)

#### Secure Order Creation

- Browser submits only customer fields + `productId` / `quantity`
- Server Action `createOrder` remains the orchestration entrypoint
- Authoritative product title / price resolved from Supabase `products`
- Duplicate product lines consolidated before stock checks
- Stock validation before order creation
- `orders` insert
- `order_items` insert (title / price snapshots)
- `total_price` calculated from resolved items only
- Stock decrement after successful order + items
- Best-effort compensation cleanup for partial failures
- End-to-end order creation verified (Admin Orders + stock)

#### Security / Supabase Access

- Server-only privileged Supabase client (`src/lib/supabase/admin.ts`)
- Privileged key via `SUPABASE_SECRET_KEY` (fallback `SUPABASE_SERVICE_ROLE_KEY`)
- Sensitive order writes / Admin Orders reads use privileged client
- RLS remains enabled
- Anonymous broad Orders access was **not** opened

#### Admin

- Admin Orders list reads via privileged server client
- Created test order visible with customer, total, pending status, date

#### Explicitly Not Included

- Checkout Success / Confirmation page
- Cart clear after success
- Redirect after success
- Payments / Shipping / Taxes / Coupons
- Authentication / Admin route protection
- Production DB transaction / RPC

---

## v1.7.0

### Orders Foundation & Cart Refactor ✅

#### Orders

- Orders Database Schema
- Orders Backend Foundation
- Create Order Action
- Order Validation
- Order Mapper
- Order Insert Service
- Order Items Insert Service
- Get Orders
- Get Single Order
- Admin Orders Page
- Orders Sidebar Navigation

#### Cart Refactor

- Extracted Cart Actions
- Extracted Cart Selectors
- Extracted Cart Storage
- Extracted Cart Types
- CartContext Refactored into Orchestrator

#### Architecture Improvements

- Clear separation of Cart business logic
- Improved maintainability
- Improved scalability
- Prepared foundation for Checkout System

---

## v1.6.0

### Component Architecture Refactor ✅

- Reorganized frontend component structure
- Introduced domain-based component organization
- Separated admin components into dedicated modules
- Created admin layout and product management structure
- Separated product form components
- Separated product listing components
- Organized global layout components
- Organized home page components
- Organized cart components
- Organized wishlist components
- Organized common reusable components

### Architecture Improvements

- Improved project scalability
- Reduced component folder complexity
- Improved code discoverability
- Clear separation of responsibilities
- Prepared structure for future feature expansion

---

## v1.5.0

### Product Listing Polish ✅

- Results Counter
- Products Empty State
- Brands Empty State
- Categories Empty State
- Product Total Count

---

## v1.4.0

### Responsive Admin CMS ✅

- Responsive Admin Layout
- Responsive Product Toolbar
- Responsive Products Table
- Responsive Product Forms
- Responsive Brands Page
- Responsive Categories Page
- Responsive Pagination
- Improved Mobile & Tablet UX
- Admin Header
- Mobile Sidebar Foundation
- Client Admin Layout Architecture

---

## v1.3.0

### Product Filters & Product Validation ✅

- Brand Filter
- Category Filter
- Stock Filter
- Category Required Validation
- Improved Validation Error Messages
- Fixed Product Category Update (UUID)
- Increased Server Action Upload Limit (10 MB)

---

## v1.2.0

### Product Pagination ✅

- Server-side Pagination
- Product Page Size Selector
- URL Page Params
- URL Limit Params
- Previous / Next Navigation
- Dynamic Page Numbers
- Search + Pagination Integration
- Sorting + Pagination Integration

---

## v1.1.0

### Product Search ✅

- Search UI
- Server-side Search
- URL Search Params
- Debounce
- Global Search (Product Fields)

---

## v1.0.0

### Ecommerce Foundation ✅

- Product CRUD
- Brand CRUD
- Category CRUD
- Product Images
- Gallery Upload
- Gallery Delete
- Change Main Image
- Cart
- Wishlist
- Theme
- Multilanguage
- Clean Architecture
- SRP
- Service Layer
- Business Layer

---

## შემდეგი ვერსიები

აქ დაემატება ყველა მნიშვნელოვანი განახლება.