import { useState } from "react";
import { useLocation } from "react-router-dom";
import SessionStatus from "../components/SessionStatus.jsx";
import { api } from "../services/api.js";

const buttons = [
  { level: "low", label: "Simulate Low Risk" },
  { level: "medium", label: "Simulate Medium Risk" },
  { level: "high", label: "Simulate High Risk" },
];

export default function Demo() {
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function run(level) {
    setBusy(level);
    setError("");
    try {
      const data = await api.simulate(level);
      setResult(data);
    } catch (err) {
      setError(err.message || "Prediction temporarily unavailable");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] bg-white p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-moss">Evaluator lab</p>
        <h1 className="mt-2 font-display text-4xl">Demo simulator</h1>
        <p className="mt-4 text-sm leading-7 text-ink/65">
          These buttons generate typical behavioral feature vectors, then send them through the
          real <code>/api/predict</code> pipeline. The Random Forest is not bypassed.
        </p>
        {location.state?.justAbandoned && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Simulated abandonment was stored as outcome = 1. Check the admin dashboard.
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3">
          {buttons.map((item) => (
            <button
              key={item.level}
              type="button"
              disabled={Boolean(busy)}
              onClick={() => run(item.level)}
              className="rounded-full bg-ink px-5 py-3 text-sm text-white disabled:opacity-60"
            >
              {busy === item.level ? "Scoring..." : item.label}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-amber-700">{error}</p>}
        {result && (
          <div className="mt-6 rounded-2xl bg-mist p-4 text-sm">
            <p>Requested scenario: {result.requested_level}</p>
            <p className="mt-1 text-2xl font-semibold">
              {result.risk_level} · {Math.round(result.abandonment_probability * 100)}%
            </p>
            <p className="mt-2 text-ink/60">{result.note}</p>
          </div>
        )}
      </section>
      <aside className="space-y-4">
        <div className="rounded-[2rem] bg-ink p-8 text-white">
          <h2 className="font-display text-2xl">How to demonstrate</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-white/75">
            <li>Allow demo tracking on the shop.</li>
            <li>Add a product, hover the checkout button, move away, wait, then scroll.</li>
            <li>Watch the risk indicator update every few seconds.</li>
            <li>Use Simulate Abandonment or Complete Purchase.</li>
            <li>Open Admin to see stored outcomes and real model metrics.</li>
          </ol>
        </div>
        <SessionStatus />
      </aside>
    </div>
  );
}
