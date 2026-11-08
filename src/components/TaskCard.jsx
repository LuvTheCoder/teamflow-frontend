import { Draggable } from "@hello-pangea/dnd";

const PRIORITY = {
  HIGH: { label: "High", style: "bg-[#0E1330] text-[#CBFF4D]" },
  MEDIUM: { label: "Medium", style: "bg-[#E7EAFF] text-[#2A3BFF]" },
  LOW: { label: "Low", style: "bg-slate-100 text-slate-500" },
};

// "2026-12-31" becomes "Dec 31"
function formatDue(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export default function TaskCard({ task, index, canDelete, onEdit, onDelete }) {
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const done = task.status === "DONE";
  const overdue = task.due_date && task.due_date < today && !done;
  const priority = PRIORITY[task.priority] || PRIORITY.MEDIUM;
  const assigneeName = task.assignee?.name;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className={`group mb-2 rounded-xl border-2 border-[#0E1330] bg-white p-3 text-[#0E1330] transition-shadow ${
            snapshot.isDragging
              ? "rotate-3 shadow-[8px_8px_0_#0E1330]"
              : "shadow-[3px_3px_0_#0E1330] hover:shadow-[5px_5px_0_#0E1330]"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-display text-base font-bold leading-snug ${
                done ? "text-slate-400 line-through" : ""
              }`}
            >
              {task.title}
            </h4>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${priority.style}`}
            >
              {priority.label}
            </span>
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{task.description}</p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {assigneeName ? (
                <span
                  title={assigneeName}
                  className="grid h-6 w-6 place-items-center rounded-full bg-[#2A3BFF] text-[11px] font-bold text-white"
                >
                  {assigneeName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span className="grid h-6 w-6 place-items-center rounded-full border border-dashed border-slate-300 text-[11px] text-slate-400">
                  ?
                </span>
              )}
              <span className="text-xs text-slate-500">
                {assigneeName ? assigneeName.split(" ")[0] : "Unassigned"}
              </span>
            </div>

            {task.due_date && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  overdue ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {overdue ? "Overdue " : ""}
                {formatDue(task.due_date)}
              </span>
            )}
          </div>

          {/* Visible on phones, and on hover or focus on desktop */}
          <div className="mt-2 flex gap-3 text-xs font-semibold md:h-0 md:overflow-hidden md:opacity-0 md:transition-all md:group-focus-within:mt-2 md:group-focus-within:h-4 md:group-focus-within:opacity-100 md:group-hover:h-4 md:group-hover:opacity-100">
            <button onClick={() => onEdit(task)} className="text-[#2A3BFF] hover:underline">
              Edit
            </button>
            {canDelete && (
              <button onClick={() => onDelete(task)} className="text-red-600 hover:underline">
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}