import React from 'react';
import { Vehicle } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { notificationService } from '../services/notificationService';
import { 
  Zap, 
  Car, 
  Bell, 
  BellRing, 
  Download, 
  SlidersHorizontal,
  Navigation
} from 'lucide-react';

interface NavbarProps {
  vehicle: Vehicle;
  onOpenVehicleModal: () => void;
  onOpenConfigDrawer: () => void;
  notificationEnabled: boolean;
  onToggleNotification: () => void;
  selectedRouteName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  vehicle,
  onOpenVehicleModal,
  onOpenConfigDrawer,
  notificationEnabled,
  onToggleNotification,
  selectedRouteName,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = React.useState(false);

  const handleNotificationClick = async () => {
    if (!notificationEnabled) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        onToggleNotification();
        notificationService.sendNotification('ElectroRoute Notificaciones Activas', {
          body: 'Te avisaremos cuando tu coche alcance el porcentaje de carga óptimo para reanudar la marcha.',
        });
      }
    } else {
      onToggleNotification();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-base sm:text-lg bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                ElectroRoute
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ABRP EV
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs">
              {selectedRouteName}
            </p>
          </div>
        </div>

        {/* Center / Vehicle selector button */}
        <button
          onClick={onOpenVehicleModal}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 transition-all text-xs sm:text-sm group"
          title="Cambiar o configurar vehículo"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition">
            <Car className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="font-medium text-slate-200 group-hover:text-white flex items-center gap-1">
              <span className="truncate max-w-[100px] sm:max-w-[140px]">{vehicle.brand} {vehicle.model}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">{vehicle.batteryCapacityKWh} kWh</span>
            </div>
          </div>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Push notification toggle */}
          <button
            onClick={handleNotificationClick}
            className={`p-2 rounded-xl transition border text-xs flex items-center gap-1.5 ${
              notificationEnabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={notificationEnabled ? 'Notificaciones activas al terminar carga' : 'Activar avisos de carga óptima'}
          >
            {notificationEnabled ? (
              <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            <span className="hidden md:inline font-medium">
              {notificationEnabled ? 'Avisos ON' : 'Avisos'}
            </span>
          </button>

          {/* Config Drawer Toggle */}
          <button
            onClick={onOpenConfigDrawer}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition"
            title="Ajustar variables de viaje (Velocidad, Temperatura, Desnivel, Batería)"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Parámetros</span>
          </button>

          {/* Android / PWA Install Button */}
          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/25 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          {isIOS && !isInstalled && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs hover:text-white"
              title="Instalar en iOS"
            >
              <Download className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </div>
      </div>

      {/* iOS Install Guidance Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              Instalar en iPhone / iPad
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Para usar ElectroRoute a pantalla completa como una app nativa:
            </p>
            <ol className="mt-2.5 space-y-1.5 text-xs text-slate-400 list-decimal list-inside">
              <li>Pulsa el botón <strong className="text-slate-200">Compartir</strong> en la barra de Safari.</li>
              <li>Baja y selecciona <strong className="text-slate-200">Añadir a pantalla de inicio</strong>.</li>
              <li>Abre ElectroRoute desde tu escritorio.</li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-bold text-slate-950 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
