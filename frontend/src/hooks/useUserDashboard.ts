import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { socket } from '../lib/socket';
import { useUserStore } from '../store/useUserStore';
import type { ActiveVehicleResponse } from '../types/types';

export function useUserDashboard(showError: (msg: string) => void) {
  const queryClient = useQueryClient();

  const {
    selectedVehicleId,
    searchQuery,
    typeFilter,
    pathHistories,
    setSelectedVehicleId,
    setSearchQuery,
    setTypeFilter,
    setPathHistories,
  } = useUserStore();

  const {
    data: activeVehicles = [],
    isLoading: vehiclesLoading,
    refetch,
    error,
  } = useQuery<ActiveVehicleResponse[]>({
    queryKey: ['activeVehicles'],
    queryFn: async () => {
      const res = await api.getActiveVehicles();
      return res.vehicles;
    },
    enabled: true,
  });

  // Handle query fetching errors
  useEffect(() => {
    if (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Error fetching active tracking vehicles';
      showError(msg);
    }
  }, [error, showError]);

  // Synchronize pathHistories when activeVehicles changes
  useEffect(() => {
    if (activeVehicles.length > 0) {
      setPathHistories((prev) => {
        const next = { ...prev };
        activeVehicles.forEach((v: ActiveVehicleResponse) => {
          const coords: [number, number] = [v.lat, v.lng];
          if (!next[v.vehicle_id]) {
            next[v.vehicle_id] = [coords];
          } else {
            const currentHistory = next[v.vehicle_id];
            const last = currentHistory[currentHistory.length - 1];
            if (!last || last[0] !== v.lat || last[1] !== v.lng) {
              next[v.vehicle_id] = [...currentHistory, coords].slice(-15);
            }
          }
        });

        const activeIds = new Set(
          activeVehicles.map((v: ActiveVehicleResponse) => v.vehicle_id),
        );
        Object.keys(next).forEach((id) => {
          if (!activeIds.has(id)) {
            delete next[id];
          }
        });
        return next;
      });
    }
  }, [activeVehicles, setPathHistories]);

  // Listen for Socket.io active vehicles events
  useEffect(() => {
    const handleActiveVehicles = (vehicles: ActiveVehicleResponse[]) => {
      queryClient.setQueryData(['activeVehicles'], vehicles);
    };

    socket.on('activeVehicles', handleActiveVehicles);

    return () => {
      socket.off('activeVehicles', handleActiveVehicles);
    };
  }, [queryClient]);

  const fetchActiveVehicles = useCallback(
    async (silent = false) => {
      // Silent parameter kept to match previous signature compatibility
      if (silent) {
        void refetch();
      } else {
        await refetch();
      }
    },
    [refetch],
  );

  // Filtering Logic
  const filteredVehicles = activeVehicles.filter((v) => {
    const matchesSearch =
      v.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || v.vehicle_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return {
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
    setPathHistories,
  };
}
