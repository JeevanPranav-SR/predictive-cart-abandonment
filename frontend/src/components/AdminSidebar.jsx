import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/live", label: "Live session" },
  { to: "/admin/sessions", label: "Session history" },
  { to: "/admin/model", label: "Model" },
];

export default function AdminSidebar() {
  return (
    <aside className="min-h-screen w-64 bg-slate-950 p-6 text-slate-200">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Northline</p>
      <h1 className="mt-2 font-display text-2xl text-white">Analytics</h1>
      <nav className="mt-8 grid gap-2 text-sm">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`
            }
          >
            {link.label}
          </NavLink>
        ))}
        <NavLink to="/" className="mt-6 text-xs text-slate-500 hover:text-white">
          Back to shop
        </NavLink>
      </nav>
    </aside>
  );
}
