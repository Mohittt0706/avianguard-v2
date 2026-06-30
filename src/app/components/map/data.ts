import { Activity, Thermometer, TestTube, Gauge, Radio, Droplets, Battery } from 'lucide-react';
import type { WetlandStation, StationDataSource, MapViewport } from './types';

const now = Date.now();
const ago = (minutes: number) => new Date(now - minutes * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

function sr(
  label: string,
  value: number,
  unit: string,
  icon: typeof Activity,
  thresholds: { warning: number; critical: number; inverted?: boolean },
) {
  let status: 'normal' | 'warning' | 'critical' = 'normal';
  if (thresholds.inverted) {
    if (value <= thresholds.critical) status = 'critical';
    else if (value <= thresholds.warning) status = 'warning';
  } else {
    if (value >= thresholds.critical) status = 'critical';
    else if (value >= thresholds.warning) status = 'warning';
  }
  return { label, value, unit, icon, status };
}

export const initialViewport: MapViewport = {
  center: { lat: 22.81, lng: 72.04 },
  zoom: 13,
  bounds: { north: 22.88, south: 22.74, east: 72.14, west: 71.94 },
};

export const mockStations: WetlandStation[] = [
  {
    id: 'NS-01',
    name: 'Nal Sarovar North Inlet',
    coordinates: { lat: 22.835, lng: 72.018 },
    status: 'healthy',
    type: 'water-quality',
    district: 'Ahmedabad',
    taluka: 'Sanand',
    village: 'Nal Sarovar',
    lastUpdated: ago(2),
    battery: 88,
    signal: 94,
    online: true,
    alerts: 0,
    sensors: [
      sr('Temperature', 26.4, '°C', Thermometer, { warning: 30, critical: 35 }),
      sr('pH', 7.2, '', TestTube, { warning: 8.5, critical: 9.5 }),
      sr('TDS', 182, 'ppm', Activity, { warning: 300, critical: 400 }),
      sr('Dissolved O₂', 6.8, 'mg/L', Gauge, { warning: 4, critical: 2, inverted: true }),
      sr('Water Level', 3.2, 'm', Radio, { warning: 7, critical: 9 }),
      sr('Battery', 88, '%', Battery, { warning: 20, critical: 10, inverted: true }),
    ],
  },
  {
    id: 'NS-02',
    name: 'Nal Sarovar Main Basin',
    coordinates: { lat: 22.810, lng: 72.038 },
    status: 'warning',
    type: 'water-quality',
    district: 'Ahmedabad',
    taluka: 'Sanand',
    village: 'Nal Sarovar',
    lastUpdated: ago(1),
    battery: 72,
    signal: 86,
    online: true,
    alerts: 1,
    sensors: [
      sr('Temperature', 29.8, '°C', Thermometer, { warning: 30, critical: 35 }),
      sr('pH', 8.2, '', TestTube, { warning: 8.5, critical: 9.5 }),
      sr('TDS', 278, 'ppm', Activity, { warning: 300, critical: 400 }),
      sr('Dissolved O₂', 4.8, 'mg/L', Gauge, { warning: 4, critical: 2, inverted: true }),
      sr('Water Level', 4.1, 'm', Radio, { warning: 7, critical: 9 }),
      sr('Battery', 72, '%', Battery, { warning: 20, critical: 10, inverted: true }),
    ],
  },
  {
    id: 'NS-03',
    name: 'Nal Sarovar South Outflow',
    coordinates: { lat: 22.782, lng: 72.058 },
    status: 'healthy',
    type: 'water-quality',
    district: 'Ahmedabad',
    taluka: 'Sanand',
    village: 'Nal Sarovar',
    lastUpdated: ago(3),
    battery: 91,
    signal: 97,
    online: true,
    alerts: 0,
    sensors: [
      sr('Temperature', 25.1, '°C', Thermometer, { warning: 30, critical: 35 }),
      sr('pH', 7.0, '', TestTube, { warning: 8.5, critical: 9.5 }),
      sr('TDS', 156, 'ppm', Activity, { warning: 300, critical: 400 }),
      sr('Dissolved O₂', 7.2, 'mg/L', Gauge, { warning: 4, critical: 2, inverted: true }),
      sr('Water Level', 2.8, 'm', Radio, { warning: 7, critical: 9 }),
      sr('Battery', 91, '%', Battery, { warning: 20, critical: 10, inverted: true }),
    ],
  },
  {
    id: 'NS-04',
    name: 'Nal Sarovar East Shore',
    coordinates: { lat: 22.818, lng: 72.088 },
    status: 'critical',
    type: 'water-quality',
    district: 'Ahmedabad',
    taluka: 'Sanand',
    village: 'Nal Sarovar',
    lastUpdated: ago(0.5),
    battery: 34,
    signal: 58,
    online: true,
    alerts: 2,
    sensors: [
      sr('Temperature', 34.2, '°C', Thermometer, { warning: 30, critical: 35 }),
      sr('pH', 9.1, '', TestTube, { warning: 8.5, critical: 9.5 }),
      sr('TDS', 445, 'ppm', Activity, { warning: 300, critical: 400 }),
      sr('Dissolved O₂', 2.1, 'mg/L', Gauge, { warning: 4, critical: 2, inverted: true }),
      sr('Water Level', 5.8, 'm', Radio, { warning: 7, critical: 9 }),
      sr('Battery', 34, '%', Battery, { warning: 20, critical: 10, inverted: true }),
    ],
  },
  {
    id: 'NS-05',
    name: 'Nal Sarovar West Buffer',
    coordinates: { lat: 22.798, lng: 71.992 },
    status: 'healthy',
    type: 'water-quality',
    district: 'Ahmedabad',
    taluka: 'Sanand',
    village: 'Nal Sarovar',
    lastUpdated: ago(4),
    battery: 95,
    signal: 91,
    online: true,
    alerts: 0,
    sensors: [
      sr('Temperature', 24.8, '°C', Thermometer, { warning: 30, critical: 35 }),
      sr('pH', 7.1, '', TestTube, { warning: 8.5, critical: 9.5 }),
      sr('TDS', 142, 'ppm', Activity, { warning: 300, critical: 400 }),
      sr('Dissolved O₂', 7.5, 'mg/L', Gauge, { warning: 4, critical: 2, inverted: true }),
      sr('Water Level', 2.5, 'm', Radio, { warning: 7, critical: 9 }),
      sr('Battery', 95, '%', Battery, { warning: 20, critical: 10, inverted: true }),
    ],
  },
];

export const mockDataSource: StationDataSource = {
  getStations() {
    return mockStations;
  },
  getStationById(id: string) {
    return mockStations.find(s => s.id === id);
  },
  getStationsByDistrict(district: string) {
    return mockStations.filter(s => s.district === district);
  },
};

export interface ActivityEvent {
  id: string;
  stationId: string;
  stationName: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: Date;
}

const activityTemplates = [
  { type: 'critical' as const, message: 'DO levels critically low — aeration required' },
  { type: 'warning' as const, message: 'TDS levels rising — potential runoff detected' },
  { type: 'info' as const, message: 'Sensor synchronization complete' },
  { type: 'success' as const, message: 'Health check passed — all systems nominal' },
  { type: 'warning' as const, message: 'pH drifting outside neutral range' },
  { type: 'info' as const, message: 'Data packet received from station' },
  { type: 'info' as const, message: 'Battery levels within operational range' },
  { type: 'warning' as const, message: 'Water temperature approaching threshold' },
  { type: 'success' as const, message: 'Firmware update applied successfully' },
  { type: 'critical' as const, message: 'Signal strength degraded — possible interference' },
];

const stationNames: Record<string, string> = {
  'NS-01': 'North Inlet',
  'NS-02': 'Main Basin',
  'NS-03': 'South Outflow',
  'NS-04': 'East Shore',
  'NS-05': 'West Buffer',
};

export function generateActivityFeed(count: number): ActivityEvent[] {
  const items: ActivityEvent[] = [];
  const stationIds = Object.keys(stationNames);
  for (let i = 0; i < count; i++) {
    const t = activityTemplates[i % activityTemplates.length];
    const sid = stationIds[i % stationIds.length];
    items.push({
      id: `aev-${i}`,
      stationId: sid,
      stationName: stationNames[sid],
      message: t.message,
      type: t.type,
      timestamp: new Date(now - i * 480000 - Math.random() * 120000),
    });
  }
  return items;
}

export const coverageArea = '~18 km²';
export const aiHealthScore = 87;
