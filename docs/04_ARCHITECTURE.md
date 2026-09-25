# 🏗️ Project Architecture

## 📖 რა არის ეს ფაილი?

ამ ფაილში აღწერილია პროექტის არქიტექტურა.

აქ ინახება ინფორმაცია:

- Folder Structure
- Project Flow
- Naming Convention
- Architecture Patterns
- Code Principles

ეს დოკუმენტი აღწერს როგორ არის აგებული პროექტი და რა წესებით ვითარდება.

---

# Project Architecture

---

# 📁 Folder Structure

პროექტი დაყოფილია პასუხისმგებლობების მიხედვით.

```txt
src

├── actions
│   │
│   ├── brands
│   │   ├── create-brand.ts
│   │   ├── delete-brand.ts
│   │   ├── get-brand-by-slug.ts
│   │   ├── get-brands.ts
│   │   ├── get-single-brand.ts
│   │   └── update-brand.ts
│   │
│   ├── categories
│   │   ├── create-category.ts
│   │   ├── delete-category.ts
│   │   ├── get-categories.ts
│   │   ├── get-single-category.ts
│   │   └── update-category.ts
│   │
│   ├── orders
│   │   ├── cancel-order.ts
│   │   ├── create-order.ts
│   │   ├── get-orders.ts
│   │   ├── get-single-order.ts
│   │   ├── return-delivery-to-store.ts
│   │   ├── update-order-fulfillment.ts
│   │   └── update-order-status.ts
│   │
│   ├── products
│   │   ├── change-main-image.ts
│   │   ├── create-product.ts
│   │   ├── delete-gallery-image.ts
│   │   ├── delete-product.ts
│   │   ├── delete-products-bulk.ts
│   │   ├── get-products.ts
│   │   ├── get-sale-slider-products.ts
│   │   ├── get-single-product.ts
│   │   ├── update-product-categories-bulk.ts
│   │   └── update-product.ts
│   │
│   └── promos
│       ├── create-promo-banner.ts
│       ├── delete-promo-banner.ts
│       ├── get-active-promo-banners.ts
│       ├── get-admin-promo-banners.ts
│       └── update-promo-banner.ts
│
├── app
│   │
│   ├── (shop)
│   │   ├── brands
│   │   │   ├── [slug]
│   │   │   └── page.tsx
│   │   ├── cart
│   │   ├── checkout
│   │   │   └── success
│   │   │       └── [orderId]
│   │   ├── products
│   │   ├── wishlist
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── admin
│   │   ├── brands
│   │   ├── categories
│   │   ├── orders
│   │   │   └── [id]
│   │   ├── products
│   │   ├── promos
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── globals.css
│   └── layout.tsx
│
├── components
│   │
│   ├── admin
│   │   │
│   │   ├── layout
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── MobileSidebar.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── promos
│   │   │   ├── AdminPromosListContent.tsx
│   │   │   ├── PromoBannerForm.tsx
│   │   │   └── PromoBannerNotFound.tsx
│   │   │
│   │   ├── orders
│   │   │   ├── AdminOrderDetailsContent.tsx
│   │   │   ├── AdminOrdersListContent.tsx
│   │   │   ├── OrderFulfillmentActions.tsx
│   │   │   ├── OrderStatusActions.tsx
│   │   │   └── OrderStatusBadge.tsx
│   │   │
│   │   └── products
│   │       │
│   │       ├── form
│   │       │   ├── BasicInfoSection.tsx
│   │       │   ├── CategoriesSection.tsx
│   │       │   ├── ImagesSection.tsx
│   │       │   ├── ProductForm.tsx
│   │       │   └── SpecificationsSection.tsx
│   │       │
│   │       └── list
│   │           ├── ChangeCategoriesModal.tsx
│   │           ├── Pagination.tsx
│   │           ├── ProductBrandFilter.tsx
│   │           ├── ProductBulkTable.tsx
│   │           ├── ProductCategoryFilter.tsx
│   │           ├── ProductLimit.tsx
│   │           ├── ProductSearch.tsx
│   │           ├── ProductSort.tsx
│   │           ├── ProductStockFilter.tsx
│   │           ├── ProductToolbar.tsx
│   │           └── ProductsTable.tsx
│   │
│   ├── cart
│   │   ├── CartDrawer.tsx
│   │   └── CartPageContent.tsx
│   │
│   ├── checkout
│   │   ├── CheckoutPageContent.tsx
│   │   ├── form
│   │   │   ├── CustomerInformationForm.tsx
│   │   │   ├── PlaceOrderButton.tsx
│   │   │   ├── types.ts
│   │   │   └── validate-customer-form.ts
│   │   └── summary
│   │       └── OrderSummary.tsx
│   │
│   ├── common
│   │   ├── CategoriesSidebar.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── ThemeToggle.tsx
│   │
│   ├── brands
│   │   ├── BrandCard.tsx
│   │   ├── BrandLogo.tsx
│   │   ├── BrandProductsContent.tsx
│   │   ├── BrandsDirectoryContent.tsx
│   │   └── BrandsPageHeading.tsx
│   │
│   ├── home
│   │   ├── FeatureStrip.tsx
│   │   ├── Hero.tsx
│   │   ├── HomeClient.tsx
│   │   ├── HomepageHeroSliders.tsx
│   │   ├── PromoBanner.tsx
│   │   └── PromoSlider.tsx
│   │
│   ├── layout
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HeaderExtras.tsx
│   │   ├── MobileMenuDrawer.tsx
│   │   ├── ShopHeaderExtrasHost.tsx
│   │   ├── SubHeader.tsx
│   │   └── ThemeProvider.tsx
│   │
│   ├── product
│   │   ├── CatalogPagination.tsx
│   │   ├── LatestProductsSlider.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductCardAddToCartButton.tsx
│   │   ├── ProductDetailsContent.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── ProductPurchaseActions.tsx
│   │   ├── ProductSectionClient.tsx
│   │   ├── ProductSlide.tsx
│   │   └── SaleProductsSlider.tsx
│   │
│   └── wishlist
│       └── WishlistPageContent.tsx
│
├── context
│   ├── CartContext.tsx
│   ├── CartDrawer.tsx
│   ├── LanguageContext.tsx
│   ├── WishlistContext.tsx
│   └── cart
│       ├── actions
│       ├── selectors
│       ├── storage
│       └── types.ts
│
├── data
│   ├── categories.ts
│   └── products.ts
│
├── dictionaries
│   ├── en.ts
│   └── ka.ts
│
├── fonts
│   ├── georgian.ts
│   ├── bpg_glaho_sylfaen.ttf
│   └── bpg_nino_mtavruli_bold.ttf
│
├── lib
│   │
│   ├── data
│   │   └── products.ts
│   │
│   ├── catalog
│   │   ├── catalog-search-params.ts
│   │   └── sale-filter.ts
│   │
│   ├── i18n
│   │   ├── format-admin-date.ts
│   │   └── localize-storefront-message.ts
│   │
│   ├── orders
│   │   ├── decrement-product-stock.ts
│   │   ├── delete-order.ts
│   │   ├── format-order-number.ts
│   │   ├── insert-order-items.ts
│   │   ├── insert-order.ts
│   │   ├── order-mapper.ts
│   │   ├── order-status.ts
│   │   ├── resolve-order-items.ts
│   │   ├── update-order-fulfillment-record.ts
│   │   ├── update-order-status-record.ts
│   │   └── validate-order.ts
│   │
│   ├── products
│   │   ├── attach-product-categories.ts
│   │   ├── change-main-image-record.ts
│   │   ├── delete-gallery-image-record.ts
│   │   ├── insert-main-image.ts
│   │   ├── insert-product.ts
│   │   ├── parse-product-form.ts
│   │   ├── pricing.ts
│   │   ├── product-mapper.ts
│   │   ├── update-product-record.ts
│   │   ├── upload-gallery-images-record.ts
│   │   ├── upload-gallery-images.ts
│   │   ├── upload-main-image.ts
│   │   └── validate-product.ts
│   │
│   ├── promo
│   │   ├── constants.ts
│   │   ├── localized-text.ts
│   │   ├── parse-promo-banner-form.ts
│   │   ├── promo-banner-storage.ts
│   │   ├── public-url.ts
│   │   ├── sort-order.ts
│   │   ├── types.ts
│   │   └── validate-link-url.ts
│   │
│   └── supabase
│       ├── admin.ts
│       └── server.ts
│
└── types
    └── product.types.ts
```

---

# 🔄 Product Flow

ProductForm

↓

parseProductForm

↓

validateProduct

↓

productMapper (`price` + nullable `sale_price`)

↓

insertProduct / updateProductRecord

↓

attachProductCategories

↓

uploadMainImage

↓

insertMainImage

↓

uploadGalleryImagesRecord

↓

revalidatePath

↓

redirect

---

# 📋 Product Listing Flow

Search

↓

Brand Filter

↓

Category Filter

↓

Stock Filter

↓

Sorting

↓

Pagination

↓

Page Size

*(Admin products list — above.)*

---

# 💰 Sale pricing (implemented)

Canonical columns:

- `products.price` — regular / original catalog price
- `products.sale_price` — nullable discounted selling price

Canonical sale state: `sale_price IS NOT NULL` → on sale;
`sale_price IS NULL` → normal product.

No `is_on_sale` / `is_discounted` / stored `discount_percent`.

Helpers: `src/lib/products/pricing.ts`

```text
effective price = valid sale_price if present, else price
discount % = round(((price - sale_price) / price) * 100)  // derived
```

Admin Product Create/Edit:

- On Sale checkbox (UX; unchecked submits `sale_price = NULL`)
- Sale Price required when On Sale; must be `> 0` and `< price`
- Desktop one row: Regular Price | On Sale | Sale Price + derived %
- Top Create/Update and bottom submit share `#product-form` /
  `handleSubmit` (same image-optimization path; shared pending state)

Storefront filter **ფასდაკლება / Sale** is virtual:

- URL `?category=sale` → `getProducts({ onSale: true })` →
  `.not("sale_price", "is", null)`
- Legacy Discount category membership does **not** decide eligibility
- Admin category pickers hide the obsolete Discount category (identified
  by name only: KA `ფასდაკლება` / EN discount|sale; categories have no slug)
- That `categories` row was **not** deleted (optional future cleanup)

Checkout: `resolveOrderItems` selects `id, title, price, sale_price, stock`
and charges `getEffectiveProductPrice`. Cart/localStorage is **not**
authoritative. `order_items.product_price` is the unit charged at create.

Delivery minimum remains **150 GEL** on the authoritative **effective**
subtotal (no fee; no COD). Example: regular 200 / sale 120 → 120 →
delivery unavailable.

Catalog min/max and Admin `price-asc` / `price-desc` use live generated
`products.effective_price` (`COALESCE(sale_price, price)`) and index
`products_effective_price_idx`. SQL:
`docs/sql/add-products-effective-price.sql` — **executed** (history;
app never auto-applies). Admin still edits only `price` / `sale_price`.
Storefront has no customer-facing price-sort UI. Checkout still resolves
`price` + `sale_price`. Historical `order_items.product_price` unchanged.

---

# 🏠 Home Storefront Catalog Flow

Home (`src/app/(shop)/page.tsx`) runs **three independent** product reads
plus `getActivePromoBanners()` for Promo Slider #1.

## Homepage composition (current)

```text
Header
↓
Search / Filters (ShopHeaderExtrasHost + CategoriesSidebar)
↓
HomepageHeroSliders
  PromoSlider #1 (DB-backed when SQL is live)
  SaleProductsSlider #2
↓
LatestProductsSlider (New Products — unchanged)
↓
FeatureStrip (benefits)
↓
Featured Catalog (ProductSectionClient)
↓
existing PromoBanner CTA (unrelated to PromoSlider CMS)
↓
Footer
```

Desktop `lg+`:

```text
[ wide Promo carousel ][ narrow Sale carousel ]
```

`HomepageHeroSliders` uses `container-page` plus the HeaderExtras filter
slot (`w-[296px]` = 272px + 24px gap) on `lg`, whether Filters are
expanded or collapsed.

Grid: `lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]` **only when both**
Promo and Sale have content. Equal height via CSS Grid stretch on `lg`
only (`items-start` below `lg`).

Below `lg`:

```text
Promo
↓
Sale  (then 3 / 2 / 1 visible cards by width)
↓
New Products
```

If there are no sale products, the Sale column is omitted and Promo uses
the remaining Search-aligned width. No fake sale products.

If there are **no active Promo banners**, Promo is omitted (no placeholder
rectangle). Sale occupies the remaining Search-aligned hero width. Sale
visible-card breakpoints stay 1 → 2 → 3 → 1.

If both are empty, the hero section is omitted.

## Promo Slider #1 CMS (**live / SQL executed**)

`PromoSlider` is **image-first**. SQL
`docs/sql/create-promo-banners.sql` was **executed** in the Supabase SQL
Editor (app never auto-applies). Schema and bucket `promo-banners` are live.

When live:

- Table `public.promo_banners`; storage bucket `promo-banners`
- Storefront: `is_active = true`, `sort_order ASC`, `created_at ASC`
- Optional KA/EN overlay; empty both languages → image only; current
  language falls back to the other. All four overlay fields may be empty
- Optional internal `link_url` (whole poster is the link); empty → not
  clickable; external URLs rejected
- `sort_order` is **internal**. Admin never types it. Create appends after
  all rows (including inactive). Edit preserves position. Delete reindexes
  remaining rows to contiguous `1..N`
- 1 banner: static; no prev/next/dots; no autoplay
- 2+: existing Embla, `loop: true`, one at a time, prev/next + dots,
  ~5s autoplay (`PROMO_AUTOPLAY_INTERVAL_MS`); Prev/Next/dot reset the
  timer; hover, in-slider keyboard focus, and `document.hidden` pause;
  `prefers-reduced-motion: reduce` disables autoplay. Sale Slider stays
  `loop: false` / no autoplay
- Admin `/admin/promos` (list / create / edit / delete)

Admin still edits `price` / `sale_price` only. Checkout / catalog
effective-price behavior is unchanged.

Existing `PromoBanner.tsx` at the bottom of Home is a separate CTA block,
not this slider.

## A. Sale Products slider (independent)

`getSaleSliderProducts()` — `sale_price IS NOT NULL`, `created_at` desc,
limit **10**. Selects `stock` for Add-to-Cart UX only. **No** `stock > 0`
eligibility filter. Not category membership. Not a featured-sale flag.
Not affected by Featured Catalog Filters.

`SaleProductsSlider`: Embla, no autoplay, `ProductPrice` (regular + sale
+ derived %). Image / title / price link to Product Details
(`/products/[id]`). Add to Cart is the shared
`ProductCardAddToCartButton` (same as `ProductCard`); **not** inside the
product `Link`. No dedicated View Product CTA. One Prev/Next pair for
the carousel; shown only when Embla can scroll. Hidden when the product
list is empty.

Visible cards (intentional inverse of typical 1→2→3):

| Width | Visible cards | Why |
|-------|---------------|-----|
| < 360px | 1 | too narrow for two usable cards |
| 360px to below `md` | 2 | stacked full-width phone row |
| `md` to below `lg` | 3 | stacked full-width tablet row |
| `lg+` | 1 | Sale is the narrow right column beside Promo |

## B. Latest Products (independent)

`getProducts({ page: 1, limit: 10 })`

↓

`LatestProductsSlider` (desktop: 4 complete cards; Filters open → **only**
Latest Products title block shifts `lg:ml-[272px]`; slider / cards / arrows /
dots stay stationary)

Not affected by Featured Catalog Filters, price bounds, or catalog `page`.

## C. Featured Catalog (filtered + paginated)

URL search params (source of truth):

`category` · `minPrice` · `maxPrice` · `page`

↓

parse (`src/lib/catalog/catalog-search-params.ts`)

↓

`getProducts({ page, limit: 20, categoryId, onSale, minPrice, maxPrice })`

↓

Supabase: normal Category (`product_categories.category_id`) **or** virtual
sale filter (`sale_price IS NOT NULL` when `category=sale`) **AND** Price
(`products.effective_price` gte/lte as provided) → **exact filtered count** →
`.range(...)` for current page (max **20** products)

↓

`ProductSectionClient` Featured grid + `CatalogPagination`

### Rules

- **Filter first, paginate second** (full matching catalog, then 20/page)
- Category identity = stable category ID (not localized display name),
  except storefront **ფასდაკლება / Sale** which is a virtual filter
  (`?category=sale` → `sale_price IS NOT NULL`; not `product_categories`)
- Price currency = GEL / `₾` only
- Filter change or Clear → `page = 1`
- Active filter count: Category group + Price group (min+max = one Price)
- Desktop Filters panel + Mobile Menu Drawer share the same URL state
- Empty filtered set → localized empty UI; Latest Products still shown
- No new schema / RPC / dependency for this flow

---

# 🏷️ Storefront Brands Flow

Separate from Admin Brands CMS (`/admin/brands`, create, edit).

## Routes

| Route | Role |
|-------|------|
| `/brands` | Brands directory |
| `/brands/[slug]` | Brand product listing (PLP) |

Header / mobile nav / Footer **Brands** links → `/brands`. Desktop Brands nav
active for `/brands` and `/brands/*`.

## A. Brands directory (`/brands`)

```text
getStorefrontBrands()
  → brands (id, name, slug, logo)
  → nested products(count)  (no N+1 per Brand; no new RPC)
  → normalized productCount
  → BrandCard grid
```

- Responsive cards: name, optional logo URL or first-letter fallback,
  product count (zero-product Brands still listed)
- Navigate by `slug` → `/brands/[slug]`
- KA/EN UI labels; KA count always `{count} პროდუქტი`; EN `1 product` /
  `{count} products`
- Brand `name` is a **single** DB field (not localized Brand names)
- **No** product Filters / sidebar on this route

## B. Brand PLP (`/brands/[slug]`)

```text
slug → getBrandBySlug (exact match)
  → require exactly one row (0 or >1 → not found / fail closed)
  → fixed server brandId (pathname scope; never a URL filter)
  → parse catalog params (category · minPrice · maxPrice · page)
  → getProducts({ brandId, categoryId?, minPrice?, maxPrice?, page, limit: 20 })
  → Brand + Category + Price AND → exact filtered count → .range (20/page)
  → BrandProductsContent (header + ProductCard grid + CatalogPagination)
```

### Filters (reuse Home catalog architecture)

- Same URL keys: `category`, `minPrice`, `maxPrice`, `page` — **no** `brandId`
  query param
- Same UI: `CategoriesSidebar` + mobile drawer Filters; Clear / active count
- Clear removes filter query params but **keeps** `/brands/[slug]`
- Filter / Clear → `page = 1`; pagination preserves active filter params
- Header product count = current filtered catalog total (or full Brand total
  when no filters)
- Empty: Brand has zero products (no filters) → Brand empty copy; filters
  match zero → catalog no-match copy

### Desktop Filters defaults

| Route | Sidebar default |
|-------|-----------------|
| `/` | OPEN |
| `/brands/[slug]` | CLOSED |
| `/brands` | none |

### Shared storefront toolbar

Hosted from `(shop)` layout (`ShopHeaderExtrasHost` + `HeaderExtras`) so it
survives client navigations:

| Route | Toolbar |
|-------|---------|
| `/` | Filters slot + Search + Help |
| `/brands` | Search + Help (Filters slot collapsed) |
| `/brands/[slug]` | Filters slot + Search + Help |

Route transitions (architecture-level): leaving Filters-capable routes for
`/brands` collapses the Filters slot and expands Search; entering Brand PLP
from `/brands` restores the Filters slot and contracts Search. Help stays
stable. Search width follows **route capability**, not sidebar open/closed.

### Controlled content motion (no ProductCard reflow)

- **Home:** Filters open/close → only the Latest Products heading moves
  horizontally
- **Brand PLP:** Filters open/close → only Brand identity header (logo /
  fallback, name, count) moves `lg:ml-[272px]`; product grid + pagination
  stay put

### Logos

`brands.logo` = nullable URL string. Storefront shows the image when present,
else first-letter fallback. No new Storage bucket, upload path, schema, or
host allowlisting was added for this feature.

### Home regression

Home Featured Catalog (full-catalog server Filters, 20/page, independent
Latest Products) is unchanged by Brands work.

---

# Storefront visual system (implemented)

Visual polish only. Product queries, pricing, Sale Slider Embla, Promo
CMS/autoplay, Cart, Checkout, Auth, Admin business logic, and the
database are unchanged.

### ProductCard

Shared storefront tile: denser internal spacing, square image area,
restrained responsive title size. Existing title clamp and price /
Add-to-Cart alignment are preserved. Add-to-Cart and stock UX are
unchanged.

### Radius hierarchy

Not a blind global replace. Admin was not broadly redesigned.

| Surface | Typical radius |
|---------|----------------|
| Structural cards / panels | `rounded-xl` |
| Nested thumbnails / smaller nested surfaces | `rounded-lg` |
| Promo / Hero posters | `rounded-2xl` (one step softer) |
| Pills / badges / circular icon controls | `rounded-full` |

### Homepage product-section headings

Sale, Latest Products, and Featured Products each have **one** gold
heading (duplicate eyebrow + title removed). Shared restrained
responsive size. EN headings render uppercase through CSS
(`text-transform`); dictionary strings stay title case. KA headings
are unchanged.

### Typography

`LanguageProvider` remains the language source and sets root `html lang`
to `ka` or `en`. Language-aware CSS uses that attribute — not a second
language system.

Local Georgian files live in `src/fonts/` and load with `next/font/local`
(no extra network font request, no new dependency). Playfair Display was
already loaded and is the EN display face (not loaded twice).
`font-serif` is **not** globally remapped to Georgian.

| Role | KA | EN |
|------|----|----|
| Body / UI | BPG Glaho Sylfaen | Inter |
| Display (section headings, product-tile names, primary Header nav) | BPG Nino Mtavruli Bold | Playfair Display |

Product-tile names (ProductCard, Sale slider, Wishlist) use the display
pairing; colors, sizes, clamp, and layout were not changed by the
font-family pass. Prices stay outside the display system
(`ProductPrice` unchanged). Ordinary labels, forms, buttons, filters,
cart, checkout, and account UI stay body/UI fonts. Primary Header nav
uses the display pairing; gold active-route state is unchanged.

---

# 🛠️ Admin Layout Flow

app/admin/layout.tsx (Server)

↓

components/admin/layout/AdminLayout.tsx (Client)

↓

AdminHeader

↓

Sidebar (Desktop)

↓

MobileSidebar (Mobile)

↓

Admin Pages

---

# 🛒 Checkout → Orders Flow

## Add to Cart (client)

`ProductCard` and `SaleProductsSlider` share
`ProductCardAddToCartButton`. It is **not** an inventory/security
authority.

```text
UI
  → disabled state + floating “Added to Cart” feedback
Cart mutation (`addToCart` action + CartContext)
  → client-side stock enforcement + operation result
Checkout `resolveOrderItems`
  → server-side product / price / stock authority
```

`addToCart` returns:

```text
{ success: true }
| { success: false; reason: "out_of_stock" | "stock_limit" }
```

The action returns `{ items, result }`. CartContext applies items via the
functional `setCartItems` updater and returns `result` to the caller.
Quantity cannot exceed `product.stock` even if the button has not yet
re-rendered as disabled.

Floating Add-to-Cart feedback (`useAddToCartFloatFeedback`) increments
**only** when `result.success === true`. Rejected clicks do not count.
Repeated successful adds in the existing feedback window may still
accumulate.

Button states (localized):

| Condition | Control | Label |
|-----------|---------|--------|
| `stock <= 0` | disabled | Out of Stock / მარაგი ამოწურულია |
| `stock > 0` and cart quantity `>= stock` | disabled | Stock limit reached / მარაგის ლიმიტი მიღწეულია |
| otherwise | enabled | Add / დამატება |

Out of Stock ≠ cart already holding all available units.

Sale pricing is unchanged: cart still snapshots effective price;
checkout still re-resolves from the database.

---

Cart (`CartContext`) — lines may be `selected` / deselected (persisted).
Checkout and `createOrder` use **selected** lines only; badge counts all.

↓

`/checkout` → `CheckoutPageContent`

↓

Controlled Customer Form (fulfillment + payment method) + live Order Summary

↓

Place Order → `createOrder` Server Action

↓

Validate (incl. payment method + fulfillment/payment combo) + consolidate items

↓

Resolve authoritative products (`products` table)

↓

Delivery minimum (S7B-1): if `fulfillmentMethod === "delivery"` and
authoritative resolved **effective selling** subtotal < 150 GEL → reject
**before** inserts / stock decrement (client also gates on
`selectedCartTotal`, which uses the cart’s effective-price snapshot).
Cart / client prices are **not** authoritative.

↓

Map order (`total_price`, `status: "pending"`, `payment_method`,
`payment_status: "unpaid"` — status server-authoritative)

↓

Insert `orders` → insert `order_items` → decrement stock

↓

Best-effort compensation on partial failure

↓

Return `{ success, orderId }` to Checkout UI

↓

On success: remove **purchased** cart line ids only → redirect
`/checkout/success/[orderId]`
(deselected / unpurchased cart lines remain)

↓

Confirmation page loads order via `getGuestSuccessOrder(orderId)`
(requires short-lived httpOnly HMAC proof issued by `createOrder`;
UUID alone does **not** authorize PII access).
Line items may show product thumbnails via live product join +
`mapOrderItemProductDisplay` (historical `order_items` snapshot still required).

Privileged access:

`createAdminClient()` (`src/lib/supabase/admin.ts`)

is used for sensitive order orchestration and Admin Orders reads
(list, detail, status update, cancel RPC, return-to-store RPC).

Normal storefront product reads continue to use

`createClient()` (`src/lib/supabase/server.ts`).

---

# 🧾 Admin Orders Flow

## List

`/admin/orders`

↓

URL searchParams (`search` / `status` / `sort` / `page` / `limit`)

↓

`getOrders({ search, status, sort, page, limit })` Server Action

↓

`createAdminClient()`

↓

Server-side Supabase query:

- exact count + range pagination
- status filter
- newest / oldest `created_at` sort
- page size `10` / `25` / `50` / `100`
- search:
  - customer name / phone / email (`ilike` substring)
  - full UUID exact match on `id`
  - Order Number exact match on `order_number`
    (`10004` or `#10004` → `order_number = 10004`)
  - Partial Order Number search is **not** supported

↓

`AdminOrdersListContent` + Orders toolbar / counter / pagination

↓

Responsive table (`sm+`, min-width + horizontal overflow) /
mobile cards (`<sm`)

Primary list identity: `#order_number`

View still routes with UUID → `/admin/orders/[id]`

## Detail

`/admin/orders/[id]`

↓

`getAdminOrder(id)` — `requireAdmin()` then privileged client
(simple `orders` + `order_items` select — **no** product image embed)

↓

`AdminOrderDetailsContent` section order (top → bottom):

1. Page Header
2. Order Header
   - primary: customer-facing `#order_number`
   - secondary: internal UUID
   - authoritative status badge
   - prominent Delivery / Pickup fulfillment badge
3. Customer Information
   - Delivery shows Address
   - Pickup omits Address row
4. Order Items + Order Total
5. Order Management — `OrderStatusActions` (**must remain last**)
   - early-status fulfillment change (Delivery ↔ Pickup) when allowed
   - fulfillment-aware status actions

Order Items currently do **not** show product thumbnails
(intentionally deferred; historical title/price snapshots stay text-only).

Admin dates use `formatAdminDateTime` / `formatAdminDate`
(`src/lib/i18n/format-admin-date.ts`, timezone `Asia/Tbilisi`)
so SSR and client hydrate identically.

## Order Number identity

Two identifiers coexist:

- `orders.id` (UUID) — technical PK / routes / FKs / `cancel_order`
- `orders.order_number` (BIGINT) — customer-facing reference (`#10004` in UI)

Checkout confirmation:

- Route remains `/checkout/success/[orderId]` (UUID)
- Customer-facing display uses `#order_number`

## Status management

Centralized rules: `src/lib/orders/order-status.ts`
(fulfillment-aware forward / backward / exceptional maps)

↓

UI actions: `OrderStatusActions` → `updateOrderStatus` Server Action

↓

`update-order-status-record.ts` — conditional status update
(`UPDATE … WHERE status = expected`)

**Normal status transitions do not change stock.**

### Delivery

Normal:

`pending → confirmed → processing → shipped → completed`

Backward corrections (status-only):

`confirmed → pending`, `processing → confirmed`

Exceptional (status-only, no stock):

`shipped → delivery_failed → shipped` (Retry Delivery)

At Delivery `shipped`: Complete Order + Delivery Failed.

`delivery_failed → completed` and `delivery_failed → cancelled` are forbidden.

### Pickup

`pending → confirmed → processing → ready_for_pickup → completed`

Backward corrections:

`confirmed → pending`, `processing → confirmed`,
`ready_for_pickup → processing`

Pickup never enters `delivery_failed` or `returned_to_store`.

### Terminal statuses

`completed`, `cancelled`, and `returned_to_store` are terminal for Admin workflow actions.

Authoritative status badge: Order Header only (not duplicated in Order Management).

DB status codes stay English machine values; UI labels are localized via
dictionaries (`getLocalizedOrderStatus` / Admin badge presentation).

## Three mutation boundaries (do not conflate)

### 1. Normal / exceptional status transition

`updateOrderStatus` → status-only write

Used for forward/backward corrections and Delivery Failed / Retry Delivery.

**No stock change.**

### 2. Cancellation + stock restore

UI cancel (when allowed) → `cancelOrder` Server Action

↓

Privileged `rpc("cancel_order", { p_order_id })` only

↓

PostgreSQL `public.cancel_order(uuid)` owns the transaction:
lock order → set `cancelled` → restore ordered quantities additively to product stock

Application TypeScript does **not** restore stock.

Cancel allowed from: `pending` / `confirmed` / `processing`

Also allowed for Pickup: `ready_for_pickup`

Cancel not allowed from: `shipped` / `delivery_failed` / `returned_to_store` /
`completed` / `cancelled`

`cancelled` is **not** the same outcome as `returned_to_store`.

### 3. Failed Delivery physical return + stock restore

At Delivery `delivery_failed`: Return to Store → `returnDeliveryToStore` Server Action

↓

Privileged `rpc("return_delivery_to_store", { p_order_id })` only

↓

PostgreSQL `public.return_delivery_to_store(uuid)` owns the transaction:
requires Delivery + `delivery_failed` → lock order → set `returned_to_store` →
additive stock restore from `order_items`

Application TypeScript does **not** restore stock.

`delivery_failed → returned_to_store` is **not** authorized through
`canTransitionOrderStatus` / `updateOrderStatus`.

Exactly-once / idempotent return manually verified
(`already_returned = true` on repeat; stock unchanged on second call).

## Historical records

`completed`, `cancelled`, and `returned_to_store` orders remain stored and visible in Admin.

Hard delete / archive is **not** part of the current architecture.

## Security note

### Authentication / Authorization (current)

- **S2A** — Supabase Auth foundation (email/password login, session cookies,
  proxy session refresh, `getAuthUser()`)
- **S2B** — Explicit Admin authorization via `public.admin_users`
  (`getAuthorizedAdmin()`; UUID + `is_active`; app-controlled `display_name`)
- Login requires **both** successful Auth **and** an active Admin row;
  non-Admins are signed out with a generic error
- authenticated ≠ authorized Admin
- **S3** — Admin route/UI protection via `src/app/admin/(protected)/layout.tsx`
  (`getAuthorizedAdmin()` → null redirects to `/admin/login`)
- `/admin/login` remains public; active Admin visiting login redirects to `/admin`
- Proxy remains **session refresh only** (not Admin authorization)
- **S4** — Privileged Server Action / Admin-read gate via `requireAdmin()`
  (`src/lib/auth/require-admin.ts` → `getAuthorizedAdmin()` → fail closed)
  - ADMIN_ONLY mutations (products/images/bulk, brands, categories, order
    status/cancel/return/fulfillment) + privileged Admin list `getOrders`
  - Intentionally ungated: `createOrder` (guest checkout), Auth login/logout,
    public catalog reads
  - Order reads (S6C Step 1):
    - Guest success: `getGuestSuccessOrder` — HMAC httpOnly proof required
      (`ORDER_ACCESS_SECRET`; UUID alone denied)
    - Admin detail: `getAdminOrder` — `requireAdmin()` before privileged read
  - Order claim (S6C Step 2):
    - `claimGuestOrder` — `getAuthUser()` + proof + conditional
      `user_id` attach (`WHERE user_id IS NULL`); email never authorizes
  - Customer My Orders (S6D):
    - `getCustomerOrders` / `getCustomerOrder` — `getAuthUser()` then
      privileged read filtered by `user_id = auth user.id`
      (detail also `.eq("id", orderId)`; product image join is display-only)
  - Logged-in checkout ownership (S6E):
    - `createOrder` → `getAuthUser()` → `orders.user_id = user.id | null`
    - Never from `CreateOrderInput` / client / FormData / URL
  - Customer profile (post-S6):
    - Account reads `profiles` for name/phone (Auth for email/session)
    - `updateCustomerProfile` — authenticated SSR + RLS; no service role
  - Password recovery / change:
    - `requestPasswordReset` / `updateCustomerPassword` /
      `changeCustomerPassword` — Auth APIs only; no profiles password column
  - Admin Users (read-only):
    - `getAdminCustomers` / `getAdminCustomer` — `requireAdmin()` +
      `createAdminClient()`; Auth Admin + `profiles` join; owned orders by
      `user_id` only
  - **S5** — Catalog Security Hardening (app + DB + Storage) ✅
  - Admin Catalog mutations:
    `requireAdmin()` → `createAdminClient()` → `service_role` → Catalog CRUD
  - Live DB: `anon` / `authenticated` — Catalog **SELECT only**;
    INSERT/UPDATE/DELETE **denied** on `products`, `brands`, `categories`,
    `product_categories`, `product_images`
  - `service_role` retains Catalog CRUD
  - RLS **ON** for those five catalog tables; dangerous public WRITE policies
    removed (e.g. brands public INSERT/UPDATE/DELETE; product_images public DELETE)
  - Storage `product-images`: public **READ** retained; anonymous upload/write
    removed
  - Secret-exposure audit: no privileged key via `NEXT_PUBLIC_*`; no
    `createAdminClient` / secret imports in `"use client"` modules

### Customer / Guest ownership (S6 — complete)

```text
Guest checkout
  → createOrder (no auth required)
  → orders.user_id = NULL
  → HMAC guest success proof
  → optional login/register + claimGuestOrder (proof + user_id IS NULL)

Authenticated checkout
  → createOrder + getAuthUser()
  → orders.user_id = auth user.id
  → appears in /account My Orders (no claim)

Customer My Orders
  → getAuthUser() + SQL user_id = auth.id
  → detail: id AND user_id (no load-then-check)
```

Customer ≠ Admin. Email is never ownership authorization.

### Customer Account / Auth UX (profiles + password flows)

```text
Auth (identity / email / password / session / confirmation)
  + public.profiles (full_name / phone)
  → /account overview

Profile edit
  → authenticated SSR client + RLS (own row only)
  → no service role; no user_metadata write
  → email remains read-only

Password
  → show/hide on Login / Register / Reset / Change
  → Forgot: resetPasswordForEmail → /auth/callback (PKCE)
    → /account/reset-password (recovery session + updateUser)
  → Logged-in Change Password (current-password proof + updateUser)
  → passwords never stored in profiles / application DB

Login UX
  → Sign In / Forgot Password / Create Account / Continue as guest
  → logout → /account/login?signedOut=1
  → storefront browsing Auth-optional; Guest checkout unchanged
```

### Admin Users (read-only)

```text
/admin/users
  → requireAdmin() + createAdminClient()
  → Auth Admin listUsers + profiles join
  → search (name / email / phone) + pagination (20)
  → safe DTO only (no passwords / tokens)

/admin/users/[id]
  → Auth getUserById + profiles
  → Order History: orders.user_id = auth user id only
  → never email match; guest customer_email match ≠ owned
  → links to existing /admin/orders/[id]
```

Intentionally deferred (not broken): customer email change; Admin
edit / delete / ban / invite customer; Admin password manipulation;
Admin role management; Admin Add/Invite Customer.

### Still remaining (outside S5–S6; S7 partial)

- ✅ S7A Payments Foundation (DB) — Production columns live (`payment_method`
  NULL | `online` | `pay_at_pickup` only — **no** COD; `payment_status` +
  metadata). Order status ≠ payment status. Historical: method NULL, unpaid.
- ✅ S7B-1 Delivery Minimum — ≥ 150 GEL for delivery; free Tbilisi delivery
  (no fee); client `selectedCartTotal` + server resolved **effective**
  prices (`sale_price` when set, else `price`) before writes
- ✅ S7B Checkout Payment Method — UI + server capture; valid combos only;
  `payment_status = unpaid` at create; rejects `delivery + pay_at_pickup` and
  unknown methods before inserts / stock (`payment-rules` / `validateOrder`)
- ✅ Promo CMS / real Promo Slider #1 — **live** (SQL
  `docs/sql/create-promo-banners.sql` **executed**; Admin `/admin/promos`;
  storefront `getActivePromoBanners`; `sort_order` assigned server-side)
- ✅ Catalog min/max (and Admin price sort) use live generated
  `effective_price` — SQL `docs/sql/add-products-effective-price.sql`
  **executed**; Min/Max runtime-verified
- ⬜ Real online payment / provider integration (provider not chosen)
- ⬜ Webhooks / payment verification / automatic `paid` / refunds
- Guest `createOrder` abuse controls (rate limits / CAPTCHA / etc.)
- Order Confirmation email (Guest + Customer) — documented only
- Customer email change; Admin customer mutations / invite / ban;
  Admin password or role tools — **intentionally deferred** (User/Account
  milestone complete for current read-only Admin Users scope)

# 🏛️ Architecture Principles

- Single Responsibility Principle (SRP)
- Separation of Concerns
- Business Logic Layer
- Service Layer
- Helper Functions
- Reusable Components
- Orchestrator Pattern
- Server Components
- Client Components
- Server Actions
- Domain Based Component Organization

---

# 📝 Naming Convention

პროექტში გამოიყენება პასუხისმგებლობებზე დაფუძნებული დაყოფა.

```txt
actions

↓

lib

↓

components

↓

pages
```

### Actions

Server-side ოპერაციები:

- Create
- Update
- Delete
- Fetch


### Lib

ბიზნეს ლოგიკა და დამხმარე სერვისები:

- Parsers
- Validators
- Mappers
- Database Helpers
- Upload Services


### Components

UI და მომხმარებელთან დაკავშირებული ლოგიკა.

---

# 🎯 Goal

მიზანია:

- მაქსიმალურად სუფთა კოდი
- მკაფიო არქიტექტურა
- მარტივი მასშტაბირება
- კომპონენტების ხელახლა გამოყენება
- პასუხისმგებლობების სწორი განაწილება

პროექტი ვითარდება მოდულარული და პროფესიონალური Ecommerce არქიტექტურის მიმართულებით.