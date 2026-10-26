import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl p-5">
      <Navbar />

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">You are logged in</h2>
        <p className="mt-1 text-gray-600">
          Teams, projects and the Kanban board are coming in the next steps.
        </p>
      </div>
    </div>
  );
}