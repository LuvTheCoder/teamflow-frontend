import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import KanbanBoard from "../components/KanbanBoard";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";

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
    <div className="mx-auto max-w-6xl p-5">
      <Navbar />

      {project ? (
        <Link to={`/teams/${project.team_id}`} className="text-sm text-blue-600 hover:underline">
          &larr; Back to team
        </Link>
      ) : (
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          &larr; Back to teams
        </Link>
      )}

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}

      {error && <p className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</p>}

      {project && (
        <>
          <div className="mb-6 mt-3">
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            {project.description && <p className="text-gray-500">{project.description}</p>}
          </div>

          {/* Kanban board (full width) */}
          <KanbanBoard
            projectId={projectId}
            projectMembers={projectMembers}
            isTeamOwner={isTeamOwner}
          />

          {/* Members section below the board */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-800">
                Project members ({projectMembers.length})
              </h2>

              <div className="divide-y divide-gray-100">
                {projectMembers.map((member) => (
                  <div key={member.id} className="py-2.5">
                    <p className="text-sm font-medium text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                ))}
              </div>
            </div>

            {canManage && (
              <div className="h-fit rounded-lg bg-white p-5 shadow-sm">
                <h2 className="mb-3 font-semibold text-gray-800">Add a member</h2>

                {addError && (
                  <p className="mb-3 rounded-md bg-red-100 p-3 text-sm text-red-700">{addError}</p>
                )}

                {availableMembers.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Everyone in the team is already in this project.
                  </p>
                ) : (
                  <form onSubmit={handleAddMember} className="flex flex-col gap-3">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                      className="rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                      className="rounded-md bg-blue-600 p-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {adding ? "Adding..." : "Add to project"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}