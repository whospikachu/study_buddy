import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";

export default function StudyTimer({ onSessionLogged }) {
  const [isStudying, setIsStudying] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Keep the visual ticker moving while studying
  useEffect(() => {
    if (isStudying) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsElapsed(
          Math.floor((Date.now() - startTimeRef.current) / 1000)
        );
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isStudying]);

  const handleStart = () => {
    startTimeRef.current = Date.now();
    setSecondsElapsed(0);
    setIsStudying(true);
  };

  const handleStop = async () => {
    setIsStudying(false);
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTimeRef.current) / 1000);

    // Only save if you actually studied for more than 2 seconds
    if (durationSeconds > 2) {
      try {
        await api.post("sessions/", {
          start_time: new Date(startTimeRef.current).toISOString(),
          end_time: new Date(endTime).toISOString(),
          duration_seconds: durationSeconds,
        });

        // Let the dashboard know a new entry exists
        if (onSessionLogged) onSessionLogged();
      } catch (err) {
        console.error("Error saving focus session:", err);
      }
    }
    setSecondsElapsed(0);
  };

  // Turn raw seconds into hours, minutes, and seconds text display
  const formatTime = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-slate-400">Focus Tracker</h3>
        <h1 className="text-4xl font-mono font-bold text-slate-100 tracking-tight">
          {formatTime(secondsElapsed)}
        </h1>
      </div>

      <div className="flex justify-center">
        {isStudying ? (
          <button
            onClick={handleStop}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-rose-950/20 w-32"
          >
            Stop & Save
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-indigo-950/20 w-32"
          >
            Start Studying
          </button>
        )}
      </div>
    </div>
  );
}
