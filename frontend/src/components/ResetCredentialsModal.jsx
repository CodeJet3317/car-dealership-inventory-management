import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, KeyRound, Mail, Lock, X } from "lucide-react";

export const ResetCredentialsModal = ({ isOpen, isForced, onClose, onSuccess }) => {
  const { email, updateCredentials } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (email) {
      setNewEmail(email);
    }
  }, [email, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await updateCredentials(newEmail, newPassword);
      setNewPassword("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to update credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl"></div>

        {!isForced && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            {isForced ? <ShieldAlert className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isForced ? "⚠️ Forced Reset Required" : "🔐 Reset Email & Password"}
            </h3>
            <p className="text-xs text-amber-400/80">
              {isForced
                ? "Security Policy: Update your admin email address and password before proceeding."
                : "Update your administrator email address or password below."}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              New Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="newadmin@gmail.com"
                required
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            {!isForced && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-950/40 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Admin Credentials"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
