import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export function MetricCard({ icon: Icon, label, value, subtitle, color, trend }: MetricCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/[0.06] p-6 hover:border-white/[0.12] hover:bg-white/[0.07] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
        {trend && (
          <div className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-gray-400">
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'stable' && '→'} {trend}
          </div>
        )}
      </div>
      <div>
        <div className="text-sm text-gray-400 font-medium mb-1">{label}</div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </div>
  );
}
