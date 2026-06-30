import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatusCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export function StatusCard({ title, value, icon: Icon, color, trend }: StatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-4"
    >
      <div className="p-4 rounded-full" style={{ backgroundColor: `${color}20` }}>
        <Icon size={32} style={{ color }} />
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        {trend && (
          <div className="text-xs mt-1">
            {trend === 'up' && <span className="text-green-500">↑ Increasing</span>}
            {trend === 'down' && <span className="text-red-500">↓ Decreasing</span>}
            {trend === 'stable' && <span className="text-gray-500">→ Stable</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
