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
- Admin Orders Management (details, status workflow, transactional cancel, UX polish)
- Admin Orders List Management
  (server-side search / filters / sort / pagination / URL state / KA/EN)
- Customer-facing Order Number
  (`orders.order_number` + sequence; Admin + confirmation display/search)
- Delivery / Pickup System
  (Checkout fulfillment, Pickup + Delivery workflows, Delivery Failed,
  Retry Delivery, Returned to Store + transactional stock restore)

See `docs/06_CHANGELOG.md` for version history (latest: **v1.12.0** —
Delivery / Pickup + Delivery Failed + Returned to Store).

---

## 🚀 Immediate Next

### Production / Auth hardening (suggested)

✅ Authentication foundation (S2A) + explicit Admin authorization (S2B)

✅ Protected Admin Routes (S3)

✅ Privileged Server Action authorization / `requireAdmin` (S4)

✅ Catalog Security Hardening (S5) — DB GRANT/RLS + Storage + privileged
  Admin Catalog write path (`requireAdmin` → `createAdminClient`)

✅ Order Ownership Foundation (S6A) — `orders.user_id` nullable FK;
  guest inserts remain `user_id = null`

⬜ Customer Auth / Account UI (S6B) — implementation ready for manual retest;
  requires Supabase Dashboard email/redirect configuration (see CHANGELOG)

⬜ Secure guest order claim / My Orders (S6C–S6E)

⬜ Production DB transaction / RPC for order creation

⬜ Full idempotency protection

**Catalog Auth / Security sprint closed through S5.** Delivery / Pickup
operational workflow remains complete and closed. Orders / Checkout
security review is a separate remaining step.

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

⬜ Login

⬜ Register

⬜ Roles

⬜ Permissions

⬜ Protected Admin Routes

⬜ Customer Account

⬜ My Orders

⬜ Linking orders to authenticated users

⬜ Customer-side order management

---

## Checkout (future commerce)

⬜ Shipping pricing

⬜ Payments

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
