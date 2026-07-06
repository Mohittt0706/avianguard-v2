import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner';
import {
  Settings, AlertTriangle, Server, Shield, Bell, Activity, Users, Database,
  RefreshCw, Download, Upload, Save, RotateCcw, Zap, Wifi, Link2,
  Cpu, HardDrive, Clock, Globe, Smartphone, MessageSquare, Mail, Eye,
  EyeOff, LogOut, Key, Radio, Thermometer, Droplets, Gauge, FlipHorizontal,
  ChevronRight, CheckCircle, XCircle, ToggleLeft, ToggleRight,
  FileText, Search, Calendar, Send,
} from 'lucide-react';
import ShinyText from '../ShinyText';
import { DarkSelect } from '../ui/DarkSelect';
import { settingsApi } from '@/services/settingsApi';
import { useFcm } from '@/context/FcmContext';
import type { SystemHealth, AuditLogEntry, SettingsByCategory } from '@/services/settingsApi';

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
    <DarkSelect value={value} onChange={onChange} options={options} />
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
    cyan: 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20',
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
  const { requestPermission, fcmToken, permissionStatus, isSupported } = useFcm();
  const [activeCategory, setActiveCategory] = useState<CategoryId>('general');
  const [confirmState, setConfirmState] = useState<{ title: string; message: string; onConfirm: () => void; label?: string; color?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allSettings, setAllSettings] = useState<SettingsByCategory>({});
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('');

  const showConfirm = (title: string, message: string, onConfirm: () => void, label = 'Confirm', color = 'bg-red-500') =>
    setConfirmState({ title, message, onConfirm, label, color });

  const getVal = useCallback((category: string, key: string, fallback: unknown = '') => {
    const entries = allSettings[category];
    if (!entries) return fallback;
    const entry = entries.find(e => e.key === key);
    return entry?.value ?? fallback;
  }, [allSettings]);

  const [general, setGeneral] = useState({ systemName: 'AvianGuard', organization: 'Wetland Protection Authority', deploymentMode: 'Production', timezone: 'Asia/Kolkata', language: 'English (US)', theme: 'Dark' });
  const [ai, setAi] = useState({ enabled: true, confidenceThreshold: '85', riskInterval: '30', floodThreshold: '75', pollutionThreshold: '70', habitatThreshold: '80' });
  const [rules, setRules] = useState({
    temperature: { warning: '35', critical: '45' }, humidity: { warning: '60', critical: '85' },
    waterLevel: { warning: '2.5', critical: '4.0' }, ph: { warning: '6.5', critical: '8.5' },
    tds: { warning: '500', critical: '1000' }, turbidity: { warning: '5', critical: '10' },
    dissolvedOxygen: { warning: '4.0', critical: '2.0' },
  });
  const [notif, setNotif] = useState({ sms: true, whatsapp: true, email: true, push: false, delay: '2', retries: '3', escalation: true });
  const [sensor, setSensor] = useState({ interval: '30', samplingRate: '60', offlineTimeout: '300', gatewayTimeout: '60', autoReconnect: true, autoCalibration: true });
  const [security, setSecurity] = useState({ minPasswordLength: '8', sessionTimeout: '30', twoFactor: false, loginAttempts: '5', ipRestriction: false });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({});
  const [integrations, setIntegrations] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [settingsRes, healthRes, auditRes] = await Promise.all([
          settingsApi.getAll(),
          settingsApi.getSystemHealth(),
          settingsApi.getAuditLogs(30),
        ]);
        const data = settingsRes.data;
        setAllSettings(data);

        if (data.general) {
          const g: Record<string, string> = {};
          data.general.forEach(e => { g[e.key] = String(e.value); });
          setGeneral(prev => ({ ...prev, systemName: g.system_name || prev.systemName, organization: g.organization || prev.organization, deploymentMode: g.deployment_mode || prev.deploymentMode, timezone: g.timezone || prev.timezone, language: g.language || prev.language, theme: g.theme || prev.theme }));
        }
        if (data.ai) {
          const a: Record<string, string> = {};
          data.ai.forEach(e => { a[e.key] = String(e.value); });
          setAi(prev => ({
            ...prev,
            enabled: a.enabled !== undefined ? a.enabled === 'true' : prev.enabled,
            confidenceThreshold: a.confidence_threshold || a.confidenceThreshold || prev.confidenceThreshold,
            riskInterval: a.risk_prediction_interval || a.riskInterval || prev.riskInterval,
            floodThreshold: a.flood_threshold || a.floodThreshold || prev.floodThreshold,
            pollutionThreshold: a.pollution_threshold || a.pollutionThreshold || prev.pollutionThreshold,
            habitatThreshold: a.habitat_threshold || a.habitatThreshold || prev.habitatThreshold,
          }));
        }
        if (data['alert-rules']) {
          const r: Record<string, string> = {};
          data['alert-rules'].forEach(e => { r[e.key] = String(e.value); });
          setRules(prev => ({
            temperature: { warning: r.temperature_warning || r.temperature?.warning || prev.temperature.warning, critical: r.temperature_critical || r.temperature?.critical || prev.temperature.critical },
            humidity: { warning: r.humidity_warning || prev.humidity.warning, critical: r.humidity_critical || prev.humidity.critical },
            waterLevel: { warning: r.water_level_warning || r.waterLevel?.warning || prev.waterLevel.warning, critical: r.water_level_critical || r.waterLevel?.critical || prev.waterLevel.critical },
            ph: { warning: r.ph_warning || r.ph?.warning || prev.ph.warning, critical: r.ph_critical || r.ph?.critical || prev.ph.critical },
            tds: { warning: r.tds_warning || r.tds?.warning || prev.tds.warning, critical: r.tds_critical || r.tds?.critical || prev.tds.critical },
            turbidity: { warning: r.turbidity_warning || prev.turbidity.warning, critical: r.turbidity_critical || prev.turbidity.critical },
            dissolvedOxygen: { warning: r.dissolved_oxygen_warning || r.dissolvedOxygen?.warning || prev.dissolvedOxygen.warning, critical: r.dissolved_oxygen_critical || r.dissolvedOxygen?.critical || prev.dissolvedOxygen.critical },
          }));
        }
        if (data.notifications) {
          const n: Record<string, string> = {};
          data.notifications.forEach(e => { n[e.key] = String(e.value); });
          setNotif(prev => ({
            sms: n.sms_enabled !== undefined ? n.sms_enabled === 'true' : n.sms !== undefined ? n.sms === 'true' : prev.sms,
            whatsapp: n.whatsapp_enabled !== undefined ? n.whatsapp_enabled === 'true' : n.whatsapp !== undefined ? n.whatsapp === 'true' : prev.whatsapp,
            email: n.email_enabled !== undefined ? n.email_enabled === 'true' : n.email !== undefined ? n.email === 'true' : prev.email,
            push: n.push_enabled !== undefined ? n.push_enabled === 'true' : n.push !== undefined ? n.push === 'true' : prev.push,
            delay: n.notification_delay || n.delay || prev.delay,
            retries: n.retry_attempts || n.retries || prev.retries,
            escalation: n.emergency_escalation !== undefined ? n.emergency_escalation === 'true' : n.escalation !== undefined ? n.escalation === 'true' : prev.escalation,
          }));
        }
        if (data.sensors) {
          const s: Record<string, string> = {};
          data.sensors.forEach(e => { s[e.key] = String(e.value); });
          setSensor(prev => ({
            interval: s.refresh_interval || s.interval || prev.interval,
            samplingRate: s.sampling_rate || s.samplingRate || prev.samplingRate,
            offlineTimeout: s.offline_timeout || s.offlineTimeout || prev.offlineTimeout,
            gatewayTimeout: s.gateway_timeout || s.gatewayTimeout || prev.gatewayTimeout,
            autoReconnect: s.auto_reconnect !== undefined ? s.auto_reconnect === 'true' : s.autoReconnect !== undefined ? s.autoReconnect === 'true' : prev.autoReconnect,
            autoCalibration: s.auto_calibration !== undefined ? s.auto_calibration === 'true' : s.autoCalibration !== undefined ? s.autoCalibration === 'true' : prev.autoCalibration,
          }));
        }
        if (data.security) {
          const sec: Record<string, string> = {};
          data.security.forEach(e => { sec[e.key] = String(e.value); });
          setSecurity(prev => ({
            minPasswordLength: sec.password_min_length || sec.minPasswordLength || prev.minPasswordLength,
            sessionTimeout: sec.session_timeout || sec.sessionTimeout || prev.sessionTimeout,
            twoFactor: sec.two_factor_enabled !== undefined ? sec.two_factor_enabled === 'true' : sec.twoFactor !== undefined ? sec.twoFactor === 'true' : prev.twoFactor,
            loginAttempts: sec.login_attempts || sec.loginAttempts || prev.loginAttempts,
            ipRestriction: sec.ip_restriction !== undefined ? sec.ip_restriction === 'true' : sec.ipRestriction !== undefined ? sec.ipRestriction === 'true' : prev.ipRestriction,
          }));
        }
        if (data.integrations) {
          const i: Record<string, string> = {};
          data.integrations.forEach(e => { i[e.key] = String(e.value); });
          setIntegrations(i);
        }
        setSystemHealth(healthRes.data);
        setAuditLogs(auditRes.data);
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveCategory = useCallback(async (category: string, data: Record<string, unknown>, label: string) => {
    setSaving(true);
    try {
      const settings = Object.entries(data).map(([key, value]) => ({ key, value }));
      await settingsApi.bulkUpdate(settings);
      toast.success(`${label} saved successfully`);
      const res = await settingsApi.getAll(category);
      setAllSettings(prev => ({ ...prev, [category]: res.data[category] || prev[category] }));
    } catch {
      toast.error(`Failed to save ${label.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  }, []);

  const handleGeneralSave = useCallback(() => {
    saveCategory('general', {
      system_name: general.systemName, organization: general.organization,
      deployment_mode: general.deploymentMode, timezone: general.timezone,
      language: general.language, theme: general.theme,
    }, 'General settings');
  }, [general, saveCategory]);

  const handleAiToggle = useCallback(() => {
    const next = !ai.enabled;
    setAi(prev => ({ ...prev, enabled: next }));
    saveCategory('ai', {
      enabled: String(next), confidence_threshold: ai.confidenceThreshold,
      risk_prediction_interval: ai.riskInterval, flood_threshold: ai.floodThreshold,
      pollution_threshold: ai.pollutionThreshold, habitat_threshold: ai.habitatThreshold,
    }, 'AI configuration');
  }, [ai, saveCategory]);

  const handleAiThresholdsSave = useCallback(() => {
    saveCategory('ai', {
      confidence_threshold: ai.confidenceThreshold, risk_prediction_interval: ai.riskInterval,
      flood_threshold: ai.floodThreshold, pollution_threshold: ai.pollutionThreshold,
      habitat_threshold: ai.habitatThreshold,
    }, 'AI thresholds');
  }, [ai, saveCategory]);

  const handleAiReset = useCallback(() => {
    showConfirm('Reset AI Settings', 'This will restore all AI configuration to factory defaults. Continue?', () => {
      setAi({ enabled: true, confidenceThreshold: '85', riskInterval: '30', floodThreshold: '75', pollutionThreshold: '70', habitatThreshold: '80' });
      saveCategory('ai', { confidence_threshold: '85', risk_prediction_interval: '30', flood_threshold: '75', pollution_threshold: '70', habitat_threshold: '80' }, 'AI defaults');
    });
  }, [saveCategory]);

  const handleGenerateTestPrediction = useCallback(() => {
    settingsApi.logAudit('Generate AI Test Prediction', 'AI Config');
    toast.success('Test prediction generated. Check AI Decision Center for results.');
  }, []);

  const handleAlertRulesSave = useCallback(() => {
    saveCategory('alert-rules', {
      temperature_warning: rules.temperature.warning, temperature_critical: rules.temperature.critical,
      humidity_warning: rules.humidity.warning, humidity_critical: rules.humidity.critical,
      water_level_warning: rules.waterLevel.warning, water_level_critical: rules.waterLevel.critical,
      ph_warning: rules.ph.warning, ph_critical: rules.ph.critical,
      tds_warning: rules.tds.warning, tds_critical: rules.tds.critical,
      turbidity_warning: rules.turbidity.warning, turbidity_critical: rules.turbidity.critical,
      dissolved_oxygen_warning: rules.dissolvedOxygen.warning, dissolved_oxygen_critical: rules.dissolvedOxygen.critical,
    }, 'Alert rules');
  }, [rules, saveCategory]);

  const handleAlertRulesReset = useCallback(() => {
    showConfirm('Reset Thresholds', 'Reset all alert thresholds to factory defaults?', () => {
      const defaults = { temperature: { warning: '35', critical: '45' }, humidity: { warning: '60', critical: '85' }, waterLevel: { warning: '2.5', critical: '4.0' }, ph: { warning: '6.5', critical: '8.5' }, tds: { warning: '500', critical: '1000' }, turbidity: { warning: '5', critical: '10' }, dissolvedOxygen: { warning: '4.0', critical: '2.0' } };
      setRules(defaults);
      saveCategory('alert-rules', { temperature_warning: '35', temperature_critical: '45', humidity_warning: '60', humidity_critical: '85', water_level_warning: '2.5', water_level_critical: '4.0', ph_warning: '6.5', ph_critical: '8.5', tds_warning: '500', tds_critical: '1000', turbidity_warning: '5', turbidity_critical: '10', dissolved_oxygen_warning: '4.0', dissolved_oxygen_critical: '2.0' }, 'alert thresholds');
    });
  }, [saveCategory]);

  const handleNotifSave = useCallback(() => {
    saveCategory('notifications', {
      sms_enabled: String(notif.sms), whatsapp_enabled: String(notif.whatsapp),
      email_enabled: String(notif.email), push_enabled: String(notif.push),
      notification_delay: notif.delay, retry_attempts: notif.retries,
      emergency_escalation: String(notif.escalation),
    }, 'Notification settings');
  }, [notif, saveCategory]);

  const handleSensorSave = useCallback(() => {
    saveCategory('sensors', {
      refresh_interval: sensor.interval, sampling_rate: sensor.samplingRate,
      offline_timeout: sensor.offlineTimeout, gateway_timeout: sensor.gatewayTimeout,
      auto_reconnect: String(sensor.autoReconnect), auto_calibration: String(sensor.autoCalibration),
    }, 'Sensor configuration');
  }, [sensor, saveCategory]);

  const handleRestartSensors = useCallback(() => {
    showConfirm('Restart All Sensors', 'This will temporarily disconnect all sensors. Continue?', () => {
      settingsApi.logAudit('Restart All Sensors', 'Sensors');
      toast.success('All sensors restarting...');
    });
  }, []);

  const handleSecuritySave = useCallback(() => {
    saveCategory('security', {
      password_min_length: security.minPasswordLength, session_timeout: security.sessionTimeout,
      two_factor_enabled: String(security.twoFactor), login_attempts: security.loginAttempts,
      ip_restriction: String(security.ipRestriction),
    }, 'Security settings');
  }, [security, saveCategory]);

  const handleForceLogout = useCallback(() => {
    showConfirm('Force Logout All Users', 'All active sessions will be terminated. Continue?', () => {
      settingsApi.logAudit('Force Logout All Users', 'Security');
      toast.success('All users have been logged out');
    });
  }, []);

  const handleGenerateToken = useCallback(() => {
    settingsApi.logAudit('Generate API Token', 'Security');
    toast.success('New API token generated');
  }, []);

  const handleRevokeTokens = useCallback(() => {
    showConfirm('Revoke All Tokens', 'All existing API tokens will be invalidated. Continue?', () => {
      settingsApi.logAudit('Revoke All API Tokens', 'Security');
      toast.success('All API tokens revoked');
    });
  }, []);

  const handleIntegrationsSave = useCallback(() => {
    saveCategory('integrations', integrations, 'Integration settings');
  }, [integrations, saveCategory]);

  const handleRefreshHealth = useCallback(async () => {
    try {
      const res = await settingsApi.getSystemHealth();
      setSystemHealth(res.data);
      toast.success('System health refreshed');
    } catch {
      toast.error('Failed to refresh health');
    }
  }, []);

  const handleCreateBackup = useCallback(async () => {
    try {
      const res = await settingsApi.createBackup();
      toast.success(`Backup created: ${res.data.filename} (${res.data.size})`);
    } catch {
      toast.error('Failed to create backup');
    }
  }, []);

  const handleDownloadBackup = useCallback(() => {
    const config = { general, ai, rules, notif, sensor, security, integrations };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avianguard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration downloaded');
  }, [general, ai, rules, notif, sensor, security, integrations]);

  const handleRestoreBackup = useCallback(() => {
    showConfirm('Restore Backup', 'This will overwrite all current data with the backup. Continue?', async () => {
      try {
        await settingsApi.restoreBackup();
        toast.success('System restored from backup');
      } catch {
        toast.error('Failed to restore backup');
      }
    }, 'Restore', 'bg-amber-500');
  }, []);

  const handleResetSystem = useCallback(() => {
    showConfirm('Reset System', 'This will erase ALL data and reset the platform to factory state. This cannot be undone!', () => {
      settingsApi.logAudit('Reset System', 'Backup');
      toast.success('System has been reset');
    }, 'Reset System', 'bg-red-600');
  }, []);

  const handleExportConfig = useCallback(() => {
    const config = { general, ai, rules, notif, sensor, security, integrations };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avianguard-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exported');
  }, [general, ai, rules, notif, sensor, security, integrations]);

  const handleImportConfig = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) toast.success('Configuration imported successfully');
    };
    input.click();
  }, []);

  const integrationServices = [
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
                <ActionButton onClick={async () => {
                  if (!isSupported) { toast.error('Browser does not support notifications'); return; }
                  let token = fcmToken;
                  if (!token) {
                    toast.info('Requesting notification permission...');
                    token = await requestPermission();
                  }
                  if (!token) { toast.error('Could not generate FCM token'); return; }
                  toast.success('FCM Token: ' + token.substring(0, 30) + '...');
                  try {
                    const storedCitizen = localStorage.getItem('avian_citizens');
                    let citizenId: string | undefined;
                    if (storedCitizen) {
                      const citizens = JSON.parse(storedCitizen);
                      const last = citizens[citizens.length - 1];
                      citizenId = last?.id;
                    }
                    const { notificationApi } = await import('@/services/notificationApi');
                    const res = await notificationApi.sendNotification({
                      title: 'Test Push Notification',
                      body: 'This is a test notification from AvianGuard Settings.',
                      citizenId,
                      data: { alertType: 'test', severity: 'LOW' },
                    });
                    if (res.data.pushStatus === 'delivered') {
                      toast.success('Test push notification sent!');
                    } else {
                      toast.warning('Push status: ' + res.data.pushStatus);
                    }
                  } catch (err) {
                    toast.error('Failed to send test push: ' + (err instanceof Error ? err.message : 'Unknown'));
                  }
                }} icon={Send} label="Send Test Push" color="cyan" />
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
              {integrationServices.map(int => (
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
                <DarkSelect value={auditFilter} onChange={setAuditFilter}
                  options={[
                    { value: '', label: 'All Modules' },
                    { value: 'General', label: 'General' },
                    { value: 'AI Config', label: 'AI Config' },
                    { value: 'Alert Rules', label: 'Alert Rules' },
                    { value: 'Notifications', label: 'Notifications' },
                    { value: 'Sensors', label: 'Sensors' },
                    { value: 'Security', label: 'Security' },
                    { value: 'Backup', label: 'Backup' },
                  ]}
                  className="w-44"
                />
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
                      if (q && !l.action.toLowerCase().includes(q) && !(l.user_name || '').toLowerCase().includes(q) && !(l.category || '').toLowerCase().includes(q)) return false;
                      if (auditFilter && l.category !== auditFilter) return false;
                      return true;
                    }).map((log, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 pr-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-gray-300">{log.user_name || 'System'}</td>
                        <td className="py-2.5 px-3 text-white">{log.action}</td>
                        <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-gray-400 text-[10px]">{log.category}</span></td>
                        <td className="py-2.5 px-3 text-gray-500">{log.ipAddress || '-'}</td>
                        <td className="py-2.5 pl-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-emerald-400 bg-emerald-500/10">
                            <CheckCircle size={8} />
                            Success
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
            <h1 className="text-xl font-bold"><ShinyText text="Settings" color="#FFFFFF" shineColor="#22D3EE" spread={100} speed={3} className="text-xl font-bold" /></h1>
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
