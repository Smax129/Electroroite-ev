import React, { useState, useMemo } from 'react';
import { Vehicle, RouteDefinition, TripSettings, ChargerStation, RouteStop, ChargingNetwork } from './types';
import { DEFAULT_VEHICLE } from './data/vehicles';
import { DEFAULT_ROUTE } from './data/routes';
import { calculateEVTrip } from './services/physicsCalculator';
import { notificationService } from './services/notificationService';

import { Navbar } from './components/Navbar';
import { CustomRoutePlanner } from './components/CustomRoutePlanner';
import { NetworkFilter } from './components/NetworkFilter';
import { MapComponent } from './components/MapComponent';
import { ElevationSoCChart } from './components/ElevationSoCChart';
import { RoutePlanSummary } from './components/RoutePlanSummary';
import { StopList } from './components/StopList';
import { TripConfigDrawer } from './components/TripConfigDrawer';
import { VehicleModal } from './components/VehicleModal';
import { ChargerDetailModal } from './components/ChargerDetailModal';
import { LiveChargeModal } from './components/LiveChargeModal';

import { 
  Zap, 
  Sparkles,
  Filter
} from 'lucide-react';

export default function App() {
  // Application State
  const [vehicle, setVehicle] = useState<Vehicle>(DEFAULT_VEHICLE);
  const [route, setRoute] = useState<RouteDefinition>(DEFAULT_ROUTE);

  // Available options for current calculated itinerary
  const [availableOptions, setAvailableOptions] = useState<RouteDefinition[]>([
    DEFAULT_ROUTE,
    {
      ...DEFAULT_ROUTE,
      id: `${DEFAULT_ROUTE.id}-eco`,
      name: 'Opción 2: Ruta Eco (Menor Desnivel)',
      routeType: 'eco',
      tag: 'Eco Ahorro',
      distanceKm: Math.round(DEFAULT_ROUTE.distanceKm * 1.04),
    },
    {
      ...DEFAULT_ROUTE,
      id: `${DEFAULT_ROUTE.id}-alt`,
      name: 'Opción 3: Ruta Alternativa',
      routeType: 'alternative',
      tag: 'Variante',
      distanceKm: Math.round(DEFAULT_ROUTE.distanceKm * 1.08),
    },
  ]);

  const [settings, setSettings] = useState<TripSettings>({
    initialSoCPercent: 90,
    minArrivalSoCPercent: 15,
    minChargerBufferSoCPercent: 10,
    speedMultiplier: 1.0,
    ambientTempC: 20,
    extraPayloadKg: 150,
    preferTeslaSuperchargers: false,
    minChargerPowerKW: 100,
    allowedNetworks: [], // Empty means all networks allowed
  });

  // Modals & Panels
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState<boolean>(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState<boolean>(false);
  const [selectedCharger, setSelectedCharger] = useState<ChargerStation | null>(null);
  const [liveChargeStop, setLiveChargeStop] = useState<RouteStop | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(
    notificationService.isPermissionGranted()
  );

  // Active view tab on mobile (Plan vs Map vs Elevation Profile)
  const [mobileTab, setMobileTab] = useState<'plan' | 'map' | 'profile'>('plan');

  // Master calculation memo
  const tripResult = useMemo(() => {
    return calculateEVTrip(route, vehicle, settings);
  }, [route, vehicle, settings]);

  const handleToggleNotification = async () => {
    if (!notificationEnabled) {
      const granted = await notificationService.requestPermission();
      setNotificationEnabled(granted);
    } else {
      setNotificationEnabled(false);
    }
  };

  // Network filtering handlers
  const handleToggleNetwork = (network: ChargingNetwork) => {
    setSettings((prev) => {
      const current = prev.allowedNetworks || [];
      if (current.includes(network)) {
        const next = current.filter((n) => n !== network);
        return { ...prev, allowedNetworks: next };
      } else {
        return { ...prev, allowedNetworks: [...current, network] };
      }
    });
  };

  const handleSelectAllNetworks = () => {
    setSettings((prev) => ({ ...prev, allowedNetworks: [] }));
  };

  const handleSelectPresetNetworks = (networks: ChargingNetwork[]) => {
    setSettings((prev) => ({ ...prev, allowedNetworks: networks }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        vehicle={vehicle}
        onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
        onOpenConfigDrawer={() => setIsConfigDrawerOpen(true)}
        notificationEnabled={notificationEnabled}
        onToggleNotification={handleToggleNotification}
        selectedRouteName={`${route.origin} → ${route.destination}`}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4 pb-20 sm:pb-6">
        {/* Custom Route Planner (Origin, Intermediate Stop, Destination, Options & Google Maps) */}
        <CustomRoutePlanner
          currentRoute={route}
          availableOptions={availableOptions}
          onSelectOption={(selected) => setRoute(selected)}
          onNewRouteCalculated={(newOptions) => setAvailableOptions(newOptions)}
          plannedStops={tripResult.stops}
        />

        {/* Charging Network Filter */}
        <NetworkFilter
          selectedNetworks={settings.allowedNetworks}
          onToggleNetwork={handleToggleNetwork}
          onSelectAll={handleSelectAllNetworks}
          onSelectPresets={handleSelectPresetNetworks}
        />

        {/* Mobile View Switcher (Tabs) */}
        <div className="flex sm:hidden bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMobileTab('plan')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mobileTab === 'plan' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Plan e Itinerario
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mobileTab === 'map' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Mapa de Red
          </button>
          <button
            onClick={() => setMobileTab('profile')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mobileTab === 'profile' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Desnivel y SoC
          </button>
        </div>

        {/* 2-Column Desktop Grid / Mobile Tab Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Summary, Elevation Profile & Itinerary */}
          <div className={`lg:col-span-7 space-y-4 ${
            mobileTab === 'map' ? 'hidden sm:block' : mobileTab === 'profile' ? 'hidden sm:block' : 'block'
          }`}>
            {/* ABRP Summary Card */}
            <RoutePlanSummary
              result={tripResult}
              vehicle={vehicle}
            />

            {/* Elevation and Battery SoC Synchronized Chart */}
            <div className="hidden sm:block">
              <ElevationSoCChart
                profile={tripResult.elevationProfile}
                stops={tripResult.stops}
                totalDistanceKm={tripResult.totalDistanceKm}
              />
            </div>

            {/* Step-by-Step Stop List & Chargers */}
            <StopList
              route={route}
              result={tripResult}
              onSelectCharger={(charger) => setSelectedCharger(charger)}
              onStartLiveCharge={(stop) => setLiveChargeStop(stop)}
            />
          </div>

          {/* Right Column: Interactive Map & Live Hubs */}
          <div className={`lg:col-span-5 space-y-4 ${
            mobileTab === 'plan' ? 'hidden sm:block' : mobileTab === 'profile' ? 'hidden sm:block' : 'block'
          }`}>
            {/* Interactive Leaflet Map with Google Maps Bridge */}
            <MapComponent
              route={route}
              allOptions={availableOptions}
              onSelectOption={(opt) => setRoute(opt)}
              plannedStops={tripResult.stops}
              onSelectCharger={(charger) => setSelectedCharger(charger)}
              onStartLiveCharge={(stop) => setLiveChargeStop(stop)}
            />

            {/* Physical Factors Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-xs space-y-2.5">
              <div className="flex items-center justify-between font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-white">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Factores y Filtros Aplicados
                </span>
                <button
                  onClick={() => setIsConfigDrawerOpen(true)}
                  className="text-emerald-400 hover:text-emerald-300 underline font-semibold"
                >
                  Modificar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span>🌡️ Temp: </span>
                  <strong className="text-white">{settings.ambientTempC}°C</strong>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span>⚡ Crucero: </span>
                  <strong className="text-white">{Math.round(settings.speedMultiplier * 115)} km/h</strong>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span>🔋 Salida: </span>
                  <strong className="text-white">{settings.initialSoCPercent}%</strong>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span>🔌 Redes: </span>
                  <strong className="text-emerald-400">
                    {settings.allowedNetworks.length === 0 ? 'Todas' : `${settings.allowedNetworks.length} elegidas`}
                  </strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                Cálculo basado en rozamiento aerodinámico (Cd {vehicle.dragCoefficientCd}), masa total ({vehicle.weightKg + settings.extraPayloadKg} kg) y potencia de carga no lineal.
              </div>
            </div>
          </div>

          {/* Mobile Profile Tab */}
          {mobileTab === 'profile' && (
            <div className="sm:hidden col-span-1 space-y-4">
              <ElevationSoCChart
                profile={tripResult.elevationProfile}
                stops={tripResult.stops}
                totalDistanceKm={tripResult.totalDistanceKm}
              />
            </div>
          )}
        </div>
      </main>

      {/* Configuration Drawer */}
      <TripConfigDrawer
        isOpen={isConfigDrawerOpen}
        onClose={() => setIsConfigDrawerOpen(false)}
        settings={settings}
        onChangeSettings={(newSettings) => setSettings(newSettings)}
      />

      {/* Vehicle Selector & Builder Modal */}
      {isVehicleModalOpen && (
        <VehicleModal
          currentVehicle={vehicle}
          onSelectVehicle={(v) => setVehicle(v)}
          onClose={() => setIsVehicleModalOpen(false)}
        />
      )}

      {/* Charger Details Modal */}
      {selectedCharger && (
        <ChargerDetailModal
          charger={selectedCharger}
          onClose={() => setSelectedCharger(null)}
        />
      )}

      {/* Live Charge Simulator & Push Notification HUD */}
      {liveChargeStop && (
        <LiveChargeModal
          stop={liveChargeStop}
          vehicle={vehicle}
          onClose={() => setLiveChargeStop(null)}
          onChargeCompleted={() => {}}
        />
      )}
    </div>
  );
}
