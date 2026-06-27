import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Vehicle } from '../../types/types';
import { RIO_DEEP_OFFICE } from '../../utils/utils';

interface DriverMapProps {
  simCoords: { lat: number; lng: number } | null;
  driverVehicle: Vehicle | null;
  driverPathHistory: [number, number][];
}

const createMarkerIcon = (type: string, label: string) => {
  const colors: Record<string, { bg: string; border: string; pulse: string }> =
    {
      CAR: {
        bg: 'bg-blue-600',
        border: 'border-blue-300',
        pulse: 'bg-blue-400',
      },
      MOTORCYCLE: {
        bg: 'bg-purple-600',
        border: 'border-purple-300',
        pulse: 'bg-purple-400',
      },
      RICKSHAW: {
        bg: 'bg-amber-500',
        border: 'border-amber-300',
        pulse: 'bg-amber-400',
      },
      CNG: {
        bg: 'bg-emerald-600',
        border: 'border-emerald-300',
        pulse: 'bg-emerald-400',
      },
      DELIVERY: {
        bg: 'bg-indigo-600',
        border: 'border-indigo-300',
        pulse: 'bg-indigo-400',
      },
      OTHER: {
        bg: 'bg-rose-600',
        border: 'border-rose-300',
        pulse: 'bg-rose-400',
      },
    };

  const c = colors[type.toUpperCase()] || colors.OTHER;

  return L.divIcon({
    html: `
      <div class="relative w-10 h-10 flex items-center justify-center rounded-full border-2 border-white ${c.bg} ${c.border} custom-marker-pin shadow-lg text-white font-bold text-xs select-none">
        <span class="pulse-dot bg-red-400 animate-ping"></span>
        <span class="z-10">${label.substring(0, 3).toUpperCase()}</span>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export function DriverMap({
  simCoords,
  driverVehicle,
  driverPathHistory,
}: DriverMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    let timer: number;
    if (mapContainerRef.current && !mapRef.current) {
      timer = window.setTimeout(() => {
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
        }
      }, 100);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      polylineRef.current = null;
    };
  }, []);

  // Sync Marker and Polyline
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      const coords: L.LatLngExpression = simCoords
        ? [simCoords.lat, simCoords.lng]
        : [RIO_DEEP_OFFICE.lat, RIO_DEEP_OFFICE.lng];

      // Update/Create Marker
      if (markerRef.current) {
        markerRef.current.setLatLng(coords);
      } else {
        const label = driverVehicle?.vehicle_type || 'VEH';
        const icon = createMarkerIcon(label, label);
        markerRef.current = L.marker(coords, { icon }).addTo(map);
      }

      // Update/Create Polyline trail
      if (driverPathHistory.length > 1) {
        if (polylineRef.current) {
          polylineRef.current.setLatLngs(driverPathHistory);
        } else {
          polylineRef.current = L.polyline(driverPathHistory, {
            color: '#ef4444',
            weight: 3.5,
            opacity: 0.7,
            dashArray: '4, 6',
          }).addTo(map);
        }
      } else if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      map.setView(coords, map.getZoom());
    }
  }, [simCoords, driverPathHistory, driverVehicle]);

  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100 mb-6">
      <div className="absolute top-4 left-4 z-[400] px-3 py-1.5 bg-white/95 border border-slate-200 rounded-xl flex items-center gap-2 shadow-sm backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-xs font-bold text-slate-700">
          Simulated Location
        </span>
      </div>
      <div ref={mapContainerRef} className="w-full h-full"></div>
    </div>
  );
}
