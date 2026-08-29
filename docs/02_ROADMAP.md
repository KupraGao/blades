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
Cart Item Selection + Checkout Success thumbnails — see latest changelog).

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

## 🚀 Immediate Next

### S7A — Payments Foundation (DB)

⬜ Execute the approved additive `orders` payment-column SQL (S7A), then
  verify schema/data on the live DB

- Inspected / SQL proposal approved — **not** executed yet
- No payment columns in DB yet; no payment source-code changes; no migration
  file created
- Provider integration / checkout payment capture — later S7 steps (not started)

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

⬜ Shipping pricing

⬜ Payments (S7) — S7A DB foundation SQL approved but **not** executed yet

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
