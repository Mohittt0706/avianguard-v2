import type { LucideIcon } from 'lucide-react';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SensorReading {
  label: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  status: 'normal' | 'warning' | 'critical';
}

export type StationStatus = 'healthy' | 'warning' | 'critical' | 'offline';

export type StationType = 'wetland' | 'sensor-node' | 'weather-station' | 'water-quality';

export interface WetlandStation {
  id: string;
  name: string;
  coordinates: Coordinates;
  status: StationStatus;
  type: StationType;
  district: string;
  taluka: string;
  village: string;
  lastUpdated: string;
  battery: number;
  signal: number;
  online: boolean;
  sensors: SensorReading[];
  alerts: number;
}

export type MapLayerId = 'wetlands' | 'sensor-nodes' | 'weather' | 'alerts' | 'zones';

export interface MapLayer {
  id: MapLayerId;
  label: string;
  icon: LucideIcon;
  visible: boolean;
}

export interface MapViewport {
  center: Coordinates;
  zoom: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface StationDataSource {
  getStations(): Promise<WetlandStation[]> | WetlandStation[];
  getStationById(id: string): Promise<WetlandStation | undefined> | WetlandStation | undefined;
  getStationsByDistrict(district: string): Promise<WetlandStation[]> | WetlandStation[];
}

export interface MapController {
  flyTo: (coords: Coordinates, zoom?: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}
