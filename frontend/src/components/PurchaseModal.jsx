import React, { useState } from "react";
import { apiRequest } from "../api/client";
import { ShoppingBag, X, CheckCircle2 } from "lucide-react";

export const PurchaseModal = ({ vehicle, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!vehicle) return null;

  const id = vehicle.id || vehicle[0];
  const make = vehicle.make || vehicle[1];
  const model = vehicle.model || vehicle[2];
  const price = vehicle.price || vehicle[4];
  const availableStock = vehicle.quantity || vehicle[5];

  const totalPrice = parseFloat(price) * quantity;

  const handlePurchase = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest(
        `/vehicles/${id}/purchase`,
        "POST",
        { quantity: parseInt(quantity, 10) },
        true
      );

      onSuccess();
    } catch (err) {
      setError(err.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Purchase Vehicle</h3>
            <p className="text-xs text-slate-400">Confirm purchase order details</p>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 mb-4 space-y-1">
          <p className="text-sm font-bold text-slate-200">
            {make} {model}
          </p>
          <p className="text-xs text-slate-400">Unit Price: ${parseFloat(price).toLocaleString()}</p>
          <p className="text-xs text-slate-400">Stock Available: {availableStock} Units</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handlePurchase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Quantity
            </label>
            <input
              type="number"
              min="1"
              max={availableStock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              required
              className="w-full p-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center">
            <span className="text-xs text-emerald-300 font-semibold">Total Cost:</span>
            <span className="text-lg font-black text-emerald-300">${totalPrice.toLocaleString()}</span>
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
              disabled={loading || availableStock <= 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-950/30 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
