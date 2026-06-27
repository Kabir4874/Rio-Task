import { create } from 'zustand';
import { socket } from '../lib/socket';
import type { Driver, Vehicle } from '../types/types';

interface DriverState {
  driverSession: Driver | null;
  driverVehicles: Vehicle[];
  driverVehicle: Vehicle | null;
  isEditingVehicle: boolean;
  editingVehicleId: string | null;
  driverMode: 'login' | 'register';

  setDriverSession: (session: Driver | null) => void;
  setDriverVehicles: (
    vehicles: Vehicle[] | ((prev: Vehicle[]) => Vehicle[]),
  ) => void;
  setDriverVehicle: (
    vehicle: Vehicle | null | ((prev: Vehicle | null) => Vehicle | null),
  ) => void;
  setIsEditingVehicle: (isEditing: boolean) => void;
  setEditingVehicleId: (id: string | null) => void;
  setDriverMode: (mode: 'login' | 'register') => void;
  saveDriverSession: (driver: Driver, token: string) => void;
  logoutDriver: (
    isTrackingActive: boolean,
    stopTracking: () => Promise<void>,
  ) => Promise<void>;
}

export const useDriverStore = create<DriverState>((set) => ({
  driverSession: (() => {
    const saved = localStorage.getItem('rio_driver_session');
    try {
      return saved ? (JSON.parse(saved) as Driver) : null;
    } catch {
      return null;
    }
  })(),
  driverVehicles: [],
  driverVehicle: null,
  isEditingVehicle: false,
  editingVehicleId: null,
  driverMode: 'login',

  setDriverSession: (session) => set({ driverSession: session }),
  setDriverVehicles: (vehicles) =>
    set((state) => ({
      driverVehicles:
        typeof vehicles === 'function'
          ? vehicles(state.driverVehicles)
          : vehicles,
    })),
  setDriverVehicle: (vehicle) =>
    set((state) => ({
      driverVehicle:
        typeof vehicle === 'function' ? vehicle(state.driverVehicle) : vehicle,
    })),
  setIsEditingVehicle: (isEditing) => set({ isEditingVehicle: isEditing }),
  setEditingVehicleId: (id) => set({ editingVehicleId: id }),
  setDriverMode: (mode) => set({ driverMode: mode }),

  saveDriverSession: (driver, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('rio_driver_session', JSON.stringify(driver));
    set({ driverSession: driver });

    // Connect socket with authenticated handshake
    socket.auth = { token };
    if (socket.connected) {
      socket.disconnect().connect();
    } else {
      socket.connect();
    }
  },

  logoutDriver: async (isTrackingActive, stopTracking) => {
    if (isTrackingActive) {
      await stopTracking();
    }
    localStorage.removeItem('rio_driver_session');
    localStorage.removeItem('token');
    set({
      driverSession: null,
      driverVehicles: [],
      driverVehicle: null,
      isEditingVehicle: false,
      editingVehicleId: null,
    });

    // Reconnect socket without auth token
    socket.auth = { token: null };
    if (socket.connected) {
      socket.disconnect().connect();
    } else {
      socket.connect();
    }
  },
}));
