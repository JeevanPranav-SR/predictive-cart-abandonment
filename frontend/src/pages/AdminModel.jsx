import { useEffect, useState } from "react";
import { FeatureImportanceChart } from "../components/RiskChart.jsx";
import ModelMetrics from "../components/ModelMetrics.jsx";
import { api } from "../services/api.js";

export default function AdminModel() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .modelMetrics()
      .then(setMetrics)
      .catch((err) => setError(err.message || "Model metrics unavailable"));
  }, []);

  return (
    <div>
      <h1 className="font-display text-4xl">Machine learning model</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        The project uses interaction patterns as behavioral signals to estimate the probability of
        cart abandonment. The model is predictive rather than a definitive measurement of user
        intent. Mouse movement does not determine a person&apos;s psychological state.
      </p>
      <div className="mt-6 rounded-2xl bg-white p-5 text-sm">
        <p>Input features → Random Forest → probability → LOW / MEDIUM / HIGH</p>
        {metrics && (
          <p className="mt-2 text-slate-500">
            {metrics.model_type} · {metrics.training_samples} training samples · {metrics.test_samples} test samples ·
            data source: {metrics.data_source}
          </p>
        )}
      </div>
      {error && <p className="mt-4 text-amber-700">{error}</p>}
      <div className="mt-6">
        <ModelMetrics metrics={metrics} />
      </div>
      {metrics?.feature_importance && (
        <div className="mt-6">
          <FeatureImportanceChart items={metrics.feature_importance} />
        </div>
      )}
      {metrics?.features && (
        <div className="mt-6 rounded-2xl bg-white p-5">
          <h3 className="text-sm font-semibold">Features used</h3>
          <ul className="mt-3 columns-2 text-sm text-slate-600">
            {metrics.features.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
