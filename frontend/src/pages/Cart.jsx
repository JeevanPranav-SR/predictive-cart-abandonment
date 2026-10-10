import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem.jsx";
import SessionStatus from "../components/SessionStatus.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useTracking } from "../context/TrackingContext.jsx";
import { formatMoney } from "../utils/features.js";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, discount, total, appliedOffer, clearCart } = useCart();
  const { simulateAbandonment } = useTracking();
  const navigate = useNavigate();

  async function onAbandon() {
    await simulateAbandonment();
    clearCart();
    navigate("/demo", { state: { justAbandoned: true } });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <section>
        <h1 className="font-display text-4xl">Cart</h1>
        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8">
            <p>Your cart is empty.</p>
            <Link to="/products" className="mt-4 inline-block text-moss">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} onQuantity={updateQuantity} onRemove={removeItem} />
            ))}
          </div>
        )}
      </section>
      <aside className="space-y-4">
        <div className="rounded-3xl bg-white p-6">
          <p className="text-sm text-ink/50">Subtotal</p>
          <p className="mt-1 text-2xl font-semibold">{formatMoney(subtotal)}</p>
          {appliedOffer && (
            <p className="mt-2 text-sm text-moss">
              {appliedOffer.title}: −{formatMoney(discount)}
            </p>
          )}
          <p className="mt-3 text-sm text-ink/50">Amount to pay</p>
          <p className="text-3xl font-semibold">{formatMoney(total)}</p>
          <Link
            id="checkout-button"
            to="/checkout"
            data-track="checkout"
            className={`mt-6 block rounded-full px-5 py-3 text-center text-sm text-white ring-offset-2 transition hover:ring-4 hover:ring-moss/30 ${
              items.length ? "bg-moss" : "pointer-events-none bg-stone-300"
            }`}
          >
            Checkout
          </Link>
          <button
            type="button"
            onClick={onAbandon}
            className="mt-3 w-full rounded-full border border-ink/10 px-5 py-3 text-sm"
          >
            Simulate Abandonment
          </button>
        </div>
        <SessionStatus />
      </aside>
    </div>
  );
}
