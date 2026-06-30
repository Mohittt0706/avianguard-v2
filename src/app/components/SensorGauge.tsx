import { motion } from 'motion/react';

interface SensorGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  color: string;
  warningThreshold?: number;
  dangerThreshold?: number;
}

export function SensorGauge({
  value,
  min,
  max,
  unit,
  label,
  color,
  warningThreshold,
  dangerThreshold,
}: SensorGaugeProps) {

  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Determine gauge color based on thresholds
  let gaugeColor = color;
  if (dangerThreshold && value >= dangerThreshold) {
    gaugeColor = '#ef4444'; // red
  } else if (warningThreshold && value >= warningThreshold) {
    gaugeColor = '#f59e0b'; // orange
  }

  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="90"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <motion.circle
            cx="96"
            cy="96"
            r="90"
            stroke={gaugeColor}
            strokeWidth="12"
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
            key={Math.round(value * 10)}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold"
            style={{ color: gaugeColor }}
          >
            {value.toFixed(1)}
          </motion.div>
          <div className="text-sm text-gray-500 mt-1">{unit}</div>
        </div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-lg">{label}</div>
        <div className="text-xs text-gray-500">
          Range: {min} - {max} {unit}
        </div>
      </div>
    </div>
  );
}
