import { useEffect, useState } from "react";
import { FeatureImportanceChart, ProbabilityChart, RiskLevelChart } from "../components/RiskChart.jsx";
import OutcomeChart from "../components/OutcomeChart.jsx";
import StatCard from "../components/StatCard.jsx";
import { api } from "../services/api.js";

export default function AdminOverview() {
  const [summary, setSummary] = useState(null);
  const [importance, setImportance] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [dash, features] = await Promise.all([api.dashboardSummary(), api.modelFeatures()]);
        setSummary(dash);
        setImportance(features.feature_importance || []);
      } catch (err) {
        setError(err.message || "Dashboard unavailable");
      }
    }
    load();
  }, []);

  if (error) return <p className="text-amber-700">{error}</p>;
  if (!summary) return <p>Loading dashboard…</p>;

  return (
    <div>
      <h1 className="font-display text-4xl">Overview</h1>
      <p className="mt-2 text-sm text-slate-500">{summary.data_note}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Total sessions" value={summary.total_sessions} />
        <StatCard label="Completed purchases" value={summary.completed_purchases} />
        <StatCard label="Abandoned carts" value={summary.abandoned_carts} />
        <StatCard label="Abandonment rate" value={`${Math.round(summary.abandonment_rate * 100)}%`} />
        <StatCard label="High-risk sessions" value={summary.high_risk_sessions} />
        <StatCard
          label="Average risk score"
          value={`${Math.round(summary.average_risk_score * 100)}%`}
        />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <OutcomeChart purchased={summary.completed_purchases} abandoned={summary.abandoned_carts} />
        <ProbabilityChart distribution={summary.probability_distribution} />
        <RiskLevelChart levels={summary.risk_levels} />
        <FeatureImportanceChart items={importance} />
      </div>
    </div>
  );
}
