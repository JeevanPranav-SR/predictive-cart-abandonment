export default function StatCard({ label, value, hint }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </article>
  );
}
