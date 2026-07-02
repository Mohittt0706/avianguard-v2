import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Brain, Activity, AlertTriangle, Shield, MapPin, Droplets, Thermometer, Gauge, BarChart3, Crosshair, Target, Send, Eye, Zap, Radio, Cpu, Clock, Users, X, Bell } from 'lucide-react';
import ElectricBorder from '../ElectricBorder';

interface AIAlert {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  sensorName: string;
  sensorModel: string;
  currentReading: number;
  unit: string;
  safeThreshold: string;
  wetlandName: string;
  district: string;
  taluka: string;
  village: string;
  confidenceScore: number;
  rootCauseAnalysis: string;
  possibleImpact: string;
  recommendedAction: string;
  timestamp: Date;
  status: 'new' | 'sent';
}

const mockAlerts: AIAlert[] = [
  {
    id: 'AI-24-001', severity: 'Critical',
    sensorName: 'TDS Sensor - WT-01', sensorModel: 'Hach Sension+ 1560',
    currentReading: 1240, unit: 'ppm', safeThreshold: '< 500 ppm',
    wetlandName: 'Nal Sarovar Wetland', district: 'Ahmedabad', taluka: 'Sanand', village: 'Nal Sarovar',
    confidenceScore: 96,
    rootCauseAnalysis: 'Industrial effluent discharge detected from textile mills 3.2 km upstream. Chemical fingerprinting confirms presence of azo dyes, chromium, and elevated conductivity consistent with untreated industrial wastewater.',
    possibleImpact: 'Critical threat to 200+ aquatic species. Drinking water contamination affecting 15,000+ residents across 8 downstream villages. Potential mass fish kill event within 24-48 hours if unaddressed.',
    recommendedAction: 'ACTIVATE LEVEL-1 EMERGENCY: 1) Notify GPCB & CPCB immediately. 2) Dispatch rapid response team for water sampling. 3) Issue Do-Not-Drink advisory via SMS/WhatsApp to all registered citizens. 4) Deploy emergency aeration systems. 5) Initiate legal proceedings against identified polluters.',
    timestamp: new Date(Date.now() - 1000 * 60 * 12), status: 'new',
  },
  {
    id: 'AI-24-002', severity: 'Critical',
    sensorName: 'Salinity Sensor - SB-01', sensorModel: 'YSI Pro30',
    currentReading: 35.4, unit: 'ppt', safeThreshold: '< 15 ppt',
    wetlandName: 'Sundarban Wetland', district: 'South 24 Parganas', taluka: 'Gosaba', village: 'Sajnekhali',
    confidenceScore: 93,
    rootCauseAnalysis: 'Sea water intrusion exacerbated by rising sea levels and reduced freshwater flow from upstream barrages. Continuous monitoring shows 0.3 ppt/year increasing trend over past 5 years.',
    possibleImpact: 'Mangrove ecosystem degradation affecting Bengal Tiger habitat. Freshwater scarcity for 50,000+ residents. Loss of traditional agriculture and fisheries livelihoods. Increased human-wildlife conflict risk.',
    recommendedAction: 'ACTIVATE LEVEL-1 EMERGENCY: 1) Alert Forest Department & Sundarban Biosphere Reserve authority. 2) Initiate freshwater release from upstream reservoirs. 3) Deploy mobile water purification units. 4) Issue safe water advisory to island communities.',
    timestamp: new Date(Date.now() - 1000 * 60 * 35), status: 'new',
  },
  {
    id: 'AI-24-003', severity: 'Critical',
    sensorName: 'pH Sensor - WL-01', sensorModel: 'Hanna HI-98107',
    currentReading: 4.8, unit: 'pH', safeThreshold: '6.5 — 8.5 pH',
    wetlandName: 'Wular Lake', district: 'Bandipora', taluka: 'Bandipora', village: 'Zainakadal',
    confidenceScore: 91,
    rootCauseAnalysis: 'Acidic industrial discharge from paper mill and chemical factories located along the shoreline. Heavy metal leaching (iron, manganese) from accumulated industrial sludge beds.',
    possibleImpact: 'Severe aquatic ecosystem damage. Fish population decline threatening livelihoods of 25,000+ fishermen. Bioaccumulation of heavy metals in food chain. Drinking water unsafe for 100,000+ residents.',
    recommendedAction: 'ACTIVATE LEVEL-1 EMERGENCY: 1) Notify J&K Pollution Control Board. 2) Dispatch neutralization team with lime dosing. 3) Suspend all industrial operations pending investigation. 4) Issue health advisory. 5) Arrange alternative drinking water supply.',
    timestamp: new Date(Date.now() - 1000 * 60 * 55), status: 'new',
  },
  {
    id: 'AI-24-004', severity: 'High',
    sensorName: 'pH Sensor - CL-01', sensorModel: 'Hanna HI-98107',
    currentReading: 5.2, unit: 'pH', safeThreshold: '6.5 — 8.5 pH',
    wetlandName: 'Chilika Lake', district: 'Puri', taluka: 'Puri', village: 'Satapada',
    confidenceScore: 88,
    rootCauseAnalysis: 'Ocean acidification combined with organic matter decomposition from algae blooms. Reduced freshwater inflow during dry season has concentrated acidic compounds.',
    possibleImpact: 'Declining shellfish and crustacean populations. Impact on Irrawaddy dolphin habitat. Reduced fishery yield affecting 200,000+ fishing families. Tourism revenue loss.',
    recommendedAction: 'ACTIVATE LEVEL-2 ALERT: 1) Monitor pH levels every 2 hours. 2) Increase freshwater release from Naraj barrage. 3) Deploy pH buffering agents in critical zones. 4) Issue fishery advisory. 5) Schedule aerial monitoring.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), status: 'new',
  },
  {
    id: 'AI-24-005', severity: 'High',
    sensorName: 'Temperature Sensor - VB-01', sensorModel: 'Omega RDXL4SD',
    currentReading: 39.2, unit: '°C', safeThreshold: '20 — 30 °C',
    wetlandName: 'Vembanad Wetland', district: 'Alappuzha', taluka: 'Kuttanad', village: 'Kumarakom',
    confidenceScore: 87,
    rootCauseAnalysis: 'Thermal pollution from nearby industrial cooling systems combined with record high ambient temperatures. Reduced water circulation due to Thanneermukkom bund restricting tidal flow.',
    possibleImpact: 'Mass fish mortality risk. Accelerated eutrophication and algae bloom formation. Drinking water quality degradation. Negative impact on tourism in Kumarakom backwaters. Health risks for local communities.',
    recommendedAction: 'ACTIVATE LEVEL-2 ALERT: 1) Notify Kerala State Pollution Control Board. 2) Audit industrial cooling systems for compliance. 3) Increase water circulation through sluice gate management. 4) Deploy temperature monitoring buoys. 5) Issue public health advisory.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180), status: 'new',
  },
  {
    id: 'AI-24-006', severity: 'High',
    sensorName: 'Nitrate Sensor - KL-01', sensorModel: 'Hach DR/890',
    currentReading: 45.6, unit: 'mg/L', safeThreshold: '< 10 mg/L',
    wetlandName: 'Kolleru Lake', district: 'Eluru', taluka: 'Kaikaluru', village: 'Kolleru',
    confidenceScore: 89,
    rootCauseAnalysis: 'Excessive fertilizer runoff from surrounding paddy fields and aquaculture farms. Recent heavy rainfall has accelerated nutrient transport into the lake system. 4.5x above safe limit.',
    possibleImpact: 'Severe eutrophication risk leading to algae blooms and fish kills. Groundwater contamination affecting drinking water wells. Loss of migratory bird habitat. Reduced lake depth from accelerated sedimentation.',
    recommendedAction: 'ACTIVATE LEVEL-2 ALERT: 1) Notify Andhra Pradesh Pollution Control Board. 2) Restrict fertilizer application in catchment area. 3) Deploy floating wetland treatment systems. 4) Issue advisory on well water usage. 5) Schedule algae bloom monitoring.',
    timestamp: new Date(Date.now() - 1000 * 60 * 240), status: 'new',
  },
  {
    id: 'AI-24-007', severity: 'Medium',
    sensorName: 'Turbidity Sensor - LT-01', sensorModel: 'Hach 2100Q',
    currentReading: 18.5, unit: 'NTU', safeThreshold: '< 5 NTU',
    wetlandName: 'Loktak Lake', district: 'Bishnupur', taluka: 'Moirang', village: 'Thanga',
    confidenceScore: 82,
    rootCauseAnalysis: 'Increased sedimentation from deforestation in catchment area and soil erosion due to shifting cultivation practices. Suspended sediment load from Khuga River tributaries.',
    possibleImpact: 'Degradation of phumdi floating islands (unique ecosystem). Reduced sunlight penetration affecting aquatic plants. Impact on Sangai deer habitat. Declining fish catch for local communities.',
    recommendedAction: 'MONITOR & MITIGATE: 1) Increase turbidity monitoring frequency. 2) Coordinate with forest department for catchment restoration. 3) Deploy sediment traps at key inflow points. 4) Schedule community awareness program on sustainable farming.',
    timestamp: new Date(Date.now() - 1000 * 60 * 360), status: 'new',
  },
  {
    id: 'AI-24-008', severity: 'Medium',
    sensorName: 'Ammonia Sensor - HR-01', sensorModel: 'Hach HQ40d',
    currentReading: 2.8, unit: 'mg/L', safeThreshold: '< 0.5 mg/L',
    wetlandName: 'Harike Wetland', district: 'Tarn Taran', taluka: 'Tarn Taran', village: 'Harike',
    confidenceScore: 84,
    rootCauseAnalysis: 'Agricultural runoff heavy in nitrogenous fertilizers combined with untreated sewage from upstream settlements. 5.6x above safe limit indicates chronic pollution loading.',
    possibleImpact: 'Toxic to aquatic life — fish gill damage and reduced hatching success. Eutrophication acceleration. Drinking water treatment costs increasing. Downstream contamination of Indus River system.',
    recommendedAction: 'MONITOR & MITIGATE: 1) Notify Punjab Pollution Control Board. 2) Conduct upstream sewage treatment audit. 3) Deploy bio-remediation agents. 4) Issue fisheries advisory. 5) Schedule nutrient loading study.',
    timestamp: new Date(Date.now() - 1000 * 60 * 420), status: 'new',
  },
  {
    id: 'AI-24-009', severity: 'Medium',
    sensorName: 'DO Sensor - AM-01', sensorModel: 'YSI Pro20',
    currentReading: 2.8, unit: 'mg/L', safeThreshold: '> 5 mg/L',
    wetlandName: 'Ashtamudi Wetland', district: 'Kollam', taluka: 'Karunagappally', village: 'Ashtamudi',
    confidenceScore: 79,
    rootCauseAnalysis: 'Organic pollution from domestic sewage and coconut husk retting activities. Decomposition of organic matter consuming dissolved oxygen. Low water circulation in the lake system.',
    possibleImpact: 'Fish mortality events becoming more frequent. Unpleasant odor affecting tourism. Loss of clam and mussel populations. Public health concerns from waterborne diseases.',
    recommendedAction: 'MONITOR & MITIGATE: 1) Increase DO monitoring density. 2) Install aerators in low-oxygen zones. 3) Regulate retting activities near the lake. 4) Coordinate with local authorities for sewage treatment. 5) Public awareness campaign.',
    timestamp: new Date(Date.now() - 1000 * 60 * 600), status: 'new',
  },
  {
    id: 'AI-24-010', severity: 'Low',
    sensorName: 'Water Level Sensor - BT-01', sensorModel: 'Solinst Levelogger 5',
    currentReading: 2.1, unit: 'm', safeThreshold: '< 3.5 m',
    wetlandName: 'Bhitarkanika Wetland', district: 'Kendrapara', taluka: 'Rajnagar', village: 'Bhitarkanika',
    confidenceScore: 95,
    rootCauseAnalysis: 'Seasonal water level variation within normal range. No anomaly detected. Continuous monitoring confirms stable hydrological conditions consistent with seasonal patterns.',
    possibleImpact: 'No immediate impact. Regular seasonal fluctuation supports natural breeding cycles of estuarine crocodiles and olive ridley turtles. Normal ecosystem functioning.',
    recommendedAction: 'ROUTINE MONITORING: 1) Continue standard monitoring protocol. 2) Maintain data logging frequency. 3) Schedule routine sensor calibration. 4) Update baseline data for seasonal variation model.',
    timestamp: new Date(Date.now() - 1000 * 60 * 900), status: 'new',
  },
  {
    id: 'AI-24-011', severity: 'Critical',
    sensorName: 'DO Sensor - KD-01', sensorModel: 'YSI Pro20',
    currentReading: 1.2, unit: 'mg/L', safeThreshold: '> 5 mg/L',
    wetlandName: 'Keoladeo National Park', district: 'Bharatpur', taluka: 'Bharatpur', village: 'Keoladeo',
    confidenceScore: 94,
    rootCauseAnalysis: 'Severe eutrophication from accumulated organic matter and reduced water inflow from Ajan Bund. Algae bloom decomposition rapidly depleting dissolved oxygen. Water temperature increase exacerbating condition.',
    possibleImpact: 'Critical threat to migratory bird population (364 species). Mass fish mortality within 24 hours. Complete ecosystem collapse risk if not addressed. UNESCO World Heritage site status under threat.',
    recommendedAction: 'ACTIVATE LEVEL-1 EMERGENCY: 1) Notify UNESCO, Forest Department & Rajasthan PCB. 2) Emergency water release from Panchna dam. 3) Deploy high-capacity aeration systems. 4) Evacuate and treat affected fish populations. 5) Emergency bird monitoring protocol.',
    timestamp: new Date(Date.now() - 1000 * 60 * 25), status: 'new',
  },
  {
    id: 'AI-24-012', severity: 'High',
    sensorName: 'TDS Sensor - SB-02', sensorModel: 'Hach Sension+ 1560',
    currentReading: 2850, unit: 'ppm', safeThreshold: '< 1000 ppm',
    wetlandName: 'Sambhar Lake', district: 'Jaipur', taluka: 'Sambhar', village: 'Sambhar Lake Town',
    confidenceScore: 86,
    rootCauseAnalysis: 'Natural salinity spike due to reduced monsoon rainfall and increased evaporation rates. Salt extraction activities accelerating brine concentration. Long-term trend indicates 2% annual increase.',
    possibleImpact: 'Halophytic ecosystem imbalance affecting migratory flamingo populations. Salt production industry disruption. Groundwater salinization affecting nearby agricultural lands. Local livelihood impact.',
    recommendedAction: 'ACTIVATE LEVEL-2 ALERT: 1) Monitor brine concentration trends. 2) Coordinate with salt department on extraction regulation. 3) Assess freshwater inflow augmentation options. 4) Bird migration monitoring protocol. 5) Long-term desalination feasibility study.',
    timestamp: new Date(Date.now() - 1000 * 60 * 150), status: 'new',
  },
];

const severityConfig = {
  Critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', cardBorder: 'border-l-red-500', dot: 'bg-red-500', glow: 'shadow-red-500/10', badgeBg: 'bg-red-500/15' },
  High: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', cardBorder: 'border-l-orange-500', dot: 'bg-orange-500', glow: 'shadow-orange-500/10', badgeBg: 'bg-orange-500/15' },
  Medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', cardBorder: 'border-l-amber-500', dot: 'bg-amber-500', glow: 'shadow-amber-500/10', badgeBg: 'bg-amber-500/15' },
  Low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', cardBorder: 'border-l-emerald-500', dot: 'bg-emerald-500', glow: 'shadow-emerald-500/10', badgeBg: 'bg-emerald-500/15' },
};

const sensorIcons: Record<string, typeof Droplets> = {
  TDS: Droplets, pH: Activity, Temperature: Thermometer, Turbidity: Gauge,
  Salinity: Droplets, Nitrate: BarChart3, Ammonia: Crosshair, DO: Activity,
  'Water Level': Radio,
};

function getSensorIcon(name: string) {
  const key = Object.keys(sensorIcons).find(k => name.includes(k)) || 'TDS';
  return sensorIcons[key];
}

function getConfidenceColor(score: number) {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 80) return 'bg-amber-500';
  return 'bg-orange-500';
}

function formatTime(d: Date) {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

interface SensorDetailModalProps {
  alert: AIAlert;
  onClose: () => void;
}

function SensorDetailModal({ alert, onClose }: SensorDetailModalProps) {
  const sev = severityConfig[alert.severity];
  const Icon = getSensorIcon(alert.sensorName);

  const historyReadings = [
    { time: '06:00', value: alert.currentReading * 0.92 },
    { time: '08:00', value: alert.currentReading * 0.95 },
    { time: '10:00', value: alert.currentReading * 0.88 },
    { time: '12:00', value: alert.currentReading * 0.97 },
    { time: '14:00', value: alert.currentReading * 1.05 },
    { time: '16:00', value: alert.currentReading * 1.02 },
    { time: '18:00', value: alert.currentReading },
  ];
  const maxHist = Math.max(...historyReadings.map(r => r.value), alert.currentReading);
  const unit = alert.unit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <ElectricBorder color="#DC2626" speed={0.6} chaos={0.08} borderRadius={16}>
        <div className="relative bg-gray-900 border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`px-6 py-4 border-b border-white/[0.06] flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${sev.bg}`}>
              <Icon size={20} className={sev.color} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{alert.sensorName}</h3>
              <p className="text-xs text-gray-500">{alert.sensorModel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Current Reading */}
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Current Reading</span>
              <span className={`text-xs font-medium ${sev.color}`}>{alert.severity}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-white">{alert.currentReading}</span>
              <span className="text-sm text-gray-500">{unit}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">Safe Threshold: <span className="text-gray-300">{alert.safeThreshold}</span></div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <span className="text-xs text-gray-500">Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">Online</span>
              </div>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <span className="text-xs text-gray-500">Battery</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                </div>
                <span className="text-sm font-medium text-white">78%</span>
              </div>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <span className="text-xs text-gray-500">Last Calibration</span>
              <p className="text-sm font-medium text-white mt-1">12 Jun 2026</p>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <span className="text-xs text-gray-500">Installation</span>
              <p className="text-sm font-medium text-white mt-1">15 Mar 2024</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin size={12} className="text-gray-500" />
              <span className="text-xs text-gray-500">Location</span>
            </div>
            <p className="text-sm text-white">{alert.wetlandName}</p>
            <p className="text-xs text-gray-500">{alert.district} District › {alert.taluka} Taluka › {alert.village}</p>
          </div>

          {/* Recent Readings (mini chart) */}
          <div>
            <span className="text-xs text-gray-500 block mb-2">Recent Readings (Last 6 Hours)</span>
            <div className="flex items-end gap-1.5 h-16">
              {historyReadings.map((r, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-sm transition-all ${r.value === alert.currentReading ? 'bg-emerald-400' : 'bg-emerald-500/40'}`}
                    style={{ height: `${(r.value / maxHist) * 100}%` }}
                  />
                  <span className="text-[9px] text-gray-600">{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-white/[0.06] hover:bg-white/[0.1] transition-all">
            Close
          </button>
        </div>
      </div>
      </ElectricBorder>
    </div>
  );
}

export function AIAlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [filter, setFilter] = useState<AIAlert['severity'] | 'all'>('all');
  const [sensorModal, setSensorModal] = useState<AIAlert | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    setAlerts(mockAlerts);
  }, []);

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  const counts = {
    all: alerts.length,
    Critical: alerts.filter(a => a.severity === 'Critical').length,
    High: alerts.filter(a => a.severity === 'High').length,
    Medium: alerts.filter(a => a.severity === 'Medium').length,
    Low: alerts.filter(a => a.severity === 'Low').length,
  };

  const avgConfidence = alerts.length > 0
    ? Math.round(alerts.reduce((s, a) => s + a.confidenceScore, 0) / alerts.length)
    : 0;

  const handleSendToAlertCenter = (alert: AIAlert) => {
    setSendingId(alert.id);
    setTimeout(() => {
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'sent' as const } : a));
      setSendingId(null);
      navigate('/dashboard/alert-center', {
        state: {
          prefillAlert: {
            alertType: alert.severity === 'Critical' ? 'Flood' : 'Public Advisory',
            title: `AI Alert: ${alert.sensorName} — ${alert.severity} Issue Detected`,
            description: `AI-driven analysis detected a ${alert.severity.toLowerCase()} issue at ${alert.wetlandName}. ${alert.rootCauseAnalysis.substring(0, 150)}...`,
            severity: alert.severity,
            targetArea: alert.wetlandName,
            district: alert.district,
            taluka: alert.taluka,
            village: alert.village,
            sensorName: alert.sensorName,
            recommendedAction: alert.recommendedAction,
          },
        },
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl">
          <Brain size={22} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI Decision Center</h1>
          <p className="text-sm text-gray-400">AI-powered environmental threat analysis & decision support system</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Alerts', value: counts.all, icon: Bell, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Critical', value: counts.Critical, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'High', value: counts.High, icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Medium / Low', value: counts.Medium + counts.Low, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: Brain, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <Icon size={14} className={stat.color} />
                </div>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <span className="text-xl font-bold text-white">{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Target size={14} className="text-gray-500 mr-1" />
        {(['all', 'Critical', 'High', 'Medium', 'Low'] as const).map(f => {
          const sev = f !== 'all' ? severityConfig[f] : null;
          return (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? sev
                    ? `${sev.bg} ${sev.border} ${sev.color} border`
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {f === 'all' ? 'All' : f}
              <span className="ml-1.5 opacity-60">({counts[f]})</span>
            </button>
          );
        })}
      </div>

      {/* AI Alert Cards */}
      <div className="grid lg:grid-cols-2 gap-5">
        {filteredAlerts.map(alert => {
          const sev = severityConfig[alert.severity];
          const Icon = getSensorIcon(alert.sensorName);
          const isSending = sendingId === alert.id;

          return (
            <div
              key={alert.id}
              className={`group bg-white/[0.03] backdrop-blur-sm rounded-2xl border ${sev.border} border-l-[3px] ${sev.cardBorder} overflow-hidden hover:bg-white/[0.05] transition-all duration-300 hover:shadow-xl ${sev.glow} ${
                isSending ? 'animate-pulse opacity-60 pointer-events-none' : ''
              }`}
            >
              {/* Card Header */}
              <div className="px-5 pt-4 pb-3 flex items-start justify-between border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${sev.bg}`}>
                    <Icon size={18} className={sev.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${sev.bg} ${sev.color} border ${sev.border} uppercase tracking-wider`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} ${alert.severity === 'Critical' ? 'animate-pulse' : ''}`} />
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-mono text-gray-600">{alert.id}</span>
                      {alert.status === 'sent' && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-400">
                          <Send size={8} /> Sent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{formatTime(alert.timestamp)}</p>
                  </div>
                </div>
                <div className={`text-right ${sev.color}`}>
                  <div className={`w-2 h-2 rounded-full ${sev.dot} ${alert.severity === 'Critical' ? 'animate-pulse' : ''} ml-auto`} />
                </div>
              </div>

              {/* Sensor Reading */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.04]">
                <div>
                  <span className="text-xs text-gray-500">Sensor</span>
                  <p className="text-sm font-medium text-white">{alert.sensorName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Reading</span>
                  <p className={`text-sm font-bold ${sev.color}`}>{alert.currentReading} <span className="text-xs font-normal text-gray-500">{alert.unit}</span></p>
                </div>
              </div>

              {/* Location */}
              <div className="px-5 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={11} className="text-gray-600" />
                  <span className="text-[11px] text-gray-500">Location</span>
                </div>
                <p className="text-sm text-white">{alert.wetlandName}</p>
                <p className="text-xs text-gray-500">{alert.district} › {alert.taluka} › {alert.village}</p>
              </div>

              {/* AI Analysis */}
              <div className="px-5 py-3 border-b border-white/[0.04] space-y-3">
                {/* Confidence */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Brain size={11} className="text-emerald-500" /> AI Confidence
                    </span>
                    <span className="text-xs font-bold text-white">{alert.confidenceScore}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${getConfidenceColor(alert.confidenceScore)}`}
                      style={{ width: `${alert.confidenceScore}%` }} />
                  </div>
                </div>

                {/* Root Cause */}
                <div>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Crosshair size={11} className="text-orange-500" /> Root Cause Analysis
                  </span>
                  <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{alert.rootCauseAnalysis}</p>
                </div>

                {/* Possible Impact */}
                <div>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <AlertTriangle size={11} className="text-red-500" /> Possible Impact
                  </span>
                  <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{alert.possibleImpact}</p>
                </div>

                {/* Recommended Action */}
                <div className={`p-2.5 rounded-xl border ${sev.border} ${sev.bg}`}>
                  <span className="text-[11px] font-semibold text-white flex items-center gap-1 mb-1">
                    <Shield size={11} className={sev.color} /> Recommended Action
                  </span>
                  <p className="text-xs text-gray-200 leading-relaxed">{alert.recommendedAction}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3 flex items-center gap-3">
                <button
                  onClick={() => setSensorModal(alert)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all"
                >
                  <Eye size={13} /> View Sensor Details
                </button>
                <button
                  onClick={() => handleSendToAlertCenter(alert)}
                  disabled={alert.status === 'sent'}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    alert.status === 'sent'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed'
                      : 'text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 shadow-lg shadow-emerald-500/10'
                  }`}
                >
                  {alert.status === 'sent' ? (
                    <><Send size={13} /> Sent to Alert Center</>
                  ) : (
                    <><Send size={13} /> Send to Alert Center</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-16">
          <Brain size={48} className="text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-400 mb-1">No Alerts Found</h3>
          <p className="text-sm text-gray-600">No AI alerts match the selected filter</p>
        </div>
      )}

      {/* Sensor Detail Modal */}
      {sensorModal && (
        <SensorDetailModal alert={sensorModal} onClose={() => setSensorModal(null)} />
      )}
    </div>
  );
}
