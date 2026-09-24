# 🚧 Current Sprint

## 📖 რა არის ეს ფაილი?

ამ ფაილში იწერება მხოლოდ მიმდინარე სამუშაო.

ეს არის ყოველდღიური TODO სია, სადაც ჩანს კონკრეტულად რაზე მუშაობ ამ სპრინტში.

სამუშაოს დასრულების შემდეგ ჩანაწერები აქედან იშლება.

---

# 🚧 Current Sprint

---

## 🚧 NEXT — Promo CMS / real Promo Slider #1

- `PromoSlider` is currently a **visual frame only** (no real banners)
- Remaining: banner data model (not locked), Admin management, image
  upload, active/inactive, ordering, optional link/CTA, real carousel
  when multiple records exist
- Do **not** treat placeholder copy as a live campaign
- No promotional banner table exists yet

---

## ✅ COMPLETED — Sale pricing, virtual Sale filter, homepage hero

- `products.price` = regular/original; `products.sale_price` nullable
- On sale iff `sale_price IS NOT NULL`; no `is_on_sale` DB boolean
- Production CHECK is **executed**:
  `sale_price IS NULL OR (sale_price > 0 AND sale_price < price)`
- SQL history: `docs/sql/add-products-sale-price.sql` (not pending)
- Admin: On Sale checkbox + Sale Price; unchecked → `sale_price = NULL`;
  derived discount %; desktop one row
  (Regular Price | On Sale | Sale Price + %); Create/Edit same model
- Product form: top Create/Update + bottom submit share `#product-form`
  / `handleSubmit` (image optimization included)
- Storefront ფასდაკლება / Sale = virtual filter `?category=sale` →
  `sale_price IS NOT NULL`; legacy Discount category membership is
  ignored; Admin assignment hides that category; **DB row not deleted**
- Effective price via `src/lib/products/pricing.ts`; Product Card /
  Details / Wishlist / Cart display; checkout `resolveOrderItems`
  re-fetches DB `price` + `sale_price` (cart is not authoritative)
- ₾150 delivery threshold unchanged; uses effective subtotal; no fee;
  no COD
- Sale Slider #2: `getSaleSliderProducts()` `sale_price IS NOT NULL`,
  `created_at` desc, limit 10, **no stock eligibility filter** (`stock`
  is selected for Add-to-Cart UX only); hidden when empty; no autoplay;
  Latest Products unchanged
- Sale cards use shared `ProductCardAddToCartButton` (same as ProductCard);
  View Product CTA removed; image/title/price still go to Product Details
- Add to Cart feedback is success-driven (`AddToCartResult`); Out of Stock
  vs Stock limit reached are distinct disabled states
- Visible cards: <360px = 1; 360px–md = 2; md–lg = 3; lg+ = 1
  (narrow right column). Inverse of a typical 1→2→3 sequence
- Promo Slider #1 **frame** + `HomepageHeroSliders` composition shipped;
  Promo CMS / real banners **not** implemented
- Catalog min/max (and Admin price sort) use live generated
  `effective_price` (`COALESCE(sale_price, price)`) and
  `products_effective_price_idx`. SQL
  `docs/sql/add-products-effective-price.sql` is **executed** (history;
  not auto-applied). Runtime Min/Max verified (320/280: 250–300 visible,
  300–350 hidden). Storefront has no price-sort UI.

---

## ✅ COMPLETED — Checkout → Orders Integration

- Checkout Page (`/checkout`)
- Modular Checkout UI
- Controlled Customer Information Form
- Client-side Customer Validation
- Phone validation aligned with backend (min 9)
- Live Cart Order Summary
- Place Order → `createOrder` Server Action
- Duplicate-submit protection while submitting
- Browser does **not** send authoritative price / title / total
- Server-side product resolve from Supabase
- Duplicate product line consolidation
- Stock validation before order creation
- `orders` + `order_items` creation
- Authoritative `total_price` calculation
- Stock decrement after successful order
- Compensation cleanup for partial failures
- Server-only privileged Supabase client for sensitive order ops
- Admin Orders list visibility (privileged reads)
- End-to-end real order verified in `/admin/orders`

---

## ✅ COMPLETED — Order Confirmation

- After successful order: remove **only** purchased cart lines (deselected
  items remain); no full `clearCart()` wipe when unpurchased lines exist
- Redirect with `orderId`
- Success / Confirmation page (`/checkout/success/[orderId]`)
- Confirmation details via proof-gated guest success read (+ product
  thumbnails via existing order-item display mapping)
- Prevent accidental duplicate submission after success

---

## ✅ COMPLETED — Cart Item Selection / Partial Purchase

- Persisted `CartItem.selected` (localStorage); new items default selected;
  legacy missing `selected` → `true`
- Header Cart Drawer: per-item checkbox (bottom-right), Select All, selected
  total; delete remains top-right
- Header badge / `cartCount` = **all** cart quantities
- `/cart` list renders **only** `selectedItems` (deselected stay in cart)
- Checkout + `createOrder` payload = selected items only; zero selected blocked
- Stock unchanged by add/select/deselect; decrement only on successful
  `createOrder` for ordered lines
- Failed `createOrder` leaves cart unchanged

---

## ✅ COMPLETED — S7A Payments Foundation (DB)

- Production `orders` additive columns verified:
  - `payment_method` TEXT NULL — allowed non-null: `online` | `pay_at_pickup`
    (**no** `cash_on_delivery`)
  - `payment_status` TEXT NOT NULL DEFAULT `unpaid` — `unpaid` | `pending` |
    `paid` | `failed` | `refund_pending` | `refunded`
  - `payment_provider` / `payment_transaction_id` TEXT NULL;
    `paid_at` TIMESTAMPTZ NULL
- Both payment CHECK constraints verified in Production
- Historical test orders: method NULL, status unpaid, metadata NULL
- Order status and payment status remain independent lifecycles
- **Not** included: Checkout payment UI, provider, webhooks, refunds

---

## ✅ COMPLETED — S7B-1 Delivery Minimum Enforcement

- Delivery available only when selected checkout subtotal ≥ 150 GEL
- Under 150: delivery disabled; pickup remains; localized min message;
  form switches delivery → pickup and clears address
- ≥ 150: delivery available; free in Tbilisi; **no** delivery fee added
- Client gate: `selectedCartTotal` + fulfillment UI
- Server gate: authoritative resolved DB prices in `createOrder`; rejects
  delivery under 150 **before** order insert / items insert / stock decrement
- Cart Item Selection / ownership / stock / fulfillment architecture preserved

---

## ✅ COMPLETED — S7B Checkout Payment Method Integration

- Checkout payment selection: `online` | `pay_at_pickup` (**no** COD)
- Delivery → Online only; Pickup → Online or Pay at Pickup
- Default `paymentMethod = online`; Pickup + Pay at Pickup → switch to
  Delivery forces `online`
- Server `validateOrder` rejects `delivery + pay_at_pickup` and unknown
  methods (incl. `cash_on_delivery`) **before** order insert / items /
  stock decrement
- Persists `payment_method`; server sets `payment_status = unpaid` for all
  current valid combinations (online ≠ charged)
- KA/EN labels + errors via existing dictionaries
- **Not** included: provider / bank charge, webhooks, auto-`paid`, refunds

---

## ✅ COMPLETED — Product Card responsive polish

- Home product grid: mobile `gap-x-3 gap-y-4`; `sm+` keeps `gap-6`;
  column breakpoints unchanged
- Add-to-Cart float feedback: mobile wrap / max-width so KA text + checkmark
  stay readable; `sm+` nowrap; ProductCard `overflow-hidden` kept;
  no cart/stock logic change

---

## ✅ COMPLETED — Home Catalog Filters + Server-Side Pagination

- Storefront control: Categories → Filters (`Filters` / `ფილტრები`)
- Category + Price filters combine with **AND** against the full catalog
  **before** pagination (not client-side on the current page only)
- Stable category ID in URL (`?category=`); `name_ka` / `name_en` display only
- Price uses generated `products.effective_price` (GEL / `₾`); min-only /
  max-only / both / unbounded; invalid `min > max` not sent as a bad query
- URL state: `category`, `minPrice`, `maxPrice`, `page` (single source of truth)
- Page size **20**; exact filtered count drives page count; filter/Clear →
  `page = 1`
- Clear Filters; active filter count (Category + Price groups; min+max = 1)
- Desktop Filters panel + Mobile Menu Drawer share the same URL state
- Empty filtered catalog: localized empty state; Latest Products unchanged
- Latest Products: independent `getProducts({ page: 1, limit: 10 })` — not
  filtered by catalog Filters / page
- Extended `getProducts` (category / minPrice / maxPrice / count / range);
  helpers: `catalog-search-params.ts`, `CatalogPagination.tsx`
- No schema / migration / RPC / new dependency

---

## ✅ COMPLETED — Storefront Brands

- Public Brands directory `/brands` — responsive BrandCard grid (name,
  optional logo / first-letter fallback, product count; zero-product Brands
  still shown; navigate by slug)
- Brand PLP `/brands/[slug]` — resolve exact Brand → fixed server `brandId` →
  Category + Price Filters + exact filtered count + **20**/page pagination;
  reuses `ProductCard` + `CatalogPagination` + `CategoriesSidebar`
- Brand scope from pathname slug only (no `brandId` query param); URL filters:
  `category` / `minPrice` / `maxPrice` / `page`; Clear keeps Brand path
- Shared storefront toolbar (shop layout): `/` and Brand PLP → Filters +
  Search + Help; `/brands` → Search + Help only (no product Filters)
- Desktop sidebar defaults: Home OPEN; Brand PLP CLOSED; `/brands` none
- Controlled motion: Home → only Latest Products title moves; Brand PLP →
  only Brand identity header moves (`lg:ml-[272px]`); grids stay stationary
- KA/EN labels; count grammar KA always `{count} პროდუქტი`; EN 1 product /
  N products
- Empty states: Brand-empty vs catalog no-match when filters active
- Separate from Admin Brands CMS (`/admin/brands` …)
- Supporting polish: Header rail update-depth guard; Header/Footer Image
  aspect warning; root `data-scroll-behavior="smooth"`
- No schema / migration / RPC / RLS / new dependency; Home catalog semantics
  unchanged; S7 Payments unchanged (still partial)

---

## ✅ COMPLETED — Customer Profiles + Account Auth UX + Admin Users

### Database (`public.profiles` — live Supabase; manual SQL Editor)

- Table: `id` → `auth.users(id)` `ON DELETE CASCADE`; `full_name`; `phone`;
  `created_at` / `updated_at`
- Profiles = app source of truth for name/phone; Auth = identity / email /
  password / session / confirmation
- Backfill from `auth.users.raw_user_meta_data`; signup trigger creates
  profile; `updated_at` trigger; RLS own SELECT/UPDATE only (no customer
  INSERT/DELETE); Admin via service-role server path
- **No** in-repo migration file for this DDL
- `orders.user_id` still → `auth.users`; `orders.customer_*` remain snapshots;
  `admin_users` remains Admin authz only (not a customer registry)

### Customer Account / Auth UX

- `/account` reads email from Auth + name/phone from `profiles` (metadata
  fallback only if profile row missing)
- Customer may edit own `full_name` / `phone` (anon SSR client + RLS; no
  service role; no `user_metadata` write)
- Email remains read-only; My Orders unchanged
- Login/Register password visibility (Eye/EyeOff); Forgot Password
  (`/account/forgot-password`); recovery via `/auth/callback` → Reset
  Password (`/account/reset-password`); logged-in Change Password
- Login UX: Sign In / Create Account / Continue as guest; logout →
  `/account/login?signedOut=1` success feedback
- Storefront browsing does **not** require Auth; Guest checkout unchanged

### Admin Users (read-only)

- `/admin/users` — list + search (name/email/phone) + pagination (20/page)
- `/admin/users/[id]` — detail + owned Order History (`orders.user_id` only;
  never email match)
- `requireAdmin()` + `createAdminClient()`; safe DTO only to UI
- Compact Eye + View actions; View → detail / order details

### Intentionally deferred (not broken)

- Customer email change
- Admin edit / delete / ban / invite customer
- Admin password manipulation / Admin role management

S7 Payments status unchanged (still partial). Immediate next remains
provider integration — not Admin customer mutations.

---

## ✅ COMPLETED — Admin Orders Management (Phases A–D)

### Phase A — Admin Order Details

- `/admin/orders` list (responsive table + mobile cards)
- View action
- `/admin/orders/[id]` full order details
- Customer information, order items, totals, metadata

### Phase B — Controlled Status Management

- Workflow: `pending → confirmed → processing → shipped → completed`
- Centralized order status architecture (`order-status.ts`)
- Server-side transition validation
- One-step forward transitions only
- Optimistic/conditional status update (stale/duplicate protection)
- `completed` is terminal

### Phase C — Transactional Cancellation

- Cancel allowed from: `pending` / `confirmed` / `processing`
- Cancel **not** allowed from: `shipped` / `completed`
- `cancelled` is terminal
- PostgreSQL RPC: `public.cancel_order(p_order_id uuid)`
- Privileged server-side invocation only
- Atomic cancel + additive stock restore
- Exactly-once / idempotent cancellation
- No TypeScript-side stock restoration

### Phase D — Admin Orders UX Polish

- Reusable status badge presentation
- Polished list + Order Details UI
- Final detail section order:
  Order Header → Customer Information → Order Items → Order Management
  (`OrderStatusActions` is the last card)
- Terminal Completed / Cancelled informational messages
- Compact Order Management labels (Confirm/Cancel · დადასტურება/გაუქმება)
- Admin Orders KA/EN via existing LanguageContext dictionaries
- Deterministic Admin date formatting (`format-admin-date.ts`, Asia/Tbilisi)
- No order hard delete (historical records retained)
- Product thumbnails in Order Items intentionally **not** implemented

---

## ✅ COMPLETED — Admin Orders List Management + Order Number

### Admin Orders List Management

- Server-side search / status filter / newest–oldest sort
- Server-side pagination + exact count + results counter
- Page size: `10` / `25` / `50` / `100`
- Responsive Orders toolbar
- URL-driven state: `search` / `status` / `sort` / `page` / `limit`
- KA/EN labels
- Filtered vs no-orders empty states
- Responsive table/cards (tablet/desktop overflow fix for wide KA headers)

### Order search

- Customer name / phone / email (`ilike`)
- Full UUID exact match
- Order Number exact match (`10004` or `#10004` → `order_number = 10004`)
- Partial Order Number search **not** implemented

### Order Number system (live DB)

- `orders.id` UUID remains internal PK / routes / FKs / `cancel_order`
- `orders.order_number` `BIGINT UNIQUE NOT NULL`
- Sequence `public.orders_order_number_seq`
- Backfill `10001+`; new orders continue automatically
- UI presents `#10004` (Admin list, Admin details, Checkout confirmation)
- Checkout success route remains UUID-based

### Unchanged business rules

- Status workflow / cancellation / PostgreSQL stock restore unchanged
- Order Management remains last on Admin Order Details
- TypeScript does **not** restore stock

---

## ✅ COMPLETED — Delivery / Pickup System (W2 + W3)

### Fulfillment foundation

- Checkout Delivery / Pickup selection (UI default `delivery`)
- Delivery requires address; Pickup forces `customer_address = NULL`
- Server validation + mapper stale-address protection
- Admin Order Header fulfillment badge
- Conditional Address presentation (Delivery shown / Pickup omitted)
- Admin early-status fulfillment change (Delivery ↔ Pickup) when allowed

### Pickup workflow

`pending → confirmed → processing → ready_for_pickup → completed`

Backward corrections:

`confirmed → pending`, `processing → confirmed`,
`ready_for_pickup → processing`

Cancel allowed from Pickup: `pending` / `confirmed` / `processing` /
`ready_for_pickup`

### Delivery workflow

Normal:

`pending → confirmed → processing → shipped → completed`

Exceptional:

`shipped → delivery_failed → shipped` (Retry Delivery)

Physical return:

`delivery_failed → returned_to_store` via `return_delivery_to_store` RPC

### Stock / RPC boundaries

- Normal / exceptional status transitions: **no stock change**
- Cancel: `cancel_order` (unchanged; MD5 `69efa557c03975d0acce40378ff7ce02`)
- Return to Store: `return_delivery_to_store`
  (MD5 `522f9bffa5a2cfa34ddb5f54901fa6e2`; exactly-once manually verified)
- TypeScript does **not** restore stock for cancel or return

### Legacy cleanup

✅ Legacy / test anomaly `#10010` — completed (stock-neutral)
   - Was: `pickup` + `shipped`
   - Now: `pickup` + `ready_for_pickup`
   - Post-cleanup: 0 Pickup rows with Delivery-only statuses
     (`shipped` / `delivery_failed` / `returned_to_store`)

**Status:** COMPLETED for Delivery / Pickup operational workflow.

Out of this milestone: refunds, post-completed customer returns, exchanges,
partial returns, payment reversal, courier tracking, RMA, Auth / Payments /
createOrder production RPC hardening.

---

## 🔮 FUTURE (not current sprint)

✅ Authentication (S2A) + explicit Admin authorization (S2B)

✅ Protected Admin Routes (S3)

✅ Privileged Server Action authorization / `requireAdmin` (S4)

✅ Catalog Security Hardening (S5) — Catalog write privileges removed from
  anon/authenticated; RLS ON; Storage upload hardened; Admin Catalog CRUD
  via `requireAdmin()` → `createAdminClient()` → `service_role`

✅ **S6 Customer Ownership — COMPLETE** (pending commit)

✅ Order Ownership Foundation (S6A) — `orders.user_id` nullable FK;
  Guest may remain `NULL`; no email backfill of historical Guest orders

✅ Customer Auth / Account UI (S6B) — register (name/phone/email/password),
  login/logout, `/account`, email confirmation callback; Admin auth separate

✅ Customer Profiles + Account Auth UX — `public.profiles` (name/phone);
  Account edit; password show/hide; forgot/reset; logged-in change password;
  Login guest paths + signed-out feedback

✅ Admin Users (read-only) — `/admin/users` + `/admin/users/[id]` + owned
  Order History (`orders.user_id`); deferred: Admin edit/delete/ban/invite,
  customer email change, Admin password/role tools

✅ Secure guest success access (S6C Step 1) — HMAC httpOnly proof;
  UUID alone denies PII; Admin `getAdminOrder` + `requireAdmin`

✅ Guest → Customer order claim (S6C Step 2) — proof required;
  attach only when `user_id IS NULL`; email never authorizes ownership

✅ Customer My Orders (S6D) — list/detail constrained by auth `user.id`;
  shared Account layout; product snapshot + optional live product link/image

✅ Logged-in checkout auto-attach (S6E) — `createOrder` + `getAuthUser()`;
  never accepts client `user_id`; Guest checkout unchanged

✅ Account → Admin Panel shortcut — authorized admins only (`isAdmin` from
  `getAuthorizedAdmin()`); `/account` page header link to `/admin`; normal
  customers do not see it; admin route security unchanged

⬜ Customer-side order management (cancel / edit by Customer)

⬜ Advanced order editing (add/remove products on existing order)

⬜ Invoice

⬜ Email Notifications — every successful order → confirmation email to
  `customer_email` (Guest + Customer); not tied to Account; not implemented

⬜ Payments (S7) — **partial:** S7A DB ✅ + S7B-1 ✅ + S7B payment-method ✅;
  next: real online payment / provider integration (provider not chosen);
  then webhooks / refunds / auto-`paid` (not started). No COD.

⬜ Shipping pricing (beyond free Tbilisi delivery + 150 GEL minimum)

⬜ Taxes

⬜ Coupons

⬜ Dashboard Analytics

⬜ Archive functionality

⬜ Order hard delete (explicitly **not** current architecture)

⬜ Production transaction / RPC improvements for order creation

⬜ Full idempotency protection

⬜ SEO / production hardening
