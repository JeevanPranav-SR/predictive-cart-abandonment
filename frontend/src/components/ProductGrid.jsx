import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <p className="text-ink/60">No products in this category.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
