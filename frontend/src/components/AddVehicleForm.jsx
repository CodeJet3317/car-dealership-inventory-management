import React, { useState } from "react";
import { apiRequest } from "../api/client";
import { Wrench, Plus, CheckCircle2 } from "lucide-react";

export const AddVehicleForm = ({ onVehicleAdded }) => {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiRequest(
        "/vehicles",
        "POST",
        {
          make,
          model,
          category,
          price: parseFloat(price),
          quantity: parseInt(quantity, 10),
        },
        true
      );

      setSuccess("Vehicle added to inventory successfully!");
      setMake("");
      setModel("");
      setCategory("");
      setPrice("");
      setQuantity("");

      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (err) {
      setError(err.message || "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl mb-8 border border-amber-500/20 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>

      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-200">Admin Control: Add New Vehicle</h3>
          <p className="text-xs text-amber-400/70">Expand current inventory stock</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
        <input
          type="text"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          placeholder="Make (e.g. Toyota)"
          required
          className="p-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Model (e.g. Camry)"
          required
          className="p-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (Sedan)"
          required
          className="p-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price ($)"
          required
          className="p-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          required
          className="p-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="col-span-1 sm:col-span-2 md:col-span-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-900/20 flex items-center justify-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{loading ? "Adding..." : "Add Vehicle"}</span>
        </button>
      </form>
    </div>
  );
};
