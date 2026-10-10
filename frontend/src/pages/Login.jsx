import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={next} replace />;

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login({ email, password });
      navigate(next);
    } catch (err) {
      setError(err.message || "Could not log in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8">
      <p className="text-xs uppercase tracking-[0.18em] text-moss">Account</p>
      <h1 className="mt-2 font-display text-4xl">Log in</h1>
      <p className="mt-3 text-sm text-ink/60">Use your Northline account to complete checkout.</p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <label className="text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
            placeholder="you@college.edu"
          />
        </label>
        <label className="text-sm">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={busy} className="rounded-full bg-ink px-5 py-3 text-sm text-white disabled:opacity-60">
          {busy ? "Signing in..." : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink/60">
        New here?{" "}
        <Link to={`/signup?next=${encodeURIComponent(next)}`} className="text-moss">
          Create an account
        </Link>
      </p>
    </div>
  );
}
