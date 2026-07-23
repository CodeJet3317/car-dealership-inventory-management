import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, Mail, Lock, ShieldCheck } from "lucide-react";

export const AuthForms = ({ onLoginComplete }) => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (toRegister) => {
    setIsRegisterMode(toRegister);
    setError("");
    setMessage("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register(email, password);
        setMessage("Registration successful! You can now log in below.");
        setIsRegisterMode(false);
        setPassword("");
      } else {
        const res = await login(email, password);
        if (onLoginComplete) {
          onLoginComplete(res.mustReset);
        }
      }
    } catch (err) {
      setError(err.message || (isRegisterMode ? "Failed to register" : "Failed to login"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden group border border-slate-700/60">
        <div
          className={`absolute -right-10 -top-10 w-36 h-36 rounded-full blur-2xl transition-all duration-500 ${
            isRegisterMode
              ? "bg-emerald-500/10 group-hover:bg-emerald-500/20"
              : "bg-indigo-500/10 group-hover:bg-indigo-500/20"
          }`}
        ></div>

        {/* Header */}
        <div className="flex items-center space-x-3.5 mb-6">
          <div
            className={`p-3 rounded-xl border transition-all duration-300 ${
              isRegisterMode
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
            }`}
          >
            {isRegisterMode ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              {isRegisterMode ? "Create Account" : "Login"}
            </h2>
            <p className="text-xs text-slate-400">
              {isRegisterMode
                ? "Register for standard access to the dealership portal"
                : "Sign in to access your portal account"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 mt-2 ${
              isRegisterMode
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40"
                : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-blue-950/40"
            }`}
          >
            {loading
              ? isRegisterMode
                ? "Registering..."
                : "Authenticating..."
              : isRegisterMode
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        {/* Toggle Link at Bottom */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
          {isRegisterMode ? (
            <p className="text-xs text-slate-400">
              Already a user?{" "}
              <button
                type="button"
                onClick={() => switchMode(false)}
                className="font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors"
              >
                Log in here
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode(true)}
                className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
