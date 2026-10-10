import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { formatSeconds } from "../utils/features.js";

export default function AdminLive() {
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.liveSession();
        if (!cancelled) {
          setSession(data.session);
          setError("");
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Live monitor unavailable");
      }
    }
    load();
    const timer = window.setInterval(load, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div>
      <h1 className="font-display text-4xl">Live session</h1>
      <p className="mt-2 text-sm text-slate-500">Most recently updated shopper session, refreshed every 3 seconds.</p>
      {error && <p className="mt-4 text-amber-700">{error}</p>}
      {!session ? (
        <p className="mt-6 rounded-2xl bg-white p-6">No live session yet. Start shopping with tracking enabled.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Tile label="Session" value={session.session_id} />
          <Tile label="Current page" value={session.page || "—"} />
          <Tile label="Cart status" value={session.cart_status || "—"} />
          <Tile label="Duration" value={formatSeconds(session.session_duration)} />
          <Tile label="Mouse movements" value={session.mouse_move_count ?? "—"} />
          <Tile label="Scrolls" value={session.scroll_count ?? "—"} />
          <Tile label="Clicks" value={session.click_count ?? "—"} />
          <Tile label="Checkout hesitation" value={session.checkout_hesitation_score?.toFixed?.(2) ?? "—"} />
          <Tile
            label="Current risk"
            value={
              session.risk_level
                ? `${session.risk_level} · ${Math.round((session.probability || 0) * 100)}%`
                : "Waiting for first prediction"
            }
          />
        </div>
      )}
    </div>
  );
}

function Tile({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
