import { useState } from 'react';
import {
  FileText, Calendar, Download, Clock, FileSpreadsheet, FilePieChart,
  Search, Filter, ChevronDown, Eye, Share2, Trash2, Plus, RefreshCw,
  Brain, AlertTriangle, CheckCircle, Activity, MapPin, Droplets,
  Settings, BarChart3, Upload, Printer, X, Users, Radio,
} from 'lucide-react';

// ===================== TYPES =====================

type ReportTemplateId = 'daily-water' | 'pollution-trend' | 'emergency' | 'ai-prediction' | 'compliance' | 'custom';
type ExportFormat = 'pdf' | 'excel' | 'csv';
type Language = 'english' | 'gujarati';
type ScheduleFreq = 'daily' | 'weekly' | 'monthly';
type ReportStatus = 'generating' | 'ready' | 'failed';

interface GeneratedReport {
  id: string;
  name: string;
  type: ReportTemplateId;
  generatedBy: string;
  date: Date;
  status: ReportStatus;
  size: string;
  district: string;
  wetland: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: ScheduleFreq;
  format: ExportFormat;
  nextRun: Date;
  recipients: number;
  active: boolean;
}

interface ActivityItem {
  id: string;
  message: string;
  timestamp: Date;
  type: 'success' | 'info' | 'warning';
}

// ===================== DATA =====================

const indianStates = ['Gujarat'];
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

const reportTemplates: { id: ReportTemplateId; label: string; desc: string; icon: typeof FileText; color: string }[] = [
  { id: 'daily-water', label: 'Daily Water Quality', desc: 'pH, TDS, DO, turbidity summary', icon: Droplets, color: 'text-cyan-400' },
  { id: 'pollution-trend', label: 'Pollution Trend Analysis', desc: '30-day pollutant tracking', icon: BarChart3, color: 'text-orange-400' },
  { id: 'emergency', label: 'Emergency Incident Report', desc: 'Incident documentation', icon: AlertTriangle, color: 'text-red-400' },
  { id: 'ai-prediction', label: 'AI Prediction Report', desc: 'ML-based risk forecasting', icon: Brain, color: 'text-purple-400' },
  { id: 'compliance', label: 'Government Compliance Report', desc: 'Regulatory format', icon: FileText, color: 'text-emerald-400' },
  { id: 'custom', label: 'Custom Report', desc: 'User-defined parameters', icon: Settings, color: 'text-blue-400' },
];

const templateNames: Record<ReportTemplateId, string> = {
  'daily-water': 'Daily Water Quality', 'pollution-trend': 'Pollution Trend Analysis',
  'emergency': 'Emergency Incident', 'ai-prediction': 'AI Prediction',
  'compliance': 'Government Compliance', 'custom': 'Custom Report',
};

const genReports: GeneratedReport[] = [
  { id: 'RPT-001', name: 'Nal Sarovar Daily Water Quality — 30 Jun 2026', type: 'daily-water', generatedBy: 'System Auto', date: new Date(Date.now() - 1000 * 60 * 15), status: 'ready', size: '2.4 MB', district: 'Ahmedabad', wetland: 'Nal Sarovar' },
  { id: 'RPT-002', name: 'Weekly Pollution Trend — Nal Sarovar', type: 'pollution-trend', generatedBy: 'Dr. Priya Sharma', date: new Date(Date.now() - 1000 * 60 * 60 * 3), status: 'ready', size: '5.1 MB', district: 'Ahmedabad', wetland: 'Nal Sarovar' },
  { id: 'RPT-003', name: 'Monthly Wetland Health Report — June 2026', type: 'compliance', generatedBy: 'System Auto', date: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'ready', size: '12.8 MB', district: 'Ahmedabad', wetland: 'Nal Sarovar' },
  { id: 'RPT-004', name: 'AI Prediction — Flood Risk Assessment', type: 'ai-prediction', generatedBy: 'AI Engine', date: new Date(Date.now() - 1000 * 60 * 60 * 2), status: 'ready', size: '3.2 MB', district: 'Ahmedabad', wetland: 'Nal Sarovar' },
  { id: 'RPT-005', name: 'Q2 Compliance Report — Gujarat Wetlands', type: 'compliance', generatedBy: 'Rajesh Verma', date: new Date(Date.now() - 1000 * 60 * 60 * 48), status: 'ready', size: '20.5 MB', district: 'Ahmedabad', wetland: 'Nal Sarovar' },
  { id: 'RPT-006', name: 'Emergency Incident — pH Spike NS-04', type: 'emergency', generatedBy: 'Anita Desai', date: new Date(Date.now() - 1000 * 60 * 30), status: 'ready', size: '1.8 MB', district: 'Ahmedabad', wetland: 'Nal Sarovar' },
  { id: 'RPT-007', name: 'AI Early Warning — DO Critical Trend', type: 'ai-prediction', generatedBy: 'AI Engine', date: new Date(Date.now() - 1000 * 60 * 10), status: 'generating', size: '—', district: 'Ahmedabad', wetland: 'Nal Sarovar' },
];

const scheduled: ScheduledReport[] = [
  { id: 'SCH-001', name: 'Daily Water Quality Summary', frequency: 'daily', format: 'pdf', nextRun: new Date(Date.now() + 1000 * 60 * 60 * 10), recipients: 12, active: true },
  { id: 'SCH-002', name: 'Weekly Pollution Trend Report', frequency: 'weekly', format: 'excel', nextRun: new Date(Date.now() + 1000 * 60 * 60 * 48), recipients: 8, active: true },
  { id: 'SCH-003', name: 'Monthly Compliance Report', frequency: 'monthly', format: 'pdf', nextRun: new Date(Date.now() + 1000 * 60 * 60 * 72), recipients: 15, active: false },
];

const activities: ActivityItem[] = [
  { id: 'A-001', message: 'Daily Water Quality Report generated by System Auto', timestamp: new Date(Date.now() - 1000 * 60 * 15), type: 'success' },
  { id: 'A-002', message: 'AI Prediction Report completed — Flood Risk Assessment', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), type: 'success' },
  { id: 'A-003', message: 'Emergency Incident Report generated — pH Spike NS-04', timestamp: new Date(Date.now() - 1000 * 60 * 30), type: 'warning' },
  { id: 'A-004', message: 'Scheduled report "Daily Summary" delivered to 12 recipients', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), type: 'info' },
  { id: 'A-005', message: 'New AI Early Warning report generated — DO Critical Trend', timestamp: new Date(Date.now() - 1000 * 60 * 10), type: 'info' },
  { id: 'A-006', message: 'Weekly Pollution Trend downloaded by Dr. Priya Sharma', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), type: 'info' },
];

// ===================== PLACEHOLDER HANDLERS =====================

const api = {
  generateReport: () => alert('Backend: Report generation queued'),
  previewReport: (id: string) => alert(`Backend: Preview report ${id}`),
  downloadReport: (id: string) => alert(`Backend: Download report ${id}`),
  shareReport: (id: string) => alert(`Backend: Share report ${id}`),
  deleteReport: (id: string) => alert(`Backend: Delete report ${id}`),
  toggleSchedule: (id: string) => alert(`Backend: Toggle schedule ${id}`),
  configureSchedule: (id: string) => alert(`Backend: Configure schedule ${id}`),
  exportReport: (id: string, format: string) => alert(`Backend: Export ${id} as ${format}`),
};

// ===================== COMPONENTS =====================

function StatCard({ icon: Icon, label, value, color }: { icon: typeof FileText; label: string; value: string; color: string }) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg bg-white/[0.04]`}>
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

const statusBadge: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  ready: { label: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  generating: { label: 'Generating', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/10' },
};

const freqLabel: Record<ScheduleFreq, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

// ===================== MAIN PAGE =====================

export function ReportsPage() {
  // Filters
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterWetland, setFilterWetland] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Form
  const [formDistrict, setFormDistrict] = useState('');
  const [formTaluka, setFormTaluka] = useState('');
  const [formWetland, setFormWetland] = useState('');
  const [formType, setFormType] = useState<ReportTemplateId>('daily-water');
  const [formFormat, setFormFormat] = useState<ExportFormat>('pdf');
  const [formLanguage, setFormLanguage] = useState<Language>('english');
  const [formDateFrom, setFormDateFrom] = useState('');
  const [formDateTo, setFormDateTo] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSensors, setIncludeSensors] = useState(true);
  const [includeAI, setIncludeAI] = useState(false);
  const [includeCitizens, setIncludeCitizens] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplateId | null>(null);
  const [reports] = useState<GeneratedReport[]>(genReports);

  const formTalukas = formDistrict ? talukas[formDistrict] || [] : [];

  const filteredReports = reports.filter(r => {
    if (filterDistrict && r.district !== filterDistrict) return false;
    if (filterWetland && r.wetland !== filterWetland) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterType && r.type !== filterType) return false;
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">

      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-500/10 rounded-xl">
          <FileText size={22} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Environmental Reporting Center</h1>
          <p className="text-sm text-gray-400">Generate, schedule, and manage environmental monitoring reports</p>
        </div>
      </div>

      {/* ===== TOP STATISTICS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={FileText} label="Total Reports" value="156" color="text-blue-400" />
        <StatCard icon={Calendar} label="Generated Today" value="12" color="text-emerald-400" />
        <StatCard icon={Clock} label="Scheduled Reports" value="8" color="text-amber-400" />
        <StatCard icon={Brain} label="AI Reports" value="34" color="text-purple-400" />
        <StatCard icon={Download} label="Downloads" value="89" color="text-cyan-400" />
      </div>

      {/* ===== SEARCH & FILTER ===== */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search reports by name..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all"
          >
            <Filter size={13} />
            Filters
            <ChevronDown size={11} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-white/[0.06]">
            <SelectField label="District" value={filterDistrict} onChange={setFilterDistrict} options={districts} placeholder="All Districts" />
            <SelectField label="Wetland" value={filterWetland} onChange={setFilterWetland} options={wetlands} placeholder="All Wetlands" />
            <SelectField label="Status" value={filterStatus} onChange={setFilterStatus} options={['ready', 'generating', 'failed']} placeholder="All Status" />
            <SelectField label="Report Type" value={filterType} onChange={setFilterType} options={reportTemplates.map(t => t.id)} placeholder="All Types" />
          </div>
        )}
      </div>

      {/* ===== MAIN GRID: TEMPLATES + FORM ===== */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* REPORT TEMPLATES */}
        <div className="lg:col-span-3 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={14} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white">Report Templates</h2>
            <span className="ml-auto text-[10px] text-gray-600">{reportTemplates.length} templates available</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {reportTemplates.map(t => {
              const Icon = t.icon;
              const sel = selectedTemplate === t.id;
              return (
                <button key={t.id} onClick={() => { setSelectedTemplate(t.id); setFormType(t.id); }}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    sel ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'
                  }`}
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

        {/* REPORT GENERATOR FORM */}
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
            <div className="grid grid-cols-3 gap-2">
              <SelectField label="Format" value={formFormat} onChange={v => setFormFormat(v as ExportFormat)} options={['pdf', 'excel', 'csv']} />
              <div className="col-span-2">
                <SelectField label="Language" value={formLanguage} onChange={v => setFormLanguage(v as Language)} options={['english', 'gujarati']} />
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
              <Checkbox label="Include Charts" checked={includeCharts} onChange={setIncludeCharts} />
              <Checkbox label="Include Sensor Readings" checked={includeSensors} onChange={setIncludeSensors} />
              <Checkbox label="Include AI Analysis" checked={includeAI} onChange={setIncludeAI} />
              <Checkbox label="Include Citizen Alert Summary" checked={includeCitizens} onChange={setIncludeCitizens} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => api.previewReport('draft')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <Eye size={13} />
                Preview
              </button>
              <button onClick={() => api.generateReport()}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Upload size={13} />
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== AI EXECUTIVE SUMMARY ===== */}
      <div className="bg-gradient-to-r from-purple-500/[0.06] via-transparent to-blue-500/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={15} className="text-purple-400" />
          <h2 className="text-sm font-bold text-white">AI Executive Summary</h2>
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] text-purple-400 font-medium">AI Engine v2.1</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
          <div className="bg-white/[0.04] rounded-lg border border-white/[0.06] p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Wetland Health</div>
            <div className="text-lg font-bold text-emerald-400">87%</div>
            <div className="text-[9px] text-emerald-400/70">Stable</div>
          </div>
          <div className="bg-white/[0.04] rounded-lg border border-white/[0.06] p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Pollution Status</div>
            <div className="text-lg font-bold text-amber-400">Low</div>
            <div className="text-[9px] text-amber-400/70">Monitoring</div>
          </div>
          <div className="bg-white/[0.04] rounded-lg border border-white/[0.06] p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Risk Level</div>
            <div className="text-lg font-bold text-emerald-400">Moderate</div>
            <div className="text-[9px] text-emerald-400/70">Watchlist</div>
          </div>
          <div className="bg-white/[0.04] rounded-lg border border-white/[0.06] p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Data Confidence</div>
            <div className="text-lg font-bold text-blue-400">96%</div>
            <div className="text-[9px] text-blue-400/70">High</div>
          </div>
          <div className="bg-white/[0.04] rounded-lg border border-white/[0.06] p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Reports This Week</div>
            <div className="text-lg font-bold text-purple-400">18</div>
            <div className="text-[9px] text-purple-400/70">+3 vs last week</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-white/[0.04] rounded-lg border border-white/[0.06] p-3">
            <div className="flex items-center gap-1.5 mb-1.5"><AlertTriangle size={12} className="text-amber-400" /><span className="text-[10px] font-semibold text-amber-400">Key Findings</span></div>
            <ul className="text-[10px] text-gray-400 space-y-1">
              <li className="flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />TDS levels rising 8% over 48 hours — potential runoff</li>
              <li className="flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />pH stable at NS-01, NS-03, NS-05 stations</li>
              <li className="flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0" />DO critical at NS-04 — aeration recommended</li>
            </ul>
          </div>
          <div className="bg-white/[0.04] rounded-lg border border-white/[0.06] p-3">
            <div className="flex items-center gap-1.5 mb-1.5"><CheckCircle size={12} className="text-emerald-400" /><span className="text-[10px] font-semibold text-emerald-400">Recommendations</span></div>
            <ul className="text-[10px] text-gray-400 space-y-1">
              <li className="flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />Increase monitoring frequency at NS-04</li>
              <li className="flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />Schedule industrial audit for upstream discharge</li>
              <li className="flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />Deploy emergency aeration at East Shore</li>
            </ul>
          </div>
          <div className="bg-white/[0.04] rounded-lg border border-white/[0.06] p-3">
            <div className="flex items-center gap-1.5 mb-1.5"><BarChart3 size={12} className="text-blue-400" /><span className="text-[10px] font-semibold text-blue-400">Forecast</span></div>
            <ul className="text-[10px] text-gray-400 space-y-1">
              <li className="flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />Water temperature expected to rise 2°C next week</li>
              <li className="flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />Monsoon alert: 60% chance of heavy rainfall</li>
              <li className="flex items-start gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />TDS trend suggests stabilization by Day 5</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===== GENERATED REPORTS TABLE ===== */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Generated Reports</h2>
            <span className="text-[10px] text-gray-600">({filteredReports.length} reports)</span>
          </div>
          <button onClick={() => api.generateReport()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
          >
            <Plus size={12} />
            New Report
          </button>
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
              {filteredReports.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-gray-600">No reports found matching your filters</td></tr>
              ) : (
                filteredReports.map(r => {
                  const sb = statusBadge[r.status];
                  const template = reportTemplates.find(t => t.id === r.type);
                  const Icon = template?.icon || FileText;
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-white/[0.04]">
                            <Icon size={12} className="text-gray-400" />
                          </div>
                          <span className="text-xs font-medium text-white">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{template?.label || r.type}</td>
                      <td className="px-4 py-3 text-gray-400">{r.generatedBy}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sb.bg} ${sb.color}`}>{sb.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{r.size}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => api.previewReport(r.id)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-emerald-400 transition-all" title="Preview">
                            <Eye size={13} />
                          </button>
                          <button onClick={() => api.downloadReport(r.id)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-blue-400 transition-all" title="Download">
                            <Download size={13} />
                          </button>
                          <button onClick={() => api.shareReport(r.id)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-purple-400 transition-all" title="Share">
                            <Share2 size={13} />
                          </button>
                          <button onClick={() => api.deleteReport(r.id)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-red-400 transition-all" title="Delete">
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

      {/* ===== BOTTOM: SCHEDULED + ACTIVITY ===== */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* SCHEDULED REPORTS */}
        <div className="lg:col-span-3 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white">Scheduled Reports</h2>
            <span className="ml-auto text-[10px] text-gray-600">{scheduled.filter(s => s.active).length} active</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {scheduled.map(s => (
              <div key={s.id} className={`bg-white/[0.04] rounded-xl border p-3.5 ${s.active ? 'border-white/[0.06]' : 'border-white/[0.04] opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white">{s.name}</span>
                  <button
                    onClick={() => api.toggleSchedule(s.id)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${s.active ? 'bg-emerald-500' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${s.active ? 'left-4' : 'left-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span className={`px-1.5 py-0.5 rounded ${s.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-gray-500'}`}>
                    {freqLabel[s.frequency]}
                  </span>
                  <span className="uppercase">{s.format}</span>
                  <span>{s.recipients} recipients</span>
                </div>
                <div className="text-[9px] text-gray-600 mt-1.5">
                  Next: {s.nextRun.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <button onClick={() => api.configureSchedule(s.id)}
                  className="w-full mt-2 py-1.5 rounded-lg text-[10px] text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                >
                  Configure
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4 max-h-[320px] flex flex-col">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <RefreshCw size={14} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white">Recent Activity</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {activities.map(a => {
              const dotColor = a.type === 'success' ? 'bg-emerald-500' : a.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500';
              return (
                <div key={a.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                  <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-300 leading-tight">{a.message}</p>
                    <p className="text-[8px] text-gray-600 mt-0.5">
                      {a.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
