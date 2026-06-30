import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity, Droplets, Thermometer, TestTube, Gauge, Wind, RefreshCw,
  Zap, Wifi, WifiOff, Battery, Signal, TrendingUp, Minus,
  Brain, FileText, AlertTriangle, Clock, CheckCircle, XCircle,
  BarChart3, Radio, ArrowUp, ArrowDown, Server
} from 'lucide-react';
import { SensorGauge } from '../SensorGauge';
import { MetricCard } from '../MetricCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface SensorConfig {
  id: string;
  label: string;
  icon: typeof Droplets;
  unit: string;
  min: number;
  max: number;
  color: string;
  warningThreshold: number;
  dangerThreshold: number;
  location: string;
}

interface SensorReading {
  value: number;
  trend: 'up' | 'down' | 'stable';
  status: 'Normal' | 'Warning' | 'Critical';
  battery: number;
  signalStrength: number;
  online: boolean;
  previousValue: number;
}

interface TrendDataPoint {
  time: string;
  value: number;
}

interface SensorEvent {
  id: string;
  sensorName: string;
  label: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  timestamp: Date;
}

const sensorConfigs: SensorConfig[] = [
  { id: 'tds', label: 'Total Dissolved Solids', icon: Droplets, unit: 'ppm', min: 0, max: 500, color: '#3b82f6', warningThreshold: 300, dangerThreshold: 400, location: 'Nal Sarovar Wetland' },
  { id: 'temperature', label: 'Water Temperature', icon: Thermometer, unit: '°C', min: 0, max: 40, color: '#f59e0b', warningThreshold: 30, dangerThreshold: 35, location: 'Chilika Lake' },
  { id: 'ph', label: 'pH Level', icon: TestTube, unit: '', min: 0, max: 14, color: '#8b5cf6', warningThreshold: 8.5, dangerThreshold: 9.5, location: 'Vembanad Wetland' },
  { id: 'turbidity', label: 'Turbidity', icon: Wind, unit: 'NTU', min: 0, max: 100, color: '#06b6d4', warningThreshold: 50, dangerThreshold: 80, location: 'Loktak Lake' },
  { id: 'dissolved_oxygen', label: 'Dissolved Oxygen', icon: Gauge, unit: 'mg/L', min: 0, max: 15, color: '#10b981', warningThreshold: 4, dangerThreshold: 2, location: 'Keoladeo National Park' },
  { id: 'water_level', label: 'Water Level', icon: Radio, unit: 'm', min: 0, max: 10, color: '#ec4899', warningThreshold: 7, dangerThreshold: 9, location: 'Sundarban Wetland' },
];

const eventMessages: Record<string, { critical: string[]; warning: string[]; info: string[] }> = {
  tds: {
    critical: ['TDS level critically high — industrial discharge suspected', 'TDS crossed emergency threshold — alerting GPCB'],
    warning: ['TDS approaching warning threshold', 'TDS levels rising — monitor closely'],
    info: ['TDS reading normalized', 'TDS within safe range — routine update'],
  },
  temperature: {
    critical: ['Temperature spike detected — thermal pollution risk', 'Water temperature critically high — aquatic life at risk'],
    warning: ['Temperature rising above seasonal average', 'Temperature approaching upper threshold'],
    info: ['Temperature stable', 'Temperature reading normal'],
  },
  ph: {
    critical: ['pH level critically high — acidic discharge detected', 'pH crossed danger threshold — ecosystem acidification risk'],
    warning: ['pH drifting from neutral range', 'pH approaching warning threshold'],
    info: ['pH level normalized', 'pH within optimal range'],
  },
  turbidity: {
    critical: ['Turbidity critically high — severe sedimentation event', 'Water clarity critically low — emergency dredging needed'],
    warning: ['Turbidity increasing — sediment runoff detected', 'Turbidity approaching warning level'],
    info: ['Turbidity levels decreasing', 'Water clarity improving'],
  },
  dissolved_oxygen: {
    critical: ['Dissolved oxygen critically low — fish kill risk', 'DO level critical — deploy emergency aeration'],
    warning: ['DO levels dropping — eutrophication warning', 'Dissolved oxygen approaching minimum threshold'],
    info: ['DO levels recovering', 'Dissolved oxygen normal'],
  },
  water_level: {
    critical: ['Water level critically high — flood risk imminent', 'Water level crossed danger mark — evacuation可能'],
    warning: ['Water level rising rapidly — monitor closely', 'Water level above seasonal average'],
    info: ['Water level stable', 'Water level within normal range'],
  },
};

const statusConfig = {
  Normal: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500', icon: CheckCircle },
  Warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-500', icon: AlertTriangle },
  Critical: { color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-500', icon: XCircle },
};

function generateSensorValue(min: number, max: number) {
  const mid = (min + max) / 2;
  return mid + (Math.random() - 0.5) * (max - min) * 0.6;
}

function getStatus(value: number, warning: number, danger: number, isInverted: boolean): 'Normal' | 'Warning' | 'Critical' {
  if (isInverted) {
    if (value <= danger) return 'Critical';
    if (value <= warning) return 'Warning';
    return 'Normal';
  }
  if (value >= danger) return 'Critical';
  if (value >= warning) return 'Warning';
  return 'Normal';
}

function getTrend(prev: number, curr: number): 'up' | 'down' | 'stable' {
  const diff = Math.abs(curr - prev);
  if (diff < 0.5) return 'stable';
  return curr > prev ? 'up' : 'down';
}

function getHealthScore(readings: Record<string, SensorReading>): { score: number; label: string; color: string } {
  const scores = Object.values(readings).map(r => {
    switch (r.status) {
      case 'Normal': return 100;
      case 'Warning': return 60;
      case 'Critical': return 20;
    }
  });
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  if (avg >= 80) return { score: avg, label: 'Excellent', color: 'text-emerald-400' };
  if (avg >= 50) return { score: avg, label: 'Fair', color: 'text-amber-400' };
  return { score: avg, label: 'Critical', color: 'text-red-400' };
}

function generateTrendHistory(count: number, config: SensorConfig): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  let val = generateSensorValue(config.min, config.max);
  const now = new Date();
  for (let i = count; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60000);
    val += (Math.random() - 0.5) * (config.max - config.min) * 0.08;
    val = Math.max(config.min, Math.min(config.max, val));
    data.push({
      time: t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat(val.toFixed(1)),
    });
  }
  return data;
}

function MiniTrendChart({ data, color, label, unit }: { data: TrendDataPoint[]; color: string; label: string; unit: string }) {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3 hover:bg-white/[0.05] transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <span className="text-xs text-gray-600">Last 60 min</span>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" tick={false} axisLine={false} />
          <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            formatter={(val: number) => [`${val} ${unit}`, label]}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${label.replace(/\s/g, '')})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LiveSensorsPage() {
  const navigate = useNavigate();
  const [readings, setReadings] = useState<Record<string, SensorReading>>({});
  const [trendHistory, setTrendHistory] = useState<Record<string, TrendDataPoint[]>>({});
  const [events, setEvents] = useState<SensorEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const eventIdRef = useRef(0);
  const prevReadingsRef = useRef<Record<string, number>>({});
  const readingsRef = useRef(readings);
  const sensorIds = useRef<Record<string, string>>({});
  sensorConfigs.forEach(s => {
    if (!sensorIds.current[s.id]) {
      sensorIds.current[s.id] = String(Math.floor(100 + Math.random() * 900));
    }
  });
  readingsRef.current = readings;

  useEffect(() => {
    const initial: Record<string, SensorReading> = {};
    const initialTrends: Record<string, TrendDataPoint[]> = {};
    const initialPrev: Record<string, number> = {};

    sensorConfigs.forEach(s => {
      const val = generateSensorValue(s.min, s.max);
      const isInverted = s.id === 'dissolved_oxygen';
      initial[s.id] = {
        value: val,
        trend: 'stable',
        status: getStatus(val, s.warningThreshold, s.dangerThreshold, isInverted),
        battery: Math.floor(60 + Math.random() * 40),
        signalStrength: Math.floor(70 + Math.random() * 30),
        online: true,
        previousValue: val,
      };
      initialPrev[s.id] = val;
      initialTrends[s.id] = generateTrendHistory(60, s);
    });

    setReadings(initial);
    setTrendHistory(initialTrends);
    prevReadingsRef.current = initialPrev;

    const events = generateInitialEvents(initial);
    setEvents(events);
    eventIdRef.current = events.length;

    const interval = setInterval(() => {
      setReadings(prev => {
        const updated = { ...prev };
        const newEvents: SensorEvent[] = [];

        sensorConfigs.forEach(s => {
          const oldVal = prev[s.id]?.value ?? generateSensorValue(s.min, s.max);
          const drift = (Math.random() - 0.5) * (s.max - s.min) * 0.1;
          const newVal = parseFloat(Math.max(s.min, Math.min(s.max, oldVal + drift)).toFixed(1));
          const isInverted = s.id === 'dissolved_oxygen';
          const status = getStatus(newVal, s.warningThreshold, s.dangerThreshold, isInverted);
          const trend = getTrend(oldVal, newVal);

          updated[s.id] = {
            value: newVal,
            trend,
            status: prev[s.id]?.online === false ? 'Normal' : status,
            battery: Math.max(5, (prev[s.id]?.battery ?? 100) - Math.random() * 0.2),
            signalStrength: Math.max(30, Math.min(100, (prev[s.id]?.signalStrength ?? 80) + (Math.random() - 0.5) * 5)),
            online: prev[s.id]?.online ?? true,
            previousValue: oldVal,
          };

          const prevStatus = getStatus(oldVal, s.warningThreshold, s.dangerThreshold, isInverted);
          if (status !== prevStatus || Math.abs(newVal - oldVal) > (s.max - s.min) * 0.2) {
            const msgs = eventMessages[s.id];
            const level = status === 'Critical' ? 'critical' : status === 'Warning' ? 'warning' : 'info';
            const pool = status === 'Critical' ? msgs.critical : status === 'Warning' ? msgs.warning : msgs.info;
            const msg = pool[Math.floor(Math.random() * pool.length)];
            eventIdRef.current++;
            newEvents.push({
              id: `evt-${eventIdRef.current}`,
              sensorName: s.id,
              label: s.label,
              message: msg,
              type: level as 'critical' | 'warning' | 'info',
              timestamp: new Date(),
            });
          }
        });

        if (newEvents.length > 0) {
          setEvents(prev => [...newEvents, ...prev].slice(0, 50));
        }
        return updated;
      });

      setTrendHistory(prev => {
        const updated = { ...prev };
        const currentReadings = readingsRef.current;
        sensorConfigs.forEach(s => {
          const val = currentReadings[s.id]?.value ?? generateSensorValue(s.min, s.max);
          const existing = updated[s.id] ?? [];
          const newPoint: TrendDataPoint = {
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: val,
          };
          updated[s.id] = [...existing.slice(-59), newPoint];
        });
        return updated;
      });

      setLastUpdated(new Date());

      if (Math.random() > 0.97) {
        setConnectionStatus(prev => prev === 'connected' ? 'disconnected' : 'connected');
        if (Math.random() > 0.5) {
          setTimeout(() => setConnectionStatus('connected'), 5000);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generateInitialEvents(readings: Record<string, SensorReading>): SensorEvent[] {
    const evts: SensorEvent[] = [];
    sensorConfigs.forEach(s => {
      const r = readings[s.id];
      if (!r) return;
      const level = r.status === 'Critical' ? 'critical' : r.status === 'Warning' ? 'warning' : 'info';
      const msgs = eventMessages[s.id];
      const pool = level === 'critical' ? msgs.critical : level === 'warning' ? msgs.warning : msgs.info;
      const msg = pool[Math.floor(Math.random() * pool.length)];
      eventIdRef.current++;
      evts.push({
        id: `evt-${eventIdRef.current}`,
        sensorName: s.id,
        label: s.label,
        message: msg,
        type: level,
        timestamp: new Date(Date.now() - Math.random() * 600000),
      });
    });
    return evts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  const health = getHealthScore(readings);
  const connectedCount = Object.values(readings).filter(r => r.online).length;
  const offlineCount = Object.values(readings).filter(r => !r.online).length;
  const displayEvents = useMemo(() => events.slice(0, 10), [events]);

  const getReading = (id: string, min: number, max: number) => {
    return readings[id]?.value ?? generateSensorValue(min, max);
  };

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
            <p className="text-sm text-gray-400">Real-time wetland sensor network — AI-powered environmental monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <RefreshCw size={12} className="text-emerald-400" />
          <span>Live · Updates every 3s</span>
        </div>
      </div>

      {/* TOP SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${health.score >= 80 ? 'bg-emerald-500/10' : health.score >= 50 ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
              <Activity size={14} className={health.color} />
            </div>
            <span className="text-xs text-gray-500">Wetland Health</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold ${health.color}`}>{health.score}%</span>
            <span className={`text-[10px] font-medium ${health.color}`}>{health.label}</span>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <Wifi size={14} className="text-emerald-400" />
            </div>
            <span className="text-xs text-gray-500">Connected</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-400">{connectedCount}</span>
            <span className="text-xs text-gray-500">/ {sensorConfigs.length} sensors</span>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-red-500/10">
              <WifiOff size={14} className="text-red-400" />
            </div>
            <span className="text-xs text-gray-500">Offline</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-bold ${offlineCount > 0 ? 'text-red-400' : 'text-gray-500'}`}>{offlineCount}</span>
            <span className="text-xs text-gray-500">sensors</span>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Clock size={14} className="text-blue-400" />
            </div>
            <span className="text-xs text-gray-500">Last Updated</span>
          </div>
          <div className="text-sm font-bold text-white">{lastUpdated.toLocaleTimeString('en-US')}</div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <Server size={14} className="text-emerald-400" />
            </div>
            <span className="text-xs text-gray-500">Connection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-sm font-bold ${connectionStatus === 'connected' ? 'text-emerald-400' : 'text-red-400'}`}>
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* LIVE SENSOR CARDS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-cyan-400" />
          <h2 className="text-base font-semibold text-white">Live Sensor Readings</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensorConfigs.map(s => {
            const reading = readings[s.id];
            const value = reading?.value ?? getReading(s.id, s.min, s.max);
            const trend = reading?.trend ?? 'stable';
            const status = reading?.status ?? 'Normal';
            const bat = reading?.battery ?? 100;
            const signal = reading?.signalStrength ?? 100;
            const online = reading?.online ?? true;
            const sc = statusConfig[status];
            const StatusIcon = sc.icon;
            const isInverted = s.id === 'dissolved_oxygen';
            const safeRange = isInverted
              ? `${s.dangerThreshold} — ${s.warningThreshold} ${s.unit}`
              : `${s.min} — ${s.warningThreshold} ${s.unit}`;

            return (
              <div key={s.id} className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 transition-all duration-300 hover:bg-white/[0.05] hover:shadow-xl ${!online ? 'opacity-60' : ''}`}>
                {/* Sensor Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${s.color}20` }}>
                      <s.icon size={16} style={{ color: s.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{s.label}</div>
                      <div className="text-[10px] font-mono text-gray-600">ID: {s.id.toUpperCase()}-{sensorIds.current[s.id]}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'} ${online ? 'animate-pulse' : ''}`} />
                    <span className={`text-[10px] font-medium ${sc.color}`}>{status}</span>
                  </div>
                </div>

                {/* Gauge */}
                <div className="flex justify-center -mt-2 -mb-2">
                  <SensorGauge
                    value={value}
                    min={s.min}
                    max={s.max}
                    unit={s.unit}
                    label=""
                    color={s.color}
                    warningThreshold={s.warningThreshold}
                    dangerThreshold={s.dangerThreshold}
                  />
                </div>

                {/* Details Footer */}
                <div className="mt-2 space-y-2">
                  {/* Safe Range & Trend */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-500">Safe Range:</span>
                      <span className="text-[10px] font-medium text-gray-400">{safeRange}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {trend === 'up' ? (
                        <ArrowUp size={12} className="text-red-400" />
                      ) : trend === 'down' ? (
                        <ArrowDown size={12} className="text-blue-400" />
                      ) : (
                        <Minus size={12} className="text-gray-500" />
                      )}
                      <span className={`text-[10px] font-medium ${trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-blue-400' : 'text-gray-500'}`}>
                        {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
                      </span>
                    </div>
                  </div>

                  {/* Battery & Signal */}
                  <div className="flex items-center justify-between px-1 pt-1.5 border-t border-white/[0.04]">
                    <div className="flex items-center gap-1.5">
                      <Battery size={11} className={bat > 50 ? 'text-emerald-400' : bat > 20 ? 'text-amber-400' : 'text-red-400'} />
                      <span className="text-[10px] text-gray-500">{Math.round(bat)}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Signal size={11} className={signal > 70 ? 'text-emerald-400' : signal > 40 ? 'text-amber-400' : 'text-red-400'} />
                      <span className="text-[10px] text-gray-500">{Math.round(signal)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-gray-600" />
                      <span className="text-[9px] text-gray-600">{lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIVE TREND ANALYSIS */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Live Trend Analysis</h2>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-auto">60 min view</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {sensorConfigs.filter(s => s.id !== 'dissolved_oxygen').map(s => (
            <MiniTrendChart
              key={s.id}
              data={trendHistory[s.id] ?? []}
              color={s.color}
              label={s.label}
              unit={s.unit}
            />
          ))}
        </div>
      </div>

      {/* SENSOR NETWORK STATUS + RECENT EVENTS + QUICK ACTIONS */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Network Status Table */}
        <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server size={16} className="text-blue-400" />
            <h2 className="text-base font-semibold text-white">Sensor Network Status</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-2.5 px-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Sensor</th>
                  <th className="text-left py-2.5 px-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2.5 px-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                  <th className="text-left py-2.5 px-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Signal</th>
                  <th className="text-left py-2.5 px-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {sensorConfigs.map(s => {
                  const r = readings[s.id];
                  if (!r) return null;
                  const sc = statusConfig[r.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-all">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${s.color}20` }}>
                            <s.icon size={12} style={{ color: s.color }} />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-white">{s.label}</span>
                            <span className="text-[10px] text-gray-600 block">{s.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon size={12} className={sc.color} />
                          <span className={`text-xs font-medium ${sc.color}`}>{r.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${r.battery > 50 ? 'bg-emerald-500' : r.battery > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${r.battery}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{Math.round(r.battery)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${r.signalStrength > 70 ? 'bg-emerald-500' : r.signalStrength > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${r.signalStrength}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{Math.round(r.signalStrength)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs text-gray-500">{lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Events + Quick Actions */}
        <div className="space-y-4">
          {/* Recent Sensor Events */}
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 max-h-[340px] overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <Zap size={16} className="text-amber-400" />
              <h2 className="text-base font-semibold text-white">Recent Events</h2>
            </div>
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
              {displayEvents.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No events recorded yet</p>
              ) : (
                displayEvents.map(evt => {
                  const sConfig = sensorConfigs.find(s => s.id === evt.sensorName);
                  const evtColor = evt.type === 'critical' ? 'text-red-400' : evt.type === 'warning' ? 'text-amber-400' : 'text-emerald-400';
                  const evtBg = evt.type === 'critical' ? 'bg-red-500/10 border-red-500/20' : evt.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20';
                  const evtIcon = evt.type === 'critical' ? XCircle : evt.type === 'warning' ? AlertTriangle : CheckCircle;
                  const EvtIcon = evtIcon;
                  return (
                    <div key={evt.id} className={`flex items-start gap-2 p-2 rounded-lg border ${evtBg} transition-all`}>
                      <EvtIcon size={12} className={`${evtColor} mt-0.5 shrink-0`} />
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-200 leading-tight">{evt.message}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-gray-600">{evt.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          {sConfig && (
                            <span className="text-[9px] text-gray-600" style={{ color: `${sConfig.color}99` }}>{sConfig.label}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
              <button onClick={() => navigate('/dashboard/alert-center')}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all">
                <AlertTriangle size={15} /> Open Alert Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
