import { useNavigate } from "react-router-dom";
import { RESCUE_OFFERS } from "../data/offers.js";
import { useCart } from "../context/CartContext.jsx";
import { useTracking } from "../context/TrackingContext.jsx";
import { formatMoney } from "../utils/features.js";

export default function InterventionPopup() {
  const { interventionOpen, closeIntervention, prediction, features } = useTracking();
  const { applyOffer, total, items } = useCart();
  const navigate = useNavigate();

  if (!interventionOpen || !items.length) return null;

  const probability = prediction ? Math.round(prediction.probability * 100) : null;
  const risk = prediction?.riskLevel || "MEDIUM";

  function claim(offer) {
    applyOffer(offer);
    closeIntervention();
    navigate("/checkout");
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rescue-title"
        className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl"
      >
        <p className="text-xs uppercase tracking-[0.18em] text-rose-600">Live abandonment intervention</p>
        <h2 id="rescue-title" className="mt-2 font-display text-3xl">
          You still have items in your cart
        </h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          The model predicted this from mouse movement, checkout hovering, idle time, and scrolling —
          before you left the page.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-mist p-4 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Abandonment probability</p>
            <p className="mt-1 text-3xl font-semibold">{probability == null ? "—" : `${probability}%`}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Risk</p>
            <p className="mt-1 text-3xl font-semibold">{risk}</p>
          </div>
          <p className="col-span-2 text-xs text-ink/50">
            Checkout hesitation {features.checkout_hesitation_score.toFixed(2)} · current total{" "}
            {formatMoney(total)}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={() => claim(RESCUE_OFFERS[0])}
            className="rounded-2xl bg-moss px-5 py-4 text-left text-white"
          >
            <p className="text-sm font-semibold">{RESCUE_OFFERS[0].headline}</p>
            <p className="mt-1 text-xs text-white/80">Applies 10% off, then opens checkout.</p>
          </button>
          <button
            type="button"
            onClick={() => claim(RESCUE_OFFERS[1])}
            className="rounded-2xl border border-ink/10 px-5 py-4 text-left"
          >
            <p className="text-sm font-semibold">{RESCUE_OFFERS[1].headline}</p>
            <p className="mt-1 text-xs text-ink/55">Applies a ₹149 delivery credit, then opens checkout.</p>
          </button>
        </div>

        <button type="button" onClick={closeIntervention} className="mt-4 w-full text-xs text-ink/45">
          Close
        </button>
      </div>
    </div>
  );
}