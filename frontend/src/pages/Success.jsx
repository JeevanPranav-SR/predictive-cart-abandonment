import { Link } from "react-router-dom";
import { useTracking } from "../context/TrackingContext.jsx";

export default function Success() {
  const { sessionId, prediction } = useTracking();

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-10 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-moss">Outcome stored</p>
      <h1 className="mt-3 font-display text-4xl">Purchase completed</h1>
      <p className="mt-4 text-sm leading-6 text-ink/65">
        This demo session was saved with <strong>abandoned = 0</strong>. No payment was processed.
      </p>
      {sessionId && <p className="mt-4 text-sm">Session {sessionId}</p>}
      {prediction && (
        <p className="mt-2 text-sm text-ink/55">
          Last predicted risk: {prediction.riskLevel} ({Math.round(prediction.probability * 100)}%)
        </p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/products" className="rounded-full bg-ink px-5 py-3 text-sm text-white">
          Keep shopping
        </Link>
        <Link to="/admin" className="rounded-full border border-ink/10 px-5 py-3 text-sm">
          View dashboard
        </Link>
      </div>
    </div>
  );
}
