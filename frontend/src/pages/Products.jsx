import { useMemo, useState } from "react";
import ProductGrid from "../components/ProductGrid.jsx";
import { CATEGORIES, PRODUCTS } from "../data/products.js";

export default function Products() {
  const [category, setCategory] = useState("All");
  const items = useMemo(
    () => (category === "All" ? PRODUCTS : PRODUCTS.filter((item) => item.category === category)),
    [category]
  );

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-moss">Catalog</p>
      <h1 className="mt-2 font-display text-4xl">Products</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setCategory(name)}
            className={`rounded-full px-4 py-2 text-sm ${
              category === name ? "bg-ink text-white" : "bg-white text-ink/70"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="mt-8">
        <ProductGrid products={items} />
      </div>
    </div>
  );
}
