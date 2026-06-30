import { Shield, AlertTriangle, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface ThreatIndicatorProps {
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
}

export function ThreatIndicator({ threatLevel, activeThreats }: ThreatIndicatorProps) {
  const getThreatConfig = () => {
    switch (threatLevel) {
      case 'none':
        return {
          color: '#10b981',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'No Threats',
          icon: Shield,
          pulse: false
        };
      case 'low':
        return {
          color: '#3b82f6',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          label: 'Low Risk',
          icon: Activity,
          pulse: false
        };
      case 'medium':
        return {
          color: '#f59e0b',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          label: 'Medium Risk',
          icon: AlertTriangle,
          pulse: true
        };
      case 'high':
        return {
          color: '#ef4444',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'High Risk',
          icon: AlertTriangle,
          pulse: true
        };
      case 'critical':
        return {
          color: '#dc2626',
          bgColor: 'bg-red-200',
          textColor: 'text-red-900',
          label: 'CRITICAL',
          icon: AlertTriangle,
          pulse: true
        };
    }
  };

  const config = getThreatConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`${config.bgColor} rounded-lg shadow-lg p-6`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={config.pulse ? 'animate-pulse' : ''}>
            <Icon size={48} style={{ color: config.color }} />
          </div>
          <div>
            <h3 className="text-2xl font-bold" style={{ color: config.color }}>
              {config.label}
            </h3>
            <p className={`text-sm ${config.textColor} mt-1`}>
              {activeThreats} active threat{activeThreats !== 1 ? 's' : ''} detected
            </p>
          </div>
        </div>
        {threatLevel !== 'none' && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`${config.bgColor} border-2 rounded-full px-4 py-2`}
            style={{ borderColor: config.color }}
          >
            <span className="text-2xl font-bold" style={{ color: config.color }}>
              !
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
