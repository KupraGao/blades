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

See `docs/06_CHANGELOG.md` for version history (S6 Customer Ownership complete;
S7A payment columns + S7B-1 delivery minimum — see latest changelog).

---

## ✅ S6 Customer Ownership — COMPLETE

- ✅ **S6A** Order Ownership Foundation (`orders.user_id` nullable FK)
- ✅ **S6B** Customer Auth + Account UI (register/login/logout, `/account`)
- ✅ **S6C** Secure guest success proof + Guest → Customer claim
- ✅ **S6D** Customer My Orders (owner-filtered list + detail)
- ✅ **S6E** Logged-in checkout auto-ownership (`getAuthUser()` → `user_id`)

Guest checkout remains supported. Ownership is never client- or email-based.
Customer auth is separate from Admin authorization (`admin_users`).

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

**Not** done yet: Checkout payment-method UI, provider integration, webhooks,
payment verification, refunds. Online / pay-at-pickup are DB-allowed values
only — not wired in Checkout yet.

---

## 🚀 Immediate Next

### S7B — Checkout payment method (next)

⬜ Checkout payment-method selection + server capture for allowed values
  (`online` | `pay_at_pickup`), fulfillment-aware rules — **no** COD

- S7A DB columns live; S7B-1 delivery minimum shipped
- Do **not** claim online payments work until provider + verification exist
- Provider / webhooks / refunds — later S7 steps (not started)

### Production hardening (remaining)

⬜ Production DB transaction / RPC for order creation

⬜ Full idempotency protection

⬜ Guest `createOrder` abuse controls (rate limits / CAPTCHA / etc.)

**Auth / Catalog / Customer Ownership closed through S6.** Cart partial-purchase
selection and Checkout Success thumbnails are shipped. Delivery / Pickup
operational workflow remains complete and closed.

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

✅ Linking orders to authenticated users (S6A / S6C claim / S6E auto-attach)

⬜ Roles / Permissions beyond Admin vs Customer (future)

⬜ Customer-side order management (cancel / edit — **not** implemented)

---

## Checkout (future commerce)

⬜ Shipping pricing (beyond free Tbilisi delivery + 150 GEL delivery minimum)

⬜ Payments (S7) — **partial:** S7A DB ✅ + S7B-1 delivery minimum ✅;
  payment-method Checkout UI / provider / webhooks / refunds remaining

⬜ Coupons

⬜ Taxes

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
