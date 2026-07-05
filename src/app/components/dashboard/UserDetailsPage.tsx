import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, User, Shield, Key, Mail, Phone, MapPin, Building2, Clock,
  CheckCircle, XCircle, Ban, AlertTriangle, RefreshCw, Trash2, Edit3,
  Activity, Bell, FileText, Eye, LogIn, LogOut, Settings, Edit,
  Calendar, Globe, Smartphone, Monitor, Wifi, AlertOctagon, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import ShinyText from '../ShinyText';
import { userApi } from '@/services/userApi';
import { useAuth } from '@/context/AuthContext';
import { PermissionModal } from '../ui/PermissionModal';
import type { UserWithDetails, LoginHistory, AuditLog, UserRole, AccountStatus } from '@/types/auth';

// ===================== CONSTANTS =====================

const roleLabels: Record<string, string> = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', OPERATOR: 'Operator', VIEWER: 'Viewer' };
const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  INACTIVE: { label: 'Inactive', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  SUSPENDED: { label: 'Suspended', color: 'text-red-400', bg: 'bg-red-500/10' },
  PENDING: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10' },
};
const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  ADMIN: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  OPERATOR: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  VIEWER: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

const permissionGroups = [
  { key: 'dashboard', label: 'Dashboard', icon: Activity },
  { key: 'sensors', label: 'Sensors', icon: Wifi },
  { key: 'alerts', label: 'Alerts', icon: Bell },
  { key: 'reports', label: 'Reports', icon: FileText },
  { key: 'citizens', label: 'Citizen Alerts', icon: User },
  { key: 'maps', label: 'Maps', icon: Globe },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'ai', label: 'AI Center', icon: Eye },
  { key: 'users', label: 'User Management', icon: Shield },
];

const LABEL = 'text-[10px] font-medium text-gray-500 uppercase tracking-wider';
const CARD = 'bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-5';

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

export function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { hasPermission, user: currentUser } = useAuth();
  const canUpdate = hasPermission('users', 'update') || currentUser?.role === 'SUPER_ADMIN';
  const canDelete = hasPermission('users', 'delete') || currentUser?.role === 'SUPER_ADMIN';

  const [user, setUser] = useState<UserWithDetails | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await userApi.getById(userId);
      setUser(res.data.user);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load officer');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!userId) return;
    userApi.getLoginHistory(userId).then(res => setLoginHistory(res.data)).catch(() => {});
    userApi.getAuditLogs(userId).then(res => setAuditLogs(res.data)).catch(() => {});
  }, [userId]);

  const handleResetPassword = async () => {
    if (!userId) return;
    setResetting(true);
    try {
      const res = await userApi.resetPassword(userId);
      toast.success(`Temporary password: ${res.data.tempPassword}`, { duration: 15000 });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset password');
    } finally { setResetting(false); }
  };

  const handleToggleStatus = async () => {
    if (!userId) return;
    setToggling(true);
    try {
      await userApi.toggleStatus(userId);
      toast.success('Status toggled');
      fetchUser();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle status');
    } finally { setToggling(false); }
  };

  const handleDelete = async () => {
    if (!userId) return;
    setDeleting(true);
    try {
      await userApi.delete(userId);
      toast.success('Officer deleted');
      navigate('/dashboard/users');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally { setDeleting(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-red-400 mb-4" />
        <p className="text-sm text-gray-400 mb-2">{error || 'Officer not found'}</p>
        <button onClick={() => navigate('/dashboard/users')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-xs font-semibold text-white hover:from-emerald-400 hover:to-blue-500 transition-all"
        >Back to Officers</button>
      </div>
    );
  }

  const st = statusLabels[user.accountStatus] || statusLabels.ACTIVE;
  const rc = roleColors[user.role] || roleColors.VIEWER;
  const stats = user.stats;
  const lastLogin = loginHistory.length > 0 ? loginHistory[0] : null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate('/dashboard/users')}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-all"
      ><ArrowLeft size={14} /> Back to Officers</button>

      {/* Profile Header */}
      <div className={CARD}>
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg shadow-emerald-500/10">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
            ) : getInitials(user.name)}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">{user.name}</h1>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${rc}`}>{roleLabels[user.role]}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{user.email}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {user.employeeId && (
                <span className="text-[10px] text-gray-500 flex items-center gap-1"><Shield size={10} /> {user.employeeId}</span>
              )}
              {user.department && (
                <span className="text-[10px] text-gray-500 flex items-center gap-1"><Building2 size={10} /> {user.department}</span>
              )}
              {user.designation && (
                <span className="text-[10px] text-gray-500 flex items-center gap-1"><User size={10} /> {user.designation}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Details */}
        <div className="space-y-6">
          {/* Profile Details */}
          <SectionCard title="Profile Details" icon={User}>
            <div className="space-y-0">
              <StatRow label="Full Name" value={user.name} />
              <StatRow label="Email" value={<span className="text-blue-400">{user.email}</span>} />
              {user.phone && <StatRow label="Mobile" value={user.phone} />}
              {user.employeeId && <StatRow label="Employee ID" value={<span className="font-mono">{user.employeeId}</span>} />}
              {user.department && <StatRow label="Department" value={user.department} />}
              {user.designation && <StatRow label="Designation" value={user.designation} />}
              {user.district && <StatRow label="District" value={user.district} />}
              {user.taluka && <StatRow label="Taluka" value={user.taluka} />}
              {user.assignedWetland && <StatRow label="Assigned Wetland" value={<span className="text-emerald-400">{user.assignedWetland}</span>} />}
              {user.address && <StatRow label="Address" value={user.address} />}
              <StatRow label="Joined" value={formatDate(user.createdAt)} />
              {user.lastLoginAt && <StatRow label="Last Login" value={timeAgo(user.lastLoginAt)} />}
            </div>
          </SectionCard>

          {/* Stats */}
          <SectionCard title="Activity Stats" icon={Activity}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Alerts', value: stats.alertsAssigned, icon: Bell, color: 'text-amber-400' },
                { label: 'Reports', value: stats.reportsGenerated, icon: FileText, color: 'text-blue-400' },
                { label: 'Citizen', value: stats.citizenNotificationsSent, icon: User, color: 'text-emerald-400' },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04] text-center">
                  <s.icon size={14} className={`${s.color} mx-auto mb-1`} />
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Quick Actions */}
          <SectionCard title="Quick Actions" icon={Key}>
            <div className="space-y-2">
              {canUpdate && (
                <button onClick={() => setShowPermissionModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all"
                >
                  <Edit3 size={13} /> Edit Permissions
                </button>
              )}
              <button onClick={handleResetPassword} disabled={resetting}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all disabled:opacity-50"
              >
                {resetting ? <RefreshCw size={13} className="animate-spin" /> : <Key size={13} />}
                Reset Password
              </button>
              {canUpdate && (
                <button onClick={() => setConfirmToggle(true)} disabled={toggling}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
                >
                  {toggling ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                  {user.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              )}
              {canDelete && (
                <button onClick={() => setConfirmDelete(true)} disabled={deleting}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {deleting ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Delete Officer
                </button>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column - Permissions, Login History, Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permissions */}
          <SectionCard title="Permissions" icon={Shield}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissionGroups.map(group => {
                const userPerms = user.permissions?.[group.key] || getDefaultPermissions(user.role, group.key);
                return (
                  <div key={group.key} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 mb-2">
                      <group.icon size={12} className="text-emerald-400" />
                      <span className="text-[11px] font-medium text-white">{group.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['read', 'create', 'update', 'delete', 'export'].map(action => {
                        const has = userPerms.includes(action);
                        return (
                          <span key={action} className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                            has ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.04] text-gray-600'
                          }`}>{action}</span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Login History */}
          <SectionCard title="Login History" icon={LogIn}>
            {loginHistory.length === 0 ? (
              <div className="text-center py-8">
                <LogIn size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No login history yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-3 py-2 text-[10px] font-medium text-gray-500">Time</th>
                      <th className="text-left px-3 py-2 text-[10px] font-medium text-gray-500">Status</th>
                      <th className="text-left px-3 py-2 text-[10px] font-medium text-gray-500">Device</th>
                      <th className="text-left px-3 py-2 text-[10px] font-medium text-gray-500">Browser</th>
                      <th className="text-left px-3 py-2 text-[10px] font-medium text-gray-500">IP</th>
                      <th className="text-left px-3 py-2 text-[10px] font-medium text-gray-500">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {loginHistory.slice(0, 10).map(log => (
                      <tr key={log.id} className="hover:bg-white/[0.02]">
                        <td className="px-3 py-2 text-gray-400">{formatDate(log.createdAt)}</td>
                        <td className="px-3 py-2">
                          {log.success ? (
                            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> Success</span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1"><XCircle size={10} /> Failed</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-400">
                          <span className="flex items-center gap-1">
                            {log.device?.includes('Mobile') ? <Smartphone size={10} /> : <Monitor size={10} />}
                            {log.device || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-400">{log.browser || 'Unknown'}</td>
                        <td className="px-3 py-2 text-gray-400 font-mono text-[10px]">{log.ipAddress || 'N/A'}</td>
                        <td className="px-3 py-2 text-gray-400">{log.location || 'N/A'}</td>
                      </tr>
                    ))}
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
                {auditLogs.slice(0, 20).map((log, i) => {
                  const iconMap: Record<string, typeof Activity> = {
                    create: CheckCircle, update: Edit, delete: Trash2,
                    login: LogIn, logout: LogOut, reset_password: Key,
                    toggle_status: Shield, bulk_action: Settings,
                  };
                  const colorMap: Record<string, string> = {
                    create: 'bg-emerald-500', update: 'bg-blue-500', delete: 'bg-red-500',
                    login: 'bg-purple-500', logout: 'bg-gray-500', reset_password: 'bg-amber-500',
                    toggle_status: 'bg-cyan-500', bulk_action: 'bg-orange-500',
                  };
                  const Icon = iconMap[log.action] || Activity;
                  const color = colorMap[log.action] || 'bg-gray-500';

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
                <h3 className="text-sm font-bold text-white">Delete Officer</h3>
                <p className="text-[10px] text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Are you sure you want to delete <span className="text-white font-medium">{user.name}</span>?
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
              <div className="p-2 bg-cyan-500/10 rounded-xl"><Shield size={20} className="text-cyan-400" /></div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {user.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'} Officer
                </h3>
                <p className="text-[10px] text-gray-500">Change account status</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {user.accountStatus === 'ACTIVE'
                ? <>Deactivate <span className="text-white font-medium">{user.name}</span>? They will lose access to the system.</>
                : <>Activate <span className="text-white font-medium">{user.name}</span>? They will regain access to the system.</>
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
                {user.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMISSION MODAL */}
      {showPermissionModal && (
        <PermissionModal
          user={user}
          onClose={() => setShowPermissionModal(false)}
          onSave={(updated) => {
            setUser(prev => prev ? { ...prev, ...updated } : prev);
            setShowPermissionModal(false);
          }}
        />
      )}
    </div>
  );
}

// ===================== HELPER =====================

function getDefaultPermissions(role: UserRole, resource: string): string[] {
  const map: Record<UserRole, Record<string, string[]>> = {
    SUPER_ADMIN: {
      dashboard: ['read'], sensors: ['read', 'create', 'update', 'delete', 'export'],
      alerts: ['read', 'create', 'update', 'delete'], reports: ['read', 'create', 'delete', 'export'],
      citizens: ['read', 'create', 'update', 'delete'], maps: ['read', 'update'],
      settings: ['read', 'update'], ai: ['read'], users: ['read', 'create', 'update', 'delete'],
    },
    ADMIN: {
      dashboard: ['read'], sensors: ['read', 'update'], alerts: ['read', 'update'],
      reports: ['read', 'create', 'export'], citizens: ['read', 'update'],
      maps: ['read'], settings: ['read'], ai: ['read'], users: ['read'],
    },
    OPERATOR: {
      dashboard: ['read'], sensors: ['read', 'update'], alerts: ['read'],
      reports: ['read'], citizens: ['read'], maps: ['read'],
      settings: [], ai: [], users: [],
    },
    VIEWER: {
      dashboard: ['read'], sensors: ['read'], alerts: ['read'],
      reports: ['read'], citizens: [], maps: ['read'],
      settings: [], ai: [], users: [],
    },
  };
  return map[role]?.[resource] || [];
}
