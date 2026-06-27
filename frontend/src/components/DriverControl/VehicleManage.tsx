import {
  PlusCircle,
  Car,
  Edit,
  Play,
  Square,
  CheckCircle,
  CarFront,
  ChevronDown,
} from 'lucide-react';
import type { Vehicle } from '../../types/types';

interface VehicleManageProps {
  driverVehicles: Vehicle[];
  driverVehicle: Vehicle | null; // currently selected vehicle
  setDriverVehicle: (v: Vehicle | null) => void;
  isEditingVehicle: boolean;
  setIsEditingVehicle: (editing: boolean) => void;
  editingVehicleId: string | null;
  setEditingVehicleId: (id: string | null) => void;
  vehicleType: string;
  setVehicleType: (type: string) => void;
  vehicleDetails: string;
  setVehicleDetails: (details: string) => void;
  vehicleLoading: boolean;
  handleAddVehicle: (e: React.FormEvent) => void;
  handleUpdateVehicle: (e: React.FormEvent) => void;
  isTrackingActive: boolean;
  handleToggleTracking: (activeState: boolean) => Promise<void>;
}

export function VehicleManage({
  driverVehicles,
  driverVehicle,
  setDriverVehicle,
  isEditingVehicle,
  setIsEditingVehicle,
  editingVehicleId,
  setEditingVehicleId,
  vehicleType,
  setVehicleType,
  vehicleDetails,
  setVehicleDetails,
  vehicleLoading,
  handleAddVehicle,
  handleUpdateVehicle,
  isTrackingActive,
  handleToggleTracking,
}: VehicleManageProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Column 1: Manage Vehicles Form (Add / Edit) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm h-fit">
        {isEditingVehicle && editingVehicleId ? (
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-teal-600">
                <Edit className="w-5 h-5" />
                <h4 className="font-black text-slate-800 text-sm md:text-base">
                  Edit Vehicle Info
                </h4>
              </div>
              <button
                onClick={() => {
                  setIsEditingVehicle(false);
                  setEditingVehicleId(null);
                  setVehicleDetails('');
                }}
                className="text-xs text-slate-400 hover:text-slate-900 font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleUpdateVehicle} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Vehicle Type
                </label>
                <div className="relative">
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-slate-700 cursor-pointer appearance-none pr-10"
                  >
                    <option value="CAR">Car</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="RICKSHAW">Rickshaw</option>
                    <option value="CNG">CNG</option>
                    <option value="DELIVERY">Delivery Vehicle</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Details (Reg No / Info)
                </label>
                <input
                  type="text"
                  value={vehicleDetails}
                  onChange={(e) => setVehicleDetails(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-slate-900"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={vehicleLoading}
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 hover:-translate-y-0.5 hover:shadow-md text-xs active:translate-y-0"
              >
                {vehicleLoading ? 'Updating...' : 'Update Details'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-teal-600 mb-2">
              <PlusCircle className="w-5 h-5" />
              <h4 className="font-black text-slate-800 text-sm md:text-base">
                Register New Vehicle
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Add details of another vehicle to your driver profile.
            </p>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Vehicle Type
                </label>
                <div className="relative">
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-slate-700 cursor-pointer appearance-none pr-10"
                  >
                    <option value="CAR">Car</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="RICKSHAW">Rickshaw</option>
                    <option value="CNG">CNG</option>
                    <option value="DELIVERY">Delivery Vehicle</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Details (Reg No / Info)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka Metro CNG-12-3456"
                  value={vehicleDetails}
                  onChange={(e) => setVehicleDetails(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={vehicleLoading}
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 hover:-translate-y-0.5 hover:shadow-md text-xs active:translate-y-0"
              >
                {vehicleLoading ? 'Saving...' : 'Add Vehicle'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Column 2: Vehicle Selection List & Active Control */}
      <div className="space-y-6">
        {/* Vehicles list */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-1.5 mb-4 border-b border-slate-100 pb-2">
            <CarFront className="w-5 h-5 text-teal-600" />
            <h4 className="font-black text-slate-800 text-sm md:text-base">
              My Vehicles ({driverVehicles.length})
            </h4>
          </div>

          {driverVehicles.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">
              No vehicles registered yet. Use the register form to add one.
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {driverVehicles.map((vehicle) => {
                const isSelected =
                  driverVehicle?.vehicle_id === vehicle.vehicle_id;
                return (
                  <div
                    key={vehicle.vehicle_id}
                    onClick={() => {
                      if (!isTrackingActive) {
                        setDriverVehicle(vehicle);
                      }
                    }}
                    className={`flex items-center justify-between p-3 border rounded-xl transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/[0.03] shadow-[0_0_12px_rgba(20,184,166,0.04)]'
                        : 'border-slate-200 hover:bg-slate-50/50 hover:border-slate-300'
                    } ${isTrackingActive && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Car
                          className={`w-5 h-5 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-800">
                            {vehicle.details}
                          </span>
                          <span className="text-[9px] font-bold bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded text-slate-600 uppercase">
                            {vehicle.vehicle_type_label}
                          </span>
                        </div>
                        {vehicle.is_tracking && (
                          <span className="inline-flex items-center gap-1.5 mt-1 text-[9px] font-bold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            Live Tracking Active
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-teal-600 animate-in fade-in zoom-in duration-200" />
                      )}
                      <button
                        disabled={isTrackingActive}
                        onClick={() => {
                          setEditingVehicleId(vehicle.vehicle_id);
                          setVehicleType(vehicle.vehicle_type);
                          setVehicleDetails(vehicle.details);
                          setIsEditingVehicle(true);
                        }}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 rounded transition-colors disabled:opacity-50"
                        title="Edit Vehicle Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live simulation controls */}
        {driverVehicle && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              GPS Tracking Control for:{' '}
              <span className="text-slate-800 font-extrabold">
                {driverVehicle.details}
              </span>
            </h5>
            <p className="text-xs text-slate-400 mb-4">
              {isTrackingActive
                ? 'Simulation is active. Live coordinates are being updated to the server every 3 seconds.'
                : 'Select this vehicle and click the button to start the live route simulation.'}
            </p>

            <div className="pt-2">
              {!isTrackingActive ? (
                <button
                  onClick={() => void handleToggleTracking(true)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-emerald-600/10 text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-600/15 active:translate-y-0"
                >
                  <Play className="w-4.5 h-4.5 fill-current" />
                  Start Live Tracking
                </button>
              ) : (
                <button
                  onClick={() => void handleToggleTracking(false)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-rose-600/10 text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-600/15 active:translate-y-0"
                >
                  <Square className="w-4.5 h-4.5 fill-current" />
                  Stop Live Tracking
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
