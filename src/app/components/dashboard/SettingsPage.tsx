import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner';
import {
  Settings, AlertTriangle, Server, Shield, Bell, Activity, Users, Database,
  RefreshCw, Download, Upload, Save, RotateCcw, Zap, Wifi, Link2,
  Cpu, HardDrive, Clock, Globe, Smartphone, MessageSquare, Mail, Eye,
  EyeOff, LogOut, Key, Radio, Thermometer, Droplets, Gauge, FlipHorizontal,
  ChevronRight, CheckCircle, XCircle, ToggleLeft, ToggleRight,
  FileText, Search, Calendar,
} from 'lucide-react';
import { settingsApi } from '@/services/settingsApi';

// ===================== TYPES =====================

type CategoryId = 'general' | 'ai' | 'alert-rules' | 'notifications' | 'sensors' | 'security' | 'system' | 'integrations' | 'backup' | 'audit';

interface Category {
  id: CategoryId;
  label: string;
  icon: typeof Settings;
}

const CATEGORIES: Category[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'ai', label: 'AI Configuration', icon: Zap },
  { id: 'alert-rules', label: 'Alert Rules', icon: AlertTriangle },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'sensors', label: 'Sensor Configuration', icon: Radio },
  { id: 'security', label: 'User & Security', icon: Shield },
  { id: 'system', label: 'System Health', icon: Server },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
  { id: 'backup', label: 'Backup & Restore', icon: Database },
  { id: 'audit', label: 'Audit Log', icon: FileText },
];

// ===================== SUB-COMPONENTS =====================

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

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, description }: { icon: typeof Settings; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="p-2.5 rounded-lg bg-emerald-500/10 shrink-0">
        <Icon size={18} className="text-emerald-400" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function FormField({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
    />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white outline-none focus:border-emerald-500/40 transition-all"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function ToggleSwitch({ enabled, onChange, label }: {
  enabled: boolean; onChange: (v: boolean) => void; label?: string;
}) {
  return (
    <button onClick={() => onChange(!enabled)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
        enabled
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : 'bg-white/[0.04] border-white/[0.06] text-gray-400'
      }`}
    >
      {enabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
      {label || (enabled ? 'Enabled' : 'Disabled')}
    </button>
  );
}

function PrimaryButton({ onClick, icon: Icon, children, disabled }: {
  onClick: () => void; icon?: typeof Save; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, icon: Icon, children }: {
  onClick: () => void; icon?: typeof RotateCcw; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:text-white hover:bg-white/[0.08] transition-all"
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function ActionButton({ onClick, icon: Icon, label, color }: {
  onClick: () => void; icon?: typeof Save; label: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
    red: 'text-red-400 border-red-500/30 hover:bg-red-500/20',
    blue: 'text-blue-400 border-blue-500/30 hover:bg-blue-500/20',
    amber: 'text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
    gray: 'text-gray-400 border-white/[0.06] hover:bg-white/[0.08]',
  };
  const c = color ? colorMap[color] || colorMap.gray : colorMap.gray;
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border bg-white/[0.03] transition-all ${c}`}
    >
      {Icon && <Icon size={13} />}
      {label}
    </button>
  );
}

function Badge({ status }: { status: 'connected' | 'disconnected' | 'healthy' | 'warning' | 'error' }) {
  const colors: Record<string, string> = {
    connected: 'text-emerald-400 bg-emerald-500/10',
    healthy: 'text-emerald-400 bg-emerald-500/10',
    disconnected: 'text-red-400 bg-red-500/10',
    warning: 'text-amber-400 bg-amber-500/10',
    error: 'text-red-400 bg-red-500/10',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[status] || colors.disconnected}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'connected' || status === 'healthy' ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ===================== MAIN PAGE =====================

export function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('general');
  const [confirmState, setConfirmState] = useState<{ title: string; message: string; onConfirm: () => void; label?: string; color?: string } | null>(null);

  const showConfirm = (title: string, message: string, onConfirm: () => void, label = 'Confirm', color = 'bg-red-500') =>
    setConfirmState({ title, message, onConfirm, label, color });

  // General
  const [general, setGeneral] = useState({ systemName: 'AvianGuard', organization: 'Wetland Protection Authority', deploymentMode: 'Production', timezone: 'Asia/Kolkata', language: 'English (US)', theme: 'Dark' });

  // AI
  const [ai, setAi] = useState({ enabled: true, confidenceThreshold: '85', riskInterval: '30', floodThreshold: '75', pollutionThreshold: '70', habitatThreshold: '80' });

  // Alert Rules
  const [rules, setRules] = useState({
    temperature: { warning: '35', critical: '45' }, humidity: { warning: '60', critical: '85' },
    waterLevel: { warning: '2.5', critical: '4.0' }, ph: { warning: '6.5', critical: '8.5' },
    tds: { warning: '500', critical: '1000' }, turbidity: { warning: '5', critical: '10' },
    dissolvedOxygen: { warning: '4.0', critical: '2.0' },
  });

  // Notifications
  const [notif, setNotif] = useState({ sms: true, whatsapp: true, email: true, push: false, delay: '2', retries: '3', escalation: true });

  // Sensors
  const [sensor, setSensor] = useState({ interval: '30', samplingRate: '60', offlineTimeout: '300', gatewayTimeout: '60', autoReconnect: true, autoCalibration: true });

  // Security
  const [security, setSecurity] = useState({ minPasswordLength: '8', sessionTimeout: '30', twoFactor: false, loginAttempts: '5', ipRestriction: false });

  const handleGeneralSave = useCallback(() => {
    settingsApi.saveGeneral(general);
    toast.success('General settings saved successfully');
  }, [general]);

  const handleAiToggle = useCallback(() => {
    const next = !ai.enabled;
    settingsApi.toggleAi(next);
    setAi(prev => ({ ...prev, enabled: next }));
    toast.success(`AI ${next ? 'enabled' : 'disabled'} successfully`);
  }, [ai.enabled]);

  const handleAiThresholdsSave = useCallback(() => {
    settingsApi.updateAiThresholds({
      confidenceThreshold: Number(ai.confidenceThreshold), riskPredictionInterval: Number(ai.riskInterval),
      floodThreshold: Number(ai.floodThreshold), pollutionThreshold: Number(ai.pollutionThreshold), habitatThreshold: Number(ai.habitatThreshold),
    });
    toast.success('AI thresholds updated successfully');
  }, [ai]);

  const handleAiReset = useCallback(() => {
    showConfirm('Reset AI Settings', 'This will restore all AI configuration to factory defaults. Continue?', () => {
      settingsApi.resetAiSettings();
      setAi({ enabled: true, confidenceThreshold: '85', riskInterval: '30', floodThreshold: '75', pollutionThreshold: '70', habitatThreshold: '80' });
      toast.success('AI settings reset to defaults');
    });
  }, []);

  const handleGenerateTestPrediction = useCallback(() => {
    settingsApi.generateTestPrediction();
    toast.success('Test prediction generated. Check AI Decision Center for results.');
  }, []);

  const handleAlertRulesSave = useCallback(() => {
    settingsApi.saveAlertRules(rules);
    toast.success('Alert rules saved successfully');
  }, [rules]);

  const handleAlertRulesReset = useCallback(() => {
    showConfirm('Reset Thresholds', 'Reset all alert thresholds to factory defaults?', () => {
      settingsApi.resetAlertRules();
      setRules({
        temperature: { warning: '35', critical: '45' }, humidity: { warning: '60', critical: '85' },
        waterLevel: { warning: '2.5', critical: '4.0' }, ph: { warning: '6.5', critical: '8.5' },
        tds: { warning: '500', critical: '1000' }, turbidity: { warning: '5', critical: '10' },
        dissolvedOxygen: { warning: '4.0', critical: '2.0' },
      });
      toast.success('Alert thresholds reset to defaults');
    });
  }, []);

  const handleNotifSave = useCallback(() => {
    settingsApi.saveNotificationSettings(notif);
    toast.success('Notification settings saved');
  }, [notif]);

  const handleSensorSave = useCallback(() => {
    settingsApi.saveSensorConfig(sensor);
    toast.success('Sensor configuration saved');
  }, [sensor]);

  const handleRestartSensors = useCallback(() => {
    showConfirm('Restart All Sensors', 'This will temporarily disconnect all sensors. Continue?', () => {
      settingsApi.restartAllSensors();
      toast.success('All sensors restarting...');
    });
  }, []);

  const handleSecuritySave = useCallback(() => {
    settingsApi.saveSecuritySettings(security);
    toast.success('Security settings saved');
  }, [security]);

  const handleForceLogout = useCallback(() => {
    showConfirm('Force Logout All Users', 'All active sessions will be terminated. Continue?', () => {
      settingsApi.forceLogoutAll();
      toast.success('All users have been logged out');
    });
  }, []);

  const handleGenerateToken = useCallback(() => {
    settingsApi.generateApiToken().then(() => {
      toast.success('New API token generated');
    });
  }, []);

  const handleRevokeTokens = useCallback(() => {
    showConfirm('Revoke All Tokens', 'All existing API tokens will be invalidated. Continue?', () => {
      settingsApi.revokeTokens();
      toast.success('All API tokens revoked');
    });
  }, []);

  const [systemHealth, setSystemHealth] = useState({
    backend: 'healthy', database: 'healthy', cloud: 'connected', mqtt: 'connected',
    socket: 'connected', storage: '68%', memory: '42%', cpu: '23%', uptime: '14d 6h 32m',
  });

  const handleRefreshHealth = useCallback(() => {
    settingsApi.refreshSystemHealth();
    const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    setSystemHealth({
      backend: random(['healthy', 'healthy', 'healthy', 'warning']),
      database: random(['healthy', 'healthy', 'warning']),
      cloud: 'connected', mqtt: random(['connected', 'connected', 'warning']),
      socket: 'connected', storage: `${Math.floor(55 + Math.random() * 30)}%`,
      memory: `${Math.floor(30 + Math.random() * 30)}%`, cpu: `${Math.floor(15 + Math.random() * 25)}%`,
      uptime: '14d 6h 32m',
    });
    toast.success('System health refreshed');
  }, []);

  const handleCreateBackup = useCallback(() => {
    settingsApi.createBackup();
    toast.success('Backup created successfully');
  }, []);

  const handleDownloadBackup = useCallback(() => {
    settingsApi.downloadBackup();
    const blob = new Blob([''], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avianguard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded');
  }, []);

  const handleRestoreBackup = useCallback(() => {
    showConfirm('Restore Backup', 'This will overwrite all current data with the backup. Continue?', () => {
      settingsApi.restoreBackup();
      toast.success('System restored from backup');
    }, 'Restore', 'bg-amber-500');
  }, []);

  const handleResetSystem = useCallback(() => {
    showConfirm('Reset System', 'This will erase ALL data and reset the platform to factory state. This cannot be undone!', () => {
      settingsApi.resetSystem();
      toast.success('System has been reset');
    }, 'Reset System', 'bg-red-600');
  }, []);

  const handleExportConfig = useCallback(() => {
    settingsApi.exportConfig();
    const blob = new Blob([JSON.stringify({ ...general, ai, rules, notif, sensor, security }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avianguard-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exported');
  }, [general, ai, rules, notif, sensor, security]);

  const handleImportConfig = useCallback(() => {
    settingsApi.importConfig();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) toast.success('Configuration imported successfully');
    };
    input.click();
  }, []);

  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('');

  const auditLogs = [
    { date: '2026-07-01 10:23', user: 'admin@avianguard.org', action: 'Updated AI Thresholds', module: 'AI Config', ip: '192.168.1.1', status: 'Success' },
    { date: '2026-06-30 15:45', user: 'admin@avianguard.org', action: 'Changed Alert Rules', module: 'Alert Rules', ip: '192.168.1.1', status: 'Success' },
    { date: '2026-06-29 09:12', user: 'supervisor@avianguard.org', action: 'Generated API Token', module: 'Security', ip: '10.0.0.5', status: 'Success' },
    { date: '2026-06-28 14:30', user: 'admin@avianguard.org', action: 'Restarted Sensors', module: 'Sensors', ip: '192.168.1.1', status: 'Success' },
    { date: '2026-06-27 11:00', user: 'admin@avianguard.org', action: 'Created Backup', module: 'Backup', ip: '192.168.1.1', status: 'Success' },
    { date: '2026-06-26 08:15', user: 'supervisor@avianguard.org', action: 'Updated Notification Settings', module: 'Notifications', ip: '10.0.0.5', status: 'Success' },
    { date: '2026-06-25 16:45', user: 'admin@avianguard.org', action: 'Modified Security Policies', module: 'Security', ip: '192.168.1.1', status: 'Success' },
    { date: '2026-06-24 13:20', user: 'admin@avianguard.org', action: 'Changed System Name', module: 'General', ip: '192.168.1.1', status: 'Success' },
  ];

  const integrations = [
    { name: 'MongoDB', icon: Database, status: 'connected' as const, desc: 'Primary database' },
    { name: 'Express API', icon: Server, status: 'connected' as const, desc: 'REST API server' },
    { name: 'OpenStreetMap', icon: MapIcon, status: 'connected' as const, desc: 'Map tiles & GIS data' },
    { name: 'MQTT Broker', icon: Radio, status: 'connected' as const, desc: 'Sensor data streaming' },
    { name: 'Twilio', icon: Smartphone, status: 'connected' as const, desc: 'SMS gateway' },
    { name: 'Fast2SMS', icon: MessageSquare, status: 'disconnected' as const, desc: 'Alternative SMS provider' },
    { name: 'SMTP', icon: Mail, status: 'connected' as const, desc: 'Email delivery' },
    { name: 'Google Maps', icon: Globe, status: 'disconnected' as const, desc: 'Advanced mapping (Future)' },
  ];

  const renderContent = () => {
    switch (activeCategory) {
      // ===================== 1. GENERAL =====================
      case 'general':
        return (
          <div className="space-y-4">
            <SectionTitle icon={Settings} title="General Settings" description="Configure basic platform information" />
            <GlassCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="System Name"><TextInput value={general.systemName} onChange={v => setGeneral(p => ({ ...p, systemName: v }))} placeholder="AvianGuard" /></FormField>
                <FormField label="Organization"><TextInput value={general.organization} onChange={v => setGeneral(p => ({ ...p, organization: v }))} placeholder="Organization name" /></FormField>
                <FormField label="Deployment Mode">
                  <SelectInput value={general.deploymentMode} onChange={v => setGeneral(p => ({ ...p, deploymentMode: v }))} options={['Pilot', 'Production']} />
                </FormField>
                <FormField label="Time Zone">
                  <SelectInput value={general.timezone} onChange={v => setGeneral(p => ({ ...p, timezone: v }))} options={['Asia/Kolkata', 'UTC', 'America/New_York', 'Asia/Dubai', 'Asia/Singapore']} />
                </FormField>
                <FormField label="Language">
                  <SelectInput value={general.language} onChange={v => setGeneral(p => ({ ...p, language: v }))} options={['English (US)', 'Hindi', 'Gujarati', 'Marathi', 'Tamil']} />
                </FormField>
                <FormField label="Theme">
                  <SelectInput value={general.theme} onChange={v => setGeneral(p => ({ ...p, theme: v }))} options={['Dark', 'Light', 'System']} />
                </FormField>
              </div>
              <div className="flex justify-end mt-5 pt-4 border-t border-white/[0.06]">
                <PrimaryButton onClick={handleGeneralSave} icon={Save}>Save Changes</PrimaryButton>
              </div>
            </GlassCard>
          </div>
        );

      // ===================== 2. AI CONFIGURATION =====================
      case 'ai':
        return (
          <div className="space-y-4">
            <SectionTitle icon={Zap} title="AI Configuration" description="Configure artificial intelligence and risk prediction" />
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-white">AI Status</p>
                  <p className="text-xs text-gray-500">Artificial intelligence engine for wetland monitoring</p>
                </div>
                <ToggleSwitch enabled={ai.enabled} onChange={() => handleAiToggle()} label={ai.enabled ? 'AI Enabled' : 'AI Disabled'} />
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Thresholds & Intervals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="AI Confidence Threshold (%)"><TextInput value={ai.confidenceThreshold} onChange={v => setAi(p => ({ ...p, confidenceThreshold: v }))} type="number" /></FormField>
                <FormField label="Risk Prediction Interval (min)"><TextInput value={ai.riskInterval} onChange={v => setAi(p => ({ ...p, riskInterval: v }))} type="number" /></FormField>
                <FormField label="Flood Threshold (%)"><TextInput value={ai.floodThreshold} onChange={v => setAi(p => ({ ...p, floodThreshold: v }))} type="number" /></FormField>
                <FormField label="Water Pollution Threshold (%)"><TextInput value={ai.pollutionThreshold} onChange={v => setAi(p => ({ ...p, pollutionThreshold: v }))} type="number" /></FormField>
                <FormField label="Bird Habitat Risk Threshold (%)"><TextInput value={ai.habitatThreshold} onChange={v => setAi(p => ({ ...p, habitatThreshold: v }))} type="number" /></FormField>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/[0.06]">
                <PrimaryButton onClick={handleAiThresholdsSave} icon={Save}>Save Thresholds</PrimaryButton>
                <SecondaryButton onClick={handleGenerateTestPrediction} icon={Zap}>Generate AI Test Prediction</SecondaryButton>
                <SecondaryButton onClick={handleAiReset} icon={RotateCcw}>Reset AI Settings</SecondaryButton>
              </div>
            </GlassCard>
          </div>
        );

      // ===================== 3. ALERT RULES =====================
      case 'alert-rules':
        return (
          <div className="space-y-4">
            <SectionTitle icon={AlertTriangle} title="Alert Rules" description="Configure sensor thresholds for warning and critical alerts" />
            <GlassCard>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left py-2 pr-4 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Sensor</th>
                      <th className="text-left py-2 px-4 text-[10px] font-medium text-amber-500 uppercase tracking-wider">Warning Value</th>
                      <th className="text-left py-2 pl-4 text-[10px] font-medium text-red-500 uppercase tracking-wider">Critical Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {(Object.keys(rules) as Array<keyof typeof rules>).map(key => (
                      <tr key={key}>
                        <td className="py-2.5 pr-4">
                          <span className="text-sm text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <input value={rules[key].warning} onChange={e => setRules(p => ({ ...p, [key]: { ...p[key], warning: e.target.value } }))}
                            className="w-24 px-2 py-1.5 rounded text-xs bg-amber-500/5 border border-amber-500/20 text-amber-300 outline-none focus:border-amber-500/40 transition-all"
                          />
                        </td>
                        <td className="py-2.5 pl-4">
                          <input value={rules[key].critical} onChange={e => setRules(p => ({ ...p, [key]: { ...p[key], critical: e.target.value } }))}
                            className="w-24 px-2 py-1.5 rounded text-xs bg-red-500/5 border border-red-500/20 text-red-300 outline-none focus:border-red-500/40 transition-all"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/[0.06]">
                <PrimaryButton onClick={handleAlertRulesSave} icon={Save}>Save Thresholds</PrimaryButton>
                <SecondaryButton onClick={handleAlertRulesReset} icon={RotateCcw}>Reset Default</SecondaryButton>
              </div>
            </GlassCard>
          </div>
        );

      // ===================== 4. NOTIFICATIONS =====================
      case 'notifications':
        return (
          <div className="space-y-4">
            <SectionTitle icon={Bell} title="Notification Settings" description="Configure alert delivery channels and retry policies" />
            <GlassCard>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Enabled Channels</p>
                  <div className="flex flex-wrap gap-2">
                    {(['sms', 'whatsapp', 'email', 'push'] as const).map(ch => (
                      <ToggleSwitch key={ch} enabled={notif[ch]} onChange={v => setNotif(p => ({ ...p, [ch]: v }))} label={ch === 'sms' ? 'SMS' : ch === 'whatsapp' ? 'WhatsApp' : ch === 'email' ? 'Email' : 'Push Notifications'} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/[0.06]">
                  <FormField label="Notification Delay (min)"><TextInput value={notif.delay} onChange={v => setNotif(p => ({ ...p, delay: v }))} type="number" /></FormField>
                  <FormField label="Retry Attempts"><TextInput value={notif.retries} onChange={v => setNotif(p => ({ ...p, retries: v }))} type="number" /></FormField>
                  <FormField label="Emergency Escalation">
                    <ToggleSwitch enabled={notif.escalation} onChange={v => setNotif(p => ({ ...p, escalation: v }))} />
                  </FormField>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/[0.06]">
                <PrimaryButton onClick={handleNotifSave} icon={Save}>Save Settings</PrimaryButton>
                <ActionButton onClick={() => { settingsApi.testSms('+919876543210'); toast.success('Test SMS sent'); }} icon={Smartphone} label="Send Test SMS" color="blue" />
                <ActionButton onClick={() => { settingsApi.testWhatsApp('+919876543210'); toast.success('Test WhatsApp sent'); }} icon={MessageSquare} label="Send Test WhatsApp" color="emerald" />
                <ActionButton onClick={() => { settingsApi.testEmail('admin@avianguard.org'); toast.success('Test Email sent'); }} icon={Mail} label="Send Test Email" color="amber" />
              </div>
            </GlassCard>
          </div>
        );

      // ===================== 5. SENSOR CONFIGURATION =====================
      case 'sensors':
        return (
          <div className="space-y-4">
            <SectionTitle icon={Radio} title="Sensor Configuration" description="Manage sensor network parameters and connectivity" />
            <GlassCard>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Monitoring Interval (sec)"><TextInput value={sensor.interval} onChange={v => setSensor(p => ({ ...p, interval: v }))} type="number" /></FormField>
                <FormField label="Sampling Rate (sec)"><TextInput value={sensor.samplingRate} onChange={v => setSensor(p => ({ ...p, samplingRate: v }))} type="number" /></FormField>
                <FormField label="Offline Timeout (sec)"><TextInput value={sensor.offlineTimeout} onChange={v => setSensor(p => ({ ...p, offlineTimeout: v }))} type="number" /></FormField>
                <FormField label="Gateway Timeout (sec)"><TextInput value={sensor.gatewayTimeout} onChange={v => setSensor(p => ({ ...p, gatewayTimeout: v }))} type="number" /></FormField>
                <FormField label="Auto Reconnect">
                  <ToggleSwitch enabled={sensor.autoReconnect} onChange={v => setSensor(p => ({ ...p, autoReconnect: v }))} />
                </FormField>
                <FormField label="Auto Calibration">
                  <ToggleSwitch enabled={sensor.autoCalibration} onChange={v => setSensor(p => ({ ...p, autoCalibration: v }))} />
                </FormField>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/[0.06]">
                <PrimaryButton onClick={handleSensorSave} icon={Save}>Save Configuration</PrimaryButton>
                <ActionButton onClick={handleRestartSensors} icon={RotateCcw} label="Restart All Sensors" color="red" />
                <ActionButton onClick={() => { settingsApi.testSensorConnection(); toast.success('Sensor connection test passed'); }} icon={Wifi} label="Test Sensor Connection" color="blue" />
                <ActionButton onClick={() => { settingsApi.resyncSensorNetwork(); toast.success('Sensor network resynced'); }} icon={RefreshCw} label="Resync Sensor Network" color="amber" />
              </div>
            </GlassCard>
          </div>
        );

      // ===================== 6. USER & SECURITY =====================
      case 'security':
        return (
          <div className="space-y-4">
            <SectionTitle icon={Shield} title="User & Security" description="Configure authentication, sessions, and access control" />
            <GlassCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Minimum Password Length"><TextInput value={security.minPasswordLength} onChange={v => setSecurity(p => ({ ...p, minPasswordLength: v }))} type="number" /></FormField>
                <FormField label="Session Timeout (min)"><TextInput value={security.sessionTimeout} onChange={v => setSecurity(p => ({ ...p, sessionTimeout: v }))} type="number" /></FormField>
                <FormField label="Two Factor Authentication">
                  <ToggleSwitch enabled={security.twoFactor} onChange={v => setSecurity(p => ({ ...p, twoFactor: v }))} />
                </FormField>
                <FormField label="Login Attempt Limit"><TextInput value={security.loginAttempts} onChange={v => setSecurity(p => ({ ...p, loginAttempts: v }))} type="number" /></FormField>
                <FormField label="IP Restriction">
                  <ToggleSwitch enabled={security.ipRestriction} onChange={v => setSecurity(p => ({ ...p, ipRestriction: v }))} />
                </FormField>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/[0.06]">
                <PrimaryButton onClick={handleSecuritySave} icon={Save}>Save Security Settings</PrimaryButton>
                <ActionButton onClick={handleForceLogout} icon={LogOut} label="Force Logout All Users" color="red" />
                <ActionButton onClick={handleGenerateToken} icon={Key} label="Generate API Token" color="emerald" />
                <ActionButton onClick={handleRevokeTokens} icon={EyeOff} label="Revoke Tokens" color="red" />
              </div>
            </GlassCard>
          </div>
        );

      // ===================== 7. SYSTEM HEALTH =====================
      case 'system':
        return (
          <div className="space-y-4">
            <SectionTitle icon={Server} title="System Health" description="Real-time status of platform infrastructure" />
            <GlassCard>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <HealthRow icon={Server} label="Backend Status" value={systemHealth.backend} />
                <HealthRow icon={Database} label="Database Status" value={systemHealth.database} />
                <HealthRow icon={Globe} label="Cloud Status" value={systemHealth.cloud} />
                <HealthRow icon={Radio} label="MQTT Status" value={systemHealth.mqtt} />
                <HealthRow icon={Wifi} label="Socket Connection" value={systemHealth.socket} />
                <HealthRow icon={HardDrive} label="Storage Usage" value={systemHealth.storage} />
                <HealthRow icon={Cpu} label="Memory Usage" value={systemHealth.memory} />
                <HealthRow icon={Activity} label="CPU Usage" value={systemHealth.cpu} />
                <HealthRow icon={Clock} label="System Uptime" value={systemHealth.uptime} />
              </div>
              <div className="flex justify-end mt-5 pt-4 border-t border-white/[0.06]">
                <PrimaryButton onClick={handleRefreshHealth} icon={RefreshCw}>Refresh Status</PrimaryButton>
              </div>
            </GlassCard>
          </div>
        );

      // ===================== 8. INTEGRATIONS =====================
      case 'integrations':
        return (
          <div className="space-y-4">
            <SectionTitle icon={Link2} title="Integrations" description="Manage external service connections" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {integrations.map(int => (
                <GlassCard key={int.name}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/[0.04]">
                        <int.icon size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{int.name}</p>
                        <p className="text-[10px] text-gray-500">{int.desc}</p>
                      </div>
                    </div>
                    <Badge status={int.status} />
                  </div>
                  <div className="flex justify-end mt-3 pt-3 border-t border-white/[0.04]">
                    <ActionButton onClick={() => { toast.success(`${int.name} configuration opened`); }} icon={Settings} label="Configure" color="blue" />
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );

      // ===================== 9. BACKUP & RESTORE =====================
      case 'backup':
        return (
          <div className="space-y-4">
            <SectionTitle icon={Database} title="Backup & Restore" description="Manage system backups, restore points, and configuration" />
            <GlassCard>
              <div className="flex flex-wrap gap-3">
                <PrimaryButton onClick={handleCreateBackup} icon={Download}>Create Backup</PrimaryButton>
                <SecondaryButton onClick={handleDownloadBackup} icon={Download}>Download Backup</SecondaryButton>
                <SecondaryButton onClick={handleRestoreBackup} icon={Upload}>Restore Backup</SecondaryButton>
              </div>
              <div className="h-px bg-white/[0.06] my-5" />
              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={handleResetSystem} icon={AlertTriangle} label="Reset System" color="red" />
                <SecondaryButton onClick={handleExportConfig} icon={FileText}>Export Configuration</SecondaryButton>
                <SecondaryButton onClick={handleImportConfig} icon={Upload}>Import Configuration</SecondaryButton>
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Available Backups</h3>
              <div className="space-y-2">
                {[
                  { name: 'full-backup-2026-07-01.json', date: '2026-07-01 03:00', size: '2.4 GB' },
                  { name: 'full-backup-2026-06-30.json', date: '2026-06-30 03:00', size: '2.3 GB' },
                  { name: 'full-backup-2026-06-29.json', date: '2026-06-29 03:00', size: '2.3 GB' },
                ].map(b => (
                  <div key={b.name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <Database size={12} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-white">{b.name}</p>
                        <p className="text-[10px] text-gray-500">{b.date} · {b.size}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <ActionButton onClick={handleDownloadBackup} icon={Download} label="Download" color="blue" />
                      <ActionButton onClick={handleRestoreBackup} icon={Upload} label="Restore" color="amber" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        );

      // ===================== 10. AUDIT LOG =====================
      case 'audit':
        return (
          <div className="space-y-4">
            <SectionTitle icon={FileText} title="Audit Log" description="Track all configuration changes and administrative actions" />
            <GlassCard>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={auditSearch} onChange={e => setAuditSearch(e.target.value)}
                    placeholder="Search audit log..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
                  />
                </div>
                <select value={auditFilter} onChange={e => setAuditFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white outline-none focus:border-emerald-500/40 transition-all"
                >
                  <option value="">All Modules</option>
                  <option value="General">General</option>
                  <option value="AI Config">AI Config</option>
                  <option value="Alert Rules">Alert Rules</option>
                  <option value="Notifications">Notifications</option>
                  <option value="Sensors">Sensors</option>
                  <option value="Security">Security</option>
                  <option value="Backup">Backup</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left py-2 pr-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left py-2 px-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="text-left py-2 px-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="text-left py-2 px-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Module</th>
                      <th className="text-left py-2 px-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                      <th className="text-right py-2 pl-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {auditLogs.filter(l => {
                      const q = auditSearch.toLowerCase();
                      if (q && !l.action.toLowerCase().includes(q) && !l.user.toLowerCase().includes(q) && !l.module.toLowerCase().includes(q)) return false;
                      if (auditFilter && l.module !== auditFilter) return false;
                      return true;
                    }).map((log, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 pr-3 text-gray-500">{log.date}</td>
                        <td className="py-2.5 px-3 text-gray-300">{log.user}</td>
                        <td className="py-2.5 px-3 text-white">{log.action}</td>
                        <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-gray-400 text-[10px]">{log.module}</span></td>
                        <td className="py-2.5 px-3 text-gray-500">{log.ip}</td>
                        <td className="py-2.5 pl-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-emerald-400 bg-emerald-500/10">
                            <CheckCircle size={8} />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        );

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
            <Settings size={22} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="text-sm text-gray-400">Manage platform configuration, AI behavior, notifications, users and system preferences</p>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {/* ===== LEFT SIDEBAR ===== */}
        <div className="w-48 shrink-0 space-y-1">
          {CATEGORIES.map(cat => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <CatIcon size={15} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ===== CONTENT ===== */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== CONFIRM DIALOG ===== */}
      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title || ''}
        message={confirmState?.message || ''}
        confirmLabel={confirmState?.label || 'Confirm'}
        confirmColor={confirmState?.color || 'bg-red-500'}
        onConfirm={() => { confirmState?.onConfirm(); setConfirmState(null); }}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}

function HealthRow({ icon: Icon, label, value }: { icon: typeof Server; label: string; value: string }) {
  const isHealthy = value === 'connected' || value === 'healthy';
  const isPercent = value.includes('%');
  const isTime = value.includes('d');
  const status: 'healthy' | 'warning' | 'error' = isHealthy ? 'healthy' : isPercent || isTime ? 'healthy' : 'warning';
  const displayValue = isPercent || isTime || isHealthy ? value : `${value}`;
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02]">
      <div className="flex items-center gap-2.5">
        <Icon size={13} className="text-gray-500" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>{displayValue}</span>
        <Badge status={status} />
      </div>
    </div>
  );
}

function MapIcon(props: { size?: number; className?: string }) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
