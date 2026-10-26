import { useEffect, useState } from "react";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

const COLUMNS = [
  { key: "TODO", title: "To Do" },
  { key: "IN_PROGRESS", title: "In Progress" },
  { key: "REVIEW", title: "Review" },
  { key: "DONE", title: "Done" },
];

export default function KanbanBoard({ projectId, projectMembers, isTeamOwner }) {
  const { user } = useAuth();

  const [board, setBoard] = useState({ TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  async function loadTasks() {
    try {
      const data = await api(`/projects/${projectId}/tasks`);
      setBoard(data.data.board);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  async function moveTask(taskId, status) {
    setError("");
    try {
      await api(`/tasks/${taskId}/status`, "PATCH", { status });
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(task) {
    const confirmed = window.confirm(`Delete "${task.title}"?`);
    if (!confirmed) return;

    setError("");
    try {
      await api(`/tasks/${task.id}`, "DELETE");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  function openCreate() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTask(null);
  }

  async function handleSaved() {
    closeModal();
    await loadTasks();
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Board</h2>
        <button
          onClick={openCreate}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add task
        </button>
      </div>

      {error && <p className="mb-3 rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</p>}

      {loading && <p className="text-gray-500">Loading tasks...</p>}

      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.key} className="rounded-lg bg-gray-200 p-3">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                {column.title} ({board[column.key].length})
              </h3>

              <div className="flex flex-col gap-3">
                {board[column.key].length === 0 && (
                  <p className="text-xs text-gray-500">No tasks</p>
                )}

                {board[column.key].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canDelete={isTeamOwner || task.created_by === user.id}
                    onMove={moveTask}
                    onEdit={openEdit}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TaskModal
          projectId={projectId}
          task={editingTask}
          projectMembers={projectMembers}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}