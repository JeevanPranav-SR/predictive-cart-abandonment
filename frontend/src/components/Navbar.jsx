import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/cart", label: "Cart" },
  { to: "/demo", label: "Demo" },
];

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f4efe6]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl text-ink">Northline</span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-moss sm:inline">Demo shop</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              data-track="nav"
              className={({ isActive }) =>
                `transition-colors ${isActive ? "text-moss" : "text-ink/70 hover:text-ink"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <span className="hidden text-xs text-ink/55 sm:inline">{user.full_name}</span>
              <button type="button" onClick={logout} className="text-xs text-ink/50 hover:text-ink">
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" data-track="nav" className="text-ink/70 hover:text-ink">
                Log in
              </NavLink>
              <NavLink to="/signup" data-track="nav" className="text-ink/70 hover:text-ink">
                Sign up
              </NavLink>
            </>
          )}
          <Link
            to="/cart"
            data-track="nav"
            className="rounded-full bg-ink px-4 py-2 text-sm text-white"
          >
            Cart {count}
          </Link>
          <Link to="/admin" data-track="nav" className="text-xs text-ink/50 hover:text-ink">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
