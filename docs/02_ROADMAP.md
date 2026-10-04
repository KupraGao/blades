# 🚀 Ecommerce Advanced Roadmap

## 📖 რა არის ეს ფაილი?

ამ ფაილში ინახება პროექტის გრძელვადიანი განვითარების გეგმა.

აქ იწერება ყველა დიდი ფუნქცია, რომელიც მომავალში უნდა დაემატოს.

როდესაც რომელიმე ფუნქცია დასრულდება, ის წაიშლება Roadmap-იდან და გადავა Foundation-ში ან Changelog-ში.

---

# 🚀 Ecommerce Advanced Roadmap

---

## ✅ Completed (moved out of active roadmap)

- Product Search
- Product Filters (Brand / Category / Stock)
- Product Sorting
- Product Pagination
- Product Page Size
- Bulk Actions (products)
- Responsive Admin CMS
- Orders Backend Foundation
- Admin Orders List
- Checkout → Orders Integration (secure createOrder + stock)
- Order Confirmation (clear cart, success page, redirect with orderId)
- Cart Item Selection / partial purchase (persisted `selected`; Drawer
  checkboxes; `/cart` + Checkout use selected lines only; partial cart
  cleanup after success)
- Checkout Success product thumbnails (reuse Account order item display mapping)
- Admin Orders Management (details, status workflow, transactional cancel, UX polish)
- Admin Orders List Management
  (server-side search / filters / sort / pagination / URL state / KA/EN)
- Customer-facing Order Number
  (`orders.order_number` + sequence; Admin + confirmation display/search)
- Delivery / Pickup System
  (Checkout fulfillment, Pickup + Delivery workflows, Delivery Failed,
  Retry Delivery, Returned to Store + transactional stock restore)
- Home storefront catalog Filters + server-side pagination
  (Category + Price AND; URL state; 20/page; Latest Products independent)
- Storefront Brands
  (`/brands` directory + `/brands/[slug]` Brand PLP; Brand-scoped catalog
  Filters; shared Search/Help/Filters toolbar; KA/EN counts)
- Customer Profiles + Account Auth UX
  (`public.profiles`; `/account` profile edit; password show/hide;
  forgot/reset + logged-in change password; Login guest paths)
- Admin Users (read-only)
  (`/admin/users` list + `/admin/users/[id]` detail + owned Order History)
- Sale Price foundation (`products.price` regular; nullable `sale_price`;
  on sale iff `sale_price IS NOT NULL`; executed production CHECK)
- Effective-price helpers + storefront / cart / checkout integration
  (checkout `resolveOrderItems` is authoritative; cart snapshot is not)
- Virtual storefront Sale filter (ფასდაკლება → `sale_price IS NOT NULL`)
- Admin Sale management (On Sale + Sale Price; derived %; Create/Edit)
- Homepage Sale Products Slider #2 (`sale_price IS NOT NULL`; not category)
- Promo Slider #1 CMS **live** (`promo_banners` + `promo-banners` bucket +
  `/admin/promos`; SQL executed)
- Storefront UI / typography polish (ProductCard proportions; radius
  hierarchy; single gold section headings; local Georgian fonts;
  language-aware KA/EN body vs display; product-tile + primary-nav
  display pairing)
- Home Latest YouTube Videos (official Bladesge Atom feed; latest 3;
  persistent Supabase snapshot fallback; no API key / CMS;
  thumbnail-first inline player)
- Contact form (public `/contact` + `submitContactMessage` + Resend to
  `STORE_CONTACT.email`; not stored in DB; **not** Order Confirmation Email)
- Storefront light-theme chrome polish (body `#eeeeee`; Footer
  `bg-zinc-200`; Header/Footer responsive logo badges; Filters `248×40`;
  Search `h-10`; HeaderExtras slot `272px`; desktop active nav)
- ProductCard 4:3 image + content-area hover thumbs; PDP gallery
  responsive thumbs (horizontal `< lg`, left rail `lg+`; mouse zoom kept)

See `docs/06_CHANGELOG.md` for version history (S6 Customer Ownership complete;
S7A–S7B payment-method path + S7B-1 delivery minimum — see latest changelog;
Home catalog Filters + pagination; Storefront Brands; Customer Profiles +
Admin Users — see latest changelog).

---

## ✅ S6 Customer Ownership — COMPLETE

- ✅ **S6A** Order Ownership Foundation (`orders.user_id` nullable FK)
- ✅ **S6B** Customer Auth + Account UI (register/login/logout, `/account`)
- ✅ Customer Profiles (`public.profiles` + Account edit of name/phone;
  password visibility / forgot-reset / logged-in change password; Login UX)
- ✅ Admin Users read-only (`/admin/users` + `/admin/users/[id]` + owned
  Order History via `orders.user_id`)
- ✅ **S6C** Secure guest success proof + Guest → Customer claim
- ✅ **S6D** Customer My Orders (owner-filtered list + detail)
- ✅ **S6E** Logged-in checkout auto-ownership (`getAuthUser()` → `user_id`)
- ✅ Authorized admins can open Admin Panel from `/account` (UI shortcut only;
  `getAuthorizedAdmin()`; `/admin` protection unchanged)

Guest checkout remains supported. Ownership is never client- or email-based.
Customer auth is separate from Admin authorization (`admin_users`).
`admin_users` is **not** a customer registry.

---

## ✅ S7 progress (partial — Payments milestone not complete)

- ✅ **S7A** Payments Foundation (DB) — Production-verified additive columns on
  `orders`: `payment_method` (NULL | `online` | `pay_at_pickup`; **no**
  `cash_on_delivery`), `payment_status` (default `unpaid`),
  `payment_provider`, `payment_transaction_id`, `paid_at`. Historical rows:
  method NULL, status unpaid. Order status ≠ payment status.
- ✅ **S7B-1** Delivery Minimum Enforcement — delivery only when selected
  checkout subtotal ≥ 150 GEL; under threshold pickup only + localized
  message; free delivery in Tbilisi (no fee). Client uses `selectedCartTotal`;
  server enforces on authoritative resolved prices before inserts / stock
  decrement.
- ✅ **S7B** Checkout Payment Method Integration — Checkout selects
  `online` | `pay_at_pickup` with fulfillment rules (Delivery → online only;
  Pickup → online or pay_at_pickup). Server `validateOrder` rejects invalid
  combos / unknown methods **before** order insert, items insert, or stock
  decrement. Persists `payment_method`; server sets `payment_status = unpaid`
  for all current combinations. **No** COD. Online = method selection only
  (not a real charge).
- ✅ **S7C-4** Targeted Payment Implementation Inspection — complete
  (read-only mapping of checkout / stock / payment fields).
- ✅ **S7C-5** Payment Persistence Foundation — **LIVE** nullable
  `orders.payment_provider_order_id` TEXT (SQL Editor executed).
  Provider payment/order-request id (BOG `order_id`).
  `payment_transaction_id` remains the final transaction id. Checkout
  runtime unchanged.
- ✅ **S7C-6** BOG Authentication + Payment Initiation Foundation —
  server-only `src/lib/payments/bog/` (OAuth + Create Order helper).
  Checkout is **not** wired; no redirect, callback, or DB write.

**Not** done yet: Checkout BOG redirect, webhooks, payment
verification, automatic `paid`, refunds. Provider **selected** (Bank of
Georgia / OPAY); no live charge yet.

---

## 🚀 Immediate Next

Review S7C-6 foundation before Checkout wiring. Do **not** treat browser
return as `paid`. Callback / refunds / automatic `paid` remain later.

### Production hardening (remaining)

⬜ Production DB transaction / RPC for order creation

⬜ Full idempotency protection

⬜ Guest `createOrder` abuse controls (rate limits / CAPTCHA / etc.)

**Auth / Catalog / Customer Ownership closed through S6.** Customer Profiles +
Account password UX + Admin Users (read-only list/detail) are shipped for the
current User/Account scope. Cart partial-purchase selection and Checkout
Success thumbnails are shipped. Delivery / Pickup operational workflow remains
complete and closed. Home storefront Featured Catalog Filters (Category +
Price, URL state, 20/page server pagination) and independent Latest Products
query are shipped. Storefront Brands directory + Brand PLP (Brand-scoped
Category/Price Filters, shared toolbar) are shipped — see Architecture /
Changelog. Sale pricing, virtual Sale filter, Admin Sale UI, and
homepage Sale Slider #2 are shipped. Promo Slider #1 CMS is **live**
(SQL `docs/sql/create-promo-banners.sql` **executed**). Storefront UI /
typography polish is shipped (visual only; no catalog or payments
behavior change). Home Latest YouTube Videos is shipped (Atom feed,
no Admin/CMS). Payments: S7C-6 BOG auth + Create Order helpers exist
and are **not** wired to Checkout (S7A–S7B + S7C-4/S7C-5 LIVE
`payment_provider_order_id`).

---

## Orders (future)

⬜ Invoice

⬜ Email Notifications — **future requirement (documented):** every successful
  order (Guest or Registered Customer) should send Order Confirmation to
  `customer_email` with order number, items, quantities, total, fulfillment
  method, delivery address when applicable, and initial status. Independent
  of Customer Account. Provider not chosen yet.

⬜ Archive functionality

⬜ Advanced order editing (add/remove products on an existing order)

⬜ Customer returns after successful completion / refunds / exchanges /
  partial returns / RMA — **not** part of Delivery Failed / Return-to-Store

⬜ Courier tracking / shipping carrier integration

⬜ Order hard delete — **not** part of the current architecture
  (completed / cancelled / returned_to_store remain historical records)

---

## Dashboard

⬜ Dashboard Widgets

⬜ Analytics

⬜ Statistics

⬜ Revenue

⬜ Latest Orders

---

## Authentication / Accounts

✅ Login / Register / Logout — Customer (S6B) + Admin (S2)

✅ Protected Admin Routes (S3)

✅ Customer Account + My Orders (S6B–S6D)

✅ `public.profiles` — application source of truth for customer `full_name` /
  `phone` (Auth remains identity / email / password / session)

✅ Customer profile edit (own name/phone); password show/hide; forgot/reset;
  logged-in change password

✅ Admin Users read-only (`/admin/users`, `/admin/users/[id]`, owned orders)

✅ Linking orders to authenticated users (S6A / S6C claim / S6E auto-attach)

✅ Account → Admin Panel shortcut for authorized admins (`/account` → `/admin`;
  UI only; existing admin route protection unchanged)

⬜ Customer email change (**deferred** — not in current scope)

⬜ Admin edit / delete / ban / invite customer; Admin password or role
  management (**deferred** — not required next)

⬜ Roles / Permissions beyond Admin vs Customer (future)

⬜ Customer-side order management (cancel / edit — **not** implemented)

---

## Checkout (future commerce)

⬜ Shipping pricing (beyond free Tbilisi delivery + 150 GEL delivery minimum)

⬜ Payments (S7) — **partial:** S7A DB ✅ + S7B-1 ✅ + S7B ✅ + S7C-4 ✅ +
  S7C-5 `payment_provider_order_id` **LIVE** ✅ + S7C-6 BOG foundation ✅
  (Checkout wiring remaining; **no** COD)

⬜ Coupons

⬜ Taxes

---

## Catalog / Homepage

✅ Sale Price foundation — `price` = regular; `sale_price` nullable
  discounted selling price; on sale iff `sale_price IS NOT NULL`

✅ Effective-price integration — `src/lib/products/pricing.ts`; storefront
  presentation; cart effective snapshot; checkout re-resolves from DB

✅ Storefront Sale filter — ფასდაკლება / Sale is virtual
  (`?category=sale` → `sale_price IS NOT NULL`); not Discount category
  membership

✅ Admin Sale management — On Sale checkbox + Sale Price; derived %;
  desktop one-row pricing cluster; Create/Edit share the same model

✅ Homepage Sale Products Slider #2 — automatic `sale_price IS NOT NULL`;
  no featured-sale flag; Latest Products carousel remains intact

✅ Promo Slider #1 **CMS live** —
  `public.promo_banners` + dedicated `promo-banners` bucket;
  Admin `/admin/promos`; homepage fetch of `is_active = true` ordered by
  `sort_order ASC, created_at ASC`; KA/EN overlay fallback; internal
  `link_url` only; zero banners omit Promo (Sale keeps its area);
  one banner has no carousel controls or autoplay; 2+ reuse Embla with
  loop and ~5s autoplay (pause on hover/focus/hidden tab; reduced-motion
  disables autoplay). `sort_order` is an **internal** field: Admin does
  not type it; new banners append; delete reindexes remaining rows to
  `1..N` (inactive rows stay in canonical Admin order; edit preserves
  position). Title/subtitle remain optional (image-only posters valid).
  SQL `docs/sql/create-promo-banners.sql` is **executed**.

✅ Catalog min/max (storefront) and Admin `price-asc`/`price-desc` use
  live generated `products.effective_price` (`COALESCE(sale_price, price)`)
  plus `products_effective_price_idx`. SQL
  `docs/sql/add-products-effective-price.sql` is **executed** (history;
  app never auto-applies). Storefront has no customer-facing price-sort UI.

✅ Storefront UI / typography polish — ProductCard spacing and square
  image area; storefront radius hierarchy; one gold heading per homepage
  product section (EN uppercase via CSS); local Georgian fonts
  (Glaho body, Nino display) with Inter / Barlow Condensed for EN;
  product-tile names and primary Header nav use the display pairing.
  Queries, pricing, Promo CMS, Sale Slider behavior, Cart, Checkout,
  Auth, and Admin business logic are unchanged.

✅ Home Latest YouTube Videos — official channel Atom feed
  (`UCV4ORvOeTcfirolaMQ5P86w`) is the primary source; server fetch +
  30-minute revalidation + 8000ms timeout; latest 3 videos on Home;
  no YouTube Data API / API key. Persistent fallback table
  `public.youtube_latest_videos_cache` (singleton `bladesge`; SQL
  `docs/sql/create-youtube-latest-videos-cache.sql` **executed**).
  RSS 404 / timeout / empty parse uses the last successful snapshot.
  Replaced the starter `PromoBanner` block. Promo Slider #1 CMS is
  unchanged.

✅ Storefront light-theme chrome + Contact form — body `#eeeeee`; Footer
  `bg-zinc-200`; Header/Footer white logo badges (Light black border /
  Dark transparent; Header `145 / 175 / 220`; Footer `150 / 180 / 230 /
  240`); Filters `248×40`; Search `h-10`; HeaderExtras slot `272px`;
  desktop gold active nav (Home / Products / Brands / Contact). Public
  `/contact` + Resend (`submitContactMessage`); no DB write; **not**
  Order Confirmation Email.

✅ ProductCard + PDP gallery image UX — ProductCard MAIN `aspect-[4/3]`
  `object-cover`; hover thumbs on content overlay (slide-down); per-image
  zoom `scale-100` → `scale-[1.07]`. PDP `< lg` horizontal thumbs below
  MAIN; `lg+` `4rem` rail left of MAIN (not overlay); PDP grid
  `max-w-[1352px]`. `sort_order` / `is_main` / mouse-position zoom /
  Next/Image warnings unchanged.

---

## Production

⬜ SEO

⬜ Metadata

⬜ Sitemap

⬜ Robots.txt

⬜ Open Graph

⬜ Loading

⬜ Error Pages

⬜ Performance

⬜ Deployment

⬜ Production DB transaction / RPC for order creation

⬜ Full idempotency protection
