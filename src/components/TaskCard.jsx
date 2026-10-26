const PRIORITY_STYLES = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
];

export default function TaskCard({ task, canDelete, onMove, onEdit, onDelete }) {
  // Today's date as YYYY-MM-DD, so we can compare it with the due date
  const today = new Date().toLocaleDateString("en-CA");
  const isOverdue = task.due_date && task.due_date < today && task.status !== "DONE";

  return (
    <div className="rounded-md bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-gray-800">{task.title}</h4>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            PRIORITY_STYLES[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      {task.description && <p className="mt-1 text-xs text-gray-500">{task.description}</p>}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        {task.due_date && (
          <span className={isOverdue ? "font-medium text-red-600" : ""}>
            Due {task.due_date}
          </span>
        )}
        <span>{task.assignee ? task.assignee.name : "Unassigned"}</span>
      </div>

      {/* Moving a card = changing its status */}
      <select
        value={task.status}
        onChange={(e) => onMove(task.id, e.target.value)}
        className="mt-3 w-full rounded-md border border-gray-300 p-1.5 text-xs outline-none focus:border-blue-500"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="mt-2 flex gap-3 text-xs">
        <button onClick={() => onEdit(task)} className="text-blue-600 hover:underline">
          Edit
        </button>
        {canDelete && (
          <button onClick={() => onDelete(task)} className="text-red-600 hover:underline">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}