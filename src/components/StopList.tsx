import React from 'react';
import { RouteDefinition, RouteStop, TripCalculationResult, ChargerStation } from '../types';
import { 
  Zap, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Coffee, 
  Utensils, 
  Wifi, 
  Hotel, 
  ShoppingBag,
  Bell,
  Play,
  Info
} from 'lucide-react';

interface StopListProps {
  route: RouteDefinition;
  result: TripCalculationResult;
  onSelectCharger: (charger: ChargerStation) => void;
  onStartLiveCharge: (stop: RouteStop) => void;
}

export const StopList: React.FC<StopListProps> = ({
  route,
  result,
  onSelectCharger,
  onStartLiveCharge,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          Itinerario y Paradas Recomendadas
        </h3>
        <span className="text-xs text-slate-400">
          Algoritmo de carga rápida optimizada
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-6">
        {/* Origin Step */}
        <div className="relative">
          {/* Dot */}
          <div className="absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-900 flex items-center justify-center shadow-md shadow-emerald-500/30">
            <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Salida
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {route.origin}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Batería inicial:</span>
                <div className="text-base font-extrabold text-emerald-400">
                  {result.departureSoC}%
                </div>
              </div>
            </div>

            {result.stops.length > 0 && (
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                <span>🚗 Trayecto de {result.stops[0].distanceFromStartKm} km hasta la primera parada</span>
              </div>
            )}
          </div>
        </div>

        {/* Charging Stops */}
        {result.stops.map((stop, index) => {
          const charger = stop.charger;

          let badgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
          if (charger.network === 'Tesla Supercharger') badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
          else if (charger.network === 'Ionity') badgeColor = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
          else if (charger.network === 'Iberdrola') badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
          else if (charger.network === 'Zunder') badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';

          return (
            <div key={stop.id} className="relative">
              {/* Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 rounded-full bg-cyan-400 border-4 border-slate-900 flex items-center justify-center shadow-md shadow-cyan-400/30">
                <Zap className="w-3 h-3 text-slate-950 fill-slate-950" />
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 sm:p-4 shadow-lg hover:border-slate-600 transition">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                        {charger.network}
                      </span>
                      <span className="text-[11px] font-extrabold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                        {charger.maxPowerKW} kW
                      </span>
                      <span className="text-xs text-slate-400">
                        (Km {stop.distanceFromStartKm})
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {charger.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {charger.address}
                    </p>
                  </div>

                  {/* Charge plan badge */}
                  <div className="text-right bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Tiempo de carga:</div>
                    <div className="text-base sm:text-lg font-black text-emerald-400 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      {stop.chargingTimeMinutes} min
                    </div>
                  </div>
                </div>

                {/* Battery Progression & Cost */}
                <div className="my-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Llegas con:</span>
                    <span className="font-extrabold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {stop.arrivalSoCPercent}%
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-400">Cargar hasta:</span>
                    <span className="font-extrabold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {stop.targetSoCPercent}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      Energía: <strong className="text-slate-200">+{stop.energyChargedKWh} kWh</strong>
                    </span>
                    <span className="text-slate-400">
                      Coste: <strong className="text-amber-300">{stop.estimatedCostEur.toFixed(2)} €</strong>
                    </span>
                  </div>
                </div>

                {/* Why optimal charge message */}
                <div className="text-[11px] text-slate-400 bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-2 flex items-start gap-2 mb-3">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Estrategia ABRP:</strong> Cargar al <strong>{stop.targetSoCPercent}%</strong> aprovecha la máxima potencia ({stop.averageChargingPowerKW} kW de media). Continuar cargando más allá del 80% ralentiza el viaje drásticamente.
                  </span>
                </div>

                {/* Amenities & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-700/60">
                  {/* Amenities */}
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    {charger.amenities.coffee && <span title="Cafetería"><Coffee className="w-3.5 h-3.5 text-amber-400" /></span>}
                    {charger.amenities.restaurant && <span title="Restaurante"><Utensils className="w-3.5 h-3.5 text-emerald-400" /></span>}
                    {charger.amenities.wifi && <span title="WiFi"><Wifi className="w-3.5 h-3.5 text-cyan-400" /></span>}
                    {charger.amenities.hotel && <span title="Hotel"><Hotel className="w-3.5 h-3.5 text-indigo-400" /></span>}
                    {charger.amenities.shop && <span title="Tienda"><ShoppingBag className="w-3.5 h-3.5 text-rose-400" /></span>}
                    <span className="text-[10px] text-slate-500">
                      {charger.availableStalls}/{charger.totalStalls} libres
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectCharger(charger)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      Ficha cargador
                    </button>

                    <button
                      onClick={() => onStartLiveCharge(stop)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow shadow-emerald-500/20"
                      title="Simular proceso de carga en vivo con avisos push al terminar"
                    >
                      <Play className="w-3 h-3 fill-slate-950" />
                      <span>Simular Carga</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Destination Step */}
        <div className="relative">
          {/* Dot */}
          <div className="absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 rounded-full bg-rose-500 border-4 border-slate-900 flex items-center justify-center shadow-md shadow-rose-500/30">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  Destino
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {route.destination}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Batería restante:</span>
                <div className="text-base font-extrabold text-emerald-400">
                  {result.finalArrivalSoC}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
