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
    <div className="mx-auto max-w-5xl p-5">
      <Navbar />

      {error && <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</p>}

      {/* Pending invitations (only shown if there are any) */}
      {invitations.length > 0 && (
        <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <h2 className="mb-3 font-semibold text-gray-800">Team invitations</h2>

          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md bg-white p-3"
            >
              <p className="text-sm text-gray-700">
                <strong>{invitation.inviter?.name}</strong> invited you to join{" "}
                <strong>{invitation.teams?.name}</strong>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => answerInvitation(invitation.id, "accept")}
                  className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => answerInvitation(invitation.id, "decline")}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Create team form */}
        <div className="h-fit rounded-lg bg-white p-5 shadow-sm md:col-span-1">
          <h2 className="mb-3 font-semibold text-gray-800">Create a team</h2>

          <form onSubmit={handleCreateTeam} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Team name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-blue-600 p-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {creating ? "Creating..." : "Create team"}
            </button>
          </form>
        </div>

        {/* Team list */}
        <div className="md:col-span-2">
          <h2 className="mb-3 font-semibold text-gray-800">Your teams</h2>

          {loading && <p className="text-gray-500">Loading...</p>}

          {!loading && teams.length === 0 && (
            <p className="rounded-lg bg-white p-5 text-gray-500 shadow-sm">
              You are not in any team yet. Create one to get started.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {teams.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="block rounded-lg bg-white p-4 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{team.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      team.role === "OWNER"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {team.role}
                  </span>
                </div>
                {team.description && (
                  <p className="mt-1 text-sm text-gray-500">{team.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}