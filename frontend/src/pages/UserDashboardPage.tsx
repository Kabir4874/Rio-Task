import { UserMap } from '../components/Map/UserMap';
import { ActiveVehiclesList } from '../components/UserDashboard/ActiveVehiclesList';
import { useUserDashboard } from '../hooks/useUserDashboard';
import type { ActiveVehicleResponse } from '../types/types';

interface UserDashboardPageProps {
  showError: (msg: string) => void;
}

export function UserDashboardPage({ showError }: UserDashboardPageProps) {
  const {
    activeVehicles,
    vehiclesLoading,
    selectedVehicleId,
    searchQuery,
    typeFilter,
    pathHistories,
    filteredVehicles,
    fetchActiveVehicles,
    setSelectedVehicleId,
    setSearchQuery,
    setTypeFilter,
  } = useUserDashboard(showError);

  const handleSelectVehicle = (v: ActiveVehicleResponse) => {
    setSelectedVehicleId(v.vehicle_id);
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-150">
      <ActiveVehiclesList
        filteredVehicles={filteredVehicles}
        activeVehicles={activeVehicles}
        vehiclesLoading={vehiclesLoading}
        selectedVehicleId={selectedVehicleId}
        searchQuery={searchQuery}
        typeFilter={typeFilter}
        setSearchQuery={setSearchQuery}
        setTypeFilter={setTypeFilter}
        handleSelectVehicle={handleSelectVehicle}
        fetchActiveVehicles={fetchActiveVehicles}
      />
      <UserMap
        activeVehicles={activeVehicles}
        selectedVehicleId={selectedVehicleId}
        pathHistories={pathHistories}
      />
    </div>
  );
}
