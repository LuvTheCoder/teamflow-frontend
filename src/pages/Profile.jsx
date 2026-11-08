import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

const STATUS_CONFIG = [
  { key: "TODO", label: "To do", color: "bg-slate-400" },
  { key: "IN_PROGRESS", label: "In progress", color: "bg-[#2A3BFF]" },
  { key: "REVIEW", label: "Review", color: "bg-amber-400" },
  { key: "DONE", label: "Done", color: "bg-[#CBFF4D]" },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [teams, setTeams] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfileSummary() {
      try {
        const [teamsRes, dashRes] = await Promise.all([
          api("/teams"),
          api("/dashboard"),
        ]);
        setTeams(teamsRes.data?.teams || []);
        setDashboard(dashRes.data || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfileSummary();
  }, []);

  const initials = getInitials(user?.name);
  const ownedTeams = teams.filter((t) => t.role === "OWNER");

  return (
    <div className="min-h-screen bg-[#F4F6FF] pb-24 overflow-x-clip">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            to="/"
            className="font-display text-xs font-extrabold uppercase text-[#0E1330] hover:text-[#2A3BFF]"
          >
            ← Back to teams
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border-2 border-[#0E1330] bg-rose-200 p-4 font-bold text-rose-900 shadow-[4px_4px_0_#0E1330]">
            🚨 {error}
          </div>
        )}

        {/* User Identity Hero Card */}
        <div className="relative mb-8 rounded-3xl border-2 border-[#0E1330] bg-[#2A3BFF] p-6 sm:p-8 text-white shadow-[8px_8px_0_#0E1330]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Large Initial Avatar */}
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-2 border-[#0E1330] bg-[#CBFF4D] font-display text-3xl font-extrabold text-[#0E1330] shadow-[4px_4px_0_#0E1330]">
                {initials}
              </div>

              <div>
                <span className="rounded-md border border-white/20 bg-[#CBFF4D] px-2.5 py-0.5 font-display text-[10px] font-extrabold text-[#0E1330]">
                  ACCOUNT PROFILE
                </span>
                <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                  {user?.name || "User Profile"}
                </h1>
                <p className="mt-1 text-sm font-semibold text-blue-100">{user?.email}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={logout}
                className="rounded-xl border-2 border-[#0E1330] bg-white px-5 py-2.5 font-display text-xs font-extrabold uppercase text-[#0E1330] shadow-[3px_3px_0_#0E1330] transition-all hover:bg-rose-400 hover:text-[#0E1330] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-8 text-center shadow-[6px_6px_0_#0E1330]">
            <p className="font-display text-base font-extrabold text-[#0E1330] animate-pulse">
              Gathering your profile summary & telemetry...
            </p>
          </div>
        )}

        {!loading && (
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left Column: Dashboard Summary */}
            <section className="lg:col-span-7 flex flex-col gap-6">
              {/* Dashboard Telemetry Card */}
              <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-6 shadow-[6px_6px_0_#0E1330]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl font-extrabold text-[#0E1330]">
                      Dashboard Summary
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Overview of your tasks and project progress across all teams.
                    </p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="rounded-lg border-2 border-[#0E1330] bg-[#CBFF4D] px-3 py-1 font-display text-xs font-extrabold text-[#0E1330] shadow-[2px_2px_0_#0E1330] hover:bg-[#d9ff7a]"
                  >
                    Open Dashboard →
                  </Link>
                </div>

                {dashboard && (
                  <>
                    {/* 4 Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl border-2 border-[#0E1330] bg-[#F4F6FF] p-3 text-center shadow-[2px_2px_0_#0E1330]">
                        <p className="text-[10px] font-extrabold uppercase text-slate-500">Projects</p>
                        <p className="font-display text-2xl font-extrabold text-[#2A3BFF]">
                          {dashboard.totalProjects}
                        </p>
                      </div>

                      <div className="rounded-xl border-2 border-[#0E1330] bg-[#F4F6FF] p-3 text-center shadow-[2px_2px_0_#0E1330]">
                        <p className="text-[10px] font-extrabold uppercase text-slate-500">Total Tasks</p>
                        <p className="font-display text-2xl font-extrabold text-[#0E1330]">
                          {dashboard.totalTasks}
                        </p>
                      </div>

                      <div className="rounded-xl border-2 border-[#0E1330] bg-[#F4F6FF] p-3 text-center shadow-[2px_2px_0_#0E1330]">
                        <p className="text-[10px] font-extrabold uppercase text-slate-500">Completed</p>
                        <p className="font-display text-2xl font-extrabold text-emerald-600">
                          {dashboard.completedTasks}
                        </p>
                      </div>

                      <div className="rounded-xl border-2 border-[#0E1330] bg-[#F4F6FF] p-3 text-center shadow-[2px_2px_0_#0E1330]">
                        <p className="text-[10px] font-extrabold uppercase text-slate-500">Pending</p>
                        <p className="font-display text-2xl font-extrabold text-amber-600">
                          {dashboard.pendingTasks}
                        </p>
                      </div>
                    </div>

                    {/* Overall Velocity Progress Bar */}
                    <div className="mt-5 rounded-xl border-2 border-[#0E1330] bg-[#F4F6FF] p-4">
                      <div className="flex justify-between items-center text-xs font-extrabold mb-1.5">
                        <span className="text-[#0E1330]">Overall Completion Velocity</span>
                        <span className="font-display text-base text-[#2A3BFF]">
                          {dashboard.overallProgress}%
                        </span>
                      </div>
                      <div className="h-4 w-full rounded-full border-2 border-[#0E1330] bg-white p-[2px]">
                        <div
                          className="h-full rounded-full bg-[#CBFF4D] transition-all duration-500"
                          style={{ width: `${dashboard.overallProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Tasks Status Breakdown */}
                    <div className="mt-5">
                      <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#0E1330] mb-2.5">
                        Tasks Pipeline by Stage
                      </h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {STATUS_CONFIG.map((status) => {
                          const count = dashboard.tasksByStatus?.[status.key] ?? 0;
                          return (
                            <div
                              key={status.key}
                              className="flex items-center justify-between rounded-lg border border-[#0E1330] bg-white p-2.5"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`h-3 w-3 rounded-full border border-[#0E1330] ${status.color}`} />
                                <span className="text-xs font-bold text-[#0E1330]">{status.label}</span>
                              </div>
                              <span className="font-display text-xs font-extrabold text-[#2A3BFF]">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Project Velocity Breakdown */}
                    {dashboard.projects?.length > 0 && (
                      <div className="mt-6 border-t-2 border-[#0E1330]/10 pt-4">
                        <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#0E1330] mb-3">
                          Active Projects ({dashboard.projects.length})
                        </h3>
                        <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                          {dashboard.projects.map((p) => (
                            <Link
                              key={p.id}
                              to={`/projects/${p.id}`}
                              className="group flex flex-col justify-between rounded-xl border border-[#0E1330]/20 bg-[#F4F6FF] p-3 transition-all hover:border-[#0E1330] hover:bg-white hover:shadow-[3px_3px_0_#0E1330]"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div>
                                  <p className="font-display text-sm font-extrabold text-[#0E1330] group-hover:text-[#2A3BFF]">
                                    {p.name}
                                  </p>
                                  <p className="text-[11px] font-semibold text-slate-400">{p.teamName}</p>
                                </div>
                                <span className="rounded border border-[#0E1330] bg-[#CBFF4D] px-2 py-0.5 font-display text-[11px] font-extrabold text-[#0E1330]">
                                  {p.progress}%
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full border border-[#0E1330] bg-white">
                                <div
                                  className="h-full rounded-full bg-[#2A3BFF]"
                                  style={{ width: `${p.progress}%` }}
                                />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* Right Column: Teams Summary */}
            <section className="lg:col-span-5 flex flex-col gap-6">
              <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-6 shadow-[6px_6px_0_#0E1330]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl font-extrabold text-[#0E1330]">
                      Your Teams ({teams.length})
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Workspaces and organizations you belong to.
                    </p>
                  </div>
                  <Link
                    to="/"
                    className="rounded-lg border-2 border-[#0E1330] bg-[#2A3BFF] px-3 py-1 font-display text-xs font-extrabold text-white shadow-[2px_2px_0_#0E1330] hover:bg-[#1f2ed6]"
                  >
                    Manage →
                  </Link>
                </div>

                {/* Team Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl border border-[#0E1330] bg-[#F4F6FF] p-3 text-center">
                    <p className="text-[10px] font-extrabold uppercase text-slate-500">Joined Teams</p>
                    <p className="font-display text-2xl font-extrabold text-[#2A3BFF]">{teams.length}</p>
                  </div>
                  <div className="rounded-xl border border-[#0E1330] bg-[#CBFF4D] p-3 text-center">
                    <p className="text-[10px] font-extrabold uppercase text-[#0E1330]/70">Owned by You</p>
                    <p className="font-display text-2xl font-extrabold text-[#0E1330]">{ownedTeams.length}</p>
                  </div>
                </div>

                {teams.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#0E1330]/40 p-6 text-center">
                    <p className="text-xs font-bold text-slate-500">
                      You are not part of any teams yet.
                    </p>
                    <Link
                      to="/"
                      className="mt-2 inline-block rounded-lg border-2 border-[#0E1330] bg-[#CBFF4D] px-3 py-1.5 font-display text-xs font-extrabold text-[#0E1330] shadow-[2px_2px_0_#0E1330]"
                    >
                      Create Your First Team
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {teams.map((t) => (
                      <Link
                        key={t.id}
                        to={`/teams/${t.id}`}
                        className="group flex flex-col justify-between rounded-xl border-2 border-[#0E1330] bg-white p-4 shadow-[3px_3px_0_#0E1330] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#0E1330] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0E1330] bg-[#CBFF4D] font-display text-sm font-extrabold text-[#0E1330] shadow-[2px_2px_0_#0E1330]">
                              {t.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-display text-base font-extrabold text-[#0E1330] group-hover:text-[#2A3BFF]">
                                {t.name}
                              </h3>
                              <p className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                                {t.description || "No description provided"}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`rounded-md border border-[#0E1330] px-2 py-0.5 font-display text-[9px] font-extrabold uppercase ${
                              t.role === "OWNER"
                                ? "bg-[#2A3BFF] text-white"
                                : "bg-[#F4F6FF] text-[#0E1330]"
                            }`}
                          >
                            {t.role}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-bold text-[#0E1330]">
                          <span className="text-slate-500">View team workspace</span>
                          <span className="transition-transform group-hover:translate-x-1 group-hover:text-[#2A3BFF]">
                            →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

