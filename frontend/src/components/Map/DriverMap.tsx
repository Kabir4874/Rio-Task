import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Vehicle } from '../../types/types';
import { RIO_DEEP_OFFICE } from '../../utils/utils';

interface DriverMapProps {
  simCoords: { lat: number; lng: number } | null;
  driverVehicle: Vehicle | null;
  driverPathHistory: [number, number][];
}

const createMarkerIcon = (type: string) => {
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
      <div class="vehicle-marker" style="background:${c.bg}; --marker-ring:${c.ring}">
        <span class="vehicle-marker-pulse"></span>
        <span class="vehicle-marker-icon">${icon}</span>
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
  const [mapReady, setMapReady] = useState(false);

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
          mapRef.current.invalidateSize();
          setMapReady(true);
        }
      }, 100);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
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
        markerRef.current.setIcon(
          createMarkerIcon(driverVehicle?.vehicle_type || 'VEH'),
        );
      } else {
        const label = driverVehicle?.vehicle_type || 'VEH';
        const icon = createMarkerIcon(label);
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
      window.setTimeout(() => map.invalidateSize(), 0);
    }
  }, [simCoords, driverPathHistory, driverVehicle, mapReady]);

  return (
    <div className="w-full h-full min-h-[560px] overflow-hidden relative bg-slate-100">
      <div className="absolute top-4 left-4 z-[400] px-3 py-1.5 bg-white/95 border border-slate-200 rounded-xl flex items-center gap-2 shadow-sm backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-xs font-bold text-slate-700">
          Simulated Location
        </span>
      </div>
      <div ref={mapContainerRef} className="w-full h-full min-h-[560px]"></div>
    </div>
  );
}
