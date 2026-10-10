import { Link } from "react-router-dom";
import ProductGrid from "../components/ProductGrid.jsx";
import { PRODUCTS } from "../data/products.js";

export default function Home() {
  return (
    <div>
      <section className="grid items-center gap-10 rounded-[2rem] bg-ink px-8 py-14 text-white lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">Predictive intervention demo</p>
          <h1 className="mt-4 font-display text-5xl leading-tight">
            Predict cart abandonment before the customer leaves, then offer a reason to stay.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/70">
            Mouse speed, checkout hovering, idle time, and scrolling go to a Random Forest. If risk
            rises, the shop can show 10% off or free delivery — before the cart is abandoned.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/products" className="rounded-full bg-white px-5 py-3 text-sm text-ink">
              Browse products
            </Link>
            <Link to="/demo" className="rounded-full border border-white/20 px-5 py-3 text-sm">
              Open demo lab
            </Link>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1400&q=80"
          alt="Laptop on a wooden desk"
          className="h-80 w-full rounded-3xl object-cover"
        />
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-moss">Featured</p>
            <h2 className="font-display text-3xl">A small, complete catalog</h2>
          </div>
          <Link to="/products" className="text-sm text-moss">
            View all
          </Link>
        </div>
        <ProductGrid products={PRODUCTS.slice(0, 6)} />
      </section>
    </div>
  );
}
