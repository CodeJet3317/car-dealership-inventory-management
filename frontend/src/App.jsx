import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import { apiRequest } from "./api/client";
import { Navbar } from "./components/Navbar";
import { AuthForms } from "./components/AuthForms";
import { AddVehicleForm } from "./components/AddVehicleForm";
import { VehicleSearch } from "./components/VehicleSearch";
import { VehicleGrid } from "./components/VehicleGrid";
import { Pagination } from "./components/Pagination";
import { PurchaseModal } from "./components/PurchaseModal";
import { RestockModal } from "./components/RestockModal";
import { ResetCredentialsModal } from "./components/ResetCredentialsModal";
import { startUserTour } from "./utils/tour";
import { CarFront, LayoutGrid, List } from "lucide-react";

export function AppContent() {
  const { isAuthenticated, role, email, mustReset } = useAuth();

  const [allVehicles, setAllVehicles] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState(localStorage.getItem("viewMode") || "grid");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedPurchaseVehicle, setSelectedPurchaseVehicle] = useState(null);
  const [selectedRestockVehicle, setSelectedRestockVehicle] = useState(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetForced, setIsResetForced] = useState(false);

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  const fetchVehicles = useCallback(async (searchParams = null) => {
    setLoading(true);
    setError("");

    try {
      let endpoint = "/vehicles";

      if (searchParams) {
        const { make, category, maxPrice } = searchParams;
        const queryParams = new URLSearchParams();
        if (make) queryParams.append("make", make);
        if (category) queryParams.append("category", category);
        if (maxPrice) queryParams.append("max_price", maxPrice);

        const queryString = queryParams.toString();
        if (queryString) {
          endpoint = `/vehicles/search?${queryString}`;
        }
      }

      const data = await apiRequest(endpoint);
      setVehicles(data);
      setCurrentPage(1);

      // If initial fetch (no searchParams), also populate master inventory list for auto-suggest
      if (!searchParams) {
        setAllVehicles(data);
      }
    } catch (err) {
      setError(err.message || "Failed to load vehicle inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (isAuthenticated && mustReset) {
      setIsResetForced(true);
      setIsResetModalOpen(true);
    } else if (isAuthenticated && !mustReset && !localStorage.getItem("has_completed_tour")) {
      const timer = setTimeout(() => {
        startUserTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, mustReset]);

  const handleLoginComplete = (shouldForceReset) => {
    fetchVehicles();
    if (shouldForceReset) {
      setIsResetForced(true);
      setIsResetModalOpen(true);
    } else if (!localStorage.getItem("has_completed_tour")) {
      setTimeout(() => {
        startUserTour();
      }, 500);
    }
  };

  const handleOpenResetModal = (forced = false) => {
    setIsResetForced(forced);
    setIsResetModalOpen(true);
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle from inventory?")) {
      return;
    }

    try {
      await apiRequest(`/vehicles/${id}`, "DELETE", null, true);
      fetchVehicles();
    } catch (err) {
      alert("Failed to delete vehicle: " + err.message);
    }
  };

  // Pagination slicing logic
  const isAll = pageSize === "all";
  const numPageSize = isAll ? vehicles.length || 1 : Number(pageSize);
  const totalPages = isAll ? 1 : Math.ceil(vehicles.length / numPageSize) || 1;
  const startIndex = isAll ? 0 : (currentPage - 1) * numPageSize;
  const paginatedVehicles = isAll ? vehicles : vehicles.slice(startIndex, startIndex + numPageSize);

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-16 transition-colors selection:bg-[#2563eb] selection:text-white">
      <Navbar onOpenResetModal={() => handleOpenResetModal(false)} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {!isAuthenticated ? (
          <AuthForms onLoginComplete={handleLoginComplete} />
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {role === "ADMIN" && (
              <AddVehicleForm allVehicles={allVehicles} onVehicleAdded={() => fetchVehicles()} />
            )}

            <VehicleSearch
              allVehicles={allVehicles}
              onSearch={(params) => fetchVehicles(params)}
              onClear={() => fetchVehicles()}
            />

            <div>
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div className="flex items-center space-x-2">
                  <CarFront className="w-5 h-5 text-[#2563eb] dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Available Vehicles</h3>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-xs">
                    Total: {vehicles.length} Models
                  </span>

                  <div id="view-toggle" className="flex bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 p-0.5 rounded-lg shadow-xs">
                    <button
                      onClick={() => setViewMode("grid")}
                      title="Grid View"
                      className={`p-1.5 rounded-md text-xs flex items-center space-x-1 font-semibold transition-all ${
                        viewMode === "grid"
                          ? "bg-[#2563eb] text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      title="List View"
                      className={`p-1.5 rounded-md text-xs flex items-center space-x-1 font-semibold transition-all ${
                        viewMode === "list"
                          ? "bg-[#2563eb] text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden sm:inline">List</span>
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="glass-panel bg-white p-12 rounded-2xl text-center border border-gray-200 shadow-sm">
                  <div className="w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Loading dealership inventory...</p>
                </div>
              ) : error ? (
                <div className="glass-panel bg-white p-6 rounded-2xl border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm font-medium">
                  {error}
                </div>
              ) : (
                <>
                  <VehicleGrid
                    vehicles={paginatedVehicles}
                    viewMode={viewMode}
                    onPurchase={(v) => setSelectedPurchaseVehicle(v)}
                    onRestock={(v) => setSelectedRestockVehicle(v)}
                    onDelete={handleDeleteVehicle}
                  />

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={vehicles.length}
                    onPageChange={(page) => setCurrentPage(page)}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <PurchaseModal
        vehicle={selectedPurchaseVehicle}
        onClose={() => setSelectedPurchaseVehicle(null)}
        onSuccess={() => {
          setSelectedPurchaseVehicle(null);
          fetchVehicles();
        }}
      />

      <RestockModal
        vehicle={selectedRestockVehicle}
        onClose={() => setSelectedRestockVehicle(null)}
        onSuccess={() => {
          setSelectedRestockVehicle(null);
          fetchVehicles();
        }}
      />

      <ResetCredentialsModal
        isOpen={isResetModalOpen}
        isForced={isResetForced}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={() => {
          setIsResetModalOpen(false);
          fetchVehicles();
        }}
      />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
