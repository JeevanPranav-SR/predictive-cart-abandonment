import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
