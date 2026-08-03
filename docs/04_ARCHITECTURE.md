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

## Folder Structure

src/

actions/

components/

context/

lib/

types/

---

## Product Flow

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

## Product Listing

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

## Admin Layout

app/admin/layout.tsx (Server)

↓

components/admin/AdminLayout.tsx (Client)

↓

AdminHeader

↓

Sidebar (Desktop)

↓

MobileSidebar (Mobile)

↓

Admin Pages

---

## Architecture Principles

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

---

## Naming Convention

actions/

↓

lib/

↓

components/

↓

pages

---

## Goal

კოდის მაქსიმალური სისუფთავე, მოდულარობა და ხელახლა გამოყენება.