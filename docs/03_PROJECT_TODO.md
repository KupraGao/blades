# მიმდინარე სამუშაო

## რა არის ეს ფაილი?

აქ არის მხოლოდ დარჩენილი სამუშაო, პრიორიტეტი და სტატუსი.

დასრულებული სპრინტის ძველი ჩანაწერი: [archive/PROJECT_TODO_SNAPSHOT.md](archive/PROJECT_TODO_SNAPSHOT.md). ის მიმდინარე სტატუსი არ არის.

განხორციელებული ისტორია: [06_CHANGELOG.md](06_CHANGELOG.md). ეტაპები: [02_ROADMAP.md](02_ROADMAP.md). მოწყობა: [04_ARCHITECTURE.md](04_ARCHITECTURE.md).

სტატუსის მნიშვნელობა: **Implemented** კოდშია; **Verified** კონკრეტული შემოწმებით დასტურდება; **Planned** დაგეგმილია; **Deferred** გადადებულია; **Known issue** ცნობილი პრობლემაა.

---

## 1. BOG — ახლა (**Implemented** ნაწილობრივ, ინტეგრაცია დაუსრულებელია)

BOG ინტეგრაცია **დასრულებული არ არის**. Callback URL production-ში არ უნდა დარეგისტრირდეს, სანამ route HTTP 200-ს მხოლოდ უსაფრთხო ლოკალური განახლების შემდეგ აბრუნებს.

**Implemented**, commit `00c1bf0` და წინა საფუძველი:

- OAuth, Create Order, Payment Details და Callback-ის კოდი `src/lib/payments/bog/`-ში
- `prepareOnlineBogCreateOrderInput` და `createOnlineBogOrder` — `src/lib/orders/prepare-bog-create-order.ts`
- server-only `BOG_CALLBACK_URL`: აბსოლუტური `https`; request Origin არ გამოიყენება
- Create Order-ში `capture` (`"automatic"` | `"manual"`). helper იყენებს `"automatic"`
- `orders.id` არის `external_order_id` და `Idempotency-Key`. კალათა და ჯამი შენახული `orders` / `order_items`-იდანაა. ვალუტა `GEL`. მხოლოდ `payment_method = online`

**არ არის Verified:**

- ცოცხალი OAuth, Create Order, Payment Details ან Callback ბანკთან
- `BOG_CLIENT_ID`, `BOG_CLIENT_SECRET` ან `BOG_CALLBACK_URL` გარემოში დაყენებულია თუ არა. დოკუმენტირებულია მხოლოდ სახელები

**Known issue:**

- `POST /api/payments/bog/callback` ვალიდური ხელმოწერისა და receipt-ის შემდეგაც აბრუნებს HTTP **503**-ს. ცოცხალი გადახდებისთვის მზად არ არის
- `Callback-Signature`-ის Base64 კოდირება რეალურ callback-ზე დადასტურებული არ არის

**Planned**, ამ ეტაპის შემდეგი სამუშაო:

1. Checkout-იდან მხოლოდ `online` შეკვეთის BOG-ზე დაკავშირება. `pay_at_pickup` BOG-ზე არ მიდის
2. ბანკის Order ID-ის ჩაწერა `payment_provider_order_id`-ში. ახლა helper ამ სვეტს არ წერს
3. Callback-ის შემდეგ თანხის, ვალუტის და შეკვეთის იდენტიფიკატორების სერვერზე შედარება და გადახდის სტატუსის იდემპოტენტური განახლება
4. რეალური ბანკის გადახდის end-to-end შემოწმება

ბრაუზერის redirect ან ახლანდელი 503 callback შეკვეთას `paid`-ად არ მონიშნავს. BOG helper-ები stock-სა და `payment_status`-ს არ ცვლის. Checkout-ის შექმნა ცალკეა: იქ `payment_status` რჩება `unpaid`, ხოლო მარაგი მცირდება `create_checkout_order` ტრანზაქციაში. იხილე შემდეგი სექცია.

---

## 2. Checkout შეკვეთის შექმნა (**Implemented**; Production-ში ნაწილობრივ **Verified**)

Commit `b8d7bf8`, `origin/main`. Vercel Production: Ready, https://blades-psi.vercel.app/

Production-ში ხელით გაშვებულია `docs/sql/add-checkout-idempotency.sql` და `docs/sql/create-checkout-order.sql`. `createOrder` იძახებს 10-არგუმენტიან RPC-ს. ფასი, ჯამი, სტატუსი და მარაგი სერვერისაა. UUID v4 გასაღები და fingerprint იგივე ტრანზაქციაშია. ეს BOG გადახდა არ არის.

**Verified:** `#10003` შეიქმნა ლოკალური development-იდან Production-ის წინააღმდეგ. `#10004` შეიქმნა განთავსებული საიტიდან. `#10004`: `pending`, Freetiger FT961-CF, რაოდენობა 1, ჯამი 90 GEL, პროდუქტის მიმდინარე მარაგი 0, idempotency key არსებობს.

**დამოუკიდებლად Verified არ არის:** ზუსტი მარაგის დელტა, concurrency და Production replay. Guest `createOrder` abuse controls კვლავ **Planned**-ია.

---

## 3. YouTube hydration — Home (**Implemented**, ლოკალურად **Verified**)

Commit `a0e3bc2`. ფაილი: `src/components/home/LatestYoutubeVideos.tsx`.

დაგვიანებული `Suspense` boundary და KA/EN `localStorage` ენა ტექსტს აღარ შლის ამ სექციაში. პირველი render სერვერის `ka` ტექსტს ემთხვევა; შემდეგ გამოიყენება არჩეული ენა. `Suspense`, RSS და cache fallback შენარჩუნებულია.

Cursor-ის ლოკალურ შემოწმებაში ამ YouTube შეუსაბამობა აღარ გამოჩენილა. ეს არ ნიშნავს, რომ პროექტის ყველა hydration პრობლემა მოგვარებულია.

---

## 4. გადადებული და შემდეგი (**Deferred** / **Planned**)

დეტალური ეტაპები: [02_ROADMAP.md](02_ROADMAP.md).

- **Planned:** Checkout BOG redirect და ზემოთ ჩამოთვლილი გადახდის დახურვა
- **Planned:** refunds; ავტომატური `paid` მხოლოდ სერვერზე დადასტურებული სტატუსით
- **Planned:** Order Confirmation email Guest და Customer მისამართზე
- **Planned:** Guest `createOrder` abuse controls. შეკვეთის ტრანზაქცია და idempotency ინფრასტრუქტურა სექცია 2-შია; Production replay დამოუკიდებლად დადასტურებული არ არის
- **Deferred:** მომხმარებლის ელფოსტის შეცვლა; Admin-ის მიერ მომხმარებლის რედაქტირება, წაშლა, ban, invite; Admin-ის პაროლი და როლები
- **Deferred:** კლიენტის მხრიდან შეკვეთის გაუქმება ან რედაქტირება; ინვოისი; კუპონები; გადასახადები; მიწოდების ფასი 150 GEL მინიმუმის და უფასო თბილისის მიწოდების გარდა
- **Deferred:** Dashboard analytics; SEO / metadata / sitemap
- **Deferred:** შეკვეთის სამუდამო წაშლა. ეს ახლანდელი არქიტექტურის ნაწილი არ არის
