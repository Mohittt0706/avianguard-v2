import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Shield, Search, Mail, Phone, MapPin, Droplets, Clock,
  CheckCircle, XCircle, Eye, Edit3, Key, UserX, Trash2, Plus,
  X, ChevronDown, AlertTriangle, BarChart3, MessageSquare, Calendar,
  UserCheck, UserCog, UserMinus, Activity,
} from 'lucide-react';

// ===================== TYPES =====================

type OfficerRole = 'admin' | 'district-officer' | 'operator' | 'viewer';
type OfficerStatus = 'active' | 'inactive' | 'suspended';

interface Officer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: OfficerRole;
  district: string;
  taluka: string;
  assignedWetland: string;
  status: OfficerStatus;
  lastLogin: string;
  joinDate: string;
  alertsSent: number;
  reportsGenerated: number;
  permissions: string[];
}

interface NewOfficerForm {
  fullName: string;
  email: string;
  mobile: string;
  role: OfficerRole;
  district: string;
  taluka: string;
  assignedWetland: string;
  tempPassword: string;
}

// ===================== MOCK DATA =====================

const districts = ['Ahmedabad', 'Mehsana', 'Jamnagar', 'Anand', 'Vadodara', 'Bharuch', 'Kutch'];
const talukas: Record<string, string[]> = {
  Ahmedabad: ['Sanand', 'Daskroi', 'Viramgam'],
  Mehsana: ['Kadi', 'Vijapur'],
  Jamnagar: ['Jamnagar', 'Kalavad'],
  Anand: ['Anand', 'Petlad'],
  Vadodara: ['Padra', 'Karjan'],
  Bharuch: ['Bharuch', 'Jambusar'],
  Kutch: ['Abdasa', 'Bhuj'],
};
const wetlands = ['Nal Sarovar', 'Thol Lake', 'Khijadiya', 'Pariej', 'Wadhvana', 'Narmada Estuary', 'Gulf of Kutch'];

const initialOfficers: Officer[] = [
  { id: 'GOF-001', name: 'Dr. Priya Sharma', email: 'priya.sharma@aviangov.in', mobile: '+91 98765 43210', role: 'admin', district: 'Ahmedabad', taluka: 'Sanand', assignedWetland: 'Nal Sarovar', status: 'active', lastLogin: '2 min ago', joinDate: '15 Jan 2025', alertsSent: 156, reportsGenerated: 89, permissions: ['all'] },
  { id: 'GOF-002', name: 'Rajesh Verma', email: 'rajesh.verma@aviangov.in', mobile: '+91 98765 43211', role: 'district-officer', district: 'Ahmedabad', taluka: 'Sanand', assignedWetland: 'Nal Sarovar', status: 'active', lastLogin: '15 min ago', joinDate: '03 Feb 2025', alertsSent: 84, reportsGenerated: 42, permissions: ['view-sensors', 'generate-reports', 'send-alerts'] },
  { id: 'GOF-003', name: 'Anita Desai', email: 'anita.desai@aviangov.in', mobile: '+91 98765 43212', role: 'operator', district: 'Ahmedabad', taluka: 'Daskroi', assignedWetland: 'Nal Sarovar', status: 'active', lastLogin: '1 hour ago', joinDate: '12 Mar 2025', alertsSent: 231, reportsGenerated: 67, permissions: ['view-sensors', 'send-alerts'] },
  { id: 'GOF-004', name: 'Vikram Patel', email: 'vikram.patel@aviangov.in', mobile: '+91 98765 43213', role: 'viewer', district: 'Mehsana', taluka: 'Kadi', assignedWetland: 'Thol Lake', status: 'active', lastLogin: '3 hours ago', joinDate: '08 Apr 2025', alertsSent: 0, reportsGenerated: 12, permissions: ['view-sensors'] },
  { id: 'GOF-005', name: 'Sunita Reddy', email: 'sunita.reddy@aviangov.in', mobile: '+91 98765 43214', role: 'viewer', district: 'Jamnagar', taluka: 'Jamnagar', assignedWetland: 'Khijadiya', status: 'inactive', lastLogin: '2 days ago', joinDate: '22 Jan 2025', alertsSent: 0, reportsGenerated: 5, permissions: ['view-sensors'] },
  { id: 'GOF-006', name: 'Arun Kumar', email: 'arun.kumar@aviangov.in', mobile: '+91 98765 43215', role: 'operator', district: 'Vadodara', taluka: 'Padra', assignedWetland: 'Wadhvana', status: 'active', lastLogin: '45 min ago', joinDate: '05 May 2025', alertsSent: 67, reportsGenerated: 23, permissions: ['view-sensors', 'send-alerts'] },
  { id: 'GOF-007', name: 'Meena Joshi', email: 'meena.joshi@aviangov.in', mobile: '+91 98765 43216', role: 'district-officer', district: 'Anand', taluka: 'Anand', assignedWetland: 'Pariej', status: 'active', lastLogin: '30 min ago', joinDate: '20 Feb 2025', alertsSent: 112, reportsGenerated: 54, permissions: ['view-sensors', 'generate-reports', 'send-alerts', 'manage-citizens'] },
  { id: 'GOF-008', name: 'Ravi Deshmukh', email: 'ravi.deshmukh@aviangov.in', mobile: '+91 98765 43217', role: 'admin', district: 'Kutch', taluka: 'Abdasa', assignedWetland: 'Gulf of Kutch', status: 'active', lastLogin: '5 min ago', joinDate: '10 Jan 2025', alertsSent: 298, reportsGenerated: 134, permissions: ['all'] },
  { id: 'GOF-009', name: 'Kavita Nair', email: 'kavita.nair@aviangov.in', mobile: '+91 98765 43218', role: 'operator', district: 'Bharuch', taluka: 'Bharuch', assignedWetland: 'Narmada Estuary', status: 'suspended', lastLogin: '5 days ago', joinDate: '15 Jun 2025', alertsSent: 23, reportsGenerated: 8, permissions: ['view-sensors', 'send-alerts'] },
  { id: 'GOF-010', name: 'Suresh Menon', email: 'suresh.menon@aviangov.in', mobile: '+91 98765 43219', role: 'viewer', district: 'Ahmedabad', taluka: 'Sanand', assignedWetland: 'Nal Sarovar', status: 'active', lastLogin: '1 day ago', joinDate: '01 Jul 2025', alertsSent: 0, reportsGenerated: 3, permissions: ['view-sensors'] },
];

// ===================== PLACEHOLDER HANDLERS =====================

const api = {
  addOfficer: (data: NewOfficerForm) => alert(`Backend: Add officer ${data.fullName}`),
  viewProfile: (id: string) => {}, // opens drawer
  editOfficer: (id: string) => alert(`Backend: Edit officer ${id}`),
  resetPassword: (id: string) => alert(`Backend: Reset password for ${id}`),
  disableOfficer: (id: string) => alert(`Backend: Disable officer ${id}`),
  deleteOfficer: (id: string) => alert(`Backend: Delete officer ${id}`),
};

// ===================== CONFIG =====================

const roleConfig: Record<OfficerRole, { label: string; color: string; bg: string; icon: typeof Shield }> = {
  admin: { label: 'Admin', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Shield },
  'district-officer': { label: 'District Officer', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: UserCheck },
  operator: { label: 'Operator', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: UserCog },
  viewer: { label: 'Viewer', color: 'text-gray-400', bg: 'bg-white/[0.06]', icon: UserMinus },
};

const statusConfig: Record<OfficerStatus, { label: string; color: string; bg: string; dot: string }> = {
  active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
  inactive: { label: 'Inactive', color: 'text-gray-400', bg: 'bg-white/[0.04]', dot: 'bg-gray-500' },
  suspended: { label: 'Suspended', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-500' },
};

// ===================== MODAL =====================

function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel: string;
  onConfirm: () => void; onCancel: () => void;
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
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-all"
              >{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===================== PROFILE DRAWER =====================

function ProfileDrawer({ officer, onClose }: { officer: Officer | null; onClose: () => void }) {
  const roleCfg = officer ? roleConfig[officer.role] : null;
  const RoleIcon = roleCfg?.icon || Shield;

  return (
    <AnimatePresence>
      {officer && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose}
        >
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={e => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-white/[0.08] shadow-2xl overflow-y-auto"
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-base font-bold text-white">
                    {officer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{officer.name}</h2>
                    <span className={`text-[11px] font-medium ${roleCfg?.color || 'text-gray-400'}`}>
                      <RoleIcon size={11} className="inline mr-1" />
                      {roleCfg?.label}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-gray-500 hover:text-white transition-all">
                  <X size={16} />
                </button>
              </div>

              {/* Personal Information */}
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 mb-3">
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Mail, label: 'Email', value: officer.email },
                    { icon: Phone, label: 'Mobile', value: officer.mobile },
                    { icon: Calendar, label: 'Joined', value: officer.joinDate },
                    { icon: Clock, label: 'Last Login', value: officer.lastLogin },
                  ].map(d => {
                    const Icon = d.icon;
                    return (
                      <div key={d.label} className="flex items-center gap-2.5">
                        <Icon size={12} className="text-gray-500 shrink-0" />
                        <span className="text-[10px] text-gray-500 w-20 shrink-0">{d.label}</span>
                        <span className="text-xs text-white">{d.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assignment */}
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 mb-3">
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Assignment</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: MapPin, label: 'District', value: officer.district },
                    { icon: MapPin, label: 'Taluka', value: officer.taluka },
                    { icon: Droplets, label: 'Assigned Wetland', value: officer.assignedWetland },
                  ].map(d => {
                    const Icon = d.icon;
                    return (
                      <div key={d.label} className="flex items-center gap-2.5">
                        <Icon size={12} className="text-gray-500 shrink-0" />
                        <span className="text-[10px] text-gray-500 w-28 shrink-0">{d.label}</span>
                        <span className="text-xs text-white">{d.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Role & Permissions */}
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 mb-3">
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Role & Permissions</h3>
                <div className="flex items-center gap-2 mb-3">
                  <RoleIcon size={13} className={roleCfg?.color || 'text-gray-400'} />
                  <span className={`text-xs font-medium ${roleCfg?.color || 'text-gray-400'}`}>{roleCfg?.label}</span>
                  <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[officer.status].bg} ${statusConfig[officer.status].color}`}>
                    {statusConfig[officer.status].label}
                  </span>
                </div>
                {officer.permissions[0] !== 'all' ? (
                  <div className="flex flex-wrap gap-1.5">
                    {officer.permissions.map(p => (
                      <span key={p} className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] text-gray-400 border border-white/[0.06]">
                        {p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Full Access
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 mb-3">
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.04] rounded-lg p-3 text-center">
                    <MessageSquare size={14} className="text-blue-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{officer.alertsSent}</div>
                    <div className="text-[9px] text-gray-500">Alerts Sent</div>
                  </div>
                  <div className="bg-white/[0.04] rounded-lg p-3 text-center">
                    <BarChart3 size={14} className="text-emerald-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{officer.reportsGenerated}</div>
                    <div className="text-[9px] text-gray-500">Reports Generated</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => { api.editOfficer(officer.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:text-white hover:bg-white/[0.08] transition-all"
                ><Edit3 size={12} /> Edit</button>
                <button onClick={() => { api.resetPassword(officer.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                ><Key size={12} /> Reset Password</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===================== ADD OFFICER MODAL =====================

function AddOfficerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<NewOfficerForm>({
    fullName: '', email: '', mobile: '', role: 'operator', district: '', taluka: '', assignedWetland: '', tempPassword: '',
  });

  const formTalukas = form.district ? talukas[form.district] || [] : [];

  const update = (field: keyof NewOfficerForm, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    api.addOfficer(form);
    onClose();
    setForm({ fullName: '', email: '', mobile: '', role: 'operator', district: '', taluka: '', assignedWetland: '', tempPassword: '' });
  };

  const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <label className="text-[10px] font-medium text-gray-500 mb-1 block">{label}</label>
        <button type="button" onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white hover:border-white/[0.12] transition-all"
        >
          <span className={value ? 'text-white' : 'text-gray-600'}>{value || `Select ${label}`}</span>
          <ChevronDown size={11} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-gray-900 border border-white/[0.1] rounded-lg max-h-40 overflow-y-auto shadow-xl">
            {options.map(opt => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
                className={`block w-full text-left px-3 py-2 text-xs transition-colors ${value === opt ? 'text-emerald-400 bg-emerald-500/5' : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'}`}
              >{opt}</button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 border border-white/[0.1] rounded-xl p-5 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10"><Plus size={16} className="text-emerald-400" /></div>
                <h2 className="text-sm font-bold text-white">Add Government Officer</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.08] text-gray-500 hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div><label className="text-[10px] font-medium text-gray-500 mb-1 block">Full Name</label>
                <input type="text" value={form.fullName} onChange={e => update('fullName', e.target.value)}
                  placeholder="e.g. Dr. Sharma"
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div><label className="text-[10px] font-medium text-gray-500 mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="officer@aviangov.in"
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all" />
                </div>
                <div><label className="text-[10px] font-medium text-gray-500 mb-1 block">Mobile Number</label>
                  <input type="tel" value={form.mobile} onChange={e => update('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all" />
                </div>
              </div>
              <Select label="Role" value={form.role} onChange={v => update('role', v as OfficerRole)} options={['admin', 'district-officer', 'operator', 'viewer']} />
              <div className="grid grid-cols-2 gap-2.5">
                <Select label="District" value={form.district} onChange={v => { update('district', v); update('taluka', ''); }} options={districts} />
                <Select label="Taluka" value={form.taluka} onChange={v => update('taluka', v)} options={formTalukas} />
              </div>
              <Select label="Assigned Wetland" value={form.assignedWetland} onChange={v => update('assignedWetland', v)} options={wetlands} />
              <div><label className="text-[10px] font-medium text-gray-500 mb-1 block">Temporary Password</label>
                <input type="text" value={form.tempPassword} onChange={e => update('tempPassword', e.target.value)}
                  placeholder="Auto-generated or enter manually"
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all" />
              </div>
            </div>

            <div className="flex gap-2 mt-5 pt-4 border-t border-white/[0.06]">
              <button onClick={onClose}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:text-white hover:bg-white/[0.08] transition-all"
              >Cancel</button>
              <button onClick={handleSubmit}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20"
              ><Plus size={13} className="inline mr-1" /> Add Officer</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===================== MAIN PAGE =====================

export function UserManagementPage() {
  const [officers] = useState<Officer[]>(initialOfficers);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [profileTarget, setProfileTarget] = useState<Officer | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'disable'; id: string } | null>(null);

  const filtered = officers.filter(o => {
    const q = search.toLowerCase();
    if (q && !o.name.toLowerCase().includes(q) && !o.email.toLowerCase().includes(q) && !o.mobile.includes(q)) return false;
    if (filterRole && o.role !== filterRole) return false;
    if (filterDistrict && o.district !== filterDistrict) return false;
    if (filterStatus && o.status !== filterStatus) return false;
    return true;
  });

  const stats = [
    { label: 'Total Officers', value: officers.length, icon: Users, color: 'text-blue-400' },
    { label: 'Active', value: officers.filter(o => o.status === 'active').length, icon: UserCheck, color: 'text-emerald-400' },
    { label: 'Administrators', value: officers.filter(o => o.role === 'admin').length, icon: Shield, color: 'text-purple-400' },
    { label: 'District Officers', value: officers.filter(o => o.role === 'district-officer').length, icon: MapPin, color: 'text-emerald-400' },
    { label: 'Operators', value: officers.filter(o => o.role === 'operator').length, icon: Activity, color: 'text-blue-400' },
    { label: 'Viewers', value: officers.filter(o => o.role === 'viewer').length, icon: Eye, color: 'text-gray-400' },
  ];

  const SelectFilter = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all whitespace-nowrap"
        >
          {value || placeholder}
          <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-1 bg-gray-900 border border-white/[0.1] rounded-lg shadow-xl z-20 min-w-[160px]">
            <button onClick={() => { onChange(''); setOpen(false); }}
              className="block w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-white hover:bg-white/[0.04]"
            >All</button>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                className={`block w-full text-left px-3 py-2 text-xs transition-colors ${value === opt ? 'text-emerald-400 bg-emerald-500/5' : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'}`}
              >{opt.charAt(0).toUpperCase() + opt.slice(1).replace('-', ' ')}</button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl">
            <Users size={22} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Government Officer Management</h1>
            <p className="text-sm text-gray-400">Manage system users, roles, and access permissions</p>
          </div>
        </div>
      </div>

      {/* ===== STATISTICS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon size={14} className={s.color} />
                <span className="text-[9px] text-gray-600 uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-xl font-bold text-white">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* ===== SEARCH + FILTERS + ADD BUTTON ===== */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search officers by name, email, or mobile..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <SelectFilter value={filterRole} onChange={setFilterRole} options={['admin', 'district-officer', 'operator', 'viewer']} placeholder="Role: All" />
          <SelectFilter value={filterDistrict} onChange={setFilterDistrict} options={districts} placeholder="District: All" />
          <SelectFilter value={filterStatus} onChange={setFilterStatus} options={['active', 'inactive', 'suspended']} placeholder="Status: All" />
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus size={14} />
            Add Officer
          </button>
        </div>
      </div>

      {/* ===== USER TABLE ===== */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Officer</th>
                <th className="text-left px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="text-left px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">District</th>
                <th className="text-left px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Assigned Wetland</th>
                <th className="text-left px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="text-left px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-right px-3 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-xs text-gray-600">No officers found matching your filters</td></tr>
              ) : (
                filtered.map(o => {
                  const rc = roleConfig[o.role];
                  const sc = statusConfig[o.status];
                  const RoleIcon = rc.icon;
                  return (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {o.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{o.name}</div>
                            <div className="text-[10px] text-gray-500 truncate">{o.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-400">{o.mobile}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${rc.bg} ${rc.color}`}>
                          <RoleIcon size={10} />
                          {rc.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-400">{o.district}</td>
                      <td className="px-3 py-3 text-gray-400">{o.assignedWetland}</td>
                      <td className="px-3 py-3">
                        <span className={`flex items-center gap-1.5 text-[10px] font-medium ${sc.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-500">{o.lastLogin}</td>
                      <td className="px-3 py-3 text-gray-500">{o.joinDate}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={() => setProfileTarget(o)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="View Profile">
                            <Eye size={13} />
                          </button>
                          <button onClick={() => api.editOfficer(o.id)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-blue-400 transition-all" title="Edit">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => api.resetPassword(o.id)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-amber-400 transition-all" title="Reset Password">
                            <Key size={13} />
                          </button>
                          <button onClick={() => setConfirmAction({ type: 'disable', id: o.id })}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400 transition-all" title={o.status === 'active' ? 'Disable' : 'Enable'}>
                            <UserX size={13} />
                          </button>
                          <button onClick={() => setConfirmAction({ type: 'delete', id: o.id })}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-500 transition-all" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODALS ===== */}
      <AddOfficerModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      <ProfileDrawer officer={profileTarget} onClose={() => setProfileTarget(null)} />
      <ConfirmDialog
        open={confirmAction?.type === 'delete'}
        title="Delete Officer"
        message="This action cannot be undone. The officer account will be permanently removed from the system."
        confirmLabel="Delete"
        onConfirm={() => { if (confirmAction) api.deleteOfficer(confirmAction.id); setConfirmAction(null); }}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction?.type === 'disable'}
        title={officers.find(o => o.id === confirmAction?.id)?.status === 'active' ? 'Disable Officer' : 'Enable Officer'}
        message="The officer will lose access to the system until re-enabled by an administrator."
        confirmLabel={officers.find(o => o.id === confirmAction?.id)?.status === 'active' ? 'Disable' : 'Enable'}
        onConfirm={() => { if (confirmAction) api.disableOfficer(confirmAction.id); setConfirmAction(null); }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
