import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity, Droplets, Thermometer, TestTube, Gauge, RefreshCw,
  Zap, Wifi, WifiOff, Battery, Signal, TrendingUp, Minus,
  Brain, FileText, AlertTriangle, Clock, CheckCircle, XCircle,
  BarChart3, Radio, ArrowUp, ArrowDown, Server, MapPin, Trash2
} from 'lucide-react';
import { SensorGauge } from '../SensorGauge';
import { AddSensorDialog } from './AddSensorDialog';
import { DeleteSensorDialog } from './DeleteSensorDialog';
import { sensorApi } from '@/services/sensorApi';
import type { Sensor } from '@/types/sensor';

const paramConfig = [
  { key: 'temperature' as const, label: 'Temperature', icon: Thermometer, unit: '°C', color: '#f59e0b', warning: 30, danger: 35 },
  { key: 'ph' as const, label: 'pH Level', icon: TestTube, unit: '', color: '#8b5cf6', warning: 8.5, danger: 9.5 },
  { key: 'tds' as const, label: 'TDS', icon: Droplets, unit: 'ppm', color: '#3b82f6', warning: 300, danger: 400 },
  { key: 'dissolvedOxygen' as const, label: 'Dissolved Oxygen', icon: Gauge, unit: 'mg/L', color: '#10b981', warning: 4, danger: 2 },
  { key: 'waterLevel' as const, label: 'Water Level', icon: Radio, unit: 'm', color: '#ec4899', warning: 7, danger: 9 },
];

const statusConfig = {
  online: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
  offline: { color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-500' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-500' },
  maintenance: { color: 'text-gray-400', bg: 'bg-gray-500/10', dot: 'bg-gray-500' },
};

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />;
}

export function LiveSensorsPage() {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; sensorId: string } | null>(null);

  const fetchSensors = useCallback(async () => {
    try {
      const res = await sensorApi.getAll({ limit: '200' });
      setSensors(res.data.sensors);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load sensors';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchSensors();
    const interval = setInterval(fetchSensors, 15000);
    function handleSensorUpdate() {
      fetchSensors();
    }
    window.addEventListener('sensor:updated', handleSensorUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('sensor:updated', handleSensorUpdate);
    };
  }, [fetchSensors]);

  const stats = useMemo(() => {
    const total = sensors.length;
    const online = sensors.filter(s => s.status === 'online').length;
    const offline = sensors.filter(s => s.status === 'offline').length;
    const warning = sensors.filter(s => s.status === 'warning').length;
    return { total, online, offline, warning };
  }, [sensors]);

  const avgReadings = useMemo(() => {
    const avg: Record<string, number> = {};
    for (const key of ['temperature', 'ph', 'tds', 'dissolvedOxygen', 'waterLevel'] as const) {
      const values = sensors.map(s => s[key]).filter((v): v is number => v !== null);
      avg[key] = values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : 0;
    }
    return avg;
  }, [sensors]);

  const connectedCount = stats.online + stats.warning;
  const offlineCount = stats.offline;
  const healthScore = sensors.length > 0
    ? Math.round((connectedCount / sensors.length) * 100)
    : 0;
  const healthLabel = healthScore >= 80 ? 'Excellent' : healthScore >= 50 ? 'Fair' : 'Critical';
  const healthColor = healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-red-400';

  if (loading && sensors.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2"><Skeleton className="h-6 w-64" /><Skeleton className="h-4 w-96" /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-red-400 mb-4" />
        <p className="text-sm text-gray-400 mb-2">Failed to load sensor data</p>
        <p className="text-xs text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-xs font-semibold text-white hover:from-emerald-400 hover:to-blue-500 transition-all"
        >Retry</button>
      </div>
    );
  }

  const displaySensors = sensors.slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl">
            <Radio size={22} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">IoT Monitoring Center</h1>
            <p className="text-sm text-gray-400">Real-time wetland sensor network — {stats.total} sensors deployed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AddSensorDialog onSuccess={fetchSensors} />
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <RefreshCw size={12} className="text-emerald-400" />
            <span>Auto-refresh every 15s</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <Clock size={11} className="text-gray-500" />
            <span className="text-[10px] text-gray-400">
              Last Updated: {sensors.length > 0
                ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${healthScore >= 80 ? 'bg-emerald-500/10' : healthScore >= 50 ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
              <Activity size={14} className={healthColor} />
            </div>
            <span className="text-xs text-gray-500">Network Health</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold ${healthColor}`}>{healthScore}%</span>
            <span className={`text-[10px] font-medium ${healthColor}`}>{healthLabel}</span>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10"><Wifi size={14} className="text-emerald-400" /></div>
            <span className="text-xs text-gray-500">Connected</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-400">{connectedCount}</span>
            <span className="text-xs text-gray-500">/ {stats.total} sensors</span>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-red-500/10"><WifiOff size={14} className="text-red-400" /></div>
            <span className="text-xs text-gray-500">Offline</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold ${offlineCount > 0 ? 'text-red-400' : 'text-gray-500'}`}>{offlineCount}</span>
            <span className="text-xs text-gray-500">sensors</span>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10"><Server size={14} className="text-blue-400" /></div>
            <span className="text-xs text-gray-500">Total Sensors</span>
          </div>
          <div className="text-xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10"><Activity size={14} className="text-purple-400" /></div>
            <span className="text-xs text-gray-500">Warning</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold ${stats.warning > 0 ? 'text-amber-400' : 'text-gray-500'}`}>{stats.warning}</span>
            <span className="text-xs text-gray-500">sensors</span>
          </div>
        </div>
      </div>

      {/* SENSOR CARDS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-cyan-400" />
          <h2 className="text-base font-semibold text-white">Live Sensor Readings</h2>
        </div>

        {displaySensors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.03] rounded-2xl border border-white/[0.06]">
            <Radio size={40} className="text-gray-600 mb-4" />
            <p className="text-sm text-gray-400 mb-1">No sensors deployed</p>
            <p className="text-xs text-gray-600">Add sensors to start monitoring wetland parameters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySensors.map(sensor => {
              const sc = statusConfig[sensor.status] || statusConfig.offline;
              const online = sensor.status === 'online' || sensor.status === 'warning';
              const primaryKey = 'tds' as const;
              const primaryVal = sensor.tds ?? 0;
              const pConfig = paramConfig.find(p => p.key === primaryKey)!;
              const isInverted = false;
              const safeRange = `${pConfig.min || 0} — ${pConfig.warning} ${pConfig.unit}`;

              return (
                <div key={sensor.id} className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 transition-all duration-300 hover:bg-white/[0.05] hover:shadow-xl ${!online ? 'opacity-60' : ''}`}>
                  {/* Sensor Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${pConfig.color}20` }}>
                        <MapPin size={16} style={{ color: pConfig.color }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{sensor.name}</div>
                        <div className="text-[10px] font-mono text-gray-600">ID: {sensor.sensorId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className={`text-[10px] font-medium ${sc.color}`}>{sensor.status}</span>
                    </div>
                  </div>

                  {/* Gauge */}
                  <div className="flex justify-center -mt-2 -mb-2">
                    <SensorGauge
                      value={primaryVal}
                      min={0}
                      max={500}
                      unit={pConfig.unit}
                      label=""
                      color={pConfig.color}
                      warningThreshold={pConfig.warning}
                      dangerThreshold={pConfig.danger}
                    />
                  </div>

                  {/* Details Footer */}
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">Location:</span>
                        <span className="text-[10px] font-medium text-gray-400">{sensor.location || sensor.wetland || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">TDS:</span>
                        <span className={`text-[10px] font-medium ${sensor.tds !== null ? 'text-gray-300' : 'text-gray-600'}`}>
                          {sensor.tds !== null ? `${sensor.tds} ppm` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-1 pt-1.5 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1.5">
                        <Battery size={11} className={sensor.battery !== null && sensor.battery > 50 ? 'text-emerald-400' : sensor.battery !== null && sensor.battery > 20 ? 'text-amber-400' : 'text-red-400'} />
                        <span className="text-[10px] text-gray-500">{sensor.battery !== null ? `${Math.round(sensor.battery)}%` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Signal size={11} className={sensor.signalStrength !== null && sensor.signalStrength > 70 ? 'text-emerald-400' : sensor.signalStrength !== null && sensor.signalStrength > 40 ? 'text-amber-400' : 'text-red-400'} />
                        <span className="text-[10px] text-gray-500">{sensor.signalStrength !== null ? `${Math.round(sensor.signalStrength)}%` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={10} className="text-gray-600" />
                        <span className="text-[9px] text-gray-600">
                          {sensor.lastSeen ? new Date(sensor.lastSeen).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                      </div>
                      <button onClick={() => setDeleteTarget({ id: sensor.id, name: sensor.name, sensorId: sensor.sensorId })}
                        className="p-1 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all" title="Delete sensor"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PARAMETER AVERAGES */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Network Parameter Averages</h2>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-auto">Across all sensors</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {paramConfig.map(p => {
            const val = avgReadings[p.key] ?? 0;
            return (
              <div key={p.key} className="bg-white/[0.04] rounded-xl border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${p.color}20` }}>
                      <p.icon size={14} style={{ color: p.color }} />
                    </div>
                    <span className="text-xs font-medium text-gray-300">{p.label}</span>
                  </div>
                  {val > 0 && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      p.key === 'dissolvedOxygen'
                        ? (val <= p.danger ? 'text-red-400 bg-red-500/10' : val <= p.warning ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10')
                        : (val >= p.danger ? 'text-red-400 bg-red-500/10' : val >= p.warning ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10')
                    }`}>
                      {p.key === 'dissolvedOxygen'
                        ? (val <= p.danger ? 'Critical' : val <= p.warning ? 'Warning' : 'Normal')
                        : (val >= p.danger ? 'Critical' : val >= p.warning ? 'Warning' : 'Normal')}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{val}</span>
                  {p.unit && <span className="text-xs text-gray-500">{p.unit}</span>}
                </div>
                <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    p.key === 'dissolvedOxygen'
                      ? (val <= p.danger ? 'bg-red-500' : val <= p.warning ? 'bg-amber-500' : 'bg-emerald-500')
                      : (val >= p.danger ? 'bg-red-500' : val >= p.warning ? 'bg-amber-500' : 'bg-emerald-500')
                  }`}
                    style={{ width: `${Math.min(100, (val / (p.danger * 1.3)) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NETWORK STATUS + EVENTS */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Network Status Table */}
        <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server size={16} className="text-blue-400" />
            <h2 className="text-base font-semibold text-white">Sensor Network Status</h2>
          </div>
          {sensors.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">No sensors registered</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-2.5 px-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Sensor</th>
                    <th className="text-left py-2.5 px-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-2.5 px-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                    <th className="text-left py-2.5 px-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Signal</th>
                    <th className="text-left py-2.5 px-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                    <th className="text-right py-2.5 px-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sensors.map(sensor => {
                    const sc = statusConfig[sensor.status] || statusConfig.offline;
                    const StatusIcon = sensor.status === 'online' || sensor.status === 'warning' ? CheckCircle : XCircle;
                    return (
                      <tr key={sensor.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-all">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-cyan-500/10">
                              <Radio size={12} className="text-cyan-400" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-white">{sensor.name}</span>
                              <span className="text-[10px] text-gray-600 block">ID: {sensor.sensorId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon size={12} className={sc.color} />
                            <span className={`text-xs font-medium ${sc.color}`}>{sensor.status}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${sensor.battery !== null && sensor.battery > 50 ? 'bg-emerald-500' : sensor.battery !== null && sensor.battery > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${sensor.battery ?? 0}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{sensor.battery !== null ? `${Math.round(sensor.battery)}%` : 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${sensor.signalStrength !== null && sensor.signalStrength > 70 ? 'bg-emerald-500' : sensor.signalStrength !== null && sensor.signalStrength > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${sensor.signalStrength ?? 0}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{sensor.signalStrength !== null ? `${Math.round(sensor.signalStrength)}%` : 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs text-gray-500">
                            {sensor.lastSeen ? new Date(sensor.lastSeen).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button onClick={() => setDeleteTarget({ id: sensor.id, name: sensor.name, sensorId: sensor.sensorId })}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all" title="Delete sensor"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Recent Events */}
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 max-h-[340px] overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <Zap size={16} className="text-amber-400" />
              <h2 className="text-base font-semibold text-white">Sensor Overview</h2>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {[
                { label: 'Total', value: stats.total, icon: Server, color: 'text-blue-400' },
                { label: 'Online', value: stats.online, icon: Wifi, color: 'text-emerald-400' },
                { label: 'Offline', value: stats.offline, icon: WifiOff, color: 'text-red-400' },
                { label: 'Warning', value: stats.warning, icon: AlertTriangle, color: 'text-amber-400' },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={s.color} />
                      <span className="text-xs text-gray-400">{s.label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{s.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              <button onClick={() => navigate('/dashboard/alerts')}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/10">
                <Brain size={15} /> Open AI Decision Center
              </button>
              <button onClick={() => navigate('/dashboard/reports')}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all">
                <FileText size={15} /> Generate Report
              </button>
              <button onClick={() => navigate('/dashboard/alerts')}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all">
                <AlertTriangle size={15} /> Open Alert Center
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteSensorDialog
        sensor={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onSuccess={fetchSensors}
      />
    </div>
  );
}
