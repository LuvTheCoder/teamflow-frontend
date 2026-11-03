import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../api/api";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Load teams and invitations from the backend
  async function loadData() {
    try {
      const teamsData = await api("/teams");
      const invitationsData = await api("/invitations");
      setTeams(teamsData.data.teams);
      setInvitations(invitationsData.data.invitations);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateTeam(event) {
    event.preventDefault();
    setError("");
    setCreating(true);

    try {
      await api("/teams", "POST", { name, description: description || undefined });
      setName("");
      setDescription("");
      await loadData();
    } catch (err) {
      setError(err.message);
    }

    setCreating(false);
  }

  // action is "accept" or "decline"
  async function answerInvitation(invitationId, action) {
    setError("");

    try {
      await api(`/invitations/${invitationId}/${action}`, "POST");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#172B4D] antialiased">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 border-b border-[#DFE1E6] pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5E6C84]">
            <span>Workspaces</span>
            <span>/</span>
            <span className="text-[#0052CC]">Teams</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-[#172B4D]">Teams</h1>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 rounded border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Invitations section */}
        {invitations.length > 0 && (
          <section className="mb-8 rounded-md border border-[#FFAB00] bg-[#FFFAE6] p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#172B4D]">
              Pending Invitations ({invitations.length})
            </h2>

            <div className="flex flex-col gap-2">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col gap-3 rounded border border-[#DFE1E6] bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm text-[#172B4D]">
                    <span className="font-semibold">{invitation.inviter?.name}</span> invited you to join{" "}
                    <span className="font-semibold text-[#0052CC]">{invitation.teams?.name}</span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => answerInvitation(invitation.id, "accept")}
                      className="rounded bg-[#0052CC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0747A6]"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => answerInvitation(invitation.id, "decline")}
                      className="rounded border border-[#DFE1E6] bg-white px-3 py-1.5 text-xs font-semibold text-[#42526E] hover:bg-[#EBECF0]"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Grid Layout */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Create Team Form */}
          <section className="h-fit rounded-md border border-[#DFE1E6] bg-white p-5 md:col-span-1">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#5E6C84]">
              Create Team
            </h2>

            <form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172B4D]">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded border border-[#DFE1E6] bg-[#FAFBFC] p-2 text-sm text-[#172B4D] outline-none hover:bg-[#EBECF0] focus:border-[#4C9AFF] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172B4D]">
                  Description
                </label>
                <textarea
                  placeholder="Add a team description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded border border-[#DFE1E6] bg-[#FAFBFC] p-2 text-sm text-[#172B4D] outline-none hover:bg-[#EBECF0] focus:border-[#4C9AFF] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="mt-1 rounded bg-[#0052CC] py-2 text-xs font-semibold text-white hover:bg-[#0747A6] disabled:bg-[#0052CC]/50"
              >
                {creating ? "Creating..." : "Create Team"}
              </button>
            </form>
          </section>

          {/* Teams List */}
          <section className="md:col-span-2">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#5E6C84]">
              Your Teams ({teams.length})
            </h2>

            {loading && (
              <p className="text-xs text-[#5E6C84]">Loading teams...</p>
            )}

            {!loading && teams.length === 0 && (
              <div className="rounded-md border border-[#DFE1E6] bg-white p-8 text-center text-sm text-[#5E6C84]">
                You are not in any teams yet. Create one to get started.
              </div>
            )}

            <div className="flex flex-col gap-2">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="group flex flex-col justify-between rounded-md border border-[#DFE1E6] bg-white p-4 transition-colors hover:border-[#4C9AFF] hover:bg-[#FAFBFC] sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3">
                    {/* Minimalist Flat Icon Badge */}
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-[#DEEBFF] text-xs font-bold text-[#0052CC]">
                      {team.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#172B4D] group-hover:text-[#0052CC]">
                        {team.name}
                      </h3>
                      {team.description ? (
                        <p className="mt-0.5 text-xs text-[#5E6C84]">
                          {team.description}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs italic text-[#A5ADBA]">
                          No description
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 sm:mt-0">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                        team.role === "OWNER"
                          ? "bg-[#DEEBFF] text-[#0052CC]"
                          : "bg-[#EBECF0] text-[#42526E]"
                      }`}
                    >
                      {team.role}
                    </span>

                    <span className="text-xs text-[#5E6C84] group-hover:text-[#0052CC]">
                      &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}