import type { WetlandStation } from './types';

interface StationListProps {
  stations: WetlandStation[];
  selectedId: string | null;
  onSelect: (station: WetlandStation) => void;
  filter: string;
  onFilterChange: (v: string) => void;
}

const statusColors: Record<string, string> = {
  healthy: 'bg-emerald-400',
  warning: 'bg-orange-400',
  critical: 'bg-red-400',
  offline: 'bg-gray-500',
};

const typeLabels: Record<string, string> = {
  wetland: 'Wetland',
  'sensor-node': 'Sensor Node',
  'weather-station': 'Weather',
  'water-quality': 'Water Quality',
};

export function StationList({ stations, selectedId, onSelect, filter, onFilterChange }: StationListProps) {
  const filtered = stations.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.district.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="p-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white mb-2">Monitoring Stations</h3>
        <div className="relative">
          <input
            type="text"
            value={filter}
            onChange={e => onFilterChange(e.target.value)}
            placeholder="Search stations..."
            className="w-full px-3 py-1.5 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
          />
        </div>
      </div>
      <div className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500">No stations found</div>
        ) : (
          filtered.map(station => (
            <button
              key={station.id}
              onClick={() => onSelect(station)}
              className={`w-full flex items-center justify-between p-3 text-xs transition-all ${
                selectedId === station.id
                  ? 'bg-emerald-500/5 border-l-2 border-emerald-400'
                  : 'hover:bg-white/[0.04] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColors[station.status]} ${station.online ? '' : 'opacity-50'}`} />
                  {!station.online && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-[1.5px] bg-gray-400 rounded-full rotate-45" />
                    </div>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <div className="text-white font-medium truncate">{station.name}</div>
                  <div className="text-gray-500 mt-0.5">
                    {station.district} · {typeLabels[station.type] ?? station.type}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {station.alerts > 0 && (
                  <span className="text-[10px] text-red-400 font-medium">{station.alerts}</span>
                )}
                <span className="text-gray-500 text-[10px]">{station.lastUpdated}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
