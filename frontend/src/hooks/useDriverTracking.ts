import { useEffect, useRef, useCallback, useState } from 'react';
import { api } from '../api';
import { socket } from '../lib/socket';
import { getDefaultStartCoords, simulateNextLocation } from '../utils/utils';
import type { Vehicle } from '../types/types';

export function useDriverTracking(
  driverVehicle: Vehicle | null,
  setDriverVehicle: (v: Vehicle | null) => void,
  setDriverVehicles: (
    vehicles: Vehicle[] | ((prev: Vehicle[]) => Vehicle[]),
  ) => void,
  showError: (msg: string) => void,
  showSuccess: (msg: string) => void,
  simCoords: { lat: number; lng: number } | null,
  setSimCoords: (coords: { lat: number; lng: number } | null) => void,
  driverPathHistory: [number, number][],
  setDriverPathHistory: React.Dispatch<
    React.SetStateAction<[number, number][]>
  >,
) {
  const isTrackingActive = !!driverVehicle?.is_tracking;
  const [trackingLoading, setTrackingLoading] = useState(false);
  const trackingIntervalRef = useRef<number | null>(null);
  const simCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const handleToggleTracking = useCallback(
    async (activeState: boolean) => {
      if (!driverVehicle) return;

      setTrackingLoading(true);
      try {
        const res = await api.updateTrackingStatus(
          driverVehicle.vehicle_id,
          activeState,
        );
        setDriverVehicle(res.vehicle);
        setDriverVehicles((vehicles) =>
          vehicles.map((vehicle) => {
            if (vehicle.vehicle_id === res.vehicle.vehicle_id) {
              return { ...vehicle, ...res.vehicle };
            }
            if (res.is_tracking && vehicle.driver_id === res.driver_id) {
              return { ...vehicle, is_tracking: false };
            }
            return vehicle;
          }),
        );

        if (res.is_tracking) {
          const currentCoords =
            simCoords || getDefaultStartCoords(driverVehicle.vehicle_type);

          setSimCoords(currentCoords);
          simCoordsRef.current = currentCoords;

          if (socket && socket.connected) {
            socket.emit('updateLocation', {
              vehicle_id: driverVehicle.vehicle_id,
              lat: currentCoords.lat,
              lng: currentCoords.lng,
            });
          } else {
            await api.updateLocation(
              driverVehicle.vehicle_id,
              currentCoords.lat,
              currentCoords.lng,
            );
          }

          if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
          }

          trackingIntervalRef.current = window.setInterval(() => {
            if (simCoordsRef.current) {
              const next = simulateNextLocation(
                simCoordsRef.current.lat,
                simCoordsRef.current.lng,
              );
              setSimCoords(next);
              simCoordsRef.current = next;

              if (socket && socket.connected) {
                socket.emit('updateLocation', {
                  vehicle_id: driverVehicle.vehicle_id,
                  lat: next.lat,
                  lng: next.lng,
                });
              } else {
                void api.updateLocation(
                  driverVehicle.vehicle_id,
                  next.lat,
                  next.lng,
                );
              }
            }
          }, 3000);

          showSuccess('Live GPS simulation started');
        } else {
          if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
          }
          showSuccess('Live GPS simulation stopped');
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Tracking update failed';
        showError(msg);
      } finally {
        setTrackingLoading(false);
      }
    },
    [
      driverVehicle,
      simCoords,
      setDriverVehicle,
      setDriverVehicles,
      showError,
      showSuccess,
      setSimCoords,
    ],
  );

  // Sync path history
  useEffect(() => {
    if (simCoords && isTrackingActive) {
      setDriverPathHistory((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last[0] !== simCoords.lat || last[1] !== simCoords.lng) {
          return [...prev, [simCoords.lat, simCoords.lng]].slice(-15) as [
            number,
            number,
          ][];
        }
        return prev;
      });
    } else if (!isTrackingActive) {
      const timer = setTimeout(() => {
        setDriverPathHistory([]);
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [simCoords, isTrackingActive, setDriverPathHistory]);

  // Auto-resume simulation if active in state/backend on mount or change
  useEffect(() => {
    if (
      driverVehicle &&
      driverVehicle.is_tracking &&
      !trackingIntervalRef.current
    ) {
      const currentCoords =
        simCoords || getDefaultStartCoords(driverVehicle.vehicle_type);

      setSimCoords(currentCoords);
      simCoordsRef.current = currentCoords;

      if (socket && socket.connected) {
        socket.emit('updateLocation', {
          vehicle_id: driverVehicle.vehicle_id,
          lat: currentCoords.lat,
          lng: currentCoords.lng,
        });
      } else {
        void api.updateLocation(
          driverVehicle.vehicle_id,
          currentCoords.lat,
          currentCoords.lng,
        );
      }

      trackingIntervalRef.current = window.setInterval(() => {
        if (simCoordsRef.current) {
          const next = simulateNextLocation(
            simCoordsRef.current.lat,
            simCoordsRef.current.lng,
          );
          setSimCoords(next);
          simCoordsRef.current = next;

          if (socket && socket.connected) {
            socket.emit('updateLocation', {
              vehicle_id: driverVehicle.vehicle_id,
              lat: next.lat,
              lng: next.lng,
            });
          } else {
            void api.updateLocation(
              driverVehicle.vehicle_id,
              next.lat,
              next.lng,
            );
          }
        }
      }, 3000);
    } else if (
      driverVehicle &&
      !driverVehicle.is_tracking &&
      trackingIntervalRef.current
    ) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    // ponytail: we explicitly omit simCoords and driverVehicle to avoid re-initializing the simulation interval on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverVehicle?.vehicle_id, driverVehicle?.is_tracking, setSimCoords]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    };
  }, []);

  return {
    isTrackingActive,
    trackingLoading,
    simCoords,
    driverPathHistory,
    setSimCoords,
    setDriverPathHistory,
    handleToggleTracking,
  };
}
