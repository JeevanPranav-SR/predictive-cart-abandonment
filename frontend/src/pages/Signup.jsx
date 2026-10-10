import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") || "/";
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={next} replace />;

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Enter a 10-digit Indian mobile number.");
      return;
    }
    setBusy(true);
    try {
      await signup(form);
      navigate(next);
    } catch (err) {
      setError(err.message || "Could not create the account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8">
      <p className="text-xs uppercase tracking-[0.18em] text-moss">Account</p>
      <h1 className="mt-2 font-display text-4xl">Sign up</h1>
      <p className="mt-3 text-sm text-ink/60">Compulsory details are needed before you can place an order.</p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <label className="text-sm">
          Full name *
          <input
            required
            minLength={2}
            value={form.full_name}
            onChange={(event) => update("full_name", event.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
            placeholder="Your name"
          />
        </label>
        <label className="text-sm">
          Email *
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
            placeholder="you@college.edu"
          />
        </label>
        <label className="text-sm">
          Mobile number *
          <input
            required
            inputMode="numeric"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value.replace(/\D/g, "").slice(0, 10))}
            className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
            placeholder="9876543210"
          />
        </label>
        <label className="text-sm">
          Password *
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
            placeholder="At least 6 characters"
          />
        </label>
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={busy} className="rounded-full bg-ink px-5 py-3 text-sm text-white disabled:opacity-60">
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink/60">
        Already have an account?{" "}
        <Link to={`/login?next=${encodeURIComponent(next)}`} className="text-moss">
          Log in
        </Link>
      </p>
    </div>
  );
}
