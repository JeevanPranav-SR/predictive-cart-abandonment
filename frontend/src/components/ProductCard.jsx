import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatMoney } from "../utils/features.js";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <article className="card-hover overflow-hidden rounded-3xl bg-white">
      <Link to={`/products/${product.id}`} data-track="product">
        <img src={product.image} alt={product.name} className="h-56 w-full object-cover" />
      </Link>
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-moss">{product.category}</p>
        <Link to={`/products/${product.id}`} data-track="product" className="mt-1 block font-display text-xl">
          {product.name}
        </Link>
        <p className="mt-2 text-sm text-ink/60">{product.rating.toFixed(1)} rating</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-semibold" data-price="true">
            {formatMoney(product.price)}
          </p>
          <button
            type="button"
            data-track="add-to-cart"
            onClick={() => addItem(product)}
            className="rounded-full bg-ink px-4 py-2 text-xs text-white"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
