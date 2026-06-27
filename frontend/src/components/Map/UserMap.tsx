import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { ActiveVehicleResponse } from '../../types/types';
import { RIO_DEEP_OFFICE } from '../../utils/utils';

interface UserMapProps {
  activeVehicles: ActiveVehicleResponse[];
  selectedVehicleId: string | null;
  pathHistories: Record<string, [number, number][]>;
}

// Helper to get marker icons based on type
const createMarkerIcon = (type: string, isSelf = false) => {
  const icons: Record<string, string> = {
    CAR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14l-1.5-5h-11L5 17Z"/><path d="M7 17v2M17 17v2M7 12l1.5-4h7L17 12"/></svg>',
    MOTORCYCLE:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M9 17h3l3-5h2M11 12h4l-2-3h-3"/></svg>',
    RICKSHAW:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/><path d="M5 14h13l-2-6H8L5 14Z"/></svg>',
    CNG: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/><path d="M5 14h13l-2-6H8L5 14Z"/></svg>',
    DELIVERY:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 16V8h11v8H3Z"/><path d="M14 16h7v-5l-3-3h-4v8Z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    OTHER:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 5v8l-8 5-8-5V8l8-5Z"/></svg>',
  };
  const colors: Record<string, { bg: string; ring: string }> = {
    CAR: {
      bg: '#2563eb',
      ring: '#93c5fd',
    },
    MOTORCYCLE: {
      bg: '#7c3aed',
      ring: '#c4b5fd',
    },
    RICKSHAW: {
      bg: '#f59e0b',
      ring: '#fcd34d',
    },
    CNG: {
      bg: '#059669',
      ring: '#6ee7b7',
    },
    DELIVERY: {
      bg: '#4f46e5',
      ring: '#a5b4fc',
    },
    OTHER: {
      bg: '#e11d48',
      ring: '#fda4af',
    },
  };

  const vehicleType = type.toUpperCase();
  const c = colors[vehicleType] || colors.OTHER;
  const icon = icons[vehicleType] || icons.OTHER;

  return L.divIcon({
    html: `
      <div class="vehicle-marker" style="background:${c.bg}; --marker-ring:${isSelf ? '#f87171' : c.ring}">
        <span class="vehicle-marker-pulse"></span>
        <span class="vehicle-marker-icon">${icon}</span>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createUserLocationIcon = () =>
  L.divIcon({
    html: `
      <div class="user-location-marker">
        <span class="user-location-pulse"></span>
        <span class="user-location-dot"></span>
      </div>
    `,
    className: 'custom-user-location-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

export function UserMap({
  activeVehicles,
  selectedVehicleId,
  pathHistories,
}: UserMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylinesRef = useRef<Record<string, L.Polyline>>({});
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  // ponytail: Initialize locationStatus directly from localStorage to prevent synchronous setState inside useEffect.
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'locating' | 'ready' | 'unavailable' | 'unsupported'
  >(() => {
    const saved = localStorage.getItem('rio_user_location');
    if (saved) {
      try {
        JSON.parse(saved);
        return 'ready';
      } catch {
        localStorage.removeItem('rio_user_location');
      }
    }
    return 'idle';
  });

  const showUserLocation = useCallback((position: GeolocationPosition) => {
    if (!mapRef.current) return;

    const coords: L.LatLngExpression = [
      position.coords.latitude,
      position.coords.longitude,
    ];
    const icon = createUserLocationIcon();
    localStorage.setItem('rio_user_location', JSON.stringify(coords));

    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setLatLng(coords);
      userLocationMarkerRef.current.setIcon(icon);
    } else {
      userLocationMarkerRef.current = L.marker(coords, { icon })
        .addTo(mapRef.current)
        .bindPopup('<b>Your Current Location</b>');
    }

    setLocationStatus('ready');
    mapRef.current.setView(coords, 15);
  }, []);

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }

    setLocationStatus('locating');

    navigator.geolocation.getCurrentPosition(
      showUserLocation,
      () => setLocationStatus('unavailable'),
      {
        enableHighAccuracy: false,
        maximumAge: 30000,
        timeout: 15000,
      },
    );
  }, [showUserLocation]);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([RIO_DEEP_OFFICE.lat, RIO_DEEP_OFFICE.lng], 14);

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        },
      ).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

      const savedLocation = localStorage.getItem('rio_user_location');
      if (savedLocation) {
        try {
          const coords = JSON.parse(savedLocation) as [number, number];
          userLocationMarkerRef.current = L.marker(coords, {
            icon: createUserLocationIcon(),
          })
            .addTo(mapRef.current)
            .bindPopup('<b>Your Last Known Location</b>');
          mapRef.current.setView(coords, 15);
        } catch {
          // handled by state initializer
        }
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
      polylinesRef.current = {};
      userLocationMarkerRef.current = null;
    };
  }, [requestUserLocation]);

  // Sync Markers and Trails
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      const currentIds = new Set<string>();

      activeVehicles.forEach((v) => {
        currentIds.add(v.vehicle_id);
        const position: L.LatLngExpression = [v.lat, v.lng];

        // Sync Marker
        if (markersRef.current[v.vehicle_id]) {
          markersRef.current[v.vehicle_id].setLatLng(position);
          markersRef.current[v.vehicle_id].setIcon(
            createMarkerIcon(v.vehicle_type),
          );
        } else {
          const markerIcon = createMarkerIcon(v.vehicle_type);
          const marker = L.marker(position, { icon: markerIcon }).addTo(map);

          marker.bindPopup(`
            <div class="text-slate-900 p-1 font-sans">
              <div class="flex items-center gap-1.5 font-bold text-sm text-slate-800">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                ${v.vehicle_type_label} - Active
              </div>
              <p class="text-xs mt-1 text-slate-600"><b>Driver:</b> ${v.driver_name}</p>
              <p class="text-xs mt-0.5 text-slate-600"><b>Details:</b> ${v.details}</p>
              <p class="text-[10px] mt-1.5 text-slate-400 font-mono">Lat: ${v.lat.toFixed(5)}, Lng: ${v.lng.toFixed(5)}</p>
            </div>
          `);

          markersRef.current[v.vehicle_id] = marker;
        }

        // Sync Polyline Coordinate Trail
        const history = pathHistories[v.vehicle_id] || [];
        if (history.length > 1) {
          if (polylinesRef.current[v.vehicle_id]) {
            polylinesRef.current[v.vehicle_id].setLatLngs(history);
          } else {
            const colors: Record<string, string> = {
              CAR: '#2563eb',
              MOTORCYCLE: '#7c3aed',
              RICKSHAW: '#f59e0b',
              CNG: '#059669',
              DELIVERY: '#4f46e5',
              OTHER: '#e11d48',
            };
            const strokeColor =
              colors[v.vehicle_type.toUpperCase()] || colors.OTHER;

            const polyline = L.polyline(history, {
              color: strokeColor,
              weight: 3,
              opacity: 0.6,
              dashArray: '5, 8',
            }).addTo(map);

            polylinesRef.current[v.vehicle_id] = polyline;
          }
        }
      });

      // Cleanup stopped trackers
      Object.keys(markersRef.current).forEach((id) => {
        if (!currentIds.has(id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      Object.keys(polylinesRef.current).forEach((id) => {
        if (!currentIds.has(id)) {
          polylinesRef.current[id].remove();
          delete polylinesRef.current[id];
        }
      });
    }
  }, [activeVehicles, pathHistories]);

  // Handle Fly-To and popup triggers reactively
  useEffect(() => {
    if (selectedVehicleId && mapRef.current) {
      const v = activeVehicles.find(
        (vehicle) => vehicle.vehicle_id === selectedVehicleId,
      );
      if (v) {
        mapRef.current.flyTo([v.lat, v.lng], 16, {
          animate: true,
          duration: 1.5,
        });

        const timer = setTimeout(() => {
          const marker = markersRef.current[selectedVehicleId];
          if (marker) marker.openPopup();
        }, 1500);

        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [selectedVehicleId, activeVehicles]);

  return (
    <div className="lg:col-span-3 h-full min-h-[500px] bg-white border border-slate-200 rounded-2xl overflow-hidden relative shadow-sm">
      <div className="absolute top-4 left-4 z-[400] px-3 py-1.5 bg-white/95 border border-slate-200 rounded-xl flex items-center gap-2 shadow-sm backdrop-blur-md">
        <span className="relative flex h-2.5 w-2.5">
          {locationStatus === 'ready' && (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </>
          )}
          {locationStatus === 'locating' && (
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 animate-pulse"></span>
          )}
          {locationStatus === 'idle' && (
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
          )}
          {(locationStatus === 'unavailable' ||
            locationStatus === 'unsupported') && (
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          )}
        </span>
        <span className="text-xs font-bold text-slate-700">
          {locationStatus === 'ready' && 'Your Location'}
          {locationStatus === 'idle' && 'Location Off'}
          {locationStatus === 'locating' && 'Finding Your Location'}
          {locationStatus === 'unavailable' && 'Location Unavailable'}
          {locationStatus === 'unsupported' && 'Location Not Supported'}
        </span>
        {(locationStatus === 'idle' || locationStatus === 'unavailable') && (
          <button
            type="button"
            onClick={requestUserLocation}
            className="ml-1 text-[10px] font-black text-teal-700 hover:text-teal-900"
          >
            Retry
          </button>
        )}
      </div>
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]"></div>
    </div>
  );
}
