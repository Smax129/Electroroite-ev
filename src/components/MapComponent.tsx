import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RouteDefinition, RouteStop, ChargerStation } from '../types';
import { buildGoogleMapsUrl } from '../services/routingService';
import { ExternalLink, Navigation } from 'lucide-react';

interface MapComponentProps {
  route: RouteDefinition;
  allOptions?: RouteDefinition[];
  onSelectOption?: (route: RouteDefinition) => void;
  plannedStops: RouteStop[];
  onSelectCharger: (charger: ChargerStation) => void;
  onStartLiveCharge?: (stop: RouteStop) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  route,
  allOptions = [],
  onSelectOption,
  plannedStops,
  onSelectCharger,
  onStartLiveCharge,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Default to 'osm' for bright, clear, 100% reliable cartography
  const [mapStyle, setMapStyle] = useState<'osm' | 'voyager' | 'satellite'>('osm');
  const [showGoogleEmbed, setShowGoogleEmbed] = useState<boolean>(false);

  // Switch Tile layers reliably
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenStreetMap contributors';

    if (mapStyle === 'voyager') {
      url = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors &copy; CARTO';
    } else if (mapStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri';
    }

    const newTile = L.tileLayer(url, {
      attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newTile;
    map.invalidateSize();
  }, [mapStyle]);

  // Main Map Setup and Route rendering
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [40.4168, -3.7038],
        zoom: 6,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Default high-visibility OpenStreetMap layer
      const tile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tile;
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      // Ensure proper map sizing
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Resize observer to ensure tiles always fill container
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    layerGroup.clearLayers();

    // 1. Draw alternative routes as selectable dashed lines
    if (allOptions.length > 1 && onSelectOption) {
      allOptions.forEach((opt) => {
        if (opt.id === route.id) return;
        const optLatLngs: L.LatLngExpression[] = opt.waypoints.map(wp => [wp.lat, wp.lng]);
        if (optLatLngs.length > 0) {
          const altLine = L.polyline(optLatLngs, {
            color: '#64748b',
            weight: 4,
            opacity: 0.6,
            dashArray: '6 8',
            lineCap: 'round',
          });
          altLine.on('click', () => onSelectOption(opt));
          altLine.bindTooltip(`Ruta: ${opt.name} (${opt.distanceKm} km)`, { sticky: true });
          layerGroup.addLayer(altLine);
        }
      });
    }

    // 2. Draw active route line
    const latLngs: L.LatLngExpression[] = route.waypoints.map(wp => [wp.lat, wp.lng]);
    if (latLngs.length > 0) {
      // Glow under-layer
      const glowLine = L.polyline(latLngs, {
        color: '#064e3b',
        weight: 10,
        opacity: 0.45,
        lineCap: 'round',
      });
      // Sharp vibrant emerald line
      const mainLine = L.polyline(latLngs, {
        color: '#059669',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
      });

      layerGroup.addLayer(glowLine);
      layerGroup.addLayer(mainLine);

      // Fit bounds with safety padding
      try {
        map.fitBounds(mainLine.getBounds(), { padding: [40, 40] });
      } catch {
        // Fallback
      }
    }

    // 3. Start marker (Origin)
    const startIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background: #10b981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid #064e3b; box-shadow: 0 4px 12px rgba(16,185,129,0.6); font-size: 16px;">
          🏁
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    layerGroup.addLayer(
      L.marker([route.originCoords[0], route.originCoords[1]], { icon: startIcon })
        .bindPopup(`<strong>Salida:</strong> ${route.origin}`)
    );

    // 4. Intermediate Waypoint Markers (if any)
    if (route.intermediatePoints && route.intermediatePoints.length > 0) {
      route.intermediatePoints.forEach((p, idx) => {
        const interIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="background: #06b6d4; color: #022c22; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; border: 3px solid #164e63; box-shadow: 0 4px 12px rgba(6,182,212,0.7);">
              ${idx + 1}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        layerGroup.addLayer(
          L.marker([p.lat, p.lng], { icon: interIcon })
            .bindPopup(`<strong>Destino Intermedio:</strong> ${p.name}`)
        );
      });
    }

    // 5. Destination marker
    const destIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="background: #ef4444; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid #7f1d1d; box-shadow: 0 4px 12px rgba(239,68,68,0.6); font-size: 16px;">
          🎯
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    layerGroup.addLayer(
      L.marker([route.destCoords[0], route.destCoords[1]], { icon: destIcon })
        .bindPopup(`<strong>Destino Final:</strong> ${route.destination}`)
    );

    // 6. Charging Stations
    const plannedChargerIds = new Set(plannedStops.map(s => s.charger.id));

    route.availableChargers.forEach(charger => {
      const isPlanned = plannedChargerIds.has(charger.id);
      const plannedStop = plannedStops.find(s => s.charger.id === charger.id);

      let brandColor = '#3b82f6';
      if (charger.network === 'Tesla Supercharger') brandColor = '#e11d48';
      else if (charger.network === 'Ionity') brandColor = '#06b6d4';
      else if (charger.network === 'Iberdrola') brandColor = '#10b981';
      else if (charger.network === 'Zunder') brandColor = '#f59e0b';
      else if (charger.network === 'Electra') brandColor = '#6366f1';
      else if (charger.network === 'Endesa X Way') brandColor = '#0ea5e9';
      else if (charger.network === 'Repsol') brandColor = '#d97706';

      const chargerIcon = L.divIcon({
        className: 'custom-charger-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            ${isPlanned ? '<div style="position: absolute; top: -6px; width: 44px; height: 44px; border-radius: 50%; background: ' + brandColor + '; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            <div style="background: ${brandColor}; color: white; min-width: 36px; height: 36px; padding: 0 6px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); z-index: 10;">
              <span>${charger.maxPowerKW}k</span>
            </div>
            ${isPlanned ? '<div style="background: #0f172a; color: #10b981; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-top: -4px; border: 1px solid #10b981; z-index: 11; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">PARADA</div>' : ''}
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      const chargerMarker = L.marker([charger.latitude, charger.longitude], { icon: chargerIcon });
      
      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; color: #0f172a; min-width: 210px; padding: 4px 0;">
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 2px; color: #0f172a;">${charger.name}</div>
          <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 8px;">
            <span style="background: #e2e8f0; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${charger.network}</span>
            <span style="background: #dcfce7; color: #166534; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${charger.maxPowerKW} kW</span>
            <span style="font-size: 11px; color: #475569;">${charger.pricePerKWh.toFixed(2)} €/kWh</span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            📍 ${charger.address}
          </div>
          ${isPlanned && plannedStop ? `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 8px; border-radius: 8px; margin-bottom: 8px; font-size: 11px;">
              <strong style="color: #166534;">Plan de parada:</strong> Llegada ${plannedStop.arrivalSoCPercent}% → Cargar al <strong>${plannedStop.targetSoCPercent}%</strong> (${plannedStop.chargingTimeMinutes} min)
            </div>
          ` : ''}
          <div style="display: flex; gap: 6px;">
            <button id="btn-info-${charger.id}" style="flex: 1; background: #0f172a; color: white; border: none; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
              Ver detalles
            </button>
          </div>
        </div>
      `;

      chargerMarker.bindPopup(popupHtml);
      chargerMarker.on('popupopen', () => {
        const infoBtn = document.getElementById(`btn-info-${charger.id}`);
        if (infoBtn) {
          infoBtn.onclick = () => onSelectCharger(charger);
        }
      });

      layerGroup.addLayer(chargerMarker);
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [route, allOptions, plannedStops, onSelectOption, onSelectCharger, onStartLiveCharge]);

  const googleMapsUrl = buildGoogleMapsUrl(
    route.origin,
    route.destination,
    route.intermediatePoints || [],
    plannedStops
  );

  return (
    <div className="relative w-full h-[340px] sm:h-[430px] lg:h-[490px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        {/* Layer Switcher */}
        <div className="bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 flex items-center gap-1 shadow-2xl text-[11px]">
          <button
            onClick={() => setMapStyle('osm')}
            className={`px-2.5 py-1 rounded-lg font-extrabold transition ${
              mapStyle === 'osm' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            🗺️ Callejero OSM
          </button>
          <button
            onClick={() => setMapStyle('voyager')}
            className={`px-2.5 py-1 rounded-lg font-extrabold transition ${
              mapStyle === 'voyager' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            🚗 Voyager
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 rounded-lg font-extrabold transition ${
              mapStyle === 'satellite' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            🛰️ Satélite
          </button>
        </div>

        {/* Google Maps View Toggle */}
        <button
          onClick={() => setShowGoogleEmbed(!showGoogleEmbed)}
          className="px-2.5 py-1.5 rounded-xl bg-slate-950/95 hover:bg-slate-900 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 font-bold text-xs flex items-center gap-1.5 shadow-2xl transition"
          title="Ver en vista mapa de Google"
        >
          <span>🌐 Vista Google</span>
        </button>

        {/* Direct Google Maps Link */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xl transition"
          title="Abrir la ruta completa con todas las paradas en la app de Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Abrir en Google Maps</span>
        </a>
      </div>

      {/* Embedded Google Maps Modal/Overlay */}
      {showGoogleEmbed && (
        <div className="absolute inset-0 z-30 bg-slate-950 flex flex-col p-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 px-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              Vista Google Maps: {route.origin} → {route.destination}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-xs flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> Navegación GPS
              </a>
              <button
                onClick={() => setShowGoogleEmbed(false)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
          <div className="flex-1 w-full rounded-xl overflow-hidden mt-2 bg-slate-900 border border-slate-800">
            <iframe
              title="Google Maps Route"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.google.com/maps?q=${route.originCoords[0]},${route.originCoords[1]}&output=embed`}
            />
          </div>
        </div>
      )}

      {/* Network Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg flex flex-wrap items-center gap-3 text-[10px] text-slate-300">
        <span className="font-bold text-slate-400 uppercase tracking-wider">Redes:</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>Tesla</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
          <span>Ionity</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Iberdrola</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>Zunder</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
          <span>Electra</span>
        </div>
      </div>
    </div>
  );
};
