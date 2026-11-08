import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMac = typeof navigator !== "undefined" && navigator.platform?.toUpperCase().includes("MAC");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F6FF] p-5 text-[#0E1330] overflow-x-clip">
      {/* Brand Logo Header */}
      <Link to="/" className="mb-8 flex items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-none border-2 border-[#0E1330] bg-[#CBFF4D] font-display text-xl font-extrabold text-[#0E1330] shadow-[2px_2px_0_#0E1330]">
          W
        </span>
        <span className="font-display text-2xl font-extrabold tracking-tight text-[#0E1330]">
          Wiener
        </span>
      </Link>

      {/* Main 404 Neo-Brutalist Card */}
      <div className="w-full max-w-lg rounded-none border-4 border-[#0E1330] bg-white p-8 sm:p-10 shadow-[10px_10px_0_#0E1330] text-center">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 rounded-none border-2 border-[#0E1330] bg-[#CBFF4D] px-3 py-1 font-display text-xs font-extrabold uppercase text-[#0E1330] shadow-[2px_2px_0_#0E1330]">
          <span>⚠️</span>
          <span>ERROR 404 • LANE NOT FOUND</span>
        </div>

        {/* Big Bold 404 Stamp */}
        <h1 className="font-display mt-6 text-7xl font-extrabold tracking-tighter text-[#2A3BFF] sm:text-9xl drop-shadow-[4px_4px_0_#0E1330]">
          404
        </h1>

        <h2 className="font-display mt-4 text-2xl font-extrabold text-[#0E1330] sm:text-3xl">
          Off the board.
        </h2>

        <p className="mt-3 text-sm font-semibold text-slate-600 leading-relaxed max-w-md mx-auto">
          The task, project, or workspace you are looking for has been moved, archived, or never existed in this pipeline.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto rounded-none border-2 border-[#0E1330] bg-[#F4F6FF] px-5 py-2.5 font-display text-xs font-extrabold uppercase text-[#0E1330] shadow-[3px_3px_0_#0E1330] hover:bg-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            ← Go Back
          </button>

          <Link
            to={user ? "/" : "/login"}
            className="w-full sm:w-auto rounded-none border-2 border-[#0E1330] bg-[#CBFF4D] px-6 py-2.5 font-display text-xs font-extrabold uppercase text-[#0E1330] shadow-[3px_3px_0_#0E1330] hover:bg-[#d9ff7a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all text-center"
          >
            {user ? "Back to Workspaces" : "Back to Home"}
          </Link>
        </div>

        {/* Command Palette Hint for Logged-In Users */}
        {user && (
          <div className="mt-8 border-t-2 border-[#0E1330]/20 pt-4 text-xs font-bold text-slate-500">
            <span>Tip: Press </span>
            <kbd className="rounded border border-[#0E1330] bg-[#F4F6FF] px-1.5 py-0.5 font-mono text-[11px] text-[#0E1330]">
              {isMac ? "⌘K" : "Ctrl+K"}
            </kbd>
            <span> to jump directly to any team or project.</span>
          </div>
        )}
      </div>

      {/* Footer subtle brand tagline */}
      <p className="mt-8 text-xs font-semibold text-slate-400">
        Wiener • Real-time project collaboration
      </p>
    </div>
  );
}

