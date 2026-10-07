import React from 'react';
import { ChargingNetwork } from '../types';
import { Zap, Check, Filter, Layers } from 'lucide-react';

export const ALL_NETWORKS: Array<{
  id: ChargingNetwork;
  name: string;
  badgeColor: string;
  dotColor: string;
  powerText: string;
}> = [
  {
    id: 'Tesla Supercharger',
    name: 'Tesla Supercharger',
    badgeColor: 'border-rose-500/50 bg-rose-500/10 text-rose-300',
    dotColor: 'bg-rose-500',
    powerText: 'Hasta 250 kW',
  },
  {
    id: 'Ionity',
    name: 'Ionity',
    badgeColor: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300',
    dotColor: 'bg-cyan-400',
    powerText: 'Hasta 350 kW',
  },
  {
    id: 'Iberdrola',
    name: 'Iberdrola',
    badgeColor: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
    dotColor: 'bg-emerald-500',
    powerText: 'Hasta 350 kW',
  },
  {
    id: 'Zunder',
    name: 'Zunder',
    badgeColor: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
    dotColor: 'bg-amber-500',
    powerText: 'Hasta 360 kW',
  },
  {
    id: 'Electra',
    name: 'Electra',
    badgeColor: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300',
    dotColor: 'bg-indigo-500',
    powerText: 'Hasta 400 kW',
  },
  {
    id: 'Endesa X Way',
    name: 'Endesa X Way',
    badgeColor: 'border-sky-500/50 bg-sky-500/10 text-sky-300',
    dotColor: 'bg-sky-400',
    powerText: 'Hasta 150 kW',
  },
  {
    id: 'Repsol',
    name: 'Repsol',
    badgeColor: 'border-orange-500/50 bg-orange-500/10 text-orange-300',
    dotColor: 'bg-orange-500',
    powerText: 'Hasta 180 kW',
  },
  {
    id: 'Fastned',
    name: 'Fastned',
    badgeColor: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
    dotColor: 'bg-yellow-400',
    powerText: 'Hasta 300 kW',
  },
  {
    id: 'TotalEnergies',
    name: 'TotalEnergies',
    badgeColor: 'border-red-500/50 bg-red-500/10 text-red-300',
    dotColor: 'bg-red-500',
    powerText: 'Hasta 300 kW',
  },
  {
    id: 'Wenea',
    name: 'Wenea',
    badgeColor: 'border-teal-500/50 bg-teal-500/10 text-teal-300',
    dotColor: 'bg-teal-400',
    powerText: 'Hasta 200 kW',
  },
];

interface NetworkFilterProps {
  selectedNetworks: ChargingNetwork[];
  onToggleNetwork: (network: ChargingNetwork) => void;
  onSelectAll: () => void;
  onSelectPresets: (networks: ChargingNetwork[]) => void;
}

export const NetworkFilter: React.FC<NetworkFilterProps> = ({
  selectedNetworks,
  onToggleNetwork,
  onSelectAll,
  onSelectPresets,
}) => {
  const isAllSelected = selectedNetworks.length === 0 || selectedNetworks.length === ALL_NETWORKS.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3">
      {/* Header and Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-white">
              Filtrar por Red de Carga
            </h4>
            <p className="text-[11px] text-slate-400">
              Solo se recomendarán paradas en las redes que selecciones
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={onSelectAll}
            className={`px-2.5 py-1 rounded-lg font-bold border transition ${
              isAllSelected
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Todas las redes
          </button>

          <button
            onClick={() => onSelectPresets(['Tesla Supercharger', 'Ionity'])}
            className={`px-2.5 py-1 rounded-lg font-bold border transition ${
              selectedNetworks.length === 2 &&
              selectedNetworks.includes('Tesla Supercharger') &&
              selectedNetworks.includes('Ionity')
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Tesla + Ionity
          </button>

          <button
            onClick={() => onSelectPresets(['Tesla Supercharger'])}
            className={`px-2.5 py-1 rounded-lg font-bold border transition ${
              selectedNetworks.length === 1 && selectedNetworks.includes('Tesla Supercharger')
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Solo Tesla
          </button>

          <button
            onClick={() => onSelectPresets(['Ionity', 'Electra', 'Zunder', 'Iberdrola'])}
            className={`px-2.5 py-1 rounded-lg font-bold border transition ${
              selectedNetworks.includes('Ionity') && selectedNetworks.includes('Zunder') && !selectedNetworks.includes('Tesla Supercharger')
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Hubs 350kW+
          </button>
        </div>
      </div>

      {/* Network Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {ALL_NETWORKS.map((net) => {
          const isSelected = isAllSelected || selectedNetworks.includes(net.id);

          return (
            <button
              key={net.id}
              onClick={() => onToggleNetwork(net.id)}
              className={`p-2 rounded-xl border text-left transition flex items-center justify-between gap-1.5 ${
                isSelected
                  ? `${net.badgeColor} shadow-sm shadow-slate-900`
                  : 'bg-slate-800/40 border-slate-800 text-slate-500 hover:border-slate-700 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? net.dotColor : 'bg-slate-600'}`} />
                <div className="truncate">
                  <div className="font-extrabold text-xs truncate">
                    {net.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {net.powerText}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {isSelected ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!isAllSelected && selectedNetworks.length > 0 && (
        <div className="text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 rounded-xl px-3 py-1.5 flex items-center justify-between">
          <span>
            ⚡ Filtro activo: Paradas limitadas a <strong>{selectedNetworks.join(', ')}</strong>
          </span>
          <button
            onClick={onSelectAll}
            className="text-xs text-slate-300 hover:text-white underline font-semibold ml-2"
          >
            Quitar filtro
          </button>
        </div>
      )}
    </div>
  );
};
