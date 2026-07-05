import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, User, Shield, Key, Mail, Phone, MapPin, Building2, Clock,
  CheckCircle, XCircle, Ban, AlertTriangle, RefreshCw, Trash2, Edit3,
  Activity, Bell, FileText, Eye, LogIn, LogOut, Settings, Edit,
  Calendar, Globe, Smartphone, Monitor, Wifi, AlertOctagon, Loader2,
  Droplets, MessageSquare, AtSign, Send, Download, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { citizenApi } from '@/services/citizenApi';
import type { CitizenWithDetails, CitizenAlertNotification, CitizenAuditLog, STATUS_CONFIG, RISK_CONFIG, CitizenStatus } from '@/types/citizen';
import { STATUS_CONFIG as STATUS_CONFIG_MAP, RISK_CONFIG as RISK_CONFIG_MAP } from '@/types/citizen';
import { SendAlertModal } from '@/app/components/ui/SendAlertModal';
import { useAuth } from '@/context/AuthContext';

// ===================== CONSTANTS =====================

const LABEL = 'text-[10px] font-medium text-gray-500 uppercase tracking-wider';
const CARD = 'bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-5';

const ACTION_ICON_MAP: Record<string, typeof Activity> = {
  create: CheckCircle,
  update: Edit,
  delete: Trash2,
  send_alert: Send,
  login: LogIn,
  logout: LogOut,
  toggle_status: Shield,
  bulk_action: Settings,
};

const ACTION_COLOR_MAP: Record<string, string> = {
  create: 'bg-emerald-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500',
  send_alert: 'bg-amber-500',
  login: 'bg-purple-500',
  logout: 'bg-gray-500',
  toggle_status: 'bg-cyan-500',
  bulk_action: 'bg-orange-500',
};

// ===================== HELPERS =====================

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />;
}

function StatRow({ label, value, color = 'text-white' }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className={`text-xs font-medium ${color}`}>{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action }: {
  title: string; icon: typeof Activity; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-emerald-400" />
          <h3 className="text-xs font-semibold text-white">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ===================== MAIN COMPONENT =====================

export function CitizenProfilePage() {
  const { citizenId } = useParams<{ citizenId: string }>();
  const navigate = useNavigate();
  const { hasPermission, user: currentUser } = useAuth();
  const canUpdate = hasPermission('citizens', 'update') || currentUser?.role === 'SUPER_ADMIN';
  const canDelete = hasPermission('citizens', 'delete') || currentUser?.role === 'SUPER_ADMIN';

  const [citizen, setCitizen] = useState<CitizenWithDetails | null>(null);
  const [notifications, setNotifications] = useState<CitizenAlertNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [showSendAlert, setShowSendAlert] = useState(false);

  const [editingRisk, setEditingRisk] = useState(false);
  const [riskValue, setRiskValue] = useState('');
  const [savingRisk, setSavingRisk] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    occupation: '',
    language: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCitizen = useCallback(async () => {
    if (!citizenId) return;
    try {
      const res = await citizenApi.getById(citizenId);
      setCitizen(res.data.citizen);
      setRiskValue(res.data.citizen.riskLevel || 'safe');
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load citizen');
    } finally {
      setLoading(false);
    }
  }, [citizenId]);

  const fetchNotifications = useCallback(async () => {
    if (!citizenId) return;
    try {
      const res = await citizenApi.getNotifications(citizenId);
      setNotifications(res.data);
    } catch {
      // silent
    }
  }, [citizenId]);

  useEffect(() => {
    fetchCitizen();
    fetchNotifications();
  }, [fetchCitizen, fetchNotifications]);

  const handleDelete = async () => {
    if (!citizenId) return;
    setDeleting(true);
    try {
      await citizenApi.delete(citizenId);
      toast.success('Citizen deleted');
      navigate('/dashboard/citizens');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!citizenId || !citizen) return;
    setToggling(true);
    const newStatus = citizen.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    try {
      await citizenApi.updateStatus(citizenId, newStatus);
      toast.success(`Citizen ${newStatus === 'DISABLED' ? 'disabled' : 'enabled'}`);
      fetchCitizen();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle status');
    } finally {
      setToggling(false);
    }
  };

  const handleSaveRisk = async () => {
    if (!citizenId) return;
    setSavingRisk(true);
    try {
      await citizenApi.update(citizenId, { riskLevel: riskValue });
      toast.success('Risk level updated');
      setEditingRisk(false);
      fetchCitizen();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update risk level');
    } finally {
      setSavingRisk(false);
    }
  };

  const handleStartEdit = () => {
    if (!citizen) return;
    setEditForm({
      fullName: citizen.fullName,
      mobile: citizen.mobile,
      whatsapp: citizen.whatsapp || '',
      email: citizen.email || '',
      occupation: citizen.occupation || '',
      language: citizen.language,
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!citizenId) return;
    setSavingEdit(true);
    try {
      await citizenApi.update(citizenId, {
        fullName: editForm.fullName,
        mobile: editForm.mobile,
        whatsapp: editForm.whatsapp || undefined,
        email: editForm.email || undefined,
        occupation: editForm.occupation || undefined,
        language: editForm.language,
      });
      toast.success('Citizen updated');
      setEditing(false);
      fetchCitizen();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update citizen');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !citizen) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-red-400 mb-4" />
        <p className="text-sm text-gray-400 mb-2">{error || 'Citizen not found'}</p>
        <button onClick={() => navigate('/dashboard/citizens')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-xs font-semibold text-white hover:from-emerald-400 hover:to-blue-500 transition-all"
        >Back to Citizens</button>
      </div>
    );
  }

  const st = STATUS_CONFIG_MAP[citizen.status];
  const rc = RISK_CONFIG_MAP[citizen.riskLevel] || RISK_CONFIG_MAP.safe;
  const auditLogs = citizen.auditLogs || [];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate('/dashboard/citizens')}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-all"
      ><ArrowLeft size={14} /> Back to Citizens</button>

      {/* Profile Header */}
      <div className={CARD}>
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg shadow-emerald-500/10">
            {getInitials(citizen.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">{citizen.fullName}</h1>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.bg} ${st.color} border-current`}>{st.label}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rc.bg} ${rc.color}`}>{rc.label}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="text-[10px] text-gray-500 flex items-center gap-1"><Phone size={10} /> {citizen.mobile}</span>
              {citizen.email && <span className="text-[10px] text-gray-500 flex items-center gap-1"><Mail size={10} /> {citizen.email}</span>}
              <span className="text-[10px] text-gray-500 flex items-center gap-1"><Droplets size={10} /> {citizen.nearbyWetland}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 1/3 */}
        <div className="space-y-6">
          {/* Personal Details */}
          <SectionCard title="Personal Details" icon={User}>
            <div className="space-y-0">
              <StatRow label="Full Name" value={citizen.fullName} />
              <StatRow label="Mobile" value={citizen.mobile} />
              {citizen.whatsapp && <StatRow label="WhatsApp" value={<span className="text-emerald-400">{citizen.whatsapp}</span>} />}
              {citizen.email && <StatRow label="Email" value={<span className="text-blue-400">{citizen.email}</span>} />}
              {citizen.dateOfBirth && <StatRow label="Date of Birth" value={citizen.dateOfBirth} />}
              {citizen.gender && <StatRow label="Gender" value={citizen.gender} />}
              {citizen.occupation && <StatRow label="Occupation" value={citizen.occupation} />}
              <StatRow label="Language" value={citizen.language} />
            </div>
          </SectionCard>

          {/* Emergency Contact */}
          {(citizen.emergencyName || citizen.emergencyMobile) && (
            <SectionCard title="Emergency Contact" icon={AlertTriangle}>
              <div className="space-y-0">
                {citizen.emergencyName && <StatRow label="Name" value={citizen.emergencyName} />}
                {citizen.emergencyMobile && <StatRow label="Mobile" value={citizen.emergencyMobile} />}
                {citizen.emergencyRelationship && <StatRow label="Relationship" value={citizen.emergencyRelationship} />}
              </div>
            </SectionCard>
          )}

          {/* Quick Actions */}
          <SectionCard title="Quick Actions" icon={Key}>
            <div className="space-y-2">
              <button onClick={() => setShowSendAlert(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all"
              >
                <Send size={13} /> Send Alert
              </button>
              {canUpdate && (
                <button onClick={handleStartEdit}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                >
                  <Edit3 size={13} /> Edit Citizen
                </button>
              )}
              {canUpdate && (
                <button onClick={() => setConfirmToggle(true)} disabled={toggling}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
                >
                  {toggling ? <RefreshCw size={13} className="animate-spin" /> : <Ban size={13} />}
                  {citizen.status === 'DISABLED' ? 'Enable' : 'Disable'}
                </button>
              )}
              {canDelete && (
                <button onClick={() => setConfirmDelete(true)} disabled={deleting}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {deleting ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Delete Citizen
                </button>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location & Wetland */}
          <SectionCard title="Location & Wetland" icon={MapPin}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0">
              <StatRow label="District" value={citizen.district} />
              {citizen.taluka && <StatRow label="Taluka" value={citizen.taluka} />}
              {citizen.village && <StatRow label="Village" value={citizen.village} />}
              <StatRow label="State" value={citizen.state} />
              {citizen.pincode && <StatRow label="Pincode" value={citizen.pincode} />}
              {citizen.gpsLocation && <StatRow label="GPS Location" value={<span className="font-mono text-[10px]">{citizen.gpsLocation}</span>} />}
              <StatRow label="Assigned Wetland" value={<span className="text-emerald-400">{citizen.nearbyWetland}</span>} />
              {citizen.distanceFromWetland && <StatRow label="Distance from Wetland" value={citizen.distanceFromWetland} />}
            </div>
          </SectionCard>

          {/* Notification Preferences */}
          <SectionCard title="Notification Preferences" icon={Bell}>
            <div className="space-y-3">
              <div>
                <span className={LABEL}>Alert Methods</span>
                <div className="flex gap-1.5 mt-1.5">
                  {['SMS', 'WhatsApp', 'Email'].map(method => {
                    const active = citizen.alertMethods.includes(method);
                    const iconMap: Record<string, typeof MessageSquare> = { SMS: MessageSquare, WhatsApp: Smartphone, Email: AtSign };
                    const Icon = iconMap[method] || MessageSquare;
                    return (
                      <span key={method} className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${
                        active ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-gray-600 bg-white/[0.03] border-white/[0.06]'
                      }`}>
                        <Icon size={10} /> {method}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <span className={LABEL}>Alert Types</span>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {citizen.alertTypes.length > 0 ? citizen.alertTypes.map(type => (
                    <span key={type} className="text-[10px] font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {type}
                    </span>
                  )) : (
                    <span className="text-[10px] text-gray-600">No alert types configured</span>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Notifications History */}
          <SectionCard title="Notifications History" icon={FileText}
            action={
              <button onClick={fetchNotifications} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors">
                <RefreshCw size={12} />
              </button>
            }
          >
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-3 py-2 text-[10px] font-medium text-gray-500">Alert Title</th>
                      <th className="text-left px-3 py-2 text-[10px] font-medium text-gray-500">Severity</th>
                      <th className="text-left px-3 py-2 text-[10px] font-medium text-gray-500">Method</th>
                      <th className="text-left px-3 py-2 text-[10px] font-medium text-gray-500">Status</th>
                      <th className="text-left px-3 py-2 text-[10px] font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {notifications.slice(0, 10).map(n => {
                      const sevColors: Record<string, string> = {
                        LOW: 'text-emerald-400 bg-emerald-500/10',
                        MEDIUM: 'text-amber-400 bg-amber-500/10',
                        HIGH: 'text-orange-400 bg-orange-500/10',
                        CRITICAL: 'text-red-400 bg-red-500/10',
                      };
                      const delivered = n.deliveryStatus === 'DELIVERED' || n.deliveryStatus === 'SENT';
                      return (
                        <tr key={n.id} className="hover:bg-white/[0.02]">
                          <td className="px-3 py-2 text-gray-300 max-w-[200px] truncate">{n.title}</td>
                          <td className="px-3 py-2">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sevColors[n.severity] || 'text-gray-400 bg-gray-500/10'}`}>
                              {n.severity}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-400">{n.deliveryMethod}</td>
                          <td className="px-3 py-2">
                            {delivered ? (
                              <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> {n.deliveryStatus}</span>
                            ) : (
                              <span className="text-amber-400 flex items-center gap-1"><Clock size={10} /> {n.deliveryStatus}</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-gray-500">{formatDate(n.sentAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Activity Timeline */}
          <SectionCard title="Activity Timeline" icon={Clock}>
            {auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No activity recorded yet</p>
              </div>
            ) : (
              <div className="space-y-0">
                {auditLogs.slice(0, 20).map((log: CitizenAuditLog, i: number) => {
                  const Icon = ACTION_ICON_MAP[log.action] || Activity;
                  const color = ACTION_COLOR_MAP[log.action] || 'bg-gray-500';

                  return (
                    <div key={log.id} className="flex items-start gap-3 py-2">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                        {i < auditLogs.length - 1 && <div className="w-px h-6 bg-white/[0.06] mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Icon size={11} className="text-gray-500 shrink-0" />
                          <span className="text-xs font-medium text-white">{log.action.replace(/_/g, ' ')}</span>
                          {log.target && <span className="text-[10px] text-gray-500">→ {log.target}</span>}
                        </div>
                        {log.details && (
                          <p className="text-[10px] text-gray-600 mt-0.5 truncate">{JSON.stringify(log.details)}</p>
                        )}
                        <p className="text-[10px] text-gray-600 mt-0.5">{timeAgo(log.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Risk Level */}
          <SectionCard title="Risk Level" icon={AlertTriangle}
            action={
              canUpdate && !editingRisk ? (
                <button onClick={() => { setRiskValue(citizen.riskLevel || 'safe'); setEditingRisk(true); }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <Edit3 size={12} />
                </button>
              ) : undefined
            }
          >
            {editingRisk ? (
              <div className="space-y-3">
                <div className="flex gap-1.5">
                  {Object.entries(RISK_CONFIG_MAP).map(([key, cfg]) => (
                    <button key={key} onClick={() => setRiskValue(key)}
                      className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-medium border transition-all ${
                        riskValue === key
                          ? `${cfg.color} ${cfg.bg} border-current`
                          : 'text-gray-500 bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:text-gray-300'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setEditingRisk(false)}
                    className="px-3 py-1.5 rounded-lg text-[10px] text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-all"
                  >Cancel</button>
                  <button onClick={handleSaveRisk} disabled={savingRisk}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-white bg-emerald-500 hover:bg-emerald-400 transition-all disabled:opacity-50"
                  >
                    {savingRisk ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-lg ${rc.bg}`}>
                  <span className={`text-sm font-semibold ${rc.color}`}>{rc.label}</span>
                </div>
                <span className="text-[10px] text-gray-500">Current risk assessment for this citizen</span>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-xl"><AlertOctagon size={20} className="text-red-400" /></div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Citizen</h3>
                <p className="text-[10px] text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Are you sure you want to delete <span className="text-white font-medium">{citizen.fullName}</span>?
              All their data will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-all"
              >Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-400 transition-all disabled:opacity-50"
              >
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM TOGGLE STATUS */}
      {confirmToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmToggle(false)} />
          <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/10 rounded-xl"><Ban size={20} className="text-cyan-400" /></div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {citizen.status === 'DISABLED' ? 'Enable' : 'Disable'} Citizen
                </h3>
                <p className="text-[10px] text-gray-500">Change citizen status</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {citizen.status === 'DISABLED'
                ? <>Enable <span className="text-white font-medium">{citizen.fullName}</span>? They will receive alerts again.</>
                : <>Disable <span className="text-white font-medium">{citizen.fullName}</span>? They will stop receiving alerts.</>
              }
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setConfirmToggle(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-all"
              >Cancel</button>
              <button onClick={handleToggleStatus} disabled={toggling}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-cyan-500 hover:bg-cyan-400 transition-all disabled:opacity-50"
              >
                {toggling ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                {citizen.status === 'DISABLED' ? 'Enable' : 'Disable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CITIZEN MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(false)} />
          <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-blue-500/10 rounded-xl"><Edit3 size={20} className="text-blue-400" /></div>
              <div>
                <h3 className="text-sm font-bold text-white">Edit Citizen</h3>
                <p className="text-[10px] text-gray-500">Update {citizen.fullName}&apos;s information</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                <input type="text" value={editForm.fullName} onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Mobile</label>
                  <input type="text" value={editForm.mobile} onChange={e => setEditForm(p => ({ ...p, mobile: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">WhatsApp</label>
                  <input type="text" value={editForm.whatsapp} onChange={e => setEditForm(p => ({ ...p, whatsapp: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Occupation</label>
                  <input type="text" value={editForm.occupation} onChange={e => setEditForm(p => ({ ...p, occupation: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Language</label>
                  <input type="text" value={editForm.language} onChange={e => setEditForm(p => ({ ...p, language: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-all"
              >Cancel</button>
              <button onClick={handleSaveEdit} disabled={savingEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-50"
              >
                {savingEdit ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND ALERT MODAL */}
      {showSendAlert && (
        <SendAlertModal
          citizen={citizen}
          onClose={() => setShowSendAlert(false)}
          onSent={() => {
            setShowSendAlert(false);
            fetchNotifications();
          }}
        />
      )}
    </div>
  );
}
