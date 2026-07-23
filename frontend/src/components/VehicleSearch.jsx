import React, { useState } from "react";
import { Search, RotateCcw } from "lucide-react";

export const VehicleSearch = ({ onSearch, onClear }) => {
  const [make, setMake] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch({ make, category, maxPrice });
  };

  const handleClearFilters = () => {
    setMake("");
    setCategory("");
    setMaxPrice("");
    onClear();
  };

  return (
    <div className="glass-panel p-5 rounded-2xl mb-8 shadow-xl border border-slate-700/60">
      <div className="flex items-center space-x-2 mb-3">
        <Search className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Search & Filter Inventory</h3>
      </div>

      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <input
          type="text"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          placeholder="Make (e.g. Toyota)"
          className="p-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (e.g. Sedan)"
          className="p-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max Price ($)"
          className="p-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-900/30 flex items-center justify-center space-x-1 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
