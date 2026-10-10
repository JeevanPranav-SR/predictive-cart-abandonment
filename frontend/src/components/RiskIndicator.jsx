import { useTracking } from "../context/TrackingContext.jsx";

const colors = {
  LOW: "bg-emerald-100 text-emerald-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-rose-100 text-rose-800",
};

export default function RiskIndicator() {
  const { consent, prediction, predictionError, features } = useTracking();
  if (consent !== "granted") return null;

  const level = prediction?.riskLevel;
  const probability = prediction ? Math.round(prediction.probability * 100) : null;

  return (
    <aside className="fixed bottom-4 left-4 z-40 w-64 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-lg">
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Demo behavioral risk indicator</p>
      <h3 className="mt-1 text-sm font-semibold">Shopping Behavior Analysis</h3>
      {predictionError ? (
        <p className="mt-2 text-sm text-amber-700">{predictionError}</p>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-ink/60">Risk level</span>
            <span className={`rounded-full px-2 py-1 text-xs ${level ? colors[level] : "bg-stone-100 text-stone-500"}`}>
              {level || "Waiting"}
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{probability == null ? "—" : `${probability}%`}</p>
          <p className="text-xs text-ink/50">
            Predicted chance of leaving without buying. HIGH risk can trigger a save offer.
          </p>
          <p className="mt-2 text-[11px] text-ink/40">Hesitation score {features.checkout_hesitation_score.toFixed(2)}</p>
        </>
      )}
    </aside>
  );
}
