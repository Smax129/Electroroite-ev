import React from 'react';
import { RouteDefinition } from '../types';
import { PRESET_ROUTES } from '../data/routes';
import { Navigation2, ArrowRightLeft, Sparkles, MapPin } from 'lucide-react';

interface RouteSelectorProps {
  currentRoute: RouteDefinition;
  onSelectRoute: (route: RouteDefinition) => void;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  currentRoute,
  onSelectRoute,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Navigation2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs sm:text-sm font-bold text-white">
            Corredores y Rutas Rápidas
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Desnivel real modelado punto a punto
        </span>
      </div>

      {/* Preset pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {PRESET_ROUTES.map((route) => {
          const isSelected = currentRoute.id === route.id;
          return (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`text-left p-2.5 rounded-xl border transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="font-bold text-xs truncate">
                {route.name}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{route.distanceKm} km</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}>
                  {isSelected ? 'Activa' : 'Seleccionar'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
