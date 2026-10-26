import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// NavLink tells us when a link is the current page, so we can highlight it
function navClass({ isActive }) {
  return isActive
    ? "text-sm font-medium text-blue-600"
    : "text-sm text-gray-600 hover:text-blue-600";
}

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-5 py-3 shadow-sm">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-bold text-blue-600">
          TeamFlow
        </Link>
        <NavLink to="/" end className={navClass}>
          Teams
        </NavLink>
        <NavLink to="/dashboard" className={navClass}>
          Dashboard
        </NavLink>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Hello, {user.name}</span>
        <button
          onClick={logout}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}