export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string;
  batteryCapacityKWh: number; // usable battery capacity
  baseConsumptionWhKm: number; // WLTP/Reference consumption at 100km/h at 20°C
  maxDCSpeedKW: number; // Peak charging speed
  chargingCurveType: 'flat-800v' | 'tesla-taper' | 'standard-ccs' | 'conservative';
  weightKg: number;
  dragCoefficientCd: number;
  frontalAreaM2: number;
  imageUrl?: string;
}

export type ChargingNetwork = 
  | 'Tesla Supercharger'
  | 'Ionity'
  | 'Iberdrola'
  | 'Endesa X Way'
  | 'Repsol'
  | 'Fastned'
  | 'TotalEnergies'
  | 'Electra'
  | 'Zunder'
  | 'BP Pulse'
  | 'Wenea'
  | 'Otro';

export interface ChargerStation {
  id: string;
  name: string;
  network: ChargingNetwork;
  latitude: number;
  longitude: number;
  maxPowerKW: number;
  totalStalls: number;
  availableStalls: number;
  connectors: ('CCS2' | 'Type2' | 'CHAdeMO')[];
  pricePerKWh: number; // in Euros
  status: 'operational' | 'busy' | 'partially_available';
  address: string;
  amenities: {
    restaurant?: boolean;
    coffee?: boolean;
    restrooms?: boolean;
    shop?: boolean;
    hotel?: boolean;
    wifi?: boolean;
  };
  openChargeMapId?: number;
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
  elevationM: number;
  distanceKm: number;
  name?: string;
}

export interface RouteStop {
  id: string;
  charger: ChargerStation;
  distanceFromStartKm: number;
  arrivalSoCPercent: number;
  targetSoCPercent: number;
  energyChargedKWh: number;
  chargingTimeMinutes: number;
  averageChargingPowerKW: number;
  estimatedCostEur: number;
  drivingTimeToNextMinutes: number;
  distanceToNextKm: number;
  recommended: boolean;
}

export interface TripSettings {
  initialSoCPercent: number; // e.g. 90%
  minArrivalSoCPercent: number; // Destination target e.g. 15%
  minChargerBufferSoCPercent: number; // Minimum buffer arriving at a charger e.g. 10%
  speedMultiplier: number; // 0.8 to 1.3 (e.g. 1.0 = 110-120km/h cruise)
  ambientTempC: number; // -10 to 40°C
  extraPayloadKg: number; // passengers + luggage
  preferTeslaSuperchargers: boolean;
  minChargerPowerKW: number; // e.g. 100 kW
  allowedNetworks: ChargingNetwork[]; // Filter for charging networks
}

export interface TripCalculationResult {
  totalDistanceKm: number;
  totalDrivingTimeMinutes: number;
  totalChargingTimeMinutes: number;
  totalTripTimeMinutes: number;
  departureSoC: number;
  finalArrivalSoC: number;
  totalEnergyConsumedKWh: number;
  totalEnergyChargedKWh: number;
  averageConsumptionWhKm: number;
  totalCostEur: number;
  iceFuelCostEur: number;
  moneySavedEur: number;
  co2SavedKg: number;
  stops: RouteStop[];
  elevationProfile: {
    distanceKm: number;
    elevationM: number;
    socPercent: number;
  }[];
}

export interface RouteDefinition {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  originCoords: [number, number];
  destCoords: [number, number];
  waypoints: RouteWaypoint[];
  availableChargers: ChargerStation[];
  intermediatePoints?: Array<{ name: string; lat: number; lng: number }>;
  routeType?: 'fastest' | 'eco' | 'alternative';
  tag?: string;
}

export interface RouteOption {
  id: string;
  title: string;
  subtitle: string;
  type: 'fastest' | 'eco' | 'alternative';
  route: RouteDefinition;
  estimatedTimeText: string;
  distanceKm: number;
  stopsCount: number;
  totalEnergyKWh: number;
}
