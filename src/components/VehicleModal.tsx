import React, { useState } from 'react';
import { Vehicle } from '../types';
import { POPULAR_VEHICLES } from '../data/vehicles';
import { 
  X, 
  Car, 
  Zap, 
  Battery, 
  Gauge, 
  Check, 
  Plus, 
  Sliders 
} from 'lucide-react';

interface VehicleModalProps {
  currentVehicle: Vehicle;
  onSelectVehicle: (v: Vehicle) => void;
  onClose: () => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  currentVehicle,
  onSelectVehicle,
  onClose,
}) => {
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customBrand, setCustomBrand] = useState('Mi Vehículo');
  const [customModel, setCustomModel] = useState('EV Custom');
  const [customBattery, setCustomBattery] = useState(70);
  const [customBaseConsumption, setCustomBaseConsumption] = useState(170);
  const [customMaxPower, setCustomMaxPower] = useState(150);
  const [customWeight, setCustomWeight] = useState(1900);

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const newVehicle: Vehicle = {
      id: `custom-${Date.now()}`,
      brand: customBrand || 'Vehículo',
      model: customModel || 'Custom',
      version: `${customBattery} kWh`,
      batteryCapacityKWh: customBattery,
      baseConsumptionWhKm: customBaseConsumption,
      maxDCSpeedKW: customMaxPower,
      chargingCurveType: customMaxPower >= 220 ? 'flat-800v' : 'standard-ccs',
      weightKg: customWeight,
      dragCoefficientCd: 0.25,
      frontalAreaM2: 2.4,
    };
    onSelectVehicle(newVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-white max-h-[90vh] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  Seleccionar Vehículo Eléctrico
                </h3>
                <p className="text-xs text-slate-400">
                  Especificaciones reales de batería, aerodinámica y curva de carga
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setIsCustomMode(false)}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                !isCustomMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Modelos Predefinidos ({POPULAR_VEHICLES.length})
            </button>
            <button
              onClick={() => setIsCustomMode(true)}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                isCustomMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Vehículo Personalizado</span>
            </button>
          </div>

          {/* List of preset cars */}
          {!isCustomMode ? (
            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {POPULAR_VEHICLES.map((v) => {
                const isSelected = currentVehicle.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      onSelectVehicle(v);
                      onClose();
                    }}
                    className={`w-full text-left p-3 sm:p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                        {v.batteryCapacityKWh}
                        <span className="text-[9px] font-normal block text-slate-400">kWh</span>
                      </div>

                      <div>
                        <div className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                          <span>{v.brand} {v.model}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                              Activo
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {v.version}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="text-cyan-300 font-semibold">⚡ Hasta {v.maxDCSpeedKW} kW</span>
                          <span>•</span>
                          <span>{(v.baseConsumptionWhKm / 10).toFixed(1)} kWh/100km</span>
                          <span>•</span>
                          <span>{v.weightKg} kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border border-slate-700" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Custom Car Form */
            <form onSubmit={handleSaveCustom} className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Marca</label>
                  <input
                    type="text"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ej. Polestar"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Modelo</label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ej. Polestar 2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Batería Útil (kWh): <strong className="text-emerald-400">{customBattery} kWh</strong>
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="150"
                    value={customBattery}
                    onChange={(e) => setCustomBattery(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Potencia Máx DC: <strong className="text-cyan-400">{customMaxPower} kW</strong>
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="350"
                    value={customMaxPower}
                    onChange={(e) => setCustomMaxPower(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Consumo Base a 100km/h: <strong className="text-amber-400">{customBaseConsumption} Wh/km</strong>
                  </label>
                  <input
                    type="number"
                    min="120"
                    max="300"
                    value={customBaseConsumption}
                    onChange={(e) => setCustomBaseConsumption(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Peso en vacío (kg): <strong className="text-slate-300">{customWeight} kg</strong>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="3000"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition"
              >
                Guardar y Activar Vehículo
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
