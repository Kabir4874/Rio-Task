import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { ActiveVehicleResponse } from '../../types/types';
import { RIO_DEEP_OFFICE } from '../../utils/utils';

interface UserMapProps {
  activeVehicles: ActiveVehicleResponse[];
  selectedVehicleId: string | null;
  pathHistories: Record<string, [number, number][]>;
}

// Helper to get marker icons based on type
const createMarkerIcon = (type: string, label: string, isSelf = false) => {
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
        <span class="pulse-dot ${isSelf ? 'bg-red-400 animate-ping' : c.pulse}"></span>
        <span class="z-10">${label.substring(0, 3).toUpperCase()}</span>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export function UserMap({
  activeVehicles,
  selectedVehicleId,
  pathHistories,
}: UserMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylinesRef = useRef<Record<string, L.Polyline>>({});

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

      // Plot office marker
      const officeIcon = L.divIcon({
        html: `
          <div class="w-8 h-8 rounded-lg bg-slate-900 border-2 border-red-500 flex items-center justify-center text-white shadow-xl select-none font-bold">
            <span class="text-xs">RIO</span>
          </div>
        `,
        className: 'custom-office-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([RIO_DEEP_OFFICE.lat, RIO_DEEP_OFFICE.lng], {
        icon: officeIcon,
      })
        .addTo(mapRef.current)
        .bindPopup(
          '<b>Rio Deep Technologies Office</b><br/>9, Shahid Tajuddin Ahmed Sharani, Moghbazar',
        );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
      polylinesRef.current = {};
    };
  }, []);

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
        } else {
          const markerIcon = createMarkerIcon(v.vehicle_type, v.vehicle_type);
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
        <div className="w-2.5 h-2.5 bg-red-500 border border-red-300 rounded-sm"></div>
        <span className="text-xs font-bold text-slate-700">
          Rio Deep HQ (Anchor)
        </span>
      </div>
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]"></div>
    </div>
  );
}
