import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api';
import { useDriverStore } from '../store/useDriverStore';
import {
  registerDriverSchema,
  loginDriverSchema,
  vehicleSchema,
} from '../utils/validation';
import type { Vehicle } from '../types/types';

export function useDriverSession(
  showError: (msg: string) => void,
  showSuccess: (msg: string) => void,
  setSimCoords: (coords: { lat: number; lng: number } | null) => void,
  setDriverPathHistory: React.Dispatch<
    React.SetStateAction<[number, number][]>
  >,
) {
  const {
    driverSession,
    driverVehicles,
    driverVehicle,
    isEditingVehicle,
    editingVehicleId,
    driverMode,
    setDriverSession,
    setDriverVehicles,
    setDriverVehicle,
    setIsEditingVehicle,
    setEditingVehicleId,
    setDriverMode,
    saveDriverSession,
    logoutDriver: storeLogout,
  } = useDriverStore();

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [vehicleDetails, setVehicleDetails] = useState('');

  const { data: vehiclesData, refetch: fetchDriverVehicles } = useQuery({
    queryKey: ['driverVehicles', driverSession?.driver_id],
    queryFn: async () => {
      if (!driverSession)
        return { driver_id: '', count: 0, vehicles: [] as Vehicle[] };
      return api.getMyVehicles();
    },
    enabled: !!driverSession,
  });

  useEffect(() => {
    if (vehiclesData) {
      setDriverVehicles(vehiclesData.vehicles);
      setDriverVehicle((prev: Vehicle | null) => {
        if (!prev) return vehiclesData.vehicles[0] || null;
        const updated = vehiclesData.vehicles.find(
          (v: Vehicle) => v.vehicle_id === prev.vehicle_id,
        );
        return updated || vehiclesData.vehicles[0] || null;
      });
    }
  }, [vehiclesData, setDriverVehicles, setDriverVehicle]);

  const registerMutation = useMutation({
    mutationFn: async () => {
      const validation = registerDriverSchema.safeParse({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });
      if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
      }
      return api.registerDriver(
        registerName.trim(),
        registerEmail.trim(),
        registerPassword.trim(),
      );
    },
    onSuccess: (res) => {
      saveDriverSession(res.driver, res.access_token);
      showSuccess(res.message);
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const validation = loginDriverSchema.safeParse({
        email: loginEmail,
        password: loginPassword,
      });
      if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
      }
      return api.loginDriver(loginEmail.trim(), loginPassword.trim());
    },
    onSuccess: (res) => {
      saveDriverSession(res.driver, res.access_token);
      showSuccess(res.message);
      setLoginEmail('');
      setLoginPassword('');
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  const addVehicleMutation = useMutation({
    mutationFn: async () => {
      const validation = vehicleSchema.safeParse({
        vehicleType,
        details: vehicleDetails,
      });
      if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
      }
      return api.addVehicle(vehicleType, vehicleDetails.trim());
    },
    onSuccess: (res) => {
      showSuccess(res.message);
      setVehicleDetails('');
      void fetchDriverVehicles();
      setDriverVehicle(res.vehicle);
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async () => {
      if (!editingVehicleId) {
        throw new Error('No vehicle selected for editing');
      }
      const validation = vehicleSchema.safeParse({
        vehicleType,
        details: vehicleDetails,
      });
      if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
      }
      return api.updateVehicle(
        editingVehicleId,
        vehicleType,
        vehicleDetails.trim(),
      );
    },
    onSuccess: (res) => {
      showSuccess(res.message);
      setIsEditingVehicle(false);
      setEditingVehicleId(null);
      setVehicleDetails('');
      void fetchDriverVehicles();
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  const logoutDriver = async (
    isTracking: boolean,
    stopTracking: () => Promise<void>,
  ) => {
    await storeLogout(isTracking, stopTracking);
    setDriverPathHistory([]);
    setSimCoords(null);
  };

  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  const handleLoginDriver = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicleMutation.mutate();
  };

  const handleUpdateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    updateVehicleMutation.mutate();
  };

  return {
    driverSession,
    driverVehicles,
    driverVehicle,
    isEditingVehicle,
    editingVehicleId,
    registerName,
    registerEmail,
    registerPassword,
    loginEmail,
    loginPassword,
    registerLoading: registerMutation.isPending,
    loginLoading: loginMutation.isPending,
    vehicleType,
    vehicleDetails,
    vehicleLoading:
      addVehicleMutation.isPending || updateVehicleMutation.isPending,
    driverMode,
    setDriverSession,
    setDriverVehicle,
    setIsEditingVehicle,
    setEditingVehicleId,
    setRegisterName,
    setRegisterEmail,
    setRegisterPassword,
    setLoginEmail,
    setLoginPassword,
    setVehicleType,
    setVehicleDetails,
    setDriverMode,
    logoutDriver,
    handleRegisterDriver,
    handleLoginDriver,
    handleAddVehicle,
    handleUpdateVehicle,
    fetchDriverVehicles,
  };
}
