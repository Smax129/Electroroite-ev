import React from 'react';
import { TripCalculationResult, Vehicle } from '../types';
import { 
  Clock, 
  Battery, 
  Zap, 
  Fuel, 
  Leaf, 
  Coins, 
  Gauge,
  ArrowRight
} from 'lucide-react';

interface RoutePlanSummaryProps {
  result: TripCalculationResult;
  vehicle: Vehicle;
}

export const RoutePlanSummary: React.FC<RoutePlanSummaryProps> = ({
  result,
  vehicle,
}) => {
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} min`;
    return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top Banner: Battery Departure -> Arrival & Total Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Battery Departure to Arrival */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Batería Trayecto
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-white">
                {result.departureSoC}%
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              <span className={`text-xl sm:text-2xl font-black ${
                result.finalArrivalSoC <= 10 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {result.finalArrivalSoC}%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Llegada con margen seguro
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Battery className="w-6 h-6" />
          </div>
        </div>

        {/* Travel Time */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Tiempo Total
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {formatTime(result.totalTripTimeMinutes)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>🚗 {formatTime(result.totalDrivingTimeMinutes)}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">⚡ {formatTime(result.totalChargingTimeMinutes)}</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Stops & Distance */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Distancia y Paradas
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {result.totalDistanceKm} km
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {result.stops.length === 0 ? (
                <span className="text-emerald-400 font-medium">Sin paradas (Ruta directa)</span>
              ) : (
                <span><strong>{result.stops.length}</strong> {result.stops.length === 1 ? 'parada de carga' : 'paradas de carga'}</span>
              )}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid of Consumption & Savings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Average Consumption */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Consumo Medio</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100">
            {(result.averageConsumptionWhKm / 10).toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400">kWh/100km</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Total {result.totalEnergyConsumedKWh} kWh consumidos
          </div>
        </div>

        {/* Charging Cost */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Coste Carga Ruta</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-amber-300">
            {result.totalCostEur.toFixed(2)} €
          </div>
          <div className="text-[10px] text-slate-500">
            +{result.totalEnergyChargedKWh} kWh recargados
          </div>
        </div>

        {/* Money Saved vs Petrol */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Fuel className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ahorro vs Gasolina</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-400">
            +{result.moneySavedEur.toFixed(2)} €
          </div>
          <div className="text-[10px] text-slate-500">
            vs {result.iceFuelCostEur.toFixed(2)} € (combustión)
          </div>
        </div>

        {/* CO2 Emissions Saved */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Leaf className="w-3.5 h-3.5 text-teal-400" />
            <span>CO2 Evitado</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-teal-300">
            {result.co2SavedKg} kg
          </div>
          <div className="text-[10px] text-slate-500">
            Emisiones netas ahorradas
          </div>
        </div>
      </div>
    </div>
  );
};
