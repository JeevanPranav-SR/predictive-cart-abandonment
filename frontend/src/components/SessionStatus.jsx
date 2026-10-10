import { useTracking } from "../context/TrackingContext.jsx";
import { formatSeconds } from "../utils/features.js";

export default function SessionStatus() {
  const { sessionId, features, page, prediction } = useTracking();
  if (!sessionId) return null;

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-4 text-sm">
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Live session</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Info label="Session" value={sessionId} />
        <Info label="Page" value={page} />
        <Info label="Duration" value={formatSeconds(features.session_duration)} />
        <Info label="Mouse moves" value={features.mouse_move_count} />
        <Info label="Scrolls" value={features.scroll_count} />
        <Info label="Clicks" value={features.click_count} />
        <Info label="Hesitation" value={features.checkout_hesitation_score.toFixed(2)} />
        <Info label="Checkout hovers" value={features.checkout_hover_count} />
        <Info label="Risk" value={prediction?.riskLevel || "—"} />
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-ink/45">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
