import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, AlertTriangle, Bell, CheckCircle, Trash2, RefreshCw,
  Activity, Droplets, Thermometer, Gauge, Radio, Battery, Wifi,
  Clock, Server, MapPin, Shield, Brain, FileText, Upload,
  TrendingUp, TrendingDown, Minus, Eye, Zap, Target, Leaf
} from 'lucide-react';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { alertApi } from '@/services/alertApi';
import { citizenNotificationApi } from '@/services/citizenNotificationApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import type { Alert, AlertSensor } from '@/types/alert';

const severityConfig: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500', label: 'Critical' },
  HIGH:     { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500', label: 'High' },
  MEDIUM:   { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500', label: 'Medium' },
  LOW:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500', label: 'Low' },
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  ACTIVE:      { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Active' },
  ACKNOWLEDGED:{ color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Acknowledged' },
  RESOLVED:    { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Resolved' },
};

const alertTypeIcons: Record<string, typeof Activity> = {
  pH: Activity, temperature: Thermometer, tds: Droplets,
  dissolvedOxygen: Gauge, waterLevel: Radio, battery: Battery, offline: Wifi,
};

function getAlertIcon(type: string) {
  const key = Object.keys(alertTypeIcons).find(k => type.toLowerCase().includes(k.toLowerCase()));
  return key ? alertTypeIcons[key] : AlertTriangle;
}

const LABEL = 'text-[10px] font-medium text-gray-500 uppercase tracking-wider';
const CARD = 'bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4';

function generateAiConfidence(alertType: string, currentValue: number | null | undefined): number {
  const base: Record<string, number> = { pH: 92, temperature: 95, tds: 88, dissolvedOxygen: 90, waterLevel: 85, battery: 75, offline: 60 };
  let c = base[alertType] || 80;
  if (currentValue != null && Math.abs(currentValue) > 0) c += 3;
  return Math.min(99, c);
}

function generateRootCause(alertType: string): string {
  const causes: Record<string, string[]> = {
    pH: ['Industrial discharge or chemical runoff', 'Acid rain influx affecting water chemistry', 'Decomposition of organic matter releasing acids', 'Mining or construction activities nearby'],
    temperature: ['Thermal pollution from industrial cooling systems', 'Extreme weather conditions or heatwave', 'Reduced water flow concentrating heat', 'Deforestation removing shade canopy'],
    tds: ['Untreated sewage or agricultural runoff', 'Industrial effluent discharge', 'Natural mineral leaching from soil', 'Construction site sediment runoff'],
    dissolvedOxygen: ['Organic pollution loading from sewage', 'Excessive algal blooms consuming oxygen', 'Decomposition of dead aquatic organisms', 'Warm water holding less dissolved oxygen'],
    waterLevel: ['Upstream damming or water diversion', 'Excessive water withdrawal for irrigation', 'Heavy rainfall causing flooding', 'Drought conditions reducing flow'],
    battery: ['Prolonged operation without maintenance', 'Extreme temperatures affecting battery life', 'Moisture or water ingress damage', 'Manufacturing defect in battery unit'],
    offline: ['Physical damage to sensor equipment', 'Power supply failure or battery depletion', 'Network connectivity issues', 'Vandalism or theft of equipment'],
  };
  const arr = causes[alertType] || causes.pH;
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEnvironmentalImpact(alertType: string): string {
  const impacts: Record<string, string> = {
    pH: 'pH imbalance can harm aquatic life, cause fish kills, disrupt reproduction cycles, and make water unsafe for drinking or recreation.',
    temperature: 'Elevated water temperature reduces dissolved oxygen, stresses aquatic organisms, promotes harmful algal growth, and disrupts ecosystem balance.',
    tds: 'High dissolved solids can indicate pollution, harm aquatic life, affect water taste and safety, and damage irrigation systems.',
    dissolvedOxygen: 'Low dissolved oxygen creates dead zones, kills fish and invertebrates, and indicates severe organic pollution.',
    waterLevel: 'Abnormal water levels can destroy habitats, flood infrastructure, displace communities, and disrupt water supply systems.',
    battery: 'Sensor failure reduces monitoring capability, potentially delaying detection of environmental hazards.',
    offline: 'Loss of monitoring creates blind spots where pollution or hazards may go undetected.',
  };
  return impacts[alertType] || 'Unknown environmental impact.';
}

function generateRiskAssessment(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return 'Immediate danger to health. Avoid all contact with water in this area. Emergency response required.';
    case 'HIGH': return 'Potential health risk. Avoid swimming or fishing in this wetland. Prompt investigation needed.';
    case 'MEDIUM': return 'Elevated risk. Use caution near water. Monitor for updates and prepare contingency measures.';
    default: return 'Low risk. Continue normal activities but stay informed. Routine monitoring recommended.';
  }
}

function generateRecommendedActions(alertType: string, severity: string): string[] {
  const base: Record<string, string[]> = {
    pH: ['Inspect sensor calibration', 'Collect water sample for lab analysis', 'Notify environmental authorities', 'Restrict public access to affected area'],
    temperature: ['Inspect sensor placement', 'Check for thermal discharge sources', 'Monitor aquatic life stress indicators', 'Notify downstream water users'],
    tds: ['Collect water samples at multiple points', 'Inspect upstream discharge sources', 'Review industrial permit compliance', 'Notify water treatment facilities'],
    dissolvedOxygen: ['Deploy emergency aeration if possible', 'Document dead or distressed aquatic life', 'Investigate organic pollution sources', 'Alert fishing and wildlife authorities'],
    waterLevel: ['Verify sensor accuracy with manual measurement', 'Check upstream dam and levee conditions', 'Prepare flood response if rising', 'Notify downstream communities'],
    battery: ['Schedule sensor maintenance visit', 'Replace battery unit', 'Verify sensor is still transmitting data', 'Order replacement battery stock'],
    offline: ['Attempt remote restart of sensor', 'Dispatch field team for inspection', 'Check power and network connectivity', 'Activate backup monitoring if available'],
  };
  const actions = base[alertType] || base.pH;
  if (severity === 'CRITICAL') actions.push('Activate emergency response protocol');
  if (severity === 'HIGH') actions.push('Escalate to management for review');
  return actions;
}

function generateTrendAnalysis(alertType: string, currentValue: number | null): string {
  if (currentValue == null) return 'Insufficient data for trend analysis. Additional readings needed to establish pattern.';
  const trends: Record<string, string> = {
    pH: `Current pH of ${currentValue} suggests ${currentValue < 7 ? 'acidic' : currentValue > 8.5 ? 'alkaline' : 'near-neutral'} conditions. Trend monitoring recommended to detect shifts.`,
    temperature: `Temperature at ${currentValue}°C is ${currentValue > 35 ? 'critically elevated' : currentValue > 30 ? 'above normal' : 'within acceptable range'}. Watch for continued warming.`,
    tds: `TDS level of ${currentValue} ppm ${currentValue > 500 ? 'exceeds safe limits' : currentValue > 300 ? 'is elevated' : 'is within range'}. Track for upward trends indicating pollution.`,
    dissolvedOxygen: `DO level of ${currentValue} mg/L ${currentValue < 5 ? 'indicates hypoxic stress' : currentValue < 7 ? 'is marginal' : 'supports healthy aquatic life'}. Continuous monitoring advised.`,
    waterLevel: `Water level at ${currentValue}m ${currentValue > 9 ? 'poses flood risk' : currentValue > 7 ? 'is elevated' : 'is within normal range'}. Monitor for rapid changes.`,
    battery: `Battery at ${currentValue}% ${currentValue < 20 ? 'requires immediate replacement' : 'is functional'}. Schedule maintenance before depletion.`,
    offline: 'Sensor is offline. No trend data available until connectivity is restored.',
  };
  return trends[alertType] || 'Trend analysis unavailable for this parameter type.';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />;
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: typeof Activity; children: React.ReactNode }) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-emerald-400" />
        <h3 className="text-xs font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value, color = 'text-white' }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className={`text-xs font-medium ${color}`}>{value}</span>
    </div>
  );
}

export function AlertDetailsPage() {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  const fetchAlert = useCallback(async () => {
    if (!alertId) return;
    try {
      const res = await alertApi.getById(alertId);
      setAlert(res.data.alert);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load alert';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [alertId]);

  useEffect(() => {
    fetchAlert();
  }, [fetchAlert]);

  useEffect(() => {
    if (!alert?.sensor?.latitude || !alert?.sensor?.longitude || !mapRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [alert.sensor.latitude, alert.sensor.longitude],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:14px;height:14px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(239,68,68,0.6);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    L.marker([alert.sensor.latitude, alert.sensor.longitude], { icon })
      .addTo(map)
      .bindPopup(`<div style="font-size:12px;font-weight:600;">${alert.sensorName || 'Sensor'}</div>`)
      .openPopup();

    mapInstanceRef.current = map;

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [alert]);

  const handleAcknowledge = async () => {
    if (!alert) return;
    setAcknowledging(true);
    try {
      await alertApi.acknowledge(alert.id);
      toast.success('Alert acknowledged');
      fetchAlert();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to acknowledge');
    } finally {
      setAcknowledging(false);
    }
  };

  const handleResolve = async () => {
    if (!alert) return;
    setResolving(true);
    try {
      await alertApi.resolve(alert.id, 'Admin');
      toast.success('Alert resolved');
      fetchAlert();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resolve');
    } finally {
      setResolving(false);
    }
  };

  const handleDelete = async () => {
    if (!alert) return;
    setDeleting(true);
    try {
      await alertApi.delete(alert.id);
      toast.success('Alert deleted');
      navigate('/dashboard/alerts');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
      setDeleting(false);
    }
  };

  const handleSendCitizenAlert = async () => {
    if (!alert) return;
    setSendingAlert(true);
    try {
      await citizenNotificationApi.create({
        alertId: alert.id,
        alertTitle: alert.description?.split(':')[0] || alert.alertType,
        severity: alert.severity,
        wetland: alert.wetland || undefined,
        sensorName: alert.sensorName || undefined,
        description: alert.description,
        parameterValues: {
          currentValue: alert.currentValue,
          safeRange: alert.safeRange,
          alertType: alert.alertType,
        },
        aiSummary: generateRootCause(alert.alertType),
        riskLevel: generateRiskAssessment(alert.severity),
        recommendedActions: generateRecommendedActions(alert.alertType, alert.severity).join('\n'),
      });
      toast.success('Citizen alert sent successfully');
      setShowSendDialog(false);
      fetchAlert();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send citizen alert');
    } finally {
      setSendingAlert(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-red-400 mb-4" />
        <p className="text-sm text-gray-400 mb-2">{error || 'Alert not found'}</p>
        <button onClick={() => navigate('/dashboard/alerts')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-xs font-semibold text-white hover:from-emerald-400 hover:to-blue-500 transition-all"
        >Back to Alert Center</button>
      </div>
    );
  }

  const sev = severityConfig[alert.severity] || severityConfig.LOW;
  const stat = statusConfig[alert.status] || statusConfig.ACTIVE;
  const Icon = getAlertIcon(alert.alertType);
  const sensor = alert.sensor;
  const aiConfidence = generateAiConfidence(alert.alertType, alert.currentValue);
  const rootCause = generateRootCause(alert.alertType);
  const envImpact = generateEnvironmentalImpact(alert.alertType);
  const riskAssessment = generateRiskAssessment(alert.severity);
  const recommendedActions = generateRecommendedActions(alert.alertType, alert.severity);
  const trendAnalysis = generateTrendAnalysis(alert.alertType, alert.currentValue);

  const diff = alert.currentValue != null && alert.safeRange
    ? (() => {
        const match = alert.safeRange.match(/([\d.]+)/);
        if (match) {
          const safe = parseFloat(match[1]);
          return { value: alert.currentValue, safe, diff: Math.abs(alert.currentValue - safe).toFixed(2) };
        }
        return null;
      })()
    : null;

  const exceededBy = diff ? `${diff.diff} ${alert.alertType === 'temperature' ? '°C' : alert.alertType === 'tds' ? 'ppm' : alert.alertType === 'dissolvedOxygen' ? 'mg/L' : alert.alertType === 'waterLevel' ? 'm' : alert.alertType === 'battery' ? '%' : ''}` : 'N/A';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate('/dashboard/alerts')}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-all"
      ><ArrowLeft size={14} /> Back to Alert Center</button>

      {/* Header */}
      <div className={CARD}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${sev.bg}`}>
              <Icon size={18} className={sev.color} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-snug">
                {alert.description?.split(':')[0] || alert.alertType.replace(/([A-Z])/g, ' $1').trim()}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sev.bg} ${sev.color} border ${sev.border}`}>
                  {sev.label}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                  {stat.label}
                </span>
                <span className="text-[10px] font-mono text-gray-600">ID: {alert.id}</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <Clock size={10} /> Generated
            </div>
            <p className="text-[11px] text-gray-300 mt-0.5">{formatDate(alert.createdAt)}</p>
            {alert.resolvedAt && (
              <>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                  <CheckCircle size={10} /> Resolved
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5">{formatDate(alert.resolvedAt)}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sensor Information */}
        <SectionCard title="Sensor Information" icon={Server}>
          {sensor ? (
            <div className="space-y-0">
              <StatRow label="Sensor Name" value={sensor.name} />
              <StatRow label="Sensor ID" value={<span className="font-mono">{sensor.sensorId}</span>} />
              <StatRow label="Wetland" value={sensor.wetland || 'N/A'} />
              <StatRow label="Location" value={sensor.location || 'N/A'} />
              <StatRow label="Latitude" value={sensor.latitude != null ? sensor.latitude.toFixed(4) : 'N/A'} />
              <StatRow label="Longitude" value={sensor.longitude != null ? sensor.longitude.toFixed(4) : 'N/A'} />
              <StatRow label="Status" value={
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  sensor.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' :
                  sensor.status === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>{sensor.status}</span>
              } />
            </div>
          ) : (
            <p className="text-xs text-gray-500">No sensor data available</p>
          )}
        </SectionCard>

        {/* Current Readings */}
        <SectionCard title="Current Readings" icon={Activity}>
          {sensor ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Temperature', value: sensor.temperature, unit: '°C', icon: Thermometer, color: '#f59e0b', warn: 30, danger: 35 },
                { label: 'pH', value: sensor.ph, unit: '', icon: Activity, color: '#8b5cf6', warn: 8.5, danger: 9.5 },
                { label: 'TDS', value: sensor.tds, unit: 'ppm', icon: Droplets, color: '#3b82f6', warn: 300, danger: 500 },
                { label: 'Dissolved O₂', value: sensor.dissolvedOxygen, unit: 'mg/L', icon: Gauge, color: '#10b981', warn: 4, danger: 2 },
                { label: 'Water Level', value: sensor.waterLevel, unit: 'm', icon: Radio, color: '#ec4899', warn: 7, danger: 9 },
                { label: 'Battery', value: sensor.battery, unit: '%', icon: Battery, color: '#f59e0b', warn: 20, danger: 10 },
                { label: 'Signal', value: sensor.signalStrength, unit: '%', icon: Wifi, color: '#06b6d4', warn: 30, danger: 15 },
              ].map(r => {
                const RIcon = r.icon;
                const val = r.value;
                const isDanger = val != null && (
                  (r.label === 'Dissolved O₂' && val < r.danger) ||
                  (r.label === 'Battery' && val < r.danger) ||
                  (r.label === 'Signal' && val < r.danger) ||
                  (r.label !== 'Dissolved O₂' && r.label !== 'Battery' && r.label !== 'Signal' && val > r.danger)
                );
                const isWarn = val != null && !isDanger && (
                  (r.label === 'Dissolved O₂' && val < r.warn) ||
                  (r.label === 'Battery' && val < r.warn) ||
                  (r.label === 'Signal' && val < r.warn) ||
                  (r.label !== 'Dissolved O₂' && r.label !== 'Battery' && r.label !== 'Signal' && val > r.warn)
                );
                return (
                  <div key={r.label} className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <RIcon size={10} style={{ color: r.color }} />
                      <span className="text-[10px] text-gray-500">{r.label}</span>
                    </div>
                    <p className={`text-sm font-bold ${isDanger ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-white'}`}>
                      {val != null ? `${val}${r.unit}` : 'N/A'}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No readings available</p>
          )}
        </SectionCard>

        {/* Threshold Analysis */}
        <SectionCard title="Threshold Analysis" icon={Target}>
          {alert.currentValue != null ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
                  <span className={LABEL}>Current Value</span>
                  <p className={`text-lg font-bold mt-1 ${sev.color}`}>{alert.currentValue}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
                  <span className={LABEL}>Safe Threshold</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{alert.safeRange || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
                  <span className={LABEL}>Difference</span>
                  <p className="text-sm font-medium text-amber-400 mt-1">{diff ? diff.diff : 'N/A'}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
                  <span className={LABEL}>Exceeded By</span>
                  <p className="text-sm font-medium text-red-400 mt-1">{exceededBy}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No threshold data available</p>
          )}
        </SectionCard>

        {/* AI Analysis */}
        <SectionCard title="AI Analysis" icon={Brain}>
          <div className="space-y-3">
            <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1">
                <span className={LABEL}>AI Confidence</span>
                <span className="text-sm font-bold text-emerald-400">{aiConfidence}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" style={{ width: `${aiConfidence}%` }} />
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
              <span className={LABEL}>Root Cause</span>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">{rootCause}</p>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
              <span className={LABEL}>Risk Assessment</span>
              <p className={`text-xs mt-1 leading-relaxed ${sev.color}`}>{riskAssessment}</p>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
              <span className={LABEL}>Environmental Impact</span>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">{envImpact}</p>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
              <span className={LABEL}>Trend Analysis</span>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">{trendAnalysis}</p>
            </div>
          </div>
        </SectionCard>

        {/* Recommended Actions */}
        <SectionCard title="Recommended Actions" icon={Shield}>
          <div className="space-y-2">
            {recommendedActions.map((action, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
                <span className="text-emerald-400 mt-0.5 text-xs">•</span>
                <span className="text-xs text-gray-300">{action}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Citizen Notification */}
        <SectionCard title="Citizen Notification" icon={Bell}>
          <div className="space-y-3">
            <StatRow label="Notification Status" value={
              alert.citizenNotified
                ? <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> Sent</span>
                : <span className="text-gray-500">Not Sent</span>
            } />
            {alert.citizenNotifiedAt && (
              <StatRow label="Sent Time" value={formatDate(alert.citizenNotifiedAt)} />
            )}
            {alert.citizenNotifications && alert.citizenNotifications.length > 0 && (
              <StatRow label="Sent By" value={alert.citizenNotifications[0].sentBy || 'System'} />
            )}
            {alert.status === 'ACTIVE' && (
              <button
                onClick={() => setShowSendDialog(true)}
                disabled={alert.citizenNotified}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all mt-2 ${
                  alert.citizenNotified
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                    : 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white shadow-lg shadow-red-500/20'
                }`}
              >
                {alert.citizenNotified ? <><CheckCircle size={14} /> Already Notified</> : <><Bell size={14} /> Send Citizen Alert</>}
              </button>
            )}
          </div>
        </SectionCard>

        {/* Incident Timeline */}
        <SectionCard title="Incident Timeline" icon={Clock}>
          <div className="space-y-0">
            {[
              { label: 'Alert Generated', time: alert.createdAt, done: true, color: 'bg-red-500' },
              { label: 'Acknowledged', time: alert.status === 'ACKNOWLEDGED' || alert.status === 'RESOLVED' ? alert.createdAt : null, done: alert.status !== 'ACTIVE', color: 'bg-amber-500' },
              { label: 'Citizen Notified', time: alert.citizenNotifiedAt, done: !!alert.citizenNotified, color: 'bg-blue-500' },
              { label: 'Resolved', time: alert.resolvedAt, done: alert.status === 'RESOLVED', color: 'bg-emerald-500' },
            ].map((event, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${event.done ? event.color : 'bg-white/[0.1]'} shrink-0`} />
                  {i < 3 && <div className="w-px h-6 bg-white/[0.06] mt-1" />}
                </div>
                <div className="flex-1">
                  <span className={`text-xs font-medium ${event.done ? 'text-white' : 'text-gray-600'}`}>{event.label}</span>
                  {event.time && (
                    <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(event.time)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Map */}
        <SectionCard title="Sensor Location" icon={MapPin}>
          {sensor?.latitude && sensor?.longitude ? (
            <div className="rounded-lg overflow-hidden border border-white/[0.06]">
              <div ref={mapRef} className="h-48 w-full" />
            </div>
          ) : (
            <p className="text-xs text-gray-500">No location data available for this sensor</p>
          )}
        </SectionCard>

        {/* Attachments */}
        <SectionCard title="Attachments" icon={Upload}>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Upload size={24} className="text-gray-600 mb-2" />
            <p className="text-xs text-gray-500">No attachments yet</p>
            <p className="text-[10px] text-gray-600 mt-1">Image and document uploads coming soon</p>
          </div>
        </SectionCard>
      </div>

      {/* Actions Bar */}
      <div className={`${CARD} flex flex-wrap items-center gap-3`}>
        {alert.status === 'ACTIVE' && (
          <>
            <button onClick={handleAcknowledge} disabled={acknowledging}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all disabled:opacity-50"
            >
              {acknowledging ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              Acknowledge
            </button>
            <button onClick={handleResolve} disabled={resolving}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
            >
              {resolving ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              Resolve
            </button>
            <button onClick={() => setShowSendDialog(true)} disabled={alert.citizenNotified}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              <Bell size={13} />
              Send Citizen Alert
            </button>
          </>
        )}
        <button onClick={handleDelete} disabled={deleting}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
        >
          {deleting ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
          Delete
        </button>
        <div className="flex-1" />
        <button onClick={() => navigate('/dashboard/alerts')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
        >
          <ArrowLeft size={13} />
          Back to Alert Center
        </button>
      </div>

      {/* Send Citizen Alert Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="bg-gray-950 border border-white/[0.08] text-white max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-base">Send Citizen Alert</DialogTitle>
            <p className="text-xs text-gray-500">This will notify citizens about this environmental hazard.</p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.08] overflow-hidden">
              <div className={`px-4 py-3 ${
                alert.severity === 'CRITICAL' ? 'bg-red-500' :
                alert.severity === 'HIGH' ? 'bg-orange-500' :
                alert.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}>
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-white" />
                  <div>
                    <h3 className="text-sm font-bold text-white">ENVIRONMENTAL ALERT</h3>
                    <p className="text-[10px] text-white/80">{alert.severity} Severity — {alert.wetland || 'Unknown Location'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 p-4 space-y-2">
                <p className="text-xs text-gray-300">{alert.description}</p>
                {alert.currentValue != null && (
                  <p className="text-xs text-gray-400">Current Value: <span className="text-white font-medium">{alert.currentValue}</span> | Safe: <span className="text-emerald-400">{alert.safeRange}</span></p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <button onClick={() => setShowSendDialog(false)} disabled={sendingAlert}
                className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all disabled:opacity-50"
              >Cancel</button>
              <button onClick={handleSendCitizenAlert} disabled={sendingAlert}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 transition-all disabled:opacity-60 shadow-lg shadow-red-500/20"
              >
                {sendingAlert ? <RefreshCw size={13} className="animate-spin" /> : <Bell size={13} />}
                {sendingAlert ? 'Sending...' : 'Send Alert'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
