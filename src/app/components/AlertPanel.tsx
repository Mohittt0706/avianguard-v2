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
        return 'bg-red-50 border-red-300 border-l-4 border-l-red-500';
      case 'warning':
        return 'bg-orange-50 border-orange-300 border-l-4 border-l-orange-500';
      case 'info':
        return 'bg-blue-50 border-blue-300 border-l-4 border-l-blue-500';
      case 'success':
        return 'bg-green-50 border-green-300 border-l-4 border-l-green-500';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-800 mb-1">All Systems Normal</h3>
        <p className="text-sm text-green-600">No environmental threats detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className={activeAlerts.length > 0 ? 'text-red-500 animate-pulse' : 'text-gray-400'} size={24} />
          <h3 className="text-xl font-bold">
            Active Alerts ({activeAlerts.length})
          </h3>
        </div>
        {activeAlerts.length > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
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
            className={`${getAlertStyles(alert.type)} border rounded-lg p-4 shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{alert.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.timestamp.toLocaleString('en-US')}
                    </p>
                  </div>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                <div className="bg-white bg-opacity-50 rounded p-2 text-sm mb-2">
                  <strong>Sensor:</strong> {alert.sensor} | <strong>Reading:</strong> {alert.value}
                </div>
                <div className="bg-white bg-opacity-70 rounded p-3 mt-3">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Recommended Action:</p>
                  <p className="text-sm text-gray-700">{alert.recommended_action}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
