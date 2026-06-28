import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function StudyAnalytics({ refreshTrigger }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionStats();
  }, [refreshTrigger]); // Reloads automatically whenever a new session is saved!

  const fetchSessionStats = async () => {
    try {
      const token =
        localStorage.getItem("access") || localStorage.getItem("token");
      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`, // Match your backend auth style (Bearer or Token)
        };
      }

      console.log("Analytics: Fetching data with explicit auth headers...");
      const response = await api.get("sessions/", config);

      setSessions(response.data);
    } catch (err) {
      console.error("Could not pull analytics details:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- STATS CALCULATIONS ---
  const totalSeconds = sessions.reduce(
    (acc, sess) => acc + (sess.duration_seconds || 0),
    0
  );

  // Format total focus hours
  const totalHoursText =
    totalSeconds > 0 ? `${(totalSeconds / 3600).toFixed(1)} hrs` : "0 hrs";

  // Calculate average session duration in minutes
  const avgSessionMins =
    sessions.length > 0 ? Math.round(totalSeconds / sessions.length / 60) : 0;

  // Generate 7-Day Activity Matrix for our CSS Bar Chart
  const getPastSevenDaysData = () => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dataMap = {};

    // 1. Initialize the last 7 days using exact local date keys (YYYY-MM-DD)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      // Creates a clean "YYYY-MM-DD" local key string
      const localIsoKey = d.toISOString().split("T")[0];

      dataMap[localIsoKey] = {
        label: dayNames[d.getDay()],
        minutes: 0,
      };
    }

    // 2. Extract and match timestamps cleanly
    sessions.forEach((sess) => {
      if (!sess.start_time) return;

      // Safely split out just the "YYYY-MM-DD" part of the backend timestamp
      const sessDateKey = sess.start_time.split("T")[0];

      // If it matches one of our last 7 days, accumulate the minutes
      if (dataMap[sessDateKey]) {
        dataMap[sessDateKey].minutes += Math.round(
          (sess.duration_seconds || 0) / 60
        );
      }
    });

    return Object.values(dataMap);
  };

  const barChartData = getPastSevenDaysData();
  const maxMinutesInChart = Math.max(...barChartData.map((d) => d.minutes), 1); // Avoid dividing by zero

  if (loading) {
    return (
      <p className="text-slate-500 text-xs animate-pulse">
        Calculating velocity stats...
      </p>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl text-slate-200">
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-slate-300">
          Focus Analytics
        </h3>
        <p className="text-[11px] text-slate-500">
          Your habit loops over the past 7 days
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Total Focused
          </span>
          <p className="text-xl font-mono font-bold text-indigo-400">
            {totalHoursText}
          </p>
        </div>
        <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Avg Session
          </span>
          <p className="text-xl font-mono font-bold text-emerald-400">
            {avgSessionMins}m
          </p>
        </div>
      </div>

      {/* Pure CSS/Tailwind Bar Chart */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
          Daily Distribution
        </span>

        <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-4 flex items-end justify-between h-28 gap-2 pt-6">
          {barChartData.map((day, idx) => {
            // Determine vertical height percentage dynamically
            const heightPct = Math.min(
              (day.minutes / maxMinutesInChart) * 100,
              100
            );

            return (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 h-full justify-end group relative"
              >
                {/* Hover Tooltip showing exact minutes */}
                <span className="absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[9px] px-1.5 py-0.5 rounded text-white font-mono pointer-events-none z-10">
                  {day.minutes}m
                </span>

                {/* The Graph Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full max-w-[16px] rounded-t-sm transition-all duration-500 min-h-[4px] ${
                    day.minutes > 0
                      ? "bg-indigo-500 group-hover:bg-indigo-400 shadow-md shadow-indigo-950"
                      : "bg-slate-800/40"
                  }`}
                />

                {/* Day Text Axis Label */}
                <span className="text-[10px] font-medium text-slate-500 mt-2 select-none">
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
