import React, { useState } from "react";
import { apiRequest } from "../api/client";
import { RefreshCw, X } from "lucide-react";

export const RestockModal = ({ vehicle, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(5);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!vehicle) return null;

  const id = vehicle.id || vehicle[0];
  const make = vehicle.make || vehicle[1];
  const model = vehicle.model || vehicle[2];
  const currentStock = vehicle.quantity || vehicle[5];

  const handleRestock = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest(
        `/vehicles/${id}/restock`,
        "POST",
        { quantity: parseInt(quantity, 10) },
        true
      );

      onSuccess();
    } catch (err) {
      setError(err.message || "Restock failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-amber-500/30 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-200">Admin Restock</h3>
            <p className="text-xs text-slate-400">Increase stock units for this vehicle</p>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 mb-4 space-y-1">
          <p className="text-sm font-bold text-slate-200">
            {make} {model}
          </p>
          <p className="text-xs text-amber-400">Current Stock: {currentStock} Units</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRestock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Add Quantity Units
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              required
              className="w-full p-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-950/30 disabled:opacity-50"
            >
              {loading ? "Restocking..." : "Add to Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
