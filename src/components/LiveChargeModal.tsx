import React, { useState, useEffect } from 'react';
import { RouteStop, Vehicle } from '../types';
import { notificationService } from '../services/notificationService';
import { getEffectiveChargingPowerKW } from '../services/physicsCalculator';
import { 
  Zap, 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  BellRing, 
  FastForward,
  Gauge,
  Clock,
  Sparkles
} from 'lucide-react';

interface LiveChargeModalProps {
  stop: RouteStop;
  vehicle: Vehicle;
  onClose: () => void;
  onChargeCompleted: () => void;
}

export const LiveChargeModal: React.FC<LiveChargeModalProps> = ({
  stop,
  vehicle,
  onClose,
  onChargeCompleted,
}) => {
  const [currentSoC, setCurrentSoC] = useState<number>(stop.arrivalSoCPercent);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(5); // 5x speed default
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [notificationDispatched, setNotificationDispatched] = useState<boolean>(false);

  const targetSoC = stop.targetSoCPercent;
  const currentPowerKW = getEffectiveChargingPowerKW(currentSoC, vehicle, stop.charger.maxPowerKW);

  // Time remaining calculation based on current SoC to target SoC
  const percentRemaining = Math.max(0, targetSoC - currentSoC);
  const estMinutesRemaining = Math.round((percentRemaining / Math.max(1, targetSoC - stop.arrivalSoCPercent)) * stop.chargingTimeMinutes);

  useEffect(() => {
    if (!isPlaying || isCompleted) return;

    const interval = setInterval(() => {
      setCurrentSoC((prev) => {
        if (prev >= targetSoC) {
          setIsCompleted(true);
          setIsPlaying(false);
          return targetSoC;
        }
        // Increment step based on speed multiplier
        const next = Math.min(targetSoC, prev + 0.5 * (speedMultiplier / 2));
        return Math.round(next * 10) / 10;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, isCompleted, targetSoC, speedMultiplier]);

  // When target is reached, trigger Push Notification & Audio Chime
  useEffect(() => {
    if (isCompleted && !notificationDispatched) {
      setNotificationDispatched(true);

      notificationService.sendNotification(
        `⚡ ¡Batería al ${targetSoC}% alcanzada!`,
        {
          body: `Carga óptima completada en ${stop.charger.name}. Ya dispones de energía suficiente para llegar a la siguiente etapa con seguridad. Reanuda la marcha.`,
          tag: 'ev-charge-optimal',
        }
      );
    }
  }, [isCompleted, notificationDispatched, targetSoC, stop.charger.name]);

  const handleReset = () => {
    setCurrentSoC(stop.arrivalSoCPercent);
    setIsCompleted(false);
    setIsPlaying(true);
    setNotificationDispatched(false);
  };

  const handleInstantComplete = () => {
    setCurrentSoC(targetSoC);
    setIsCompleted(true);
    setIsPlaying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-white overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Simulador de Carga en Vivo
              </h3>
              <p className="text-xs text-slate-400">
                {stop.charger.name} ({stop.charger.maxPowerKW} kW)
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

        {/* Battery Ring & Status */}
        <div className="my-6 flex flex-col items-center justify-center relative z-10">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#batteryGrad)"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * currentSoC) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="batteryGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tracking-tight text-white">
                {Math.round(currentSoC)}%
              </span>
              <span className="text-xs text-slate-400 font-medium mt-0.5">
                Objetivo: {targetSoC}%
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                isCompleted 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-cyan-500/20 text-cyan-400 animate-pulse'
              }`}>
                {isCompleted ? '¡Carga Óptima!' : 'Cargando...'}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
          {/* Current Power */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Potencia Actual</span>
            </div>
            <div className="text-xl font-black text-cyan-300">
              {isCompleted ? '0' : currentPowerKW} <span className="text-xs font-normal text-slate-400">kW</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Curva real {vehicle.model}
            </div>
          </div>

          {/* Time Remaining */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tiempo Restante</span>
            </div>
            <div className="text-xl font-black text-emerald-400">
              {isCompleted ? '0' : estMinutesRemaining} <span className="text-xs font-normal text-slate-400">min</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Total parada: {stop.chargingTimeMinutes} min
            </div>
          </div>
        </div>

        {/* Alert Banner when Target Reached */}
        {isCompleted && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-start gap-3 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                ¡Momento Óptimo para Reanudar Marcha!
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Has alcanzado el <strong>{targetSoC}%</strong>. La velocidad de carga empezará a decaer fuertemente. Ya tienes autonomía de sobra para llegar al siguiente destino con tu margen de seguridad.
              </p>
            </div>
          </div>
        )}

        {/* Simulation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 relative z-10">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={isCompleted}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition"
              title={isPlaying ? 'Pausar' : 'Reanudar'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Reiniciar carga"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed toggle */}
            <button
              onClick={() => setSpeedMultiplier((prev) => (prev === 2 ? 8 : prev === 8 ? 20 : 2))}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 flex items-center gap-1 transition"
              title="Velocidad de simulación"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{speedMultiplier}x</span>
            </button>

            <button
              onClick={handleInstantComplete}
              disabled={isCompleted}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-400 hover:text-white text-xs transition"
            >
              Completar ya
            </button>
          </div>

          <button
            onClick={() => {
              onChargeCompleted();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Reanudar Viaje</span>
          </button>
        </div>
      </div>
    </div>
  );
};
