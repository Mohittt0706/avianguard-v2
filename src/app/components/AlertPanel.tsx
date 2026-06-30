import { AlertTriangle, CheckCircle, XCircle, Info, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  sensor: string;
  value: number;
  recommended_action: string;
}

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
}

export function AlertPanel({ alerts, onDismiss }: AlertPanelProps) {
  const activeAlerts = alerts.filter(a => a.type === 'critical' || a.type === 'warning');

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <XCircle size={24} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-orange-500" />;
      case 'info':
        return <Info size={24} className="text-blue-500" />;
      case 'success':
        return <CheckCircle size={24} className="text-green-500" />;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 border-l-4 border-l-red-500';
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/30 border-l-4 border-l-orange-500';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 border-l-4 border-l-blue-500';
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30 border-l-4 border-l-emerald-500';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-6 text-center">
        <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-emerald-300 mb-1">All Systems Normal</h3>
        <p className="text-sm text-emerald-400/70">No environmental threats detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className={activeAlerts.length > 0 ? 'text-red-400 animate-pulse' : 'text-gray-500'} size={24} />
          <h3 className="text-xl font-bold text-white">
            Active Alerts ({activeAlerts.length})
          </h3>
        </div>
        {activeAlerts.length > 0 && (
          <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full animate-pulse border border-red-500/30">
            ACTION REQUIRED
          </span>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`${getAlertStyles(alert.type)} rounded-lg p-4`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg text-white">{alert.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.timestamp.toLocaleString('en-US')}
                    </p>
                  </div>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-gray-500 hover:text-gray-300"
                    >
                      ×
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
                <div className="bg-black/30 rounded p-2 text-sm mb-2 text-gray-400">
                  <strong className="text-gray-300">Sensor:</strong> {alert.sensor} | <strong className="text-gray-300">Reading:</strong> {alert.value}
                </div>
                <div className="bg-black/20 rounded p-3 mt-3">
                  <p className="text-sm font-semibold text-gray-200 mb-1">Recommended Action:</p>
                  <p className="text-sm text-gray-400">{alert.recommended_action}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
