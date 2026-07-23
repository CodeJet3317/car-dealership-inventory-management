import React from "react";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, RefreshCw, Trash2, Tag, Layers } from "lucide-react";

export const VehicleCard = ({ vehicle, viewMode = "grid", onPurchase, onRestock, onDelete }) => {
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

  if (viewMode === "list") {
    return (
      <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-200 dark:border-slate-700/50 hover:border-blue-400 dark:hover:border-slate-500/40 transition-all duration-200 shadow-md group">
        {/* Left: Make, Model & Category */}
        <div className="flex items-center space-x-4 min-w-[220px]">
          <div className="p-3 bg-blue-50 border border-blue-100 text-[#2563eb] dark:bg-slate-800/80 dark:border-slate-700/80 dark:text-blue-400 rounded-xl transition-colors">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#2563eb] dark:group-hover:text-blue-300 transition-colors">
              {make} {model}
            </h4>
            <span className="inline-block mt-0.5 text-xs text-[#2563eb] dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/30">
              {category}
            </span>
          </div>
        </div>

        {/* Middle: Price & Stock */}
        <div className="flex items-center space-x-6 min-w-[180px]">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Price</p>
            <p className="text-lg font-black text-[#16a34a] dark:text-emerald-400">{formattedPrice}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Stock Status</p>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-0.5 ${
                quantity > 0
                  ? "bg-green-100 text-green-800 border border-green-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                  : "bg-red-100 text-red-800 border border-red-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
              }`}
            >
              {quantity > 0 ? `${quantity} Units` : "Out of Stock"}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Purchase Button (Success Green #16a34a) */}
          <button
            onClick={() => onPurchase(vehicle)}
            disabled={quantity <= 0}
            className="flex-1 md:flex-initial px-4 py-2 bg-[#16a34a] hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-md shadow-green-900/10 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{quantity > 0 ? "Purchase" : "Out of Stock"}</span>
          </button>

          {role === "ADMIN" && (
            <>
              <button
                onClick={() => onRestock(vehicle)}
                className="px-3 py-2 bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-300 dark:border-amber-500/30 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
                title="Restock Inventory"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Restock</span>
              </button>
              {/* Delete Button (Danger Red #ef4444) */}
              <button
                onClick={() => onDelete(id)}
                className="px-3 py-2 bg-[#ef4444] hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all shadow-xs"
                title="Delete Vehicle"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Delete</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Default Grid View with rich glass card styling & micro-animations
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-gray-200 dark:border-slate-700/50 hover:border-blue-400 dark:hover:border-slate-500/40 transition-all duration-300 shadow-lg hover:shadow-xl group hover:-translate-y-1 bg-white dark:bg-slate-900/60">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-[#2563eb] dark:group-hover:text-blue-300 transition-colors">
            {make} {model}
          </h4>
          <span className="flex items-center space-x-1 bg-blue-50 text-[#2563eb] border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-bold">
            <Tag className="w-3 h-3" />
            <span>{category}</span>
          </span>
        </div>

        <div className="mt-3 mb-4">
          <p className="text-2xl font-black text-[#16a34a] dark:text-emerald-400">
            {formattedPrice}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Stock Available:</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                quantity > 0
                  ? "bg-green-100 text-green-800 border border-green-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                  : "bg-red-100 text-red-800 border border-red-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
              }`}
            >
              {quantity > 0 ? `${quantity} Units` : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-slate-700/50">
        {/* Purchase Button (Success Green #16a34a) */}
        <button
          onClick={() => onPurchase(vehicle)}
          disabled={quantity <= 0}
          className="w-full py-2.5 bg-[#16a34a] hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md shadow-green-950/10 flex items-center justify-center space-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{quantity > 0 ? "Purchase Vehicle" : "Out of Stock"}</span>
        </button>

        {role === "ADMIN" && (
          <div className="flex space-x-2 pt-1">
            <button
              onClick={() => onRestock(vehicle)}
              className="flex-1 py-1.5 bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-300 dark:border-amber-500/30 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restock</span>
            </button>
            {/* Delete Button (Danger Red #ef4444) */}
            <button
              onClick={() => onDelete(id)}
              className="flex-1 py-1.5 bg-[#ef4444] hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all shadow-xs"
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
