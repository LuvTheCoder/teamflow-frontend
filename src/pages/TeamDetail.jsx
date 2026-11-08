import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../api/api";
import ChatBox from "../components/ChatBox";

export default function TeamDetail() {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState("");

  async function loadData() {
    try {
      const teamsData = await api("/teams");
      const found = teamsData.data.teams.find((t) => t.id === teamId);

      if (!found) {
        setError("Team not found");
        setLoading(false);
        return;
      }

      const membersData = await api(`/teams/${teamId}/members`);
      const projectsData = await api(`/teams/${teamId}/projects`);

      setTeam(found);
      setMembers(membersData.data.members);
      setProjects(projectsData.data.projects);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [teamId]);

  async function handleInvite(event) {
    event.preventDefault();
    setInviteMessage("");
    setInviteError("");
    setInviting(true);

    try {
      await api(`/teams/${teamId}/invitations`, "POST", { email: inviteEmail });
      setInviteMessage(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err) {
      setInviteError(err.message);
    }
    setInviting(false);
  }

  async function handleCreateProject(event) {
    event.preventDefault();
    setProjectError("");
    setCreatingProject(true);

    try {
      await api(`/teams/${teamId}/projects`, "POST", {
        name: projectName,
        description: projectDescription || undefined,
      });
      setProjectName("");
      setProjectDescription("");
      await loadData();
    } catch (err) {
      setProjectError(err.message);
    }
    setCreatingProject(false);
  }

  return (
    <div className="min-h-screen bg-[#F4F6FF] pb-16">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="mb-4">
          <Link
            to="/teams"
            className="font-display text-xs font-extrabold uppercase text-[#0E1330] hover:text-[#2A3BFF]"
          >
            ← Back to teams
          </Link>
        </div>

        {loading && (
          <div className="rounded-xl border-2 border-[#0E1330] bg-white p-4 font-display text-xs font-extrabold text-[#0E1330]">
            Loading team details...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border-2 border-[#0E1330] bg-rose-200 p-3 font-bold text-rose-900 shadow-[3px_3px_0_#0E1330]">
            🚨 {error}
          </div>
        )}

        {team && (
          <>
            {/* Team Banner */}
            <div className="mb-6 rounded-2xl border-2 border-[#0E1330] bg-[#2A3BFF] p-5 text-white shadow-[4px_4px_0_#0E1330]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-white/20 bg-[#CBFF4D] px-2 py-0.5 font-display text-[10px] font-extrabold text-[#0E1330]">
                      WORKSPACE
                    </span>
                    <span className="rounded border border-white/20 bg-white/20 px-2 py-0.5 font-display text-[10px] font-extrabold uppercase">
                      ROLE: {team.role}
                    </span>
                  </div>
                  <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {team.name}
                  </h1>
                  {team.description && (
                    <p className="mt-1 text-xs font-semibold text-blue-100">{team.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="rounded-xl border-2 border-[#0E1330] bg-white px-4 py-2 text-[#0E1330]">
                    <p className="text-[10px] font-extrabold uppercase text-slate-500">Projects</p>
                    <p className="font-display text-2xl font-extrabold text-[#2A3BFF] leading-none">
                      {projects.length}
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-[#0E1330] bg-[#CBFF4D] px-4 py-2 text-[#0E1330]">
                    <p className="text-[10px] font-extrabold uppercase text-[#0E1330]/70">Members</p>
                    <p className="font-display text-2xl font-extrabold text-[#0E1330] leading-none">
                      {members.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column Grid */}
            <div className="grid gap-6 md:grid-cols-12 items-start">
              {/* Projects & Roster */}
              <div className="md:col-span-7 flex flex-col gap-6">
                <div>
                  <h2 className="font-display mb-3 text-lg font-extrabold text-[#0E1330]">
                    Projects ({projects.length})
                  </h2>

                  {projects.length === 0 && (
                    <div className="rounded-xl border-2 border-[#0E1330] bg-white p-4 text-xs font-bold text-slate-500 shadow-[3px_3px_0_#0E1330]">
                      No projects active yet. Use the sidebar form to spin up a project.
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="group flex flex-col justify-between rounded-xl border-2 border-[#0E1330] bg-white p-4 shadow-[3px_3px_0_#0E1330] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#0E1330]"
                      >
                        <div>
                          <div className="flex h-7 w-7 items-center justify-center rounded border border-[#0E1330] bg-[#CBFF4D] font-display text-xs font-extrabold text-[#0E1330]">
                            {project.name.slice(0, 2).toUpperCase()}
                          </div>
                          <h3 className="font-display mt-2 text-base font-extrabold text-[#0E1330] group-hover:text-[#2A3BFF]">
                            {project.name}
                          </h3>
                          <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-2">
                            {project.description || <span className="italic text-slate-300">No description</span>}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-bold text-[#0E1330]">
                          <span>Open board</span>
                          <span className="transition-transform group-hover:translate-x-1 group-hover:text-[#2A3BFF]">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Team Roster */}
                <div className="rounded-xl border-2 border-[#0E1330] bg-white p-4 shadow-[3px_3px_0_#0E1330]">
                  <h2 className="font-display mb-3 text-xs font-extrabold uppercase tracking-wider text-[#0E1330]">
                    Members ({members.length})
                  </h2>

                  <div className="flex flex-col gap-2">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg border border-[#0E1330]/20 bg-[#F4F6FF] px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0E1330] bg-white font-display text-xs font-extrabold text-[#0E1330]">
                            {m.name ? m.name.slice(0, 2).toUpperCase() : "??"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#0E1330]">{m.name}</p>
                            <p className="text-[10px] font-semibold text-slate-500">{m.email}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded border border-[#0E1330] px-2 py-0.5 font-display text-[9px] font-extrabold uppercase ${
                            m.role === "OWNER" ? "bg-[#CBFF4D] text-[#0E1330]" : "bg-white text-[#0E1330]"
                          }`}
                        >
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Action Forms */}
              <div className="md:col-span-5 flex flex-col gap-4">
                {/* Create Project Card */}
                <div className="rounded-xl border-2 border-[#0E1330] bg-white p-4 shadow-[3px_3px_0_#0E1330]">
                  <h2 className="font-display mb-3 text-xs font-extrabold uppercase tracking-wider text-[#0E1330]">
                    Create Project
                  </h2>

                  {projectError && (
                    <div className="mb-2 rounded-lg border border-[#0E1330] bg-rose-200 p-2 text-xs font-bold text-rose-900">
                      🚨 {projectError}
                    </div>
                  )}

                  <form onSubmit={handleCreateProject} className="flex flex-col gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#0E1330]">
                        Project Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mobile App Redesign"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                        className="w-full rounded-lg border-2 border-[#0E1330] bg-[#F4F6FF] px-3 py-2 text-xs font-semibold text-[#0E1330] outline-none focus:bg-white focus:ring-2 focus:ring-[#2A3BFF]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#0E1330]">
                        Description
                      </label>
                      <textarea
                        placeholder="Project goal..."
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-lg border-2 border-[#0E1330] bg-[#F4F6FF] px-3 py-2 text-xs font-semibold text-[#0E1330] outline-none focus:bg-white focus:ring-2 focus:ring-[#2A3BFF]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creatingProject}
                      className="w-full rounded-lg border-2 border-[#0E1330] bg-[#CBFF4D] py-2 font-display text-xs font-extrabold uppercase text-[#0E1330] shadow-[2px_2px_0_#0E1330] hover:bg-[#d9ff7a]"
                    >
                      {creatingProject ? "Creating..." : "Create Project"}
                    </button>
                  </form>
                </div>

                {/* Invite Member Card */}
                {team.role === "OWNER" && (
                  <div className="rounded-xl border-2 border-[#0E1330] bg-white p-4 shadow-[3px_3px_0_#0E1330]">
                    <h2 className="font-display mb-3 text-xs font-extrabold uppercase tracking-wider text-[#0E1330]">
                      Invite Teammate
                    </h2>

                    {inviteMessage && (
                      <div className="mb-2 rounded-lg border border-[#0E1330] bg-[#CBFF4D] p-2 text-xs font-extrabold text-[#0E1330]">
                        ✅ {inviteMessage}
                      </div>
                    )}
                    {inviteError && (
                      <div className="mb-2 rounded-lg border border-[#0E1330] bg-rose-200 p-2 text-xs font-bold text-rose-900">
                        🚨 {inviteError}
                      </div>
                    )}

                    <form onSubmit={handleInvite} className="flex flex-col gap-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#0E1330]">
                          Email <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="teammate@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                          className="w-full rounded-lg border-2 border-[#0E1330] bg-[#F4F6FF] px-3 py-2 text-xs font-semibold text-[#0E1330] outline-none focus:bg-white focus:ring-2 focus:ring-[#2A3BFF]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={inviting}
                        className="w-full rounded-lg border-2 border-[#0E1330] bg-[#2A3BFF] py-2 font-display text-xs font-extrabold uppercase text-white shadow-[2px_2px_0_#0E1330] hover:bg-[#1f2ed6]"
                      >
                        {inviting ? "Sending..." : "Send Invitation"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Chat Trigger */}
            <ChatBox type="team" id={teamId} title={`${team.name} Chat`} />
          </>
        )}
      </main>
    </div>
  );
}