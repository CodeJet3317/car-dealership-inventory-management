import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from "../api/client";
import { Wrench, Plus, CheckCircle2, ChevronDown, Check } from "lucide-react";

export const AddVehicleForm = ({ allVehicles = [], onVehicleAdded }) => {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Dropdown visibility states
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Highlight index states for keyboard navigation
  const [makeHighlightIndex, setMakeHighlightIndex] = useState(0);
  const [modelHighlightIndex, setModelHighlightIndex] = useState(0);
  const [categoryHighlightIndex, setCategoryHighlightIndex] = useState(0);

  const makeRef = useRef(null);
  const modelRef = useRef(null);
  const categoryRef = useRef(null);

  // Extract unique available values from inventory
  const availableMakes = Array.from(
    new Set(
      allVehicles
        .map((v) => (typeof v.make === "string" ? v.make : v[1]))
        .filter(Boolean)
    )
  ).sort();

  const availableModels = Array.from(
    new Set(
      allVehicles
        .map((v) => (typeof v.model === "string" ? v.model : v[2]))
        .filter(Boolean)
    )
  ).sort();

  const availableCategories = Array.from(
    new Set(
      allVehicles
        .map((v) => (typeof v.category === "string" ? v.category : v[3]))
        .filter(Boolean)
    )
  ).sort();

  // Filter suggestion lists
  const filteredMakes = availableMakes.filter((m) =>
    m.toLowerCase().includes(make.toLowerCase())
  );

  const filteredModels = availableModels.filter((m) =>
    m.toLowerCase().includes(model.toLowerCase())
  );

  const filteredCategories = availableCategories.filter((c) =>
    c.toLowerCase().includes(category.toLowerCase())
  );

  // Keyboard navigation handlers
  const handleMakeKeyDown = (e) => {
    if (!showMakeDropdown || filteredMakes.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMakeHighlightIndex((prev) => (prev + 1) % filteredMakes.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMakeHighlightIndex((prev) => (prev - 1 + filteredMakes.length) % filteredMakes.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = makeHighlightIndex >= 0 && makeHighlightIndex < filteredMakes.length ? filteredMakes[makeHighlightIndex] : filteredMakes[0];
      setMake(target);
      setShowMakeDropdown(false);
    } else if (e.key === "Escape") {
      setShowMakeDropdown(false);
    }
  };

  const handleModelKeyDown = (e) => {
    if (!showModelDropdown || filteredModels.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setModelHighlightIndex((prev) => (prev + 1) % filteredModels.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setModelHighlightIndex((prev) => (prev - 1 + filteredModels.length) % filteredModels.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = modelHighlightIndex >= 0 && modelHighlightIndex < filteredModels.length ? filteredModels[modelHighlightIndex] : filteredModels[0];
      setModel(target);
      setShowModelDropdown(false);
    } else if (e.key === "Escape") {
      setShowModelDropdown(false);
    }
  };

  const handleCategoryKeyDown = (e) => {
    if (!showCategoryDropdown || filteredCategories.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCategoryHighlightIndex((prev) => (prev + 1) % filteredCategories.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCategoryHighlightIndex((prev) => (prev - 1 + filteredCategories.length) % filteredCategories.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = categoryHighlightIndex >= 0 && categoryHighlightIndex < filteredCategories.length ? filteredCategories[categoryHighlightIndex] : filteredCategories[0];
      setCategory(target);
      setShowCategoryDropdown(false);
    } else if (e.key === "Escape") {
      setShowCategoryDropdown(false);
    }
  };

  // Click outside listener to dismiss dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (makeRef.current && !makeRef.current.contains(event.target)) {
        setShowMakeDropdown(false);
      }
      if (modelRef.current && !modelRef.current.contains(event.target)) {
        setShowModelDropdown(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    <div className="glass-panel bg-amber-50/80 dark:bg-slate-900/90 p-6 rounded-2xl mb-8 border border-amber-200 dark:border-amber-500/20 shadow-xl relative z-40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 rounded-xl dark:border-amber-500/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">Admin Control: Add New Vehicle</h3>
            <p className="text-xs text-amber-700 dark:text-amber-400/70">Expand current inventory stock with auto-suggestions</p>
          </div>
        </div>
        <span className="text-[11px] text-amber-700 dark:text-amber-400/60 italic">Use ↑ ↓ & Enter for quick completion</span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#16a34a] dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
        {/* Make Auto-suggest Field */}
        <div className="relative" ref={makeRef}>
          <div className="relative">
            <input
              type="text"
              value={make}
              onChange={(e) => {
                setMake(e.target.value);
                setShowMakeDropdown(true);
                setMakeHighlightIndex(0);
              }}
              onFocus={() => setShowMakeDropdown(true)}
              onKeyDown={handleMakeKeyDown}
              placeholder="Make (e.g. Toyota)"
              required
              className="w-full p-2.5 pr-7 bg-white dark:bg-slate-900/60 border border-gray-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 absolute right-2 top-3 pointer-events-none" />
          </div>

          {showMakeDropdown && filteredMakes.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900/95 border border-amber-300 dark:border-amber-500/30 rounded-xl shadow-2xl backdrop-blur-xl max-h-48 overflow-y-auto py-1 animate-in fade-in duration-150">
              {filteredMakes.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMake(m);
                    setShowMakeDropdown(false);
                  }}
                  onMouseEnter={() => setMakeHighlightIndex(idx)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    idx === makeHighlightIndex
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200 font-bold"
                      : make.toLowerCase() === m.toLowerCase()
                      ? "bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-semibold"
                      : "text-slate-700 dark:text-slate-300 font-medium hover:bg-amber-50 dark:hover:bg-amber-500/20"
                  }`}
                >
                  <span>{m}</span>
                  {make.toLowerCase() === m.toLowerCase() && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Model Auto-suggest Field */}
        <div className="relative" ref={modelRef}>
          <div className="relative">
            <input
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setShowModelDropdown(true);
                setModelHighlightIndex(0);
              }}
              onFocus={() => setShowModelDropdown(true)}
              onKeyDown={handleModelKeyDown}
              placeholder="Model (e.g. Camry)"
              required
              className="w-full p-2.5 pr-7 bg-white dark:bg-slate-900/60 border border-gray-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 absolute right-2 top-3 pointer-events-none" />
          </div>

          {showModelDropdown && filteredModels.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900/95 border border-amber-300 dark:border-amber-500/30 rounded-xl shadow-2xl backdrop-blur-xl max-h-48 overflow-y-auto py-1 animate-in fade-in duration-150">
              {filteredModels.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setModel(m);
                    setShowModelDropdown(false);
                  }}
                  onMouseEnter={() => setModelHighlightIndex(idx)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    idx === modelHighlightIndex
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200 font-bold"
                      : model.toLowerCase() === m.toLowerCase()
                      ? "bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-semibold"
                      : "text-slate-700 dark:text-slate-300 font-medium hover:bg-amber-50 dark:hover:bg-amber-500/20"
                  }`}
                >
                  <span>{m}</span>
                  {model.toLowerCase() === m.toLowerCase() && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Auto-suggest Field */}
        <div className="relative" ref={categoryRef}>
          <div className="relative">
            <input
              type="text"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setShowCategoryDropdown(true);
                setCategoryHighlightIndex(0);
              }}
              onFocus={() => setShowCategoryDropdown(true)}
              onKeyDown={handleCategoryKeyDown}
              placeholder="Category (Sedan)"
              required
              className="w-full p-2.5 pr-7 bg-white dark:bg-slate-900/60 border border-gray-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 absolute right-2 top-3 pointer-events-none" />
          </div>

          {showCategoryDropdown && filteredCategories.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900/95 border border-amber-300 dark:border-amber-500/30 rounded-xl shadow-2xl backdrop-blur-xl max-h-48 overflow-y-auto py-1 animate-in fade-in duration-150">
              {filteredCategories.map((c, idx) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCategory(c);
                    setShowCategoryDropdown(false);
                  }}
                  onMouseEnter={() => setCategoryHighlightIndex(idx)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    idx === categoryHighlightIndex
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200 font-bold"
                      : category.toLowerCase() === c.toLowerCase()
                      ? "bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-semibold"
                      : "text-slate-700 dark:text-slate-300 font-medium hover:bg-amber-50 dark:hover:bg-amber-500/20"
                  }`}
                >
                  <span>{c}</span>
                  {category.toLowerCase() === c.toLowerCase() && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Field */}
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price ($)"
          required
          className="p-2.5 bg-white dark:bg-slate-900/60 border border-gray-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />

        {/* Quantity Field */}
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          required
          className="p-2.5 bg-white dark:bg-slate-900/60 border border-gray-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />

        {/* Golden Amber Submit Button (#d97706) */}
        <button
          type="submit"
          disabled={loading}
          className="col-span-1 sm:col-span-2 md:col-span-1 py-2.5 bg-[#d97706] hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-900/10 flex items-center justify-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{loading ? "Adding..." : "Add Vehicle"}</span>
        </button>
      </form>
    </div>
  );
};
