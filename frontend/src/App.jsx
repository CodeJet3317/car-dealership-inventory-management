import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import { apiRequest } from "./api/client";
import { Navbar } from "./components/Navbar";
import { AuthForms } from "./components/AuthForms";
import { AddVehicleForm } from "./components/AddVehicleForm";
import { VehicleSearch } from "./components/VehicleSearch";
import { VehicleGrid } from "./components/VehicleGrid";
import { PurchaseModal } from "./components/PurchaseModal";
import { RestockModal } from "./components/RestockModal";
import { ResetCredentialsModal } from "./components/ResetCredentialsModal";
import { CarFront, ShieldAlert } from "lucide-react";

export function AppContent() {
  const { isAuthenticated, role, email, mustReset } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedPurchaseVehicle, setSelectedPurchaseVehicle] = useState(null);
  const [selectedRestockVehicle, setSelectedRestockVehicle] = useState(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetForced, setIsResetForced] = useState(false);

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
    }
  }, [isAuthenticated, mustReset]);

  const handleLoginComplete = (shouldForceReset) => {
    fetchVehicles();
    if (shouldForceReset) {
      setIsResetForced(true);
      setIsResetModalOpen(true);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 selection:bg-blue-500 selection:text-white">
      <Navbar onOpenResetModal={() => handleOpenResetModal(false)} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {!isAuthenticated ? (
          <AuthForms onLoginComplete={handleLoginComplete} />
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {role === "ADMIN" && <AddVehicleForm onVehicleAdded={() => fetchVehicles()} />}

            <VehicleSearch
              onSearch={(params) => fetchVehicles(params)}
              onClear={() => fetchVehicles()}
            />

            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <CarFront className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Available Vehicles</h3>
                </div>
                <span className="text-xs text-slate-400 font-semibold bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  Total: {vehicles.length} Models
                </span>
              </div>

              {loading ? (
                <div className="glass-panel p-12 rounded-2xl text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-slate-400">Loading dealership inventory...</p>
                </div>
              ) : error ? (
                <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 text-rose-300 text-sm font-medium">
                  {error}
                </div>
              ) : (
                <VehicleGrid
                  vehicles={vehicles}
                  onPurchase={(v) => setSelectedPurchaseVehicle(v)}
                  onRestock={(v) => setSelectedRestockVehicle(v)}
                  onDelete={handleDeleteVehicle}
                />
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
