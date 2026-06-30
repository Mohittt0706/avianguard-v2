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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon size={24} style={{ color }} />
        </div>
        {trend && (
          <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'stable' && '→'} {trend}
          </div>
        )}
      </div>
      <div>
        <div className="text-sm text-gray-500 font-medium mb-1">{label}</div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </div>
  );
}
