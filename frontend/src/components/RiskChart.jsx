import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ProbabilityChart({ distribution }) {
  const data = Object.entries(distribution || {}).map(([name, value]) => ({ name, value }));
  return (
    <div className="h-64 rounded-2xl bg-white p-5">
      <h3 className="text-sm font-semibold">Abandonment probability distribution</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#1f6b4a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskLevelChart({ levels }) {
  const data = [
    { name: "Low", value: levels?.LOW || 0 },
    { name: "Medium", value: levels?.MEDIUM || 0 },
    { name: "High", value: levels?.HIGH || 0 },
  ];
  return (
    <div className="h-64 rounded-2xl bg-white p-5">
      <h3 className="text-sm font-semibold">Risk levels</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#0f172a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FeatureImportanceChart({ items }) {
  const data = (items || []).slice(0, 6).map((row) => ({
    name: row.feature.replaceAll("_", " "),
    value: row.importance,
  }));
  return (
    <div className="h-72 rounded-2xl bg-white p-5">
      <h3 className="text-sm font-semibold">Most important behavioral features</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={150} />
          <Tooltip />
          <Bar dataKey="value" fill="#b45309" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
