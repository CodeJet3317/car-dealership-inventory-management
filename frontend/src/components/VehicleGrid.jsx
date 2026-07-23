import React from "react";
import { VehicleCard } from "./VehicleCard";
import { CarFront } from "lucide-react";

export const VehicleGrid = ({ vehicles, viewMode = "grid", onPurchase, onRestock, onDelete }) => {
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center border border-slate-700/50">
        <CarFront className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-300">No Vehicles Found</h3>
        <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add new inventory.</p>
      </div>
    );
  }

  return (
    <div
      id="vehicle-grid"
      className={
        viewMode === "list"
          ? "flex flex-col space-y-3"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      }
    >
      {vehicles.map((v) => (
        <VehicleCard
          key={v.id || v[0]}
          vehicle={v}
          viewMode={viewMode}
          onPurchase={onPurchase}
          onRestock={onRestock}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
