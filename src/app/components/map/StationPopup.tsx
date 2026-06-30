import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { X, MapPin, Battery, Signal, Clock, Activity, Eye } from 'lucide-react';
import type { WetlandStation } from './types';

interface StationPopupProps {
  station: WetlandStation;
  onClose: () => void;
}

const statusConfig = {
  healthy: { label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
  warning: { label: 'Warning', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500' },
  critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500' },
  offline: { label: 'Offline', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', dot: 'bg-gray-500' },
};

function getSensorColor(s: string): string {
  switch (s) {
    case 'critical': return 'text-red-400';
    case 'warning': return 'text-amber-400';
    default: return 'text-emerald-400';
  }
}

function getSensorBg(s: string): string {
  switch (s) {
    case 'critical': return 'bg-red-500/10';
    case 'warning': return 'bg-amber-500/10';
    default: return 'bg-emerald-500/10';
  }
}

export function StationPopup({ station, onClose }: StationPopupProps) {
  const navigate = useNavigate();
  const cfg = statusConfig[station.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="w-72 bg-gray-900 border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden"
    >
      <div className={`px-4 py-2.5 flex items-center justify-between border-b ${cfg.border}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{station.id}</div>
            <div className="text-[10px] text-gray-400 truncate">{station.name}</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-white/[0.08] transition-colors text-gray-500 hover:text-white shrink-0 ml-2">
          <X size={13} />
        </button>
      </div>

      <div className="px-4 py-2.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <MapPin size={11} className="text-gray-500 shrink-0" />
          <span className="font-mono">{station.coordinates.lat.toFixed(4)}°N, {station.coordinates.lng.toFixed(4)}°E</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {station.sensors.filter(s => s.label !== 'Battery').map(s => (
            <div key={s.label} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg ${getSensorBg(s.status)}`}>
              <div className="flex items-center gap-1.5 min-w-0">
                <s.icon size={10} className={getSensorColor(s.status)} />
                <span className="text-[10px] text-gray-400 truncate">{s.label}</span>
              </div>
              <span className={`text-[11px] font-semibold ${getSensorColor(s.status)} shrink-0 ml-1`}>
                {s.value}{s.unit}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1.5 border-t border-white/[0.06]">
          <span className="flex items-center gap-1">
            <Battery size={10} className={station.battery > 20 ? 'text-emerald-400' : 'text-red-400'} />
            {station.battery}%
          </span>
          <span className="flex items-center gap-1">
            <Signal size={10} className={station.signal > 50 ? 'text-emerald-400' : 'text-amber-400'} />
            {station.signal}%
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {station.lastUpdated}
          </span>
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-white/[0.06]">
        <button
          onClick={() => navigate('/dashboard/sensors')}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all"
        >
          <Eye size={13} />
          View Sensor Details
        </button>
      </div>
    </motion.div>
  );
}
