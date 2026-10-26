import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../api/api";

export default function TeamDetail() {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  // Create project form
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState("");

  async function loadData() {
    try {
      // The teams list tells us the team name and our role in it
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
    <div className="mx-auto max-w-5xl p-5">
      <Navbar />

      <Link to="/" className="text-sm text-blue-600 hover:underline">
        &larr; Back to teams
      </Link>

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}

      {error && <p className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</p>}

      {team && (
        <>
          <div className="mb-6 mt-3">
            <h1 className="text-2xl font-bold text-gray-800">{team.name}</h1>
            {team.description && <p className="text-gray-500">{team.description}</p>}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Left side: projects */}
            <div className="md:col-span-2">
              <h2 className="mb-3 font-semibold text-gray-800">Projects ({projects.length})</h2>

              {projects.length === 0 && (
                <p className="mb-4 rounded-lg bg-white p-5 text-gray-500 shadow-sm">
                  No projects to show yet. Create one using the form.
                  {team.role !== "OWNER" && " (Members only see projects they were added to.)"}
                </p>
              )}

              <div className="mb-6 flex flex-col gap-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block rounded-lg bg-white p-4 shadow-sm hover:shadow-md"
                  >
                    <h3 className="font-semibold text-gray-800">{project.name}</h3>
                    {project.description && (
                      <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                    )}
                  </Link>
                ))}
              </div>

              {/* Members list */}
              <div className="rounded-lg bg-white p-5 shadow-sm">
                <h2 className="mb-3 font-semibold text-gray-800">Members ({members.length})</h2>

                <div className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          member.role === "OWNER"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: forms */}
            <div className="flex h-fit flex-col gap-6">
              {/* Create project */}
              <div className="rounded-lg bg-white p-5 shadow-sm">
                <h2 className="mb-3 font-semibold text-gray-800">Create a project</h2>

                {projectError && (
                  <p className="mb-3 rounded-md bg-red-100 p-3 text-sm text-red-700">
                    {projectError}
                  </p>
                )}

                <form onSubmit={handleCreateProject} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                    className="rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={3}
                    className="rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    type="submit"
                    disabled={creatingProject}
                    className="rounded-md bg-blue-600 p-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {creatingProject ? "Creating..." : "Create project"}
                  </button>
                </form>
              </div>

              {/* Invite member (owners only) */}
              {team.role === "OWNER" && (
                <div className="rounded-lg bg-white p-5 shadow-sm">
                  <h2 className="mb-3 font-semibold text-gray-800">Invite a member</h2>

                  {inviteMessage && (
                    <p className="mb-3 rounded-md bg-green-100 p-3 text-sm text-green-700">
                      {inviteMessage}
                    </p>
                  )}
                  {inviteError && (
                    <p className="mb-3 rounded-md bg-red-100 p-3 text-sm text-red-700">
                      {inviteError}
                    </p>
                  )}

                  <form onSubmit={handleInvite} className="flex flex-col gap-3">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      type="submit"
                      disabled={inviting}
                      className="rounded-md bg-blue-600 p-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {inviting ? "Sending..." : "Send invitation"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}