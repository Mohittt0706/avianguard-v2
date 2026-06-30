import { useState } from 'react';
import { Layers, ChevronDown } from 'lucide-react';
import type { MapLayer } from './types';

interface LayerControlProps {
  layers: MapLayer[];
  onToggle: (layerId: string) => void;
}

export function LayerControl({ layers, onToggle }: LayerControlProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-20">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/70 backdrop-blur-sm border border-white/[0.08] text-xs text-gray-300 hover:text-white hover:border-white/[0.15] transition-all shadow-lg"
      >
        <Layers size={14} />
        Layers
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/[0.08] p-2 shadow-2xl">
          {layers.map(layer => {
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                onClick={() => onToggle(layer.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                  layer.visible
                    ? 'text-emerald-400 bg-emerald-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                    layer.visible
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-white/[0.15] bg-transparent'
                  }`}
                >
                  {layer.visible && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <Icon size={14} />
                {layer.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
