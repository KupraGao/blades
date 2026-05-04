import { products } from "@/data/products";
import { ProductCard } from "./ProductCard";

export function ProductSection() {
  return (
    <section id="products" className="section-pad bg-black/25">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="small-label">featured products</p>
            <h2 className="section-title mt-3">რჩეული პროდუქტები</h2>
            <p className="section-subtitle">
              ეს ქარდები არის reusable კომპონენტი. შემდეგ ეტაპზე აქ დავამატებთ ფილტრს, ძებნას და პროდუქტის გვერდს.
            </p>
          </div>

          <a href="#" className="btn-primary w-fit">
            კატალოგში გადასვლა
          </a>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.title} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
