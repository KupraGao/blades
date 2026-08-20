# 🏗️ Project Architecture

## 📖 რა არის ეს ფაილი?

ამ ფაილში აღწერილია პროექტის არქიტექტურა.

აქ ინახება ინფორმაცია:

- Folder Structure
- Project Flow
- Naming Convention
- Architecture Patterns
- Code Principles

ეს დოკუმენტი აღწერს როგორ არის აგებული პროექტი და რა წესებით ვითარდება.

---

# Project Architecture

---

# 📁 Folder Structure

პროექტი დაყოფილია პასუხისმგებლობების მიხედვით.

```txt
src

├── actions
│   │
│   ├── brands
│   │   ├── create-brand.ts
│   │   ├── delete-brand.ts
│   │   ├── get-brands.ts
│   │   ├── get-single-brand.ts
│   │   └── update-brand.ts
│   │
│   ├── categories
│   │   ├── create-category.ts
│   │   ├── delete-category.ts
│   │   ├── get-categories.ts
│   │   ├── get-single-category.ts
│   │   └── update-category.ts
│   │
│   ├── orders
│   │   ├── cancel-order.ts
│   │   ├── create-order.ts
│   │   ├── get-orders.ts
│   │   ├── get-single-order.ts
│   │   ├── return-delivery-to-store.ts
│   │   ├── update-order-fulfillment.ts
│   │   └── update-order-status.ts
│   │
│   └── products
│       ├── change-main-image.ts
│       ├── create-product.ts
│       ├── delete-gallery-image.ts
│       ├── delete-product.ts
│       ├── delete-products-bulk.ts
│       ├── get-products.ts
│       ├── get-single-product.ts
│       ├── update-product-categories-bulk.ts
│       └── update-product.ts
│
├── app
│   │
│   ├── (shop)
│   │   ├── cart
│   │   ├── checkout
│   │   │   └── success
│   │   │       └── [orderId]
│   │   ├── products
│   │   ├── wishlist
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── admin
│   │   ├── brands
│   │   ├── categories
│   │   ├── orders
│   │   │   └── [id]
│   │   ├── products
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── globals.css
│   └── layout.tsx
│
├── components
│   │
│   ├── admin
│   │   │
│   │   ├── layout
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── MobileSidebar.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── orders
│   │   │   ├── AdminOrderDetailsContent.tsx
│   │   │   ├── AdminOrdersListContent.tsx
│   │   │   ├── OrderFulfillmentActions.tsx
│   │   │   ├── OrderStatusActions.tsx
│   │   │   └── OrderStatusBadge.tsx
│   │   │
│   │   └── products
│   │       │
│   │       ├── form
│   │       │   ├── BasicInfoSection.tsx
│   │       │   ├── CategoriesSection.tsx
│   │       │   ├── ImagesSection.tsx
│   │       │   ├── ProductForm.tsx
│   │       │   └── SpecificationsSection.tsx
│   │       │
│   │       └── list
│   │           ├── ChangeCategoriesModal.tsx
│   │           ├── Pagination.tsx
│   │           ├── ProductBrandFilter.tsx
│   │           ├── ProductBulkTable.tsx
│   │           ├── ProductCategoryFilter.tsx
│   │           ├── ProductLimit.tsx
│   │           ├── ProductSearch.tsx
│   │           ├── ProductSort.tsx
│   │           ├── ProductStockFilter.tsx
│   │           ├── ProductToolbar.tsx
│   │           └── ProductsTable.tsx
│   │
│   ├── cart
│   │   ├── CartDrawer.tsx
│   │   └── CartPageContent.tsx
│   │
│   ├── checkout
│   │   ├── CheckoutPageContent.tsx
│   │   ├── form
│   │   │   ├── CustomerInformationForm.tsx
│   │   │   ├── PlaceOrderButton.tsx
│   │   │   ├── types.ts
│   │   │   └── validate-customer-form.ts
│   │   └── summary
│   │       └── OrderSummary.tsx
│   │
│   ├── common
│   │   ├── CategoriesSidebar.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── ThemeToggle.tsx
│   │
│   ├── home
│   │   ├── FeatureStrip.tsx
│   │   ├── Hero.tsx
│   │   ├── HomeClient.tsx
│   │   └── PromoBanner.tsx
│   │
│   ├── layout
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HeaderExtras.tsx
│   │   ├── MobileMenuDrawer.tsx
│   │   ├── SubHeader.tsx
│   │   └── ThemeProvider.tsx
│   │
│   ├── product
│   │   ├── LatestProductsSlider.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetailsContent.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── ProductPurchaseActions.tsx
│   │   ├── ProductSectionClient.tsx
│   │   └── ProductSlide.tsx
│   │
│   └── wishlist
│       └── WishlistPageContent.tsx
│
├── context
│   ├── CartContext.tsx
│   ├── CartDrawer.tsx
│   ├── LanguageContext.tsx
│   ├── WishlistContext.tsx
│   └── cart
│       ├── actions
│       ├── selectors
│       ├── storage
│       └── types.ts
│
├── data
│   ├── categories.ts
│   └── products.ts
│
├── dictionaries
│   ├── en.ts
│   └── ka.ts
│
├── lib
│   │
│   ├── data
│   │   └── products.ts
│   │
│   ├── i18n
│   │   ├── format-admin-date.ts
│   │   └── localize-storefront-message.ts
│   │
│   ├── orders
│   │   ├── decrement-product-stock.ts
│   │   ├── delete-order.ts
│   │   ├── format-order-number.ts
│   │   ├── insert-order-items.ts
│   │   ├── insert-order.ts
│   │   ├── order-mapper.ts
│   │   ├── order-status.ts
│   │   ├── resolve-order-items.ts
│   │   ├── update-order-fulfillment-record.ts
│   │   ├── update-order-status-record.ts
│   │   └── validate-order.ts
│   │
│   ├── products
│   │   ├── attach-product-categories.ts
│   │   ├── change-main-image-record.ts
│   │   ├── delete-gallery-image-record.ts
│   │   ├── insert-main-image.ts
│   │   ├── insert-product.ts
│   │   ├── parse-product-form.ts
│   │   ├── product-mapper.ts
│   │   ├── update-product-record.ts
│   │   ├── upload-gallery-images-record.ts
│   │   ├── upload-gallery-images.ts
│   │   ├── upload-main-image.ts
│   │   └── validate-product.ts
│   │
│   └── supabase
│       ├── admin.ts
│       └── server.ts
│
└── types
    └── product.types.ts
```

---

# 🔄 Product Flow

ProductForm

↓

parseProductForm

↓

validateProduct

↓

productMapper

↓

insertProduct / updateProductRecord

↓

attachProductCategories

↓

uploadMainImage

↓

insertMainImage

↓

uploadGalleryImagesRecord

↓

revalidatePath

↓

redirect

---

# 📋 Product Listing Flow

Search

↓

Brand Filter

↓

Category Filter

↓

Stock Filter

↓

Sorting

↓

Pagination

↓

Page Size

---

# 🛠️ Admin Layout Flow

app/admin/layout.tsx (Server)

↓

components/admin/layout/AdminLayout.tsx (Client)

↓

AdminHeader

↓

Sidebar (Desktop)

↓

MobileSidebar (Mobile)

↓

Admin Pages

---

# 🛒 Checkout → Orders Flow

Cart (`CartContext`)

↓

`/checkout` → `CheckoutPageContent`

↓

Controlled Customer Form + live Order Summary

↓

Place Order → `createOrder` Server Action

↓

Validate + consolidate items

↓

Resolve authoritative products (`products` table)

↓

Map order (`total_price`, `status: "pending"`)

↓

Insert `orders` → insert `order_items` → decrement stock

↓

Best-effort compensation on partial failure

↓

Return `{ success, orderId }` to Checkout UI

↓

On success: `clearCart()` → redirect `/checkout/success/[orderId]`

↓

Confirmation page loads order via privileged `getSingleOrder`

Privileged access:

`createAdminClient()` (`src/lib/supabase/admin.ts`)

is used for sensitive order orchestration and Admin Orders reads
(list, detail, status update, cancel RPC, return-to-store RPC).

Normal storefront product reads continue to use

`createClient()` (`src/lib/supabase/server.ts`).

---

# 🧾 Admin Orders Flow

## List

`/admin/orders`

↓

URL searchParams (`search` / `status` / `sort` / `page` / `limit`)

↓

`getOrders({ search, status, sort, page, limit })` Server Action

↓

`createAdminClient()`

↓

Server-side Supabase query:

- exact count + range pagination
- status filter
- newest / oldest `created_at` sort
- page size `10` / `25` / `50` / `100`
- search:
  - customer name / phone / email (`ilike` substring)
  - full UUID exact match on `id`
  - Order Number exact match on `order_number`
    (`10004` or `#10004` → `order_number = 10004`)
  - Partial Order Number search is **not** supported

↓

`AdminOrdersListContent` + Orders toolbar / counter / pagination

↓

Responsive table (`sm+`, min-width + horizontal overflow) /
mobile cards (`<sm`)

Primary list identity: `#order_number`

View still routes with UUID → `/admin/orders/[id]`

## Detail

`/admin/orders/[id]`

↓

`getSingleOrder(id)` via privileged client
(simple `orders` + `order_items` select — **no** product image embed)

↓

`AdminOrderDetailsContent` section order (top → bottom):

1. Page Header
2. Order Header
   - primary: customer-facing `#order_number`
   - secondary: internal UUID
   - authoritative status badge
   - prominent Delivery / Pickup fulfillment badge
3. Customer Information
   - Delivery shows Address
   - Pickup omits Address row
4. Order Items + Order Total
5. Order Management — `OrderStatusActions` (**must remain last**)
   - early-status fulfillment change (Delivery ↔ Pickup) when allowed
   - fulfillment-aware status actions

Order Items currently do **not** show product thumbnails
(intentionally deferred; historical title/price snapshots stay text-only).

Admin dates use `formatAdminDateTime` / `formatAdminDate`
(`src/lib/i18n/format-admin-date.ts`, timezone `Asia/Tbilisi`)
so SSR and client hydrate identically.

## Order Number identity

Two identifiers coexist:

- `orders.id` (UUID) — technical PK / routes / FKs / `cancel_order`
- `orders.order_number` (BIGINT) — customer-facing reference (`#10004` in UI)

Checkout confirmation:

- Route remains `/checkout/success/[orderId]` (UUID)
- Customer-facing display uses `#order_number`

## Status management

Centralized rules: `src/lib/orders/order-status.ts`
(fulfillment-aware forward / backward / exceptional maps)

↓

UI actions: `OrderStatusActions` → `updateOrderStatus` Server Action

↓

`update-order-status-record.ts` — conditional status update
(`UPDATE … WHERE status = expected`)

**Normal status transitions do not change stock.**

### Delivery

Normal:

`pending → confirmed → processing → shipped → completed`

Backward corrections (status-only):

`confirmed → pending`, `processing → confirmed`

Exceptional (status-only, no stock):

`shipped → delivery_failed → shipped` (Retry Delivery)

At Delivery `shipped`: Complete Order + Delivery Failed.

`delivery_failed → completed` and `delivery_failed → cancelled` are forbidden.

### Pickup

`pending → confirmed → processing → ready_for_pickup → completed`

Backward corrections:

`confirmed → pending`, `processing → confirmed`,
`ready_for_pickup → processing`

Pickup never enters `delivery_failed` or `returned_to_store`.

### Terminal statuses

`completed`, `cancelled`, and `returned_to_store` are terminal for Admin workflow actions.

Authoritative status badge: Order Header only (not duplicated in Order Management).

DB status codes stay English machine values; UI labels are localized via
dictionaries (`getLocalizedOrderStatus` / Admin badge presentation).

## Three mutation boundaries (do not conflate)

### 1. Normal / exceptional status transition

`updateOrderStatus` → status-only write

Used for forward/backward corrections and Delivery Failed / Retry Delivery.

**No stock change.**

### 2. Cancellation + stock restore

UI cancel (when allowed) → `cancelOrder` Server Action

↓

Privileged `rpc("cancel_order", { p_order_id })` only

↓

PostgreSQL `public.cancel_order(uuid)` owns the transaction:
lock order → set `cancelled` → restore ordered quantities additively to product stock

Application TypeScript does **not** restore stock.

Cancel allowed from: `pending` / `confirmed` / `processing`

Also allowed for Pickup: `ready_for_pickup`

Cancel not allowed from: `shipped` / `delivery_failed` / `returned_to_store` /
`completed` / `cancelled`

`cancelled` is **not** the same outcome as `returned_to_store`.

### 3. Failed Delivery physical return + stock restore

At Delivery `delivery_failed`: Return to Store → `returnDeliveryToStore` Server Action

↓

Privileged `rpc("return_delivery_to_store", { p_order_id })` only

↓

PostgreSQL `public.return_delivery_to_store(uuid)` owns the transaction:
requires Delivery + `delivery_failed` → lock order → set `returned_to_store` →
additive stock restore from `order_items`

Application TypeScript does **not** restore stock.

`delivery_failed → returned_to_store` is **not** authorized through
`canTransitionOrderStatus` / `updateOrderStatus`.

Exactly-once / idempotent return manually verified
(`already_returned = true` on repeat; stock unchanged on second call).

## Historical records

`completed`, `cancelled`, and `returned_to_store` orders remain stored and visible in Admin.

Hard delete / archive is **not** part of the current architecture.

## Security note

### Authentication / Authorization (current)

- **S2A** — Supabase Auth foundation (email/password login, session cookies,
  proxy session refresh, `getAuthUser()`)
- **S2B** — Explicit Admin authorization via `public.admin_users`
  (`getAuthorizedAdmin()`; UUID + `is_active`; app-controlled `display_name`)
- Login requires **both** successful Auth **and** an active Admin row;
  non-Admins are signed out with a generic error
- authenticated ≠ authorized Admin
- **S3** — Admin route/UI protection via `src/app/admin/(protected)/layout.tsx`
  (`getAuthorizedAdmin()` → null redirects to `/admin/login`)
- `/admin/login` remains public; active Admin visiting login redirects to `/admin`
- Proxy remains **session refresh only** (not Admin authorization)
- **S4** — Privileged Server Action / Admin-read gate via `requireAdmin()`
  (`src/lib/auth/require-admin.ts` → `getAuthorizedAdmin()` → fail closed)
  - ADMIN_ONLY mutations (products/images/bulk, brands, categories, order
    status/cancel/return/fulfillment) + privileged Admin list `getOrders`
  - Intentionally ungated: `createOrder` (guest checkout), Auth login/logout,
    public catalog reads, dual-use `getSingleOrder` (guest success + Admin)
- **S5** — Catalog Security Hardening (app + DB + Storage) ✅
  - Admin Catalog mutations:
    `requireAdmin()` → `createAdminClient()` → `service_role` → Catalog CRUD
  - Live DB: `anon` / `authenticated` — Catalog **SELECT only**;
    INSERT/UPDATE/DELETE **denied** on `products`, `brands`, `categories`,
    `product_categories`, `product_images`
  - `service_role` retains Catalog CRUD
  - RLS **ON** for those five catalog tables; dangerous public WRITE policies
    removed (e.g. brands public INSERT/UPDATE/DELETE; product_images public DELETE)
  - Storage `product-images`: public **READ** retained; anonymous upload/write
    removed
  - Secret-exposure audit: no privileged key via `NEXT_PUBLIC_*`; no
    `createAdminClient` / secret imports in `"use client"` modules

### Still remaining (outside Catalog S5)

- Orders / Checkout security review (separate next step)
- Guest-safe access model for `getSingleOrder` (UUID + service-role PII)
- Guest `createOrder` abuse controls (rate limits / CAPTCHA / etc.)

# 🏛️ Architecture Principles

- Single Responsibility Principle (SRP)
- Separation of Concerns
- Business Logic Layer
- Service Layer
- Helper Functions
- Reusable Components
- Orchestrator Pattern
- Server Components
- Client Components
- Server Actions
- Domain Based Component Organization

---

# 📝 Naming Convention

პროექტში გამოიყენება პასუხისმგებლობებზე დაფუძნებული დაყოფა.

```txt
actions

↓

lib

↓

components

↓

pages
```

### Actions

Server-side ოპერაციები:

- Create
- Update
- Delete
- Fetch


### Lib

ბიზნეს ლოგიკა და დამხმარე სერვისები:

- Parsers
- Validators
- Mappers
- Database Helpers
- Upload Services


### Components

UI და მომხმარებელთან დაკავშირებული ლოგიკა.

---

# 🎯 Goal

მიზანია:

- მაქსიმალურად სუფთა კოდი
- მკაფიო არქიტექტურა
- მარტივი მასშტაბირება
- კომპონენტების ხელახლა გამოყენება
- პასუხისმგებლობების სწორი განაწილება

პროექტი ვითარდება მოდულარული და პროფესიონალური Ecommerce არქიტექტურის მიმართულებით.