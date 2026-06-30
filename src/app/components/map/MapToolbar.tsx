import { ZoomIn, ZoomOut, Maximize2, Minimize2, Compass } from 'lucide-react';
import { useState } from 'react';

interface MapToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function MapToolbar({ onZoomIn, onZoomOut, onResetView }: MapToolbarProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = (el: HTMLDivElement | null) => {
    if (!el) return;
    if (fullscreen) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const btn =
    'p-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/[0.08] text-gray-400 hover:text-white hover:bg-black/80 hover:border-white/[0.15] transition-all shadow-lg';

  return (
    <div ref={containerRef} className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
      <button onClick={onZoomIn} className={btn} title="Zoom in">
        <ZoomIn size={14} />
      </button>
      <button onClick={onZoomOut} className={btn} title="Zoom out">
        <ZoomOut size={14} />
      </button>
      <button onClick={onResetView} className={btn} title="Reset view">
        <Compass size={14} />
      </button>
      <button
        onClick={() => setFullscreen(!fullscreen)}
        className={btn}
        title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>
    </div>
  );
}
