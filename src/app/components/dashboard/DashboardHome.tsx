import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity, Droplets, Thermometer, TestTube, MapPin, CheckCircle, AlertTriangle, Brain,
  Users, Bell, Radio, Gauge, Wind, Thermometer as ThermometerIcon,
  Server, Clock, Navigation, Globe, Send,
} from 'lucide-react';
import ShinyText from '../ShinyText';
import { useDashboard } from '@/hooks/useDashboard';
import type { SensorReadingSummary } from '@/types/dashboard';

interface StateWetland {
  id: string; name: string; district: string; taluka: string;
  status: 'active' | 'future' | 'planned'; x: number; y: number;
}

const stateWetlands: StateWetland[] = [
  { id: 'nal-sarovar', name: 'Nal Sarovar', district: 'Ahmedabad', taluka: 'Sanand', status: 'active', x: 55, y: 46 },
  { id: 'thol', name: 'Thol Lake', district: 'Mehsana', taluka: 'Kadi', status: 'future', x: 50, y: 32 },
  { id: 'khijadiya', name: 'Khijadiya', district: 'Jamnagar', taluka: 'Jamnagar', status: 'future', x: 28, y: 52 },
  { id: 'pariej', name: 'Pariej', district: 'Anand', taluka: 'Anand', status: 'future', x: 56, y: 56 },
  { id: 'wadhvana', name: 'Wadhvana', district: 'Vadodara', taluka: 'Padra', status: 'future', x: 59, y: 51 },
  { id: 'narmada', name: 'Narmada Estuary', district: 'Bharuch', taluka: 'Bharuch', status: 'future', x: 62, y: 67 },
  { id: 'kutch', name: 'Gulf of Kutch', district: 'Kutch', taluka: 'Abdasa', status: 'planned', x: 18, y: 24 },
];

const severityStyle: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10',
  emergency: 'text-orange-400 bg-orange-500/10',
  warning: 'text-amber-400 bg-amber-500/10',
  info: 'text-emerald-400 bg-emerald-500/10',
};

const deployColor: Record<string, string> = { active: '#10b981', future: '#f97316', planned: '#6b7280' };
const deployLabel: Record<string, string> = { active: 'Pilot Active', future: 'Future Expansion', planned: 'Not Deployed' };

const sensorLabels: Record<string, string> = {
  temperature: 'Temperature', ph: 'pH', tds: 'TDS',
  dissolved_oxygen: 'Dissolved O₂', water_level: 'Water Level', turbidity: 'Turbidity',
  humidity: 'Humidity', rainfall: 'Rainfall', wind_speed: 'Wind Speed',
  wind_direction: 'Wind Direction', solar_radiation: 'Solar Radiation',
};

const sensorUnits: Record<string, string> = {
  temperature: '°C', ph: '', tds: 'ppm', dissolved_oxygen: 'mg/L',
  water_level: 'm', turbidity: 'NTU', humidity: '%', rainfall: 'mm',
  wind_speed: 'm/s', solar_radiation: 'W/m²',
};

const sensorColors: Record<string, string> = {
  temperature: '#f59e0b', ph: '#8b5cf6', tds: '#3b82f6',
  dissolved_oxygen: '#10b981', water_level: '#ec4899', turbidity: '#f97316',
  humidity: '#06b6d4', rainfall: '#2563eb', wind_speed: '#a855f7',
  solar_radiation: '#eab308', wind_direction: '#14b8a6',
};

const sensorIcons: Record<string, typeof Thermometer> = {
  temperature: ThermometerIcon, ph: TestTube, tds: Activity,
  dissolved_oxygen: Gauge, water_level: Radio, turbidity: Navigation,
  humidity: Wind, rainfall: Droplets,
};

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />;
}

function HeroSkeleton() {
  return (
    <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}

function SensorOverviewSkeleton() {
  return (
    <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
      <Skeleton className="h-5 w-48 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}

function AlertFeedSkeleton() {
  return (
    <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    </div>
  );
}

export function DashboardHome() {
  const navigate = useNavigate();
  const { data, loading, error } = useDashboard();
  const [selectedSW, setSelectedSW] = useState<StateWetland>(stateWetlands[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <HeroSkeleton />
        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3"><Skeleton className="h-80" /></div>
          <div className="lg:col-span-2"><AlertFeedSkeleton /></div>
        </div>
        <SensorOverviewSkeleton />
        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3"><Skeleton className="h-32" /></div>
          <div className="lg:col-span-2"><Skeleton className="h-32" /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-red-400 mb-4" />
        <p className="text-sm text-gray-400 mb-2">Failed to load dashboard data</p>
        <p className="text-xs text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-xs font-semibold text-white hover:from-emerald-400 hover:to-blue-500 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeAlerts = data?.activeAlerts ?? 0;
  const criticalAlerts = data?.criticalAlerts ?? 0;
  const highAlerts = data?.highAlerts ?? 0;
  const citizenTotal = data?.totalCitizens ?? 0;
  const totalStations = data?.totalSensorStations ?? 0;
  const totalSensors = data?.totalSensors ?? 0;

  const connectedSensors = data?.activeSensors ?? 0;
  const activeStations = data?.activeSensorStations ?? 0;

  const sensorReadings = (data?.sensorReadings ?? []).reduce<Record<string, SensorReadingSummary>>(
    (acc, r) => { acc[r.type] = r; return acc; }, {},
  );

  const primaryKeys = ['temperature', 'ph', 'tds', 'dissolved_oxygen', 'water_level'] as const;

  return (
    <div className="space-y-6">

      {/* ===== HERO COMMAND CENTER ===== */}
      <div className="bg-gradient-to-r from-emerald-500/[0.08] via-blue-500/[0.05] to-emerald-500/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <MapPin className="text-white" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold"><ShinyText text="Nal Sarovar Command Center" color="#FFFFFF" shineColor="#22D3EE" spread={100} speed={3} className="text-xl font-bold" /></h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider">Pilot</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">Gujarat Wetland Monitoring System · Ahmedabad District · Sanand Taluka</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">System Online</span>
            </div>
            <div className="text-xs text-gray-500 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-white/[0.06]">
          {[
            { icon: Server, label: 'Sensor Stations', value: String(activeStations), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { icon: Radio, label: 'Connected Sensors', value: String(totalSensors), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { icon: Users, label: 'Registered Citizens', value: String(citizenTotal), color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: AlertTriangle, label: 'Active Alerts', value: String(activeAlerts), color: 'text-red-400', bg: 'bg-red-500/10', badge: activeAlerts > 0 ? `${criticalAlerts} Critical · ${highAlerts} High` : undefined },
            { icon: Activity, label: 'Online Stations', value: String(activeStations), color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { icon: Clock, label: 'Last Sync', value: 'Live', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-3 bg-white/[0.03] rounded-xl border border-white/[0.06] px-4 py-3">
              <div className={`p-2 rounded-lg ${stat.bg} shrink-0`}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-[10px] text-gray-500">{stat.label}</div>
                {stat.badge && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {stat.badge.split('·').map((part: string, i: number) => (
                      <span key={i} className={`text-[8px] font-medium ${part.includes('Critical') ? 'text-red-400 bg-red-500/10' : 'text-orange-400 bg-orange-500/10'} px-1 py-0.5 rounded`}>{part.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== MAIN GRID: MAP + ALERT FEED ===== */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* LARGE INTERACTIVE WETLAND MAP */}
        <div className="lg:col-span-3 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Gujarat Wetland Deployment Map</h2>
            <div className="ml-auto flex items-center gap-3">
              {[
                { key: 'active', color: '#10b981', label: 'Pilot Active' },
                { key: 'future', color: '#f97316', label: 'Future Expansion' },
                { key: 'planned', color: '#6b7280', label: 'Not Deployed' },
              ].map(d => (
                <div key={d.key} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] text-gray-500">{d.label}</span>
                </div>
              ))}
              <span className="text-[10px] text-gray-600 border-l border-white/[0.06] pl-3">Click a wetland for details</span>
            </div>
          </div>
          <div className="relative w-full aspect-[16/9] bg-white/[0.02] rounded-xl border border-white/[0.06] overflow-hidden">
            <svg viewBox="0 0 400 280" className="w-full h-full">
              <path d="M 50 20 L 160 10 L 280 15 L 370 40 L 380 80 L 360 140 L 340 180 L 320 220 L 280 250 L 240 270 L 200 280 L 160 270 L 120 250 L 80 220 L 50 180 L 30 140 L 20 100 L 30 60 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
              <path d="M 30 60 L 120 40 L 180 30 L 160 70 L 80 80 L 30 100 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4,4" />
              <path d="M 80 80 L 180 70 L 200 120 L 180 170 L 120 180 L 70 160 L 50 120 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4,4" />
              {stateWetlands.map(w => {
                const sx = 20 + (w.x / 100) * 360;
                const sy = 10 + (w.y / 100) * 260;
                const sel = selectedSW.id === w.id;
                const color = deployColor[w.status];
                return (
                  <g key={w.id} onClick={() => setSelectedSW(w)} className="cursor-pointer">
                    <circle cx={sx} cy={sy} r={sel ? 12 : 8} fill={`${color}20`} stroke={color} strokeWidth={sel ? 2.5 : 1.5} />
                    <circle cx={sx} cy={sy} r={5} fill={color} opacity={sel ? 1 : 0.8} />
                    {sel && <circle cx={sx} cy={sy} r={16} fill="none" stroke={color} strokeWidth={1} opacity={0.4} />}
                    <text x={sx} y={sy - 16} textAnchor="middle" fill={sel ? '#fff' : '#d1d5db'} fontSize="10" fontWeight={sel ? 'bold' : 'normal'}>
                      {w.name}
                    </text>
                    {w.status !== 'active' && (
                      <text x={sx} y={sy + 20} textAnchor="middle" fill={color} fontSize="8" opacity={0.8}>
                        {deployLabel[w.status]}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg border border-white/[0.06] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: deployColor[selectedSW.status] }} />
                  <div>
                    <span className="text-sm font-bold text-white">{selectedSW.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{selectedSW.district} · {selectedSW.taluka}</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  selectedSW.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                  selectedSW.status === 'future' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' :
                  'bg-gray-500/15 text-gray-500 border border-gray-500/30'
                }`}>
                  {deployLabel[selectedSW.status]}
                </span>
              </div>
              {selectedSW.status === 'active' && (
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
                  <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-400" /> {totalStations} Stations</span>
                  <span className="flex items-center gap-1"><Radio size={12} className="text-emerald-400" /> {connectedSensors} Sensors Online</span>
                  <span className="flex items-center gap-1"><Users size={12} className="text-emerald-400" /> {citizenTotal} Citizens</span>
                </div>
              )}
              {selectedSW.status !== 'active' && (
                <p className="text-xs text-gray-500 mt-2">No sensors deployed at this location yet. This site is in the expansion roadmap.</p>
              )}
            </div>
          </div>
        </div>

        {/* LIVE ALERT FEED */}
        <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-red-400" />
              <h2 className="text-sm font-bold text-white">Live Alert Feed</h2>
            </div>
            <button
              onClick={() => navigate('/dashboard/alerts')}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              View All →
            </button>
          </div>
          <div className="flex-1 space-y-2">
            {(data?.recentActivity ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle size={24} className="text-emerald-400 mb-2" />
                <p className="text-xs text-gray-500">No recent activity</p>
              </div>
            ) : (
              (data?.recentActivity ?? []).map(a => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${a.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
                  <span className="text-[10px] text-gray-500 w-16 shrink-0">
                    {new Date(a.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-gray-200 flex-1 min-w-0 truncate">{a.message}</span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${severityStyle[a.severity] ?? 'text-gray-400 bg-gray-500/10'} shrink-0`}>
                    {a.severity.charAt(0).toUpperCase() + a.severity.slice(1)}
                  </span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                    a.status === 'active' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>{a.status === 'active' ? 'Active' : a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => navigate('/dashboard/alerts')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-xs font-semibold text-white hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Send size={12} />
              Send Emergency Alert
            </button>
          </div>
        </div>
      </div>

      {/* ===== SENSOR OVERVIEW ===== */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={15} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Sensor Overview</h2>
          <span className="ml-auto text-xs text-gray-500">Nal Sarovar · 5 key parameters</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {primaryKeys.map(key => {
            const reading = sensorReadings[key];
            const value = reading?.value;
            const label = sensorLabels[key] ?? key;
            const Icon = sensorIcons[key] ?? Activity;
            const color = sensorColors[key] ?? '#6b7280';

            return (
              <div key={key} className="bg-white/[0.04] rounded-xl border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <span className="text-xs font-medium text-gray-300">{label}</span>
                  </div>
                  {value !== undefined && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-500/10">Normal</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  {value !== undefined ? (
                    <>
                      <span className="text-2xl font-bold text-white">{value}</span>
                      {sensorUnits[key] && <span className="text-xs text-gray-500">{sensorUnits[key]}</span>}
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No data</span>
                  )}
                </div>
                {value !== undefined && (
                  <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (value / 100) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== BOTTOM ROW: AI RECOMMENDATION + CITIZEN STATISTICS ===== */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* AI RECOMMENDATION */}
        <div className="lg:col-span-3 bg-gradient-to-br from-purple-500/[0.06] via-transparent to-blue-500/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={15} className="text-purple-400" />
            <h2 className="text-sm font-bold text-white">AI Recommendation</h2>
            <div className="flex items-center gap-1 ml-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] text-purple-400 font-medium">AI Engine Active</span>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0">
              <Brain size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-200 leading-relaxed">
                {data?.aiRecommendation ?? 'All systems operating normally. Standard monitoring schedule in effect.'}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle size={12} />
                  {data?.aiConfidence != null ? `Confidence: ${data.aiConfidence}%` : 'Real-time Analysis'}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={12} />
                  Real-time
                </div>
                <button
                  onClick={() => navigate('/dashboard/ai')}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  Full AI Analysis →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CITIZEN STATISTICS */}
        <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white">Citizen Statistics</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Registered', value: data?.totalCitizens ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { label: 'Reports', value: data?.totalReports ?? 0, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { label: 'Active Alerts', value: activeAlerts, icon: Bell, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.bg} ${s.border} rounded-xl border p-4 text-center`}>
                  <Icon size={18} className={`${s.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{s.label}</div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate('/dashboard/citizens')}
            className="w-full mt-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all font-medium"
          >
            Manage Citizen Requests →
          </button>
        </div>
      </div>
    </div>
  );
}
