import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function desktopNavClass({ isActive }) {
  return `border-2 border-[#0E1330] px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider transition-all rounded-none ${
    isActive
      ? "bg-[#CBFF4D] text-[#0E1330] shadow-[2px_2px_0_#0E1330]"
      : "bg-white/10 text-white border-white/20 hover:border-[#0E1330] hover:bg-[#CBFF4D] hover:text-[#0E1330] hover:shadow-[2px_2px_0_#0E1330]"
  }`;
}

function sidebarNavClass({ isActive }) {
  return `flex items-center px-4 py-3 font-display text-xs font-extrabold uppercase tracking-wider border-2 border-[#0E1330] transition-all rounded-none ${
    isActive
      ? "bg-[#CBFF4D] text-[#0E1330] shadow-[3px_3px_0_#0E1330]"
      : "bg-[#F4F6FF] text-[#0E1330] hover:bg-white shadow-[2px_2px_0_#0E1330]"
  }`;
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = getInitials(user?.name);
  const isMac = typeof navigator !== "undefined" && navigator.platform?.toUpperCase().includes("MAC");
  const shortcutHint = isMac ? "⌘K" : "Ctrl+K";

  function openCommandPalette() {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  }

  return (
    <>
      {/* Electric Blue Header Bar */}
      <nav className="mb-6 flex items-center justify-between rounded-none border-2 border-[#0E1330] bg-[#2A3BFF] px-5 py-3.5 shadow-[5px_5px_0_#0E1330]">
        {/* Left Section: Brand & Desktop Navigation */}
        <div className="flex items-center gap-8">
          {/* Mobile Hamburger Toggle (Small Devices Only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-none border-2 border-[#0E1330] bg-white text-[#0E1330] shadow-[2px_2px_0_#0E1330] hover:bg-[#CBFF4D] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none md:hidden cursor-pointer"
            aria-label="Open navigation menu"
          >
            <svg className="h-5 w-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Clean Text-Only Brand Logo */}
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tight text-white drop-shadow-[2px_2px_0_#0E1330]">
            Wiener
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-2.5 md:flex">
            <NavLink to="/" end className={desktopNavClass}>
              Teams
            </NavLink>
            <NavLink to="/dashboard" className={desktopNavClass}>
              Dashboard
            </NavLink>
          </div>
        </div>

        {/* Right Section: Command Palette Trigger, Profile Badge & Logout */}
        <div className="flex items-center gap-3">
          {/* Quick Command Palette Button Pill */}
          <button
            onClick={openCommandPalette}
            className="hidden sm:flex items-center gap-2 rounded-none border-2 border-[#0E1330] bg-white px-3 py-1.5 font-display text-xs font-extrabold text-[#0E1330] shadow-[2px_2px_0_#0E1330] hover:bg-[#CBFF4D] hover:shadow-[3px_3px_0_#0E1330] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            title={`Quick search (${shortcutHint})`}
          >
            <span className="text-sm">🔍</span>
            <span>Search...</span>
            <kbd className="rounded-none border border-[#0E1330] bg-[#F4F6FF] px-1.5 py-0.2 font-mono text-[10px] font-bold text-[#0E1330]">
              {shortcutHint}
            </kbd>
          </button>

          {/* User Initials Profile Badge Link — Navigates to /profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `group relative grid h-9 w-9 place-items-center rounded-none border-2 border-[#0E1330] font-display text-sm font-extrabold text-[#0E1330] transition-all hover:bg-[#d9ff7a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                isActive
                  ? "bg-[#CBFF4D] shadow-[3px_3px_0_#0E1330] ring-2 ring-white"
                  : "bg-[#CBFF4D] shadow-[2px_2px_0_#0E1330] hover:shadow-[3px_3px_0_#0E1330]"
              }`
            }
            title={`${user?.name || "User"} - View Profile Summary`}
          >
            {initials}
          </NavLink>

          <button
            onClick={logout}
            className="rounded-none border-2 border-[#0E1330] bg-white px-3.5 py-1.5 font-display text-xs font-extrabold uppercase text-[#0E1330] shadow-[2px_2px_0_#0E1330] transition-all hover:bg-rose-400 hover:text-[#0E1330] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Slide-out Sidebar Drawer (Mobile Devices) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0E1330]/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative flex w-72 flex-col rounded-none border-r-2 border-[#0E1330] bg-white p-5 shadow-[8px_0_0_#0E1330]">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#0E1330]">
              <span className="font-display text-xl font-extrabold text-[#0E1330]">Wiener</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-none border-2 border-[#0E1330] bg-[#F4F6FF] font-extrabold text-[#0E1330] hover:bg-rose-200 cursor-pointer"
                aria-label="Close navigation menu"
              >
                ✕
              </button>
            </div>

            {/* Sidebar Navigation */}
            <div className="mt-6 flex flex-1 flex-col gap-3">
              {/* Mobile Quick Search Button */}
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  openCommandPalette();
                }}
                className="flex items-center justify-between px-4 py-3 font-display text-xs font-extrabold uppercase tracking-wider border-2 border-[#0E1330] bg-[#CBFF4D] text-[#0E1330] shadow-[3px_3px_0_#0E1330] hover:bg-[#d9ff7a]"
              >
                <span className="flex items-center gap-2">
                  <span>🔍</span>
                  <span>Search All</span>
                </span>
                <kbd className="rounded border border-[#0E1330] bg-white px-1.5 py-0.5 font-mono text-[9px]">
                  {shortcutHint}
                </kbd>
              </button>

              <NavLink
                to="/"
                end
                onClick={() => setSidebarOpen(false)}
                className={sidebarNavClass}
              >
                Teams
              </NavLink>

              <NavLink
                to="/dashboard"
                onClick={() => setSidebarOpen(false)}
                className={sidebarNavClass}
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/profile"
                onClick={() => setSidebarOpen(false)}
                className={sidebarNavClass}
              >
                Profile Summary
              </NavLink>
            </div>

            {/* Drawer Footer with Initial & Logout */}
            <div className="flex items-center justify-between border-t-2 border-[#0E1330] pt-4">
              <Link
                to="/profile"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5"
                title="View Profile Summary"
              >
                <div className="grid h-9 w-9 place-items-center rounded-none border-2 border-[#0E1330] bg-[#CBFF4D] font-display text-sm font-extrabold text-[#0E1330] shadow-[2px_2px_0_#0E1330]">
                  {initials}
                </div>
                <div className="text-left">
                  <p className="font-display text-xs font-extrabold text-[#0E1330] leading-none">
                    {user?.name || "Profile"}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">View summary →</p>
                </div>
              </Link>

              <button
                onClick={logout}
                className="rounded-none border-2 border-[#0E1330] bg-rose-200 px-3 py-1.5 font-display text-xs font-extrabold text-[#0E1330] shadow-[2px_2px_0_#0E1330] hover:bg-rose-400 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
