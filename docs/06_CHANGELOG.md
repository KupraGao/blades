# 📝 Changelog

## 📖 რა არის ეს ფაილი?

ამ ფაილში ინახება პროექტის განვითარების ისტორია.

ყოველი მნიშვნელოვანი განახლება, ახალი ფუნქცია ან დასრულებული ეტაპი ემატება ახალი ვერსიის სახით.

ეს საშუალებას იძლევა მომავალში ზუსტად ვიცოდეთ რა შეიცვალა და როდის.

---

# Changelog

---

## v1.34.0 — Sale pricing + homepage hero (current)

Working-tree snapshot of completed sale work. Promo CMS is **not** included.

- **Sale foundation (live DB):** `products.price` remains regular/original.
  Nullable `products.sale_price` is the discounted selling price. On sale
  iff `sale_price IS NOT NULL`. CHECK
  `sale_price IS NULL OR (sale_price > 0 AND sale_price < price)` is
  **executed** in Supabase. History file:
  `docs/sql/add-products-sale-price.sql`. No `is_on_sale` /
  `discount_percent` columns. % is derived in
  `src/lib/products/pricing.ts`.
- **Admin:** On Sale checkbox + Sale Price; disable On Sale →
  `sale_price = NULL`; validation `> 0` and `< price`. Desktop pricing
  row: Regular Price | On Sale | Sale Price + derived %. Create/Edit share
  the model. Top Create/Update and bottom submit use the same
  `#product-form` / `handleSubmit` pipeline (image optimization included).
- **Storefront Sale filter:** ფასდაკლება / Sale is virtual
  (`?category=sale` → `sale_price IS NOT NULL`). Legacy Discount category
  membership does not decide sale eligibility. Admin product/bulk category
  pickers hide that category. The Discount **DB row was not deleted**.
- **Presentation:** Product Card / Details / Wishlist show struck regular
  + sale + % when on sale. Cart snapshots effective price for client UI.
- **Checkout authority:** `resolveOrderItems` re-selects `price` and
  `sale_price` from the database and charges the current effective unit
  into `order_items.product_price`. Cart/localStorage is not authoritative.
  Historical orders are not recalculated. `orders.total_price` uses
  resolved lines.
- **Delivery:** 150 GEL threshold unchanged; eligibility uses effective
  subtotal (example: regular 200 / sale 120 → subtotal 120 → delivery
  unavailable). No delivery fee. No COD.
- **Sale Slider #2:** `getSaleSliderProducts()` — `sale_price IS NOT NULL`,
  `created_at` desc, limit 10, no stock filter, no autoplay, no fake
  fillers. Hidden when empty. Product Details links + `ProductPrice`.
  Visible cards: <360px = 1; 360px to below `md` = 2; `md` to below
  `lg` = 3; `lg+` = 1 (narrow column beside Promo). Latest Products
  carousel is unchanged.
- **Promo Slider #1 frame only:** `PromoSlider` + `HomepageHeroSliders`
  (`lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]`; always the HeaderExtras
  296px filter slot on `lg`). No banner table, upload, Admin CMS, real
  slides, or autoplay.

---

## v1.33.2 — Homepage Promo + Sale row alignment

- Promo + Sale row always shares HeaderExtras Search/Filter geometry
  (`container-page` + 296px filter slot on `lg`), including when Filters
  are collapsed. Grid mins are `minmax(0, …)` so the row cannot outgrow
  its parent.
- Mobile Sale slider content is two bands (image + title / price +
  details + nav). Still one product per slide.

---

## v1.33.1 — Homepage Promo + Sale hero row

- `PromoSlider` visual frame only (no banner data, no arrows, no CMS).
- `HomepageHeroSliders` desktop row: Promo (wide) + Sale (narrow),
  `lg:grid-cols-[minmax(0,2.3fr)_minmax(280px,1fr)]`, equal height via
  grid stretch. Mobile stacks Promo → Sale.
- Zero sale products: Sale column omitted; Promo uses full width.
- Sale query/pricing and Latest Products carousel unchanged.

---

## v1.33.0 — Homepage Sale Products slider

- Compact homepage Sale slider (`SaleProductsSlider`) above Latest Products.
- Server fetch: `sale_price IS NOT NULL`, `created_at` desc, limit 10.
  Not Discount category membership. Hidden when there are no sale products.
- Reuses existing Embla + `ProductPrice` helpers. No autoplay. No Promo
  Slider #1 / banner CMS. Latest Products carousel unchanged.
- Temporary compact width; `HomepageHeroSliders` is ready for a future
  70/30 Promo + Sale layout.

---

## v1.32.1 — Virtual sale filter + Admin product save UX

- Storefront "ფასდაკლება / Sale" is a virtual catalog filter:
  `?category=sale` → `sale_price IS NOT NULL`. No longer uses
  `product_categories` membership of the obsolete Discount category.
  Categories have **no slug**; the old row is identified by name only
  (`ფასდაკლება` / Discount or Sale). That DB category was **not** deleted.
- Admin Product Create/Edit (and bulk Change Categories) hide the obsolete
  Discount checkbox. A later product save drops leftover Discount
  relationships because category rows are replaced from submitted
  checkboxes; other selected categories are preserved.
- Product form: top Create/Update control shares the same form +
  `handleSubmit` pipeline as the bottom button (image optimization
  included). Sticky on `lg+` only.
- Restrained sale price UI spacing (admin cluster, card, cart, checkout).
  Checkout authority, ₾150 rule, and homepage sliders unchanged.

---

## v1.32.0 — Product sale price foundation

- `products.sale_price` nullable optional discounted selling price; `price`
  remains the regular/original catalog price. No `is_on_sale` boolean.
  Existing catalog category named Discount is **not** the pricing source of
  truth and was left unchanged.
- CHECK: `sale_price IS NULL OR (sale_price > 0 AND sale_price < price)`.
  SQL: `docs/sql/add-products-sale-price.sql` — **manual Supabase SQL Editor**;
  not auto-applied by the app. Existing rows stay `sale_price = NULL`.
- Effective selling price: `sale_price` when valid/present, otherwise
  `price`. Helpers: `src/lib/products/pricing.ts`. Discount % is derived,
  not stored.
- Admin Product Form: On Sale checkbox (UX only) + Sale Price; unchecked
  submits `sale_price = null`. App validation rejects equal/higher/`<= 0`
  sale prices.
- Storefront ProductCard / Product Details / Wishlist / Cart display sale
  vs regular. New cart additions snapshot **effective** price. Checkout
  `resolveOrderItems` selects `sale_price` and charges the current DB
  effective unit price into `order_items.product_price`. Historical orders
  are unchanged snapshots.
- ₾150 delivery threshold unchanged; eligibility uses effective subtotal
  (server authoritative).
- Catalog min/max filter and price sort still use `products.price`
  (regular). Effective-price filter/sort needs a generated column or RPC —
  follow-up. Homepage Sale Slider and Promo Banner CMS **not** in this
  version.

---

## v1.31.0 — Customer Profiles + Account Auth UX + Admin Users

### `public.profiles` (live DB — manual SQL Editor; no in-repo migration)

- Table: `id` → `auth.users(id)` `ON DELETE CASCADE`; `full_name`; `phone`;
  timestamps
- Auth remains source of truth for identity / email / password / session /
  confirmation; profiles for customer name/phone
- Existing users backfilled from `raw_user_meta_data`; AFTER INSERT signup
  trigger; BEFORE UPDATE `updated_at`; RLS: own SELECT/UPDATE only
- `orders.user_id` still → `auth.users`; `orders.customer_*` stay snapshots;
  `admin_users` = Admin authz only (not customer registry)

### Customer Account / Auth UX

- `/account` reads profiles for name/phone (metadata fallback if row missing);
  customer self-edit via anon SSR + RLS (no service role / no metadata write)
- Password visibility on Login/Register; Forgot Password + recovery callback
  + Reset Password; logged-in Change Password (current-password proof)
- Login: Sign In / Create Account / Continue as guest; logout →
  `?signedOut=1` feedback; browsing remains Auth-optional; Guest checkout
  unchanged

### Admin Users (read-only)

- `/admin/users` list/search/pagination (20); `/admin/users/[id]` detail +
  owned Order History (`user_id` only)
- `requireAdmin` + `createAdminClient`; safe DTOs; Eye + View actions

### Intentionally deferred

- Customer email change; Admin edit/delete/ban/invite; Admin password or
  role management

S7 Payments milestone remains **partial** (provider next).

---

## v1.30.0 — Storefront Brands

### Brands directory + Brand PLP

- Public `/brands` directory: responsive BrandCard grid (name, optional logo
  / first-letter fallback, product count; zero-product Brands included;
  navigate by slug)
- Brand PLP `/brands/[slug]`: exact-slug resolve (0 or >1 matches → not found
  / fail closed) → fixed server `brandId` → Category + Price Filters → exact
  filtered count → **20**/page; reuses `ProductCard`, `CatalogPagination`,
  `CategoriesSidebar`
- Brand scope from pathname only (no `brandId` query param); URL filters:
  `category` / `minPrice` / `maxPrice` / `page`; Clear keeps Brand path;
  filter change → `page = 1`
- Directory counts via nested `products(count)` (no N+1; no new RPC)
- Shared shop-layout toolbar: `/` + Brand PLP → Filters + Search + Help;
  `/brands` → Search + Help only; Filters slot collapses/expands on route
  change; Search width follows route capability (not sidebar open/closed)
- Desktop sidebar defaults: Home OPEN; Brand PLP CLOSED
- Controlled motion: Home Latest Products **title** only; Brand PLP Brand
  **identity header** only (`lg:ml-[272px]`); product grids stay stationary
- KA/EN labels; KA `{count} პროდუქტი`; EN `1 product` / `{count} products`
- Empty states: Brand-empty vs catalog no-match when filters active
- Nav: Header / mobile / Footer Brands → `/brands`; desktop active on
  `/brands` and `/brands/*`
- Separate from Admin Brands CMS; Home catalog semantics unchanged
- Supporting fixes: Header narrow-viewport rail guarded `setRailVisible`
  (avoids max-update-depth); Header/Footer Next/Image aspect-ratio warning
  corrected; root `<html data-scroll-behavior="smooth">`
- **Not** included: schema / migration / RPC / RLS / new dependency;
  `brands.slug UNIQUE` not claimed; logo Storage upload / new bucket;
  payment provider (S7 remains partial)

### Validation

- `git diff --check` → PASS
- `npm run build` → PASS (Next.js 16.2.4)
- Production build includes `/brands` and `/brands/[slug]`

---

## v1.29.0 — Home Catalog Filters + Server-Side Pagination

### Storefront Featured Catalog

- Filters control (`Filters` / `ფილტრები`): Category + Price (AND) against the
  **full** matching catalog before pagination
- Server-side filters via extended `getProducts` (category ID, min/max price,
  exact filtered count, `.range`); page size **20**
- URL state: `category`, `minPrice`, `maxPrice`, `page` (refresh / Back /
  Forward); stable category ID; KA/EN display names only
- Clear Filters + active filter count; filter change resets `page = 1`
- GEL / `₾` price controls (compact Min/Max); no USD / conversion
- Latest Products separated: independent `limit: 10` query — not affected by
  catalog Filters or page
- Desktop + mobile Filters UI polish (shared URL state); panel `w-64` /
  Latest heading alignment preserved
- Helpers: `catalog-search-params.ts`, `CatalogPagination.tsx`
- **Not** included: schema / migration / RPC / new dependency; payment
  provider integration unchanged (S7 remains partial)

---

## v1.28.0 — S7B Checkout Payment Method Integration

### S7B — payment method selection + server enforcement

- Checkout payment UI: `online` | `pay_at_pickup` (**no** COD / cash_on_delivery)
- Delivery → Online only; Pickup → Online or Pay at Pickup; default `online`
- Fulfillment sync: Pickup + Pay at Pickup → Delivery forces `online`
- Server `validateOrder` + `payment-rules` reject invalid combos / unknown
  methods **before** order insert, order_items insert, or stock decrement
- Persists `payment_method`; server-authoritative `payment_status = unpaid`
  for all current valid combinations (online ≠ charged)
- Verified: manual Checkout flows; Supabase `pay_at_pickup` + `unpaid`;
  negative `validateOrder` tests (`delivery + pay_at_pickup`,
  `cash_on_delivery`); `git diff --check` + `npm run build` passed
- **Not** included: provider / bank charge, webhooks, auto-`paid`, refunds

S7 Payments milestone remains **partial** (S7A + S7B-1 + S7B; provider next).

---

## v1.27.0 — Product Card responsive polish

### Product grid + add-to-cart feedback

- Home product grid: mobile `gap-x-3 gap-y-4`; `sm+` retains `gap-6`;
  column breakpoints unchanged
- Add-to-Cart float feedback: mobile wrap / constrained width so KA text and
  checkmark remain readable inside the card; `sm+` compact nowrap
- ProductCard `overflow-hidden` unchanged; no cart/stock logic change

---

## v1.26.0 — Account → Admin Panel shortcut

### Account Admin navigation

- Authenticated `/account` shows an **Admin Panel** button only when the
  signed-in user is an authorized active administrator
- Server page derives `isAdmin` via existing `getAuthorizedAdmin()` and passes
  a boolean to `AccountOverview` (no admin object exposed to the client)
- Button links to `/admin`; normal customers do not see it
- Placement: page header (beside “My Account”), not inside the Profile card
- Responsive: content-sized control (`w-fit` / `self-start`); does not stretch
  full width on mobile
- UI/navigation only — does **not** grant permissions; `/admin` remains
  protected by existing admin authorization
- No database / schema changes

---

## v1.25.0 — S7A Payments DB + S7B-1 Delivery Minimum

### S7A — Payments Foundation (DB)

- Production `public.orders` additive payment columns verified live
- `payment_method` TEXT NULL — allowed non-null: `online` | `pay_at_pickup`
  (**no** `cash_on_delivery` / COD)
- `payment_status` TEXT NOT NULL DEFAULT `unpaid` — `unpaid` | `pending` |
  `paid` | `failed` | `refund_pending` | `refunded`
- Also live: `payment_provider`, `payment_transaction_id`, `paid_at` (all nullable
  except status)
- Both payment CHECK constraints verified in Production
- Historical test orders: method NULL, status unpaid, metadata NULL
- Order status and payment status remain independent lifecycles
- **Not** included: Checkout payment-method UI, provider integration,
  webhooks / payment verification, refunds

### S7B-1 — Delivery Minimum Enforcement

- Delivery requires selected checkout subtotal ≥ 150 GEL
- Under 150: delivery disabled; pickup available; localized messaging;
  delivery selection switches to pickup (address cleared)
- ≥ 150: delivery available; free delivery in Tbilisi; **no** delivery fee
- Client: `selectedCartTotal` + fulfillment UI gating
- Server: authoritative resolved DB prices in `createOrder`; rejects delivery
  under 150 **before** order insert, order-items insert, or stock decrement
- Shared constant / helper: `src/lib/orders/delivery-rules.ts`
- Cart Item Selection, ownership, stock, and fulfillment architecture preserved
- **Not** included: payment-method Checkout UI

S7 Payments milestone remains **partial** (S7A + S7B-1 only).

---

## v1.24.0 — Cart Item Selection / Partial Purchase

### Cart selection

- `CartItem.selected` persisted in `localStorage` with the cart
- New items default `selected: true`; legacy lines without `selected` normalize
  to `true`
- Header Cart Drawer: per-item checkbox (bottom-right), Select All, selected
  total; trash remains top-right
- Header badge still counts **all** cart quantities
- `/cart` displays only currently selected lines (deselected remain in cart)
- Checkout summary + `createOrder` use selected items only; zero selected
  cannot proceed
- Successful order removes only purchased product ids; deselected lines remain
- Failed order leaves cart unchanged
- Stock still decrements only server-side in successful `createOrder`

### Note (superseded by v1.25.0)

- At v1.24.0 release time, S7A payment columns were still proposed-only;
  see v1.25.0 for Production-verified S7A + S7B-1

---
## v1.23.0 — Checkout Success thumbnails + Production env alignment

### Checkout Success product thumbnail

- Success page reuses Account order-item display mapping (`mapOrderItemProductDisplay`
  / product row) for thumbnails and optional live product links
- Historical `order_items` title/price/qty still authoritative; missing live
  product falls back safely (placeholder / no link)

### Production environment (Vercel)

- Production env vars aligned to the same Supabase project as local
- Required names (values never documented): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`, `ORDER_ACCESS_SECRET`
- Verified on Production: checkout, success order data, success thumbnails

---

## v1.22.0 — S6E + S6 COMPLETE

### Logged-in Checkout Auto-Ownership (S6E)

- `createOrder` resolves owner via `getAuthUser()` on the server only
- Authenticated Customer → `orders.user_id = auth user.id`
- Guest → `orders.user_id = null` (unchanged guest proof + claim path)
- `CreateOrderInput` does **not** accept `user_id`; never from client payload
- Success page: owned orders show saved-to-account message + link to
  `/account/orders/{orderId}`; no claim button
- Guest claim security and Customer My Orders filters unchanged

### S6 Customer Ownership — COMPLETE (S6A–S6E)

Verified end-to-end: Guest checkout + proof + claim; Customer auth/account;
My Orders ownership filters; authenticated checkout auto-attach; second
Customer cannot open another Customer’s order UUID; Admin orders untouched.

**Not** included in S6 (remain future): Payments (S7), Refunds, Customer
cancellation, Order Confirmation email notifications.

#### Manual validation (S6D + S6E)

- Own Customer order appears in My Orders; detail opens correctly
- Product thumbnail / storefront link presentation works
- Account list + detail share the authenticated Account layout width
- Second Customer opening another Customer’s order UUID → Order not found
- Authenticated checkout attaches new order; success shows saved-to-account
- New authenticated order appears in My Orders without claim
- Guest checkout, login/register, and claim remain available after S6E

---

## v1.21.0 (uncommitted) — S6D

### Customer My Orders

- Authenticated Customers can list and open **only** their own orders
- `getCustomerOrders` / `getCustomerOrder`: `getAuthUser()` then privileged
  read filtered by `user_id = auth user.id` (detail also filters by `id`)
- Routes: My Orders on `/account`; detail `/account/orders/[orderId]`
- Shared authenticated Account layout (`(authenticated)/layout.tsx`)
- List/detail show order number, status, fulfillment, date, total, line
  items with quantity; thumbnails; link to `/products/{id}` when product
  still exists; historical title/price/qty from `order_items` snapshot;
  deleted product remains visible; missing image → `/placeholder.png`
- Read-only Customer UI; no Admin controls; no email ownership; no client
  `user_id`
- Guest proof success + Admin order access unchanged

---

## v1.20.0 (uncommitted) — S6C Step 2

### Guest Order → Customer Account Claim

- `claimGuestOrder(orderId)` requires authenticated Customer (`getAuthUser`)
  **and** valid order-access proof for that exact order
- Race-safe ownership: `UPDATE … SET user_id = auth.id WHERE id = … AND user_id IS NULL`
- Idempotent if already owned by claimant; deny if owned by another user
- Never authorizes by email alone; never accepts client `user_id`
- Checkout success: sign-in/register CTAs (Guest) or claim button (authenticated)
- Safe internal `?next=` return path for login/register/email callback
- *(My Orders / logged-in auto-attach landed in S6D / S6E)*

#### Manual security validation (passed)

- Guest order `#10029` created; success showed Login/Register claim CTA
- Login/Register preserved success return path (`?next=`)
- Authenticated user claimed the Guest order; `orders.user_id` populated in Supabase
- Second authenticated account could **not** take ownership; original `user_id` unchanged
- Incognito / UUID-only access → Order not found; no PII exposed
- Admin order access still works

---

## v1.19.0 (uncommitted) — S6C Step 1

### Secure Guest Success Access + Admin Order Read Hardening

- UUID alone no longer grants guest checkout success / order PII access
- After successful `createOrder`, server issues short-lived httpOnly HMAC
  proof cookie (`ORDER_ACCESS_SECRET`, 24h, bound to exact `orderId`)
- Checkout success: `getGuestSuccessOrder` (proof required)
- Admin order detail: `getAdminOrder` (`requireAdmin()` before privileged read)
- Removed ungated shared `getSingleOrder` UUID-only PII reader
- *(Claim / My Orders / logged-in attach landed in S6C Step 2 / S6D / S6E)*
- Required server-only env: `ORDER_ACCESS_SECRET` (never `NEXT_PUBLIC_*`;
  not the Supabase service-role key)

---

## v1.18.0 (uncommitted)

### Customer Authentication + Account UI (S6B)

- Customer Register / Login / Logout via Supabase Auth (anon server client)
- Register fields: Full Name, Phone, Email, Password, Confirm Password
- Name/phone originally stored in Auth `user_metadata` (`full_name`, `phone`)
  — **superseded** for application reads/writes by `public.profiles`
  (see **v1.31.0**); register still seeds metadata for the signup trigger
- Routes: `/account/login`, `/account/register`, protected `/account`
- Auth callback: `/auth/callback` (PKCE code exchange for email confirmation;
  recovery divert to `/account/reset-password` added in **v1.31.0**)
- Account overview: name, email, phone, logout
  (name/phone reads moved to `profiles` in **v1.31.0**)
- Email-confirmation UX is truthful (required vs session-created)
- Login surfaces unconfirmed-email distinctly
- Admin login/authorization semantics unchanged
- *(My Orders / claim / ownership attach landed in S6C–S6E)*

#### Future (documented only — not implemented)

- Order Confirmation email for every successful order (Guest and Customer),
  independent of Customer Account existence

#### Manual Supabase Dashboard configuration (NOT verified in-repo)

Required for email-confirmation flow to work end-to-end (app cannot set these):

1. **Authentication → URL Configuration → Site URL**
   - Local: `http://localhost:3000` (or your dev origin)
   - Production: your live site origin
2. **Authentication → URL Configuration → Redirect URLs** must allow:
   - `http://localhost:3000/auth/callback`
   - production `https://<your-domain>/auth/callback`
   - optional with query: `.../auth/callback?next=/account` (or wildcard per Supabase rules)
3. **Authentication → Providers → Email**
   - Confirm whether “Confirm email” is enabled (explains no-session on signUp)
4. **Auth email delivery**
   - Default Supabase mail has rate limits; custom SMTP recommended for reliable delivery
   - Delivery of confirmation emails was **not** verified during S6B

Optional local workaround while testing: disable “Confirm email” in Dashboard
(then `signUp` returns a session and redirects to `/account`). Do not assume
production will disable confirmation.

---

## v1.17.0

### Order Ownership Foundation (S6A) ✅

- Live DB: `public.orders.user_id UUID NULL`
  → `REFERENCES auth.users(id) ON DELETE SET NULL`
- Index: `orders_user_id_not_null_idx` (`WHERE user_id IS NOT NULL`)
- App: `orderMapper` / `insertOrder` explicitly support `user_id: string | null`
- Guest Checkout continues to insert `user_id = null` (server-controlled)
- Existing orders remain Guest Orders (`user_id` NULL); **not** backfilled by email
- `CreateOrderInput` does **not** accept client ownership

#### Follow-on (completed in S6B–S6E)

- Customer Auth / Register / Login (S6B)
- Secure guest order claim / success PII fix (S6C)
- My Account / My Orders (S6D)
- Logged-in checkout auto-attach (S6E)

---

## v1.16.0

### Catalog Security Hardening (S5) ✅

#### App (Phase 1)

- Admin Catalog mutations use
  `requireAdmin()` → `createAdminClient()` → `service_role`
- Public catalog reads remain on `createClient()` (anon/session)

#### Database / Storage (Phase 2)

- Public Catalog WRITE privileges removed from `anon` and `authenticated`
  for `products`, `brands`, `categories`, `product_categories`,
  `product_images` (SELECT retained)
- `service_role` retains required Catalog CRUD
- RLS **ON** for those five catalog tables
- Dangerous public WRITE policies removed (brands public INSERT/UPDATE/DELETE;
  product_images public DELETE)
- Storage `product-images`: public READ retained; anonymous upload/write
  removed

#### Verification

- Threat checks: anon/authenticated Catalog INSERT blocked; anon Storage
  upload blocked; storefront reads + Admin CMS CRUD + image upload work
- Secret-exposure audit: no privileged key via `NEXT_PUBLIC_*`; no
  privileged imports in `"use client"`; Catalog mutations authorize before
  privileged work
- `tsc --noEmit` + production build passed

#### Explicitly not included / remaining

- Orders / Checkout security review (separate next step)
- Guest-safe `getSingleOrder` redesign
- Guest `createOrder` abuse controls
- Customer Auth / OAuth

---

## v1.15.0

### Privileged Server Action Protection (S4) ✅

- `requireAdmin()` (`src/lib/auth/require-admin.ts`) — fail-closed gate over
  `getAuthorizedAdmin()`; generic `"Unauthorized"` only (no authz leakage)
- Independently callable ADMIN_ONLY Server Actions now authorize before work:
  product create/update/delete/bulk/images, brand CRUD mutations, category
  CRUD mutations, order status/cancel/return/fulfillment, and `getOrders`
- Order mutation result contracts preserved
  (`{ success: false, error: "Unauthorized." }` when denied)
- Intentionally ungated: `createOrder`, `getSingleOrder`, Auth login/logout,
  public catalog reads (`getProducts` / brands / categories getters)

#### Explicitly not included / remaining

- Catalog GRANT / RLS hardening — completed in v1.16.0 (S5)
- `product-images` Storage policy hardening — completed in v1.16.0 (S5)
- Guest-safe `getSingleOrder` redesign (dual-use Admin + checkout success)
- Guest `createOrder` abuse controls
- Customer Auth / OAuth
- Orders / Checkout security review (separate next step)

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

- `requireAdmin()` on privileged Server Actions (**S4**) — completed in v1.15.0
- Catalog anon write / RLS hardening — completed in v1.16.0 (S5)
- Customer Auth / OAuth
- Orders / Checkout security review (separate next step)

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