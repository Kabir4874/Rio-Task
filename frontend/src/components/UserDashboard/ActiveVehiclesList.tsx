import { RefreshCw, Search, Filter, User } from 'lucide-react';
import type { ActiveVehicleResponse } from '../../types/types';

interface ActiveVehiclesListProps {
  filteredVehicles: ActiveVehicleResponse[];
  activeVehicles: ActiveVehicleResponse[];
  vehiclesLoading: boolean;
  selectedVehicleId: string | null;
  searchQuery: string;
  typeFilter: string;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (filter: string) => void;
  handleSelectVehicle: (v: ActiveVehicleResponse) => void;
  fetchActiveVehicles: () => Promise<void>;
}

export function ActiveVehiclesList({
  filteredVehicles,
  activeVehicles,
  vehiclesLoading,
  selectedVehicleId,
  searchQuery,
  typeFilter,
  setSearchQuery,
  setTypeFilter,
  handleSelectVehicle,
  fetchActiveVehicles,
}: ActiveVehiclesListProps) {
  return (
    <div className="lg:col-span-1 flex flex-col bg-white border border-slate-200 rounded-2xl p-4 shadow-sm overflow-hidden max-h-[700px]">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-black text-slate-800">Active Vehicles</h3>
          <p className="text-xs text-slate-500">
            {filteredVehicles.length} of {activeVehicles.length} tracking
          </p>
        </div>
        <button
          onClick={() => void fetchActiveVehicles()}
          disabled={vehiclesLoading}
          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors border border-slate-200"
        >
          <RefreshCw
            className={`w-4 h-4 ${vehiclesLoading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Filters & Search */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search driver or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 text-slate-900"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none focus:ring-0 text-slate-600 w-full py-1 pr-2 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="CAR">Car</option>
            <option value="MOTORCYCLE">Motorcycle</option>
            <option value="RICKSHAW">Rickshaw</option>
            <option value="CNG">CNG</option>
            <option value="DELIVERY">Delivery</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {vehiclesLoading && activeVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-2 text-teal-500" />
            <p className="text-xs">Loading active GPS nodes...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
              No active vehicles match
            </p>
          </div>
        ) : (
          filteredVehicles.map((v) => {
            const isSelected = selectedVehicleId === v.vehicle_id;
            return (
              <div
                key={v.vehicle_id}
                onClick={() => handleSelectVehicle(v)}
                className={`p-3 rounded-xl cursor-pointer border transition-all duration-300 ${
                  isSelected
                    ? 'bg-teal-50/75 border-teal-500/60 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white ${
                        v.vehicle_type === 'CAR'
                          ? 'bg-blue-600'
                          : v.vehicle_type === 'MOTORCYCLE'
                            ? 'bg-purple-600'
                            : v.vehicle_type === 'RICKSHAW'
                              ? 'bg-amber-500'
                              : v.vehicle_type === 'CNG'
                                ? 'bg-emerald-600'
                                : 'bg-rose-600'
                      }`}
                    >
                      {v.vehicle_type_label}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 mt-2 text-sm leading-snug">
                  {v.details}
                </h4>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>{v.driver_name}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-80">
                    {new Date(v.last_updated).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
