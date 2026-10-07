import React, { useState, useEffect, useRef } from 'react';
import { RouteDefinition, RouteStop } from '../types';
import { 
  searchLocations, 
  calculateRouteOptions, 
  buildGoogleMapsUrl,
  LocationSearchResult 
} from '../services/routingService';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  ArrowUpDown, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Navigation, 
  Check, 
  Loader2,
  Route,
  Zap
} from 'lucide-react';

interface CustomRoutePlannerProps {
  currentRoute: RouteDefinition;
  availableOptions: RouteDefinition[];
  onSelectOption: (route: RouteDefinition) => void;
  onNewRouteCalculated: (options: RouteDefinition[]) => void;
  plannedStops: RouteStop[];
}

export const CustomRoutePlanner: React.FC<CustomRoutePlannerProps> = ({
  currentRoute,
  availableOptions,
  onSelectOption,
  onNewRouteCalculated,
  plannedStops,
}) => {
  // Input states
  const [originInput, setOriginInput] = useState('Madrid');
  const [destInput, setDestInput] = useState('Valencia');
  const [intermediateInput, setIntermediateInput] = useState('');
  const [showIntermediate, setShowIntermediate] = useState(false);

  // Stored selected coordinates
  const [originCoords, setOriginCoords] = useState<{ name: string; lat: number; lng: number }>({
    name: 'Madrid',
    lat: 40.4168,
    lng: -3.7038,
  });
  const [destCoords, setDestCoords] = useState<{ name: string; lat: number; lng: number }>({
    name: 'Valencia',
    lat: 39.4699,
    lng: -0.3763,
  });
  const [intermediateCoords, setIntermediateCoords] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // Autocomplete suggestions
  const [originSuggestions, setOriginSuggestions] = useState<LocationSearchResult[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationSearchResult[]>([]);
  const [interSuggestions, setInterSuggestions] = useState<LocationSearchResult[]>([]);

  const [activeDropdown, setActiveDropdown] = useState<'origin' | 'dest' | 'inter' | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Debounced search helper
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (field: 'origin' | 'dest' | 'inter', value: string) => {
    if (field === 'origin') setOriginInput(value);
    else if (field === 'dest') setDestInput(value);
    else setIntermediateInput(value);

    setActiveDropdown(field);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!value || value.length < 2) {
      if (field === 'origin') setOriginSuggestions([]);
      else if (field === 'dest') setDestSuggestions([]);
      else setInterSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchLocations(value);
      if (field === 'origin') setOriginSuggestions(results);
      else if (field === 'dest') setDestSuggestions(results);
      else setInterSuggestions(results);
    }, 300);
  };

  const handleSelectLocation = (
    field: 'origin' | 'dest' | 'inter',
    item: LocationSearchResult
  ) => {
    if (field === 'origin') {
      setOriginInput(item.name);
      setOriginCoords({ name: item.name, lat: item.lat, lng: item.lng });
      setOriginSuggestions([]);
    } else if (field === 'dest') {
      setDestInput(item.name);
      setDestCoords({ name: item.name, lat: item.lat, lng: item.lng });
      setDestSuggestions([]);
    } else {
      setIntermediateInput(item.name);
      setIntermediateCoords({ name: item.name, lat: item.lat, lng: item.lng });
      setInterSuggestions([]);
    }
    setActiveDropdown(null);
  };

  const handleCalculateRoutes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!originCoords || !destCoords) return;

    setIsCalculating(true);
    try {
      const intermediates = intermediateCoords ? [intermediateCoords] : [];
      const options = await calculateRouteOptions(originCoords, destCoords, intermediates);
      if (options.length > 0) {
        onNewRouteCalculated(options);
        onSelectOption(options[0]);
      }
    } catch (err) {
      console.error('Error calculando ruta:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSwapOriginDest = () => {
    const tempName = originInput;
    const tempCoords = originCoords;

    setOriginInput(destInput);
    setOriginCoords(destCoords);

    setDestInput(tempName);
    setDestCoords(tempCoords);
  };

  const handleOpenInGoogleMaps = () => {
    const intermediates = intermediateCoords ? [intermediateCoords] : [];
    const url = buildGoogleMapsUrl(originInput, destInput, intermediates, plannedStops);
    window.open(url, '_blank');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Title & Google Maps Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
            <Route className="w-5 h-5 text-emerald-400" />
            Planificador de Ruta Personalizada
          </h3>
          <p className="text-xs text-slate-400">
            Define tu origen, escalas intermedias y destino con opciones múltiples
          </p>
        </div>

        {/* Google Maps Button */}
        <button
          onClick={handleOpenInGoogleMaps}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition active:scale-95"
          title="Abrir la ruta calculada con todas las paradas en Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Ver ruta en Google Maps</span>
        </button>
      </div>

      {/* Form with Origin, Intermediate and Destination */}
      <form onSubmit={handleCalculateRoutes} className="space-y-3">
        <div className="relative space-y-2">
          {/* Origin Input */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm focus-within:border-emerald-500 transition">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <input
                type="text"
                value={originInput}
                onChange={(e) => handleSearchChange('origin', e.target.value)}
                onFocus={() => setActiveDropdown('origin')}
                placeholder="Ciudad o dirección de Salida (ej. Madrid, Bilbao, Valencia...)"
                className="w-full bg-transparent text-white focus:outline-none placeholder-slate-500 text-xs sm:text-sm"
                required
              />
              {originInput && (
                <button
                  type="button"
                  onClick={() => setOriginInput('')}
                  className="text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Origin Autocomplete Dropdown */}
            {activeDropdown === 'origin' && originSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                {originSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectLocation('origin', item)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 border-b border-slate-800 last:border-none flex items-start gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-100">{item.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.displayName}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Intermediate Destination Input (Optional) */}
          {showIntermediate && (
            <div className="relative animate-in fade-in duration-200">
              <div className="flex items-center gap-2 bg-slate-950 border border-cyan-800/80 rounded-xl px-3 py-2 text-sm focus-within:border-cyan-400 transition">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={intermediateInput}
                  onChange={(e) => handleSearchChange('inter', e.target.value)}
                  onFocus={() => setActiveDropdown('inter')}
                  placeholder="Destino intermedio / Parada turística o escala (ej. Zaragoza, Toledo...)"
                  className="w-full bg-transparent text-white focus:outline-none placeholder-slate-500 text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowIntermediate(false);
                    setIntermediateCoords(null);
                    setIntermediateInput('');
                  }}
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                  title="Eliminar parada intermedia"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Intermediate Suggestions */}
              {activeDropdown === 'inter' && interSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                  {interSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation('inter', item)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 border-b border-slate-800 last:border-none flex items-start gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-100">{item.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{item.displayName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Destination Input */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm focus-within:border-rose-500 transition">
              <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              <input
                type="text"
                value={destInput}
                onChange={(e) => handleSearchChange('dest', e.target.value)}
                onFocus={() => setActiveDropdown('dest')}
                placeholder="Ciudad o dirección de Destino (ej. Barcelona, Sevilla, Málaga...)"
                className="w-full bg-transparent text-white focus:outline-none placeholder-slate-500 text-xs sm:text-sm"
                required
              />
              {destInput && (
                <button
                  type="button"
                  onClick={() => setDestInput('')}
                  className="text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Destination Autocomplete Dropdown */}
            {activeDropdown === 'dest' && destSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                {destSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectLocation('dest', item)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 border-b border-slate-800 last:border-none flex items-start gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-100">{item.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.displayName}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {!showIntermediate && (
              <button
                type="button"
                onClick={() => setShowIntermediate(true)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Añadir destino intermedio</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSwapOriginDest}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Intercambiar salida y destino"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={isCalculating}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-95"
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calculando opciones...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 fill-slate-950" />
                <span>Calcular Ruta y Opciones</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Multiple Route Options Cards (Opciones de ruta) */}
      {availableOptions.length > 0 && (
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Opciones de Ruta Disponibles ({availableOptions.length}):
            </span>
            <span className="text-[11px] text-slate-400">
              Selecciona para comparar consumo y paradas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {availableOptions.map((opt) => {
              const isSelected = currentRoute.id === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onSelectOption(opt)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-extrabold text-xs truncate text-white">
                        {opt.name}
                      </span>
                      {opt.tag && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isSelected 
                            ? 'bg-emerald-500 text-slate-950' 
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {opt.tag}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {opt.origin} → {opt.destination}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
                    <span className="font-black text-white">{opt.distanceKm} km</span>
                    <span className="text-cyan-300 font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {opt.availableChargers.length} cargadores
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400'
                    }`}>
                      {isSelected ? 'Activa' : 'Elegir'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
