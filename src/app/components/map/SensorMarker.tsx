import { motion } from 'motion/react';
import type { WetlandStation } from './types';

interface SensorMarkerProps {
  station: WetlandStation;
  isSelected: boolean;
  position: { x: number; y: number };
  onClick: () => void;
  visible: boolean;
}

const config: Record<string, { color: string; glow: string; size: number }> = {
  healthy: { color: '#10b981', glow: 'rgba(16,185,129,0.6)', size: 12 },
  warning: { color: '#f59e0b', glow: 'rgba(245,158,11,0.6)', size: 12 },
  critical: { color: '#ef4444', glow: 'rgba(239,68,68,0.6)', size: 14 },
  offline: { color: '#6b7280', glow: 'rgba(107,114,128,0.3)', size: 10 },
};

export function SensorMarker({ station, isSelected, position, onClick, visible }: SensorMarkerProps) {
  if (!visible) return null;
  const cfg = config[station.status];

  return (
    <motion.button
      onClick={onClick}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.25 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      {/* Glow ring */}
      <div
        className={`absolute inset-0 rounded-full ${isSelected ? 'animate-ping' : ''}`}
        style={{
          backgroundColor: cfg.glow,
          width: cfg.size * 3,
          height: cfg.size * 3,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: isSelected ? 0.4 : 0.2,
        }}
      />

      {/* Marker dot */}
      <div
        className={`rounded-full shadow-lg relative z-10 ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1d23]' : ''}`}
        style={{
          width: cfg.size,
          height: cfg.size,
          backgroundColor: cfg.color,
          boxShadow: `0 0 ${isSelected ? 16 : 8}px ${cfg.glow}`,
        }}
      />

      {/* Label */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
        <div className="bg-[#1a1d23] text-white text-[10px] px-2.5 py-1.5 rounded-md border border-white/[0.12] whitespace-nowrap shadow-xl">
          <div className="font-semibold">{station.id}</div>
          <div className="text-gray-400 text-[9px] mt-0.5">{station.name}</div>
        </div>
      </div>
    </motion.button>
  );
}
