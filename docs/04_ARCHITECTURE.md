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
│   └── products
│       ├── change-main-image.ts
│       ├── create-product.ts
│       ├── delete-gallery-image.ts
│       ├── delete-product.ts
│       ├── delete-products-bulk.ts
│       ├── get-products.ts
│       ├── get-single-product.ts
│       ├── update-product-categories-bulk.ts
│       └── update-product.ts
│
├── app
│   │
│   ├── (shop)
│   │   ├── cart
│   │   ├── products
│   │   ├── wishlist
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── admin
│   │   ├── brands
│   │   ├── categories
│   │   ├── products
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
│   ├── common
│   │   ├── CategoriesSidebar.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── ThemeToggle.tsx
│   │
│   ├── home
│   │   ├── FeatureStrip.tsx
│   │   ├── Hero.tsx
│   │   ├── HomeClient.tsx
│   │   └── PromoBanner.tsx
│   │
│   ├── layout
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HeaderExtras.tsx
│   │   ├── MobileMenuDrawer.tsx
│   │   ├── SubHeader.tsx
│   │   └── ThemeProvider.tsx
│   │
│   ├── product
│   │   ├── LatestProductsSlider.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetailsContent.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── ProductPurchaseActions.tsx
│   │   ├── ProductSectionClient.tsx
│   │   └── ProductSlide.tsx
│   │
│   └── wishlist
│       └── WishlistPageContent.tsx
│
├── context
│   ├── CartContext.tsx
│   ├── CartDrawer.tsx
│   ├── LanguageContext.tsx
│   └── WishlistContext.tsx
│
├── data
│   ├── categories.ts
│   └── products.ts
│
├── dictionaries
│   ├── en.ts
│   └── ka.ts
│
├── lib
│   │
│   ├── data
│   │   └── products.ts
│   │
│   ├── products
│   │   ├── attach-product-categories.ts
│   │   ├── change-main-image-record.ts
│   │   ├── delete-gallery-image-record.ts
│   │   ├── insert-main-image.ts
│   │   ├── insert-product.ts
│   │   ├── parse-product-form.ts
│   │   ├── product-mapper.ts
│   │   ├── update-product-record.ts
│   │   ├── upload-gallery-images-record.ts
│   │   ├── upload-gallery-images.ts
│   │   ├── upload-main-image.ts
│   │   └── validate-product.ts
│   │
│   └── supabase
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

productMapper

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