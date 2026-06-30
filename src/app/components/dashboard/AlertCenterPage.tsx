import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { AlertTriangle, Send, X, CheckCircle, MessageSquare, Smartphone, Mail, Zap, Shield, Droplets, Flame, Bird, CloudRain, Trash2, Clock, Users, MapPin, Brain, Eye, Bell } from 'lucide-react';

interface AlertRecord {
  id: string;
  title: string;
  description: string;
  recommendedAction: string;
  alertType: string;
  severity: string;
  targetArea: string;
  district: string;
  taluka: string;
  targetVillage: string;
  sensorName: string;
  sendTo: string;
  recipients: number;
  timestamp: string;
  sender: string;
  status: 'sent' | 'simulated';
}

interface QuickEmergency {
  id: string;
  label: string;
  icon: typeof Zap;
  color: string;
  gradient: string;
  alertType: string;
  generateTitle: () => string;
  generateDesc: () => string;
  generateAction: () => string;
}

interface PrefillAlert {
  alertType: string;
  title: string;
  description: string;
  severity: string;
  targetArea: string;
  district: string;
  taluka: string;
  village: string;
  sensorName: string;
  recommendedAction: string;
}

const quickEmergencies: QuickEmergency[] = [
  {
    id: 'flood', label: 'Flood Alert', icon: Droplets, color: '#3b82f6', gradient: 'from-blue-600 to-blue-700',
    alertType: 'Flood',
    generateTitle: () => 'Flood Warning',
    generateDesc: () => 'Heavy rainfall may cause flooding near the wetland. Avoid entering low-lying areas. Seek higher ground immediately.',
    generateAction: () => 'Move to safe locations. Follow local authority instructions. Avoid waterlogged areas.',
  },
  {
    id: 'pollution', label: 'Water Pollution', icon: AlertTriangle, color: '#8b5cf6', gradient: 'from-violet-600 to-violet-700',
    alertType: 'Water Pollution',
    generateTitle: () => 'Water Pollution Alert',
    generateDesc: () => 'Hazardous substances detected in the wetland water. Do not use water for drinking, cooking, or bathing. Keep livestock away.',
    generateAction: () => 'Avoid contact with wetland water. Report any health issues to the nearest health centre. Use alternative water sources.',
  },
  {
    id: 'fire', label: 'Fire Alert', icon: Flame, color: '#ef4444', gradient: 'from-red-600 to-red-700',
    alertType: 'Fire',
    generateTitle: () => 'Fire Emergency',
    generateDesc: () => 'Fire detected near the wetland area. Evacuate immediately. Fire may spread rapidly due to dry vegetation.',
    generateAction: () => 'Evacuate the area immediately. Call fire services. Do not attempt to extinguish large fires alone.',
  },
  {
    id: 'wildlife', label: 'Wildlife Emergency', icon: Bird, color: '#f59e0b', gradient: 'from-amber-600 to-amber-700',
    alertType: 'Wildlife',
    generateTitle: () => 'Wildlife Emergency',
    generateDesc: () => 'Unusual wildlife movement detected near human settlements. Maintain distance and do not approach wild animals.',
    generateAction: () => 'Keep safe distance. Do not feed or approach wildlife. Contact forest department immediately.',
  },
  {
    id: 'rain', label: 'Heavy Rain Warning', icon: CloudRain, color: '#06b6d4', gradient: 'from-cyan-600 to-cyan-700',
    alertType: 'Weather',
    generateTitle: () => 'Heavy Rain Warning',
    generateDesc: () => 'Heavy rainfall expected in the region. Risk of flash floods and waterlogging. Take necessary precautions.',
    generateAction: () => 'Stay indoors. Avoid travel unless necessary. Keep emergency kit ready. Monitor weather updates.',
  },
  {
    id: 'dumping', label: 'Illegal Dumping', icon: Trash2, color: '#84cc16', gradient: 'from-lime-600 to-lime-700',
    alertType: 'Illegal Dumping',
    generateTitle: () => 'Illegal Dumping Reported',
    generateDesc: () => 'Illegal dumping activity reported near the wetland. Hazardous waste may affect water quality and local wildlife.',
    generateAction: () => 'Report any suspicious activity to local authorities. Do not approach dump sites. Avoid contaminated areas.',
  },
];

const templates = [
  { id: 'flood-warning', label: 'Flood Warning', alertType: 'Flood', title: 'Flood Warning', description: 'Heavy rainfall may cause flooding near the wetland. Avoid entering low-lying areas.', action: 'Move to safe locations and follow local authority instructions.' },
  { id: 'water-pollution', label: 'Water Pollution', alertType: 'Water Pollution', title: 'Water Pollution Alert', description: 'Hazardous substances detected in the wetland water. Do not use for drinking or bathing.', action: 'Avoid contact with contaminated water. Report health issues immediately.' },
  { id: 'fire-alert', label: 'Fire Alert', alertType: 'Fire', title: 'Fire Emergency', description: 'Fire detected near the wetland. Evacuate immediately. Fire may spread rapidly.', action: 'Evacuate area. Call fire services. Do not attempt to extinguish large fires alone.' },
  { id: 'wildlife-movement', label: 'Wildlife Movement', alertType: 'Wildlife', title: 'Wildlife Movement Advisory', description: 'Unusual wildlife movement detected near human settlements. Maintain distance.', action: 'Keep safe distance. Contact forest department. Do not feed wild animals.' },
  { id: 'illegal-dumping', label: 'Illegal Dumping', alertType: 'Illegal Dumping', title: 'Illegal Dumping Alert', description: 'Illegal dumping reported near the wetland. Hazardous waste may affect water quality.', action: 'Report suspicious activity to authorities. Avoid contaminated areas.' },
  { id: 'bird-disease', label: 'Bird Disease', alertType: 'Bird Disease', title: 'Bird Disease Outbreak Alert', description: 'Disease detected in local bird population. Avoid contact with sick or dead birds.', action: 'Report sick/dead birds to forest department. Do not handle birds without protection.' },
  { id: 'chemical-leak', label: 'Toxic Chemical Leak', alertType: 'Water Pollution', title: 'Toxic Chemical Leak Warning', description: 'Toxic chemical leak detected near the wetland. This is a health emergency.', action: 'Evacuate immediately. Seek medical help if exposed. Do not use water from the wetland.' },
  { id: 'heavy-rain', label: 'Heavy Rain Warning', alertType: 'Weather', title: 'Heavy Rain Warning', description: 'Heavy rainfall expected. Risk of flash floods and waterlogging in low-lying areas.', action: 'Stay indoors. Keep emergency kit ready. Monitor local weather updates.' },
  { id: 'wetland-closed', label: 'Wetland Closed', alertType: 'Public Advisory', title: 'Wetland Closed to Public', description: 'The wetland area is temporarily closed due to hazardous conditions.', action: 'Do not enter the wetland area. Follow instructions from authorities.' },
  { id: 'public-advisory', label: 'Public Advisory', alertType: 'Public Advisory', title: 'Public Advisory', description: 'General advisory for the local community regarding wetland conditions and safety.', action: 'Stay informed through official channels. Follow community guidelines.' },
];

const severities = [
  { value: 'Low', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { value: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { value: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { value: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
];

const channelIcons = { SMS: Smartphone, WhatsApp: MessageSquare, Email: Mail } as const;
const channelColors = { SMS: 'text-blue-400', WhatsApp: 'text-green-400', Email: 'text-purple-400' } as const;

function loadHistory(): AlertRecord[] {
  try { return JSON.parse(localStorage.getItem('avian_alert_history') || '[]'); }
  catch { return []; }
}

function getStats() {
  try {
    const c = JSON.parse(localStorage.getItem('avian_citizens') || '[]');
    return {
      total: c.length,
      villages: [...new Set(c.map((x: any) => x.village).filter(Boolean))] as string[],
      citizens: c.map((x: any) => ({ id: x.id, name: x.fullName, village: x.village, mobile: x.mobile })),
    };
  } catch { return { total: 0, villages: [], citizens: [] }; }
}

export function AlertCenterPage() {
  const location = useLocation();
  const prefillApplied = useRef(false);

  const [history, setHistory] = useState<AlertRecord[]>(loadHistory);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const stats = getStats();
  const historyRef = useRef<HTMLDivElement>(null);

  const [quickModal, setQuickModal] = useState<QuickEmergency | null>(null);
  const [quickSendTo, setQuickSendTo] = useState<'all' | 'village'>('all');
  const [quickVillage, setQuickVillage] = useState('');

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customAction, setCustomAction] = useState('');
  const [severity, setSeverity] = useState('');
  const [targetArea, setTargetArea] = useState('');
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [targetVillage, setTargetVillage] = useState('');
  const [sensorName, setSensorName] = useState('');
  const [sendTo, setSendTo] = useState('all');
  const [selectedVillages, setSelectedVillages] = useState<string[]>([]);
  const [selectedCitizens, setSelectedCitizens] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [prefilledFromAI, setPrefilledFromAI] = useState(false);

  const [sendingChannels, setSendingChannels] = useState<{ sms: number; whatsapp: number; email: number } | null>(null);
  const [successModal, setSuccessModal] = useState<{ title: string; recipients: number } | null>(null);

  const template = templates.find(t => t.id === selectedTemplate);
  const totalPages = Math.max(1, Math.ceil(history.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const displayHistory = history.slice(startIndex, startIndex + itemsPerPage);
  const lastAlertTime = history.length > 0 ? new Date(history[0].timestamp).toLocaleTimeString() : '—';

  // Handle pre-filled alert from AI Decision Center
  useEffect(() => {
    if (prefillApplied.current) return;
    const prefill = (location.state as { prefillAlert?: PrefillAlert })?.prefillAlert;
    if (prefill) {
      setSelectedTemplate('public-advisory');
      setCustomMode(true);
      setCustomTitle(prefill.title);
      setCustomDesc(prefill.description);
      setSeverity(prefill.severity);
      setTargetArea(prefill.targetArea);
      setDistrict(prefill.district || '');
      setTaluka(prefill.taluka || '');
      setTargetVillage(prefill.village || '');
      setSensorName(prefill.sensorName || '');
      setCustomAction(prefill.recommendedAction || '');
      setPreviewReady(true);
      setPrefilledFromAI(true);
      prefillApplied.current = true;
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toggleVillage = (v: string) => setSelectedVillages(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  const toggleCitizen = (id: string) => setSelectedCitizens(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const getRecipientCount = () => {
    if (sendTo === 'all') return stats.total;
    if (sendTo === 'villages') return stats.citizens.filter(c => selectedVillages.includes(c.village)).length;
    return selectedCitizens.length;
  };

  const getRecipientList = () => {
    if (sendTo === 'all') return stats.citizens;
    if (sendTo === 'villages') return stats.citizens.filter(c => selectedVillages.includes(c.village));
    return stats.citizens.filter(c => selectedCitizens.includes(c.id));
  };

  const resetForm = () => {
    setSelectedTemplate(''); setCustomTitle(''); setCustomDesc(''); setCustomAction('');
    setSeverity(''); setTargetArea(''); setTargetVillage('');
    setDistrict(''); setTaluka(''); setSensorName('');
    setSendTo('all'); setSelectedVillages([]); setSelectedCitizens([]);
    setErrors({}); setPreviewReady(false); setPrefilledFromAI(false);
    prefillApplied.current = false;
  };

  const animateChannels = () => {
    return new Promise<void>(resolve => {
      setSendingChannels({ sms: 0, whatsapp: 0, email: 0 });
      setTimeout(() => setSendingChannels({ sms: 40, whatsapp: 0, email: 0 }), 300);
      setTimeout(() => setSendingChannels({ sms: 100, whatsapp: 30, email: 0 }), 900);
      setTimeout(() => setSendingChannels({ sms: 100, whatsapp: 100, email: 50 }), 1500);
      setTimeout(() => {
        setSendingChannels({ sms: 100, whatsapp: 100, email: 100 });
        resolve();
      }, 2200);
    });
  };

  const completeSend = async (alertType: string, sev: string, title: string, desc: string, action: string, area: string, sDistrict: string, sTaluka: string, village: string, sSensor: string, sTo: string) => {
    setSending(true);
    const recipients = getRecipientList();
    const total = recipients.length;
    await animateChannels();

    const record: AlertRecord = {
      id: `ALR-${Date.now().toString(36).toUpperCase()}`,
      title, description: desc, recommendedAction: action,
      alertType, severity: sev, targetArea: area,
      district: sDistrict, taluka: sTaluka,
      targetVillage: village, sensorName: sSensor,
      sendTo: sTo,
      recipients: total, timestamp: new Date().toISOString(), sender: 'Admin',
      status: 'simulated',
    };

    const updated = [record, ...history];
    setHistory(updated);
    localStorage.setItem('avian_alert_history', JSON.stringify(updated));
    setHighlightedId(record.id);
    setCurrentPage(1);

    setSendingChannels(null);
    setSending(false);
    setShowPreview(false);
    setQuickModal(null);

    setSuccessModal({ title, recipients: total });

    setTimeout(() => {
      setSuccessModal(null);
      historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 800);

    setTimeout(() => setHighlightedId(null), 3500);
  };

  const handleQuickSend = () => {
    if (!quickModal || sending) return;
    completeSend(
      quickModal.alertType, 'Critical', quickModal.generateTitle(), quickModal.generateDesc(), quickModal.generateAction(),
      quickModal.label, '', '', quickSendTo === 'village' ? quickVillage : '', '',
      quickSendTo === 'all' ? 'all' : 'villages'
    );
  };

  const validateManual = () => {
    const e: Record<string, string> = {};
    if (!selectedTemplate) e.template = 'Select an alert template';
    if (customMode) {
      if (!customTitle.trim()) e.customTitle = 'Title is required';
      if (!customDesc.trim()) e.customDesc = 'Description is required';
    }
    if (!severity) e.severity = 'Select severity';
    if (!targetArea.trim()) e.targetArea = 'Target area is required';
    if (sendTo === 'villages' && selectedVillages.length === 0) e.selectedVillages = 'Select at least one village';
    if (sendTo === 'citizens' && selectedCitizens.length === 0) e.selectedCitizens = 'Select at least one citizen';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleManualSend = () => {
    if (!validateManual() || sending) return;
    if (!previewReady) { setShowPreview(true); setPreviewReady(true); return; }
    const useCustom = customMode && template;
    completeSend(
      template?.alertType || 'Public Advisory', severity,
      useCustom ? customTitle : (template?.title || 'Alert'),
      useCustom ? customDesc : (template?.description || ''),
      useCustom && customAction ? customAction : (template?.action || ''),
      targetArea.trim(), district.trim(), taluka.trim(), targetVillage.trim(), sensorName.trim(),
      sendTo
    );
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-red-500/10 rounded-xl">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Emergency Alert Center</h1>
          <p className="text-sm text-gray-400">Government-grade disaster management and citizen notification system</p>
        </div>
      </div>

      {/* Pre-filled from AI Banner */}
      {prefilledFromAI && (
        <div className="bg-emerald-500/10 backdrop-blur-sm rounded-2xl border border-emerald-500/20 p-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15">
            <Brain size={18} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-emerald-300">Alert Pre-filled from AI Decision Center</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Review & Send</span>
            </div>
            <p className="text-xs text-emerald-300/70">
              All fields are pre-populated based on AI analysis. Review the information below and click <strong>Confirm & Send</strong> to broadcast the alert. No duplicate typing required.
            </p>
          </div>
          <button onClick={() => { resetForm(); setPrefilledFromAI(false); }}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>
      )}

      {/* QUICK EMERGENCY ALERTS */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={18} className="text-red-400" />
          <h2 className="text-base font-semibold text-white">Quick Emergency Alerts</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">One Click</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickEmergencies.map(e => {
            const Icon = e.icon;
            return (
              <button
                key={e.id}
                onClick={() => { setQuickModal(e); setQuickSendTo('all'); setQuickVillage(''); }}
                className="group relative overflow-hidden rounded-xl p-4 text-center border border-white/[0.08] transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                style={{ backgroundColor: `${e.color}15` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${e.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${e.color}25` }}>
                    <Icon size={20} style={{ color: e.color }} />
                  </div>
                  <div className="text-xs font-semibold text-white group-hover:text-white transition-colors">{e.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SMART MANUAL ALERT + RIGHT PANEL */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-3 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Send size={16} className="text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Smart Manual Alert</h2>
            {prefilledFromAI && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-auto">Pre-filled</span>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Alert Template <span className="text-red-400">*</span></label>
              <select
                value={selectedTemplate}
                onChange={e => { setSelectedTemplate(e.target.value); setErrors(p => ({ ...p, template: '' })); setCustomMode(false); setPreviewReady(false); }}
                className={`w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border text-white outline-none transition-all ${
                  errors.template ? 'border-red-500/50' : 'border-white/[0.06] focus:border-emerald-500/40'
                } focus:bg-emerald-500/[0.03]`}
              >
                <option value="" className="bg-gray-900">Select a template...</option>
                {templates.map(t => <option key={t.id} value={t.id} className="bg-gray-900">{t.label}</option>)}
              </select>
              {errors.template && <p className="text-xs text-red-400 mt-1">{errors.template}</p>}
            </div>

            {template && (
              <div className="bg-white/[0.04] rounded-xl p-4 space-y-2 border border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Template Preview</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={customMode} onChange={e => setCustomMode(e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-emerald-500 bg-white/[0.04] border border-white/[0.1]" />
                    <span className="text-[11px] text-gray-500">Use Custom Message</span>
                  </label>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Title</span>
                  {customMode ? (
                    <input type="text" value={customTitle} onChange={e => { setCustomTitle(e.target.value); setErrors(p => ({ ...p, customTitle: '' })); }}
                      placeholder="Enter custom title"
                      className={`w-full mt-1 px-3 py-1.5 rounded-lg text-sm bg-white/[0.04] border text-white placeholder:text-gray-600 outline-none transition-all ${
                        errors.customTitle ? 'border-red-500/50' : 'border-white/[0.06] focus:border-emerald-500/40'
                      }`} />
                  ) : (
                    <p className="text-sm text-white mt-0.5">{template.title}</p>
                  )}
                </div>
                {errors.customTitle && <p className="text-xs text-red-400">{errors.customTitle}</p>}
                <div>
                  <span className="text-xs text-gray-500">Description</span>
                  {customMode ? (
                    <textarea value={customDesc} onChange={e => { setCustomDesc(e.target.value); setErrors(p => ({ ...p, customDesc: '' })); }}
                      placeholder="Enter custom description" rows={2}
                      className={`w-full mt-1 px-3 py-1.5 rounded-lg text-sm bg-white/[0.04] border text-white placeholder:text-gray-600 outline-none transition-all resize-none ${
                        errors.customDesc ? 'border-red-500/50' : 'border-white/[0.06] focus:border-emerald-500/40'
                      }`} />
                  ) : (
                    <p className="text-sm text-gray-400 mt-0.5">{template.description}</p>
                  )}
                </div>
                {errors.customDesc && <p className="text-xs text-red-400">{errors.customDesc}</p>}
                <div>
                  <span className="text-xs text-gray-500">Recommended Action</span>
                  {customMode ? (
                    <textarea value={customAction} onChange={e => setCustomAction(e.target.value)}
                      placeholder="Enter recommended action" rows={2}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 resize-none" />
                  ) : (
                    <p className="text-sm text-emerald-400 mt-0.5">{template.action}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Severity <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-4 gap-1.5">
                  {severities.map(s => (
                    <button key={s.value} type="button" onClick={() => { setSeverity(s.value); setErrors(p => ({ ...p, severity: '' })); }}
                      className={`py-2 rounded-lg text-[11px] font-medium border transition-all ${
                        severity === s.value ? `${s.bg} ${s.border} ${s.color}` : 'bg-white/[0.04] border-white/[0.06] text-gray-500 hover:text-white'
                      }`}>{s.value}</button>
                  ))}
                </div>
                {errors.severity && <p className="text-xs text-red-400 mt-1">{errors.severity}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Target Area <span className="text-red-400">*</span></label>
                <input type="text" value={targetArea} onChange={e => { setTargetArea(e.target.value); setErrors(p => ({ ...p, targetArea: '' })); }}
                  placeholder="e.g. Nal Sarovar Wetland"
                  className={`w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border text-white placeholder:text-gray-600 outline-none transition-all ${
                    errors.targetArea ? 'border-red-500/50' : 'border-white/[0.06] focus:border-emerald-500/40'
                  } focus:bg-emerald-500/[0.03]`} />
                {errors.targetArea && <p className="text-xs text-red-400 mt-1">{errors.targetArea}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">District</label>
                <input type="text" value={district} onChange={e => setDistrict(e.target.value)}
                  placeholder="e.g. Ahmedabad"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.03]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Taluka</label>
                <input type="text" value={taluka} onChange={e => setTaluka(e.target.value)}
                  placeholder="e.g. Sanand"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.03]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Village</label>
                <input type="text" value={targetVillage} onChange={e => setTargetVillage(e.target.value)}
                  placeholder="e.g. Navrangpura"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.03]" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Sensor Name <span className="text-xs text-gray-500">(for reference)</span></label>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm">
                {sensorName ? (
                  <>
                    <Eye size={14} className="text-emerald-400 shrink-0" />
                    <span className="text-white">{sensorName}</span>
                  </>
                ) : (
                  <span className="text-gray-600">Not provided</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Send To <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: 'all', label: 'All', desc: `${stats.total}` },
                    { value: 'villages', label: 'Villages', desc: `${stats.villages.length}` },
                    { value: 'citizens', label: 'Citizens', desc: 'Pick' },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => { setSendTo(opt.value); setSelectedVillages([]); setSelectedCitizens([]); }}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        sendTo === opt.value ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white'
                      }`}>
                      <div>{opt.label}</div>
                      <div className="text-[10px] opacity-60">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {sendTo === 'villages' && (
              <div className="bg-white/[0.04] rounded-xl p-3 max-h-32 overflow-y-auto">
                {stats.villages.length === 0 ? <p className="text-xs text-gray-500">No registered villages</p>
                : <div className="flex flex-wrap gap-1.5">
                    {stats.villages.map(v => (
                      <button key={v} type="button" onClick={() => toggleVillage(v)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          selectedVillages.includes(v) ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white'
                        }`}>{v}</button>
                    ))}
                  </div>
                }
                {errors.selectedVillages && <p className="text-xs text-red-400 mt-1">{errors.selectedVillages}</p>}
              </div>
            )}

            {sendTo === 'citizens' && (
              <div className="bg-white/[0.04] rounded-xl p-3 max-h-32 overflow-y-auto">
                {stats.citizens.length === 0 ? <p className="text-xs text-gray-500">No registered citizens</p>
                : <div className="space-y-1">
                    {stats.citizens.map(c => (
                      <button key={c.id} type="button" onClick={() => toggleCitizen(c.id)}
                        className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          selectedCitizens.includes(c.id) ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white'
                        }`}>
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-[7px] font-bold text-white shrink-0">
                          {c.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="truncate">{c.name}</span>
                        <span className="text-gray-600 ml-auto">{c.village}</span>
                      </button>
                    ))}
                  </div>
                }
                {errors.selectedCitizens && <p className="text-xs text-red-400 mt-1">{errors.selectedCitizens}</p>}
              </div>
            )}

            {sendTo !== 'all' && (
              <p className="text-xs text-gray-500">
                {sendTo === 'villages' ? selectedVillages.length : selectedCitizens.length} selected — {getRecipientCount()} recipient(s)
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              {!previewReady ? (
                <button onClick={() => { if (validateManual()) { setShowPreview(true); setPreviewReady(true); } }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20">
                  <Send size={14} /> Send Alert
                </button>
              ) : (
                <button onClick={handleManualSend} disabled={sending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {sending ? <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Sending...</>
                  : <><Send size={14} /> Confirm & Send</>}
                </button>
              )}
              {prefilledFromAI && !sending && (
                <button onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white border border-white/[0.06] hover:bg-white/[0.04] transition-all">
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Today's Statistics */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Today's Statistics</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-blue-400" />
                  <span className="text-sm text-gray-400">Alerts Sent Today</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {history.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-emerald-400" />
                  <span className="text-sm text-gray-400">Registered Citizens</span>
                </div>
                <span className="text-sm font-bold text-white">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-amber-400" />
                  <span className="text-sm text-gray-400">Villages Covered</span>
                </div>
                <span className="text-sm font-bold text-white">{stats.villages.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-purple-400" />
                  <span className="text-sm text-gray-400">Last Alert</span>
                </div>
                <span className="text-sm font-bold text-white">{lastAlertTime}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
            <h3 className="text-sm font-semibold text-white mb-3">API Status</h3>
            <div className="flex items-center gap-2 text-sm text-emerald-400 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Simulation Mode Active</span>
            </div>
            <p className="text-xs text-gray-500">Real SMS/WhatsApp/Email APIs pending integration</p>
          </div>
        </div>
      </div>

      {/* ALERT HISTORY */}
      <div ref={historyRef} className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Alert History</h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500">{history.length} total</span>
          </div>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No alerts sent yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayHistory.map(alert => {
                    const sev = severities.find(s => s.value === alert.severity) || severities[0];
                    const isNew = highlightedId === alert.id;
                    return (
                      <tr key={alert.id}
                        className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-all duration-700 ${
                          isNew ? 'bg-emerald-500/5 animate-pulse' : ''
                        }`}>
                        <td className="py-3 px-2 text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-2">
                          <div className="text-sm font-medium text-white">{alert.title}</div>
                          <div className="text-xs text-gray-500">{alert.targetArea}{alert.sensorName ? ` · ${alert.sensorName}` : ''}</div>
                        </td>
                        <td className="py-3 px-2 text-xs text-gray-400">{alert.alertType}</td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sev.bg} ${sev.color}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-xs text-gray-400">{alert.recipients} notified</td>
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                            <CheckCircle size={10} />
                            Simulation Complete
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500">Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-2 py-1 rounded-lg text-[11px] bg-white/[0.04] border border-white/[0.06] text-gray-300 outline-none"
                >
                  <option value={5} className="bg-gray-900">5</option>
                  <option value={10} className="bg-gray-900">10</option>
                  <option value={20} className="bg-gray-900">20</option>
                </select>
                <span className="text-[11px] text-gray-500">
                  {startIndex + 1}–{Math.min(startIndex + itemsPerPage, history.length)} of {history.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage === 1}
                  className="px-2 py-1 rounded-lg text-[11px] text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {'<<'}
                </button>
                <button
                  onClick={() => setCurrentPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="px-2 py-1 rounded-lg text-[11px] text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {'<'}
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (safePage <= 3) {
                    pageNum = i + 1;
                  } else if (safePage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = safePage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-all ${
                        safePage === pageNum
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="px-2 py-1 rounded-lg text-[11px] text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {'>'}
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="px-2 py-1 rounded-lg text-[11px] text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {'>>'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* SENDING PROGRESS MODAL */}
      {sendingChannels && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-gray-900 border border-white/[0.08] rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Sending Emergency Alert...</h3>
            <p className="text-xs text-gray-500 mb-5">Broadcasting to all channels</p>
            <div className="space-y-3">
              {(['SMS', 'WhatsApp', 'Email'] as const).map(ch => {
                const Icon = channelIcons[ch];
                const progress = ch === 'SMS' ? sendingChannels.sms : ch === 'WhatsApp' ? sendingChannels.whatsapp : sendingChannels.email;
                return (
                  <div key={ch} className="flex items-center gap-3">
                    <Icon size={16} className={channelColors[ch]} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">{ch}</span>
                        <span className="text-xs text-gray-500">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    {progress === 100 && <CheckCircle size={14} className="text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSuccessModal(null)} />
          <div className="relative bg-gray-900 border border-emerald-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Emergency Alert Sent Successfully</h3>
            <p className="text-xs text-gray-400 mb-5">{successModal.title}</p>
            <div className="bg-white/[0.04] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Smartphone size={14} className="text-blue-400" />
                <span className="text-gray-300">SMS Sent</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare size={14} className="text-green-400" />
                <span className="text-gray-300">WhatsApp Sent</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-purple-400" />
                <span className="text-gray-300">Email Sent</span>
              </div>
              <div className="border-t border-white/[0.06] pt-2 text-sm text-gray-400">
                Recipients Notified: <span className="text-white font-medium">{successModal.recipients}</span>
              </div>
            </div>
            <button onClick={() => setSuccessModal(null)}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg">
              Done
            </button>
          </div>
        </div>
      )}

      {/* QUICK EMERGENCY CONFIRMATION MODAL */}
      {quickModal && !sendingChannels && !successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { if (!sending) setQuickModal(null); }} />
          <div className="relative bg-gray-900 border border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${quickModal.color}25` }}>
                  <quickModal.icon size={16} style={{ color: quickModal.color }} />
                </div>
                <h3 className="text-base font-semibold text-white">{quickModal.label}</h3>
              </div>
              <button onClick={() => { if (!sending) setQuickModal(null); }} className="p-1 rounded hover:bg-white/[0.06] text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-4 space-y-2 mb-4">
              <p className="text-sm text-white font-medium">{quickModal.generateTitle()}</p>
              <p className="text-sm text-gray-400">{quickModal.generateDesc()}</p>
              <p className="text-xs text-emerald-400">{quickModal.generateAction()}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t border-white/[0.06]">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400">Critical</span>
                <span>{quickModal.alertType}</span>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <label className="text-sm font-medium text-gray-300">Send To</label>
              <div className="flex gap-2">
                <button onClick={() => setQuickSendTo('all')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    quickSendTo === 'all' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white'
                  }`}>All Citizens ({stats.total})</button>
                <button onClick={() => setQuickSendTo('village')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    quickSendTo === 'village' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white'
                  }`}>Selected Village</button>
              </div>
              {quickSendTo === 'village' && (
                <div className="bg-white/[0.04] rounded-xl p-3 max-h-28 overflow-y-auto">
                  {stats.villages.length === 0 ? <p className="text-xs text-gray-500">No villages registered</p>
                  : <div className="flex flex-wrap gap-1.5">
                      {stats.villages.map(v => (
                        <button key={v} type="button" onClick={() => setQuickVillage(v)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            quickVillage === v ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white'
                          }`}>{v}</button>
                      ))}
                    </div>
                  }
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setQuickModal(null)} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white">Cancel</button>
              <button onClick={handleQuickSend} disabled={sending || (quickSendTo === 'village' && !quickVillage)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 transition-all disabled:opacity-50">
                {sending ? <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Sending...</>
                : 'Send Emergency Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
