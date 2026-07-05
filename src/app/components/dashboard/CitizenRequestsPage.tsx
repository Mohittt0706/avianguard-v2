import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner';
import {
  Users, CheckCircle, XCircle, Clock, Search, Eye, ChevronDown, X,
  MessageSquare, Download, AlertTriangle, MapPin, Droplets, Phone, Mail,
  User, Globe, Shield, FileText, CheckSquare, Square, Info, HelpCircle,
  Edit3, ToggleLeft, ToggleRight, Trash2, Send, Activity, Calendar,
  Smartphone, AtSign, Bell, RotateCcw, FileDown, Upload, Ban,
  Radio, Loader2, BarChart3, RefreshCw,
} from 'lucide-react';
import ShinyText from '../ShinyText';
import { DarkSelect } from '../ui/DarkSelect';
import { SendAlertModal } from '../ui/SendAlertModal';
import { EmergencyBroadcastModal } from '../ui/EmergencyBroadcastModal';
import type { Citizen, CitizenStatus, CitizenAlertNotification, CitizenStats, CitizenAnalytics, DeliveryStats } from '@/types/citizen';
import { STATUS_CONFIG } from '@/types/citizen';
import { citizenApi } from '@/services/citizenApi';

// ===================== CONSTANTS =====================

type TabId = 'pending' | 'approved' | 'rejected' | 'disabled';

const TABS: { id: TabId; label: string; icon: typeof Clock; color: string }[] = [
  { id: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-400' },
  { id: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-emerald-400' },
  { id: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-400' },
  { id: 'disabled', label: 'Disabled', icon: Ban, color: 'text-gray-400' },
];

const STATUS_ICONS: Record<CitizenStatus, typeof Clock> = {
  PENDING: Clock,
  ACTIVE: CheckCircle,
  REJECTED: XCircle,
  PENDING_VERIFICATION: HelpCircle,
  DISABLED: Ban,
};

const REJECT_REASONS = ['Invalid Information', 'Duplicate Registration', 'Outside Coverage Area', 'Other'];

const DISTRICTS = ['Ahmedabad', 'Mehsana', 'Jamnagar', 'Anand', 'Vadodara', 'Bharuch', 'Kutch'];

const WETLANDS = ['Nal Sarovar', 'Thol Lake', 'Khijadiya', 'Pariej', 'Wadhvana', 'Narmada Estuary', 'Gulf of Kutch'];

const TAB_COLUMNS: Record<TabId, { key: string; label: string }[]> = {
  pending: [
    { key: 'citizen', label: 'Citizen' }, { key: 'mobile', label: 'Mobile' },
    { key: 'village', label: 'Village' }, { key: 'district', label: 'District' },
    { key: 'date', label: 'Registered' }, { key: 'status', label: 'Status' },
  ],
  approved: [
    { key: 'citizen', label: 'Citizen' }, { key: 'mobile', label: 'Mobile' },
    { key: 'village', label: 'Village' }, { key: 'wetland', label: 'Wetland' },
    { key: 'risk', label: 'Risk' }, { key: 'status', label: 'Status' },
    { key: 'language', label: 'Language' }, { key: 'lastAlert', label: 'Last Alert' },
  ],
  rejected: [
    { key: 'citizen', label: 'Citizen' }, { key: 'mobile', label: 'Mobile' },
    { key: 'village', label: 'Village' }, { key: 'district', label: 'District' },
    { key: 'reason', label: 'Reason' }, { key: 'date', label: 'Registered' },
  ],
  disabled: [
    { key: 'citizen', label: 'Citizen' }, { key: 'mobile', label: 'Mobile' },
    { key: 'village', label: 'Village' }, { key: 'district', label: 'District' },
    { key: 'status', label: 'Status' },
  ],
};

// ===================== HELPERS =====================

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getRiskBadge(level: string) {
  const l = (level || 'safe').toLowerCase();
  const config: Record<string, { label: string; color: string; bg: string }> = {
    safe: { label: 'Safe', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10' },
  };
  return config[l] || config.safe;
}

// ===================== SUB-COMPONENTS =====================

function SelectFilter({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all whitespace-nowrap w-full"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={11} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 top-full mt-1 bg-gray-900 border border-white/[0.1] rounded-lg shadow-xl z-30 min-w-[160px] max-h-48 overflow-y-auto"
          >
            <button onClick={() => { onChange(''); setOpen(false); }}
              className="block w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-white hover:bg-white/[0.04]"
            >All</button>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                className={`block w-full text-left px-3 py-2 text-xs transition-colors ${value === opt ? 'text-emerald-400 bg-emerald-500/5' : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'}`}
              >{opt}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: typeof Clock; color: string;
}) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} className={color} />
        <span className="text-[9px] text-gray-600 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={12} className="text-gray-500 shrink-0" />
      <span className="text-[10px] text-gray-500 w-28 shrink-0">{label}</span>
      <span className="text-xs text-white">{value}</span>
    </div>
  );
}

const BriefcaseIcon = (props: { size?: number; className?: string }) => (
  <svg width={props.size || 12} height={props.size || 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

// ===================== CONFIRM DIALOG =====================

function ConfirmDialog({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel: string;
  confirmColor?: string; onConfirm: () => void; onCancel: () => void;
}) {
  const btnColor = confirmColor || 'bg-red-500 hover:bg-red-600';
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 border border-white/[0.1] rounded-xl p-5 w-full max-w-sm mx-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-500/10"><AlertTriangle size={18} className="text-red-400" /></div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">{message}</p>
            <div className="flex gap-2">
              <button onClick={onCancel}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:text-white hover:bg-white/[0.08] transition-all"
              >Cancel</button>
              <button onClick={onConfirm}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold text-white transition-all ${btnColor}`}
              >{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===================== REJECT REASON MODAL =====================

function RejectReasonModal({ citizen, onConfirm, onCancel }: {
  citizen: Citizen | null; onConfirm: (reason: string) => void; onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  const [custom, setCustom] = useState('');
  if (!citizen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-900 border border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/10"><XCircle size={18} className="text-red-400" /></div>
            <h3 className="text-base font-semibold text-white">Reject Registration</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Reason for rejecting <span className="text-white font-medium">{citizen.fullName}</span>
          </p>
          <div className="space-y-1.5 mb-3">
            {REJECT_REASONS.map(r => (
              <button key={r} onClick={() => { setReason(r); setCustom(''); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                  reason === r ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >{r}</button>
            ))}
          </div>
          {reason === 'Other' && (
            <textarea value={custom} onChange={e => setCustom(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-red-500/40 transition-all resize-none mb-3"
            />
          )}
          <div className="flex items-center justify-end gap-3">
            <button onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
            >Cancel</button>
            <button onClick={() => onConfirm(reason === 'Other' ? custom.trim() : reason)}
              disabled={!reason || (reason === 'Other' && !custom.trim())}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >Confirm Reject</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ===================== REQUEST INFO MODAL =====================

function RequestInfoModal({ citizen, onConfirm, onCancel }: {
  citizen: Citizen | null; onConfirm: (message: string) => void; onCancel: () => void;
}) {
  const [message, setMessage] = useState('');
  if (!citizen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-900 border border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Info size={18} className="text-blue-400" /></div>
            <h3 className="text-base font-semibold text-white">Request More Information</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Specify what additional details are needed from <span className="text-white font-medium">{citizen.fullName}</span>.
          </p>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="e.g. Please provide a valid government ID proof..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-blue-500/40 focus:bg-blue-500/[0.03] transition-all resize-none"
          />
          <div className="flex items-center justify-end gap-3 mt-4">
            <button onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
            >Cancel</button>
            <button onClick={() => onConfirm(message.trim())}
              disabled={!message.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >Send Request</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ===================== EDIT CITIZEN MODAL =====================

function EditCitizenModal({ citizen, onConfirm, onCancel }: {
  citizen: Citizen | null; onConfirm: (data: Partial<Citizen>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Citizen>>({});
  if (!citizen) return null;

  const handleChange = (key: keyof Citizen, value: string) => setForm(p => ({ ...p, [key]: value }));

  const field = (key: keyof Citizen, label: string) => (
    <div>
      <label className="text-[10px] font-medium text-gray-500 mb-1 block">{label}</label>
      <input defaultValue={(citizen[key] as string) || ''} onChange={e => handleChange(key, e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
      />
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-900 border border-white/[0.08] rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10"><Edit3 size={18} className="text-blue-400" /></div>
            <h3 className="text-base font-semibold text-white">Edit Citizen</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('fullName', 'Full Name')}
            {field('mobile', 'Phone')}
            {field('village', 'Village')}
            {field('nearbyWetland', 'Assigned Wetland')}
            {field('language', 'Preferred Language')}
            <div>
              <label className="text-[10px] font-medium text-gray-500 mb-1 block">Notification Preference</label>
              <DarkSelect value={(citizen.alertMethods || []).join(', ')}
                onChange={v => handleChange('alertMethods' as keyof Citizen, v)}
                options={[
                  { value: 'SMS', label: 'SMS' },
                  { value: 'WhatsApp', label: 'WhatsApp' },
                  { value: 'Email', label: 'Email' },
                  { value: 'SMS, WhatsApp', label: 'SMS + WhatsApp' },
                  { value: 'SMS, Email', label: 'SMS + Email' },
                  { value: 'WhatsApp, Email', label: 'WhatsApp + Email' },
                  { value: 'SMS, WhatsApp, Email', label: 'All Channels' },
                ]}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-5">
            <button onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
            >Cancel</button>
            <button onClick={() => onConfirm(form)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-400 transition-all"
            >Save Changes</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ===================== TEST ALERT MODAL =====================

function TestAlertModal({ citizen, onConfirm, onCancel }: {
  citizen: Citizen | null; onConfirm: (methods: string[]) => void; onCancel: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  if (!citizen) return null;

  const available = citizen.alertMethods.length > 0 ? citizen.alertMethods : ['SMS', 'WhatsApp', 'Email'];
  const toggle = (m: string) => setSelected(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);

  const icons: Record<string, typeof Smartphone> = { SMS: Smartphone, WhatsApp: MessageSquare, Email: AtSign };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-900 border border-white/[0.08] rounded-2xl w-full max-w-sm p-6 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Send size={18} className="text-emerald-400" /></div>
            <h3 className="text-base font-semibold text-white">Send Test Alert</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Send test notification to <span className="text-white font-medium">{citizen.fullName}</span>
          </p>
          <div className="space-y-2 mb-4">
            {available.map(m => {
              const Icon = icons[m] || Smartphone;
              return (
                <button key={m} onClick={() => toggle(m)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm border transition-all ${
                    selected.includes(m)
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon size={16} />
                  {m}
                  {selected.includes(m) ? <CheckCircle size={14} className="ml-auto" /> : <div className="w-3.5 ml-auto" />}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-3">
            <button onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
            >Cancel</button>
            <button onClick={() => onConfirm(selected)}
              disabled={selected.length === 0}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >Send Test</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ===================== NOTIFICATION HISTORY DRAWER =====================

function NotificationHistoryDrawer({ citizen, onClose }: {
  citizen: Citizen | null; onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<CitizenAlertNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!citizen) return;
    setLoading(true);
    citizenApi.getNotifications(citizen.id, 20).then(res => {
      setNotifications(res.data);
    }).catch(() => {
      toast.error('Failed to load notification history');
    }).finally(() => setLoading(false));
  }, [citizen]);

  if (!citizen) return null;

  return (
    <AnimatePresence>
      {citizen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose}
        >
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={e => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-white/[0.08] shadow-2xl overflow-y-auto"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10"><Bell size={18} className="text-blue-400" /></div>
                  <h2 className="text-base font-bold text-white">Notification History</h2>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-gray-500 hover:text-white transition-all">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Notifications for <span className="text-white font-medium">{citizen.fullName}</span>
              </p>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="text-gray-500 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-white">{n.title}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          n.deliveryStatus === 'delivered' ? 'text-emerald-400 bg-emerald-500/10' :
                          n.deliveryStatus === 'sent' ? 'text-blue-400 bg-blue-500/10' :
                          'text-gray-400 bg-gray-500/10'
                        }`}>{n.deliveryStatus}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <span>{n.deliveryMethod}</span>
                        <span>·</span>
                        <span>{formatShortDate(n.sentAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===================== EXPORT FORMAT MODAL =====================

function ExportFormatModal({ open, onConfirm, onCancel }: {
  open: boolean; onConfirm: (format: 'csv' | 'pdf' | 'excel') => void; onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 border border-white/[0.08] rounded-2xl w-full max-w-xs p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10"><FileDown size={18} className="text-blue-400" /></div>
              <h3 className="text-base font-semibold text-white">Export As</h3>
            </div>
            <div className="space-y-2">
              {[
                { format: 'csv' as const, label: 'CSV', desc: 'Comma-separated values' },
                { format: 'excel' as const, label: 'Excel', desc: 'Spreadsheet format' },
                { format: 'pdf' as const, label: 'PDF', desc: 'Document format' },
              ].map(({ format, label, desc }) => (
                <button key={format} onClick={() => onConfirm(format)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  <div className="text-left">
                    <p className="text-xs font-medium text-white">{label}</p>
                    <p className="text-[10px] text-gray-500">{desc}</p>
                  </div>
                  <FileDown size={14} />
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={onCancel}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
              >Cancel</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===================== ANALYTICS PANEL =====================

function AnalyticsPanel({ analytics }: { analytics: CitizenAnalytics | null }) {
  if (!analytics) return null;

  const maxDistrict = Math.max(...analytics.byDistrict.map(d => d.count), 1);
  const maxWetland = Math.max(...analytics.byWetland.map(w => w.count), 1);
  const maxLanguage = Math.max(...analytics.byLanguage.map(l => l.count), 1);
  const maxRisk = Math.max(...analytics.riskDistribution.map(r => r.count), 1);

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {/* Citizens by District */}
        <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            <MapPin size={11} className="inline mr-1.5" />
            Citizens by District
          </h3>
          <div className="space-y-2">
            {analytics.byDistrict.map(d => (
              <div key={d.district} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 w-20 truncate">{d.district}</span>
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(d.count / maxDistrict) * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-500 w-6 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Citizens by Wetland */}
        <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            <Droplets size={11} className="inline mr-1.5" />
            Citizens by Wetland
          </h3>
          <div className="space-y-2">
            {analytics.byWetland.map(w => (
              <div key={w.wetland} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 w-20 truncate">{w.wetland}</span>
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(w.count / maxWetland) * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-500 w-6 text-right">{w.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language Distribution */}
        <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            <Globe size={11} className="inline mr-1.5" />
            Language Distribution
          </h3>
          <div className="space-y-2">
            {analytics.byLanguage.map(l => (
              <div key={l.language} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 w-20 truncate">{l.language}</span>
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(l.count / maxLanguage) * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-500 w-6 text-right">{l.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Level Distribution */}
        <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            <Shield size={11} className="inline mr-1.5" />
            Risk Level Distribution
          </h3>
          <div className="space-y-2">
            {analytics.riskDistribution.map(r => {
              const badge = getRiskBadge(r.riskLevel);
              return (
                <div key={r.riskLevel} className="flex items-center gap-2">
                  <span className={`text-[10px] w-20 truncate ${badge.color}`}>{r.riskLevel}</span>
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${badge.color.replace('text-', 'bg-')}`} style={{ width: `${(r.count / maxRisk) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-6 text-right">{r.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alert Response Rate */}
        <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 flex flex-col items-center justify-center">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            <Activity size={11} className="inline mr-1.5" />
            Alert Response Rate
          </h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{analytics.alertResponseRate.rate}%</p>
            <p className="text-[10px] text-gray-500 mt-1">
              {analytics.alertResponseRate.delivered} / {analytics.alertResponseRate.total} delivered
            </p>
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all ${
                analytics.alertResponseRate.rate >= 90 ? 'bg-emerald-500' :
                analytics.alertResponseRate.rate >= 70 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${analytics.alertResponseRate.rate}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===================== MAIN PAGE =====================

export function CitizenRequestsPage() {
  const navigate = useNavigate();

  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [stats, setStats] = useState<CitizenStats | null>(null);
  const [analytics, setAnalytics] = useState<CitizenAnalytics | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>('pending');
  const [search, setSearch] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterWetland, setFilterWetland] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [approveTarget, setApproveTarget] = useState<Citizen | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Citizen | null>(null);
  const [requestInfoTarget, setRequestInfoTarget] = useState<Citizen | null>(null);
  const [editTarget, setEditTarget] = useState<Citizen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Citizen | null>(null);
  const [testAlertTarget, setTestAlertTarget] = useState<Citizen | null>(null);
  const [notifHistoryTarget, setNotifHistoryTarget] = useState<Citizen | null>(null);

  const [sendAlertTarget, setSendAlertTarget] = useState<Citizen | null>(null);
  const [showEmergencyBroadcastModal, setShowEmergencyBroadcastModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeliveryStats, setShowDeliveryStats] = useState(false);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);

  // ===================== DATA FETCHING =====================

  const fetchCitizens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: '1', limit: '50' };

      const statusMap: Record<TabId, string | undefined> = {
        pending: undefined,
        approved: 'ACTIVE',
        rejected: 'REJECTED',
        disabled: 'DISABLED',
      };

      const apiStatus = statusMap[activeTab];
      if (apiStatus) params.status = apiStatus;
      if (search) params.search = search;
      if (filterDistrict) params.district = filterDistrict;
      if (filterWetland) params.wetland = filterWetland;
      if (filterDate) params.date = filterDate;

      const response = await citizenApi.getAll(params);
      let data = response.data.citizens;

      if (activeTab === 'pending') {
        data = data.filter(c => c.status === 'PENDING' || c.status === 'PENDING_VERIFICATION');
      }

      setCitizens(data);
    } catch (err) {
      setError('Failed to load citizen data');
      toast.error('Failed to load citizens');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, filterDistrict, filterWetland, filterDate]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await citizenApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await citizenApi.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  }, []);

  const fetchDeliveryStats = useCallback(async () => {
    try {
      const response = await citizenApi.getDeliveryStats();
      setDeliveryStats(response.data);
    } catch (err) {
      console.error('Failed to fetch delivery stats', err);
    }
  }, []);

  useEffect(() => { fetchCitizens(); }, [fetchCitizens]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    if (showAnalytics) fetchAnalytics();
  }, [showAnalytics, fetchAnalytics]);
  useEffect(() => {
    if (showDeliveryStats) fetchDeliveryStats();
  }, [showDeliveryStats, fetchDeliveryStats]);

  // ===================== HANDLERS =====================

  const handleApprove = useCallback(async (citizen: Citizen) => {
    try {
      await citizenApi.updateStatus(citizen.id, 'ACTIVE');
      toast.success('Citizen Approved Successfully');
      setApproveTarget(null);
      fetchCitizens();
      fetchStats();
    } catch {
      toast.error('Failed to approve citizen');
    }
  }, [fetchCitizens, fetchStats]);

  const handleReject = useCallback(async (citizen: Citizen, reason: string) => {
    try {
      await citizenApi.updateStatus(citizen.id, 'REJECTED', reason);
      toast.error('Citizen Rejected');
      setRejectTarget(null);
      fetchCitizens();
      fetchStats();
    } catch {
      toast.error('Failed to reject citizen');
    }
  }, [fetchCitizens, fetchStats]);

  const handleRequestInfo = useCallback(async (citizen: Citizen, message: string) => {
    try {
      await citizenApi.requestInfo(citizen.id, message);
      toast.success('Information request sent');
      setRequestInfoTarget(null);
      fetchCitizens();
    } catch {
      toast.error('Failed to send request');
    }
  }, [fetchCitizens]);

  const handleEdit = useCallback(async (citizen: Citizen, data: Partial<Citizen>) => {
    try {
      const payload = { ...data };
      if (payload.alertMethods && typeof payload.alertMethods === 'string') {
        payload.alertMethods = (payload.alertMethods as string).split(',').map(s => s.trim());
      }
      await citizenApi.update(citizen.id, payload);
      toast.success('Citizen profile updated');
      setEditTarget(null);
      fetchCitizens();
    } catch {
      toast.error('Failed to update citizen');
    }
  }, [fetchCitizens]);

  const handleDelete = useCallback(async (citizen: Citizen) => {
    try {
      await citizenApi.delete(citizen.id);
      toast.success('Citizen deleted from records');
      setDeleteTarget(null);
      fetchCitizens();
      fetchStats();
    } catch {
      toast.error('Failed to delete citizen');
    }
  }, [fetchCitizens, fetchStats]);

  const handleDisable = useCallback(async (citizen: Citizen) => {
    try {
      await citizenApi.updateStatus(citizen.id, 'DISABLED');
      toast.success('Citizen disabled');
      fetchCitizens();
      fetchStats();
    } catch {
      toast.error('Failed to disable citizen');
    }
  }, [fetchCitizens, fetchStats]);

  const handleEnable = useCallback(async (citizen: Citizen) => {
    try {
      await citizenApi.updateStatus(citizen.id, 'ACTIVE');
      toast.success('Citizen enabled');
      fetchCitizens();
      fetchStats();
    } catch {
      toast.error('Failed to enable citizen');
    }
  }, [fetchCitizens, fetchStats]);

  const handleRestore = useCallback(async (citizen: Citizen) => {
    try {
      await citizenApi.updateStatus(citizen.id, 'PENDING');
      toast.success('Citizen restored to Pending');
      fetchCitizens();
      fetchStats();
    } catch {
      toast.error('Failed to restore citizen');
    }
  }, [fetchCitizens, fetchStats]);

  const handleTestAlert = useCallback(async (citizen: Citizen, methods: string[]) => {
    try {
      await citizenApi.sendTestAlert(citizen.id, methods);
      toast.success('Test notification sent successfully');
      setTestAlertTarget(null);
      fetchCitizens();
    } catch {
      toast.error('Failed to send test alert');
    }
  }, [fetchCitizens]);

  const handleBulkApprove = useCallback(async () => {
    const ids = Array.from(selectedIds);
    try {
      await citizenApi.bulkAction(ids, 'ACTIVE');
      toast.success(`${ids.length} citizens approved`);
      setSelectedIds(new Set());
      setBulkAction(null);
      fetchCitizens();
      fetchStats();
    } catch {
      toast.error('Failed to bulk approve');
    }
  }, [selectedIds, fetchCitizens, fetchStats]);

  const handleBulkReject = useCallback(async () => {
    const ids = Array.from(selectedIds);
    try {
      await citizenApi.bulkAction(ids, 'REJECTED');
      toast.error(`${ids.length} citizens rejected`);
      setSelectedIds(new Set());
      setBulkAction(null);
      fetchCitizens();
      fetchStats();
    } catch {
      toast.error('Failed to bulk reject');
    }
  }, [selectedIds, fetchCitizens, fetchStats]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    try {
      await citizenApi.bulkAction(ids, 'DELETE');
      toast.success(`${ids.length} citizens deleted`);
      setSelectedIds(new Set());
      setBulkAction(null);
      fetchCitizens();
      fetchStats();
    } catch {
      toast.error('Failed to bulk delete');
    }
  }, [selectedIds, fetchCitizens, fetchStats]);

  const handleExport = useCallback(async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const filters: Record<string, string> = {};
      if (filterDistrict) filters.district = filterDistrict;
      if (filterWetland) filters.wetland = filterWetland;
      if (search) filters.search = search;

      const response = await citizenApi.exportData(format, filters);
      const data = response.data.data;

      const csv = [
        ['ID', 'Name', 'Mobile', 'Email', 'District', 'Village', 'Wetland', 'Status', 'Language', 'Registered'],
        ...data.map(c => [c.id, c.fullName, c.mobile, c.email || '', c.district, c.village || '', c.nearbyWetland, c.status, c.language, c.createdAt]),
      ].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `citizens-export-${format}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.length} citizens as ${format.toUpperCase()}`);
      setShowExportModal(false);
    } catch {
      toast.error('Failed to export data');
    }
  }, [filterDistrict, filterWetland, search]);

  const handleAlertSent = useCallback(() => {
    setSendAlertTarget(null);
    fetchCitizens();
    fetchStats();
  }, [fetchCitizens, fetchStats]);

  const handleBroadcastSent = useCallback(() => {
    setShowEmergencyBroadcastModal(false);
    fetchCitizens();
    fetchStats();
  }, [fetchCitizens, fetchStats]);

  // ===================== SELECTION =====================

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === citizens.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(citizens.map(c => c.id)));
    }
  };

  // ===================== FILTERS =====================

  const clearFilters = () => {
    setSearch('');
    setFilterDistrict('');
    setFilterWetland('');
    setFilterDate('');
  };

  const hasActiveFilters = search || filterDistrict || filterWetland || filterDate;

  const statValues = useMemo(() => ({
    pending: stats?.pending ?? 0,
    approved: stats?.active ?? 0,
    rejected: stats?.rejected ?? 0,
    disabled: stats?.disabled ?? 0,
    total: stats?.total ?? 0,
    registeredToday: stats?.registeredToday ?? 0,
    alertsSentToday: stats?.alertsSentToday ?? 0,
  }), [stats]);

  // ===================== TABLE CELL RENDERING =====================

  const renderTableCell = (citizen: Citizen, key: string) => {
    const status = STATUS_CONFIG[citizen.status];
    const StatusIcon = STATUS_ICONS[citizen.status];

    switch (key) {
      case 'citizen':
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {citizen.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{citizen.fullName}</div>
              <div className="text-[10px] text-gray-500">{citizen.id}</div>
            </div>
          </div>
        );
      case 'mobile': return <span className="text-gray-400">{citizen.mobile}</span>;
      case 'village': return <span className="text-gray-400">{citizen.village || '—'}</span>;
      case 'district': return <span className="text-gray-400">{citizen.district}</span>;
      case 'wetland': return <span className="text-gray-400">{citizen.nearbyWetland}</span>;
      case 'language': return <span className="text-gray-400">{citizen.language}</span>;
      case 'lastAlert': return <span className="text-gray-500 text-[10px]">{formatShortDate(citizen.lastAlertAt)}</span>;
      case 'date': return <span className="text-gray-500 text-[10px]">{formatShortDate(citizen.createdAt)}</span>;
      case 'risk': {
        const risk = getRiskBadge(citizen.riskLevel);
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${risk.bg} ${risk.color}`}>
            {risk.label}
          </span>
        );
      }
      case 'status':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
            <StatusIcon size={10} />
            {status.label}
          </span>
        );
      case 'reason':
        return <span className="text-gray-500 text-[10px] max-w-[120px] truncate block">{citizen.rejectionReason || '—'}</span>;
      default:
        return null;
    }
  };

  // ===================== TABLE ACTIONS =====================

  const renderTableActions = (citizen: Citizen) => {
    switch (activeTab) {
      case 'pending':
        return (
          <div className="flex items-center justify-end gap-0.5">
            <button onClick={() => navigate(`/dashboard/citizens/${citizen.id}`)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="View"><Eye size={13} /></button>
            <button onClick={() => setApproveTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="Approve"><CheckCircle size={13} /></button>
            <button onClick={() => setRejectTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400 transition-all" title="Reject"><XCircle size={13} /></button>
            <button onClick={() => setRequestInfoTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-blue-400 transition-all" title="Request More Info"><Info size={13} /></button>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center justify-end gap-0.5">
            <button onClick={() => navigate(`/dashboard/citizens/${citizen.id}`)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="View"><Eye size={13} /></button>
            <button onClick={() => setEditTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-blue-400 transition-all" title="Edit"><Edit3 size={13} /></button>
            <button onClick={() => setSendAlertTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-sky-400 transition-all" title="Send Alert"><Send size={13} /></button>
            <button onClick={() => setNotifHistoryTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-purple-400 transition-all" title="Notification History"><Bell size={13} /></button>
            <button onClick={() => handleDisable(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-all" title="Disable"><ToggleLeft size={13} /></button>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center justify-end gap-0.5">
            <button onClick={() => navigate(`/dashboard/citizens/${citizen.id}`)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="View"><Eye size={13} /></button>
            <button onClick={() => handleRestore(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-amber-400 transition-all" title="Restore to Pending"><RotateCcw size={13} /></button>
            <button onClick={() => setDeleteTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400 transition-all" title="Delete"><Trash2 size={13} /></button>
          </div>
        );
      case 'disabled':
        return (
          <div className="flex items-center justify-end gap-0.5">
            <button onClick={() => navigate(`/dashboard/citizens/${citizen.id}`)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="View"><Eye size={13} /></button>
            <button onClick={() => handleEnable(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="Enable"><ToggleRight size={13} /></button>
            <button onClick={() => setDeleteTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400 transition-all" title="Delete"><Trash2 size={13} /></button>
          </div>
        );
    }
  };

  // ===================== RENDER =====================

  return (
    <div className="space-y-5">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' },
        }}
      />

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-xl">
            <Users size={22} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold"><ShinyText text="Citizen Management" color="#FFFFFF" shineColor="#22D3EE" spread={100} speed={3} className="text-xl font-bold" /></h1>
            <p className="text-sm text-gray-400">Manage the complete citizen lifecycle</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowAnalytics(!showAnalytics); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <BarChart3 size={14} />
            Analytics
          </button>
          <button onClick={() => { setShowDeliveryStats(!showDeliveryStats); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <Radio size={14} />
            Delivery Stats
          </button>
          <button onClick={() => setShowEmergencyBroadcastModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all"
          >
            <Radio size={14} />
            Emergency Broadcast
          </button>
        </div>
      </div>

      {/* ===== TOP STATISTICS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Pending Requests" value={statValues.pending} icon={Clock} color="text-amber-400" />
        <StatCard label="Approved Citizens" value={statValues.approved} icon={CheckCircle} color="text-emerald-400" />
        <StatCard label="Rejected Requests" value={statValues.rejected} icon={XCircle} color="text-red-400" />
        <StatCard label="Disabled Citizens" value={statValues.disabled} icon={Ban} color="text-gray-400" />
        <StatCard label="Total Registered" value={statValues.total} icon={Users} color="text-blue-400" />
        <StatCard label="Today's Registrations" value={statValues.registeredToday} icon={Calendar} color="text-cyan-400" />
        <StatCard label="Alerts Sent Today" value={statValues.alertsSentToday} icon={Send} color="text-purple-400" />
      </div>

      {/* ===== TAB NAVIGATION ===== */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-1 flex gap-1">
        {TABS.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedIds(new Set()); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
                isActive ? 'bg-white/[0.08] text-white' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <TabIcon size={14} className={isActive ? tab.color : ''} />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/[0.08]' : 'bg-white/[0.04]'}`}>
                {tab.id === 'pending' ? statValues.pending : tab.id === 'approved' ? statValues.approved : tab.id === 'rejected' ? statValues.rejected : statValues.disabled}
              </span>
            </button>
          );
        })}
      </div>

      {/* ===== SEARCH + FILTERS ===== */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, mobile, village..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <SelectFilter value={filterDistrict} onChange={setFilterDistrict} options={DISTRICTS} placeholder="District: All" />
          <SelectFilter value={filterWetland} onChange={setFilterWetland} options={WETLANDS} placeholder="Wetland: All" />
          <div className="relative">
            <label className="text-[10px] font-medium text-gray-500 mb-1 block">Registration Date</label>
            <div className="relative">
              <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white outline-none focus:border-emerald-500/40 transition-all [color-scheme:dark]"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters}
              className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all"
            >Clear</button>
          )}
        </div>
      </div>

      {/* ===== ANALYTICS PANEL ===== */}
      <AnimatePresence>
        {showAnalytics && <AnalyticsPanel analytics={analytics} />}
      </AnimatePresence>

      {/* ===== DELIVERY STATS PANEL ===== */}
      <AnimatePresence>
        {showDeliveryStats && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-5 mb-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Notification Delivery Statistics</h3>
              </div>
              <button onClick={() => fetchDeliveryStats()} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <RefreshCw size={14} />
              </button>
            </div>
            {!deliveryStats ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-4 justify-center">
                <Loader2 size={16} className="animate-spin" /> Loading delivery stats...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{deliveryStats.totalPushTokens}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Push Tokens</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-400">{deliveryStats.totalNotifications}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Total Sent</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{deliveryStats.deliveredCount}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Delivered</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">{deliveryStats.failedCount}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Failed</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">{deliveryStats.readCount}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Read</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400">{deliveryStats.acknowledgedCount}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Acknowledged</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-rose-400">{deliveryStats.noTokenCount}</p>
                  <p className="text-[10px] text-gray-400 mt-1">No Token</p>
                </div>
              </div>
            )}
            {deliveryStats && deliveryStats.byMethod && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2 font-medium">By Delivery Method</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(deliveryStats.byMethod).map(([method, count]) => (
                    <div key={method} className="bg-white/[0.02] rounded-lg p-2.5 flex items-center gap-2">
                      <Radio size={12} className="text-gray-500" />
                      <span className="text-[11px] text-gray-300 capitalize">{method}</span>
                      <span className="text-xs font-semibold text-white ml-auto">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== BULK ACTIONS TOOLBAR ===== */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-3 flex items-center justify-between"
          >
            <span className="text-xs text-gray-400">
              <span className="text-white font-semibold">{selectedIds.size}</span> selected
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {activeTab === 'pending' && (
                <>
                  <button onClick={() => setBulkAction('approve')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                  ><CheckCircle size={12} /> Approve Selected</button>
                  <button onClick={() => setBulkAction('reject')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all"
                  ><XCircle size={12} /> Reject Selected</button>
                </>
              )}
              {activeTab === 'disabled' && (
                <button onClick={() => setBulkAction('enable')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                ><ToggleRight size={12} /> Enable Selected</button>
              )}
              <button onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
              ><FileDown size={12} /> Export Selected</button>
              <button onClick={() => setBulkAction('delete')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all"
              ><Trash2 size={12} /> Delete Selected</button>
              <button onClick={() => setSelectedIds(new Set())}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all"
              ><X size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== TABLE ===== */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-3 py-3 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-500 hover:text-white transition-colors">
                    {selectedIds.size === citizens.length && citizens.length > 0
                      ? <CheckSquare size={14} className="text-emerald-400" />
                      : <Square size={14} />}
                  </button>
                </th>
                {TAB_COLUMNS[activeTab].map(col => (
                  <th key={col.key} className="text-left px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{col.label}</th>
                ))}
                <th className="text-right px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={TAB_COLUMNS[activeTab].length + 2} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={24} className="text-gray-500 animate-spin" />
                      <p className="text-xs text-gray-500">Loading citizens...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={TAB_COLUMNS[activeTab].length + 2} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle size={24} className="text-red-400" />
                      <p className="text-xs text-red-400">{error}</p>
                      <button onClick={fetchCitizens} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                        <RefreshCw size={12} /> Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : citizens.length === 0 ? (
                <tr>
                  <td colSpan={TAB_COLUMNS[activeTab].length + 2} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <Users size={28} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">No citizen records found</p>
                        <p className="text-[10px] text-gray-600 mt-1">
                          {hasActiveFilters ? 'Try adjusting your search or filters' : 'There are no citizens in this category'}
                        </p>
                      </div>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                citizens.map(citizen => (
                  <tr key={citizen.id} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-3 py-3">
                      <button onClick={() => toggleSelect(citizen.id)} className="text-gray-500 hover:text-white transition-colors">
                        {selectedIds.has(citizen.id) ? <CheckSquare size={14} className="text-emerald-400" /> : <Square size={14} />}
                      </button>
                    </td>
                    {TAB_COLUMNS[activeTab].map(col => (
                      <td key={col.key} className="px-3 py-3">{renderTableCell(citizen, col.key)}</td>
                    ))}
                    <td className="px-3 py-3">{renderTableActions(citizen)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODALS & DRAWERS ===== */}

      <NotificationHistoryDrawer citizen={notifHistoryTarget} onClose={() => setNotifHistoryTarget(null)} />

      <ConfirmDialog
        open={!!approveTarget}
        title="Approve Registration"
        message={`Are you sure you want to approve ${approveTarget?.fullName}'s registration? They will be added to the Citizen Directory and receive environmental alerts.`}
        confirmLabel="Approve"
        confirmColor="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500"
        onConfirm={() => { if (approveTarget) handleApprove(approveTarget); }}
        onCancel={() => setApproveTarget(null)}
      />

      <RejectReasonModal
        citizen={rejectTarget}
        onConfirm={(reason) => { if (rejectTarget) handleReject(rejectTarget, reason); }}
        onCancel={() => setRejectTarget(null)}
      />

      <RequestInfoModal
        citizen={requestInfoTarget}
        onConfirm={(msg) => { if (requestInfoTarget) handleRequestInfo(requestInfoTarget, msg); }}
        onCancel={() => setRequestInfoTarget(null)}
      />

      <EditCitizenModal
        citizen={editTarget}
        onConfirm={(data) => { if (editTarget) handleEdit(editTarget, data); }}
        onCancel={() => setEditTarget(null)}
      />

      <TestAlertModal
        citizen={testAlertTarget}
        onConfirm={(methods) => { if (testAlertTarget) handleTestAlert(testAlertTarget, methods); }}
        onCancel={() => setTestAlertTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Citizen"
        message={`Are you sure you want to delete ${deleteTarget?.fullName}'s record? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); }}
        onCancel={() => setDeleteTarget(null)}
      />

      <ExportFormatModal
        open={showExportModal}
        onConfirm={handleExport}
        onCancel={() => setShowExportModal(false)}
      />

      {sendAlertTarget && (
        <SendAlertModal
          citizen={sendAlertTarget}
          onClose={() => setSendAlertTarget(null)}
          onSent={handleAlertSent}
        />
      )}

      {showEmergencyBroadcastModal && (
        <EmergencyBroadcastModal
          onClose={() => setShowEmergencyBroadcastModal(false)}
          onSent={handleBroadcastSent}
        />
      )}

      {/* Bulk action confirmation dialogs */}
      <ConfirmDialog
        open={bulkAction === 'approve'}
        title="Bulk Approve"
        message={`Approve ${selectedIds.size} selected citizen(s)?`}
        confirmLabel={`Approve ${selectedIds.size}`}
        confirmColor="bg-gradient-to-r from-emerald-500 to-blue-600"
        onConfirm={handleBulkApprove}
        onCancel={() => setBulkAction(null)}
      />
      <ConfirmDialog
        open={bulkAction === 'reject'}
        title="Bulk Reject"
        message={`Reject ${selectedIds.size} selected citizen(s)?`}
        confirmLabel={`Reject ${selectedIds.size}`}
        onConfirm={handleBulkReject}
        onCancel={() => setBulkAction(null)}
      />
      <ConfirmDialog
        open={bulkAction === 'delete'}
        title="Bulk Delete"
        message={`Delete ${selectedIds.size} selected citizen(s)? This cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size}`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkAction(null)}
      />
      <ConfirmDialog
        open={bulkAction === 'enable'}
        title="Bulk Enable"
        message={`Enable ${selectedIds.size} selected citizen(s)?`}
        confirmLabel={`Enable ${selectedIds.size}`}
        confirmColor="bg-emerald-500"
        onConfirm={async () => {
          const ids = Array.from(selectedIds);
          try {
            await citizenApi.bulkAction(ids, 'ACTIVE');
            toast.success(`${ids.length} citizens enabled`);
            setSelectedIds(new Set());
            setBulkAction(null);
            fetchCitizens();
            fetchStats();
          } catch {
            toast.error('Failed to bulk enable');
          }
        }}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  );
}
