import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../api/api";

export default function TeamDetail() {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

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
      setTeam(found);
      setMembers(membersData.data.members);
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
            {/* Members list */}
            <div className="rounded-lg bg-white p-5 shadow-sm md:col-span-2">
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

            {/* Invite form (owners only) */}
            {team.role === "OWNER" && (
              <div className="h-fit rounded-lg bg-white p-5 shadow-sm">
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
        </>
      )}
    </div>
  );
}