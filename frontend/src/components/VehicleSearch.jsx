import React, { useState, useEffect, useRef } from "react";
import { Search, RotateCcw, Filter, ChevronDown, Check } from "lucide-react";

export const VehicleSearch = ({ allVehicles = [], onSearch, onClear }) => {
  const [make, setMake] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [makeHighlightIndex, setMakeHighlightIndex] = useState(0);
  const [categoryHighlightIndex, setCategoryHighlightIndex] = useState(0);

  const makeRef = useRef(null);
  const categoryRef = useRef(null);

  // Extract unique available makes and categories from inventory
  const availableMakes = Array.from(
    new Set(
      allVehicles
        .map((v) => (typeof v.make === "string" ? v.make : v[1]))
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

  // Filter suggestions based on typed input
  const filteredMakes = availableMakes.filter((m) =>
    m.toLowerCase().includes(make.toLowerCase())
  );

  const filteredCategories = availableCategories.filter((c) =>
    c.toLowerCase().includes(category.toLowerCase())
  );

  // Live filter trigger whenever input changes
  const handleInputChange = (newMake, newCategory, newMaxPrice) => {
    onSearch({
      make: newMake,
      category: newCategory,
      maxPrice: newMaxPrice,
    });
  };

  const handleMakeChange = (val) => {
    setMake(val);
    setShowMakeDropdown(true);
    setMakeHighlightIndex(0);
    handleInputChange(val, category, maxPrice);
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    setShowCategoryDropdown(true);
    setCategoryHighlightIndex(0);
    handleInputChange(make, val, maxPrice);
  };

  const handleMaxPriceChange = (val) => {
    setMaxPrice(val);
    handleInputChange(make, category, val);
  };

  const handleSelectMake = (selectedMake) => {
    setMake(selectedMake);
    setShowMakeDropdown(false);
    handleInputChange(selectedMake, category, maxPrice);
  };

  const handleSelectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryDropdown(false);
    handleInputChange(make, selectedCategory, maxPrice);
  };

  // Keyboard navigation for Make input
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
      const targetIndex = makeHighlightIndex >= 0 && makeHighlightIndex < filteredMakes.length ? makeHighlightIndex : 0;
      handleSelectMake(filteredMakes[targetIndex]);
    } else if (e.key === "Escape") {
      setShowMakeDropdown(false);
    }
  };

  // Keyboard navigation for Category input
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
      const targetIndex = categoryHighlightIndex >= 0 && categoryHighlightIndex < filteredCategories.length ? categoryHighlightIndex : 0;
      handleSelectCategory(filteredCategories[targetIndex]);
    } else if (e.key === "Escape") {
      setShowCategoryDropdown(false);
    }
  };

  const handleClearFilters = () => {
    setMake("");
    setCategory("");
    setMaxPrice("");
    setShowMakeDropdown(false);
    setShowCategoryDropdown(false);
    onClear();
  };

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (makeRef.current && !makeRef.current.contains(event.target)) {
        setShowMakeDropdown(false);
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

  return (
    <div id="search-panel" className="glass-panel bg-white dark:bg-slate-900/75 p-5 rounded-2xl mb-8 shadow-md border border-gray-200 dark:border-slate-700/60 relative z-20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#2563eb] dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
            Live Search & Filter Inventory
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">Use ↑ ↓ arrows & Enter to select</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Make Input */}
        <div className="relative" ref={makeRef}>
          <div className="relative">
            <input
              type="text"
              value={make}
              onChange={(e) => handleMakeChange(e.target.value)}
              onFocus={() => setShowMakeDropdown(true)}
              onKeyDown={handleMakeKeyDown}
              placeholder="Search Make (e.g. Toyota)"
              className="w-full p-2.5 pr-8 bg-gray-50 dark:bg-slate-900/80 border border-gray-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all"
            />
            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {showMakeDropdown && filteredMakes.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900/95 border border-gray-200 dark:border-slate-700/90 rounded-xl shadow-2xl backdrop-blur-xl max-h-52 overflow-y-auto py-1 animate-in fade-in duration-150">
              {filteredMakes.map((m, idx) => {
                const isSelected = make.toLowerCase() === m.toLowerCase();
                const isHighlighted = idx === makeHighlightIndex;

                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMake(m)}
                    onMouseEnter={() => setMakeHighlightIndex(idx)}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      isHighlighted
                        ? "bg-blue-50 text-[#2563eb] font-bold dark:bg-blue-600/40 dark:text-blue-100"
                        : isSelected
                        ? "bg-blue-100 text-[#2563eb] font-bold dark:bg-blue-600/20 dark:text-blue-300"
                        : "text-slate-700 dark:text-slate-300 font-medium hover:bg-gray-100 dark:hover:bg-blue-600/20"
                    }`}
                  >
                    <span>{m}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#2563eb] dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Input */}
        <div className="relative" ref={categoryRef}>
          <div className="relative">
            <input
              type="text"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              onFocus={() => setShowCategoryDropdown(true)}
              onKeyDown={handleCategoryKeyDown}
              placeholder="Search Category (e.g. SUV)"
              className="w-full p-2.5 pr-8 bg-gray-50 dark:bg-slate-900/80 border border-gray-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all"
            />
            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {showCategoryDropdown && filteredCategories.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900/95 border border-gray-200 dark:border-slate-700/90 rounded-xl shadow-2xl backdrop-blur-xl max-h-52 overflow-y-auto py-1 animate-in fade-in duration-150">
              {filteredCategories.map((c, idx) => {
                const isSelected = category.toLowerCase() === c.toLowerCase();
                const isHighlighted = idx === categoryHighlightIndex;

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectCategory(c)}
                    onMouseEnter={() => setCategoryHighlightIndex(idx)}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      isHighlighted
                        ? "bg-blue-50 text-[#2563eb] font-bold dark:bg-blue-600/40 dark:text-blue-100"
                        : isSelected
                        ? "bg-blue-100 text-[#2563eb] font-bold dark:bg-blue-600/20 dark:text-blue-300"
                        : "text-slate-700 dark:text-slate-300 font-medium hover:bg-gray-100 dark:hover:bg-blue-600/20"
                    }`}
                  >
                    <span>{c}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#2563eb] dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Max Price Input */}
        <div>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            placeholder="Max Price ($)"
            className="w-full p-2.5 bg-gray-50 dark:bg-slate-900/80 border border-gray-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all"
          />
        </div>

        {/* Action Controls */}
        <div className="flex space-x-2">
          {/* Primary Action Button (#2563eb) */}
          <button
            type="button"
            onClick={() => handleInputChange(make, category, maxPrice)}
            className="flex-1 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-900/10 flex items-center justify-center space-x-1.5 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl text-xs font-semibold border border-gray-300 dark:border-slate-700 transition-all flex items-center space-x-1"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
