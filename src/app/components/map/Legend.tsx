interface LegendItem {
  label: string;
  color: string;
  dot: string;
}

const items: LegendItem[] = [
  { label: 'Healthy', color: 'bg-emerald-400', dot: 'bg-emerald-400' },
  { label: 'Warning', color: 'bg-orange-400', dot: 'bg-orange-400' },
  { label: 'Critical', color: 'bg-red-400', dot: 'bg-red-400' },
  { label: 'Offline', color: 'bg-gray-500', dot: 'bg-gray-500' },
];

interface LegendProps {
  className?: string;
}

export function Legend({ className = '' }: LegendProps) {
  return (
    <div className={`flex items-center gap-3 text-[11px] bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/[0.06] ${className}`}>
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${item.dot}`} />
          <span className="text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
