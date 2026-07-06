import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Calendar, Download, Clock, FileSpreadsheet, FilePieChart,
  Search, Filter, ChevronDown, Eye, Share2, Trash2, Plus, RefreshCw,
  Brain, AlertTriangle, CheckCircle, Activity, MapPin, Droplets,
  Settings, BarChart3, Upload, Printer, X, Users, Radio,
  ChevronLeft, ChevronRight, Link, Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import ShinyText from '../ShinyText';
import { reportApi } from '@/services/reportApi';
import type { Report, ReportActivity, ReportStatsResponse } from '@/types/report';

type ReportStats = ReportStatsResponse['data'];

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

const reportTemplates: { id: string; label: string; desc: string; icon: typeof FileText; color: string }[] = [
  { id: 'daily-water', label: 'Daily Water Quality', desc: 'pH, TDS, DO, turbidity summary', icon: Droplets, color: 'text-cyan-400' },
  { id: 'pollution-trend', label: 'Pollution Trend Analysis', desc: '30-day pollutant tracking', icon: BarChart3, color: 'text-orange-400' },
  { id: 'emergency', label: 'Emergency Incident Report', desc: 'Incident documentation', icon: AlertTriangle, color: 'text-red-400' },
  { id: 'ai-prediction', label: 'AI Prediction Report', desc: 'ML-based risk forecasting', icon: Brain, color: 'text-purple-400' },
  { id: 'compliance', label: 'Government Compliance Report', desc: 'Regulatory format', icon: FileText, color: 'text-emerald-400' },
  { id: 'custom', label: 'Custom Report', desc: 'User-defined parameters', icon: Settings, color: 'text-blue-400' },
];

const templateNames: Record<string, string> = {
  'daily-water': 'Daily Water Quality', 'pollution-trend': 'Pollution Trend Analysis',
  'emergency': 'Emergency Incident', 'ai-prediction': 'AI Prediction',
  'compliance': 'Government Compliance', 'custom': 'Custom Report',
};

const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  generating: { label: 'Generating', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/10' },
  archived: { label: 'Archived', color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

const emailRecipients = ['District Authority', 'Collector', 'Pollution Control Board', 'Forest Department', 'Research Team'];

// ===================== COMPONENTS =====================

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />;
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof FileText; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4 flex items-center gap-3">
      <div className="p-2.5 rounded-lg bg-white/[0.04]">
        <Icon size={18} className={color} />
      </div>
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-[10px] text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <label className="text-[10px] font-medium text-gray-500 mb-1 block">{label}</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white hover:border-white/[0.12] transition-all"
      >
        <span className={value ? 'text-white' : 'text-gray-600'}>{value || placeholder || `Select ${label}`}</span>
        <ChevronDown size={11} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-gray-900 border border-white/[0.1] rounded-lg max-h-40 overflow-y-auto shadow-xl">
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

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded accent-emerald-500 bg-white/[0.04] border border-white/[0.1]" />
      <span className="text-[11px] text-gray-400 group-hover:text-gray-300 transition-colors">{label}</span>
    </label>
  );
}

// ===================== MAIN PAGE =====================

export function ReportsPage() {
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats>({ total: 0, ready: 0, generating: 0, failed: 0, todayCount: 0, scheduledCount: 0 });
  const [activity, setActivity] = useState<ReportActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterWetland, setFilterWetland] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formDistrict, setFormDistrict] = useState('');
  const [formTaluka, setFormTaluka] = useState('');
  const [formWetland, setFormWetland] = useState('');
  const [formType, setFormType] = useState('daily-water');
  const [formFormat, setFormFormat] = useState('pdf');
  const [formDateFrom, setFormDateFrom] = useState('');
  const [formDateTo, setFormDateTo] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSensors, setIncludeSensors] = useState(true);
  const [includeAI, setIncludeAI] = useState(false);
  const [includeCitizens, setIncludeCitizens] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const [shareDialog, setShareDialog] = useState<Report | null>(null);
  const [emailDialog, setEmailDialog] = useState<Report | null>(null);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const formTalukas = formDistrict ? talukas[formDistrict] || [] : [];

  const fetchReports = useCallback(async () => {
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filterDistrict) params.district = filterDistrict;
      if (filterWetland) params.wetland = filterWetland;
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;

      const [reportRes, statsRes, activityRes] = await Promise.all([
        reportApi.getAll(params),
        reportApi.getStats(),
        reportApi.getActivity(8),
      ]);

      setReports(reportRes.data.reports);
      setTotalPages(reportRes.data.pagination.pages);
      setStats(statsRes.data);
      setActivity(activityRes.data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load reports';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filterDistrict, filterWetland, filterStatus, filterType]);

  useEffect(() => {
    setLoading(true);
    fetchReports();
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, [fetchReports]);

  useEffect(() => { setPage(1); }, [searchQuery, filterDistrict, filterWetland, filterStatus, filterType]);

  const handleGenerate = async () => {
    if (!selectedTemplate) { toast.error('Select a report template first'); return; }
    setGenerating(true);
    try {
      const title = `${templateNames[selectedTemplate] || selectedTemplate} — ${formWetland || formDistrict || 'All Wetlands'} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      await reportApi.create({
        title,
        type: selectedTemplate,
        format: formFormat,
        district: formDistrict || undefined,
        taluka: formTaluka || undefined,
        wetland: formWetland || undefined,
        dateFrom: formDateFrom || undefined,
        dateTo: formDateTo || undefined,
        includeCharts,
        includeSensors,
        includeAI,
        includeCitizens,
      });
      toast.success('Report generation started');
      fetchReports();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await reportApi.delete(id);
      toast.success('Report deleted');
      fetchReports();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const handleShare = async (report: Report) => {
    try {
      const res = await reportApi.share(report.id);
      setShareDialog({ ...report, shareToken: res.data.shareToken });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate share link');
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/reports/shared/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied');
  };

  const handleDownloadCsv = async (report: Report) => {
    try {
      const res = await reportApi.getCsvData(report.id);
      const rows = res.data;
      if (!rows.length) { toast.error('No data to export'); return; }
      const headers = ['Sensor ID', 'Sensor Name', 'Wetland', 'Temperature', 'pH', 'TDS', 'DO', 'Water Level', 'Battery', 'Signal', 'Timestamp'];
      const csv = [headers.join(',')];
      rows.forEach(r => {
        csv.push([r.sensorId, r.sensorName, r.wetland, r.temperature, r.ph, r.tds, r.dissolvedOxygen, r.waterLevel, r.battery ?? '', r.signalStrength ?? '', r.timestamp].join(','));
      });
      const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to export CSV');
    }
  };

  const handleSendEmail = async () => {
    if (!emailDialog || !emailRecipient) { toast.error('Select a recipient'); return; }
    toast.success(`Report emailed to ${emailRecipient}`);
    setEmailDialog(null);
    setEmailRecipient('');
  };

  if (loading && reports.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-xl" /><div className="space-y-2"><Skeleton className="h-6 w-64" /><Skeleton className="h-4 w-96" /></div></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        <Skeleton className="h-10 w-full" />
        <div className="grid lg:grid-cols-5 gap-4"><Skeleton className="lg:col-span-3 h-64" /><Skeleton className="lg:col-span-2 h-64" /></div>
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-red-400 mb-4" />
        <p className="text-sm text-gray-400 mb-2">Failed to load reports</p>
        <p className="text-xs text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-xs font-semibold text-white">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-500/10 rounded-xl">
          <FileText size={22} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold"><ShinyText text="Environmental Reporting Center" color="#FFFFFF" shineColor="#22D3EE" spread={100} speed={3} className="text-xl font-bold" /></h1>
          <p className="text-sm text-gray-400">Generate, schedule, and manage environmental monitoring reports</p>
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={FileText} label="Total Reports" value={stats.total} color="text-blue-400" />
        <StatCard icon={Calendar} label="Generated Today" value={stats.todayCount} color="text-emerald-400" />
        <StatCard icon={Clock} label="Scheduled" value={stats.scheduledCount} color="text-amber-400" />
        <StatCard icon={Activity} label="Ready" value={stats.ready} color="text-cyan-400" />
        <StatCard icon={AlertTriangle} label="Failed" value={stats.failed} color="text-red-400" />
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, district, wetland, or generated by..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all"
          ><Filter size={13} /> Filters <ChevronDown size={11} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} /></button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-white/[0.06]">
            <SelectField label="District" value={filterDistrict} onChange={setFilterDistrict} options={districts} />
            <SelectField label="Wetland" value={filterWetland} onChange={setFilterWetland} options={wetlands} />
            <SelectField label="Status" value={filterStatus} onChange={setFilterStatus} options={['ready', 'generating', 'failed', 'archived']} />
            <SelectField label="Report Type" value={filterType} onChange={setFilterType} options={reportTemplates.map(t => t.id)} />
          </div>
        )}
      </div>

      {/* MAIN GRID: TEMPLATES + FORM */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={14} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white">Report Templates</h2>
            <span className="ml-auto text-[10px] text-gray-600">{reportTemplates.length} templates</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {reportTemplates.map(t => {
              const Icon = t.icon;
              const sel = selectedTemplate === t.id;
              return (
                <button key={t.id} onClick={() => { setSelectedTemplate(t.id); setFormType(t.id); }}
                  className={`text-left p-3 rounded-xl border transition-all ${sel ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'}`}
                >
                  <div className={`p-2 rounded-lg inline-block mb-2 ${sel ? 'bg-emerald-500/10' : 'bg-white/[0.04]'}`}>
                    <Icon size={16} className={t.color} />
                  </div>
                  <div className="text-xs font-semibold text-white">{t.label}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{t.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={14} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Report Generator</h2>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <SelectField label="District" value={formDistrict} onChange={v => { setFormDistrict(v); setFormTaluka(''); }} options={districts} />
              <SelectField label="Taluka" value={formTaluka} onChange={setFormTaluka} options={formTalukas} placeholder="Select district first" />
            </div>
            <SelectField label="Wetland" value={formWetland} onChange={setFormWetland} options={wetlands} />
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-medium text-gray-500 mb-1 block">From Date</label>
                <input type="date" value={formDateFrom} onChange={e => setFormDateFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white outline-none focus:border-emerald-500/40 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 mb-1 block">To Date</label>
                <input type="date" value={formDateTo} onChange={e => setFormDateTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white outline-none focus:border-emerald-500/40 transition-all" />
              </div>
            </div>
            <SelectField label="Format" value={formFormat} onChange={setFormFormat} options={['pdf', 'csv', 'excel']} />
            <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
              <Checkbox label="Include Charts" checked={includeCharts} onChange={setIncludeCharts} />
              <Checkbox label="Include Sensor Readings" checked={includeSensors} onChange={setIncludeSensors} />
              <Checkbox label="Include AI Analysis" checked={includeAI} onChange={setIncludeAI} />
              <Checkbox label="Include Citizen Alert Summary" checked={includeCitizens} onChange={setIncludeCitizens} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleGenerate} disabled={generating || !selectedTemplate}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >{generating ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />} {generating ? 'Generating...' : 'Generate Report'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Generated Reports</h2>
            <span className="text-[10px] text-gray-600">({reports.length} reports)</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Generated By</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="text-right px-4 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {reports.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-gray-600">No reports found</td></tr>
              ) : reports.map(r => {
                const sb = statusBadge[r.status] || statusBadge.ready;
                const template = reportTemplates.find(t => t.id === r.type);
                const Icon = template?.icon || FileText;
                return (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-white/[0.04]"><Icon size={12} className="text-gray-400" /></div>
                        <span className="text-xs font-medium text-white max-w-[250px] truncate">{r.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{template?.label || r.type}</td>
                    <td className="px-4 py-3 text-gray-400">{r.generatedBy}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sb.bg} ${sb.color}`}>{sb.label}</span></td>
                    <td className="px-4 py-3 text-gray-400">{r.fileSize || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === 'ready' && (
                          <>
                            <button onClick={() => navigate(`/dashboard/reports/${r.id}`)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="Preview"><Eye size={13} /></button>
                            <button onClick={() => handleDownloadCsv(r)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-blue-400 transition-all" title="Download CSV"><Download size={13} /></button>
                            <button onClick={() => handleShare(r)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-purple-400 transition-all" title="Share"><Share2 size={13} /></button>
                            <button onClick={() => setEmailDialog(r)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-cyan-400 transition-all" title="Email"><Mail size={13} /></button>
                          </>
                        )}
                        <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
                          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400 transition-all disabled:opacity-50" title="Delete">
                          {deleting === r.id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
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
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-all"
            ><ChevronLeft size={14} /></button>
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-all"
            ><ChevronRight size={14} /></button>
          </div>
        )}
      </div>

      {/* BOTTOM: ACTIVITY */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4 max-h-[280px] flex flex-col">
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <RefreshCw size={14} className="text-blue-400" />
          <h2 className="text-sm font-bold text-white">Recent Activity</h2>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {activity.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-4">No recent activity</p>
          ) : activity.map(a => (
            <div key={a.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-all">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.type === 'success' ? 'bg-emerald-500' : a.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-300 leading-tight">{a.message}</p>
                <p className="text-[8px] text-gray-600 mt-0.5">{new Date(a.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SHARE DIALOG */}
      {shareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShareDialog(null)} />
          <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Share Report</h3>
              <button onClick={() => setShareDialog(null)} className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            <p className="text-xs text-gray-400 mb-3">Share this report using the link below:</p>
            <div className="flex items-center gap-2">
              <input readOnly value={`${window.location.origin}/reports/shared/${shareDialog.shareToken}`}
                className="flex-1 px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-gray-300 font-mono" />
              <button onClick={() => handleCopyLink(shareDialog.shareToken!)}
                className="px-3 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all"
              ><Link size={13} /></button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL DIALOG */}
      {emailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEmailDialog(null)} />
          <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Email Report</h3>
              <button onClick={() => setEmailDialog(null)} className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            <p className="text-xs text-gray-400 mb-3">Send "{emailDialog.title}" to:</p>
            <SelectField label="Recipient" value={emailRecipient} onChange={setEmailRecipient} options={emailRecipients} placeholder="Select recipient" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEmailDialog(null)} className="flex-1 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] transition-all">Cancel</button>
              <button onClick={handleSendEmail} disabled={!emailRecipient}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-50"
              ><Mail size={13} className="inline mr-1" /> Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
