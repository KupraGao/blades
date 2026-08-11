# Blades Premium Starter

Next.js + Tailwind + Supabase ecommerce application.

## Run

```bash
npm install
npm run dev
```

Open: http://localhost:3000

## Structure (high level)

- `src/app/(shop)` — storefront routes (home, products, cart, checkout, wishlist)
- `src/app/admin` — Admin CMS (products, brands, categories, orders)
- `src/components` — UI by domain (cart, checkout, product, admin, layout, …)
- `src/actions` — Server Actions (products, brands, categories, orders)
- `src/lib` — business/helpers (products, orders, supabase clients)
- `src/context` — Cart / Wishlist / Language contexts

## Current status (high level)

- Product catalog CRUD and storefront shopping (cart / wishlist) are in place.
- Checkout creates real orders via a server-only privileged Supabase client.
- Order confirmation page clears the cart and shows order details by `orderId`
  (UUID route; customer-facing `#order_number` is displayed).
- Admin Orders Management is complete: list, detail page, controlled status
  workflow, transactional `cancel_order` RPC (stock restore in PostgreSQL),
  and Admin KA/EN localization via the shared LanguageContext.
- Admin Orders List Management is complete: server-side search / filters /
  sort / pagination, URL-driven toolbar, and results counter.
- Customer-facing Order Number (`orders.order_number`) is live in Admin and
  confirmation UI; UUID remains the technical identifier for routes/FKs/RPC.
- Admin Order Details layout ends with Order Management (`OrderStatusActions`).
- **Next milestone:** Delivery / Pickup fulfillment (not implemented yet).

## Notes

- Product catalog and orders are backed by Supabase (not demo/mock data).
- Do not put secret/service-role keys in `NEXT_PUBLIC_*` variables.
- Admin routes are not authentication-protected yet (known future milestone).
- The app is not claimed as fully production-ready (payments, auth, SEO, etc.
  remain future work). See `docs/02_ROADMAP.md` and `docs/03_PROJECT_TODO.md`.
