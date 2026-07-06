import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { sensorApi } from '@/services/sensorApi';
import { alertApi } from '@/services/alertApi';
import * as alertSocket from '@/services/alertSocket';
import type { Sensor } from '@/types/sensor';
import type { Alert, AlertStats } from '@/types/alert';

export type StatusFilter = 'all' | 'online' | 'warning' | 'offline' | 'maintenance';

export function computeVisualStatus(sensor: Sensor): string {
  if (sensor.status === 'offline') return 'offline';
  if (sensor.status === 'maintenance') return 'maintenance';
  if (sensor.temperature != null && sensor.temperature > 40) return 'warning';
  if (sensor.ph != null && (sensor.ph < 5.5 || sensor.ph > 9)) return 'warning';
  if (sensor.tds != null && sensor.tds > 500) return 'warning';
  if (sensor.dissolvedOxygen != null && sensor.dissolvedOxygen < 3) return 'warning';
  if (sensor.battery != null && sensor.battery < 10) return 'offline';
  return sensor.status === 'warning' ? 'warning' : 'online';
}

interface LeafletMapProps {
  filter: StatusFilter;
  search: string;
  onSensorsLoaded?: (sensors: Sensor[]) => void;
  onAlertStatsLoaded?: (stats: AlertStats | null) => void;
}

const STATUS_META: Record<string, { color: string; label: string; animation: string }> = {
  online:      { color: '#10b981', label: 'Healthy',   animation: 'aviguard-pulse-green 2.5s ease-in-out infinite' },
  warning:     { color: '#f59e0b', label: 'Warning',   animation: 'aviguard-pulse-orange 1.8s ease-in-out infinite' },
  offline:     { color: '#6b7280', label: 'Offline',   animation: 'none' },
  maintenance: { color: '#6b7280', label: 'Offline',   animation: 'none' },
};

function getMeta(status: string) {
  return STATUS_META[status] || STATUS_META.offline;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 0) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function createMarkerIcon(sensor: Sensor, alerts: Alert[]): L.DivIcon {
  const visualStatus = computeVisualStatus(sensor);
  const meta = getMeta(visualStatus);
  const isCritical = visualStatus === 'offline' || visualStatus === 'maintenance';
  const isWarning = visualStatus === 'warning';
  const hasActiveAlert = alerts.some(a => a.sensorId === sensor.id && a.status === 'ACTIVE');

  const size = isCritical ? 28 : 24;
  const half = size / 2;
  const animStyle = `animation:${meta.animation}`;
  const glowExtra = isCritical
    ? 'box-shadow:0 0 14px 4px rgba(239,68,68,0.5),0 0 28px 8px rgba(239,68,68,0.2);'
    : isWarning
    ? 'box-shadow:0 0 10px 3px rgba(245,158,11,0.4);'
    : `box-shadow:0 0 8px ${meta.color}60;`;

  const dangerIcon = isCritical
    ? `<div style="position:absolute;top:-6px;right:-6px;width:16px;height:16px;background:#ef4444;border-radius:50%;border:2px solid #1a1d23;display:flex;align-items:center;justify-content:center;font-size:9px;z-index:1">⚠</div>`
    : '';

  const ringAnim = isCritical || isWarning
    ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${meta.color};animation:aviguard-ring-pulse 2s ease-out infinite;pointer-events:none"></div>`
    : '';

  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -half - 4],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;${animStyle}">
        ${ringAnim}
        <div style="width:${size}px;height:${size}px;border-radius:50%;background:${meta.color};border:3px solid rgba(255,255,255,0.9);${glowExtra}position:relative;z-index:2"></div>
        ${dangerIcon}
      </div>`,
  });
}

function buildPopupHTML(sensor: Sensor, sensorAlerts: Alert[]): string {
  const visualStatus = computeVisualStatus(sensor);
  const meta = getMeta(visualStatus);
  const batteryColor = (sensor.battery ?? 0) > 50 ? '#34d399' : (sensor.battery ?? 0) > 20 ? '#f59e0b' : '#ef4444';
  const signalColor = (sensor.signalStrength ?? 0) > 50 ? '#34d399' : '#f59e0b';

  const param = (label: string, icon: string, val: number | null, unit: string, bg: string, tc: string) =>
    val != null ? `<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-radius:6px;background:${bg}">
      <span style="font-size:10px;color:#9ca3af">${icon} ${label}</span>
      <span style="font-size:11px;font-weight:600;color:${tc}">${val}${unit}</span>
    </div>` : '';

  const activeAlerts = sensorAlerts.filter(a => a.status === 'ACTIVE');
  const alertBadge = activeAlerts.length > 0
    ? `<div style="margin-bottom:6px;padding:4px 8px;border-radius:6px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2)">
        <span style="font-size:10px;color:#ef4444;font-weight:600">⚠ ${activeAlerts.length} active alert${activeAlerts.length > 1 ? 's' : ''}</span>
      </div>` : '';

  return `<div style="width:280px;font-family:system-ui,-apple-system,sans-serif">
    <div style="padding:10px 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid ${meta.color}">
      <div style="display:flex;align-items:center;gap:8px;min-width:0">
        <div style="width:10px;height:10px;border-radius:50%;background:${meta.color};box-shadow:0 0 8px ${meta.color}80;flex-shrink:0"></div>
        <div style="min-width:0">
          <div style="font-size:13px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${sensor.sensorId}</div>
          <div style="font-size:10px;color:#9ca3af;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${sensor.name}</div>
        </div>
      </div>
      <span style="font-size:9px;font-weight:600;padding:2px 8px;border-radius:10px;background:${meta.color}20;color:${meta.color};flex-shrink:0;margin-left:8px;text-transform:uppercase;letter-spacing:0.5px">${meta.label}</span>
    </div>
    <div style="padding:10px 12px;background:#1a1d23;border-radius:0 0 8px 8px">
      ${sensor.wetland ? `<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#9ca3af;margin-bottom:8px">
        <span>📍</span><span>${sensor.wetland}</span>
      </div>` : ''}
      ${alertBadge}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:8px">
        ${param('Temp', '🌡', sensor.temperature, '°C', 'rgba(16,185,129,0.1)', '#34d399')}
        ${param('pH', '🧪', sensor.ph, '', 'rgba(59,130,246,0.1)', '#60a5fa')}
        ${param('TDS', '💧', sensor.tds, ' ppm', 'rgba(168,85,247,0.1)', '#c084fc')}
        ${param('DO', '🫧', sensor.dissolvedOxygen, ' mg/L', 'rgba(6,182,212,0.1)', '#22d3ee')}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#6b7280;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);margin-bottom:8px">
        <span style="display:flex;align-items:center;gap:4px">🔋 <span style="color:${batteryColor}">${sensor.battery != null ? sensor.battery + '%' : 'N/A'}</span></span>
        <span style="display:flex;align-items:center;gap:4px">📶 <span style="color:${signalColor}">${sensor.signalStrength != null ? sensor.signalStrength + '%' : 'N/A'}</span></span>
        <span style="display:flex;align-items:center;gap:4px">🕐 ${formatTime(sensor.lastSeen)}</span>
      </div>
      <div style="display:flex;gap:6px">
        <button data-nav="/dashboard/sensors" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:6px;border-radius:6px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);font-size:10px;font-weight:600;color:#34d399;cursor:pointer;transition:background 0.15s"
          onmouseover="this.style.background='rgba(16,185,129,0.2)'" onmouseout="this.style.background='rgba(16,185,129,0.1)'">👁 View Sensor</button>
        <button data-nav="/dashboard/alerts" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:6px;border-radius:6px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);font-size:10px;font-weight:600;color:#f87171;cursor:pointer;transition:background 0.15s"
          onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'">🔔 View Alerts</button>
      </div>
    </div>
  </div>`;
}

function computeWetlandStatus(sensors: Sensor[]): { name: string; status: string; center: [number, number]; sensors: Sensor[] }[] {
  const grouped = new Map<string, Sensor[]>();
  for (const s of sensors) {
    if (!s.wetland || s.latitude == null || s.longitude == null) continue;
    if (!grouped.has(s.wetland)) grouped.set(s.wetland, []);
    grouped.get(s.wetland)!.push(s);
  }

  return Array.from(grouped.entries()).map(([name, wetlandSensors]) => {
    const statuses = wetlandSensors.map(s => computeVisualStatus(s));
    const hasCritical = statuses.some(st => st === 'offline' || st === 'maintenance');
    const hasWarning = statuses.some(st => st === 'warning');
    const status = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy';
    const lat = wetlandSensors.reduce((sum, s) => sum + s.latitude!, 0) / wetlandSensors.length;
    const lng = wetlandSensors.reduce((sum, s) => sum + s.longitude!, 0) / wetlandSensors.length;
    return { name, status, center: [lat, lng] as [number, number], sensors: wetlandSensors };
  });
}

function getWetlandColor(status: string): string {
  if (status === 'critical') return 'rgba(239,68,68,0.12)';
  if (status === 'warning') return 'rgba(245,158,11,0.12)';
  return 'rgba(16,185,129,0.10)';
}

function getWetlandBorderColor(status: string): string {
  if (status === 'critical') return 'rgba(239,68,68,0.5)';
  if (status === 'warning') return 'rgba(245,158,11,0.5)';
  return 'rgba(16,185,129,0.4)';
}

export function LeafletMap({ filter, search, onSensorsLoaded, onAlertStatsLoaded }: LeafletMapProps) {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polygonsRef = useRef<L.Polygon[]>([]);
  const labelsRef = useRef<L.Marker[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFitRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const [sensorRes, alertRes, statsRes] = await Promise.all([
        sensorApi.getAll({ limit: '200' }),
        alertApi.getAll({ status: 'ACTIVE', limit: '200' }),
        alertApi.getStats().catch(() => null),
      ]);
      setSensors(sensorRes.data.sensors);
      setAlerts(alertRes.data.alerts);
      onSensorsLoaded?.(sensorRes.data.sensors);
      onAlertStatsLoaded?.(statsRes?.data ?? null);
    } catch (err) {
      console.error('Failed to fetch map data:', err);
    } finally {
      setLoading(false);
    }
  }, [onSensorsLoaded, onAlertStatsLoaded]);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchData]);

  useEffect(() => {
    const unsub = alertSocket.subscribe(() => { fetchData(); });
    const onSensorUpdate = () => { fetchData(); };
    window.addEventListener('sensor:updated', onSensorUpdate);
    return () => { unsub(); window.removeEventListener('sensor:updated', onSensorUpdate); };
  }, [fetchData]);

  const mappedSensors = useMemo(() => {
    let result = sensors.filter(s => s.latitude != null && s.longitude != null);
    if (filter !== 'all') {
      result = result.filter(s => computeVisualStatus(s) === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.sensorId.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.wetland && s.wetland.toLowerCase().includes(q))
      );
    }
    return result;
  }, [sensors, filter, search]);

  const allWithCoords = useMemo(() => sensors.filter(s => s.latitude != null && s.longitude != null), [sensors]);

  const wetlandGroups = useMemo(() => computeWetlandStatus(allWithCoords), [allWithCoords]);

  const healthyCount = allWithCoords.filter(s => computeVisualStatus(s) === 'online').length;
  const warningCount = allWithCoords.filter(s => computeVisualStatus(s) === 'warning').length;
  const criticalCount = allWithCoords.filter(s => computeVisualStatus(s) === 'offline' || computeVisualStatus(s) === 'maintenance').length;
  const offlineCount = allWithCoords.filter(s => computeVisualStatus(s) === 'offline').length;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [22.75, 71.95],
      zoom: 11,
      zoomControl: false,
      attributionControl: true,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    polygonsRef.current.forEach(p => p.remove());
    polygonsRef.current = [];
    labelsRef.current.forEach(l => l.remove());
    labelsRef.current = [];

    for (const wg of wetlandGroups) {
      if (wg.sensors.length < 3) continue;
      const pts: L.LatLngExpression[] = wg.sensors.map(s => [s.latitude!, s.longitude!] as [number, number]);
      const hull = convexHull(pts);
      if (hull.length >= 3) {
        const poly = L.polygon(hull, {
          color: getWetlandBorderColor(wg.status),
          fillColor: getWetlandColor(wg.status),
          fillOpacity: 0.6,
          weight: 2,
          dashArray: '6 4',
          className: 'wetland-polygon',
        }).addTo(map);
        poly.bindTooltip(wg.name, {
          permanent: true,
          direction: 'center',
          className: 'wetland-label',
        });
        polygonsRef.current.push(poly);
      }
    }

    for (const sensor of mappedSensors) {
      const marker = L.marker([sensor.latitude!, sensor.longitude!], {
        icon: createMarkerIcon(sensor, alerts),
      }).addTo(map);

      const sensorAlerts = alerts.filter(a => a.sensorId === sensor.id);
      marker.bindPopup(buildPopupHTML(sensor, sensorAlerts), {
        maxWidth: 300,
        minWidth: 280,
        closeButton: false,
        autoPan: true,
        autoPanPadding: [40, 40],
        className: 'avianguard-popup',
      });

      marker.on('popupopen', () => {
        const el = marker.getPopup()?.getElement();
        if (!el) return;
        el.querySelectorAll('[data-nav]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            navigate((btn as HTMLElement).dataset.nav!);
          });
        });
      });

      marker.on('click', () => {
        map.flyTo([sensor.latitude!, sensor.longitude!], Math.max(map.getZoom(), 14), { duration: 1 });
      });

      markersRef.current.push(marker);
    }

    if (!hasFitRef.current && mappedSensors.length > 0) {
      const bounds = mappedSensors.map(s => [s.latitude!, s.longitude!] as [number, number]);
      if (bounds.length === 1) map.setView(bounds[0], 13);
      else map.fitBounds(L.latLngBounds(bounds).pad(0.25));
      hasFitRef.current = true;
    }
  }, [mappedSensors, alerts, wetlandGroups, navigate]);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#0f1117]">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            Loading GIS data...
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full rounded-xl" style={{ background: '#0f1117', minHeight: '400px' }} />

      {/* Legend */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-4 text-[10px] bg-[#1a1d23]/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span className="text-gray-300 font-medium">Healthy</span>
          <span className="text-gray-500">({healthyCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" style={{ animation: 'aviguard-pulse-orange 1.8s ease-in-out infinite' }} />
          <span className="text-gray-300 font-medium">Warning</span>
          <span className="text-gray-500">({warningCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" style={{ animation: 'aviguard-pulse-red 1.5s ease-in-out infinite' }} />
          <span className="text-gray-300 font-medium">Critical</span>
          <span className="text-gray-500">({criticalCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="text-gray-300 font-medium">Offline</span>
          <span className="text-gray-500">({offlineCount})</span>
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a1d23]/90 backdrop-blur-sm border border-white/[0.08] text-[10px] text-gray-400">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live · 15s refresh
      </div>
    </div>
  );
}

function convexHull(points: L.LatLngExpression[]): L.LatLngExpression[] {
  const pts = points.map(p => ({ x: (p as [number, number])[1], y: (p as [number, number])[0] }));
  pts.sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: typeof pts = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: typeof pts = [];
  for (const p of pts.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper).map(p => [p.y, p.x] as [number, number]);
}
