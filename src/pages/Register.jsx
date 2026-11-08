import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BLUE = "bg-[#2A3BFF]";
const INK = "text-[#0E1330]";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }

    setSubmitting(false);
  }

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center ${BLUE} p-4 text-white overflow-x-clip`}>
      {/* Brand logo link back home */}
      <Link to="/" className="mb-8 flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#CBFF4D] font-display text-xl font-extrabold text-[#0E1330]">
          W
        </span>
        <span className="font-display text-2xl font-extrabold text-white">Wiener</span>
      </Link>

      {/* Main Registration Card */}
      <div className="w-full max-w-md rounded-2xl border-2 border-[#0E1330] bg-white p-6 sm:p-8 shadow-[8px_8px_0_#0E1330] transition-transform sm:rotate-1 sm:hover:rotate-0">
        <h1 className={`font-display text-3xl font-extrabold tracking-tight ${INK}`}>
          Get started today
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Create your account and start moving projects forward.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border-2 border-[#0E1330] bg-rose-100 p-3 text-xs font-bold text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className={`block mb-1 text-xs font-bold uppercase tracking-wider ${INK}`}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="Riya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`w-full rounded-lg border-2 border-[#0E1330] bg-[#F4F6FF] p-3 text-sm font-semibold ${INK} placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#2A3BFF]`}
            />
          </div>

          <div>
            <label className={`block mb-1 text-xs font-bold uppercase tracking-wider ${INK}`}>
              Email address
            </label>
            <input
              type="email"
              placeholder="riya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full rounded-lg border-2 border-[#0E1330] bg-[#F4F6FF] p-3 text-sm font-semibold ${INK} placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#2A3BFF]`}
            />
          </div>

          <div>
            <label className={`block mb-1 text-xs font-bold uppercase tracking-wider ${INK}`}>
              Password
            </label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full rounded-lg border-2 border-[#0E1330] bg-[#F4F6FF] p-3 text-sm font-semibold ${INK} placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#2A3BFF]`}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg border-2 border-[#0E1330] bg-[#CBFF4D] py-3 text-sm font-extrabold text-[#0E1330] shadow-[4px_4px_0_#0E1330] transition-all hover:bg-[#d9ff7a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#0E1330] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating team..." : "Create your account"}
          </button>
        </form>

        <div className="mt-6 border-t-2 border-[#0E1330]/10 pt-4 text-center">
          <p className="text-xs text-slate-600 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#2A3BFF] hover:underline">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}