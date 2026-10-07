import React, { useState } from 'react';
import { RouteStop } from '../types';
import { Mountain, BatteryCharging, Zap } from 'lucide-react';

interface ElevationSoCChartProps {
  profile: {
    distanceKm: number;
    elevationM: number;
    socPercent: number;
  }[];
  stops: RouteStop[];
  totalDistanceKm: number;
}

export const ElevationSoCChart: React.FC<ElevationSoCChartProps> = ({
  profile,
  stops,
  totalDistanceKm,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!profile || profile.length < 2) return null;

  // Find min and max for scaling
  const maxElev = Math.max(...profile.map(p => p.elevationM), 500);
  const minElev = Math.min(...profile.map(p => p.elevationM), 0);
  const elevRange = Math.max(100, maxElev - minElev);

  const svgWidth = 800;
  const svgHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Scale functions
  const scaleX = (km: number) => padding.left + (km / totalDistanceKm) * plotWidth;
  const scaleElevY = (elev: number) =>
    padding.top + plotHeight - ((elev - minElev) / elevRange) * (plotHeight * 0.7);
  const scaleSocY = (soc: number) =>
    padding.top + plotHeight - (soc / 100) * plotHeight;

  // Generate SVG Path for Elevation Area
  let elevPath = `M ${scaleX(profile[0].distanceKm)} ${padding.top + plotHeight}`;
  profile.forEach(p => {
    elevPath += ` L ${scaleX(p.distanceKm)} ${scaleElevY(p.elevationM)}`;
  });
  elevPath += ` L ${scaleX(profile[profile.length - 1].distanceKm)} ${padding.top + plotHeight} Z`;

  // Generate SVG Path for SoC Curve
  let socPath = `M ${scaleX(profile[0].distanceKm)} ${scaleSocY(profile[0].socPercent)}`;
  profile.forEach(p => {
    socPath += ` L ${scaleX(p.distanceKm)} ${scaleSocY(p.socPercent)}`;
  });

  const activePoint = hoverIndex !== null ? profile[hoverIndex] : null;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Mountain className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-white">
            Perfil de Desnivel y Batería (SoC)
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-slate-700 border border-slate-600 inline-block" />
            <span>Desnivel (m)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-3.5 h-1 rounded-full bg-emerald-400 inline-block shadow shadow-emerald-500/50" />
            <span>Batería (%)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * svgWidth - padding.left;
            const fraction = Math.max(0, Math.min(1, relX / plotWidth));
            const targetKm = fraction * totalDistanceKm;

            // Find closest profile point
            let closestIdx = 0;
            let closestDiff = 99999;
            profile.forEach((p, idx) => {
              const diff = Math.abs(p.distanceKm - targetKm);
              if (diff < closestDiff) {
                closestDiff = diff;
                closestIdx = idx;
              }
            });
            setHoverIndex(closestIdx);
          }}
          onMouseLeave={() => setHoverIndex(null)}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((touch.clientX - rect.left) / rect.width) * svgWidth - padding.left;
            const fraction = Math.max(0, Math.min(1, relX / plotWidth));
            const targetKm = fraction * totalDistanceKm;
            let closestIdx = 0;
            let closestDiff = 99999;
            profile.forEach((p, idx) => {
              const diff = Math.abs(p.distanceKm - targetKm);
              if (diff < closestDiff) {
                closestDiff = diff;
                closestIdx = idx;
              }
            });
            setHoverIndex(closestIdx);
          }}
        >
          <defs>
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="socGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(soc => (
            <g key={soc}>
              <line
                x1={padding.left}
                y1={scaleSocY(soc)}
                x2={padding.left + plotWidth}
                y2={scaleSocY(soc)}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={scaleSocY(soc) + 3}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
              >
                {soc}%
              </text>
            </g>
          ))}

          {/* Elevation Area */}
          <path d={elevPath} fill="url(#elevGradient)" stroke="#475569" strokeWidth="1.5" />

          {/* Battery SoC Curve */}
          <path
            d={socPath}
            fill="none"
            stroke="url(#socGlow)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowFilter)"
          />

          {/* Planned Stops markers on chart */}
          {stops.map((stop, i) => {
            const x = scaleX(stop.distanceFromStartKm);
            return (
              <g key={stop.id}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + plotHeight}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle cx={x} cy={scaleSocY(stop.arrivalSoCPercent)} r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={x} cy={scaleSocY(stop.targetSoCPercent)} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                <rect
                  x={x - 22}
                  y={padding.top - 6}
                  width="44"
                  height="16"
                  rx="4"
                  fill="#022c22"
                  stroke="#059669"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + 6}
                  fill="#6ee7b7"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  +{stop.chargingTimeMinutes}m
                </text>
              </g>
            );
          })}

          {/* Distance Axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const dist = Math.round(ratio * totalDistanceKm);
            const x = scaleX(dist);
            return (
              <text
                key={ratio}
                x={x}
                y={padding.top + plotHeight + 18}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
              >
                {dist} km
              </text>
            );
          })}

          {/* Hover Crosshair */}
          {activePoint && (
            <g>
              <line
                x1={scaleX(activePoint.distanceKm)}
                y1={padding.top}
                x2={scaleX(activePoint.distanceKm)}
                y2={padding.top + plotHeight}
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <circle
                cx={scaleX(activePoint.distanceKm)}
                cy={scaleSocY(activePoint.socPercent)}
                r="6"
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Popup */}
        {activePoint && (
          <div
            className="absolute top-2 pointer-events-none bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs shadow-2xl backdrop-blur-md flex items-center gap-3 z-30"
            style={{
              left: `${Math.min(75, Math.max(15, (activePoint.distanceKm / totalDistanceKm) * 100))}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div>
              <span className="text-slate-400">Km:</span>{' '}
              <strong className="text-white">{activePoint.distanceKm}</strong>
            </div>
            <div>
              <span className="text-slate-400">Altitud:</span>{' '}
              <strong className="text-amber-300">{activePoint.elevationM} m</strong>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              <strong className="text-emerald-400">{activePoint.socPercent}%</strong>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>Altitud máx: <strong className="text-slate-200">{maxElev} m</strong> (impacto directo en el consumo por gravedad m·g·Δh)</span>
        <span>Regeneración en bajadas: <strong className="text-emerald-400">~78% recuperada</strong></span>
      </div>
    </div>
  );
};
