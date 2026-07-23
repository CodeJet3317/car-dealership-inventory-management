import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems === 0) return null;

  const isAll = pageSize === "all";
  const numPageSize = isAll ? totalItems : Number(pageSize);

  const startItem = isAll ? 1 : (currentPage - 1) * numPageSize + 1;
  const endItem = isAll ? totalItems : Math.min(currentPage * numPageSize, totalItems);

  // Generate array of page numbers to render
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div
      id="pagination-panel"
      className="glass-panel bg-white dark:bg-slate-900/75 p-4 rounded-2xl mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-200 dark:border-slate-700/60 shadow-xl"
    >
      {/* Item Range Info */}
      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
        Showing <strong className="text-slate-900 dark:text-white font-bold">{startItem}</strong>–
        <strong className="text-slate-900 dark:text-white font-bold">{endItem}</strong> of{" "}
        <strong className="text-slate-900 dark:text-white font-bold">{totalItems}</strong> vehicles
      </div>

      {/* Controls Container */}
      <div className="flex flex-wrap items-center space-x-4">
        {/* Page Size Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Per Page:</label>
          <select
            value={pageSize}
            onChange={(e) =>
              onPageSizeChange(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#2563eb] font-bold cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Page Buttons */}
        {!isAll && totalPages > 1 && (
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-gray-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
                    ? "bg-[#2563eb] text-white shadow-md shadow-blue-900/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-gray-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-gray-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
