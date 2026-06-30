import { motion } from 'motion/react';

interface CircularProgressProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  size?: number;
  warningThreshold?: number;
  dangerThreshold?: number;
}

export function CircularProgress({
  value,
  max,
  label,
  unit,
  color,
  size = 140,
  warningThreshold,
  dangerThreshold,
}: CircularProgressProps) {
  const percentage = (value / max) * 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine color based on thresholds
  let displayColor = color;
  if (dangerThreshold && value >= dangerThreshold) {
    displayColor = '#ef4444';
  } else if (warningThreshold && value >= warningThreshold) {
    displayColor = '#f59e0b';
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={displayColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={value}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold"
            style={{ color: displayColor }}
          >
            {value.toFixed(1)}
          </motion.div>
          <div className="text-xs text-gray-500 font-medium">{unit}</div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-300">{label}</div>
      </div>
    </div>
  );
}
