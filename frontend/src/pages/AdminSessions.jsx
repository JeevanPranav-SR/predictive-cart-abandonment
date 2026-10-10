import { useEffect, useState } from "react";
import SessionTable from "../components/SessionTable.jsx";
import { api } from "../services/api.js";

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");
  const [outcome, setOutcome] = useState("");
  const [sort, setSort] = useState("date");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.dashboardSessions({ search, risk, outcome, sort, order: "desc" });
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err.message || "Could not load sessions");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, risk, outcome, sort]);

  return (
    <div>
      <h1 className="font-display text-4xl">Session history</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search session or page"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <select value={risk} onChange={(event) => setRisk(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="">All risk levels</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <select value={outcome} onChange={(event) => setOutcome(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="">All outcomes</option>
          <option value="purchased">Purchased</option>
          <option value="abandoned">Abandoned</option>
          <option value="open">Open</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="date">Sort by date</option>
          <option value="risk">Sort by risk</option>
          <option value="duration">Sort by duration</option>
          <option value="hesitation">Sort by hesitation</option>
        </select>
      </div>
      {error && <p className="mt-4 text-amber-700">{error}</p>}
      <div className="mt-6">
        {loading ? <p className="text-sm text-slate-500">Loading sessions…</p> : <SessionTable sessions={sessions} />}
      </div>
    </div>
  );
}
