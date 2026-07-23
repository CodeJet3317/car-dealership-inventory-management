import React from "react";
import { useAuth } from "../context/AuthContext";
import { Car, KeyRound, LogOut, User, HelpCircle } from "lucide-react";
import { startUserTour } from "../utils/tour";

export const Navbar = ({ onOpenResetModal }) => {
  const { isAuthenticated, email, role, logout } = useAuth();

  return (
    <nav className="glass-panel sticky top-0 z-40 px-6 py-4 mb-8 shadow-xl flex flex-wrap justify-between items-center border-b border-slate-700/50">
      <div id="nav-brand" className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30">
          <Car className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Car Dealership Portal
          </h1>
          <p className="text-xs text-slate-400 font-medium">Inventory & Operations Hub</p>
        </div>
      </div>

      {isAuthenticated && (
        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          <button
            id="take-tour-btn"
            onClick={startUserTour}
            className="flex items-center space-x-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
            title="Start Interactive Tour"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Take Tour</span>
          </button>

          {role === "ADMIN" && (
            <button
              onClick={() => onOpenResetModal(false)}
              className="flex items-center space-x-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Reset Password/Email</span>
            </button>
          )}

          <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 shadow-inner">
            <User className="w-4 h-4 text-blue-400" />
            <span>
              Signed in as: <strong className="text-white">{email}</strong>
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                role === "ADMIN"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {role}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 bg-rose-600/80 hover:bg-rose-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-md shadow-rose-900/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};
