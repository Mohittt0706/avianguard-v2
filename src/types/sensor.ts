export interface Sensor {
  id: string;
  sensorId: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  wetland: string | null;
  status: 'online' | 'offline' | 'warning' | 'maintenance';
  temperature: number | null;
  ph: number | null;
  tds: number | null;
  dissolvedOxygen: number | null;
  waterLevel: number | null;
  battery: number | null;
  signalStrength: number | null;
  lastReading: number | null;
  lastSeen: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SensorStats {
  total: number;
  online: number;
  offline: number;
  warning: number;
  maintenance: number;
}

export interface SensorPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SensorListResponse {
  success: boolean;
  data: {
    sensors: Sensor[];
    pagination: SensorPagination;
  };
}

export interface SensorResponse {
  success: boolean;
  data: {
    sensor: Sensor;
  };
  message?: string;
}

export interface SensorStatsResponse {
  success: boolean;
  data: SensorStats;
}

export interface SensorReading {
  id: string;
  temperature: number;
  ph: number;
  tds: number;
  dissolvedOxygen: number;
  waterLevel: number;
  battery: number | null;
  signalStrength: number | null;
  timestamp: string;
  sensorId: string;
}

export interface LiveReadingResponse {
  success: boolean;
  data: {
    sensors: Sensor[];
  };
}

export interface SensorReadingListResponse {
  success: boolean;
  data: {
    readings: SensorReading[];
    pagination: SensorPagination;
  };
}

export interface CreateReadingResponse {
  success: boolean;
  message: string;
  data: {
    reading: SensorReading;
    sensor: Sensor;
  };
}
