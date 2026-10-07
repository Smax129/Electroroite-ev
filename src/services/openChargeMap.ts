import { ChargerStation, ChargingNetwork } from '../types';
import { MAJOR_CHARGING_STATIONS } from '../data/chargers';

interface OCMResponseItem {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1?: string;
    Town?: string;
    Latitude: number;
    Longitude: number;
  };
  OperatorInfo?: {
    Title: string;
  };
  Connections?: Array<{
    ConnectionType?: { Title: string };
    PowerKW?: number;
    Quantity?: number;
  }>;
  StatusType?: {
    IsOperational?: boolean;
    Title?: string;
  };
  NumberOfPoints?: number;
}

export async function fetchOpenChargeMapChargers(
  lat: number,
  lng: number,
  radiusKm: number = 30
): Promise<ChargerStation[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lng}&distance=${radiusKm}&distanceunit=KM&maxresults=15&compact=true&verbose=false`;
    
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`OCM responded with ${res.status}`);
    }

    const data: OCMResponseItem[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return getLocalFallbackChargers(lat, lng, radiusKm);
    }

    return data.map((item): ChargerStation => {
      let network: ChargingNetwork = 'Otro';
      const opTitle = item.OperatorInfo?.Title || item.AddressInfo.Title;
      
      if (/Tesla/i.test(opTitle)) network = 'Tesla Supercharger';
      else if (/Ionity/i.test(opTitle)) network = 'Ionity';
      else if (/Iberdrola/i.test(opTitle)) network = 'Iberdrola';
      else if (/Endesa/i.test(opTitle)) network = 'Endesa X Way';
      else if (/Repsol/i.test(opTitle)) network = 'Repsol';
      else if (/Fastned/i.test(opTitle)) network = 'Fastned';
      else if (/Electra/i.test(opTitle)) network = 'Electra';
      else if (/Zunder/i.test(opTitle)) network = 'Zunder';
      else if (/Total/i.test(opTitle)) network = 'TotalEnergies';

      let maxPower = 50;
      const connectors: ('CCS2' | 'Type2' | 'CHAdeMO')[] = [];
      item.Connections?.forEach(c => {
        if (c.PowerKW && c.PowerKW > maxPower) maxPower = c.PowerKW;
        const cType = c.ConnectionType?.Title || '';
        if (/CCS|Combo/i.test(cType) && !connectors.includes('CCS2')) connectors.push('CCS2');
        if (/Type 2|Mennekes/i.test(cType) && !connectors.includes('Type2')) connectors.push('Type2');
        if (/CHAdeMO/i.test(cType) && !connectors.includes('CHAdeMO')) connectors.push('CHAdeMO');
      });

      if (connectors.length === 0) connectors.push('CCS2');

      const price = network === 'Tesla Supercharger' ? 0.42 : network === 'Ionity' ? 0.65 : 0.54;

      return {
        id: `ocm-${item.ID}`,
        name: item.AddressInfo.Title,
        network,
        latitude: item.AddressInfo.Latitude,
        longitude: item.AddressInfo.Longitude,
        maxPowerKW: Math.max(50, Math.round(maxPower)),
        totalStalls: item.NumberOfPoints || 4,
        availableStalls: Math.max(1, Math.floor((item.NumberOfPoints || 4) * 0.75)),
        connectors,
        pricePerKWh: price,
        status: item.StatusType?.IsOperational === false ? 'busy' : 'operational',
        address: [item.AddressInfo.AddressLine1, item.AddressInfo.Town].filter(Boolean).join(', ') || 'En ruta',
        amenities: {
          restaurant: true,
          coffee: true,
          restrooms: true,
          shop: true,
          wifi: true,
        },
        openChargeMapId: item.ID,
      };
    });
  } catch {
    return getLocalFallbackChargers(lat, lng, radiusKm);
  }
}

function getLocalFallbackChargers(lat: number, lng: number, radiusKm: number): ChargerStation[] {
  return MAJOR_CHARGING_STATIONS.filter(s => {
    const dLat = (s.latitude - lat) * 111;
    const dLng = (s.longitude - lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return dist <= radiusKm;
  });
}
