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
│   │   ├── insert-order-items.ts
│   │   ├── insert-order.ts
│   │   ├── order-mapper.ts
│   │   ├── order-status.ts
│   │   ├── resolve-order-items.ts
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
(list, detail, status update, cancel RPC).

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
3. Customer Information
4. Order Items + Order Total
5. Order Management — `OrderStatusActions` (**must remain last**)

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

↓

UI actions: `OrderStatusActions` → `updateOrderStatus` Server Action

↓

`update-order-status-record.ts` — conditional one-step forward update
(`UPDATE … WHERE status = expected`)

Forward workflow only:

`pending → confirmed → processing → shipped → completed`

`completed` and `cancelled` are terminal.

Authoritative status badge: Order Header only (not duplicated in Order Management).

DB status codes stay English machine values; UI labels are localized via
dictionaries (`getLocalizedOrderStatus` / Admin badge presentation).

## Cancellation

UI cancel (when allowed) → `cancelOrder` Server Action

↓

Privileged `rpc("cancel_order", { p_order_id })` only

↓

PostgreSQL `public.cancel_order(uuid)` owns the transaction:
lock order → set `cancelled` → restore ordered quantities additively to product stock

Application TypeScript does **not** restore stock.

Cancel allowed from: `pending` / `confirmed` / `processing`

Cancel not allowed from: `shipped` / `completed`

## Historical records

Completed and cancelled orders remain stored and visible in Admin.

Hard delete / archive is **not** part of the current architecture.

## Security note

`/admin` routes are **not** authentication-protected yet.
Admin authentication remains a future milestone.

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