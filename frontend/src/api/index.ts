import type {
  Vehicle,
  Driver,
  ActiveVehicleResponse,
  ActiveVehiclesList,
} from '../types/types';

export type { Vehicle, Driver, ActiveVehicleResponse, ActiveVehiclesList };

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string>),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}

export const api = {
  // Driver routes
  async registerDriver(
    name: string,
    email: string,
    password: string,
  ): Promise<{
    message: string;
    access_token: string;
    driver_id: string;
    driver: Driver;
  }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async loginDriver(
    email: string,
    password: string,
  ): Promise<{
    message: string;
    access_token: string;
    driver_id: string;
    driver: Driver;
  }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getDrivers(): Promise<{
    count: number;
    drivers: (Driver & { vehicles: Vehicle[] })[];
  }> {
    return request('/drivers');
  },

  async getDriver(driverId: string): Promise<{
    driver: Driver & { vehicles: Vehicle[] };
  }> {
    return request(`/drivers/${driverId}`);
  },

  // Vehicle routes
  async getMyVehicles(): Promise<{
    driver_id: string;
    count: number;
    vehicles: Vehicle[];
  }> {
    return request('/vehicles/my');
  },

  async addVehicle(
    vehicleType: string,
    details: string,
  ): Promise<{
    message: string;
    vehicle_id: string;
    vehicle: Vehicle;
  }> {
    return request('/vehicles/add', {
      method: 'POST',
      body: JSON.stringify({
        vehicle_type: vehicleType,
        details,
      }),
    });
  },

  async updateVehicle(
    vehicleId: string,
    vehicleType: string,
    details: string,
  ): Promise<{
    message: string;
    vehicle: Vehicle;
  }> {
    return request('/vehicles/update', {
      method: 'PUT',
      body: JSON.stringify({
        vehicle_id: vehicleId,
        vehicle_type: vehicleType,
        details,
      }),
    });
  },

  // Tracking routes
  async updateTrackingStatus(
    vehicleId: string,
    isTracking: boolean,
  ): Promise<{
    message: string;
    vehicle_id: string;
    driver_id: string;
    is_tracking: boolean;
    vehicle: Vehicle;
  }> {
    return request('/tracking/status', {
      method: 'POST',
      body: JSON.stringify({
        vehicle_id: vehicleId,
        is_tracking: isTracking,
      }),
    });
  },

  async updateLocation(
    vehicleId: string,
    lat: number,
    lng: number,
  ): Promise<{
    message: string;
    location: {
      vehicle_id: string;
      driver_id: string;
      driver_name: string;
      vehicle_type: string;
      details: string;
      is_tracking: boolean;
      lat: number;
      lng: number;
      last_updated: string;
    };
  }> {
    return request('/tracking/update', {
      method: 'POST',
      body: JSON.stringify({
        vehicle_id: vehicleId,
        lat,
        lng,
      }),
    });
  },

  // Map routes
  async getActiveVehicles(): Promise<ActiveVehiclesList> {
    return request('/map/active-vehicles');
  },
};
