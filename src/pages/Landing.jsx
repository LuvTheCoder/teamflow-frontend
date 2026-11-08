import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

const BLUE = "bg-[#2A3BFF]";
const INK = "text-[#0E1330]";

/* ---------- Hero conveyor: tasks keep sliding through the lanes ---------- */

const LANES = ["To do", "In progress", "Review", "Done"];

const FLOW = [
  { title: "Design homepage", who: "Riya" },
  { title: "Write API docs", who: "Amit" },
  { title: "Fix login bug", who: "Priya" },
  { title: "Set up database", who: "Amit" },
  { title: "Review pull request", who: "Karan" },
];

function Conveyor() {
  return (
    <div className="relative mt-14 h-[220px] overflow-hidden border-y border-white/20">
      <div className="absolute inset-0 grid grid-cols-4">
        {LANES.map((lane, index) => (
          <div
            key={lane}
            className={`border-l border-white/20 px-3 pt-2 text-xs font-semibold ${
              index === 3 ? "text-[#CBFF4D]" : "text-white/70"
            }`}
          >
            {lane}
          </div>
        ))}
      </div>

      {FLOW.map((task, index) => (
        <div
          key={task.title}
          className="flow-card absolute left-0 w-56 rounded-xl p-3"
          style={{ top: 34 + (index % 3) * 62, animationDelay: `-${index * 4.8}s` }}
        >
          <p className="text-sm font-bold">{task.title}</p>
          <p className="text-xs opacity-70">{task.who}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Interactive demo board (same look and drag and drop as the real app) ---------- */

const COLUMNS = [
  { key: "TODO", title: "To do" },
  { key: "IN_PROGRESS", title: "In progress" },
  { key: "REVIEW", title: "Review" },
  { key: "DONE", title: "Done" },
];

const COLUMN_TITLES = { TODO: "To do", IN_PROGRESS: "In progress", REVIEW: "Review", DONE: "Done" };

const PRIORITY = {
  HIGH: { label: "High", style: "bg-[#0E1330] text-[#CBFF4D]" },
  MEDIUM: { label: "Medium", style: "bg-[#E7EAFF] text-[#2A3BFF]" },
  LOW: { label: "Low", style: "bg-slate-100 text-slate-500" },
};

const START_BOARD = {
  TODO: [
    { id: "1", title: "Design homepage", who: "Riya", priority: "HIGH" },
    { id: "2", title: "Write API docs", who: "Amit", priority: "MEDIUM" },
  ],
  IN_PROGRESS: [{ id: "3", title: "Fix login bug", who: "Priya", priority: "HIGH" }],
  REVIEW: [{ id: "4", title: "Review pull request", who: "Karan", priority: "MEDIUM" }],
  DONE: [{ id: "5", title: "Set up database", who: "Amit", priority: "LOW" }],
};

const FIRST_CHAT = [{ who: "Riya", text: "Homepage mockup is ready for review" }];

const CONFETTI_COLORS = ["#CBFF4D", "#FFFFFF", "#0E1330", "#8FA0FF"];

const DEMO_CSS = `
@keyframes lp-confetti {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  40% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 1; }
  100% { transform: translate(calc(var(--dx) * 1.3), 240px) rotate(calc(var(--rot) * 2)); opacity: 0; }
}
.lp-piece { position: absolute; animation: lp-confetti 1.3s cubic-bezier(0.2, 0.7, 0.3, 1) forwards; }
@media (prefers-reduced-motion: reduce) { .lp-piece { display: none; } }
`;

function DemoBoard() {
  const [board, setBoard] = useState(START_BOARD);
  const [chat, setChat] = useState(FIRST_CHAT);
  const [burst, setBurst] = useState(null);
  const burstTimer = useRef(null);

  useEffect(() => () => clearTimeout(burstTimer.current), []);

  const total = COLUMNS.reduce((sum, column) => sum + board[column.key].length, 0);
  const doneCount = board.DONE.length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  function celebrate() {
    const lane = document.getElementById("demo-col-DONE");
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

  function handleDragEnd({ source, destination }) {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const task = board[source.droppableId][source.index];
    const changedColumn = source.droppableId !== destination.droppableId;

    setBoard((current) => {
      const from = [...current[source.droppableId]];
      const [moved] = from.splice(source.index, 1);
      const to = changedColumn ? [...current[destination.droppableId]] : from;
      to.splice(destination.index, 0, moved);

      return { ...current, [source.droppableId]: from, [destination.droppableId]: to };
    });

    if (changedColumn) {
      setChat((current) => [
        ...current.slice(-2),
        { who: task.who, text: `moved "${task.title}" to ${COLUMN_TITLES[destination.droppableId]}` },
      ]);
      if (destination.droppableId === "DONE") celebrate();
    }
  }

  function reset() {
    setBoard(START_BOARD);
    setChat(FIRST_CHAT);
  }

  return (
    <div className="rounded-3xl bg-[#2A3BFF] p-4 text-white sm:p-6">
      <style>{DEMO_CSS}</style>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-3xl font-extrabold tracking-tight">Website Redesign</h3>
          <p className="text-sm text-blue-100">Drag a card to another column.</p>
        </div>
        <button
          onClick={reset}
          className="rounded-full border-2 border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10"
        >
          Reset
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-blue-100">
            {doneCount} of {total} tasks done
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {COLUMNS.map((column) => (
            <div
              key={column.key}
              id={`demo-col-${column.key}`}
              className="w-[75vw] shrink-0 snap-start sm:w-[280px] lg:w-auto"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <h4
                  className={`font-display text-lg font-bold ${
                    column.key === "DONE" ? "text-[#CBFF4D]" : "text-white"
                  }`}
                >
                  {column.title}
                </h4>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                  {board[column.key].length}
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
                    {board[column.key].map((task, index) => {
                      const priority = PRIORITY[task.priority];
                      const done = column.key === "DONE";

                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              style={dragProvided.draggableProps.style}
                              className={`mb-2 rounded-xl border-2 border-[#0E1330] bg-white p-3 text-[#0E1330] transition-shadow ${
                                dragSnapshot.isDragging
                                  ? "rotate-3 shadow-[8px_8px_0_#0E1330]"
                                  : "shadow-[3px_3px_0_#0E1330] hover:shadow-[5px_5px_0_#0E1330]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`font-display text-base font-bold leading-snug ${
                                    done ? "text-slate-400 line-through" : ""
                                  }`}
                                >
                                  {task.title}
                                </p>
                                <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${priority.style}`}
                                >
                                  {priority.label}
                                </span>
                              </div>

                              <div className="mt-3 flex items-center gap-2">
                                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#2A3BFF] text-[11px] font-bold text-white">
                                  {task.who.charAt(0)}
                                </span>
                                <span className="text-xs text-slate-500">{task.who}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}

                    {provided.placeholder}

                    {board[column.key].length === 0 && !snapshot.isDraggingOver && (
                      <p className="rounded-xl border-2 border-dashed border-white/30 p-4 text-center text-sm text-blue-100">
                        Drop a task here
                      </p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <div className="mt-4 rounded-2xl bg-white/10 p-4">
        <p className="mb-2 text-sm font-bold">Project chat</p>
        <div className="flex flex-col gap-1.5" aria-live="polite">
          {chat.map((line, index) => (
            <p key={index} className="rounded-lg bg-white px-3 py-1.5 text-sm text-[#0E1330]">
              <span className="font-bold text-[#2A3BFF]">{line.who}</span> {line.text}
            </p>
          ))}
        </div>
      </div>

      {burst && (
        <div
          key={burst.key}
          className="pointer-events-none fixed z-50"
          style={{ left: burst.x, top: burst.y }}
        >
          {burst.pieces.map((piece) => (
            <span
              key={piece.id}
              className="lp-piece rounded-sm"
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
    </div>
  );
}

/* ---------- Floating navbar ---------- */

const NAV_LINKS = [
  { id: "features", label: "Features" },
  { id: "how", label: "How it works" },
  { id: "faq", label: "FAQ" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  // Shrink the bar and fill the progress line while scrolling
  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 40);
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the link of the section that is in the middle of the screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            setActive(id);
          } else {
            setActive((previous) => (previous === id ? "" : previous));
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    NAV_LINKS.forEach((link) => {
      const element = document.getElementById(link.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Close the mobile menu with the Escape key
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Scroll progress line */}
      <div
        className="fixed left-0 top-0 z-50 h-1 bg-[#CBFF4D]"
        style={{ width: `${progress}%` }}
      />

      <header className="fixed inset-x-0 top-3 z-40 px-3 sm:top-4">
        <div className="mx-auto w-full max-w-4xl">
          <div
            className={`flex items-center justify-between rounded-full border border-white/15 bg-[#0E1330]/85 pl-4 pr-2 text-white shadow-xl backdrop-blur-md transition-all duration-300 ${
              scrolled ? "py-1" : "py-2"
            }`}
          >
            <a href="#top" className="flex items-center gap-2 rounded-full">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#CBFF4D] font-display text-base font-extrabold text-[#0E1330]">
                W
              </span>
              <span className="font-display text-lg font-extrabold">Wiener</span>
            </a>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    active === link.id
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <Link
                to="/login"
                className="hidden rounded-full px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[#CBFF4D] px-4 py-2 text-sm font-bold text-[#0E1330] hover:bg-[#d9ff7a]"
              >
                Get started
              </Link>

              <button
                onClick={() => setOpen((current) => !current)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 md:hidden"
              >
                <span className="relative block h-3.5 w-5">
                  <span
                    className={`absolute left-0 h-0.5 w-5 bg-white transition-all ${
                      open ? "top-1.5 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-1.5 h-0.5 w-5 bg-white transition-opacity ${
                      open ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 h-0.5 w-5 bg-white transition-all ${
                      open ? "top-1.5 -rotate-45" : "top-3"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>

          {open && (
            <div className="mt-2 rounded-3xl border border-white/15 bg-[#0E1330]/95 p-3 text-white shadow-xl backdrop-blur-md md:hidden">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-base ${
                    active === link.id ? "bg-white/15" : "hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-base hover:bg-white/10"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

/* ---------- Page sections ---------- */

function Hero() {
  return (
    <section className={`${BLUE} text-white`}>
      <div className="mx-auto w-full max-w-6xl px-5 pt-28 md:pt-36">
        <h1 className="fade-up font-display max-w-4xl text-6xl font-extrabold leading-[0.92] tracking-tighter sm:text-7xl lg:text-8xl">
          Work that keeps moving.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-blue-100">
          Plan tasks on a Kanban board, talk to your team in real time, and see how far every
          project has come. All in one place.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-[#CBFF4D] px-7 py-3.5 font-bold text-[#0E1330] hover:bg-[#d9ff7a]"
          >
            Create your team
          </Link>
          <Link
            to="/login"
            className="rounded-lg border-2 border-white/40 px-7 py-3.5 font-bold hover:bg-white/10"
          >
            Log in
          </Link>
        </div>
      </div>

      <Conveyor />
    </section>
  );
}

function Statement() {
  return (
    <section className="bg-[#F4F6FF]">
      <div className="mx-auto w-full max-w-6xl px-5 py-24">
        <p className={`font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl ${INK}`}>
          Tasks in one app. Chat in another. Progress in someone&rsquo;s head.
        </p>
        <p className="font-display mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-[#2A3BFF] sm:text-6xl">
          Wiener puts all three together.
        </p>
      </div>
    </section>
  );
}

function TrySection() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-24">
        <h2 className={`font-display max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl ${INK}`}>
          Don&rsquo;t take our word for it. Drag a card.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          This is the real board. Drag a task to another column, drop one into Done, and watch
          the progress bar and the team chat react.
        </p>

        <div className="mt-10">
          <DemoBoard />
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    title: "Teams and invitations",
    text: "Create a team and invite people by email. They accept the invitation and they are in.",
  },
  {
    title: "Projects with the right people",
    text: "Add only the people who work on a project. Everyone else stays out of its tasks and chat.",
  },
  {
    title: "Drag and drop Kanban board",
    text: "Drag tasks through To do, In progress, Review, and Done. Set a priority, a due date, and an owner on each one.",
  },
  {
    title: "Team and project chat",
    text: "Every team has a chat, and every project has its own private chat. Messages arrive instantly.",
  },
  {
    title: "Progress you can see",
    text: "The dashboard shows total, completed, and pending tasks, plus how far along each project is.",
  },
  {
    title: "Clear permissions",
    text: "Owners manage the team. Members work on their projects. Nobody sees work they are not part of.",
  },
];

function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-[#F4F6FF]">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-24">
        <h2 className={`font-display max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl ${INK}`}>
          Everything a team needs to get work done together
        </h2>
      </div>

      <div className="border-b border-[#0E1330]/20">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="group border-t border-[#0E1330]/20 transition-colors hover:bg-[#2A3BFF]"
          >
            <div className="mx-auto grid w-full max-w-6xl gap-3 px-5 py-9 md:grid-cols-2 md:items-center md:gap-12">
              <h3 className={`font-display text-3xl font-extrabold tracking-tight group-hover:text-white sm:text-4xl ${INK}`}>
                {feature.title}
              </h3>
              <p className="text-lg leading-relaxed text-slate-600 group-hover:text-blue-100">
                {feature.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const HOW = [
  { title: "Create a team", text: "Sign up, create your team, and invite the people you work with." },
  { title: "Start a project", text: "Add a project, choose who is on it, and fill the board with tasks." },
  {
    title: "Work and talk in one place",
    text: "Drag cards as work progresses, chat about it, and check the dashboard to see where you stand.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className={`scroll-mt-24 ${BLUE} text-white`}>
      <div className="mx-auto w-full max-w-6xl px-5 py-24">
        <h2 className="font-display max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          Up and running in three steps
        </h2>

        <ol className="mt-14 grid gap-12 md:grid-cols-3">
          {HOW.map((step, index) => (
            <li key={step.title}>
              <span className="font-display block text-8xl font-extrabold leading-none text-[#CBFF4D]">
                {index + 1}
              </span>
              <h3 className="font-display mt-4 text-2xl font-bold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-blue-100">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "How do I add people to my team?",
    a: "Open your team and enter their email address. They see the invitation when they log in and join with one click.",
  },
  {
    q: "Who can read a project chat?",
    a: "Only the members of that project. Team members who are not on the project cannot read it.",
  },
  {
    q: "Is there a team chat as well?",
    a: "Yes. Every team has a chat that all of its members can use, and each project has its own chat on top of that.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Wiener runs in your browser, on a computer or a phone.",
  },
];

function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 bg-white">
      <div className="mx-auto w-full max-w-3xl px-5 py-24">
        <h2 className={`font-display text-4xl font-extrabold tracking-tight sm:text-5xl ${INK}`}>
          Questions
        </h2>

        <div className="mt-10 divide-y-2 divide-[#0E1330] border-y-2 border-[#0E1330]">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className={`flex cursor-pointer list-none items-center justify-between text-lg font-bold ${INK}`}>
                {item.q}
                <span className="ml-4 text-3xl leading-none text-[#2A3BFF] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-[#CBFF4D]">
      <div className="mx-auto w-full max-w-6xl px-5 py-24">
        <h2 className={`font-display text-6xl font-extrabold leading-[0.92] tracking-tighter sm:text-8xl ${INK}`}>
          Ready to move?
        </h2>
        <p className={`mt-6 max-w-xl text-lg ${INK}`}>
          Create a team in a minute and invite the people you work with.
        </p>
        <Link
          to="/register"
          className="mt-8 inline-block rounded-lg bg-[#0E1330] px-8 py-4 text-lg font-bold text-[#CBFF4D] hover:bg-[#1a2150]"
        >
          Create your team
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0E1330] text-slate-300">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm">
        <span className="font-display text-lg font-extrabold text-white">Wiener</span>
        <span>&copy; {new Date().getFullYear()} Wiener. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div id="top" className="w-full overflow-x-clip">
      <Nav />
      <main>
        <Hero />
        <Statement />
        <TrySection />
        <Features />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}