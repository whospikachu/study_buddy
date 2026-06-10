import React, { useState } from "react";
import { authService } from "../services/authService"; // Note the '../' to step out of pages folder

function AuthPage({ setIsAuthenticated }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isLoginMode) {
        await authService.login(username, password);
        setIsAuthenticated(true);
      } else {
        await authService.register(username, email, password);
        setSuccessMsg("Account created successfully! Switching to login...");
        setTimeout(() => {
          setIsLoginMode(true);
          setEmail("");
          setPassword("");
        }, 2000);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const backendErrors = Object.values(err.response.data).flat();
        setErrorMsg(backendErrors.join(" "));
      } else {
        setErrorMsg("Something went wrong. Please check your connection.");
      }
    }
  };

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
            />
          </div>

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
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg transition duration-200 mt-2"
          >
            {isLoginMode ? "Sign In" : "Sign Up"}
          </button>
        </form>

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

export default AuthPage;
