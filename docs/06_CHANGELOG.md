# Changelog

## რა არის ეს ფაილი?

აქ ინახება განხორციელებული ცვლილებების ისტორია.

აქტიურ ფაილში რჩება `v1.36.0`–`v1.45.0` და მათ შემდეგ დაუნომრავი commit-ები. `v1.0.0`–`v1.35.0` სრული ტექსტი არის [archive/CHANGELOG_ARCHIVE.md](archive/CHANGELOG_ARCHIVE.md). ერთი და იგივე ვერსია ორივე ფაილში არ მეორდება.

ვერსიის ნომრები ამ დოკუმენტაციის სიაა. `package.json` კვლავ `1.0.0`-ია. `v1.45.0`-ის შემდეგ ახალი `v1.x` ნომერი მინიჭებული არ არის, ამიტომ `b8d7bf8`, `00c1bf0` და `a0e3bc2` ჩაწერილია commit ID-ით.

ისტორიული ჩანაწერი აღწერს იმ დროის მდგომარეობას. მოგვიანებით დამატებული ფუნქცია ძველ ვერსიაში უკან არ ჩაწერილა.

მიმდინარე სტატუსი: [03_PROJECT_TODO.md](03_PROJECT_TODO.md). სისტემის მოწყობა: [04_ARCHITECTURE.md](04_ARCHITECTURE.md).

---

## დაუნომრავი — `b8d7bf8` ატომური Checkout

**Implemented.** Production-ში ნაწილობრივ **Verified**. BOG გადახდა ამ ჩანაწერის ნაწილი **არ არის**.

- Commit `b8d7bf8`, გაგზავნილია `origin/main`-ზე. Vercel Production deployment: Ready. დომენი: https://blades-psi.vercel.app/
- Production SQL შესრულდა ხელით და წარმატებით: `docs/sql/add-checkout-idempotency.sql`, `docs/sql/create-checkout-order.sql`. აპლიკაცია ამ ფაილებს თვითონ არ უშვებს
- ამ SQL ფაილების სათაურის კომენტარები კვლავ ამბობს, რომ idempotency სკრიპტი არ გაშვებულა და `create_checkout_order` შეგნებულად უცვლელია. კომენტარები ამ დოკუმენტაციით არ შეცვლილა. ოპერატორმა ორივე ფაილის Production-ში გაშვება დაადასტურა
- `createOrder` იძახებს 10-არგუმენტიან `public.create_checkout_order`-ს (`SECURITY INVOKER`; `EXECUTE` მხოლოდ `service_role`). ერთ ტრანზაქციაში იკეტება პროდუქტის რიგები, სერვერზე ითვლება ეფექტური ფასი და ჯამი, იწერება `pending` / `unpaid` შეკვეთა და `order_items`, და მცირდება მარაგი. ცალკე insert-ი და ნაწილობრივი კომპენსაცია ამ გზაზე აღარ არის
- კლიენტის ფასი, მარაგი და ჯამი ავტორიტეტი არ არის. `user_id` მოდის მხოლოდ სერვერის სესიიდან. Guest რჩება `NULL`. `validateOrder` და UUID v4 შემოწმება RPC-მდე სრულდება
- Checkout-ის გასაღები ინახება `sessionStorage`-ში (`blades.checkout.idempotency.v1`). იგივე მონაცემები იმავე გასაღებს იყენებს; შეცვლილი მონაცემები ახალ გასაღებს იღებს; წარმატების შემდეგ გასაღები იშლება
- fingerprint სერვერზე ითვლება ნორმალიზებული ველებიდან. ფასი და მარაგი მასში არ შედის. იგივე გასაღები და იგივე fingerprint აბრუნებს არსებულ `order_id`-ს, მარაგის მეორე შემცირების გარეშე. განსხვავებული მოთხოვნა იწვევს `checkout:idempotency_conflict`. იდენტობა მოწმდება მარაგის ხელახალ შემოწმებამდე. ეს გასაღები არ არის BOG `Idempotency-Key` და არ არის `payment_provider_order_id`
- **Verified:** Production შეკვეთა `#10003` შეიქმნა ლოკალური development-იდან Production-ის წინააღმდეგ. `#10004` შეიქმნა განთავსებული Production საიტიდან. `#10004` Supabase-ში: `pending`, Freetiger FT961-CF, რაოდენობა 1, ჯამი 90 GEL, ამ პროდუქტის მიმდინარე მარაგი 0, idempotency key არსებობს
- **დამოუკიდებლად Verified არ არის:** ზუსტი მარაგის შემცირების დელტა, ერთდროული მოთხოვნები და Production-ში იგივე გასაღებით გამეორება
- `payment_status` შექმნისას რჩება `unpaid`. Checkout BOG-ს არ იძახებს. Callback route კვლავ აბრუნებს HTTP **503**-ს

---

## დაუნომრავი — `a0e3bc2` YouTube hydration (Home)

**Implemented.** **Verified** მხოლოდ Cursor-ის ლოკალურ შემოწმებაში, ამ კონკრეტული შეუსაბამობისთვის. პროექტის ყველა შესაძლო hydration პრობლემა ამით დასრულებულად არ ითვლება.

- ფაილი: `src/components/home/LatestYoutubeVideos.tsx`
- მიზეზი: Home-ის YouTube `Suspense` boundary ზოგჯერ `LanguageProvider`-ის `localStorage` ეფექტის შემდეგ ჰიდრირდებოდა. სერვერის ტექსტი იყო `უახლესი ვიდეოები`, კლიენტისა კი `Latest videos`, როცა შენახული ენა `en` იყო
- გადაწყვეტა: კომპონენტის საკუთარი `hasMounted`. პირველი render ემთხვევა სერვერის `ka` ტექსტს. მაუნთის შემდეგ გამოიყენება მომხმარებლის არჩეული KA/EN ენა, მათ შორის სათაური, აღწერა, ღილაკები და თარიღი
- შენარჩუნებულია `Suspense`, YouTube RSS, cache fallback, ვიდეოები და ენის გადართვა
- `suppressHydrationWarning` არ გამოყენებულა

---

## დაუნომრავი — `00c1bf0` BOG-05C Create Order-ის მომზადება

**Implemented** კოდში. **არ არის Verified** ცოცხალ ბანკთან. BOG ინტეგრაცია **დასრულებული არ არის**.

- `src/lib/orders/prepare-bog-create-order.ts`
- `prepareOnlineBogCreateOrderInput` კითხულობს შენახულ `online` შეკვეთას და `order_items`-ს. `orders.id` არის `external_order_id` და `Idempotency-Key`. ვალუტა `GEL`. `capture: "automatic"`. `callback_url` მოდის server-only `BOG_CALLBACK_URL`-იდან (აბსოლუტური `https`; request Origin არ გამოიყენება)
- `createOnlineBogOrder` იძახებს არსებულ `createBogOrder`-ს. Checkout ამ ფუნქციებს არ იყენებს
- stock, შეკვეთის სტატუსი და `payment_status` არ იცვლება. `payment_provider_order_id` არ იწერება
- Create Order-ის `capture` მნიშვნელობაა `"automatic"` ან `"manual"`
- `BOG_CALLBACK_URL` კოდში სავალდებულო სახელია, როცა helper ეშვება. ამ დოკუმენტაციით არ დასტურდება, რომ ცვლადი გარემოში დაყენებულია
- ცოცხალი OAuth, Create Order, Payment Details ან Callback გამოძახება ამ ეტაპზე დადასტურებული არ არის
- Callback route კვლავ აბრუნებს HTTP **503**-ს და ცოცხალი გადახდებისთვის მზად არ არის

---

## v1.45.0 — BOG Payment Details + Callback (not production)

Code on top of the S7C-6 foundation (v1.39.0). Checkout, `createOrder`,
stock, and `payment_status` are unchanged. The BOG integration is **not**
complete.

### Code

- OAuth remains `src/lib/payments/bog/auth.ts` (official token URL, HTTP
  Basic, `grant_type=client_credentials`)
- Create Order remains `src/lib/payments/bog/create-order.ts` (official
  `POST /payments/v1/ecommerce/orders`). Our helper requires a UUID v4
  `Idempotency-Key` and `external_order_id`; the bank marks both optional
- Payment Details: `src/lib/payments/bog/receipt.ts` —
  `GET /payments/v1/receipt/{order_id}`
- Callback: `src/lib/payments/bog/callback.ts` verifies
  `Callback-Signature` on the raw body before JSON parse (published RSA
  key, SHA256withRSA). Route: `POST /api/payments/bog/callback`

### Verification level

- Compared by reading the code against the official Payments docs
- No automated tests in the repo
- No live OAuth, Create Order, Payment Details, or Callback call to BOG
- Base64 for `Callback-Signature` is an assumption; not confirmed on a
  real callback
- The route returns **503** after a valid signature and receipt. It is
  not production-ready. HTTP 200 belongs only after amount, currency,
  and order ids match the local order and payment status is updated
  safely

Still open: Checkout wiring, that comparison, and the status update.

---

## v1.44.0 — ProductCard gallery hover trigger

ProductCard thumbnail preview still slides down over the **content**
area (title / price / Add-to-Cart). Trigger scope is no longer
article-level `group-hover`.

- Opens only from MAIN image hover (`isGalleryPreviewOpen`)
- Stays open while the pointer moves from the image onto the overlay
  (120ms delayed close, `GALLERY_PREVIEW_CLOSE_MS`) so thumbnails remain
  reachable
- Overlay hover keeps it open; thumb `onMouseEnter` still sets
  `activeImage`
- Hovering title / price / Add-to-Cart alone does **not** open it
- Leaving the image + overlay region closes it; Add-to-Cart is then
  clickable
- `isCardHovered` still drives MAIN zoom only
- Unchanged: overlay placement/styles, wishlist, sale badge, navigation,
  `sortProductImages`, pricing, PDP `ProductGallery`

---

## v1.43.0 — YouTube RSS persistent fallback

Home Latest YouTube Videos keep showing the last successful 1–3 videos
when the public Atom feed degrades. UI, channel ID, timeout (8000ms),
and `revalidate` (1800) are unchanged. No YouTube Data API / API key.

### Diagnosis

- Feed `https://www.youtube.com/feeds/videos.xml?channel_id=UCV4ORvOeTcfirolaMQ5P86w`
  was observed returning **HTTP 404** (`YouTube RSS Feeds server`)
- Fetcher used to return `[]` on HTTP/empty/parse/timeout/network failure,
  so the Home video grid disappeared even though section chrome remained

### Persistent snapshot

- Live table `public.youtube_latest_videos_cache` (manual SQL Editor;
  history `docs/sql/create-youtube-latest-videos-cache.sql`)
- Singleton `id = bladesge`; `videos` jsonb (1–3 items); RLS on;
  `anon` / `authenticated` **REVOKE ALL**
- Server-only `createAdminClient()` via
  `src/lib/youtube/latest-videos-cache.ts`
- RSS **success** → parse → upsert snapshot → return fresh videos
  (write failure: `console.error`, still return fresh)
- RSS **failure** → read snapshot → cached videos or `[]`
- Snapshot rows are DB state, not hardcoded source

### Logging

- Recoverable RSS degradation: `console.warn` (avoids Next.js dev
  Console Error overlay)
- Cache/persistence failures remain `console.error`

Verified on production (`blades-psi.vercel.app`) with RSS 404 and
cached videos still rendering.

---

## v1.42.0 — ProductCard 4:3 + PDP gallery layout

Storefront ProductCard and PDP `ProductGallery` image UX. Catalog queries,
`sort_order` / `is_main`, Supabase storage, Checkout, and Payments are
unchanged. Next/Image `sizes` / LCP / preload warnings are **not**
resolved in this version.

### ProductCard (`src/components/product/ProductCard.tsx`)

- MAIN wrapper: `aspect-[4/3]` (was `aspect-square`). Storefront source
  photos are practically 4:3 (measured example ~314×235, ratio ~1.336);
  1:1 + `object-cover` cropped the sides
- MAIN Image still `object-cover object-center` + Next/Image `fill`
- Gradient: `from-black/50 via-black/10 to-transparent`
- Hover thumbs moved off the MAIN image onto a content-area overlay
  (slide-down `-translate-y-full` → `translate-y-0`, `duration-500
  ease-out`; `bg-white/60` / `dark:bg-zinc-950/60`)
- Title / price / Add-to-Cart stay in the DOM (not `hidden` / `opacity-0`)
- Thumb hover still sets `activeImage` (`sortProductImages` order)
- Per-image zoom: each new `activeImage` starts at `scale-100`, then
  `scale-[1.07]` (107%; was 110%)

### PDP gallery (`src/components/product/ProductGallery.tsx`)

- `< lg`: MAIN image free of overlay; thumbs below in a horizontal
  `overflow-x-auto` row; `onClick` + existing `onMouseEnter`; active
  thumb `border-brand-gold`
- `lg+`: vertical `4rem` rail left of MAIN (`lg:grid-cols-[4rem_minmax(0,1fr)]`
  `lg:gap-2`); not an image overlay; `h-16 w-16` thumbs; many images
  `overflow-y-auto` inside MAIN height; `overflow-x-hidden` (no
  horizontal scrollbar)
- MAIN still `aspect-[4/3]` `object-cover`; desktop mouse-position zoom
  unchanged (`pointer: fine` + `hover: hover`; no zoom on touch)

### PDP container (`src/app/(shop)/products/[id]/page.tsx`)

- Inner grid: `max-w-[1352px]` (was `max-w-7xl` / 1280px)
- Unchanged: `lg:grid-cols-[1.05fr_0.95fr]` `lg:gap-14`

---

## v1.41.0 — Contact form + storefront visual polish

Public Contact form and storefront chrome shipped in `7d61c2c`. Catalog
queries, Checkout, Payments, and Order Confirmation Email are unchanged.

### Contact

- `/contact` form wired in `ContactPageContent` to `submitContactMessage`
- Server validation (name / email / message / field length); honeypot
  `company`; submit loading / success / error states
- KA/EN `contactForm*` dictionary keys (sending, success, failures)
- Delivery via Resend to `STORE_CONTACT.email`
- Server-only env: `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`
- Submissions are **not** stored in the database
- This is **not** Order Confirmation Email

### Storefront / light theme

- Body light background `#eeeeee`
- `FeatureStrip` light surfaces / cards
- Featured catalog section: `dark:bg-black/25` (no forced light black wash)
- Footer light background `bg-zinc-200`
- Header desktop gold active nav: Home / Products / Brands / Contact

### Logo visual

- Header: white `rounded-lg` badge; Light black border; Dark transparent
  border; artwork `145px` → `175px` → `220px`
- Footer: white `rounded-lg` badge; Light black border; Dark transparent
  border; artwork `150px` → `180px` → `230px` → `240px`

### Toolbar

- Filters: `248px` × `40px`, `px-3`, `top-[4px]`
- Search: `40px` (`h-10`)
- HeaderExtras reserved slot: `272px` = `248px` Filters + `24px` gap

### Localization

- `ka` `discoverProducts` = `"რეკომენდებული"`

---

## v1.40.0 — Home Latest YouTube Videos

Replaced the Home starter `PromoBanner` CTA with the official Bladesge
YouTube channel’s latest three videos. Catalog, Promo Slider CMS,
Checkout, and Payments are unchanged.

- `src/lib/youtube/fetch-latest-videos.ts` — public Atom feed
  (`channel_id=UCV4ORvOeTcfirolaMQ5P86w`); server `fetch`;
  `revalidate: 1800`; no API key
- Home fetches alongside existing page data; `LatestYoutubeVideos`
  at the former `PromoBanner` slot
- New YouTube publish needs no code, Admin, or redeploy (after cache)
- Feed errors → empty list; Home still renders (heading + channel CTA)
- Thumbnails on first paint; iframe only after play; one player max
- KA/EN section copy in dictionaries; titles remain YouTube’s strings
- Starter `PromoBanner.tsx` and unused `promo*` keys removed

---

## v1.39.0 — S7C-6 BOG Authentication + Payment Initiation Foundation

Reusable server-only Bank of Georgia helpers. Checkout, `createOrder`,
stock, and redirect behavior are unchanged. No live charge, callback,
or DB write of BOG ids.

- Isolated module: `src/lib/payments/bog/`
- OAuth token: official `POST` OpenID token URL, HTTP Basic
  (`client_id:client_secret`), `grant_type=client_credentials`
- Create Order: official `POST https://api.bog.ge/payments/v1/ecommerce/orders`
  with confirmed fields only (`callback_url`, `external_order_id`,
  `purchase_units`, optional `redirect_urls`, `Accept-Language`)
- Response used later: BOG `id` + `_links.redirect.href`
- Server-only env names: `BOG_CLIENT_ID`, `BOG_CLIENT_SECRET`
  (never `NEXT_PUBLIC_*`; values not stored in the repo)
- Errors: configuration / authentication / network / malformed; no
  secrets or access tokens in messages or logs
- Next: review this foundation before Checkout wiring

---

## v1.38.0 — S7C-5 Payment Persistence Foundation

Additive nullable `orders.payment_provider_order_id` TEXT. Checkout,
stock, and payment runtime are unchanged. BOG API integration is **not**
started.

- S7C-4 Targeted Payment Implementation Inspection is complete.
- `payment_provider_order_id` is **LIVE / executed** in Supabase
  (SQL Editor; `Success. No rows returned`). History file:
  `docs/sql/add-orders-payment-provider-order-id.sql`. Type TEXT, nullable,
  no default, no index, no extra CHECK.
- Intended later use: BOG `order_id`. Existing
  `payment_transaction_id` remains the final provider transaction id
  (BOG `payment_detail.transaction_id`). Existing payment columns
  unchanged.
- `createOrder` / `orderMapper` still omit the new field; new orders stay
  `NULL` until a later initiation step writes it. `payment_status`
  remains `"unpaid"` at create.
- Next: S7C-6 — BOG Authentication + Payment Initiation Foundation.

---

## v1.37.0 — Storefront UI / typography polish

Working-tree storefront visual checkpoint. No schema, SQL, RLS, Storage,
pricing, catalog, Cart, Checkout, Auth, Admin business, or dependency
change.

- **ProductCard:** denser internal spacing; square image area
  (`aspect-square`); restrained responsive title size; existing title
  clamp and price / Add-to-Cart alignment kept. Add-to-Cart and stock
  behavior unchanged.
- **Radius:** storefront cards/panels generally `rounded-xl`; nested
  thumbs generally `rounded-lg`; Promo/Hero posters `rounded-2xl`; pills
  / circular controls `rounded-full`. Not a blind global replace; Admin
  was not broadly redesigned.
- **Section headings:** Sale / Latest Products / Featured Products share
  one gold heading each (no duplicate eyebrow + title). Restrained
  responsive size. EN uppercase via CSS `text-transform` only;
  dictionaries stay title case. KA copy unchanged.
- **Fonts:** local `src/fonts/` BPG Glaho Sylfaen (KA body/UI) and BPG
  Nino Mtavruli Bold (KA display) via `next/font/local`. EN body remains
  Inter; EN display is Barlow Condensed (`next/font/google`, weights
  600 / 700 / 900). Playfair Display was removed after it stopped serving
  any remaining usage. `font-serif` was not globally remapped.
- **Language-aware CSS:** `LanguageProvider` still owns language and now
  sets root `html lang` (`ka` / `en`). Body/UI vs display vs primary nav
  follow that root state.
- **Display pairing:** product-tile names (ProductCard, Sale slider,
  Wishlist) and primary Header nav use KA Nino / EN Barlow Condensed. Product-name
  colors, title sizes, clamp, and layout unchanged. Prices stay outside
  the display system. Nav gold active-route state unchanged.
- Sale Slider Embla/breakpoints, Promo CMS/autoplay, product queries, and
  `ProductPrice` logic are unchanged.

---

## v1.36.0 — Promo Slider #1 CMS (live)

- Homepage Promo Slider #1 is **database-backed**. SQL
  `docs/sql/create-promo-banners.sql` was **executed** in the Supabase SQL
  Editor (app never auto-applies). Table `public.promo_banners` and bucket
  `promo-banners` are live. Public SELECT RLS = active rows only.
- Required `image_path`; optional KA/EN title/subtitle (all four may be
  empty — image-only posters are valid); optional internal `link_url`;
  `is_active`; internal `sort_order`; `created_at` / `updated_at`.
- Admin `/admin/promos` list / create / edit / delete. Mutations and
  Admin reads use `requireAdmin()` + `createAdminClient()`. Image
  required on create; replace uploads the new object first, then updates
  the row, then removes the old key. Delete removes the DB row, reindexes
  remaining banners to contiguous `1..N`, then cleans the owned storage
  object.
- `sort_order` is **not** an Admin form field. Create appends after all
  rows (including inactive). Edit preserves position. Inactive banners
  keep their Admin order; storefront still fetches only `is_active = true`.
- Storefront `getActivePromoBanners()`: `is_active = true`,
  `sort_order ASC`, `created_at ASC`. Zero banners: omit Promo (no fake
  placeholder); Sale keeps the remaining hero width. One banner: no
  carousel controls and no autoplay. 2+: existing Embla, loop, one at a
  time, prev/next + dots, ~5s autoplay (`PROMO_AUTOPLAY_INTERVAL_MS`).
  Prev/Next/dot clicks reset the interval. Hover, keyboard focus inside
  the slider, and a hidden document pause autoplay; reduced-motion
  disables it. Sale Slider loop/autoplay unchanged.
- Overlay uses current language with fallback to the other; both empty →
  image only. `link_url` must be an internal path; external URLs rejected.
- Sale Slider query/breakpoints, effective-price catalog, Cart, and
  Checkout are unchanged. Footer `PromoBanner.tsx` CTA is unrelated.

---
