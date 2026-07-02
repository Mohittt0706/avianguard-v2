import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner';
import {
  Users, CheckCircle, XCircle, Clock, Search, Eye, ChevronDown, X,
  MessageSquare, Download, AlertTriangle, MapPin, Droplets, Phone, Mail,
  User, Globe, Shield, FileText, CheckSquare, Square, Info, HelpCircle,
  Edit3, ToggleLeft, ToggleRight, Trash2, Send, Activity, Calendar,
  Smartphone, AtSign, Bell, RotateCcw, FileDown, Upload, Ban,
} from 'lucide-react';
import ShinyText from '../ShinyText';
import type { Citizen, CitizenStatus, NotificationRecord } from '@/types/citizen';
import { citizenApi, notificationApi } from '@/services/api';
import {
  loadCitizens, saveCitizens, DISTRICTS, TALUKAS, WETLANDS, ALL_VILLAGES,
  isToday, formatDate, formatShortDate,
} from '@/lib/mockData';

// ===================== CONSTANTS =====================

type TabId = 'pending' | 'approved' | 'rejected' | 'disabled';

const TABS: { id: TabId; label: string; icon: typeof Clock; color: string }[] = [
  { id: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-400' },
  { id: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-emerald-400' },
  { id: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-400' },
  { id: 'disabled', label: 'Disabled', icon: Ban, color: 'text-gray-400' },
];

const STATUS_CONFIG: Record<CitizenStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
  active: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
  'pending-verification': { label: 'Pending Verification', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: HelpCircle },
  disabled: { label: 'Disabled', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: Ban },
};

const REJECT_REASONS = ['Invalid Information', 'Duplicate Registration', 'Outside Coverage Area', 'Other'];

// ===================== SUB-COMPONENTS =====================

function SelectFilter({ value, onChange, options, placeholder, label }: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder: string; label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      {label && <label className="text-[10px] font-medium text-gray-500 mb-1 block">{label}</label>}
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

function CitizenTimeline({ citizen }: { citizen: Citizen }) {
  const entries: { event: string; date: string | null; icon: typeof Clock; color: string }[] = [
    { event: 'Registration Submitted', date: citizen.createdAt, icon: FileText, color: 'text-gray-400' },
    ...(citizen.verificationRequestedAt ? [{ event: 'Additional Info Requested', date: citizen.verificationRequestedAt, icon: HelpCircle, color: 'text-blue-400' }] : []),
    ...(citizen.approvedAt ? [{ event: 'Registration Approved', date: citizen.approvedAt, icon: CheckCircle, color: 'text-emerald-400' }] : []),
    ...(citizen.rejectedAt ? [{ event: 'Registration Rejected', date: citizen.rejectedAt, icon: XCircle, color: 'text-red-400' }] : []),
    ...(citizen.disabledAt ? [{ event: 'Account Disabled', date: citizen.disabledAt, icon: Ban, color: 'text-gray-400' }] : []),
  ];
  return (
    <div className="space-y-0">
      {entries.map((entry, idx) => {
        const Icon = entry.icon;
        const isLast = idx === entries.length - 1;
        return (
          <div key={entry.event} className="relative flex gap-3 pb-4">
            {!isLast && <div className="absolute left-[11px] top-6 bottom-0 w-px bg-white/[0.06]" />}
            <div className={`shrink-0 w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center ${entry.color}`}>
              <Icon size={12} />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-xs font-medium text-white">{entry.event}</p>
              <p className="text-[10px] text-gray-500">{formatDate(entry.date)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===================== PROFILE DRAWER =====================

function ProfileDrawer({ citizen, onClose }: { citizen: Citizen | null; onClose: () => void }) {
  if (!citizen) return null;
  const sc = STATUS_CONFIG[citizen.status];
  const StatusIcon = sc.icon;

  return (
    <AnimatePresence>
      {citizen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose}
        >
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={e => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full max-w-lg bg-gray-900 border-l border-white/[0.08] shadow-2xl overflow-y-auto"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {citizen.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{citizen.fullName}</h2>
                    <p className="text-xs text-gray-500">{citizen.id}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-gray-500 hover:text-white transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${sc.bg} ${sc.color} text-xs font-medium`}>
                <StatusIcon size={14} />
                {sc.label}
              </div>

              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  <User size={11} className="inline mr-1.5" />
                  Personal Information
                </h3>
                <div className="space-y-2.5">
                  <DetailRow icon={User} label="Full Name" value={citizen.fullName} />
                  <DetailRow icon={Smartphone} label="Mobile" value={citizen.mobile} />
                  <DetailRow icon={AtSign} label="Email" value={citizen.email || '—'} />
                  <DetailRow icon={Calendar} label="Date of Birth" value={citizen.dateOfBirth || '—'} />
                  <DetailRow icon={User} label="Gender" value={citizen.gender || '—'} />
                  <DetailRow icon={BriefcaseIcon} label="Occupation" value={citizen.occupation + (citizen.occupationOther ? ` (${citizen.occupationOther})` : '')} />
                  <DetailRow icon={Globe} label="Language" value={citizen.language} />
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  <MapPin size={11} className="inline mr-1.5" />
                  Location
                </h3>
                <div className="space-y-2.5">
                  <DetailRow icon={MapPin} label="Village" value={citizen.village} />
                  <DetailRow icon={MapPin} label="Taluka" value={citizen.taluka} />
                  <DetailRow icon={MapPin} label="District" value={citizen.district} />
                  <DetailRow icon={Globe} label="State" value={citizen.state} />
                  <DetailRow icon={MapPin} label="Pincode" value={citizen.pincode} />
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  <Droplets size={11} className="inline mr-1.5" />
                  Wetland Assignment
                </h3>
                <div className="space-y-2.5">
                  <DetailRow icon={Droplets} label="Assigned Wetland" value={citizen.nearbyWetland} />
                  <DetailRow icon={MapPin} label="GPS Location" value={citizen.gpsLocation || '—'} />
                  <DetailRow icon={MapPin} label="Distance" value={citizen.distanceFromWetland} />
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  <Bell size={11} className="inline mr-1.5" />
                  Notification Preferences
                </h3>
                <div className="space-y-2.5">
                  <DetailRow icon={MessageSquare} label="Channels" value={citizen.alertMethods.join(', ')} />
                  <DetailRow icon={Shield} label="Alert Types" value={citizen.alertTypes.join(', ')} />
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  <Clock size={11} className="inline mr-1.5" />
                  Registration Timeline
                </h3>
                <CitizenTimeline citizen={citizen} />
              </div>

              {citizen.status === 'rejected' && citizen.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-[10px] font-medium text-red-400 uppercase tracking-wider mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-300">{citizen.rejectionReason}</p>
                </div>
              )}

              {citizen.adminNotes && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wider mb-1">Admin Notes</p>
                  <p className="text-sm text-blue-300">{citizen.adminNotes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
              <select defaultValue={(citizen.alertMethods || []).join(', ')}
                onChange={e => handleChange('alertMethods' as keyof Citizen, e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white outline-none focus:border-emerald-500/40 transition-all"
              >
                <option value="SMS">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="SMS, WhatsApp">SMS + WhatsApp</option>
                <option value="SMS, Email">SMS + Email</option>
                <option value="WhatsApp, Email">WhatsApp + Email</option>
                <option value="SMS, WhatsApp, Email">All Channels</option>
              </select>
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
  if (!citizen) return null;

  const mockNotifications: NotificationRecord[] = [
    { id: '1', alertName: 'Flood Warning', deliveryMethod: 'SMS', status: 'Delivered', sentAt: '2026-06-28T06:00:00Z' },
    { id: '2', alertName: 'Water Quality Alert', deliveryMethod: 'WhatsApp', status: 'Delivered', sentAt: '2026-06-25T14:30:00Z' },
    { id: '3', alertName: 'Weather Advisory', deliveryMethod: 'Email', status: 'Sent', sentAt: '2026-06-20T09:00:00Z' },
    { id: '4', alertName: 'Registration Approved', deliveryMethod: 'SMS', status: 'Sent', sentAt: citizen.approvedAt || '—' },
  ];

  return (
    <AnimatePresence>
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
            <div className="space-y-2">
              {mockNotifications.map(n => (
                <div key={n.id} className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-white">{n.alertName}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      n.status === 'Delivered' ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400 bg-gray-500/10'
                    }`}>{n.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span>{n.deliveryMethod}</span>
                    <span>·</span>
                    <span>{formatShortDate(n.sentAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
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

// ===================== MAIN PAGE =====================

export function CitizenRequestsPage() {
  const [citizens, setCitizens] = useState<Citizen[]>(() => loadCitizens());
  const [activeTab, setActiveTab] = useState<TabId>('pending');
  const [search, setSearch] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterTaluka, setFilterTaluka] = useState('');
  const [filterVillage, setFilterVillage] = useState('');
  const [filterWetland, setFilterWetland] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [profileTarget, setProfileTarget] = useState<Citizen | null>(null);
  const [approveTarget, setApproveTarget] = useState<Citizen | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Citizen | null>(null);
  const [requestInfoTarget, setRequestInfoTarget] = useState<Citizen | null>(null);
  const [editTarget, setEditTarget] = useState<Citizen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Citizen | null>(null);
  const [testAlertTarget, setTestAlertTarget] = useState<Citizen | null>(null);
  const [notifHistoryTarget, setNotifHistoryTarget] = useState<Citizen | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);

  const tabFiltered = useMemo(() => {
    if (activeTab === 'pending') return citizens.filter(c => c.status === 'pending' || c.status === 'pending-verification');
    if (activeTab === 'approved') return citizens.filter(c => c.status === 'active');
    if (activeTab === 'rejected') return citizens.filter(c => c.status === 'rejected');
    return citizens.filter(c => c.status === 'disabled');
  }, [citizens, activeTab]);

  const sync = (updated: Citizen[]) => {
    setCitizens(updated);
    saveCitizens(updated);
  };

  const stats = useMemo(() => {
    const all = citizens;
    return {
      pending: all.filter(c => c.status === 'pending' || c.status === 'pending-verification').length,
      approved: all.filter(c => c.status === 'active').length,
      rejected: all.filter(c => c.status === 'rejected').length,
      disabled: all.filter(c => c.status === 'disabled').length,
      total: all.length,
      registeredToday: all.filter(c => isToday(c.createdAt)).length,
      alertsSentToday: all.filter(c => c.lastAlertAt && isToday(c.lastAlertAt)).length,
    };
  }, [citizens]);

  const filtered = useMemo(() => {
    return tabFiltered.filter(c => {
      const q = search.toLowerCase();
      if (q && !(c.fullName?.toLowerCase() || '').includes(q) && !(c.mobile || '').includes(q) && !(c.village?.toLowerCase() || '').includes(q) && !(c.taluka?.toLowerCase() || '').includes(q)) return false;
      if (filterDistrict && c.district !== filterDistrict) return false;
      if (filterTaluka && c.taluka !== filterTaluka) return false;
      if (filterVillage && c.village !== filterVillage) return false;
      if (filterWetland && c.nearbyWetland !== filterWetland) return false;
      if (filterDate) {
        const regDate = new Date(c.createdAt).toISOString().split('T')[0];
        if (regDate !== filterDate) return false;
      }
      if (filterStatus && c.status !== filterStatus) return false;
      return true;
    });
  }, [tabFiltered, search, filterDistrict, filterTaluka, filterVillage, filterWetland, filterDate, filterStatus]);

  const availableTalukas = filterDistrict ? TALUKAS[filterDistrict] || [] : [];

  // ===== HANDLERS =====

  const handleApprove = (citizen: Citizen) => {
    const smsMsg = 'Your AvianGuard registration has been approved. You will now receive real-time environmental alerts.';
    Promise.all([
      citizenApi.approve(citizen),
      citizenApi.addToDirectory(citizen),
      notificationApi.sendSms(citizen.mobile, smsMsg),
      notificationApi.sendEmail(citizen.email || 'no-reply@avianguard.org', 'Registration Approved', smsMsg),
      citizen.whatsapp ? notificationApi.sendSms(citizen.whatsapp, `WhatsApp: ${smsMsg}`) : Promise.resolve(),
    ]).then(() => {
      const updated = citizens.map(c =>
        c.id === citizen.id ? { ...c, status: 'active' as const, approvedAt: new Date().toISOString() } : c
      );
      sync(updated);
      toast.success('Citizen Approved Successfully');
      setApproveTarget(null);
    });
  };

  const handleReject = (citizen: Citizen, reason: string) => {
    const smsMsg = `Your AvianGuard registration has been rejected. Reason: ${reason}`;
    Promise.all([
      citizenApi.reject(citizen, reason),
      notificationApi.sendSms(citizen.mobile, smsMsg),
      citizen.email ? notificationApi.sendEmail(citizen.email, 'Registration Update', smsMsg) : Promise.resolve(),
    ]).then(() => {
      const updated = citizens.map(c =>
        c.id === citizen.id ? { ...c, status: 'rejected' as const, rejectionReason: reason, rejectedAt: new Date().toISOString() } : c
      );
      sync(updated);
      toast.error('Citizen Rejected');
      setRejectTarget(null);
      setProfileTarget(null);
    });
  };

  const handleRequestInfo = (citizen: Citizen, message: string) => {
    const smsMsg = `Additional information needed for your AvianGuard registration: ${message}`;
    Promise.all([
      citizenApi.requestInfo(citizen, message),
      notificationApi.sendSms(citizen.mobile, smsMsg),
      citizen.email ? notificationApi.sendEmail(citizen.email, 'Action Required: Additional Information', smsMsg) : Promise.resolve(),
    ]).then(() => {
      const updated = citizens.map(c =>
        c.id === citizen.id ? { ...c, status: 'pending-verification' as const, verificationRequestedAt: new Date().toISOString(), adminNotes: message } : c
      );
      sync(updated);
      toast.success('Information request sent');
      setRequestInfoTarget(null);
    });
  };

  const handleEdit = (citizen: Citizen, data: Partial<Citizen>) => {
    citizenApi.update(citizen.id, data);
    const merged = { ...citizen, ...data };
    if (data.alertMethods && typeof data.alertMethods === 'string') {
      merged.alertMethods = data.alertMethods.split(',').map(s => s.trim());
    }
    const updated = citizens.map(c => c.id === citizen.id ? merged as Citizen : c);
    sync(updated);
    toast.success('Citizen profile updated');
    setEditTarget(null);
  };

  const handleDisable = (citizen: Citizen) => {
    citizenApi.disable(citizen.id);
    const updated = citizens.map(c =>
      c.id === citizen.id ? { ...c, status: 'disabled' as const, disabledAt: new Date().toISOString() } : c
    );
    sync(updated);
    notificationApi.sendSms(citizen.mobile, 'Your AvianGuard account has been disabled.');
    toast.success('Citizen disabled');
  };

  const handleEnable = (citizen: Citizen) => {
    citizenApi.enable(citizen.id);
    const updated = citizens.map(c =>
      c.id === citizen.id ? { ...c, status: 'active' as const, disabledAt: null } : c
    );
    sync(updated);
    notificationApi.sendSms(citizen.mobile, 'Your AvianGuard account has been re-enabled.');
    toast.success('Citizen enabled');
  };

  const handleRestore = (citizen: Citizen) => {
    citizenApi.restore(citizen);
    const updated = citizens.map(c =>
      c.id === citizen.id ? { ...c, status: 'pending' as const, rejectionReason: '', rejectedAt: null, adminNotes: '' } : c
    );
    sync(updated);
    toast.success('Citizen restored to Pending');
  };

  const handleDelete = (citizen: Citizen) => {
    citizenApi.remove(citizen.id);
    const updated = citizens.filter(c => c.id !== citizen.id);
    sync(updated);
    toast.success('Citizen deleted from records');
    setDeleteTarget(null);
  };

  const handleTestAlert = (citizen: Citizen, methods: string[]) => {
    citizenApi.sendTestAlert(citizen.id, methods);
    const now = new Date().toISOString();
    const updated = citizens.map(c =>
      c.id === citizen.id ? { ...c, lastAlertAt: now } : c
    );
    sync(updated);
    methods.forEach(m => {
      if (m === 'SMS') notificationApi.sendSms(citizen.mobile, 'This is a test alert from AvianGuard.');
      if (m === 'WhatsApp') notificationApi.sendSms(citizen.whatsapp, 'This is a test alert from AvianGuard.');
      if (m === 'Email' && citizen.email) notificationApi.sendEmail(citizen.email, 'Test Alert', 'This is a test alert from AvianGuard.');
    });
    toast.success('Test notification sent successfully.');
    setTestAlertTarget(null);
  };

  const handleBulkApprove = () => {
    const ids = Array.from(selectedIds);
    citizenApi.bulkApprove(ids);
    const updated = citizens.map(c =>
      selectedIds.has(c.id) && (c.status === 'pending' || c.status === 'pending-verification')
        ? { ...c, status: 'active' as const, approvedAt: new Date().toISOString() }
        : c
    );
    sync(updated);
    toast.success(`${ids.length} citizens approved`);
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  const handleBulkReject = () => {
    const ids = Array.from(selectedIds);
    citizenApi.bulkReject(ids, 'Bulk rejection');
    const updated = citizens.map(c =>
      selectedIds.has(c.id) && (c.status === 'pending' || c.status === 'pending-verification')
        ? { ...c, status: 'rejected' as const, rejectionReason: 'Bulk rejection by administrator', rejectedAt: new Date().toISOString() }
        : c
    );
    sync(updated);
    toast.error(`${ids.length} citizens rejected`);
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  const handleBulkDisable = () => {
    const ids = Array.from(selectedIds);
    citizenApi.bulkStatus(ids, 'disabled');
    const updated = citizens.map(c =>
      selectedIds.has(c.id) && c.status === 'active'
        ? { ...c, status: 'disabled' as const, disabledAt: new Date().toISOString() }
        : c
    );
    sync(updated);
    toast.success(`${ids.length} citizens disabled`);
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  const handleBulkEnable = () => {
    const ids = Array.from(selectedIds);
    citizenApi.bulkStatus(ids, 'active');
    const updated = citizens.map(c =>
      selectedIds.has(c.id) && c.status === 'disabled'
        ? { ...c, status: 'active' as const, disabledAt: null }
        : c
    );
    sync(updated);
    toast.success(`${ids.length} citizens enabled`);
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    const updated = citizens.filter(c => !selectedIds.has(c.id));
    sync(updated);
    toast.success(`${ids.length} citizens deleted`);
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) { toast.error('No citizens selected for export'); return; }
    const fn = format === 'csv' ? citizenApi.exportCsv : format === 'pdf' ? citizenApi.exportPdf : citizenApi.exportExcel;
    fn(ids);
    const data = citizens.filter(c => ids.includes(c.id));
    const csv = [
      ['ID', 'Name', 'Mobile', 'Email', 'District', 'Taluka', 'Village', 'Wetland', 'Status', 'Language', 'Registered'],
      ...data.map(c => [c.id, c.fullName, c.mobile, c.email, c.district, c.taluka, c.village, c.nearbyWetland, c.status, c.language, c.createdAt]),
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citizens-export-${format}-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'csv' : format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} citizens as ${format.toUpperCase()}`);
    setShowExportModal(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterDistrict('');
    setFilterTaluka('');
    setFilterVillage('');
    setFilterWetland('');
    setFilterDate('');
    setFilterStatus('');
  };

  const hasActiveFilters = search || filterDistrict || filterTaluka || filterVillage || filterWetland || filterDate || filterStatus;

  const tabColumns: Record<TabId, { key: string; label: string }[]> = {
    pending: [
      { key: 'citizen', label: 'Citizen' }, { key: 'mobile', label: 'Mobile' },
      { key: 'village', label: 'Village' }, { key: 'district', label: 'District' },
      { key: 'date', label: 'Registered' }, { key: 'status', label: 'Status' },
    ],
    approved: [
      { key: 'citizen', label: 'Citizen' }, { key: 'mobile', label: 'Mobile' },
      { key: 'village', label: 'Village' }, { key: 'taluka', label: 'Taluka' },
      { key: 'district', label: 'District' }, { key: 'wetland', label: 'Wetland' },
      { key: 'status', label: 'Status' }, { key: 'language', label: 'Language' },
      { key: 'lastAlert', label: 'Last Alert' }, { key: 'date', label: 'Registered' },
    ],
    rejected: [
      { key: 'citizen', label: 'Citizen' }, { key: 'mobile', label: 'Mobile' },
      { key: 'village', label: 'Village' }, { key: 'district', label: 'District' },
      { key: 'reason', label: 'Reason' }, { key: 'date', label: 'Registered' },
    ],
    disabled: [
      { key: 'citizen', label: 'Citizen' }, { key: 'mobile', label: 'Mobile' },
      { key: 'village', label: 'Village' }, { key: 'district', label: 'District' },
      { key: 'status', label: 'Status' }, { key: 'date', label: 'Registered' },
    ],
  };

  const renderTableActions = (citizen: Citizen) => {
    switch (activeTab) {
      case 'pending':
        return (
          <div className="flex items-center justify-end gap-0.5">
            <button onClick={() => setProfileTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="View"><Eye size={13} /></button>
            <button onClick={() => setApproveTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="Approve"><CheckCircle size={13} /></button>
            <button onClick={() => setRejectTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400 transition-all" title="Reject"><XCircle size={13} /></button>
            <button onClick={() => setRequestInfoTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-blue-400 transition-all" title="Request More Info"><Info size={13} /></button>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center justify-end gap-0.5">
            <button onClick={() => setProfileTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="View"><Eye size={13} /></button>
            <button onClick={() => setEditTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-blue-400 transition-all" title="Edit"><Edit3 size={13} /></button>
            <button onClick={() => handleDisable(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-all" title="Disable"><ToggleLeft size={13} /></button>
            <button onClick={() => setTestAlertTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-sky-400 transition-all" title="Send Test Alert"><Send size={13} /></button>
            <button onClick={() => setNotifHistoryTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-purple-400 transition-all" title="Notification History"><Bell size={13} /></button>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center justify-end gap-0.5">
            <button onClick={() => setProfileTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="View"><Eye size={13} /></button>
            <button onClick={() => handleRestore(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-amber-400 transition-all" title="Restore to Pending"><RotateCcw size={13} /></button>
            <button onClick={() => setDeleteTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400 transition-all" title="Delete"><Trash2 size={13} /></button>
          </div>
        );
      case 'disabled':
        return (
          <div className="flex items-center justify-end gap-0.5">
            <button onClick={() => setProfileTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="View"><Eye size={13} /></button>
            <button onClick={() => handleEnable(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="Enable"><ToggleRight size={13} /></button>
            <button onClick={() => setDeleteTarget(citizen)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400 transition-all" title="Delete"><Trash2 size={13} /></button>
          </div>
        );
    }
  };

  const renderTableCell = (citizen: Citizen, key: string) => {
    const sc = STATUS_CONFIG[citizen.status];
    const StatusIcon = sc.icon;
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
      case 'village': return <span className="text-gray-400">{citizen.village}</span>;
      case 'taluka': return <span className="text-gray-400">{citizen.taluka}</span>;
      case 'district': return <span className="text-gray-400">{citizen.district}</span>;
      case 'wetland': return <span className="text-gray-400">{citizen.nearbyWetland}</span>;
      case 'language': return <span className="text-gray-400">{citizen.language}</span>;
      case 'lastAlert': return <span className="text-gray-500 text-[10px]">{formatShortDate(citizen.lastAlertAt)}</span>;
      case 'date': return <span className="text-gray-500 text-[10px]">{formatShortDate(citizen.createdAt)}</span>;
      case 'status':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.color}`}>
            <StatusIcon size={10} />
            {sc.label}
          </span>
        );
      case 'reason':
        return <span className="text-gray-500 text-[10px] max-w-[120px] truncate block">{citizen.rejectionReason || '—'}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' },
        }}
      />

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
      </div>

      {/* ===== TOP STATISTICS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Pending Requests" value={stats.pending} icon={Clock} color="text-amber-400" />
        <StatCard label="Approved Citizens" value={stats.approved} icon={CheckCircle} color="text-emerald-400" />
        <StatCard label="Rejected Requests" value={stats.rejected} icon={XCircle} color="text-red-400" />
        <StatCard label="Disabled Citizens" value={stats.disabled} icon={Ban} color="text-gray-400" />
        <StatCard label="Total Registered" value={stats.total} icon={Users} color="text-blue-400" />
        <StatCard label="Today's Registrations" value={stats.registeredToday} icon={Calendar} color="text-cyan-400" />
        <StatCard label="Alerts Sent Today" value={stats.alertsSentToday} icon={Send} color="text-purple-400" />
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
                {tab.id === 'pending' ? stats.pending : tab.id === 'approved' ? stats.approved : tab.id === 'rejected' ? stats.rejected : stats.disabled}
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
              placeholder="Search by name, mobile, village, or taluka..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <SelectFilter value={filterDistrict} onChange={v => { setFilterDistrict(v); setFilterTaluka(''); }} options={DISTRICTS} placeholder="District: All" />
          <SelectFilter value={filterTaluka} onChange={setFilterTaluka} options={availableTalukas} placeholder="Taluka: All" />
          <SelectFilter value={filterVillage} onChange={setFilterVillage} options={ALL_VILLAGES} placeholder="Village: All" />
          <SelectFilter value={filterWetland} onChange={setFilterWetland} options={WETLANDS} placeholder="Wetland: All" />
          {(activeTab === 'pending' || activeTab === 'approved') && (
            <SelectFilter value={filterStatus} onChange={setFilterStatus}
              options={activeTab === 'pending' ? ['pending', 'pending-verification'] : ['active']}
              placeholder="Status: All"
            />
          )}
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
              {activeTab === 'approved' && (
                <button onClick={() => setBulkAction('disable')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-gray-500/10 border border-gray-500/30 hover:bg-gray-500/20 transition-all"
                ><ToggleLeft size={12} /> Disable Selected</button>
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
                    {selectedIds.size === filtered.length && filtered.length > 0
                      ? <CheckSquare size={14} className="text-emerald-400" />
                      : <Square size={14} />}
                  </button>
                </th>
                {tabColumns[activeTab].map(col => (
                  <th key={col.key} className="text-left px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{col.label}</th>
                ))}
                <th className="text-right px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={tabColumns[activeTab].length + 2} className="px-4 py-16 text-center">
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
                filtered.map(citizen => (
                  <tr key={citizen.id} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-3 py-3">
                      <button onClick={() => toggleSelect(citizen.id)} className="text-gray-500 hover:text-white transition-colors">
                        {selectedIds.has(citizen.id) ? <CheckSquare size={14} className="text-emerald-400" /> : <Square size={14} />}
                      </button>
                    </td>
                    {tabColumns[activeTab].map(col => (
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

      <ProfileDrawer citizen={profileTarget} onClose={() => setProfileTarget(null)} />

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
        title={activeTab === 'rejected' ? 'Delete Citizen' : 'Remove Citizen'}
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
        open={bulkAction === 'disable'}
        title="Bulk Disable"
        message={`Disable ${selectedIds.size} selected citizen(s)?`}
        confirmLabel={`Disable ${selectedIds.size}`}
        confirmColor="bg-gray-500"
        onConfirm={handleBulkDisable}
        onCancel={() => setBulkAction(null)}
      />
      <ConfirmDialog
        open={bulkAction === 'enable'}
        title="Bulk Enable"
        message={`Enable ${selectedIds.size} selected citizen(s)?`}
        confirmLabel={`Enable ${selectedIds.size}`}
        confirmColor="bg-emerald-500"
        onConfirm={handleBulkEnable}
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
    </div>
  );
}
