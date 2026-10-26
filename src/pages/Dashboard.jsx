import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../api/api";

const STATUS_LABELS = [
  { key: "TODO", label: "To Do", color: "bg-gray-400" },
  { key: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500" },
  { key: "REVIEW", label: "Review", color: "bg-yellow-500" },
  { key: "DONE", label: "Done", color: "bg-green-500" },
];

// A small card showing one number
function StatCard({ title, value, color }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// A horizontal bar that fills up to the given percent
function ProgressBar({ percent }) {
  return (
    <div className="h-2.5 w-full rounded-full bg-gray-200">
      <div
        className="h-2.5 rounded-full bg-green-500 transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="mx-auto max-w-5xl p-5">
      <Navbar />

      <h1 className="mb-4 text-2xl font-bold text-gray-800">Dashboard</h1>

      {loading && <p className="text-gray-500">Loading...</p>}

      {error && <p className="rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</p>}

      {stats && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard title="Projects" value={stats.totalProjects} color="text-gray-800" />
            <StatCard title="Total tasks" value={stats.totalTasks} color="text-blue-600" />
            <StatCard title="Completed" value={stats.completedTasks} color="text-green-600" />
            <StatCard title="Pending" value={stats.pendingTasks} color="text-orange-500" />
          </div>

          {/* Overall progress */}
          <div className="mt-6 rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Overall progress</h2>
              <span className="text-sm font-medium text-gray-600">{stats.overallProgress}%</span>
            </div>
            <ProgressBar percent={stats.overallProgress} />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Tasks by status */}
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-800">Tasks by status</h2>

              <div className="flex flex-col gap-2">
                {STATUS_LABELS.map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="text-gray-700">{item.label}</span>
                    </div>
                    <span className="font-medium text-gray-800">{stats.tasksByStatus[item.key]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project progress */}
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-800">Project progress</h2>

              {stats.projects.length === 0 && (
                <p className="text-sm text-gray-500">No projects yet.</p>
              )}

              <div className="flex flex-col gap-4">
                {stats.projects.map((project) => (
                  <Link key={project.id} to={`/projects/${project.id}`} className="block">
                    <div className="mb-1 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.teamName}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {project.progress}%
                      </span>
                    </div>
                    <ProgressBar percent={project.progress} />
                    <p className="mt-1 text-xs text-gray-500">
                      {project.completedTasks} of {project.totalTasks} tasks done
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}