import { formatSeconds } from "../utils/features.js";

const riskClass = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
};

export default function SessionTable({ sessions }) {
  if (!sessions.length) {
    return <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">No sessions stored yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Session</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Mouse moves</th>
            <th className="px-4 py-3">Cart time</th>
            <th className="px-4 py-3">Hesitation</th>
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Outcome</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((row) => (
            <tr key={row.session_id} className="border-b border-slate-50">
              <td className="px-4 py-3 font-medium">{row.session_id}</td>
              <td className="px-4 py-3">{formatSeconds(row.session_duration)}</td>
              <td className="px-4 py-3">{row.mouse_move_count ?? "—"}</td>
              <td className="px-4 py-3">{formatSeconds(row.cart_time)}</td>
              <td className="px-4 py-3">{row.checkout_hesitation_score?.toFixed?.(2) ?? "—"}</td>
              <td className="px-4 py-3">
                {row.risk_level ? (
                  <span className={`rounded-full px-2 py-1 text-xs ${riskClass[row.risk_level]}`}>
                    {row.risk_level}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                {row.outcome === 0 ? "Purchased" : row.outcome === 1 ? "Abandoned" : "Open"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
