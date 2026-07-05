import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { X, AlertTriangle, Activity, Droplets, Thermometer, Gauge, Radio, Battery, Wifi, Zap, Clock } from 'lucide-react';
import { subscribe, type IncomingAlert } from '@/services/alertSocket';

const TOAST_DURATION = 5000;

interface ToastItem {
  id: string;
  alert: IncomingAlert;
  dismissing: boolean;
}

const severityConfig: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500', label: 'Critical' },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-500', label: 'High' },
  MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500', label: 'Medium' },
  LOW: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500', label: 'Low' },
};

function getAlertIcon(type: string) {
  const icons: Record<string, typeof Activity> = {
    pH: Activity, temperature: Thermometer, tds: Droplets,
    dissolvedOxygen: Gauge, waterLevel: Radio, battery: Battery,
    offline: Wifi,
  };
  const key = Object.keys(icons).find(k => type.toLowerCase().includes(k.toLowerCase()));
  return key ? icons[key] : AlertTriangle;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export function AlertToastNotification() {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, dismissing: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const clearTimer = useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (t) { clearTimeout(t); timersRef.current.delete(id); }
  }, []);

  const startTimer = useCallback((id: string) => {
    clearTimer(id);
    timersRef.current.set(id, setTimeout(() => dismiss(id), TOAST_DURATION));
  }, [dismiss, clearTimer]);

  useEffect(() => {
    const unsub = subscribe((alert) => {
      const toastId = `toast-${alert.id}-${Date.now()}`;
      setToasts(prev => {
        if (prev.some(t => t.alert.id === alert.id && !t.dismissing)) return prev;
        return [...prev, { id: toastId, alert, dismissing: false }];
      });
      window.dispatchEvent(new CustomEvent('sensor:updated'));
    });
    return () => {
      unsub();
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    for (const toast of toasts) {
      if (!toast.dismissing && !timersRef.current.has(toast.id)) {
        startTimer(toast.id);
      }
    }
  }, [toasts, startTimer]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.slice(-5).map(item => {
        const sev = severityConfig[item.alert.severity] || severityConfig.LOW;
        const Icon = getAlertIcon(item.alert.alertType);
        return (
          <div
            key={item.id}
            onMouseEnter={() => clearTimer(item.id)}
            onMouseLeave={() => startTimer(item.id)}
            className={`pointer-events-auto bg-gray-950/95 backdrop-blur-sm border ${sev.border} rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
              item.dismissing ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100'
            }`}
          >
            <div className="flex">
              <div className={`w-1 shrink-0 ${
                item.alert.severity === 'CRITICAL' ? 'bg-red-500' :
                item.alert.severity === 'HIGH' ? 'bg-orange-500' :
                item.alert.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <div className="flex-1 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 rounded-lg ${sev.bg} shrink-0`}>
                      <Icon size={12} className={sev.color} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${sev.color}`}>
                          {sev.label}
                        </span>
                        <span className="text-[9px] text-gray-600">{item.alert.alertType}</span>
                      </div>
                      <p className="text-xs font-semibold text-white mt-0.5 truncate max-w-48">
                        {item.alert.sensorName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => dismiss(item.id)}
                    className="p-0.5 rounded hover:bg-white/[0.06] text-gray-600 hover:text-white transition-all shrink-0"
                  >
                    <X size={11} />
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
                  {item.alert.description}
                </p>

                <div className="flex items-center gap-1 mt-1.5">
                  <Clock size={9} className="text-gray-600" />
                  <span className="text-[9px] text-gray-600">{formatTime(item.alert.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => {
                      dismiss(item.id);
                      navigate('/dashboard/alerts', { state: { highlightAlert: item.alert.id } });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/10"
                  >
                    <Zap size={10} /> View Alert
                  </button>
                  <button
                    onClick={() => dismiss(item.id)}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-medium text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
