import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#1f6b4a", "#c2410c"];

export default function OutcomeChart({ purchased, abandoned }) {
  const data = [
    { name: "Purchased", value: purchased },
    { name: "Abandoned", value: abandoned },
  ];

  return (
    <div className="h-64 rounded-2xl bg-white p-5">
      <h3 className="text-sm font-semibold">Purchased vs Abandoned</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
