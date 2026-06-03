import React, { useState } from "react";
import { authService } from "./services/authService";

function App() {
  // State to track if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token")
  );

  // Auth Form states
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isLoginMode) {
        // Run Login Flow
        await authService.login(username, password);
        setIsAuthenticated(true);
        // Clear forms
        setUsername("");
        setPassword("");
      } else {
        // Run Registration Flow
        await authService.register(username, email, password);
        setSuccessMsg("Account created successfully! Switching to login...");
        // Automatically switch to login mode after a brief pause
        setTimeout(() => {
          setIsLoginMode(true);
          setEmail("");
          setPassword("");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        // Extract field errors sent back by Django Rest Framework
        const backendErrors = Object.values(err.response.data).flat();
        setErrorMsg(backendErrors.join(" "));
      } else {
        setErrorMsg("Something went wrong. Please check your connection.");
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  // --- VIEW 1: WELCOME SCREEN (Post-Auth) ---
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-indigo-400 mb-2">
            🎉 Welcome!
          </h1>
          <p className="text-slate-300 mb-6">
            You have successfully authenticated with your Django backend.
          </p>

          <button
            onClick={handleLogout}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2.5 px-4 rounded-xl transition duration-200"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 2: AUTH CARD (Pre-Auth) ---
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-extrabold text-center text-indigo-400 mb-2">
          {isLoginMode ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          {isLoginMode
            ? "Sign in to access your Study Buddy dashboard"
            : "Sign up to start tracking your exams"}
        </p>

        {/* Alert Boxes */}
        {errorMsg && (
          <div className="bg-rose-900/50 border border-rose-500 text-rose-200 text-sm p-3 rounded-xl mb-4">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 text-sm p-3 rounded-xl mb-4">
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
              placeholder="Enter your username"
            />
          </div>

          {/* Render Email input only during registration */}
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="you@example.com"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition duration-200 mt-2"
          >
            {isLoginMode ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="mt-6 text-center text-sm text-slate-400">
          {isLoginMode
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="text-indigo-400 hover:underline font-medium"
          >
            {isLoginMode ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
