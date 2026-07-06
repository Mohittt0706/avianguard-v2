import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  AlertTriangle, Bell, Search, X, CheckCircle, Clock, Trash2,
  Activity, Droplets, Thermometer, Gauge, Radio, Battery, Wifi,
  Eye, Zap, ChevronLeft, ChevronRight, Server, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { alertApi } from '@/services/alertApi';
import { citizenNotificationApi } from '@/services/citizenNotificationApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DarkSelect } from '../ui/DarkSelect';
import type { Alert, AlertSeverity, AlertStatus } from '@/types/alert';

const severityConfig: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500', label: 'Critical' },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500', label: 'High' },
  MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500', label: 'Medium' },
  LOW: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500', label: 'Low' },
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  ACTIVE: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Active' },
  ACKNOWLEDGED: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Acknowledged' },
  RESOLVED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Resolved' },
};

const alertTypeIcons: Record<string, typeof Activity> = {
  pH: Activity, temperature: Thermometer, tds: Droplets,
  dissolvedOxygen: Gauge, waterLevel: Radio, battery: Battery,
  offline: Wifi,
};

function getAlertIcon(type: string) {
  const key = Object.keys(alertTypeIcons).find(k => type.toLowerCase().includes(k.toLowerCase()));
  const Icon = key ? alertTypeIcons[key] : AlertTriangle;
  return Icon;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function generateRiskLevel(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return 'Immediate danger to health. Avoid all contact with water in this area.';
    case 'HIGH': return 'Potential health risk. Avoid swimming or fishing in this wetland.';
    case 'MEDIUM': return 'Elevated risk. Use caution near water. Monitor for updates.';
    default: return 'Low risk. Continue normal activities but stay informed.';
  }
}

function generateRecommendedActions(alertType: string, severity: string): string {
  const baseActions: Record<string, string[]> = {
    pH: ['Do not drink untreated water from this source', 'Avoid swimming or wading', 'Use bottled water for drinking and cooking'],
    temperature: ['Avoid swimming or water activities', 'Keep children and pets away from water', 'Report unusual water discoloration'],
    tds: ['Do not drink water without proper filtration', 'Use bottled water for drinking', 'Avoid cooking with this water'],
    dissolvedOxygen: ['Avoid fishing — fish may be stressed or dying', 'Do not release aquarium fish into waterways', 'Report dead fish to authorities'],
    waterLevel: ['Stay away from water edges — flood risk possible', 'Move to higher ground if water is rising rapidly', 'Do not attempt to cross flooded areas'],
    battery: ['Sensor maintenance in progress — monitoring may be delayed', 'Report any unusual water conditions to authorities', 'Stay informed through official channels'],
    offline: ['Monitoring temporarily suspended at this location', 'Exercise extra caution near this water body', 'Report any visible pollution or unusual conditions'],
  };

  const actions = baseActions[alertType] || baseActions.pH;
  if (severity === 'CRITICAL') {
    return actions.join('\n') + '\nEvacuate the immediate area if advised by authorities.';
  }
  return actions.join('\n');
}

function generateAiSummary(alertType: string, severity: string, currentValue: number | null | undefined, safeRange: string | null | undefined, wetland: string | null | undefined): string {
  const typeLabels: Record<string, string> = {
    pH: 'Water pH level',
    temperature: 'Water temperature',
    tds: 'Total dissolved solids',
    dissolvedOxygen: 'Dissolved oxygen',
    waterLevel: 'Water level',
    battery: 'Sensor battery',
    offline: 'Sensor connectivity',
  };
  const label = typeLabels[alertType] || alertType;
  const wetlandText = wetland ? ` at ${wetland}` : '';

  if (alertType === 'offline') {
    return `Sensor has gone offline${wetlandText}. Monitoring suspended. This may indicate physical damage, power loss, or communication failure.`;
  }
  if (alertType === 'battery') {
    return `Sensor battery is critically low${wetlandText}. Battery replacement required to maintain continuous monitoring.`;
  }

  const valueText = currentValue != null ? `${currentValue}` : 'unknown';
  const rangeText = safeRange || 'normal range';
  const severityDesc = severity === 'CRITICAL' ? 'critically' : severity === 'HIGH' ? 'significantly' : 'moderately';

  return `${label}${wetlandText} is ${valueText}, which is ${severityDesc} outside the safe range of ${rangeText}. This indicates potential environmental stress that requires attention.`;
}

function generateAiConfidence(alertType: string, currentValue: number | null | undefined): number {
  const baseConfidence: Record<string, number> = {
    pH: 92,
    temperature: 95,
    tds: 88,
    dissolvedOxygen: 90,
    waterLevel: 85,
    battery: 75,
    offline: 60,
  };
  let confidence = baseConfidence[alertType] || 80;
  if (currentValue != null && Math.abs(currentValue) > 0) confidence += 3;
  return Math.min(99, confidence);
}

function generateRootCause(alertType: string, currentValue: number | null | undefined): string {
  const causes: Record<string, string[]> = {
    pH: ['Industrial discharge or chemical runoff', 'Acid rain influx affecting water chemistry', 'Decomposition of organic matter releasing acids', 'Mining or construction activities nearby'],
    temperature: ['Thermal pollution from industrial cooling systems', 'Extreme weather conditions or heatwave', 'Reduced water flow concentrating heat', 'Deforestation removing shade canopy'],
    tds: ['Untreated sewage or agricultural runoff', 'Industrial effluent discharge', 'Natural mineral leaching from soil', 'Construction site sediment runoff'],
    dissolvedOxygen: ['Organic pollution loading from sewage', 'Excessive algal blooms consuming oxygen', 'Decomposition of dead aquatic organisms', 'Warm water holding less dissolved oxygen'],
    waterLevel: ['Upstream damming or water diversion', 'Excessive water withdrawal for irrigation', 'Heavy rainfall causing flooding', 'Drought conditions reducing flow'],
    battery: ['Prolonged operation without maintenance', 'Extreme temperatures affecting battery life', 'Moisture or water ingress damage', 'Manufacturing defect in battery unit'],
    offline: ['Physical damage to sensor equipment', 'Power supply failure or battery depletion', 'Network connectivity issues', 'Vandalism or theft of equipment'],
  };
  const typeCauses = causes[alertType] || causes.pH;
  return typeCauses[Math.floor(Math.random() * typeCauses.length)];
}

function generateEnvironmentalImpact(alertType: string, severity: string): string {
  const impacts: Record<string, string> = {
    pH: 'pH imbalance can harm aquatic life, cause fish kills, disrupt reproduction cycles, and make water unsafe for drinking or recreation.',
    temperature: 'Elevated water temperature reduces dissolved oxygen, stresses aquatic organisms, promotes harmful algal growth, and disrupts ecosystem balance.',
    tds: 'High dissolved solids can indicate pollution, harm aquatic life, affect water taste and safety, and damage irrigation systems.',
    dissolvedOxygen: 'Low dissolved oxygen creates dead zones, kills fish and invertebrates, and indicates severe organic pollution.',
    waterLevel: 'Abnormal water levels can destroy habitats, flood infrastructure, displace communities, and disrupt water supply systems.',
    battery: 'Sensor failure reduces monitoring capability, potentially delaying detection of environmental hazards.',
    offline: 'Loss of monitoring creates blind spots where pollution or hazards may go undetected.',
  };
  const impact = impacts[alertType] || 'Unknown environmental impact.';
  return impact;
}

function generateAiRecommendation(alertType: string, severity: string): string {
  const recommendations: Record<string, Record<string, string>> = {
    CRITICAL: {
      pH: 'IMMEDIATE ACTION: Activate emergency response protocol. Deploy rapid response team. Notify regulatory authorities. Issue public health advisory.',
      temperature: 'URGENT: Implement thermal discharge restrictions. Deploy cooling measures. Notify downstream water users. Initiate emergency monitoring.',
      tds: 'EMERGENCY: Stop all water activities. Deploy containment measures. Notify health department. Begin source tracking.',
      dissolvedOxygen: 'CRITICAL: Deploy emergency aeration systems. Evacuate aquatic life if possible. Issue public warning. Begin emergency sampling.',
      waterLevel: 'IMMEDIATE: Activate flood response. Evacuate low-lying areas. Deploy barriers. Notify emergency services.',
    },
    HIGH: {
      pH: 'Schedule immediate inspection. Increase monitoring frequency. Prepare contingency measures. Notify stakeholders.',
      temperature: 'Enhanced monitoring required. Review thermal discharge permits. Prepare mitigation measures. Alert downstream users.',
      tds: 'Increase sampling frequency. Review industrial discharge permits. Prepare filtration measures. Monitor trends closely.',
      dissolvedOxygen: 'Deploy additional monitoring. Review pollution sources. Prepare aeration measures. Alert fishing authorities.',
      waterLevel: 'Monitor closely. Review flood zones. Prepare evacuation plans. Check infrastructure integrity.',
    },
  };
  const severityRecs = recommendations[severity] || recommendations.HIGH;
  return severityRecs[alertType] || 'Conduct thorough investigation. Increase monitoring. Prepare response measures. Document findings.';
}

function generateSuggestedCitizenAction(alertType: string, severity: string): string {
  const actions: Record<string, string[]> = {
    pH: ['Do not drink untreated water', 'Avoid swimming or wading', 'Use bottled water for cooking', 'Keep pets away from water'],
    temperature: ['Avoid water activities', 'Keep children away from water', 'Report unusual odors or colors', 'Use alternative water sources'],
    tds: ['Do not drink water without filtration', 'Use bottled water', 'Avoid cooking with this water', 'Monitor for unusual taste or odor'],
    dissolvedOxygen: ['Avoid fishing - fish may be dying', 'Report dead fish to authorities', 'Do not release aquarium fish', 'Stay away from water edges'],
    waterLevel: ['Stay away from water edges', 'Do not cross flooded areas', 'Move to higher ground if needed', 'Monitor official alerts'],
    battery: ['No immediate citizen action required', 'Report sensor issues if visible', 'Stay informed through official channels', 'Continue normal activities'],
    offline: ['Exercise extra caution near water', 'Report visible pollution', 'Do not use untreated water', 'Stay informed through official channels'],
  };
  const typeActions = actions[alertType] || actions.pH;
  return typeActions.join('\n');
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />;
}

export function AlertCenterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const highlightAlertId = (location.state as { highlightAlert?: string } | null)?.highlightAlert;
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, critical: 0, high: 0, medium: 0, low: 0, acknowledged: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [detailsAlert, setDetailsAlert] = useState<Alert | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sendingAlert, setSendingAlert] = useState<Alert | null>(null);
  const [sending, setSending] = useState(false);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (severityFilter) params.severity = severityFilter;
      if (tab === 'active') params.status = 'ACTIVE';
      else if (tab === 'history' && statusFilter) params.status = statusFilter;
      else if (tab === 'history') params.status = 'ACKNOWLEDGED,RESOLVED';
      if (search.trim()) params.search = search.trim();

      const [alertRes, statsRes] = await Promise.all([
        alertApi.getAll(params),
        alertApi.getStats(),
      ]);
      setAlerts(alertRes.data.alerts);
      setTotalPages(alertRes.data.pagination.pages);
      setStats(statsRes.data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load alerts';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, tab, severityFilter, statusFilter, search]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
  }, [tab, severityFilter, statusFilter, search]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  useEffect(() => {
    if (highlightAlertId && alerts.length > 0) {
      const found = alerts.find(a => a.id === highlightAlertId);
      if (found) {
        setDetailsAlert(found);
        setTimeout(() => {
          highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
      window.history.replaceState({}, document.title);
    }
  }, [highlightAlertId, alerts]);

  useEffect(() => {
    function handleSensorUpdate() {
      fetchAlerts();
    }
    window.addEventListener('sensor:updated', handleSensorUpdate);
    return () => window.removeEventListener('sensor:updated', handleSensorUpdate);
  }, [fetchAlerts]);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try {
      await alertApi.resolve(id, 'Admin');
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resolve alert');
    } finally {
      setResolving(null);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await alertApi.acknowledge(id);
      toast.success('Alert acknowledged');
      fetchAlerts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await alertApi.delete(id);
      toast.success('Alert deleted');
      fetchAlerts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete alert');
    } finally {
      setDeleting(null);
    }
  };

  const handleSendCitizenAlert = async () => {
    if (!sendingAlert) return;
    setSending(true);
    try {
      const parameterValues: Record<string, unknown> = {};
      if (sendingAlert.currentValue != null) parameterValues.currentValue = sendingAlert.currentValue;
      if (sendingAlert.safeRange) parameterValues.safeRange = sendingAlert.safeRange;
      if (sendingAlert.wetland) parameterValues.wetland = sendingAlert.wetland;
      parameterValues.alertType = sendingAlert.alertType;

      const alertTitle = sendingAlert.description?.split(':')[0] || sendingAlert.alertType.replace(/([A-Z])/g, ' $1').trim();
      const aiSummary = generateAiSummary(sendingAlert.alertType, sendingAlert.severity, sendingAlert.currentValue, sendingAlert.safeRange, sendingAlert.wetland);
      const riskLevel = generateRiskLevel(sendingAlert.severity);
      const recommendedActions = generateRecommendedActions(sendingAlert.alertType, sendingAlert.severity);

      await citizenNotificationApi.create({
        alertId: sendingAlert.id,
        alertTitle,
        severity: sendingAlert.severity,
        wetland: sendingAlert.wetland || undefined,
        sensorName: sendingAlert.sensorName || undefined,
        description: sendingAlert.description,
        parameterValues,
        aiSummary,
        riskLevel,
        recommendedActions,
      });
      toast.success('Citizen alert sent');
      setSendingAlert(null);
      fetchAlerts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send citizen alert');
    } finally {
      setSending(false);
    }
  };

  const displayAlerts = useMemo(() => alerts, [alerts]);

  if (loading && alerts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-72" /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (error && alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-red-400 mb-4" />
        <p className="text-sm text-gray-400 mb-2">Failed to load alerts</p>
        <p className="text-xs text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-xs font-semibold text-white hover:from-emerald-400 hover:to-blue-500 transition-all"
        >Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-red-500/10 rounded-xl">
          <Bell size={22} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Alert Center</h1>
          <p className="text-sm text-gray-400">Smart alert engine — auto-generated from sensor readings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Alerts', value: stats.active, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Critical', value: stats.critical, icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'High', value: stats.high, icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Total', value: stats.total, icon: Bell, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <Icon size={14} className={stat.color} />
                </div>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <span className="text-xl font-bold text-white">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['active', 'history'] as const).map(t => (
            <button key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t
                  ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {t === 'active' ? 'Active Alerts' : 'Alert History'}
              {t === 'active' && stats.active > 0 && (
                <span className="ml-1.5 px-1 py-0.5 rounded text-[9px] bg-red-500/20 text-red-400">{stats.active}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search alerts..."
              className="w-40 pl-7 pr-2 py-1.5 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/30 transition-all"
            />
          </div>
          {/* Severity filter */}
          <DarkSelect value={severityFilter} onChange={setSeverityFilter}
            options={[
              { value: '', label: 'All Severity' },
              { value: 'CRITICAL', label: 'Critical' },
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' },
            ]} />
          {tab === 'history' && (
            <DarkSelect value={statusFilter} onChange={setStatusFilter}
              options={[
                { value: '', label: 'All Status' },
                { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
                { value: 'RESOLVED', label: 'Resolved' },
              ]} />
          )}
        </div>
      </div>

      {/* Alert List */}
      {displayAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.03] rounded-2xl border border-white/[0.06]">
          <Bell size={40} className="text-gray-600 mb-4" />
          <p className="text-sm text-gray-400 mb-1">No alerts found</p>
          <p className="text-xs text-gray-600">{tab === 'active' ? 'All sensors are operating within normal parameters' : 'No alert history matches your filters'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayAlerts.map(alert => (() => {
            const isHighlighted = highlightAlertId === alert.id;
            const sev = severityConfig[alert.severity] || severityConfig.LOW;
            const stat = statusConfig[alert.status] || statusConfig.ACTIVE;
            const Icon = getAlertIcon(alert.alertType);
            const isResolving = resolving === alert.id;
            const isDeleting = deleting === alert.id;

            return (
              <div key={alert.id}
                ref={isHighlighted ? highlightRef : undefined}
                className={`group bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-200 ${isResolving || isDeleting ? 'opacity-50 pointer-events-none' : ''} ${isHighlighted ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5' : ''}`}
              >
                <div className="flex items-stretch gap-0">
                  {/* Severity bar */}
                  <div className={`w-1 rounded-l-xl shrink-0 ${alert.severity === 'CRITICAL' ? 'bg-red-500' : alert.severity === 'HIGH' ? 'bg-orange-500' : alert.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-lg ${sev.bg} shrink-0 mt-0.5`}>
                          <Icon size={14} className={sev.color} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-semibold ${sev.color}`}>{severityConfig[alert.severity].label}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${stat.bg} ${stat.color}`}>{stat.label}</span>
                            <span className="text-[10px] font-mono text-gray-600">{alert.id.slice(0, 8)}</span>
                          </div>
                          <p className="text-sm font-medium text-white mt-0.5 leading-snug break-words">{alert.description}</p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            {alert.sensorName && (
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Server size={9} className="text-gray-600" /> {alert.sensorName}
                              </span>
                            )}
                            {alert.wetland && (
                              <span className="text-[10px] text-gray-500">{alert.wetland}</span>
                            )}
                            {alert.currentValue != null && (
                              <span className="text-[10px] text-gray-500">Value: <span className="text-gray-300 font-medium">{alert.currentValue}</span></span>
                            )}
                            {alert.safeRange && (
                              <span className="text-[10px] text-gray-500">Safe: <span className="text-gray-300">{alert.safeRange}</span></span>
                            )}
                            <span className="text-[10px] text-gray-600 flex items-center gap-1">
                              <Clock size={9} /> {formatTime(alert.createdAt)}
                            </span>
                            {alert.citizenNotified && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Citizen Notified</span>
                            )}
                            {alert.resolvedBy && (
                              <span className="text-[10px] text-gray-600">Resolved by: {alert.resolvedBy}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => navigate(`/dashboard/alerts/${alert.id}`)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.06] transition-all"
                          title="View Details"
                        ><Eye size={13} /></button>
                        {alert.status === 'ACTIVE' && (
                          <>
                            <button onClick={() => handleAcknowledge(alert.id)}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                              title="Acknowledge"
                            ><CheckCircle size={13} /></button>
                            <button onClick={() => handleResolve(alert.id)}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                              title="Resolve"
                            >{isResolving ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}</button>
                          </>
                        )}
                        <button onClick={() => handleDelete(alert.id)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete"
                        >{isDeleting ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })())}
          </div>
        )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          ><ChevronLeft size={14} /></button>
          <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          ><ChevronRight size={14} /></button>
        </div>
      )}

      {/* Details Drawer */}
      {detailsAlert && (
        <AlertDetailsDrawer alert={detailsAlert} onClose={() => setDetailsAlert(null)}
          onResolve={handleResolve} onAcknowledge={handleAcknowledge}
          onDelete={handleDelete} onSendCitizenAlert={(alert) => setSendingAlert(alert)}
          citizenNotified={detailsAlert.citizenNotified || false}
        />
      )}

      {/* Send Citizen Alert Dialog */}
      <Dialog open={!!sendingAlert} onOpenChange={(open) => { if (!open) setSendingAlert(null); }}>
        <DialogContent className="bg-gray-950 border border-white/[0.08] text-white max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-base">Emergency Citizen Alert Preview</DialogTitle>
            <p className="text-xs text-gray-500">This is what citizens will receive. Review before sending.</p>
          </DialogHeader>
          {sendingAlert && (
            <div className="space-y-4">
              {/* Citizen Alert Preview Card */}
              <div className="rounded-xl border border-white/[0.08] overflow-hidden">
                {/* Header Banner */}
                <div className={`px-4 py-3 ${
                  sendingAlert.severity === 'CRITICAL' ? 'bg-red-500' :
                  sendingAlert.severity === 'HIGH' ? 'bg-orange-500' :
                  sendingAlert.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚨</span>
                      <div>
                        <h3 className="text-sm font-bold text-white">ENVIRONMENTAL ALERT</h3>
                        <p className="text-[10px] text-white/80">{sendingAlert.severity} Severity</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white`}>
                      {sendingAlert.severity}
                    </span>
                  </div>
                </div>

                {/* Alert Content */}
                <div className="bg-gray-900 p-4 space-y-3">
                  {/* Alert Title */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Alert</p>
                    <p className="text-sm font-semibold text-white">
                      {sendingAlert.description?.split(':')[0] || sendingAlert.alertType.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>

                  {/* Wetland & Sensor */}
                  <div className="grid grid-cols-2 gap-3">
                    {sendingAlert.wetland && (
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Location</p>
                        <p className="text-xs font-medium text-white">{sendingAlert.wetland}</p>
                      </div>
                    )}
                    {sendingAlert.sensorName && (
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Sensor</p>
                        <p className="text-xs font-medium text-white">{sendingAlert.sensorName}</p>
                      </div>
                    )}
                  </div>

                  {/* Current Value & Safe Range */}
                  {sendingAlert.currentValue != null && (
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Current Value</p>
                        <p className={`text-sm font-bold ${
                          sendingAlert.severity === 'CRITICAL' ? 'text-red-400' :
                          sendingAlert.severity === 'HIGH' ? 'text-orange-400' :
                          'text-amber-400'
                        }`}>{sendingAlert.currentValue}</p>
                      </div>
                      {sendingAlert.safeRange && (
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Safe Range</p>
                          <p className="text-sm font-medium text-emerald-400">{sendingAlert.safeRange}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Summary */}
                  <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">AI Assessment</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {generateAiSummary(sendingAlert.alertType, sendingAlert.severity, sendingAlert.currentValue, sendingAlert.safeRange, sendingAlert.wetland)}
                    </p>
                  </div>

                  {/* Risk Level */}
                  <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Risk Level</p>
                    <p className={`text-xs font-semibold ${
                      sendingAlert.severity === 'CRITICAL' ? 'text-red-400' :
                      sendingAlert.severity === 'HIGH' ? 'text-orange-400' :
                      sendingAlert.severity === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>{sendingAlert.severity}</p>
                    <p className="text-[11px] text-gray-300 mt-1">
                      {generateRiskLevel(sendingAlert.severity)}
                    </p>
                  </div>

                  {/* Recommended Actions */}
                  <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Recommended Actions</p>
                    <div className="text-[11px] text-gray-300 space-y-1">
                      {generateRecommendedActions(sendingAlert.alertType, sendingAlert.severity).split('\n').map((action, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] text-gray-600">
                      {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-gray-600">AvianGuard Wetland Monitoring</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <button type="button" onClick={() => setSendingAlert(null)} disabled={sending}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button type="button" onClick={handleSendCitizenAlert} disabled={sending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                >
                  {sending ? <RefreshCw size={13} className="animate-spin" /> : <Bell size={13} />}
                  {sending ? 'Sending...' : 'Send Alert'}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AlertDetailsDrawer({
  alert, onClose, onResolve, onAcknowledge, onDelete, onSendCitizenAlert, citizenNotified,
}: {
  alert: Alert;
  onClose: () => void;
  onResolve: (id: string) => void;
  onAcknowledge: (id: string) => void;
  onDelete: (id: string) => void;
  onSendCitizenAlert: (alert: Alert) => void;
  citizenNotified: boolean;
}) {
  const sev = severityConfig[alert.severity] || severityConfig.LOW;
  const stat = statusConfig[alert.status] || statusConfig.ACTIVE;
  const Icon = getAlertIcon(alert.alertType);
  const aiConfidence = generateAiConfidence(alert.alertType, alert.currentValue);
  const rootCause = generateRootCause(alert.alertType, alert.currentValue);
  const environmentalImpact = generateEnvironmentalImpact(alert.alertType, alert.severity);
  const aiRecommendation = generateAiRecommendation(alert.alertType, alert.severity);
  const suggestedCitizenAction = generateSuggestedCitizenAction(alert.alertType, alert.severity);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-950 border-l border-white/[0.08] shadow-2xl overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-gray-950/95 backdrop-blur-sm border-b border-white/[0.06] px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${sev.bg}`}>
              <Icon size={16} className={sev.color} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Alert Details</h3>
              <span className="text-[10px] font-mono text-gray-600">{alert.id}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Alert Title */}
          <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Alert</span>
            <p className="text-sm font-semibold text-white mt-1">
              {alert.description?.split(':')[0] || alert.alertType.replace(/([A-Z])/g, ' $1').trim()}
            </p>
          </div>

          {/* Severity + Status + AI Confidence */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <span className="text-[10px] text-gray-500">Severity</span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-2 h-2 rounded-full ${sev.dot}`} />
                <span className={`text-xs font-semibold ${sev.color}`}>{sev.label}</span>
              </div>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <span className="text-[10px] text-gray-500">Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${stat.bg} ${stat.color}`}>{stat.label}</span>
              </div>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <span className="text-[10px] text-gray-500">AI Confidence</span>
              <p className="text-sm font-bold text-emerald-400 mt-1">{aiConfidence}%</p>
            </div>
          </div>

          {/* Sensor Info */}
          {alert.sensorName && (
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <span className="text-[10px] text-gray-500">Sensor</span>
              <p className="text-sm font-medium text-white mt-1">{alert.sensorName}</p>
            </div>
          )}

          {/* Wetland */}
          {alert.wetland && (
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <span className="text-[10px] text-gray-500">Wetland</span>
              <p className="text-sm font-medium text-white mt-1">{alert.wetland}</p>
            </div>
          )}

          {/* Value + Safe Range */}
          <div className="grid grid-cols-2 gap-3">
            {alert.currentValue != null && (
              <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                <span className="text-[10px] text-gray-500">Current Reading</span>
                <p className={`text-lg font-bold ${sev.color} mt-0.5`}>{alert.currentValue}</p>
              </div>
            )}
            {alert.safeRange && (
              <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                <span className="text-[10px] text-gray-500">Safe Threshold</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">{alert.safeRange}</p>
              </div>
            )}
          </div>

          {/* Root Cause Analysis */}
          <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Root Cause Analysis</span>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{rootCause}</p>
          </div>

          {/* Environmental Impact */}
          <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Environmental Impact</span>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{environmentalImpact}</p>
          </div>

          {/* AI Recommendation */}
          <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">AI Recommendation</span>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{aiRecommendation}</p>
          </div>

          {/* Suggested Citizen Action */}
          <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Suggested Citizen Action</span>
            <div className="text-xs text-gray-300 mt-1 space-y-1">
              {suggestedCitizenAction.split('\n').map((action, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Times */}
          <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Timeline</span>
            <div className="space-y-1.5 mt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Generated</span>
                <span className="text-gray-300">{new Date(alert.createdAt).toLocaleString()}</span>
              </div>
              {alert.resolvedAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Resolved</span>
                  <span className="text-gray-300">{new Date(alert.resolvedAt).toLocaleString()}</span>
                </div>
              )}
              {alert.resolvedBy && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Resolved By</span>
                  <span className="text-gray-300">{alert.resolvedBy}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            {/* Citizen Alert Button */}
            {alert.status === 'ACTIVE' && (
              <button
                onClick={() => { onSendCitizenAlert(alert); }}
                disabled={citizenNotified}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  citizenNotified
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                    : 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white shadow-lg shadow-red-500/20'
                }`}
              >
                {citizenNotified ? (
                  <><CheckCircle size={16} /> Citizen Notified</>
                ) : (
                  <><Bell size={16} /> Send Citizen Alert</>
                )}
              </button>
            )}

            {/* Acknowledge + Resolve */}
            {alert.status === 'ACTIVE' && (
              <div className="flex gap-2">
                <button onClick={() => { onAcknowledge(alert.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                ><CheckCircle size={13} /> Acknowledge</button>
                <button onClick={() => { onResolve(alert.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/10"
                ><CheckCircle size={13} /> Resolve</button>
              </div>
            )}

            {/* Delete */}
            <button onClick={() => { onDelete(alert.id); onClose(); }}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
            ><Trash2 size={13} /> Delete Alert</button>

            {/* Close */}
            <button onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
            >Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
