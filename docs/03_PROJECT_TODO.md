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

## 🚀 CURRENT / NEXT — Phase C: Order Confirmation

Successful Order

→ `clearCart()`

→ redirect with `orderId`

→ Success / Confirmation page

→ show Order ID / confirmation details

→ prevent accidental duplicate submission after success

⬜ Clear cart after confirmed success

⬜ Success / Confirmation route

⬜ Redirect with `orderId`

⬜ Confirmation details UI

⬜ Prevent resubmitting the same successful cart

---

## 🔮 FUTURE (not current sprint)

⬜ Admin Order Detail Page

⬜ Admin Order Status Management

⬜ Order Timeline

⬜ Invoice

⬜ Order Actions

⬜ Authentication

⬜ Admin Route Protection

⬜ Payments

⬜ Shipping

⬜ Taxes

⬜ Coupons

⬜ Email Notifications

⬜ Production DB transaction / RPC

⬜ Full idempotency protection

⬜ Dashboard Analytics
