import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../api/api";

const BLUE = "bg-[#2A3BFF]";
const INK = "text-[#0E1330]";
const LIME = "bg-[#CBFF4D]";

const STATUS_LABELS = [
  { key: "TODO", label: "To do", dotColor: "bg-slate-400", badgeBg: "bg-slate-100" },
  { key: "IN_PROGRESS", label: "In progress", dotColor: "bg-[#2A3BFF]", badgeBg: "bg-blue-50" },
  { key: "REVIEW", label: "Review", dotColor: "bg-amber-400", badgeBg: "bg-amber-50" },
  { key: "DONE", label: "Done", dotColor: "bg-[#CBFF4D]", badgeBg: "bg-[#CBFF4D]/20" },
];

/* ---------- Unique Component: Circular Progress Ring ---------- */
function CircularProgress({ percent }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          className="stroke-[#0E1330]/10"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          className="stroke-[#2A3BFF] transition-all duration-700 ease-out"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <span className="font-display absolute text-lg font-extrabold text-[#0E1330]">
        {percent}%
      </span>
    </div>
  );
}

/* ---------- Stat Card with Retro Badges ---------- */
function StatCard({ title, value, tag, colorClass }) {
  return (
    <div className="group relative rounded-2xl border-2 border-[#0E1330] bg-white p-5 shadow-[5px_5px_0_#0E1330] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#0E1330]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{title}</p>
        {tag && (
          <span className="rounded-md border border-[#0E1330] bg-[#CBFF4D] px-2 py-0.5 text-[10px] font-extrabold text-[#0E1330]">
            {tag}
          </span>
        )}
      </div>
      <p className={`mt-2 font-display text-4xl font-extrabold ${colorClass || INK}`}>
        {value}
      </p>
    </div>
  );
}

/* ---------- Custom Tactile Progress Bar ---------- */
function ProgressBar({ percent }) {
  return (
    <div className="h-4 w-full rounded-full border-2 border-[#0E1330] bg-[#F4F6FF] p-[2px]">
      <div
        className="h-full rounded-full bg-[#2A3BFF] transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | ACTIVE | DONE

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await api("/dashboard");
        setStats(data.data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const filteredProjects = stats?.projects?.filter((p) => {
    if (filter === "ACTIVE") return p.progress < 100;
    if (filter === "DONE") return p.progress === 100;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4F6FF] pb-20 overflow-x-clip">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {/* Header Hero Banner */}
        <div className="relative mb-8 rounded-2xl border-2 border-[#0E1330] bg-[#2A3BFF] p-6 text-white shadow-[8px_8px_0_#0E1330]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block rounded-md border border-white/20 bg-[#CBFF4D] px-2.5 py-0.5 font-display text-xs font-extrabold text-[#0E1330]">
                LIVE MONITOR
              </span>
              <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Command Center
              </h1>
              <p className="mt-1 text-sm font-semibold text-blue-100">
                Real-time snapshot of your team velocity and task pipeline.
              </p>
            </div>
            {stats && (
              <div className="flex items-center gap-3 rounded-xl border-2 border-[#0E1330] bg-white p-3 text-[#0E1330]">
                <CircularProgress percent={stats.overallProgress} />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Overall status</p>
                  <p className="font-display text-lg font-extrabold">
                    {stats.overallProgress >= 80
                      ? "🔥 On Fire"
                      : stats.overallProgress >= 50
                      ? "⚡ Good Pace"
                      : "🎯 Getting Started"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-8 text-center shadow-[6px_6px_0_#0E1330]">
            <p className="font-display text-lg font-extrabold animate-pulse text-[#0E1330]">
              Fetching live telemetry...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border-2 border-[#0E1330] bg-rose-200 p-5 font-bold text-rose-900 shadow-[6px_6px_0_#0E1330]">
            🚨 {error}
          </div>
        )}

        {stats && (
          <>
            {/* Top Stat Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard title="Projects" value={stats.totalProjects} tag="Active" />
              <StatCard title="Total tasks" value={stats.totalTasks} colorClass="text-[#2A3BFF]" />
              <StatCard title="Completed" value={stats.completedTasks} colorClass="text-[#0E1330]" tag="Done" />
              <StatCard title="Pending" value={stats.pendingTasks} colorClass="text-amber-600" tag="In Queue" />
            </div>

            {/* Task Ratio Heatmap Bar (Unique Visual Widget) */}
            <div className="mt-8 rounded-2xl border-2 border-[#0E1330] bg-white p-6 shadow-[8px_8px_0_#0E1330]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-xl font-extrabold text-[#0E1330]">
                  Task Distribution Ratio
                </h2>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stats.completedTasks} completed / {stats.pendingTasks} pending
                </span>
              </div>
              
              {/* Split Bar showing completed vs pending proportion */}
              <div className="flex h-5 w-full overflow-hidden rounded-lg border-2 border-[#0E1330] bg-[#F4F6FF]">
                <div
                  style={{
                    width: `${stats.totalTasks ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%`,
                  }}
                  className="bg-[#CBFF4D] transition-all duration-500"
                  title="Completed"
                />
                <div
                  style={{
                    width: `${stats.totalTasks ? (stats.pendingTasks / stats.totalTasks) * 100 : 0}%`,
                  }}
                  className="bg-[#2A3BFF] transition-all duration-500"
                  title="Pending"
                />
              </div>

              <div className="mt-3 flex gap-6 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#0E1330]">
                  <span className="h-3 w-3 rounded bg-[#CBFF4D] border border-[#0E1330]" /> Completed Ratio
                </span>
                <span className="flex items-center gap-1.5 text-[#0E1330]">
                  <span className="h-3 w-3 rounded bg-[#2A3BFF] border border-[#0E1330]" /> Pending Pipeline
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {/* Tasks by Status Widget */}
              <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-6 shadow-[8px_8px_0_#0E1330]">
                <h2 className="font-display mb-4 text-xl font-extrabold text-[#0E1330]">
                  Stage Breakdown
                </h2>

                <div className="flex flex-col gap-3">
                  {STATUS_LABELS.map((item) => {
                    const count = stats.tasksByStatus[item.key] ?? 0;
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-xl border-2 border-[#0E1330] bg-white p-3.5 transition-transform hover:translate-x-1"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`h-4 w-4 rounded-full border-2 border-[#0E1330] ${item.dotColor}`} />
                          <span className="font-display font-bold text-[#0E1330]">{item.label}</span>
                        </div>
                        <span className="rounded-md border border-[#0E1330] bg-[#F4F6FF] px-3 py-1 font-display text-sm font-extrabold text-[#2A3BFF]">
                          {count} tasks
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Projects List with Quick Filter Toggle */}
              <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-6 shadow-[8px_8px_0_#0E1330]">
                <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-display text-xl font-extrabold text-[#0E1330]">
                    Project Velocity
                  </h2>

                  {/* Filter Pills */}
                  <div className="flex gap-1 rounded-lg border-2 border-[#0E1330] bg-[#F4F6FF] p-1">
                    {["ALL", "ACTIVE", "DONE"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-extrabold transition-all ${
                          filter === f
                            ? "bg-[#2A3BFF] text-white shadow-[2px_2px_0_#0E1330]"
                            : "text-slate-600 hover:text-[#0E1330]"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredProjects?.length === 0 && (
                  <div className="py-8 text-center font-bold text-slate-400">
                    No projects found for this filter.
                  </div>
                )}

                <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
                  {filteredProjects?.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="group block rounded-xl border-2 border-[#0E1330] bg-white p-4 shadow-[3px_3px_0_#0E1330] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#0E1330] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-display text-base font-extrabold text-[#0E1330] group-hover:text-[#2A3BFF]">
                            {project.name}
                          </p>
                          <p className="text-xs font-bold text-slate-400">{project.teamName}</p>
                        </div>
                        <span className="rounded-md border border-[#0E1330] bg-[#CBFF4D] px-2 py-0.5 font-display text-xs font-extrabold text-[#0E1330]">
                          {project.progress}%
                        </span>
                      </div>
                      <ProgressBar percent={project.progress} />
                      <div className="mt-2 flex justify-between text-xs font-bold text-slate-500">
                        <span>{project.completedTasks} / {project.totalTasks} completed</span>
                        <span className="text-[#2A3BFF] group-hover:underline">Open board →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}