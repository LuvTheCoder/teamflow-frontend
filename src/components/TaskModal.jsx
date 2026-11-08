import { useEffect, useState } from "react";
import { api } from "../api/api";

// Used for creating (task is null) and editing (task is the task object)
export default function TaskModal({
  projectId,
  task,
  defaultStatus,
  projectMembers,
  onClose,
  onSaved,
}) {
  const isEditing = Boolean(task);

  const [title, setTitle] = useState(task ? task.title : "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task ? task.priority : "MEDIUM");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Escape closes the popup
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (isEditing) {
        // Empty date or assignee becomes null, which clears the value
        await api(`/tasks/${task.id}`, "PATCH", {
          title,
          description,
          priority,
          dueDate: dueDate || null,
          assignedTo: assignedTo || null,
        });
      } else {
        // The new task starts in the column where "+ Add task" was clicked
        await api(`/projects/${projectId}/tasks`, "POST", {
          title,
          description: description || undefined,
          priority,
          status: defaultStatus || undefined,
          dueDate: dueDate || undefined,
          assignedTo: assignedTo || undefined,
        });
      }

      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border-2 border-[#0E1330]/20 bg-white p-2.5 text-sm text-[#0E1330] outline-none focus:border-[#2A3BFF]";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1330]/60 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border-2 border-[#0E1330] bg-white p-6 shadow-[8px_8px_0_#0E1330]"
      >
        <h2 className="font-display mb-4 text-2xl font-extrabold text-[#0E1330]">
          {isEditing ? "Edit task" : "New task"}
        </h2>

        {error && (
          <p className="mb-3 rounded-lg bg-red-100 p-3 text-sm font-medium text-red-700">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className={inputClass}
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputClass}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Assign to</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className={inputClass}
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border-2 border-[#0E1330]/20 px-5 py-2 text-sm font-semibold text-[#0E1330] hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#2A3BFF] px-5 py-2 text-sm font-bold text-white hover:bg-[#1f2ed6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : isEditing ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}