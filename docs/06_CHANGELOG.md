# 📝 Changelog

## 📖 რა არის ეს ფაილი?

ამ ფაილში ინახება პროექტის განვითარების ისტორია.

ყოველი მნიშვნელოვანი განახლება, ახალი ფუნქცია ან დასრულებული ეტაპი ემატება ახალი ვერსიის სახით.

ეს საშუალებას იძლევა მომავალში ზუსტად ვიცოდეთ რა შეიცვალა და როდის.

---

# Changelog

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