import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";

export default function CommandPalette() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Detect OS for shortcut hint
  const isMac = typeof window !== "undefined" && navigator.platform?.toUpperCase().includes("MAC");
  const shortcutKey = isMac ? "⌘K" : "Ctrl+K";

  // Global Keyboard Listener for Cmd+K / Ctrl+K and custom trigger
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    function handleCustomOpen() {
      setIsOpen(true);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input on open & lock background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);

      // Preload / Refresh user's teams & projects for instant fuzzy search
      if (user) {
        setLoading(true);
        Promise.all([api("/teams"), api("/dashboard")])
          .then(([teamsRes, dashRes]) => {
            setTeams(teamsRes.data?.teams || []);
            setProjects(dashRes.data?.projects || []);
          })
          .catch((err) => console.error("Error loading command palette data:", err))
          .finally(() => setLoading(false));
      }
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  // Build searchable commands list
  const q = query.trim().toLowerCase();

  const navigationItems = [
    {
      id: "nav-teams",
      category: "Navigation",
      title: "Teams & Workspaces",
      subtitle: "Switch workspaces and organizations",
      icon: "🏢",
      badge: "PAGE",
      action: () => navigate("/"),
    },
    {
      id: "nav-dashboard",
      category: "Navigation",
      title: "Live Dashboard",
      subtitle: "Command center telemetry and velocity",
      icon: "⚡",
      badge: "PAGE",
      action: () => navigate("/dashboard"),
    },
    {
      id: "nav-profile",
      category: "Navigation",
      title: "Profile & Summary",
      subtitle: "Account details, metrics & team roster",
      icon: "👤",
      badge: "PAGE",
      action: () => navigate("/profile"),
    },
    {
      id: "nav-logout",
      category: "Account",
      title: "Log Out",
      subtitle: "Sign out of your Wiener session",
      icon: "🚪",
      badge: "DANGER",
      action: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  const projectItems = projects.map((p) => ({
    id: `project-${p.id}`,
    category: "Projects",
    title: p.name,
    subtitle: `${p.teamName || "Workspace"} • ${p.progress}% completed`,
    icon: "📋",
    badge: `${p.progress}%`,
    action: () => navigate(`/projects/${p.id}`),
  }));

  const teamItems = teams.map((t) => ({
    id: `team-${t.id}`,
    category: "Teams",
    title: t.name,
    subtitle: t.description || "Workspace",
    icon: "👥",
    badge: t.role,
    action: () => navigate(`/teams/${t.id}`),
  }));

  const allItems = [...navigationItems, ...projectItems, ...teamItems];

  // Filter based on search query
  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  );

  function executeItem(item) {
    setIsOpen(false);
    item.action();
  }

  // Handle keyboard navigation inside the list
  function handleListKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      executeItem(filteredItems[selectedIndex]);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0E1330]/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette Dialog Box */}
      <div className="relative w-full max-w-2xl rounded-none border-4 border-[#0E1330] bg-white shadow-[10px_10px_0_#0E1330] overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#0E1330] bg-[#2A3BFF] px-4 py-2 text-white">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-none border border-black bg-[#CBFF4D]" />
            <span className="font-display text-xs font-extrabold uppercase tracking-wider">
              Wiener Command Palette
            </span>
          </div>
          <span className="rounded-none border border-white/30 bg-black/30 px-1.5 py-0.5 text-[10px] font-mono font-bold">
            ESC to close
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center border-b-2 border-[#0E1330] bg-[#F4F6FF] px-4">
          <span className="text-lg mr-3 select-none">⚡</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, teams, or jump to a page..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleListKeyDown}
            className="w-full bg-transparent py-4 text-base font-bold text-[#0E1330] placeholder-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-xs font-extrabold text-slate-400 hover:text-[#0E1330] px-2 py-1"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Results List Area */}
        <div
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-3 flex flex-col gap-1 bg-white select-none"
        >
          {loading && (
            <div className="p-6 text-center font-display text-xs font-extrabold text-[#0E1330] animate-pulse">
              Indexing workspaces and active projects...
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="p-8 text-center">
              <p className="font-display text-base font-extrabold text-[#0E1330]">
                No matching results found
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Try searching for a project name, team, or command.
              </p>
            </div>
          )}

          {!loading &&
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-none border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#0E1330] bg-[#CBFF4D] text-[#0E1330] shadow-[3px_3px_0_#0E1330] translate-x-1"
                      : "border-transparent bg-white hover:bg-[#F4F6FF] text-[#0E1330]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-8 w-8 place-items-center rounded-none border border-[#0E1330] bg-white text-base shadow-[1px_1px_0_#0E1330] shrink-0">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-extrabold truncate leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`rounded-none border border-[#0E1330] px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                        item.badge === "DANGER"
                          ? "bg-rose-300 text-rose-950"
                          : item.badge === "OWNER"
                          ? "bg-[#2A3BFF] text-white"
                          : "bg-white text-[#0E1330]"
                      }`}
                    >
                      {item.badge}
                    </span>
                    {isSelected && (
                      <span className="font-mono text-xs font-bold text-[#0E1330] animate-pulse">
                        ↵
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between border-t-2 border-[#0E1330] bg-[#F4F6FF] px-4 py-2.5 text-[11px] font-bold text-[#0E1330]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[#0E1330] bg-white px-1 py-0.5 text-[10px]">↑</kbd>
              <kbd className="rounded border border-[#0E1330] bg-white px-1 py-0.5 text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[#0E1330] bg-white px-1.5 py-0.5 text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          <span className="hidden sm:inline text-slate-500 font-mono text-[10px]">
            Shortcut: <strong className="text-[#0E1330]">{shortcutKey}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

