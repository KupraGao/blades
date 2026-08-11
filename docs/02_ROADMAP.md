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

See `docs/06_CHANGELOG.md` for version history (latest: **v1.10.0** —
Admin Orders polish + Admin KA/EN + deterministic dates).

---

## 🚀 Immediate Next

### Delivery / Pickup System

⬜ Checkout: customer chooses fulfillment method

⬜ Courier Delivery path (delivery address required)

⬜ Pickup path (no delivery address required)

⬜ Persist fulfillment method on the order

⬜ Admin Order Details shows fulfillment method / related info

⬜ Delivery status workflow:
`pending → confirmed → processing → shipped → completed`

⬜ Pickup status workflow:
`pending → confirmed → processing → ready_for_pickup → completed`

⬜ Controlled cancellation rules remain enforced

**Not started.** Do not treat Delivery / Pickup as completed.
Existing Admin Orders status workflow remains the current baseline.

---

## Orders (future)

⬜ Invoice

⬜ Email Notifications

⬜ Archive functionality

⬜ Advanced order editing (add/remove products on an existing order)

⬜ Order hard delete — **not** part of current architecture
  (completed / cancelled remain historical business records)

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
