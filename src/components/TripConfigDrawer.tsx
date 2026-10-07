import React from 'react';
import { TripSettings } from '../types';
import { getTemperatureMultiplier, getSpeedConsumptionMultiplier } from '../services/physicsCalculator';
import { DEFAULT_VEHICLE } from '../data/vehicles';
import { 
  X, 
  Battery, 
  Gauge, 
  Thermometer, 
  Weight, 
  Zap, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

interface TripConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TripSettings;
  onChangeSettings: (newSettings: TripSettings) => void;
}

export const TripConfigDrawer: React.FC<TripConfigDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
}) => {
  if (!isOpen) return null;

  const tempFactor = getTemperatureMultiplier(settings.ambientTempC);
  const tempPercentDiff = Math.round((tempFactor - 1.0) * 100);

  const speedFactor = getSpeedConsumptionMultiplier(settings.speedMultiplier, DEFAULT_VEHICLE);
  const speedPercentDiff = Math.round((speedFactor - 1.0) * 100);

  const handleResetDefaults = () => {
    onChangeSettings({
      initialSoCPercent: 90,
      minArrivalSoCPercent: 15,
      minChargerBufferSoCPercent: 10,
      speedMultiplier: 1.0,
      ambientTempC: 20,
      extraPayloadKg: 150,
      preferTeslaSuperchargers: false,
      minChargerPowerKW: 100,
      allowedNetworks: [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-5 sm:p-6 text-white flex flex-col justify-between shadow-2xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-lg text-white">
                Variables Físicas del Viaje
              </h3>
              <p className="text-xs text-slate-400">
                Modelo físico avanzado estilo ABRP
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 pt-5">
            {/* 1. Batería inicial */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-emerald-400" />
                  Batería al Salir
                </span>
                <span className="text-sm font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {settings.initialSoCPercent}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={settings.initialSoCPercent}
                onChange={(e) =>
                  onChangeSettings({ ...settings, initialSoCPercent: Number(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Recomendado en viajes largos: 90% o 100%
              </span>
            </div>

            {/* 2. Batería de llegada deseada */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-cyan-400" />
                  Batería Deseada en Destino
                </span>
                <span className="text-sm font-extrabold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  {settings.minArrivalSoCPercent}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={settings.minArrivalSoCPercent}
                onChange={(e) =>
                  onChangeSettings({ ...settings, minArrivalSoCPercent: Number(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Margen de seguridad para moverte al llegar a destino (10% - 20%)
              </span>
            </div>

            {/* 3. Batería de seguridad en cargadores */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-amber-400" />
                  Margen Mínimo en Cargadores
                </span>
                <span className="text-sm font-extrabold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {settings.minChargerBufferSoCPercent}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={settings.minChargerBufferSoCPercent}
                onChange={(e) =>
                  onChangeSettings({ ...settings, minChargerBufferSoCPercent: Number(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Llegar a las paradas con al menos {settings.minChargerBufferSoCPercent}% de batería
              </span>
            </div>

            {/* 4. Velocidad de conducción */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-indigo-400" />
                  Velocidad de Crucero
                </span>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-indigo-300">
                    {Math.round(settings.speedMultiplier * 115)} km/h
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">
                    ({Math.round(settings.speedMultiplier * 100)}%)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.25"
                step="0.05"
                value={settings.speedMultiplier}
                onChange={(e) =>
                  onChangeSettings({ ...settings, speedMultiplier: Number(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Resistencia aerodinámica (v²):</span>
                <span className={`font-bold ${speedPercentDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {speedPercentDiff > 0 ? `+${speedPercentDiff}% consumo` : `${speedPercentDiff}% consumo`}
                </span>
              </div>
            </div>

            {/* 5. Temperatura Exterior */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-rose-400" />
                  Temperatura Exterior
                </span>
                <span className="text-sm font-extrabold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {settings.ambientTempC} °C
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="40"
                step="1"
                value={settings.ambientTempC}
                onChange={(e) =>
                  onChangeSettings({ ...settings, ambientTempC: Number(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  {settings.ambientTempC < 15
                    ? 'Calefacción de cabina y resistencia química fría'
                    : settings.ambientTempC > 28
                    ? 'Climatización AC y refrigeración de batería'
                    : 'Rango térmico óptimo (20-22°C)'}
                </span>
                <span className={`font-bold ${tempPercentDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {tempPercentDiff > 0 ? `+${tempPercentDiff}% energía` : '0% impacto'}
                </span>
              </div>
            </div>

            {/* 6. Pasajeros y equipaje */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Weight className="w-4 h-4 text-teal-400" />
                  Carga Extra (Pasajeros + Equipaje)
                </span>
                <span className="text-sm font-extrabold text-teal-300">
                  {settings.extraPayloadKg} kg
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="450"
                step="20"
                value={settings.extraPayloadKg}
                onChange={(e) =>
                  onChangeSettings({ ...settings, extraPayloadKg: Number(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Aumenta el esfuerzo en desniveles ascendentes
              </span>
            </div>

            {/* 7. Potencia mínima del cargador */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Potencia Mínima de Cargador Deseada
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 150].map((kw) => (
                  <button
                    key={kw}
                    onClick={() => onChangeSettings({ ...settings, minChargerPowerKW: kw })}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      settings.minChargerPowerKW === kw
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    ≥ {kw} kW
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer por defecto</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition"
          >
            Aplicar y Recalcular
          </button>
        </div>
      </div>
    </div>
  );
};
