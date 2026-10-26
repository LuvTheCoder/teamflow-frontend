import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="mb-6 flex items-center justify-between rounded-lg bg-white px-5 py-3 shadow-sm">
      <Link to="/" className="text-xl font-bold text-blue-600">
        TeamFlow
      </Link>

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