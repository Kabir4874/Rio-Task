export const RIO_DEEP_OFFICE = { lat: 23.748, lng: 90.403 };

export const getDefaultStartCoords = (
  vehicleType: string,
): { lat: number; lng: number } => {
  const base = { ...RIO_DEEP_OFFICE };
  switch (vehicleType.toUpperCase()) {
    case 'CAR':
      return { lat: base.lat + 0.0012, lng: base.lng - 0.0015 };
    case 'MOTORCYCLE':
      return { lat: base.lat - 0.001, lng: base.lng + 0.001 };
    case 'RICKSHAW':
      return { lat: base.lat - 0.0008, lng: base.lng - 0.0008 };
    case 'CNG':
      return { lat: base.lat + 0.0009, lng: base.lng + 0.0012 };
    case 'DELIVERY':
      return { lat: base.lat + 0.0015, lng: base.lng - 0.0005 };
    default:
      return base;
  }
};

export const simulateNextLocation = (
  lat: number,
  lng: number,
): { lat: number; lng: number } => {
  // Move in a slightly drifting direction with minor random walk jitter
  // 0.0001 degrees is ~11 meters, representing realistic vehicle updates every few seconds.
  const latOffset = (Math.random() - 0.49) * 0.00015;
  const lngOffset = (Math.random() - 0.5) * 0.00015;

  return {
    lat: Number((lat + latOffset).toFixed(6)),
    lng: Number((lng + lngOffset).toFixed(6)),
  };
};
