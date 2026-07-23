import React from "react";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, RefreshCw, Trash2, Tag, Layers } from "lucide-react";

export const VehicleCard = ({ vehicle, onPurchase, onRestock, onDelete }) => {
  const { role } = useAuth();

  const id = vehicle.id || vehicle[0];
  const make = vehicle.make || vehicle[1];
  const model = vehicle.model || vehicle[2];
  const category = vehicle.category || vehicle[3];
  const price = vehicle.price || vehicle[4];
  const quantity = vehicle.quantity || vehicle[5];

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:border-slate-500/40 transition-all duration-300 shadow-xl group hover:-translate-y-1">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-extrabold text-lg text-white group-hover:text-blue-300 transition-colors">
            {make} {model}
          </h4>
          <span className="flex items-center space-x-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
            <Tag className="w-3 h-3" />
            <span>{category}</span>
          </span>
        </div>

        <div className="mt-3 mb-4">
          <p className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            {formattedPrice}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Stock Available:</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                quantity > 0
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              {quantity > 0 ? `${quantity} Units` : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-700/50">
        <button
          onClick={() => onPurchase(vehicle)}
          disabled={quantity <= 0}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{quantity > 0 ? "Purchase Vehicle" : "Out of Stock"}</span>
        </button>

        {role === "ADMIN" && (
          <div className="flex space-x-2 pt-1">
            <button
              onClick={() => onRestock(vehicle)}
              className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restock</span>
            </button>
            <button
              onClick={() => onDelete(id)}
              className="flex-1 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
