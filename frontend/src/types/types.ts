export interface LocationData {
  lat: number;
  lng: number;
  last_updated: string;
}

export interface Vehicle {
  vehicle_id: string;
  driver_id: string;
  driver_name?: string;
  vehicle_type: string;
  vehicle_type_label: string;
  details: string;
  is_tracking: boolean;
  location: LocationData | null;
  created_at?: string;
  updated_at?: string;
}

export interface Driver {
  driver_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  vehicles?: Vehicle[];
}

export interface ActiveVehicleResponse {
  vehicle_id: string;
  driver_id: string;
  driver_name: string;
  vehicle_type: string;
  vehicle_type_label: string;
  details: string;
  is_tracking: boolean;
  lat: number;
  lng: number;
  last_updated: string;
}

export interface ActiveVehiclesList {
  count: number;
  vehicles: ActiveVehicleResponse[];
}
