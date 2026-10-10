import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import SessionStatus from "../components/SessionStatus.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useTracking } from "../context/TrackingContext.jsx";
import { api } from "../services/api.js";
import { formatMoney } from "../utils/features.js";

const EMPTY = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  payment_method: "cod",
  upi_id: "",
};

export default function Checkout() {
  const { items, discount, total, appliedOffer, clearCart } = useCart();
  const { completePurchase, simulateAbandonment, sessionId } = useTracking();
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      full_name: current.full_name || user.full_name || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || "",
    }));
  }, [user]);

  if (!ready) return <p>Loading checkout…</p>;
  if (!user) return <Navigate to="/login?next=/checkout" replace />;

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function validate() {
    if (form.full_name.trim().length < 2) return "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.phone)) return "Enter a 10-digit Indian mobile number.";
    if (form.address.trim().length < 8) return "Enter a complete delivery address.";
    if (form.city.trim().length < 2) return "City is required.";
    if (form.state.trim().length < 2) return "State is required.";
    if (!/^\d{6}$/.test(form.pincode)) return "Enter a 6-digit PIN code.";
    if (form.payment_method === "upi" && !/^[\w.\-]{2,}@[\w]{2,}$/.test(form.upi_id.trim())) {
      return "Enter a valid UPI ID, for example name@okaxis.";
    }
    return "";
  }

  async function onPurchase(event) {
    event.preventDefault();
    if (!items.length) return;
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    try {
      await api.checkout({
        ...form,
        session_id: sessionId,
        amount: total,
      });
      await completePurchase();
      clearCart();
      navigate("/success");
    } catch (err) {
      setError(err.message || "Could not place the order.");
      setBusy(false);
    }
  }

  async function onAbandon() {
    await simulateAbandonment();
    clearCart();
    navigate("/demo", { state: { justAbandoned: true } });
  }

  if (!items.length) {
    return (
      <div className="rounded-3xl bg-white p-8">
        <h1 className="font-display text-3xl">Checkout</h1>
        <p className="mt-3 text-ink/60">Add a product before completing a purchase.</p>
        <Link to="/products" className="mt-4 inline-block text-moss">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={onPurchase} className="rounded-3xl bg-white p-6" noValidate>
        <h1 className="font-display text-4xl">Checkout</h1>
        <p className="mt-2 text-sm text-ink/55">
          All delivery details marked * are compulsory. Card numbers are not collected. Signed in as{" "}
          {user.full_name}.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full name *">
            <input required minLength={2} value={form.full_name} onChange={(event) => update("full_name", event.target.value)} className="input" />
          </Field>
          <Field label="Email *">
            <input type="email" required value={form.email} onChange={(event) => update("email", event.target.value)} className="input" />
          </Field>
          <Field label="Mobile number *">
            <input
              required
              inputMode="numeric"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value.replace(/\D/g, "").slice(0, 10))}
              className="input"
              placeholder="9876543210"
            />
          </Field>
          <Field label="PIN code *">
            <input
              required
              inputMode="numeric"
              value={form.pincode}
              onChange={(event) => update("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="input"
              placeholder="560001"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Delivery address *">
              <input
                required
                minLength={8}
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
                className="input"
                placeholder="House / street / landmark"
              />
            </Field>
          </div>
          <Field label="City *">
            <input required value={form.city} onChange={(event) => update("city", event.target.value)} className="input" placeholder="Bengaluru" />
          </Field>
          <Field label="State *">
            <input required value={form.state} onChange={(event) => update("state", event.target.value)} className="input" placeholder="Karnataka" />
          </Field>
          <div className="sm:col-span-2">
            <p className="text-sm">Payment method *</p>
            <div className="mt-2 flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="payment_method"
                  checked={form.payment_method === "cod"}
                  onChange={() => update("payment_method", "cod")}
                />
                Cash on Delivery
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="payment_method"
                  checked={form.payment_method === "upi"}
                  onChange={() => update("payment_method", "upi")}
                />
                UPI
              </label>
            </div>
          </div>
          {form.payment_method === "upi" && (
            <div className="sm:col-span-2">
              <Field label="UPI ID *">
                <input
                  required
                  value={form.upi_id}
                  onChange={(event) => update("upi_id", event.target.value)}
                  className="input"
                  placeholder="name@okaxis"
                />
              </Field>
            </div>
          )}
        </div>
        {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}
        <button
          id="checkout-button"
          type="submit"
          data-track="checkout"
          disabled={busy}
          className="mt-6 w-full rounded-full bg-moss px-5 py-3 text-sm text-white ring-offset-2 transition hover:ring-4 hover:ring-moss/30 disabled:opacity-60"
        >
          {busy ? "Placing order..." : `Pay ${formatMoney(total)}`}
        </button>
        <button type="button" onClick={onAbandon} className="mt-3 w-full rounded-full border border-ink/10 px-5 py-3 text-sm">
          Simulate Abandonment
        </button>
      </form>
      <aside className="space-y-4">
        <div className="rounded-3xl bg-white p-6">
          <h2 className="font-display text-2xl">Order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatMoney(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          {appliedOffer && (
            <p className="mt-3 text-sm text-moss">
              {appliedOffer.title}: −{formatMoney(discount)}
            </p>
          )}
          <p className="mt-4 text-sm text-ink/50">Amount to pay</p>
          <p className="text-xl font-semibold">{formatMoney(total)}</p>
        </div>
        <SessionStatus />
      </aside>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="text-sm">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
