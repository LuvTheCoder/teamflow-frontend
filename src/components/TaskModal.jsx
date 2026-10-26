import { useState } from "react";
import { api } from "../api/api";

// Used for both creating (task is null) and editing (task is the task object)
export default function TaskModal({ projectId, task, projectMembers, onClose, onSaved }) {
  const isEditing = Boolean(task);

  const [title, setTitle] = useState(task ? task.title : "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task ? task.priority : "MEDIUM");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
        // undefined fields are not sent, so the backend uses its defaults
        await api(`/projects/${projectId}/tasks`, "POST", {
          title,
          description: description || undefined,
          priority,
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
    "rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

  return (
    // Clicking the dark background closes the popup
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      {/* stopPropagation: clicks inside the white box should not close it */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          {isEditing ? "Edit task" : "New task"}
        </h2>

        {error && <p className="mb-3 rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
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
              <label className="text-xs text-gray-500">Priority</label>
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
              <label className="text-xs text-gray-500">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Assign to</label>
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
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {saving ? "Saving..." : isEditing ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}