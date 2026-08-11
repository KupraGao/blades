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

## Notes

- Product catalog and orders are backed by Supabase (not demo/mock data).
- Checkout creates real orders via a server-only privileged Supabase client.
- Do not put secret/service-role keys in `NEXT_PUBLIC_*` variables.
