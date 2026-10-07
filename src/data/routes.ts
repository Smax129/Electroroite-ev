import { RouteDefinition } from '../types';
import { MAJOR_CHARGING_STATIONS } from './chargers';

export const PRESET_ROUTES: RouteDefinition[] = [
  {
    id: 'madrid-barcelona',
    name: 'Madrid → Barcelona (A-2 / AP-2)',
    origin: 'Madrid (Puerta del Sol)',
    destination: 'Barcelona (Plaça Catalunya)',
    distanceKm: 622,
    originCoords: [40.4168, -3.7038],
    destCoords: [41.3879, 2.1699],
    waypoints: [
      { lat: 40.4168, lng: -3.7038, elevationM: 655, distanceKm: 0, name: 'Madrid' },
      { lat: 40.4900, lng: -3.3700, elevationM: 590, distanceKm: 32, name: 'Alcalá de Henares' },
      { lat: 40.6300, lng: -3.1600, elevationM: 708, distanceKm: 58, name: 'Guadalajara' },
      { lat: 40.8900, lng: -2.7100, elevationM: 1040, distanceKm: 110, name: 'Torremocha del Campo' },
      { lat: 41.0400, lng: -2.4600, elevationM: 1210, distanceKm: 140, name: 'Puerto de Alcolea del Pinar (Pico)' },
      { lat: 41.2185, lng: -2.2685, elevationM: 850, distanceKm: 167, name: 'Arcos de Jalón (Ionity)' },
      { lat: 41.3120, lng: -2.0520, elevationM: 710, distanceKm: 197, name: 'Ariza (Tesla SC)' },
      { lat: 41.3540, lng: -1.6420, elevationM: 530, distanceKm: 236, name: 'Calatayud' },
      { lat: 41.4800, lng: -1.3300, elevationM: 360, distanceKm: 280, name: 'La Muela' },
      { lat: 41.6480, lng: -0.9850, elevationM: 200, distanceKm: 315, name: 'Zaragoza Plaza' },
      { lat: 41.5300, lng: -0.3200, elevationM: 260, distanceKm: 380, name: 'Bujaraloz (Monegros)' },
      { lat: 41.5200, lng: 0.3450, elevationM: 118, distanceKm: 440, name: 'Fraga (Iberdrola Hub)' },
      { lat: 41.6150, lng: 0.6220, elevationM: 155, distanceKm: 465, name: 'Lleida' },
      { lat: 41.6620, lng: 0.9320, elevationM: 280, distanceKm: 490, name: 'Vila-sana (Ionity)' },
      { lat: 41.6300, lng: 1.2500, elevationM: 420, distanceKm: 520, name: 'Tàrrega' },
      { lat: 41.5830, lng: 1.6150, elevationM: 315, distanceKm: 555, name: 'Igualada' },
      { lat: 41.5900, lng: 1.8300, elevationM: 490, distanceKm: 575, name: 'Coll del Bruc (Montserrat)' },
      { lat: 41.4900, lng: 2.0100, elevationM: 120, distanceKm: 605, name: 'Martorell' },
      { lat: 41.3879, lng: 2.1699, elevationM: 12, distanceKm: 622, name: 'Barcelona' },
    ],
    availableChargers: MAJOR_CHARGING_STATIONS.filter(c => 
      ['ionity-arcos-jalon', 'tesla-su-ariza', 'zunder-calatayud', 'tesla-su-zaragoza', 'endesa-zaragoza-imperial', 'iberdrola-fraga', 'electra-lleida', 'ionity-vilasana', 'repsol-igualada', 'tesla-su-sant-cugat'].includes(c.id)
    ),
  },
  {
    id: 'madrid-valencia',
    name: 'Madrid → Valencia (A-3)',
    origin: 'Madrid',
    destination: 'Valencia (Plaza del Ayuntamiento)',
    distanceKm: 356,
    originCoords: [40.4168, -3.7038],
    destCoords: [39.4699, -0.3763],
    waypoints: [
      { lat: 40.4168, lng: -3.7038, elevationM: 655, distanceKm: 0, name: 'Madrid' },
      { lat: 40.3000, lng: -3.4500, elevationM: 610, distanceKm: 28, name: 'Arganda del Rey' },
      { lat: 40.0150, lng: -3.0050, elevationM: 800, distanceKm: 82, name: 'Tarancón (Tesla SC)' },
      { lat: 39.8450, lng: -2.5020, elevationM: 875, distanceKm: 132, name: 'Villares del Saz (Iberdrola)' },
      { lat: 39.6700, lng: -2.2500, elevationM: 890, distanceKm: 165, name: 'Honrubia' },
      { lat: 39.5650, lng: -1.9120, elevationM: 735, distanceKm: 212, name: 'Motilla del Palancar (Zunder)' },
      { lat: 39.5200, lng: -1.5000, elevationM: 650, distanceKm: 245, name: 'Embalse de Contreras' },
      { lat: 39.4950, lng: -1.0950, elevationM: 700, distanceKm: 291, name: 'Requena (Ionity)' },
      { lat: 39.4800, lng: -0.9200, elevationM: 450, distanceKm: 310, name: 'Siete Aguas (Bajada)' },
      { lat: 39.4670, lng: -0.6650, elevationM: 130, distanceKm: 337, name: 'Chiva (Tesla SC)' },
      { lat: 39.4699, lng: -0.3763, elevationM: 15, distanceKm: 356, name: 'Valencia' },
    ],
    availableChargers: MAJOR_CHARGING_STATIONS.filter(c => 
      ['tesla-su-atarancan', 'iberdrola-villares', 'zunder-motilla', 'ionity-requena', 'tesla-su-chiva'].includes(c.id)
    ),
  },
  {
    id: 'madrid-sevilla',
    name: 'Madrid → Sevilla (A-4)',
    origin: 'Madrid',
    destination: 'Sevilla (Torre del Oro)',
    distanceKm: 538,
    originCoords: [40.4168, -3.7038],
    destCoords: [37.3891, -5.9845],
    waypoints: [
      { lat: 40.4168, lng: -3.7038, elevationM: 655, distanceKm: 0, name: 'Madrid' },
      { lat: 40.0300, lng: -3.6000, elevationM: 495, distanceKm: 48, name: 'Aranjuez' },
      { lat: 39.7500, lng: -3.4900, elevationM: 680, distanceKm: 85, name: 'Madridejos' },
      { lat: 38.9950, lng: -3.3750, elevationM: 654, distanceKm: 172, name: 'Manzanares (Tesla SC)' },
      { lat: 38.7600, lng: -3.3900, elevationM: 705, distanceKm: 200, name: 'Valdepeñas' },
      { lat: 38.5120, lng: -3.4980, elevationM: 802, distanceKm: 232, name: 'Almuradiel (Ionity)' },
      { lat: 38.3600, lng: -3.5500, elevationM: 810, distanceKm: 255, name: 'Paso de Despeñaperros (Pico)' },
      { lat: 38.0950, lng: -3.7750, elevationM: 350, distanceKm: 298, name: 'Bailén (Iberdrola Hub)' },
      { lat: 38.0300, lng: -4.0500, elevationM: 220, distanceKm: 325, name: 'Andújar' },
      { lat: 37.8920, lng: -4.7550, elevationM: 120, distanceKm: 400, name: 'Córdoba (Tesla SC)' },
      { lat: 37.5400, lng: -5.0800, elevationM: 100, distanceKm: 450, name: 'Écija' },
      { lat: 37.3800, lng: -5.7500, elevationM: 75, distanceKm: 515, name: 'Carmona' },
      { lat: 37.3891, lng: -5.9845, elevationM: 12, distanceKm: 538, name: 'Sevilla' },
    ],
    availableChargers: MAJOR_CHARGING_STATIONS.filter(c => 
      ['tesla-su-manzanares', 'ionity-almuradiel', 'iberdrola-bailen', 'tesla-su-cordoba'].includes(c.id)
    ),
  },
  {
    id: 'madrid-bilbao',
    name: 'Madrid → Bilbao (A-1 / AP-68)',
    origin: 'Madrid',
    destination: 'Bilbao (Guggenheim)',
    distanceKm: 398,
    originCoords: [40.4168, -3.7038],
    destCoords: [43.2630, -2.9350],
    waypoints: [
      { lat: 40.4168, lng: -3.7038, elevationM: 655, distanceKm: 0, name: 'Madrid' },
      { lat: 40.7500, lng: -3.6100, elevationM: 1020, distanceKm: 55, name: 'Buitrago del Lozoya' },
      { lat: 41.1100, lng: -3.5800, elevationM: 1440, distanceKm: 92, name: 'Puerto de Somosierra (1.440 m)' },
      { lat: 41.6680, lng: -3.6890, elevationM: 798, distanceKm: 153, name: 'Aranda de Duero (Tesla SC)' },
      { lat: 41.9500, lng: -3.7000, elevationM: 920, distanceKm: 190, name: 'Lerma' },
      { lat: 42.3680, lng: -3.6120, elevationM: 860, distanceKm: 245, name: 'Burgos (Ionity)' },
      { lat: 42.5400, lng: -3.2200, elevationM: 640, distanceKm: 285, name: 'Desfiladero de Pancorbo' },
      { lat: 42.6850, lng: -2.9420, elevationM: 475, distanceKm: 320, name: 'Miranda de Ebro (Zunder)' },
      { lat: 42.9800, lng: -2.9100, elevationM: 620, distanceKm: 360, name: 'Puerto de Altube' },
      { lat: 43.2630, lng: -2.9350, elevationM: 19, distanceKm: 398, name: 'Bilbao' },
    ],
    availableChargers: MAJOR_CHARGING_STATIONS.filter(c => 
      ['tesla-su-aranda', 'ionity-burgos', 'zunder-miranda'].includes(c.id)
    ),
  },
];

export const DEFAULT_ROUTE = PRESET_ROUTES[0];
