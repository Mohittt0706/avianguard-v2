import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Users, Search, Filter, ChevronDown, Eye, Edit3, Trash2, Plus,
  RefreshCw, AlertTriangle, Shield, Mail, Phone, MapPin, Download,
  CheckCircle, XCircle, Ban, Clock, ChevronLeft, ChevronRight,
  Upload, X, Loader2, Key, Building2, UserCheck, Settings,
  AlertOctagon,
} from 'lucide-react';
import { toast } from 'sonner';
import ShinyText from '../ShinyText';
import { DarkSelect } from '../ui/DarkSelect';
import { PermissionModal } from '../ui/PermissionModal';
import { userApi } from '@/services/userApi';
import { useAuth } from '@/context/AuthContext';
import type { User, UserRole, AccountStatus, UserStats } from '@/types/auth';

// ===================== CONSTANTS =====================

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
const departments = ['Environmental Science', 'Water Resources', 'Wildlife', 'Pollution Control', 'Field Operations', 'Research', 'Administration'];
const roleLabels: Record<string, string> = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', OPERATOR: 'Operator', VIEWER: 'Viewer' };
const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  INACTIVE: { label: 'Inactive', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  SUSPENDED: { label: 'Suspended', color: 'text-red-400', bg: 'bg-red-500/10' },
  PENDING: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10' },
};
const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'text-purple-400 bg-purple-500/10',
  ADMIN: 'text-blue-400 bg-blue-500/10',
  OPERATOR: 'text-emerald-400 bg-emerald-500/10',
  VIEWER: 'text-gray-400 bg-gray-500/10',
};

const INPUT_CLASS = 'w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/40 transition-all';
const LABEL_CLASS = 'text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block';

// ===================== COMPONENTS =====================

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />;
}

function SelectField({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className={LABEL_CLASS}>{label}</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white hover:border-white/[0.12] transition-all"
      >
        <span className={value ? 'text-white' : 'text-gray-600'}>{value || placeholder || `Select ${label}`}</span>
        <ChevronDown size={11} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-gray-900 border border-white/[0.1] rounded-lg max-h-40 overflow-y-auto shadow-xl">
          <button type="button" onClick={() => { onChange(''); setOpen(false); }}
            className={`block w-full text-left px-3 py-2 text-xs transition-colors ${!value ? 'text-emerald-400 bg-emerald-500/5' : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'}`}
          >All</button>
          {options.map(opt => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }}
              className={`block w-full text-left px-3 py-2 text-xs transition-colors ${value === opt ? 'text-emerald-400 bg-emerald-500/5' : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'}`}
            >{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===================== MAIN PAGE =====================

export function UserManagementPage() {
  const navigate = useNavigate();
  const { hasPermission, user: currentUser } = useAuth();
  const canCreate = hasPermission('users', 'create') || currentUser?.role === 'SUPER_ADMIN';
  const canUpdate = hasPermission('users', 'update') || currentUser?.role === 'SUPER_ADMIN';
  const canDelete = hasPermission('users', 'delete') || currentUser?.role === 'SUPER_ADMIN';
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, inactive: 0, suspended: 0, pending: 0, roles: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterTaluka, setFilterTaluka] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<User | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkTarget, setBulkTarget] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<User | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<{ action: string; count: number } | null>(null);
  const [permissionModalUser, setPermissionModalUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'VIEWER' as UserRole,
    district: '', taluka: '', assignedWetland: '', phone: '', employeeId: '',
    department: '', designation: '', address: '', accountStatus: 'ACTIVE' as AccountStatus,
  });

  const fetchUsers = useCallback(async () => {
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filterRole) params.role = filterRole;
      if (filterDistrict) params.district = filterDistrict;
      if (filterTaluka) params.taluka = filterTaluka;
      if (filterDepartment) params.department = filterDepartment;
      if (filterStatus) params.accountStatus = filterStatus;

      const [userRes, statsRes] = await Promise.all([
        userApi.getAll(params),
        userApi.getStats(),
      ]);
      setUsers(userRes.data.users);
      setTotalPages(userRes.data.pagination.pages);
      setStats(statsRes.data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filterRole, filterDistrict, filterTaluka, filterDepartment, filterStatus]);

  useEffect(() => { setLoading(true); fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [searchQuery, filterRole, filterDistrict, filterTaluka, filterDepartment, filterStatus]);

  const resetForm = () => setForm({
    name: '', email: '', password: '', role: 'VIEWER',
    district: '', taluka: '', assignedWetland: '', phone: '', employeeId: '',
    department: '', designation: '', address: '', accountStatus: 'ACTIVE',
  });

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Name, email, and password are required'); return; }
    try {
      await userApi.create({
        name: form.name, email: form.email, password: form.password, role: form.role,
        district: form.district || undefined, taluka: form.taluka || undefined,
        assignedWetland: form.assignedWetland || undefined, phone: form.phone || undefined,
        employeeId: form.employeeId || undefined, department: form.department || undefined,
        designation: form.designation || undefined, address: form.address || undefined,
        accountStatus: form.accountStatus,
      });
      toast.success('Officer created successfully');
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create officer');
    }
  };

  const handleEdit = async () => {
    if (!showEditModal) return;
    try {
      const data: Record<string, unknown> = {};
      if (form.name) data.name = form.name;
      if (form.email) data.email = form.email;
      if (form.role) data.role = form.role;
      data.district = form.district || null;
      data.taluka = form.taluka || null;
      data.assignedWetland = form.assignedWetland || null;
      data.phone = form.phone || null;
      data.employeeId = form.employeeId || null;
      data.department = form.department || null;
      data.designation = form.designation || null;
      data.address = form.address || null;
      data.accountStatus = form.accountStatus;

      await userApi.update(showEditModal.id, data as Partial<User>);
      toast.success('Officer updated successfully');
      setShowEditModal(null);
      resetForm();
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update officer');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await userApi.delete(id);
      toast.success('Officer deleted');
      setConfirmDelete(null);
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally { setDeleting(null); }
  };

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      await userApi.toggleStatus(id);
      toast.success('Status toggled');
      setConfirmToggle(null);
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle status');
    } finally { setToggling(null); }
  };

  const handleResetPassword = async (id: string) => {
    try {
      const res = await userApi.resetPassword(id);
      toast.success(`Temporary password: ${res.data.tempPassword}`, { duration: 15000 });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  const handleBulk = async () => {
    if (!selectedIds.length || !bulkAction) return;
    try {
      const data = bulkAction === 'assignDistrict' ? { district: bulkTarget } :
        bulkAction === 'assignWetland' ? { assignedWetland: bulkTarget } : undefined;
      await userApi.bulkAction(selectedIds, bulkAction, data);
      toast.success(`Bulk action completed: ${bulkAction}`);
      setSelectedIds([]);
      setBulkAction('');
      setBulkTarget('');
      setConfirmBulk(null);
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk action failed');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Name', 'Email', 'Role', 'District', 'Taluka', 'Phone', 'Employee ID', 'Department', 'Status'];
    const rows = users.map(u => [u.name, u.email, u.role, u.district || '', u.taluka || '', u.phone || '', u.employeeId || '', u.department || '', u.accountStatus]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))];
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'officers.csv'; a.click(); URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const openEdit = (user: User) => {
    setForm({
      name: user.name, email: user.email, password: '', role: user.role,
      district: user.district || '', taluka: user.taluka || '', assignedWetland: user.assignedWetland || '',
      phone: user.phone || '', employeeId: user.employeeId || '', department: user.department || '',
      designation: user.designation || '', address: user.address || '', accountStatus: user.accountStatus,
    });
    setShowEditModal(user);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) setSelectedIds([]);
    else setSelectedIds(users.map(u => u.id));
  };

  const formTalukas = form.district ? talukas[form.district] || [] : [];

  if (loading && users.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-xl" /><div className="space-y-2"><Skeleton className="h-6 w-64" /><Skeleton className="h-4 w-96" /></div></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-red-400 mb-4" />
        <p className="text-sm text-gray-400 mb-2">Failed to load officers</p>
        <p className="text-xs text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-xs font-semibold text-white">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-500/10 rounded-xl"><Users size={22} className="text-blue-400" /></div>
        <div>
          <h1 className="text-xl font-bold"><ShinyText text="Government Officer Management" color="#FFFFFF" shineColor="#22D3EE" spread={100} speed={3} className="text-xl font-bold" /></h1>
          <p className="text-sm text-gray-400">Manage government officers, roles, and permissions</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Officers', value: stats.total, icon: Users, color: 'text-blue-400' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-emerald-400' },
          { label: 'Inactive', value: stats.inactive, icon: XCircle, color: 'text-gray-400' },
          { label: 'Suspended', value: stats.suspended, icon: Ban, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/[0.04]"><s.icon size={18} className={s.color} /></div>
            <div><div className="text-xl font-bold text-white">{s.value}</div><div className="text-[10px] text-gray-500">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, employee ID, mobile, district, role..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all"
          ><Filter size={13} /> Filters <ChevronDown size={11} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} /></button>
          {canCreate && (
            <button onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all"
            ><Plus size={13} /> Add Officer</button>
          )}
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 pt-3 border-t border-white/[0.06]">
            <SelectField label="Role" value={filterRole} onChange={setFilterRole} options={['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'VIEWER']} />
            <SelectField label="District" value={filterDistrict} onChange={setFilterDistrict} options={districts} />
            <SelectField label="Taluka" value={filterTaluka} onChange={setFilterTaluka} options={Object.values(talukas).flat()} />
            <SelectField label="Department" value={filterDepartment} onChange={setFilterDepartment} options={departments} />
            <SelectField label="Status" value={filterStatus} onChange={setFilterStatus} options={['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']} />
          </div>
        )}
      </div>

      {/* BULK ACTIONS */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-emerald-400 font-medium">{selectedIds.length} selected</span>
          <DarkSelect value={bulkAction} onChange={setBulkAction}
            options={[
              { value: '', label: 'Choose action...' },
              { value: 'delete', label: 'Delete' },
              { value: 'disable', label: 'Disable' },
              { value: 'enable', label: 'Enable' },
              { value: 'assignDistrict', label: 'Assign District' },
              { value: 'assignWetland', label: 'Assign Wetland' },
            ]}
            className="w-44"
          />
          {(bulkAction === 'assignDistrict') && (
            <DarkSelect value={bulkTarget} onChange={setBulkTarget}
              options={[{ value: '', label: 'Select district' }, ...districts.map(d => ({ value: d, label: d }))]}
              className="w-40"
            />
          )}
          {(bulkAction === 'assignWetland') && (
            <DarkSelect value={bulkTarget} onChange={setBulkTarget}
              options={[{ value: '', label: 'Select wetland' }, ...wetlands.map(w => ({ value: w, label: w }))]}
              className="w-40"
            />
          )}
          <button onClick={handleBulk} disabled={!bulkAction || (['assignDistrict', 'assignWetland'].includes(bulkAction) && !bulkTarget)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-400 transition-all disabled:opacity-50"
          >Execute</button>
          <button onClick={() => { setSelectedIds([]); setBulkAction(''); setBulkTarget(''); }}
            className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-all"
          >Clear</button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Officers</h2>
            <span className="text-[10px] text-gray-600">({users.length} shown)</span>
          </div>
          <button onClick={handleExportCsv} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all">
            <Download size={12} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-4 py-3"><input type="checkbox" checked={selectedIds.length === users.length && users.length > 0} onChange={toggleSelectAll} className="w-3.5 h-3.5 rounded accent-emerald-500" /></th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">Officer</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">District</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">Department</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">Joined</th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {users.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-xs text-gray-600">No officers found</td></tr>
              ) : users.map(u => {
                const st = statusLabels[u.accountStatus] || statusLabels.ACTIVE;
                const rc = roleColors[u.role] || roleColors.VIEWER;
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(u.id)}
                      onChange={() => setSelectedIds(prev => prev.includes(u.id) ? prev.filter(i => i !== u.id) : [...prev, u.id])}
                      className="w-3.5 h-3.5 rounded accent-emerald-500" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">{u.name}</div>
                          <div className="text-[10px] text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${rc}`}>{roleLabels[u.role] || u.role}</span></td>
                    <td className="px-4 py-3 text-gray-400">{u.district || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{u.department || '—'}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${st.bg} ${st.color}`}>{st.label}</span></td>
                    <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/dashboard/users/${u.id}`)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="View Details"><Eye size={13} /></button>
                        {canUpdate && (
                          <>
                            <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-blue-400 transition-all" title="Edit"><Edit3 size={13} /></button>
                            <button onClick={() => setPermissionModalUser(u)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-purple-400 transition-all" title="Permissions"><Shield size={13} /></button>
                          </>
                        )}
                        <button onClick={() => handleResetPassword(u.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-amber-400 transition-all" title="Reset Password"><Key size={13} /></button>
                        {canUpdate && (
                          <button onClick={() => setConfirmToggle(u)} disabled={toggling === u.id}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-cyan-400 transition-all disabled:opacity-50" title="Toggle Status">
                            {toggling === u.id ? <RefreshCw size={13} className="animate-spin" /> : u.accountStatus === 'ACTIVE' ? <XCircle size={13} /> : <CheckCircle size={13} />}
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => setConfirmDelete(u)} disabled={deleting === u.id}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400 transition-all disabled:opacity-50" title="Delete">
                            {deleting === u.id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-white/[0.06]">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-all"><ChevronLeft size={14} /></button>
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-all"><ChevronRight size={14} /></button>
          </div>
        )}
      </div>

      {/* ADD OFFICER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Add New Officer</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={LABEL_CLASS}>Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={INPUT_CLASS} placeholder="Enter full name" /></div>
              <div><label className={LABEL_CLASS}>Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={INPUT_CLASS} placeholder="officer@email.com" /></div>
              <div><label className={LABEL_CLASS}>Mobile</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={INPUT_CLASS} placeholder="+91 XXXXX XXXXX" /></div>
              <div><label className={LABEL_CLASS}>Employee ID</label><input value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className={INPUT_CLASS} placeholder="EMP-001" /></div>
              <div><label className={LABEL_CLASS}>Department</label>
                <DarkSelect value={form.department} onChange={v => setForm({ ...form, department: v })}
                  options={[{ value: '', label: 'Select Department' }, ...departments.map(d => ({ value: d, label: d }))]}
                />
              </div>
              <div><label className={LABEL_CLASS}>Designation</label><input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className={INPUT_CLASS} placeholder="e.g. Environmental Officer" /></div>
              <div><label className={LABEL_CLASS}>Role *</label>
                <DarkSelect value={form.role} onChange={v => setForm({ ...form, role: v as UserRole })}
                  options={Object.entries(roleLabels).map(([k, v]) => ({ value: k, label: v }))}
                />
              </div>
              <div><label className={LABEL_CLASS}>District</label>
                <DarkSelect value={form.district} onChange={v => setForm({ ...form, district: v, taluka: '' })}
                  options={[{ value: '', label: 'Select District' }, ...districts.map(d => ({ value: d, label: d }))]}
                />
              </div>
              <div><label className={LABEL_CLASS}>Taluka</label>
                <DarkSelect value={form.taluka} onChange={v => setForm({ ...form, taluka: v })}
                  options={[{ value: '', label: 'Select Taluka' }, ...formTalukas.map(t => ({ value: t, label: t }))]}
                />
              </div>
              <div><label className={LABEL_CLASS}>Assigned Wetland</label>
                <DarkSelect value={form.assignedWetland} onChange={v => setForm({ ...form, assignedWetland: v })}
                  options={[{ value: '', label: 'Select Wetland' }, ...wetlands.map(w => ({ value: w, label: w }))]}
                />
              </div>
              <div><label className={LABEL_CLASS}>Account Status</label>
                <DarkSelect value={form.accountStatus} onChange={v => setForm({ ...form, accountStatus: v as AccountStatus })}
                  options={Object.entries(statusLabels).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </div>
              <div className="col-span-2"><label className={LABEL_CLASS}>Address</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={INPUT_CLASS} placeholder="Full address" /></div>
              <div><label className={LABEL_CLASS}>Password *</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={INPUT_CLASS} placeholder="Min 8 characters" /></div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/[0.06]">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-all">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all">Create Officer</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT OFFICER MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(null)} />
          <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Edit Officer — {showEditModal.name}</h3>
              <button onClick={() => setShowEditModal(null)} className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={LABEL_CLASS}>Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={INPUT_CLASS} /></div>
              <div><label className={LABEL_CLASS}>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={INPUT_CLASS} /></div>
              <div><label className={LABEL_CLASS}>Mobile</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={INPUT_CLASS} /></div>
              <div><label className={LABEL_CLASS}>Employee ID</label><input value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className={INPUT_CLASS} /></div>
              <div><label className={LABEL_CLASS}>Department</label>
                <DarkSelect value={form.department} onChange={v => setForm({ ...form, department: v })}
                  options={[{ value: '', label: 'Select Department' }, ...departments.map(d => ({ value: d, label: d }))]}
                />
              </div>
              <div><label className={LABEL_CLASS}>Designation</label><input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className={INPUT_CLASS} /></div>
              <div><label className={LABEL_CLASS}>Role</label>
                <DarkSelect value={form.role} onChange={v => setForm({ ...form, role: v as UserRole })}
                  options={Object.entries(roleLabels).map(([k, v]) => ({ value: k, label: v }))}
                />
              </div>
              <div><label className={LABEL_CLASS}>District</label>
                <DarkSelect value={form.district} onChange={v => setForm({ ...form, district: v, taluka: '' })}
                  options={[{ value: '', label: 'Select District' }, ...districts.map(d => ({ value: d, label: d }))]}
                />
              </div>
              <div><label className={LABEL_CLASS}>Taluka</label>
                <DarkSelect value={form.taluka} onChange={v => setForm({ ...form, taluka: v })}
                  options={[{ value: '', label: 'Select Taluka' }, ...(talukas[form.district] || []).map(t => ({ value: t, label: t }))]}
                />
              </div>
              <div><label className={LABEL_CLASS}>Assigned Wetland</label>
                <DarkSelect value={form.assignedWetland} onChange={v => setForm({ ...form, assignedWetland: v })}
                  options={[{ value: '', label: 'Select Wetland' }, ...wetlands.map(w => ({ value: w, label: w }))]}
                />
              </div>
              <div><label className={LABEL_CLASS}>Status</label>
                <DarkSelect value={form.accountStatus} onChange={v => setForm({ ...form, accountStatus: v as AccountStatus })}
                  options={Object.entries(statusLabels).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </div>
              <div className="col-span-2"><label className={LABEL_CLASS}>Address</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={INPUT_CLASS} /></div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/[0.06]">
              <button onClick={() => setShowEditModal(null)} className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-all">Cancel</button>
              <button onClick={handleEdit} className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-xl"><AlertOctagon size={20} className="text-red-400" /></div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Officer</h3>
                <p className="text-[10px] text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Are you sure you want to delete <span className="text-white font-medium">{confirmDelete.name}</span>?
              All their data will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-all"
              >Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.id)} disabled={deleting === confirmDelete.id}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-400 transition-all disabled:opacity-50"
              >
                {deleting === confirmDelete.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM TOGGLE STATUS */}
      {confirmToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmToggle(null)} />
          <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/10 rounded-xl"><Shield size={20} className="text-cyan-400" /></div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {confirmToggle.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'} Officer
                </h3>
                <p className="text-[10px] text-gray-500">Change account status</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {confirmToggle.accountStatus === 'ACTIVE'
                ? <>Deactivate <span className="text-white font-medium">{confirmToggle.name}</span>? They will lose access to the system.</>
                : <>Activate <span className="text-white font-medium">{confirmToggle.name}</span>? They will regain access to the system.</>
              }
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setConfirmToggle(null)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-all"
              >Cancel</button>
              <button onClick={() => handleToggle(confirmToggle.id)} disabled={toggling === confirmToggle.id}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-cyan-500 hover:bg-cyan-400 transition-all disabled:opacity-50"
              >
                {toggling === confirmToggle.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                {confirmToggle.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM BULK ACTION */}
      {confirmBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmBulk(null)} />
          <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-xl"><AlertOctagon size={20} className="text-amber-400" /></div>
              <div>
                <h3 className="text-sm font-bold text-white">Confirm Bulk Action</h3>
                <p className="text-[10px] text-gray-500">{confirmBulk.count} officers will be affected</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Execute <span className="text-white font-medium">{confirmBulk.action}</span> on{' '}
              <span className="text-white font-medium">{confirmBulk.count}</span> selected officers?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setConfirmBulk(null)}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-all"
              >Cancel</button>
              <button onClick={handleBulk}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-400 transition-all"
              >Execute</button>
            </div>
          </div>
        </div>
      )}

      {/* PERMISSION MODAL */}
      {permissionModalUser && (
        <PermissionModal
          user={permissionModalUser}
          onClose={() => setPermissionModalUser(null)}
          onSave={(updated) => {
            setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
            setPermissionModalUser(null);
          }}
        />
      )}
    </div>
  );
}
