import React from 'react';
import { ChargerStation } from '../types';
import { 
  X, 
  Zap, 
  MapPin, 
  Navigation, 
  Coffee, 
  Utensils, 
  Wifi, 
  Hotel, 
  ShoppingBag, 
  CheckCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface ChargerDetailModalProps {
  charger: ChargerStation;
  onClose: () => void;
}

export const ChargerDetailModal: React.FC<ChargerDetailModalProps> = ({
  charger,
  onClose,
}) => {
  const openExternalNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${charger.latitude},${charger.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {charger.network}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Operativo
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-white">
              {charger.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 mb-4">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="line-clamp-2">{charger.address}</span>
        </div>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400 mb-0.5">Potencia Máx</div>
            <div className="text-lg font-black text-cyan-300">
              {charger.maxPowerKW} <span className="text-xs font-normal">kW</span>
            </div>
            <div className="text-[10px] text-slate-500">Ultra-rápido</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400 mb-0.5">Disponibles</div>
            <div className="text-lg font-black text-emerald-400">
              {charger.availableStalls}/{charger.totalStalls}
            </div>
            <div className="text-[10px] text-slate-500">Postes libres</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400 mb-0.5">Tarifa</div>
            <div className="text-lg font-black text-amber-300">
              {charger.pricePerKWh.toFixed(2)}€
            </div>
            <div className="text-[10px] text-slate-500">por kWh</div>
          </div>
        </div>

        {/* Connectors */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-slate-400 mb-2">Conectores Disponibles</h4>
          <div className="flex flex-wrap gap-2">
            {charger.connectors.map(c => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                {c === 'CCS2' ? 'CCS Combo 2' : c === 'Type2' ? 'Tipo 2 (Mennekes)' : 'CHAdeMO'}
              </span>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-slate-400 mb-2">Servicios en el área</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
            {charger.amenities.coffee && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-800">
                <Coffee className="w-4 h-4 text-amber-400" /> Cafetería
              </div>
            )}
            {charger.amenities.restaurant && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-800">
                <Utensils className="w-4 h-4 text-emerald-400" /> Restaurante
              </div>
            )}
            {charger.amenities.restrooms && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Aseos limpios
              </div>
            )}
            {charger.amenities.hotel && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-800">
                <Hotel className="w-4 h-4 text-indigo-400" /> Hotel
              </div>
            )}
            {charger.amenities.wifi && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-800">
                <Wifi className="w-4 h-4 text-cyan-400" /> Conexión WiFi
              </div>
            )}
            {charger.amenities.shop && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-800">
                <ShoppingBag className="w-4 h-4 text-rose-400" /> Tienda
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={openExternalNavigation}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
        >
          <ExternalLink className="w-4 h-4 text-emerald-400" />
          <span>Abrir ubicación en Navegador GPS</span>
        </button>
      </div>
    </div>
  );
};
