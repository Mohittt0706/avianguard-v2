import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  MapPin, Radio, Brain, Clock, Navigation,
  Target, Droplets, Ruler, Activity, Eye, Search, Filter, AlertTriangle, Shield,
} from 'lucide-react';
import { LeafletMap, type StatusFilter, computeVisualStatus } from '../map/LeafletMap';
import { sensorApi } from '@/services/sensorApi';
import { alertApi } from '@/services/alertApi';
import * as alertSocket from '@/services/alertSocket';
import type { Sensor } from '@/types/sensor';
import type { AlertStats } from '@/types/alert';

const futureExpansions = [
  { name: 'Thol Lake', district: 'Mehsana', status: 'Planned' },
  { name: 'Khijadiya Bird Sanctuary', district: 'Jamnagar', status: 'Planned' },
  { name: 'Wadhvana Wetland', district: 'Vadodara', status: 'Planned' },
  { name: 'Narmada Estuary', district: 'Bharuch', status: 'Planned' },
];

const filterOptions: { key: StatusFilter; label: string; color: string; activeBg: string; activeBorder: string }[] = [
  { key: 'all',        label: 'All',        color: 'text-gray-300',  activeBg: 'bg-white/10',    activeBorder: 'border-white/20' },
  { key: 'online',     label: 'Healthy',    color: 'text-emerald-400', activeBg: 'bg-emerald-500/15', activeBorder: 'border-emerald-500/30' },
  { key: 'warning',    label: 'Warning',    color: 'text-amber-400',  activeBg: 'bg-amber-500/15',  activeBorder: 'border-amber-500/30' },
  { key: 'offline',    label: 'Critical',   color: 'text-red-400',    activeBg: 'bg-red-500/15',    activeBorder: 'border-red-500/30' },
  { key: 'maintenance', label: 'Offline',   color: 'text-gray-400',   activeBg: 'bg-gray-500/15',   activeBorder: 'border-gray-500/30' },
];

export function MapsPage() {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const fetchSidebarData = useCallback(async () => {
    try {
      const [sensorRes, statsRes] = await Promise.all([
        sensorApi.getAll({ limit: '200' }),
        alertApi.getStats().catch(() => null),
      ]);
      setSensors(sensorRes.data.sensors);
      setAlertStats(statsRes?.data ?? null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch sidebar data:', err);
    }
  }, []);

  useEffect(() => {
    fetchSidebarData();
    const interval = setInterval(fetchSidebarData, 15000);
    return () => clearInterval(interval);
  }, [fetchSidebarData]);

  useEffect(() => {
    const unsub = alertSocket.subscribe(() => { fetchSidebarData(); });
    const onSensorUpdate = () => { fetchSidebarData(); };
    window.addEventListener('sensor:updated', onSensorUpdate);
    return () => { unsub(); window.removeEventListener('sensor:updated', onSensorUpdate); };
  }, [fetchSidebarData]);

  const totalSensors = sensors.length;
  const healthyCount = sensors.filter(s => computeVisualStatus(s) === 'online').length;
  const warningCount = sensors.filter(s => computeVisualStatus(s) === 'warning').length;
  const criticalCount = sensors.filter(s => computeVisualStatus(s) === 'offline' || computeVisualStatus(s) === 'maintenance').length;
  const offlineCount = sensors.filter(s => computeVisualStatus(s) === 'offline').length;

  const wetlands = [...new Set(sensors.map(s => s.wetland).filter(Boolean))];
  const citizenAlertsSent = alertStats?.active ?? 0;

  return (
    <div className="space-y-4">
      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-emerald-500/[0.06] to-blue-500/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MapPin size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Live Wetland Monitoring Map</h1>
              <p className="text-[11px] text-gray-500">
                {wetlands.length > 0 ? wetlands.join(' · ') : 'No sensors deployed yet'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-400">System Active</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-gray-500">
              v2.1.0
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-3 border-t border-white/[0.06]">
          {[
            { label: 'Total Sensors', value: `${totalSensors}`, icon: Radio, color: 'text-emerald-400' },
            { label: 'Healthy', value: `${healthyCount}`, icon: Activity, color: 'text-emerald-400' },
            { label: 'Wetlands', value: `${wetlands.length || 0}`, icon: Droplets, color: 'text-cyan-400' },
            { label: 'Citizen Alerts', value: `${citizenAlertsSent}`, icon: AlertTriangle, color: 'text-amber-400' },
            { label: 'AI Status', value: criticalCount === 0 ? 'Healthy' : `${criticalCount} alert`, icon: Brain, color: criticalCount === 0 ? 'text-emerald-400' : 'text-red-400' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2.5 bg-white/[0.03] rounded-lg border border-white/[0.06] px-3 py-2">
                <div className="p-1.5 rounded-lg bg-white/[0.04]">
                  <Icon size={13} className={s.color} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{s.value}</div>
                  <div className="text-[9px] text-gray-500">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== FILTERS + SEARCH ===== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-gray-500 shrink-0" />
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1">
            {filterOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all border ${
                  filter === opt.key
                    ? `${opt.activeBg} ${opt.activeBorder} ${opt.color}`
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search sensor ID, name, wetland..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/40 transition-colors"
          />
        </div>
      </div>

      {/* ===== MAP + DEPLOYMENT SUMMARY ===== */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* MAP */}
        <div className="lg:col-span-3">
          <div className="aspect-[16/10] rounded-xl overflow-hidden border border-white/[0.06]">
            <LeafletMap filter={filter} search={search} onSensorsLoaded={setSensors} onAlertStatsLoaded={setAlertStats} />
          </div>
        </div>

        {/* ===== LIVE SUMMARY ===== */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="px-4 py-3 bg-emerald-500/[0.04] border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation size={14} className="text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">Live Summary</h2>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {lastUpdated ? formatSyncTime(lastUpdated) : '...'}
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: 'Total Sensors', value: `${totalSensors}`, icon: Radio },
                { label: 'Healthy', value: `${healthyCount}`, icon: Shield },
                { label: 'Warning', value: `${warningCount}`, icon: AlertTriangle },
                { label: 'Critical', value: `${criticalCount}`, icon: Target },
                { label: 'Offline', value: `${offlineCount}`, icon: Activity },
                { label: 'Wetlands Covered', value: `${wetlands.length || 0}`, icon: Droplets },
                { label: 'Citizen Alerts Sent', value: `${citizenAlertsSent}`, icon: AlertTriangle },
                { label: 'Last Updated', value: lastUpdated ? formatSyncTime(lastUpdated) : 'Loading...', icon: Clock },
              ].map(d => {
                const Icon = d.icon;
                return (
                  <div key={d.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Icon size={11} className="text-gray-500" />
                      <span className="text-[11px] text-gray-400">{d.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-white">{d.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status summary */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Healthy', value: healthyCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: 'Warning', value: warningCount, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { label: 'Critical', value: criticalCount, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} ${s.border} rounded-lg border p-3 text-center`}>
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[9px] text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/dashboard/sensors')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              <Eye size={14} />
              View Sensors
            </button>
            <button
              onClick={() => navigate('/dashboard/alerts')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all"
            >
              <AlertTriangle size={14} />
              View Alerts
            </button>
          </div>
        </div>
      </div>

      {/* ===== FUTURE EXPANSION ROADMAP ===== */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} className="text-amber-400" />
          <h2 className="text-sm font-bold text-white">Future Expansion Roadmap</h2>
          <span className="ml-auto text-[10px] text-gray-600">Phase 2 — Gujarat Wetland Monitoring Network</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {futureExpansions.map((site, i) => (
            <div
              key={site.name}
              className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{site.name}</div>
                    <div className="text-[10px] text-gray-500">{site.district} District</div>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                <span className="text-[10px] text-amber-400/70 font-medium">Planned — Phase 2</span>
              </div>
              {i < futureExpansions.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-1.5 -translate-y-1/2 z-10">
                  <div className="w-3 h-[2px] bg-white/[0.08]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatSyncTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
