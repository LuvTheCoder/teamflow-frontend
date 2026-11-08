import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../api/api";

const BLUE = "bg-[#2A3BFF]";
const INK = "text-[#0E1330]";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  async function answerInvitation(invitationId, action) {
    setError("");

    try {
      await api(`/invitations/${invitationId}/${action}`, "POST");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Filter teams based on search query
  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const ownedTeamsCount = teams.filter((t) => t.role === "OWNER").length;

  return (
    <div className="min-h-screen bg-[#F4F6FF] pb-24 overflow-x-clip">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-3xl border-2 border-[#0E1330] bg-[#2A3BFF] p-6 sm:p-8 text-white shadow-[8px_8px_0_#0E1330]">
          <div className="grid gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-white/20 bg-[#CBFF4D] px-3 py-1 font-display text-xs font-extrabold text-[#0E1330]">
                  ORGANIZATION HUB
                </span>
                {invitations.length > 0 && (
                  <span className="rounded-md border border-white/20 bg-rose-400 px-2.5 py-1 font-display text-xs font-extrabold text-[#0E1330] animate-bounce">
                    {invitations.length} Pending Invites
                  </span>
                )}
              </div>
              <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Workspaces & Teams
              </h1>
              <p className="mt-2 max-w-xl text-base font-semibold text-blue-100">
                Collaborate with teammates, switch contexts, and keep your tasks aligned under dedicated workspaces.
              </p>
            </div>

            {/* Quick Metrics Badge Grid */}
            <div className="grid grid-cols-2 gap-3 md:col-span-4">
              <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-4 text-[#0E1330] shadow-[3px_3px_0_#0E1330]">
                <p className="text-[11px] font-extrabold uppercase text-slate-500">Total Teams</p>
                <p className="font-display text-3xl font-extrabold text-[#2A3BFF]">{teams.length}</p>
              </div>
              <div className="rounded-2xl border-2 border-[#0E1330] bg-[#CBFF4D] p-4 text-[#0E1330] shadow-[3px_3px_0_#0E1330]">
                <p className="text-[11px] font-extrabold uppercase text-[#0E1330]/70">Owned by You</p>
                <p className="font-display text-3xl font-extrabold text-[#0E1330]">{ownedTeamsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 rounded-2xl border-2 border-[#0E1330] bg-rose-200 p-4 font-bold text-rose-900 shadow-[4px_4px_0_#0E1330]">
            🚨 {error}
          </div>
        )}

        {/* Pending Invitations Section */}
        {invitations.length > 0 && (
          <section className="mb-8 rounded-2xl border-2 border-[#0E1330] bg-[#CBFF4D] p-6 shadow-[8px_8px_0_#0E1330]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-extrabold uppercase tracking-wider text-[#0E1330] flex items-center gap-2">
                ⚡ Pending Invitations ({invitations.length})
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col justify-between rounded-xl border-2 border-[#0E1330] bg-white p-4 shadow-[4px_4px_0_#0E1330]"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Invited By</p>
                    <p className="font-display text-base font-extrabold text-[#2A3BFF]">
                      {invitation.inviter?.name}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#0E1330]">
                      To join <span className="underline decoration-[#CBFF4D] decoration-4">{invitation.teams?.name}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => answerInvitation(invitation.id, "accept")}
                      className="flex-1 rounded-lg border-2 border-[#0E1330] bg-[#2A3BFF] py-2 text-xs font-extrabold text-white shadow-[2px_2px_0_#0E1330] hover:bg-[#1f2ed6] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => answerInvitation(invitation.id, "decline")}
                      className="flex-1 rounded-lg border-2 border-[#0E1330] bg-white py-2 text-xs font-extrabold text-slate-700 shadow-[2px_2px_0_#0E1330] hover:bg-slate-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main 2-Column Split Layout */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Side: Create Team Form (Sticky Panel) */}
          <section className="lg:col-span-4 lg:sticky lg:top-8">
            <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-6 shadow-[8px_8px_0_#0E1330]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-extrabold uppercase tracking-wider text-[#0E1330]">
                  Create Workspace
                </h2>
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#CBFF4D] border border-[#0E1330] text-xs font-bold">
                  +
                </span>
              </div>

              <form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-[#0E1330]">
                    Team Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Design & Product"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border-2 border-[#0E1330] bg-[#F4F6FF] p-3 text-sm font-semibold text-[#0E1330] placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#2A3BFF]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-[#0E1330]">
                    Description
                  </label>
                  <textarea
                    placeholder="What does this team focus on?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border-2 border-[#0E1330] bg-[#F4F6FF] p-3 text-sm font-semibold text-[#0E1330] placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#2A3BFF]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="mt-2 w-full rounded-xl border-2 border-[#0E1330] bg-[#CBFF4D] py-3 text-sm font-extrabold text-[#0E1330] shadow-[4px_4px_0_#0E1330] transition-all hover:bg-[#d9ff7a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#0E1330] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create Team"}
                </button>
              </form>

              {/* Helper Pro Tip Box */}
              <div className="mt-6 rounded-xl border-2 border-[#0E1330]/20 bg-[#F4F6FF] p-4 text-xs font-medium text-slate-600">
                💡 <span className="font-extrabold text-[#0E1330]">Pro Tip:</span> Creating a team allows you to invite teammates by email and isolate project taskboards.
              </div>
            </div>
          </section>

          {/* Right Side: Search & Team Roster Grid */}
          <section className="lg:col-span-8">
            {/* Search Header Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-[#0E1330]">
                  Your Teams
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Select a team to view active projects and real-time chat.
                </p>
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#0E1330] bg-white px-3 py-2 pr-8 text-xs font-bold text-[#0E1330] placeholder-slate-400 outline-none shadow-[3px_3px_0_#0E1330] focus:ring-2 focus:ring-[#2A3BFF]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">🔍</span>
              </div>
            </div>

            {loading && (
              <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-8 text-center shadow-[6px_6px_0_#0E1330]">
                <p className="font-display text-base font-extrabold text-[#0E1330] animate-pulse">
                  Loading team roster...
                </p>
              </div>
            )}

            {!loading && filteredTeams.length === 0 && (
              <div className="rounded-2xl border-2 border-[#0E1330] bg-white p-12 text-center shadow-[6px_6px_0_#0E1330]">
                <p className="font-display text-lg font-extrabold text-[#0E1330]">
                  {searchQuery ? "No matching teams found" : "No teams created yet"}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {searchQuery ? "Try searching for a different keyword." : "Use the form on the left to spin up your first workspace."}
                </p>
              </div>
            )}

            {/* Team Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredTeams.map((team) => (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="group relative flex flex-col justify-between rounded-2xl border-2 border-[#0E1330] bg-white p-5 shadow-[5px_5px_0_#0E1330] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0_#0E1330] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      {/* Visual Neo Badge Icon */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#0E1330] bg-[#CBFF4D] font-display text-lg font-extrabold text-[#0E1330] shadow-[2px_2px_0_#0E1330]">
                        {team.name.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Role Pill */}
                      <span
                        className={`rounded-md border border-[#0E1330] px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider ${
                          team.role === "OWNER"
                            ? "bg-[#2A3BFF] text-white"
                            : "bg-[#F4F6FF] text-[#0E1330]"
                        }`}
                      >
                        {team.role}
                      </span>
                    </div>

                    <h3 className="font-display mt-4 text-xl font-extrabold text-[#0E1330] group-hover:text-[#2A3BFF]">
                      {team.name}
                    </h3>

                    <p className="mt-1 text-xs font-medium text-slate-600 line-clamp-2 min-h-[32px]">
                      {team.description || <span className="italic text-slate-400">No description provided</span>}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t-2 border-[#0E1330]/10 pt-3">
                    <span className="text-xs font-extrabold text-slate-500">
                      View projects & chat
                    </span>
                    <span className="font-display text-base font-extrabold text-[#0E1330] transition-transform group-hover:translate-x-1 group-hover:text-[#2A3BFF]">
                      →
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