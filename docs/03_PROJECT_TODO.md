# 🚧 Current Sprint

## 📖 რა არის ეს ფაილი?

ამ ფაილში იწერება მხოლოდ მიმდინარე სამუშაო.

ეს არის ყოველდღიური TODO სია, სადაც ჩანს კონკრეტულად რაზე მუშაობ ამ სპრინტში.

სამუშაოს დასრულების შემდეგ ჩანაწერები აქედან იშლება.

---

# 🚧 Current Sprint

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

- `clearCart()` after confirmed success
- Redirect with `orderId`
- Success / Confirmation page (`/checkout/success/[orderId]`)
- Confirmation details via privileged order read
- Prevent accidental duplicate submission after success

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

## 🚀 CURRENT / NEXT — Delivery / Pickup System

Checkout customer chooses fulfillment method:

1. Courier Delivery
2. Pickup

Planned behavior (not implemented):

- Delivery requires a customer delivery address
- Pickup does **not** require a customer delivery address
- Fulfillment method is stored with the order
- Admin Order Details shows fulfillment method and relevant fields
- Existing Order Status Workflow remains intact

Planned workflows:

**Delivery:**
`pending → confirmed → processing → shipped → completed`

**Pickup:**
`pending → confirmed → processing → ready_for_pickup → completed`

Cancellation remains available only according to controlled business rules.

⬜ Fulfillment method selection at Checkout

⬜ Delivery address rules vs Pickup (no delivery address)

⬜ Persist fulfillment method on the order

⬜ Delivery path + `shipped` workflow

⬜ Pickup path + `ready_for_pickup` status

⬜ Admin Order Details displays fulfillment method / related info

**Status:** PLANNED / NEXT — not completed.

Not in this sprint: Auth, Protected Admin, Customer Account / My Orders,
Payments, Shipping pricing, Taxes, Coupons, Invoices, Email, Analytics,
archive/hard delete, advanced order editing, createOrder transaction RPC /
production hardening.

---

## 🔮 FUTURE (not current sprint)

⬜ Authentication

⬜ Protected Admin Routes

⬜ Customer Account

⬜ My Orders

⬜ Linking orders to authenticated users

⬜ Customer-side order management

⬜ Advanced order editing (add/remove products on existing order)

⬜ Invoice

⬜ Email Notifications

⬜ Payments

⬜ Shipping pricing

⬜ Taxes

⬜ Coupons

⬜ Dashboard Analytics

⬜ Archive functionality

⬜ Order hard delete (explicitly **not** current architecture)

⬜ Production transaction / RPC improvements for order creation

⬜ Full idempotency protection

⬜ SEO / production hardening
