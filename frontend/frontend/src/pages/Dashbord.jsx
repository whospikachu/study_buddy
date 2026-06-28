import React, { useState } from "react";
import { authService } from "../services/authService";
import TodoList from "../components/TodoList";
import StudyTimer from "../components/StudyTimer";
import ExamTracker from "../components/Exams";
import StudyAnalytics from "../components/StudyAnalytics";
function DashboardPage({ setIsAuthenticated }) {
  const [refreshToken, setRefreshToken] = useState(0);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };
  const handleSessionComplete = () => {
    setRefreshToken((prev) => prev + 1);
  };
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
          Study Buddy
        </h1>
        <button
          onClick={handleLogout}
          className="bg-slate-700 hover:bg-rose-600 px-4 py-2 rounded-xl text-sm font-medium transition duration-200"
        >
          Log Out
        </button>
      </nav>

      {/* Grid Content */}
      <main className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        {/* Left Column: Timer & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl h-64 flex items-center justify-center">
            <StudyTimer onSessionLogged={handleSessionComplete} />
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <StudyAnalytics refreshTrigger={refreshToken} />
          </div>
        </div>

        {/* Right Column: Todo Checklist & Exams */}
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl min-h-[250px]">
            <h3 className="text-xl font-bold text-indigo-300 mb-4">
              Task Checklist
            </h3>

            <TodoList />
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl min-h-[250px]">
            <h3 className="text-xl font-bold text-indigo-300 mb-4">
              Upcoming Exams
            </h3>
            <ExamTracker />
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
