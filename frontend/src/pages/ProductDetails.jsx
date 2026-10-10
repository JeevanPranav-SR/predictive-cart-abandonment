import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { getProduct } from "../data/products.js";
import { formatMoney } from "../utils/features.js";

export default function ProductDetails() {
  const { id } = useParams();
  const product = getProduct(id);
  const { addItem } = useCart();

  if (!product) {
    return (
      <div>
        <h1 className="font-display text-3xl">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-moss">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <img src={product.image} alt={product.name} className="h-[28rem] w-full rounded-[2rem] object-cover" />
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-moss">{product.category}</p>
        <h1 className="mt-3 font-display text-5xl">{product.name}</h1>
        <p className="mt-3 text-sm text-ink/55">{product.rating.toFixed(1)} / 5.0</p>
        <p className="mt-6 text-3xl font-semibold" data-price="true">
          {formatMoney(product.price)}
        </p>
        <p className="mt-5 max-w-lg text-base leading-7 text-ink/70">{product.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            data-track="add-to-cart"
            onClick={() => addItem(product)}
            className="rounded-full bg-ink px-6 py-3 text-sm text-white"
          >
            Add to Cart
          </button>
          <button
            type="button"
            data-track="add-to-cart"
            onClick={() => addItem(product)}
            className="rounded-full border border-ink/15 px-6 py-3 text-sm"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
