import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity, Droplets, Thermometer, TestTube, MapPin, CheckCircle, AlertTriangle, Brain,
  Users, Bell, Radio, Gauge, Wind, Thermometer as ThermometerIcon,
  Server, Clock, Navigation, Globe, Send,
} from 'lucide-react';

interface SensorValues { tds: number; temperature: number; ph: number; dissolved_oxygen: number; water_level: number; }

const sensorThresholds: Record<string, { warning: number; danger: number; inverted?: boolean }> = {
  tds: { warning: 300, danger: 400 }, temperature: { warning: 30, danger: 35 },
  ph: { warning: 8.5, danger: 9.5 },
  dissolved_oxygen: { warning: 4, danger: 2, inverted: true }, water_level: { warning: 7, danger: 9 },
};

const statusStyle: Record<string, string> = {
  Normal: 'text-emerald-400 bg-emerald-500/10',
  Warning: 'text-amber-400 bg-amber-500/10',
  Critical: 'text-red-400 bg-red-500/10',
};

function genVal(min: number, max: number) {
  return parseFloat((((min + max) / 2) + (Math.random() - 0.5) * (max - min) * 0.6).toFixed(1));
}

function generateSensorData(): SensorValues {
  return {
    tds: genVal(150, 350), temperature: genVal(20, 32), ph: genVal(6.5, 8.5),
    dissolved_oxygen: genVal(4, 8), water_level: genVal(2, 6),
  };
}

function getSensorStatus(val: number, c: { warning: number; danger: number; inverted?: boolean }): 'Normal' | 'Warning' | 'Critical' {
  if (c.inverted) {
    if (val <= c.danger) return 'Critical';
    if (val <= c.warning) return 'Warning';
    return 'Normal';
  }
  if (val >= c.danger) return 'Critical';
  if (val >= c.warning) return 'Warning';
  return 'Normal';
}

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

interface AlertItem { id: string; time: string; type: string; severity: string; status: string; }

const pilotAlerts: AlertItem[] = [
  { id: 'p1', time: '10:32 PM', type: 'DO Warning — levels dropping at Node 2', severity: 'Medium', status: 'Active' },
  { id: 'p2', time: '10:15 PM', type: 'TDS Rising — industrial runoff detected', severity: 'Low', status: 'Active' },
  { id: 'p3', time: '09:48 PM', type: 'Routine Update — system health check passed', severity: 'Low', status: 'Resolved' },
  { id: 'p4', time: '09:22 PM', type: 'Temperature Alert — water temp rising', severity: 'Medium', status: 'Active' },
  { id: 'p5', time: '08:55 PM', type: 'pH Drift — slight deviation from neutral', severity: 'Low', status: 'Resolved' },
];

const severityStyle: Record<string, string> = {
  Critical: 'text-red-400 bg-red-500/10',
  High: 'text-orange-400 bg-orange-500/10',
  Medium: 'text-amber-400 bg-amber-500/10',
  Low: 'text-emerald-400 bg-emerald-500/10',
};

const deployColor: Record<string, string> = { active: '#10b981', future: '#f97316', planned: '#6b7280' };
const deployLabel: Record<string, string> = { active: 'Pilot Active', future: 'Future Expansion', planned: 'Not Deployed' };

const sensorIcons: Record<string, typeof Thermometer> = {
  temperature: ThermometerIcon, ph: TestTube, tds: Activity,
  dissolved_oxygen: Gauge, water_level: Radio,
};

const sensorUnits: Record<string, string> = {
  temperature: '°C', ph: '', tds: 'ppm', dissolved_oxygen: 'mg/L', water_level: 'm',
};

const sensorColors: Record<string, string> = {
  temperature: '#f59e0b', ph: '#8b5cf6', tds: '#3b82f6',
  dissolved_oxygen: '#10b981', water_level: '#ec4899',
};

export function DashboardHome() {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<SensorValues>(generateSensorData());
  const [alertCount, setAlertCount] = useState(0);
  const [selectedSW, setSelectedSW] = useState<StateWetland>(stateWetlands[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    const i = setInterval(() => {
      const d = generateSensorData();
      setSensors(d);
      const c = Object.keys(sensorThresholds)
        .reduce((sum, k) => sum + (getSensorStatus(d[k as keyof SensorValues], sensorThresholds[k]) === 'Critical' ? 1 : 0), 0);
      if (c > 0) setAlertCount(prev => prev + c);
    }, 5000);
    return () => { clearInterval(t); clearInterval(i); };
  }, []);

  const citizenStats = (() => {
    try {
      const c = JSON.parse(localStorage.getItem('avian_citizens') || '[]');
      return {
        total: c.length,
        pending: c.filter((x: any) => x.status === 'pending').length,
      };
    } catch {
      return { total: 0, pending: 0 };
    }
  })();

  const smsToday = (() => {
    try {
      return JSON.parse(localStorage.getItem('avian_alert_history') || '[]')
        .filter((a: any) => new Date(a.timestamp).toDateString() === new Date().toDateString()).length;
    } catch {
      return 0;
    }
  })();

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
                <h1 className="text-xl font-bold text-white">Nal Sarovar Command Center</h1>
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
            { icon: Server, label: 'Sensor Nodes', value: '5', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { icon: Radio, label: 'Connected Sensors', value: '30', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { icon: Users, label: 'Registered Citizens', value: citizenStats.total.toString(), color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: AlertTriangle, label: 'Active Alerts', value: alertCount.toString(), color: 'text-red-400', bg: 'bg-red-500/10' },
            { icon: Bell, label: "Today's SMS Sent", value: smsToday.toString(), color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { icon: Clock, label: 'Last Sync', value: '3s ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-3 bg-white/[0.03] rounded-xl border border-white/[0.06] px-4 py-3">
              <div className={`p-2 rounded-lg ${stat.bg} shrink-0`}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-[10px] text-gray-500">{stat.label}</div>
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
                  <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-400" /> 5 Sensor Nodes</span>
                  <span className="flex items-center gap-1"><Radio size={12} className="text-emerald-400" /> 30 Sensors Online</span>
                  <span className="flex items-center gap-1"><Users size={12} className="text-emerald-400" /> {citizenStats.total} Citizens</span>
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
              onClick={() => navigate('/dashboard/alert-center')}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              View All →
            </button>
          </div>
          <div className="flex-1 space-y-2">
            {pilotAlerts.map(a => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${a.status === 'Active' ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
                <span className="text-[10px] text-gray-500 w-16 shrink-0">{a.time}</span>
                <span className="text-xs text-gray-200 flex-1 min-w-0 truncate">{a.type}</span>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${severityStyle[a.severity]} shrink-0`}>{a.severity}</span>
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                  a.status === 'Active' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => navigate('/dashboard/alert-center')}
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
          <span className="ml-auto text-xs text-gray-500">Nal Sarovar · 5 key parameters · Auto-refresh every 5s</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(['temperature', 'ph', 'tds', 'dissolved_oxygen', 'water_level'] as const).map(key => {
            const value = sensors[key];
            const th = sensorThresholds[key];
            const status = getSensorStatus(value, th);
            const Icon = sensorIcons[key];
            return (
              <div key={key} className="bg-white/[0.04] rounded-xl border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${sensorColors[key]}20` }}>
                      <Icon size={14} style={{ color: sensorColors[key] }} />
                    </div>
                    <span className="text-xs font-medium text-gray-300 capitalize">
                      {key === 'dissolved_oxygen' ? 'Dissolved O₂' : key.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusStyle[status]}`}>{status}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{value}</span>
                  {sensorUnits[key] && <span className="text-xs text-gray-500">{sensorUnits[key]}</span>}
                </div>
                <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      status === 'Critical' ? 'bg-red-500' : status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (value / (th.danger * 1.3)) * 100)}%`,
                    }}
                  />
                </div>
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
                All 5 key parameters within safe operational range. No immediate intervention required.
                Continue standard monitoring schedule. Suggest reviewing TDS trend data — readings have
                increased 8% over the past 48 hours, potentially indicating early-stage industrial runoff.
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle size={12} />
                  Confidence: 96%
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={12} />
                  Updated 12s ago
                </div>
                <button
                  onClick={() => navigate('/dashboard/alerts')}
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
              { label: 'Registered', value: citizenStats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { label: 'Pending', value: citizenStats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { label: 'SMS Today', value: smsToday, icon: Send, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
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
