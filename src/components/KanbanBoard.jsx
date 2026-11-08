import { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

const COLUMNS = [
  { key: "TODO", title: "To do" },
  { key: "IN_PROGRESS", title: "In progress" },
  { key: "REVIEW", title: "Review" },
  { key: "DONE", title: "Done" },
];

const CONFETTI_COLORS = ["#CBFF4D", "#FFFFFF", "#0E1330", "#8FA0FF"];

// Confetti animation (kept here so this file works on its own)
const BOARD_CSS = `
@keyframes kb-confetti {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  40% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 1; }
  100% { transform: translate(calc(var(--dx) * 1.3), 240px) rotate(calc(var(--rot) * 2)); opacity: 0; }
}
.kb-piece { position: absolute; animation: kb-confetti 1.3s cubic-bezier(0.2, 0.7, 0.3, 1) forwards; }
@media (prefers-reduced-motion: reduce) { .kb-piece { display: none; } }
`;

function Toggle({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-[#CBFF4D] bg-[#CBFF4D] text-[#0E1330]"
          : "border-white/30 text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export default function KanbanBoard({ projectId, projectMembers, isTeamOwner }) {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null); // null, or { task, status }

  const [search, setSearch] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [onlyHigh, setOnlyHigh] = useState(false);

  const [burst, setBurst] = useState(null);
  const burstTimer = useRef(null);

  async function loadTasks() {
    try {
      const data = await api(`/projects/${projectId}/tasks`);
      setTasks(data.data.tasks);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
    return () => clearTimeout(burstTimer.current);
  }, [projectId]);

  // Confetti burst from the middle of the Done column
  function celebrate() {
    const lane = document.getElementById("kb-col-DONE");
    const rect = lane ? lane.getBoundingClientRect() : null;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? Math.min(Math.max(rect.top + 80, 100), window.innerHeight - 160) : 200;

    const pieces = Array.from({ length: 28 }, (_, id) => ({
      id,
      dx: (Math.random() - 0.5) * 340,
      dy: -(60 + Math.random() * 200),
      rot: Math.random() * 720 - 360,
      size: 6 + Math.random() * 7,
      color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
    }));

    setBurst({ key: Date.now(), x, y, pieces });
    clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => setBurst(null), 1500);
  }

  // Moves the card on screen first, then saves. If saving fails, the card goes back
  async function moveTask(task, status) {
    setError("");
    setTasks((current) => current.map((t) => (t.id === task.id ? { ...t, status } : t)));
    if (status === "DONE") celebrate();

    try {
      await api(`/tasks/${task.id}/status`, "PATCH", { status });
    } catch (err) {
      setTasks((current) =>
        current.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      setError(err.message);
    }
  }

  function handleDragEnd(result) {
    const { source, destination, draggableId } = result;

    if (!destination) return; // dropped outside a column
    if (destination.droppableId === source.droppableId) return; // same column, nothing to save

    const task = tasks.find((t) => t.id === draggableId);
    if (task) moveTask(task, destination.droppableId);
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    setError("");
    try {
      await api(`/tasks/${task.id}`, "DELETE");
      setTasks((current) => current.filter((t) => t.id !== task.id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaved() {
    setModal(null);
    await loadTasks();
  }

  // Progress uses all tasks. The columns use the filtered tasks
  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const query = search.trim().toLowerCase();
  const visible = tasks.filter((task) => {
    const matchesSearch =
      !query ||
      task.title.toLowerCase().includes(query) ||
      (task.description || "").toLowerCase().includes(query);
    const matchesMine = !onlyMine || task.assigned_to === user.id;
    const matchesHigh = !onlyHigh || task.priority === "HIGH";
    return matchesSearch && matchesMine && matchesHigh;
  });

  const filtering = Boolean(query) || onlyMine || onlyHigh;

  function tasksIn(status) {
    return visible
      .filter((t) => t.status === status)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  return (
    <section className="w-full rounded-2xl border-2 border-[#0E1330] bg-[#2A3BFF] p-4 text-white sm:p-6 shadow-[5px_5px_0_#0E1330]">
      <style>{BOARD_CSS}</style>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight">Board</h2>
          <p className="text-sm text-blue-100">Drag a card to another column to change its status.</p>
        </div>

        <button
          onClick={() => setModal({ task: null, status: "TODO" })}
          className="rounded-full bg-[#CBFF4D] px-5 py-2.5 text-sm font-bold text-[#0E1330] hover:bg-[#d9ff7a]"
        >
          + Add task
        </button>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-blue-100">
            {total === 0 ? "No tasks yet" : `${doneCount} of ${total} tasks done`}
          </span>
          <span className="font-bold text-[#CBFF4D]">{percent}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/20">
          <div
            className="h-3 rounded-full bg-[#CBFF4D] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Search and filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input
          type="search"
          aria-label="Search tasks"
          placeholder="Search tasks"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border-2 border-white/30 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-[#CBFF4D] sm:w-64"
        />
        <Toggle active={onlyMine} onClick={() => setOnlyMine((v) => !v)}>
          My tasks
        </Toggle>
        <Toggle active={onlyHigh} onClick={() => setOnlyHigh((v) => !v)}>
          High priority
        </Toggle>
        {filtering && (
          <span className="text-sm text-blue-100">
            Showing {visible.length} of {total}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white p-3 text-sm font-medium text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-700 underline">
            Dismiss
          </button>
        </div>
      )}

      {loading && <p className="mt-6 animate-pulse text-blue-100">Loading board...</p>}

      {!loading && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {COLUMNS.map((column) => {
              const cards = tasksIn(column.key);

              return (
                <div
                  key={column.key}
                  id={`kb-col-${column.key}`}
                  className="w-[80vw] shrink-0 snap-start sm:w-[320px] lg:w-auto"
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <h3
                      className={`font-display text-lg font-bold ${
                        column.key === "DONE" ? "text-[#CBFF4D]" : "text-white"
                      }`}
                    >
                      {column.title}
                    </h3>
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                      {cards.length}
                    </span>
                  </div>

                  <Droppable droppableId={column.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[140px] rounded-2xl p-2 transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-[#CBFF4D]/25 ring-2 ring-[#CBFF4D]"
                            : "bg-white/10"
                        }`}
                      >
                        {cards.map((task, index) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            canDelete={isTeamOwner || task.created_by === user.id}
                            onEdit={(t) => setModal({ task: t, status: t.status })}
                            onDelete={deleteTask}
                          />
                        ))}

                        {provided.placeholder}

                        {cards.length === 0 && !snapshot.isDraggingOver && (
                          <p className="rounded-xl border-2 border-dashed border-white/30 p-4 text-center text-sm text-blue-100">
                            {filtering ? "No matching tasks" : "Drop a task here"}
                          </p>
                        )}
                      </div>
                    )}
                  </Droppable>

                  <button
                    onClick={() => setModal({ task: null, status: column.key })}
                    className="mt-2 w-full rounded-xl py-2 text-sm font-semibold text-blue-100 hover:bg-white/10 hover:text-white"
                  >
                    + Add task
                  </button>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Confetti when a task is finished */}
      {burst && (
        <div
          key={burst.key}
          className="pointer-events-none fixed z-50"
          style={{ left: burst.x, top: burst.y }}
        >
          {burst.pieces.map((piece) => (
            <span
              key={piece.id}
              className="kb-piece rounded-sm"
              style={{
                width: piece.size,
                height: piece.size * 0.6,
                background: piece.color,
                "--dx": `${piece.dx}px`,
                "--dy": `${piece.dy}px`,
                "--rot": `${piece.rot}deg`,
              }}
            />
          ))}
        </div>
      )}

      {modal && (
        <TaskModal
          projectId={projectId}
          task={modal.task}
          defaultStatus={modal.status}
          projectMembers={projectMembers}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}