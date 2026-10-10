export default function ModelMetrics({ metrics }) {
  if (!metrics) return <p className="text-sm text-slate-500">Train the model to see evaluation metrics.</p>;

  const matrix = metrics.metrics?.confusion_matrix || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Score label="Accuracy" value={metrics.metrics.accuracy} />
        <Score label="Precision" value={metrics.metrics.precision} />
        <Score label="Recall" value={metrics.metrics.recall} />
        <Score label="F1 score" value={metrics.metrics.f1} />
      </div>
      <div className="rounded-2xl bg-white p-5">
        <h3 className="text-sm font-semibold">Confusion matrix</h3>
        <table className="mt-3 text-sm">
          <thead>
            <tr>
              <th className="p-2"></th>
              <th className="p-2">Pred purchase</th>
              <th className="p-2">Pred abandon</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 font-medium">Actual purchase</td>
              <td className="p-2">{matrix[0]?.[0] ?? "—"}</td>
              <td className="p-2">{matrix[0]?.[1] ?? "—"}</td>
            </tr>
            <tr>
              <td className="p-2 font-medium">Actual abandon</td>
              <td className="p-2">{matrix[1]?.[0] ?? "—"}</td>
              <td className="p-2">{matrix[1]?.[1] ?? "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{metrics.disclaimer}</p>
    </div>
  );
}

function Score({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
