import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Search, Eye, ChevronDown, X, MessageSquare } from 'lucide-react';

interface Citizen {
  id: string;
  fullName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  state: string;
  district: string;
  taluka: string;
  village: string;
  pincode: string;
  nearbyWetland: string;
  gpsLocation: string;
  distanceFromWetland: string;
  occupation: string;
  occupationOther: string;
  alertMethods: string[];
  alertTypes: string[];
  language: string;
  emergencyName: string;
  emergencyMobile: string;
  emergencyRelationship: string;
  agree: boolean;
  status: 'pending' | 'active' | 'rejected';
  rejectionReason: string;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
}

const seedCitizens: Citizen[] = [
  { id: 'CIT-001', fullName: 'Rajesh Patel', mobile: '9876543210', whatsapp: '9876543210', email: 'rajesh@example.com', dateOfBirth: '1985-06-15', gender: 'Male', state: 'Gujarat', district: 'Ahmedabad', taluka: 'Daskroi', village: 'Navrangpura', pincode: '380015', nearbyWetland: 'Nal Sarovar', gpsLocation: '22.5726, 72.9289', distanceFromWetland: '10-25 km', occupation: 'Farmer', occupationOther: '', alertMethods: ['SMS', 'WhatsApp'], alertTypes: ['Flood', 'Water Pollution', 'Weather'], language: 'Gujarati', emergencyName: 'Meena Patel', emergencyMobile: '9876543221', emergencyRelationship: 'Spouse', agree: true, status: 'active', rejectionReason: '', createdAt: '2026-06-15T10:30:00Z', approvedAt: '2026-06-16T08:00:00Z', rejectedAt: null },
  { id: 'CIT-002', fullName: 'Sunita Desai', mobile: '9988776655', whatsapp: '9988776655', email: 'sunita.d@example.com', dateOfBirth: '1990-11-22', gender: 'Female', state: 'Maharashtra', district: 'Mumbai', taluka: 'Choryasi', village: 'Piplod', pincode: '400001', nearbyWetland: 'Thane Creek Flamingo Sanctuary', gpsLocation: '19.0760, 72.8777', distanceFromWetland: '5-10 km', occupation: 'NGO Volunteer', occupationOther: '', alertMethods: ['WhatsApp', 'Email'], alertTypes: ['Flood', 'Wildlife', 'Bird Disease', 'Illegal Dumping'], language: 'English', emergencyName: 'Amit Desai', emergencyMobile: '9988776644', emergencyRelationship: 'Brother', agree: true, status: 'pending', rejectionReason: '', createdAt: '2026-06-28T14:00:00Z', approvedAt: null, rejectedAt: null },
  { id: 'CIT-003', fullName: 'Vikram Singh', mobile: '9123456780', whatsapp: '9123456780', email: 'vikram@example.com', dateOfBirth: '1978-03-08', gender: 'Male', state: 'Rajasthan', district: 'Jaipur', taluka: 'Amer', village: 'Sanganer', pincode: '302002', nearbyWetland: 'Keoladeo National Park', gpsLocation: '27.0238, 74.2179', distanceFromWetland: '25-50 km', occupation: 'Forest Staff', occupationOther: '', alertMethods: ['SMS'], alertTypes: ['Fire', 'Wildlife', 'Illegal Dumping'], language: 'Hindi', emergencyName: 'Anita Singh', emergencyMobile: '9123456781', emergencyRelationship: 'Spouse', agree: true, status: 'pending', rejectionReason: '', createdAt: '2026-06-29T09:15:00Z', approvedAt: null, rejectedAt: null },
  { id: 'CIT-004', fullName: 'Priya Kumar', mobile: '9012345678', whatsapp: '9012345678', email: 'priya.k@example.com', dateOfBirth: '1995-09-12', gender: 'Female', state: 'Kerala', district: 'Kochi', taluka: 'Mylapore', village: 'San Thome', pincode: '682001', nearbyWetland: 'Chilika Lake', gpsLocation: '19.7385, 85.3097', distanceFromWetland: '>50 km', occupation: 'Student', occupationOther: '', alertMethods: ['Email'], alertTypes: ['Flood', 'Weather', 'Bird Disease'], language: 'English', emergencyName: 'Suresh Kumar', emergencyMobile: '9012345679', emergencyRelationship: 'Father', agree: true, status: 'rejected', rejectionReason: 'Incomplete address details. Please provide full village name.', createdAt: '2026-06-25T16:45:00Z', approvedAt: null, rejectedAt: '2026-06-27T10:00:00Z' },
  { id: 'CIT-005', fullName: 'Arun Joshi', mobile: '8877665544', whatsapp: '8877665544', email: '', dateOfBirth: '', gender: '', state: 'Uttar Pradesh', district: 'Lucknow', taluka: 'Huzur', village: 'Kerwa', pincode: '226001', nearbyWetland: 'Loktak Lake', gpsLocation: '', distanceFromWetland: '5-10 km', occupation: 'Fisherman', occupationOther: '', alertMethods: ['SMS', 'WhatsApp'], alertTypes: ['Water Pollution', 'Fire', 'Wildlife', 'Weather'], language: 'Hindi', emergencyName: 'Geeta Joshi', emergencyMobile: '8877665533', emergencyRelationship: 'Spouse', agree: true, status: 'pending', rejectionReason: '', createdAt: '2026-06-30T08:30:00Z', approvedAt: null, rejectedAt: null },
  { id: 'CIT-006', fullName: 'Lakshmi Reddy', mobile: '7766554433', whatsapp: '7766554433', email: 'lakshmi.r@example.com', dateOfBirth: '1988-01-20', gender: 'Female', state: 'Andhra Pradesh', district: 'Visakhapatnam', taluka: 'Choryasi', village: 'Adajan', pincode: '530001', nearbyWetland: 'Kolleru Lake', gpsLocation: '17.6868, 83.2185', distanceFromWetland: '1-5 km', occupation: 'Villager', occupationOther: '', alertMethods: ['SMS'], alertTypes: ['Flood', 'Water Pollution', 'Weather'], language: 'English', emergencyName: 'Venkat Reddy', emergencyMobile: '7766554422', emergencyRelationship: 'Husband', agree: true, status: 'active', rejectionReason: '', createdAt: '2026-06-10T11:00:00Z', approvedAt: '2026-06-11T09:00:00Z', rejectedAt: null },
];

const initialCitizens: Citizen[] = [];

function loadCitizens(): Citizen[] {
  try {
    const stored = localStorage.getItem('avian_citizens');
    if (stored && JSON.parse(stored).length > 0) {
      return JSON.parse(stored);
    }
    localStorage.setItem('avian_citizens', JSON.stringify(seedCitizens));
    return seedCitizens;
  } catch {
    localStorage.setItem('avian_citizens', JSON.stringify(seedCitizens));
    return seedCitizens;
  }
}

export function CitizenRequestsPage() {
  const [citizens, setCitizens] = useState<Citizen[]>(loadCitizens);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('pending');
  const [selected, setSelected] = useState<Citizen | null>(null);
  const [rejectModal, setRejectModal] = useState<Citizen | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

  const save = (updated: Citizen[]) => {
    setCitizens(updated);
    localStorage.setItem('avian_citizens', JSON.stringify(updated));
  };

  const addNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleApprove = (citizen: Citizen) => {
    const updated = citizens.map(c =>
      c.id === citizen.id
        ? { ...c, status: 'active' as const, approvedAt: new Date().toISOString(), rejectionReason: '' }
        : c
    );
    save(updated);
    const msg = `Your AvianGuard registration has been approved. You will now receive real-time environmental alerts.`;
    addNotification(`SMS sent to ${citizen.mobile}: "${msg}"`, 'success');
    setSelected(null);
  };

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    const updated = citizens.map(c =>
      c.id === rejectModal.id
        ? { ...c, status: 'rejected' as const, rejectionReason: rejectReason.trim(), rejectedAt: new Date().toISOString() }
        : c
    );
    save(updated);
    const msg = `Your AvianGuard registration has been rejected. Reason: ${rejectReason.trim()}`;
    addNotification(`SMS sent to ${rejectModal.mobile}: "${msg}"`, 'error');
    setRejectModal(null);
    setRejectReason('');
    setSelected(null);
  };

  const filtered = citizens.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = citizens.filter(c => c.status === 'pending').length;
  const activeCount = citizens.filter(c => c.status === 'active').length;
  const rejectedCount = citizens.filter(c => c.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl">
            <Users size={22} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Citizen Requests</h1>
            <p className="text-sm text-gray-400">Manage citizen registrations and approvals</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="text-2xl font-bold text-white">{citizens.length}</div>
          <div className="text-xs text-gray-400 mt-1">Total Registrations</div>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
          <div className="text-xs text-gray-400 mt-1">Pending</div>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="text-2xl font-bold text-emerald-400">{activeCount}</div>
          <div className="text-xs text-gray-400 mt-1">Active</div>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="text-2xl font-bold text-red-400">{rejectedCount}</div>
          <div className="text-xs text-gray-400 mt-1">Rejected</div>
        </div>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID or mobile..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/30 focus:bg-emerald-500/5 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'active', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  filter === f
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-500 hover:text-white border border-transparent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No citizen registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Citizen</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Wetland</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Occupation</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                  <th className="py-3 px-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(citizen => (
                  <tr key={citizen.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                          {citizen.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{citizen.fullName}</div>
                          <div className="text-xs text-gray-500">{citizen.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-400">
                      <div>{citizen.mobile}</div>
                      <div className="text-gray-600">{citizen.email || '—'}</div>
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-400">{citizen.nearbyWetland}</td>
                    <td className="py-3 px-2 text-xs text-gray-400">{citizen.occupation}{citizen.occupationOther ? ` (${citizen.occupationOther})` : ''}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        citizen.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : citizen.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {citizen.status === 'active' ? <CheckCircle size={10} /> : citizen.status === 'rejected' ? <XCircle size={10} /> : <Clock size={10} />}
                        {citizen.status.charAt(0).toUpperCase() + citizen.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-500">{new Date(citizen.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => setSelected(citizen)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-gray-900 border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gray-900 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                  {selected.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{selected.fullName}</h2>
                  <p className="text-xs text-gray-500">{selected.id}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailSection title="Personal Information">
                  <DetailRow label="Full Name" value={selected.fullName} />
                  <DetailRow label="Mobile" value={selected.mobile} />
                  <DetailRow label="WhatsApp" value={selected.whatsapp} />
                  <DetailRow label="Email" value={selected.email || '—'} />
                  <DetailRow label="Date of Birth" value={selected.dateOfBirth || '—'} />
                  <DetailRow label="Gender" value={selected.gender || '—'} />
                </DetailSection>
                <DetailSection title="Address">
                  <DetailRow label="State" value={selected.state} />
                  <DetailRow label="District" value={selected.district} />
                  <DetailRow label="Taluka" value={selected.taluka} />
                  <DetailRow label="Village" value={selected.village} />
                  <DetailRow label="Pincode" value={selected.pincode} />
                </DetailSection>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailSection title="Location & Occupation">
                  <DetailRow label="Nearby Wetland" value={selected.nearbyWetland} />
                  <DetailRow label="GPS Location" value={selected.gpsLocation || '—'} />
                  <DetailRow label="Distance" value={selected.distanceFromWetland || '—'} />
                  <DetailRow label="Occupation" value={selected.occupation + (selected.occupationOther ? ` (${selected.occupationOther})` : '')} />
                </DetailSection>
                <DetailSection title="Alert Preferences">
                  <DetailRow label="Channels" value={selected.alertMethods.join(', ')} />
                  <DetailRow label="Language" value={selected.language} />
                  <DetailRow label="Alert Types" value={selected.alertTypes.join(', ')} />
                </DetailSection>
              </div>

              <DetailSection title="Emergency Contact">
                <div className="grid grid-cols-3 gap-2">
                  <DetailRow label="Name" value={selected.emergencyName} />
                  <DetailRow label="Mobile" value={selected.emergencyMobile} />
                  <DetailRow label="Relationship" value={selected.emergencyRelationship} />
                </div>
              </DetailSection>

              {selected.status === 'rejected' && selected.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-300">{selected.rejectionReason}</p>
                </div>
              )}
            </div>

            {selected.status === 'pending' && (
              <div className="sticky bottom-0 bg-gray-900 border-t border-white/[0.06] px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setRejectModal(selected)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selected)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle size={14} />
                    Approve
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setRejectModal(null); setRejectReason(''); }} />
          <div className="relative bg-gray-900 border border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2">Reject Registration</h3>
            <p className="text-sm text-gray-400 mb-4">
              Provide a reason for rejecting <span className="text-white font-medium">{rejectModal.fullName}</span>'s registration.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-red-500/40 focus:bg-red-500/[0.03] transition-all resize-none"
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-[70] space-y-2">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl max-w-sm text-sm ${
              n.type === 'success'
                ? 'bg-emerald-900/90 border-emerald-500/30 text-emerald-200'
                : 'bg-red-900/90 border-red-500/30 text-red-200'
            }`}
          >
            <MessageSquare size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.04] rounded-xl p-4">
      <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}
