import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Download, Printer, Share2, Mail, FileText, AlertTriangle,
  Activity, Droplets, Thermometer, Gauge, Radio, Battery, Wifi,
  Clock, Brain, Shield, TrendingUp, CheckCircle, RefreshCw, Link, X,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { toast } from 'sonner';
import { reportApi } from '@/services/reportApi';
import type { Report, ReportChartData } from '@/types/report';

const COLORS = {
  temperature: '#f59e0b', ph: '#8b5cf6', tds: '#3b82f6',
  dissolvedOxygen: '#10b981', waterLevel: '#ec4899',
};

const severityColors: Record<string, string> = {
  CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />;
}

const CARD = 'bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-5';
const LABEL = 'text-[10px] font-medium text-gray-500 uppercase tracking-wider';

export function ReportPreviewPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const fetchReport = useCallback(async () => {
    if (!reportId) return;
    try {
      const res = await reportApi.getById(reportId);
      setReport(res.data.report);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExportPdf = async () => {
    if (!report) return;
    setExportingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 15;

      // Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text('AvianGuard Wetland Monitoring', pageWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text('Environmental Monitoring Report', pageWidth / 2, 22, { align: 'center' });
      pdf.setFontSize(8);
      pdf.text(`Generated: ${formatDate(report.createdAt)} | By: ${report.generatedBy}`, pageWidth / 2, 30, { align: 'center' });
      y = 50;

      // Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.text(report.title, 15, y);
      y += 10;

      // Report Info
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      if (report.district) { pdf.text(`District: ${report.district}`, 15, y); y += 5; }
      if (report.wetland) { pdf.text(`Wetland: ${report.wetland}`, 15, y); y += 5; }
      if (report.taluka) { pdf.text(`Taluka: ${report.taluka}`, 15, y); y += 5; }
      y += 5;

      // Executive Summary
      if (report.summary) {
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Executive Summary', 15, y);
        y += 7;
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        const s = report.summary;
        const summaryLines = [
          `Overall Health: ${s.overallHealth}%`,
          `Total Sensors: ${s.totalSensors} | Online: ${s.onlineSensors}`,
          `Total Alerts: ${s.totalAlerts} | Critical: ${s.criticalAlerts} | High: ${s.highAlerts}`,
          `Avg Temperature: ${s.avgTemperature ?? 'N/A'}°C | Avg pH: ${s.avgPh ?? 'N/A'} | Avg TDS: ${s.avgTds ?? 'N/A'} ppm`,
        ];
        summaryLines.forEach(line => { pdf.text(line, 15, y); y += 5; });
        y += 5;
      }

      // Sensor Table
      if (report.data?.sensors && report.data.sensors.length > 0) {
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Sensor Statistics', 15, y);
        y += 3;

        const sensorData = report.data.sensors.map(s => [
          s.name, s.wetland || '—', s.status,
          s.temperature != null ? `${s.temperature}°C` : '—',
          s.ph ?? '—', s.tds != null ? `${s.tds}` : '—',
          s.dissolvedOxygen != null ? `${s.dissolvedOxygen}` : '—',
          s.battery != null ? `${s.battery}%` : '—',
        ]);

        (pdf as any).autoTable({
          startY: y,
          head: [['Sensor', 'Wetland', 'Status', 'Temp', 'pH', 'TDS', 'DO', 'Battery']],
          body: sensorData,
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [16, 185, 129] },
          margin: { left: 15, right: 15 },
        });
        y = (pdf as any).lastAutoTable.finalY + 10;
      }

      // Alert Table
      if (report.data?.alerts && report.data.alerts.length > 0) {
        if (y > 240) { pdf.addPage(); y = 15; }
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Alert Statistics', 15, y);
        y += 3;

        const alertData = report.data.alerts.slice(0, 30).map(a => [
          a.alertType, a.severity, a.status,
          a.currentValue != null ? String(a.currentValue) : '—',
          a.safeRange || '—',
          new Date(a.createdAt).toLocaleDateString(),
        ]);

        (pdf as any).autoTable({
          startY: y,
          head: [['Type', 'Severity', 'Status', 'Value', 'Safe Range', 'Date']],
          body: alertData,
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [239, 68, 68] },
          margin: { left: 15, right: 15 },
        });
        y = (pdf as any).lastAutoTable.finalY + 10;
      }

      // AI Analysis
      if (report.aiAnalysis && report.includeAI) {
        if (y > 220) { pdf.addPage(); y = 15; }
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('AI Analysis', 15, y);
        y += 7;
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        const ai = report.aiAnalysis;
        pdf.text(`Risk Level: ${ai.riskLevel} | Health Score: ${ai.healthScore}% | Confidence: ${ai.confidence}%`, 15, y); y += 5;
        pdf.text(`Root Cause: ${ai.rootCause}`, 15, y, { maxWidth: pageWidth - 30 }); y += 10;
        pdf.text(`Environmental Impact: ${ai.environmentalImpact}`, 15, y, { maxWidth: pageWidth - 30 }); y += 10;
        if (ai.recommendations) {
          pdf.text('Recommendations:', 15, y); y += 5;
          ai.recommendations.forEach(rec => {
            pdf.text(`  • ${rec}`, 15, y, { maxWidth: pageWidth - 30 }); y += 5;
          });
        }
      }

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`AvianGuard Wetland Monitoring | Report ID: ${report.id} | Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
      }

      pdf.save(`${report.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
      toast.success('PDF exported successfully');
    } catch (err: unknown) {
      console.error('PDF export error:', err);
      toast.error('Failed to export PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  const handlePrint = () => { window.print(); };

  const handleShare = async () => {
    if (!report) return;
    try {
      const res = await reportApi.share(report.id);
      const link = `${window.location.origin}/reports/shared/${res.data.shareToken}`;
      setShareLink(link);
      setShareDialog(true);
    } catch (err: unknown) {
      toast.error('Failed to generate share link');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied');
  };

  const handleDownloadCsv = async () => {
    if (!report) return;
    try {
      const res = await reportApi.getCsvData(report.id);
      const rows = res.data;
      if (!rows.length) { toast.error('No data to export'); return; }
      const headers = ['Sensor ID', 'Sensor Name', 'Wetland', 'Temperature', 'pH', 'TDS', 'DO', 'Water Level', 'Battery', 'Signal', 'Timestamp'];
      const csv = [headers.join(',')];
      rows.forEach(r => csv.push([r.sensorId, r.sensorName, r.wetland, r.temperature, r.ph, r.tds, r.dissolvedOxygen, r.waterLevel, r.battery ?? '', r.signalStrength ?? '', r.timestamp].join(',')));
      const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}.csv`; a.click(); URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch { toast.error('Failed to export CSV'); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-2 gap-4"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-red-400 mb-4" />
        <p className="text-sm text-gray-400 mb-2">{error || 'Report not found'}</p>
        <button onClick={() => navigate('/dashboard/reports')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-xs font-semibold text-white">Back to Reports</button>
      </div>
    );
  }

  const data = report.data;
  const summary = report.summary;
  const ai = report.aiAnalysis;
  const chartData = data?.chartData || [];
  const sensorHealth = data?.sensorHealth;
  const severityCounts = data?.severityCounts;

  return (
    <div className="space-y-6 print:space-y-0 print:bg-white print:p-0">
      {/* TOOLBAR - hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => navigate('/dashboard/reports')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-all">
          <ArrowLeft size={14} /> Back to Reports
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleExportPdf} disabled={exportingPdf} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-50">
            {exportingPdf ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />} Export PDF
          </button>
          <button onClick={handleDownloadCsv} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:text-white transition-all">
            <Download size={13} /> CSV
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:text-white transition-all">
            <Printer size={13} /> Print
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:text-white transition-all">
            <Share2 size={13} /> Share
          </button>
        </div>
      </div>

      {/* PRINTABLE CONTENT */}
      <div ref={printRef} className="space-y-6 print:space-y-4">
        {/* COVER PAGE */}
        <div className={`${CARD} text-center print:border-0 print:shadow-none`}>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-500/10 rounded-2xl">
              <FileText size={36} className="text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white print:text-black mb-2">{report.title}</h1>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 print:text-gray-600 mt-3">
            <span>Generated: {formatDate(report.createdAt)}</span>
            <span>By: {report.generatedBy}</span>
          </div>
          {(report.district || report.wetland) && (
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-2">
              {report.district && <span>District: {report.district}</span>}
              {report.taluka && <span>Taluka: {report.taluka}</span>}
              {report.wetland && <span>Wetland: {report.wetland}</span>}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
              report.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400' :
              report.status === 'generating' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
            }`}>{report.status}</span>
            {report.fileSize && <span className="text-[10px] text-gray-500">{report.fileSize}</span>}
          </div>
        </div>

        {/* EXECUTIVE SUMMARY */}
        {summary && (
          <div className={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={14} className="text-blue-400" />
              <h2 className="text-sm font-bold text-white print:text-black">Executive Summary</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Overall Health', value: `${summary.overallHealth}%`, color: summary.overallHealth >= 80 ? 'text-emerald-400' : summary.overallHealth >= 50 ? 'text-amber-400' : 'text-red-400' },
                { label: 'Total Sensors', value: summary.totalSensors, color: 'text-blue-400' },
                { label: 'Online Sensors', value: summary.onlineSensors, color: 'text-emerald-400' },
                { label: 'Total Alerts', value: summary.totalAlerts, color: 'text-orange-400' },
                { label: 'Critical Alerts', value: summary.criticalAlerts, color: 'text-red-400' },
                { label: 'High Alerts', value: summary.highAlerts, color: 'text-orange-400' },
                { label: 'Avg Temperature', value: summary.avgTemperature != null ? `${summary.avgTemperature}°C` : 'N/A', color: 'text-white' },
                { label: 'Avg pH', value: summary.avgPh ?? 'N/A', color: 'text-white' },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.06] print:bg-gray-50 print:border-gray-200">
                  <div className="text-[10px] text-gray-500 print:text-gray-600">{s.label}</div>
                  <div className={`text-lg font-bold mt-1 ${s.color} print:text-black`}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SENSOR STATISTICS */}
        {data && data.sensors.length > 0 && report.includeSensors && (
          <div className={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-white print:text-black">Sensor Statistics</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs print:text-black">
                <thead>
                  <tr className="border-b border-white/[0.06] print:border-gray-300">
                    <th className="text-left px-3 py-2 text-[10px] text-gray-500 print:text-gray-600">Sensor</th>
                    <th className="text-left px-3 py-2 text-[10px] text-gray-500 print:text-gray-600">Wetland</th>
                    <th className="text-left px-3 py-2 text-[10px] text-gray-500 print:text-gray-600">Status</th>
                    <th className="text-right px-3 py-2 text-[10px] text-gray-500 print:text-gray-600">Temp</th>
                    <th className="text-right px-3 py-2 text-[10px] text-gray-500 print:text-gray-600">pH</th>
                    <th className="text-right px-3 py-2 text-[10px] text-gray-500 print:text-gray-600">TDS</th>
                    <th className="text-right px-3 py-2 text-[10px] text-gray-500 print:text-gray-600">DO</th>
                    <th className="text-right px-3 py-2 text-[10px] text-gray-500 print:text-gray-600">Battery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] print:divide-gray-200">
                  {data.sensors.map(s => (
                    <tr key={s.id} className="hover:bg-white/[0.02] print:hover:bg-transparent">
                      <td className="px-3 py-2 font-medium text-white print:text-black">{s.name}</td>
                      <td className="px-3 py-2 text-gray-400 print:text-gray-600">{s.wetland || '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          s.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' :
                          s.status === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                        }`}>{s.status}</span>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-300 print:text-gray-700">{s.temperature != null ? `${s.temperature}°C` : '—'}</td>
                      <td className="px-3 py-2 text-right text-gray-300 print:text-gray-700">{s.ph ?? '—'}</td>
                      <td className="px-3 py-2 text-right text-gray-300 print:text-gray-700">{s.tds != null ? `${s.tds} ppm` : '—'}</td>
                      <td className="px-3 py-2 text-right text-gray-300 print:text-gray-700">{s.dissolvedOxygen != null ? `${s.dissolvedOxygen} mg/L` : '—'}</td>
                      <td className="px-3 py-2 text-right text-gray-300 print:text-gray-700">{s.battery != null ? `${s.battery}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALERT STATISTICS */}
        {data && data.alerts.length > 0 && (
          <div className={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-red-400" />
              <h2 className="text-sm font-bold text-white print:text-black">Alert Statistics</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className={`text-xs font-semibold mb-2 ${LABEL}`}>Alerts by Severity</h3>
                {severityCounts && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={Object.entries(severityCounts).map(([k, v]) => ({ name: k, value: v })).filter(d => d.value > 0)}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {Object.entries(severityCounts).map(([key]) => (
                          <Cell key={key} fill={severityColors[key] || '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div>
                <h3 className={`text-xs font-semibold mb-2 ${LABEL}`}>Alerts by Type</h3>
                {data.alertGroupByType && (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={Object.entries(data.alertGroupByType).map(([k, v]) => ({ type: k, count: v }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI ANALYSIS */}
        {ai && report.includeAI && (
          <div className={`${CARD} bg-gradient-to-r from-purple-500/[0.06] via-transparent to-blue-500/[0.04]`}>
            <div className="flex items-center gap-2 mb-4">
              <Brain size={14} className="text-purple-400" />
              <h2 className="text-sm font-bold text-white print:text-black">AI Analysis</h2>
              <span className="text-[10px] text-purple-400 ml-auto">Confidence: {ai.confidence}%</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.06] print:bg-gray-50 print:border-gray-200">
                <span className={LABEL}>Risk Assessment</span>
                <p className={`text-xs mt-1 font-semibold ${
                  ai.riskLevel === 'Critical' ? 'text-red-400' : ai.riskLevel === 'High' ? 'text-orange-400' : ai.riskLevel === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                } print:text-black`}>{ai.riskLevel}</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.06] print:bg-gray-50 print:border-gray-200">
                <span className={LABEL}>Health Score</span>
                <p className="text-xs mt-1 font-semibold text-emerald-400 print:text-black">{ai.healthScore}%</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.06] sm:col-span-2 print:bg-gray-50 print:border-gray-200">
                <span className={LABEL}>Root Cause Analysis</span>
                <p className="text-xs text-gray-300 mt-1 print:text-gray-700">{ai.rootCause}</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.06] print:bg-gray-50 print:border-gray-200">
                <span className={LABEL}>Environmental Impact</span>
                <p className="text-xs text-gray-300 mt-1 print:text-gray-700">{ai.environmentalImpact}</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.06] print:bg-gray-50 print:border-gray-200">
                <span className={LABEL}>Trend Analysis</span>
                <p className="text-xs text-gray-300 mt-1 print:text-gray-700">{ai.trendAnalysis}</p>
              </div>
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {ai?.recommendations && (
          <div className={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <Shield size={14} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-white print:text-black">Recommendations</h2>
            </div>
            <div className="space-y-2">
              {ai.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <CheckCircle size={12} className="text-emerald-400 mt-0.5 shrink-0 print:text-emerald-600" />
                  <span className="text-xs text-gray-300 print:text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHARTS */}
        {chartData.length > 0 && report.includeCharts && (
          <div className={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-blue-400" />
              <h2 className="text-sm font-bold text-white print:text-black">Trend Charts</h2>
            </div>
            <div className="space-y-6">
              {/* Temperature Trend */}
              <div>
                <h3 className={`text-xs font-semibold mb-2 ${LABEL}`}>Temperature Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="temperature" stroke={COLORS.temperature} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* pH Trend */}
              <div>
                <h3 className={`text-xs font-semibold mb-2 ${LABEL}`}>pH Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="ph" stroke={COLORS.ph} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* TDS Trend */}
              <div>
                <h3 className={`text-xs font-semibold mb-2 ${LABEL}`}>TDS Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="tds" stroke={COLORS.tds} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Water Level Trend */}
              <div>
                <h3 className={`text-xs font-semibold mb-2 ${LABEL}`}>Water Level Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="waterLevel" stroke={COLORS.waterLevel} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* SENSOR HEALTH */}
        {sensorHealth && (
          <div className={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-cyan-400" />
              <h2 className="text-sm font-bold text-white print:text-black">Sensor Health Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[
                  { name: 'Online', value: sensorHealth.online },
                  { name: 'Warning', value: sensorHealth.warning },
                  { name: 'Offline', value: sensorHealth.offline },
                  { name: 'Maintenance', value: sensorHealth.maintenance },
                ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#6b7280" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* CITIZEN NOTIFICATIONS */}
        {report.includeCitizens && summary && (
          <div className={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <Mail size={14} className="text-cyan-400" />
              <h2 className="text-sm font-bold text-white print:text-black">Citizen Notification Summary</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.06] print:bg-gray-50 print:border-gray-200">
                <span className={LABEL}>Notifications Sent</span>
                <p className="text-lg font-bold text-white print:text-black mt-1">{summary.citizenNotificationsSent}</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.06] print:bg-gray-50 print:border-gray-200">
                <span className={LABEL}>Alerts Triggered</span>
                <p className="text-lg font-bold text-white print:text-black mt-1">{summary.totalAlerts}</p>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className={`${CARD} text-center print:border-0 print:shadow-none`}>
          <div className="text-[10px] text-gray-500 print:text-gray-600">
            <p>AvianGuard Wetland Monitoring System — Environmental Report</p>
            <p className="mt-1">Generated on {formatDate(report.createdAt)} | Report ID: {report.id}</p>
            <p className="mt-1">This report is auto-generated from real-time sensor data and AI analysis.</p>
          </div>
        </div>
      </div>

      {/* SHARE DIALOG */}
      {shareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center print:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShareDialog(false)} />
          <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Share Report</h3>
              <button onClick={() => setShareDialog(false)} className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex items-center gap-2">
              <input readOnly value={shareLink} className="flex-1 px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-gray-300 font-mono" />
              <button onClick={handleCopyLink} className="px-3 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600"><Link size={13} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
