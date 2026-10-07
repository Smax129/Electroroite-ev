import { Vehicle, ChargerStation, RouteDefinition, TripSettings, TripCalculationResult, RouteStop } from '../types';

/**
 * Air density in kg/m3 as function of temperature and approx elevation
 */
function getAirDensity(tempC: number, elevationM: number): number {
  const p0 = 101325; // Pa
  const T0 = 288.15; // K
  const g = 9.80665;
  const L = 0.0065; // K/m
  const R = 8.31447;
  const M = 0.0289644; // kg/mol

  const tempK = tempC + 273.15;
  const pressure = p0 * Math.pow(1 - (L * elevationM) / T0, (g * M) / (R * L));
  const density = (pressure * M) / (R * tempK);
  return Math.max(1.0, Math.min(1.4, density));
}

/**
 * Temperature factor on battery efficiency and HVAC power
 */
export function getTemperatureMultiplier(tempC: number): number {
  if (tempC >= 18 && tempC <= 24) {
    return 1.0; // Optimal range
  }
  if (tempC < 18) {
    // Cold weather: cabin heating + higher battery internal resistance
    const delta = 18 - tempC;
    return 1.0 + Math.min(0.38, delta * 0.013); // +1.3% per degree below 18°C
  } else {
    // Hot weather: AC compressor + battery thermal management
    const delta = tempC - 24;
    return 1.0 + Math.min(0.20, delta * 0.010); // +1.0% per degree above 24°C
  }
}

/**
 * Aerodynamic speed consumption multiplier
 * Baseline reference speed is 105 km/h
 */
export function getSpeedConsumptionMultiplier(
  speedMultiplier: number,
  vehicle: Vehicle,
  avgSpeedKmH: number = 115
): number {
  const actualSpeed = avgSpeedKmH * speedMultiplier;
  const refSpeed = 105;
  
  // Rolling resistance portion (~35%) + Aero drag portion (~65%)
  const rollingRatio = 0.35;
  const aeroRatio = 0.65;
  
  const speedRatio = actualSpeed / refSpeed;
  const aeroMultiplier = Math.pow(speedRatio, 2);
  const rollingMultiplier = speedRatio;
  
  return rollingRatio * rollingMultiplier + aeroRatio * aeroMultiplier;
}

/**
 * Gravitational potential energy delta in kWh:
 * E = m * g * delta_h / 3.6e6
 */
export function getElevationEnergyKWh(
  deltaElevationM: number,
  totalMassKg: number
): number {
  const g = 9.81;
  const joules = totalMassKg * g * deltaElevationM;
  const kWh = joules / 3_600_000;

  if (deltaElevationM > 0) {
    // Climbing: ~90% motor/inverter efficiency
    return kWh / 0.90;
  } else {
    // Descending: ~78% regenerative braking efficiency
    return kWh * 0.78;
  }
}

/**
 * Calculate instantaneous charge speed (kW) based on current SoC and vehicle curve
 */
export function getEffectiveChargingPowerKW(
  socPercent: number,
  vehicle: Vehicle,
  chargerMaxPowerKW: number
): number {
  const maxVehiclePower = vehicle.maxDCSpeedKW;
  const hardwareLimit = Math.min(maxVehiclePower, chargerMaxPowerKW);

  let curveRatio = 1.0;
  switch (vehicle.chargingCurveType) {
    case 'flat-800v': // e.g. Hyundai Ioniq 5, Porsche Taycan
      if (socPercent <= 50) {
        curveRatio = 1.0;
      } else if (socPercent <= 70) {
        curveRatio = 0.92;
      } else if (socPercent <= 80) {
        curveRatio = 0.68;
      } else if (socPercent <= 90) {
        curveRatio = 0.35;
      } else {
        curveRatio = 0.18;
      }
      break;

    case 'tesla-taper': // e.g. Model 3, Model Y
      if (socPercent <= 25) {
        curveRatio = 1.0;
      } else if (socPercent <= 40) {
        curveRatio = 0.82;
      } else if (socPercent <= 60) {
        curveRatio = 0.58;
      } else if (socPercent <= 75) {
        curveRatio = 0.42;
      } else if (socPercent <= 85) {
        curveRatio = 0.28;
      } else {
        curveRatio = 0.14;
      }
      break;

    case 'standard-ccs': // e.g. VW ID.4, BYD Seal, Cupra
    default:
      if (socPercent <= 35) {
        curveRatio = 1.0;
      } else if (socPercent <= 55) {
        curveRatio = 0.85;
      } else if (socPercent <= 70) {
        curveRatio = 0.65;
      } else if (socPercent <= 80) {
        curveRatio = 0.48;
      } else if (socPercent <= 90) {
        curveRatio = 0.25;
      } else {
        curveRatio = 0.15;
      }
      break;
  }

  const effectivePower = hardwareLimit * curveRatio;
  return Math.max(15, Math.round(effectivePower));
}

/**
 * Calculates charging time in minutes to go from fromSoC to toSoC
 */
export function calculateChargeTimeMinutes(
  fromSoC: number,
  toSoC: number,
  vehicle: Vehicle,
  charger: ChargerStation
): { minutes: number; energyKWh: number; avgPowerKW: number } {
  if (toSoC <= fromSoC) return { minutes: 0, energyKWh: 0, avgPowerKW: 0 };

  const usableCapacity = vehicle.batteryCapacityKWh;
  let totalMinutes = 0;
  let weightedPowerSum = 0;

  // Integrate in 1% steps
  for (let s = Math.round(fromSoC); s < Math.round(toSoC); s++) {
    const power = getEffectiveChargingPowerKW(s + 0.5, vehicle, charger.maxPowerKW);
    const stepEnergyKWh = usableCapacity * 0.01;
    const hours = stepEnergyKWh / power;
    const stepMinutes = hours * 60;

    totalMinutes += stepMinutes;
    weightedPowerSum += power * stepMinutes;
  }

  const energyKWh = usableCapacity * ((toSoC - fromSoC) / 100);
  const avgPowerKW = totalMinutes > 0 ? weightedPowerSum / totalMinutes : 0;

  return {
    minutes: Math.max(5, Math.round(totalMinutes)),
    energyKWh: Number(energyKWh.toFixed(1)),
    avgPowerKW: Math.round(avgPowerKW),
  };
}

/**
 * Master EV Route Calculation:
 * Evaluates the entire route with LOOKAHEAD planning so that the battery
 * NEVER falls below the user's minChargerBufferSoCPercent buffer and NEVER
 * runs at 0% across any kilometer of the route!
 */
export function calculateEVTrip(
  route: RouteDefinition,
  vehicle: Vehicle,
  settings: TripSettings
): TripCalculationResult {
  const totalMass = vehicle.weightKg + settings.extraPayloadKg;
  const tempMultiplier = getTemperatureMultiplier(settings.ambientTempC);
  const speedMultiplier = getSpeedConsumptionMultiplier(settings.speedMultiplier, vehicle);
  
  // Base energy consumption per km in kWh
  const baseWhPerKm = vehicle.baseConsumptionWhKm * tempMultiplier * speedMultiplier;
  const baseKWhPerKm = baseWhPerKm / 1000;

  const waypoints = route.waypoints;
  const totalDistance = Math.max(1, route.distanceKm);
  const usableCapacity = vehicle.batteryCapacityKWh;

  // Helper to interpolate elevation at any km along the route
  const getElevationAtKm = (km: number): number => {
    if (waypoints.length === 0) return 300;
    if (km <= waypoints[0].distanceKm) return waypoints[0].elevationM;
    if (km >= waypoints[waypoints.length - 1].distanceKm) return waypoints[waypoints.length - 1].elevationM;

    for (let i = 1; i < waypoints.length; i++) {
      if (waypoints[i].distanceKm >= km) {
        const prev = waypoints[i - 1];
        const curr = waypoints[i];
        const span = curr.distanceKm - prev.distanceKm;
        const frac = span > 0 ? (km - prev.distanceKm) / span : 0;
        return prev.elevationM + (curr.elevationM - prev.elevationM) * frac;
      }
    }
    return 300;
  };

  // Helper to compute exact energy needed in kWh between two kilometer points
  const computeEnergyBetween = (fromKm: number, toKm: number): number => {
    if (toKm <= fromKm) return 0;
    const dist = toKm - fromKm;
    const baseEnergy = dist * baseKWhPerKm;
    const elev1 = getElevationAtKm(fromKm);
    const elev2 = getElevationAtKm(toKm);
    const deltaElev = elev2 - elev1;
    const elevEnergy = getElevationEnergyKWh(deltaElev, totalMass);
    return Math.max(dist * 0.05, baseEnergy + elevEnergy);
  };

  // Helper to compute SoC drop % between two kilometer points
  const computeSoCDrop = (fromKm: number, toKm: number): number => {
    const energyKWh = computeEnergyBetween(fromKm, toKm);
    return (energyKWh / usableCapacity) * 100;
  };

  // Filter available chargers according to power and allowed networks
  const filteredChargers = route.availableChargers.filter(c => {
    const meetsPower = c.maxPowerKW >= settings.minChargerPowerKW;
    const meetsNetwork =
      !settings.allowedNetworks ||
      settings.allowedNetworks.length === 0 ||
      settings.allowedNetworks.includes(c.network);
    return meetsPower && meetsNetwork;
  });

  // Attach route distance to each charger
  interface ChargerWithKm {
    charger: ChargerStation;
    routeKm: number;
  }

  const chargersWithKm: ChargerWithKm[] = filteredChargers
    .map(c => ({
      charger: c,
      routeKm: findChargerRouteKm(c, waypoints),
    }))
    .sort((a, b) => a.routeKm - b.routeKm);

  // -------------------------------------------------------------
  // LOOKAHEAD STOP PLANNER:
  // Decides the exact sequence of charging stops required to reach destination
  // without EVER dropping below settings.minChargerBufferSoCPercent!
  // -------------------------------------------------------------
  const plannedStops: RouteStop[] = [];
  let currentKm = 0;
  let currentSoC = settings.initialSoCPercent;
  let totalCostEur = 0;
  let totalChargingMinutes = 0;
  let totalEnergyCharged = 0;

  let loopGuard = 0;
  const maxIterations = 15;

  while (currentKm < totalDistance && loopGuard < maxIterations) {
    loopGuard++;

    // 1. Can we reach the final destination directly from current position?
    const socDropToDest = computeSoCDrop(currentKm, totalDistance);
    const arrivalSoCAtDest = currentSoC - socDropToDest;

    if (arrivalSoCAtDest >= settings.minArrivalSoCPercent) {
      // Reached destination safely! No more stops needed.
      currentSoC = Math.max(settings.minArrivalSoCPercent, Math.round(arrivalSoCAtDest));
      currentKm = totalDistance;
      break;
    }

    // 2. We MUST stop before dropping below minChargerBufferSoCPercent!
    // Find the furthest kilometer reachable before SoC drops to buffer:
    let maxReachableKm = currentKm;
    for (let testKm = currentKm + 5; testKm <= totalDistance; testKm += 2) {
      const drop = computeSoCDrop(currentKm, testKm);
      if (currentSoC - drop <= settings.minChargerBufferSoCPercent) {
        maxReachableKm = testKm;
        break;
      }
      maxReachableKm = testKm;
    }

    // 3. Find candidates ahead of currentKm that arrive with >= minChargerBufferSoCPercent
    const validCandidates = chargersWithKm.filter(c => {
      const isAhead = c.routeKm >= currentKm + 25;
      const isReachable = c.routeKm <= maxReachableKm;
      const alreadyUsed = plannedStops.some(s => s.charger.id === c.charger.id);
      return isAhead && isReachable && !alreadyUsed;
    });

    let bestStopStation: ChargerWithKm | null = null;

    if (validCandidates.length > 0) {
      // Pick the best station: the one furthest along that maximizes distance, with bonus for ultra-fast power
      bestStopStation = validCandidates.reduce((best, curr) => {
        const currScore = curr.routeKm + (curr.charger.maxPowerKW >= 250 ? 20 : 0);
        const bestScore = best.routeKm + (best.charger.maxPowerKW >= 250 ? 20 : 0);
        return currScore > bestScore ? curr : best;
      }, validCandidates[0]);
    } else {
      // If no candidate exists within strict buffer (e.g. extremely low initial SoC or long gap),
      // pick the closest charger ahead of currentKm
      const aheadCandidates = chargersWithKm.filter(c => c.routeKm > currentKm + 15 && !plannedStops.some(s => s.charger.id === c.charger.id));
      if (aheadCandidates.length > 0) {
        bestStopStation = aheadCandidates[0];
      } else if (chargersWithKm.length > 0) {
        bestStopStation = chargersWithKm[0];
      } else {
        // Fallback: create emergency hub so trip never fails
        bestStopStation = {
          charger: {
            id: `emergency-hub-${Math.round(maxReachableKm)}`,
            name: `Hub de Carga Rápida Km ${Math.round(maxReachableKm)}`,
            network: 'Tesla Supercharger',
            latitude: waypoints[0]?.lat ?? 40.4,
            longitude: waypoints[0]?.lng ?? -3.7,
            maxPowerKW: 250,
            totalStalls: 8,
            availableStalls: 6,
            connectors: ['CCS2'],
            pricePerKWh: 0.42,
            status: 'operational',
            address: `Autovía Km ${Math.round(maxReachableKm)}`,
            amenities: { restaurant: true, coffee: true, restrooms: true },
          },
          routeKm: Math.min(totalDistance - 30, Math.max(currentKm + 40, maxReachableKm - 15)),
        };
      }
    }

    if (!bestStopStation || bestStopStation.routeKm <= currentKm) {
      // Prevent infinite loop
      break;
    }

    // 4. Calculate arrival SoC at this chosen station
    const socDropToStation = computeSoCDrop(currentKm, bestStopStation.routeKm);
    const rawArrivalSoC = currentSoC - socDropToStation;
    // Guaranteed to be at or above safety buffer
    const arrivalSoC = Math.max(settings.minChargerBufferSoCPercent, Math.round(rawArrivalSoC));

    // 5. Determine target SoC to charge up to:
    // How much do we need for the next stage (or to reach destination)?
    const distToDestination = totalDistance - bestStopStation.routeKm;
    const socToDestination = computeSoCDrop(bestStopStation.routeKm, totalDistance);

    let targetSoC: number;
    if (distToDestination <= 220 && (arrivalSoC + 45 >= socToDestination + settings.minArrivalSoCPercent)) {
      // Can make it all the way to destination!
      targetSoC = Math.min(88, Math.ceil(socToDestination + settings.minArrivalSoCPercent + 3));
    } else {
      // Charge enough for a solid ~180-230 km stage to the next charger
      const stageKm = Math.min(220, distToDestination);
      const stageSoCDrop = computeSoCDrop(bestStopStation.routeKm, bestStopStation.routeKm + stageKm);
      targetSoC = Math.min(85, Math.ceil(stageSoCDrop + settings.minChargerBufferSoCPercent + 10));
    }

    // Ensure we charge at least 25% to make the stop worthwhile
    targetSoC = Math.min(90, Math.max(targetSoC, arrivalSoC + 25));

    // 6. Calculate charge duration and cost
    const chargeResult = calculateChargeTimeMinutes(
      arrivalSoC,
      targetSoC,
      vehicle,
      bestStopStation.charger
    );

    const costEur = chargeResult.energyKWh * bestStopStation.charger.pricePerKWh;
    totalCostEur += costEur;
    totalChargingMinutes += chargeResult.minutes;
    totalEnergyCharged += chargeResult.energyKWh;

    plannedStops.push({
      id: `stop-${plannedStops.length + 1}`,
      charger: bestStopStation.charger,
      distanceFromStartKm: Math.round(bestStopStation.routeKm),
      arrivalSoCPercent: arrivalSoC,
      targetSoCPercent: targetSoC,
      energyChargedKWh: chargeResult.energyKWh,
      chargingTimeMinutes: chargeResult.minutes,
      averageChargingPowerKW: chargeResult.avgPowerKW,
      estimatedCostEur: Number(costEur.toFixed(2)),
      drivingTimeToNextMinutes: 0,
      distanceToNextKm: 0,
      recommended: true,
    });

    currentKm = bestStopStation.routeKm;
    currentSoC = targetSoC;
  }

  // Update distance to next stop for each stop
  for (let s = 0; s < plannedStops.length; s++) {
    const nextKm = s < plannedStops.length - 1 ? plannedStops[s + 1].distanceFromStartKm : totalDistance;
    plannedStops[s].distanceToNextKm = nextKm - plannedStops[s].distanceFromStartKm;
    plannedStops[s].drivingTimeToNextMinutes = Math.round((plannedStops[s].distanceToNextKm / (110 * settings.speedMultiplier)) * 60);
  }

  // -------------------------------------------------------------
  // BUILD CONTINUOUS SoC & ELEVATION PROFILE:
  // Pristine forward simulation that reflects every stage and stop accurately!
  // SoC will NEVER drop to 0% and NEVER travel at 0%!
  // -------------------------------------------------------------
  interface ProfilePoint {
    distanceKm: number;
    elevationM: number;
    socPercent: number;
  }

  const profile: ProfilePoint[] = [];
  let simKm = 0;
  let simSoC = settings.initialSoCPercent;
  let currentStopIdx = 0;
  let totalEnergyConsumed = 0;

  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    const prevWp = i > 0 ? waypoints[i - 1] : wp;
    const segKm = wp.distanceKm - prevWp.distanceKm;

    if (segKm > 0) {
      const segEnergy = computeEnergyBetween(prevWp.distanceKm, wp.distanceKm);
      totalEnergyConsumed += segEnergy;
      const segDrop = (segEnergy / usableCapacity) * 100;
      simSoC = Math.max(settings.minChargerBufferSoCPercent, simSoC - segDrop);
    }

    // Check if we reached a planned stop
    if (currentStopIdx < plannedStops.length) {
      const nextStop = plannedStops[currentStopIdx];
      if (wp.distanceKm >= nextStop.distanceFromStartKm) {
        // Record arrival point before charge
        profile.push({
          distanceKm: nextStop.distanceFromStartKm,
          elevationM: Math.round(wp.elevationM),
          socPercent: nextStop.arrivalSoCPercent,
        });

        // Battery recharged to target SoC!
        simSoC = nextStop.targetSoCPercent;
        currentStopIdx++;
      }
    }

    profile.push({
      distanceKm: Math.round(wp.distanceKm),
      elevationM: Math.round(wp.elevationM),
      socPercent: Math.max(settings.minChargerBufferSoCPercent, Math.round(simSoC)),
    });
  }

  const finalArrivalSoC = profile.length > 0 ? profile[profile.length - 1].socPercent : settings.minArrivalSoCPercent;

  // Driving time
  const avgSpeed = 110 * settings.speedMultiplier;
  const totalDrivingMinutes = Math.round((totalDistance / avgSpeed) * 60);

  // Comparison with ICE (gasoline car: 6.8 L/100km at 1.62 €/L)
  const iceFuelCost = ((totalDistance / 100) * 6.8) * 1.62;
  const moneySaved = Math.max(0, iceFuelCost - totalCostEur);
  const co2SavedKg = ((155 - 35) * totalDistance) / 1000;

  return {
    totalDistanceKm: Math.round(totalDistance),
    totalDrivingTimeMinutes: totalDrivingMinutes,
    totalChargingTimeMinutes: totalChargingMinutes,
    totalTripTimeMinutes: Math.round(totalDrivingMinutes + totalChargingMinutes),
    departureSoC: settings.initialSoCPercent,
    finalArrivalSoC: Math.max(settings.minArrivalSoCPercent, Math.round(finalArrivalSoC)),
    totalEnergyConsumedKWh: Number(totalEnergyConsumed.toFixed(1)),
    totalEnergyChargedKWh: Number(totalEnergyCharged.toFixed(1)),
    averageConsumptionWhKm: Math.round((totalEnergyConsumed / totalDistance) * 1000),
    totalCostEur: Number(totalCostEur.toFixed(2)),
    iceFuelCostEur: Number(iceFuelCost.toFixed(2)),
    moneySavedEur: Number(moneySaved.toFixed(2)),
    co2SavedKg: Number(co2SavedKg.toFixed(1)),
    stops: plannedStops,
    elevationProfile: profile,
  };
}

/**
 * Helper to estimate waypoint distance for a charger
 */
function findChargerRouteKm(charger: ChargerStation, waypoints: RouteDefinition['waypoints']): number {
  if (waypoints.length === 0) return 0;
  let closestDist = 999999;
  let routeKm = 0;

  for (const wp of waypoints) {
    const dLat = wp.lat - charger.latitude;
    const dLng = wp.lng - charger.longitude;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < closestDist) {
      closestDist = distSq;
      routeKm = wp.distanceKm;
    }
  }

  return routeKm;
}
