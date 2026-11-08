import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import KanbanBoard from "../components/KanbanBoard";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import ChatBox from "../components/ChatBox";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isTeamOwner, setIsTeamOwner] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUserId, setSelectedUserId] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  async function loadData() {
    try {
      const projectData = await api(`/projects/${projectId}`);
      const loadedProject = projectData.data.project;

      const membersData = await api(`/projects/${projectId}/members`);

      // Our role in the team decides what we can do
      const teamsData = await api("/teams");
      const team = teamsData.data.teams.find((t) => t.id === loadedProject.team_id);

      const owner = team?.role === "OWNER";
      const allowed = owner || loadedProject.created_by === user.id;

      // Only people who can add members need the team member list
      if (allowed) {
        const teamMembersData = await api(`/teams/${loadedProject.team_id}/members`);
        setTeamMembers(teamMembersData.data.members);
      }

      setProject(loadedProject);
      setProjectMembers(membersData.data.members);
      setIsTeamOwner(owner);
      setCanManage(allowed);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [projectId]);

  // Team members who are not in the project yet
  const availableMembers = teamMembers.filter(
    (member) => !projectMembers.some((pm) => pm.id === member.id)
  );

  async function handleAddMember(event) {
    event.preventDefault();
    setAddError("");
    setAdding(true);

    try {
      await api(`/projects/${projectId}/members`, "POST", { userId: selectedUserId });
      setSelectedUserId("");
      await loadData();
    } catch (err) {
      setAddError(err.message);
    }

    setAdding(false);
  }

  return (
    <div className="min-h-screen bg-[#F4F6FF] pb-16">
      {/* Full-width Navbar matching all other pages */}
      <Navbar />

      {/* Main container stretching full width with minimal horizontal spacing */}
      <main className="w-full px-3 sm:px-6">
        <div className="mb-4">
          {project ? (
            <Link
              to={`/teams/${project.team_id}`}
              className="font-display text-xs font-extrabold uppercase text-[#0E1330] hover:text-[#2A3BFF]"
            >
              ← Back to team
            </Link>
          ) : (
            <Link
              to="/"
              className="font-display text-xs font-extrabold uppercase text-[#0E1330] hover:text-[#2A3BFF]"
            >
              ← Back to teams
            </Link>
          )}
        </div>

        {loading && (
          <div className="rounded-xl border-2 border-[#0E1330] bg-white p-4 font-display text-xs font-extrabold text-[#0E1330]">
            Loading project details...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border-2 border-[#0E1330] bg-rose-200 p-3 font-bold text-rose-900 shadow-[3px_3px_0_#0E1330]">
            🚨 {error}
          </div>
        )}

        {project && (
          <>
            {/* Project Header Banner */}
            <div className="mb-6 rounded-2xl border-2 border-[#0E1330] bg-[#2A3BFF] p-5 text-white shadow-[4px_4px_0_#0E1330]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-white/20 bg-[#CBFF4D] px-2 py-0.5 font-display text-[10px] font-extrabold text-[#0E1330]">
                      PROJECT
                    </span>
                  </div>
                  <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {project.name}
                  </h1>
                  {project.description && (
                    <p className="mt-1 text-xs font-semibold text-blue-100">{project.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="rounded-xl border-2 border-[#0E1330] bg-white px-4 py-2 text-[#0E1330]">
                    <p className="text-[10px] font-extrabold uppercase text-slate-500">Members</p>
                    <p className="font-display text-2xl font-extrabold text-[#2A3BFF] leading-none">
                      {projectMembers.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanban board stretching full width from left to right */}
            <div className="w-full">
              <KanbanBoard
                projectId={projectId}
                projectMembers={projectMembers}
                isTeamOwner={isTeamOwner}
              />
            </div>

            {/* Members section below the board */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-5 shadow-[4px_4px_0_#0E1330]">
                <h2 className="font-display mb-3 text-sm font-extrabold uppercase tracking-wider text-[#0E1330]">
                  Project members ({projectMembers.length})
                </h2>

                <div className="flex flex-col gap-2">
                  {projectMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-[#0E1330]/20 bg-[#F4F6FF] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0E1330] bg-[#CBFF4D] font-display text-xs font-extrabold text-[#0E1330]">
                          {member.name ? member.name.slice(0, 2).toUpperCase() : "??"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0E1330]">{member.name}</p>
                          <p className="text-[10px] font-semibold text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {canManage && (
                <div className="h-fit rounded-2xl border-2 border-[#0E1330] bg-white p-5 shadow-[4px_4px_0_#0E1330]">
                  <h2 className="font-display mb-3 text-sm font-extrabold uppercase tracking-wider text-[#0E1330]">
                    Add a member
                  </h2>

                  {addError && (
                    <div className="mb-3 rounded-lg border border-[#0E1330] bg-rose-200 p-2 text-xs font-bold text-rose-900">
                      🚨 {addError}
                    </div>
                  )}

                  {availableMembers.length === 0 ? (
                    <p className="text-xs font-medium text-slate-500">
                      Everyone in the team is already in this project.
                    </p>
                  ) : (
                    <form onSubmit={handleAddMember} className="flex flex-col gap-3">
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        required
                        className="w-full rounded-lg border-2 border-[#0E1330] bg-[#F4F6FF] p-2.5 text-xs font-semibold text-[#0E1330] outline-none focus:bg-white focus:ring-2 focus:ring-[#2A3BFF]"
                      >
                        <option value="">Select a team member</option>
                        {availableMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} ({member.email})
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={adding}
                        className="w-full rounded-lg border-2 border-[#0E1330] bg-[#CBFF4D] py-2.5 font-display text-xs font-extrabold uppercase text-[#0E1330] shadow-[2px_2px_0_#0E1330] hover:bg-[#d9ff7a] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {adding ? "Adding..." : "Add to project"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Project Chat */}
            <div className="mt-8">
              {projectMembers.some((member) => member.id === user.id) ? (
                <ChatBox type="project" id={projectId} title={`${project.name} Chat`} />
              ) : (
                <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-5 text-xs font-semibold text-slate-500 shadow-[4px_4px_0_#0E1330]">
                  Only project members can use the project chat. Add yourself to the project to
                  join it.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
