import { useState, useCallback, useRef, type ReactNode } from 'react';
import type { Coordinates, MapViewport } from './types';
import { initialViewport } from './data';

interface MapContainerProps {
  children: (renderProps: MapRenderProps) => ReactNode;
  viewport?: MapViewport;
  onViewportChange?: (vp: MapViewport) => void;
  className?: string;
}

export interface MapRenderProps {
  project: (coords: Coordinates) => { x: number; y: number };
  viewport: MapViewport;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  flyTo: (coords: Coordinates, zoom?: number) => void;
}

export function MapContainer({ children, className = '' }: MapContainerProps) {
  const [viewport, setViewport] = useState<MapViewport>(initialViewport);
  const mapRef = useRef<HTMLDivElement>(null);

  const project = useCallback(
    (coords: Coordinates) => {
      const { bounds } = viewport;
      const x = ((coords.lng - bounds.west) / (bounds.east - bounds.west)) * 100;
      const y = ((bounds.north - coords.lat) / (bounds.north - bounds.south)) * 100;
      return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    },
    [viewport],
  );

  const zoomIn = useCallback(() => {
    setViewport(prev => {
      const factor = 0.3;
      const dlat = (prev.bounds.north - prev.bounds.south) * factor * 0.5;
      const dlng = (prev.bounds.east - prev.bounds.west) * factor * 0.5;
      return {
        ...prev,
        zoom: Math.min(prev.zoom + 1, 14),
        bounds: {
          north: prev.bounds.north - dlat,
          south: prev.bounds.south + dlat,
          east: prev.bounds.east - dlng,
          west: prev.bounds.west + dlng,
        },
      };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => {
      const factor = 0.3;
      const dlat = (prev.bounds.north - prev.bounds.south) * factor * 0.5;
      const dlng = (prev.bounds.east - prev.bounds.west) * factor * 0.5;
      return {
        ...prev,
        zoom: Math.max(prev.zoom - 1, 4),
        bounds: {
          north: prev.bounds.north + dlat,
          south: prev.bounds.south - dlat,
          east: prev.bounds.east + dlng,
          west: prev.bounds.west - dlng,
        },
      };
    });
  }, []);

  const resetView = useCallback(() => {
    setViewport(initialViewport);
  }, []);

  const flyTo = useCallback((coords: Coordinates, zoom?: number) => {
    const size = zoom ? 5 / zoom : 1.5;
    setViewport({
      center: coords,
      zoom: zoom ?? 9,
      bounds: {
        north: coords.lat + size,
        south: coords.lat - size,
        east: coords.lng + size,
        west: coords.lng - size,
      },
    });
  }, []);

  const renderProps: MapRenderProps = {
    project,
    viewport,
    zoomIn,
    zoomOut,
    resetView,
    flyTo,
  };

  const { bounds } = viewport;
  const latStep = 0.02;
  const lngStep = 0.02;
  const latLines: number[] = [];
  const lngLines: number[] = [];
  for (let lat = Math.ceil(bounds.south / latStep) * latStep; lat <= bounds.north; lat += latStep) {
    latLines.push(lat);
  }
  for (let lng = Math.ceil(bounds.west / lngStep) * lngStep; lng <= bounds.east; lng += lngStep) {
    lngLines.push(lng);
  }

  const toXPct = (lng: number) => ((lng - bounds.west) / (bounds.east - bounds.west)) * 100;
  const toYPct = (lat: number) => ((bounds.north - lat) / (bounds.north - bounds.south)) * 100;

  const lakeCenter = project({ lat: 22.81, lng: 72.04 });
  const lakeRx = 12;
  const lakeRy = 8;

  return (
    <div
      ref={mapRef}
      className={`relative w-full bg-[#1a1d23] rounded-xl border border-white/[0.08] overflow-hidden ${className}`}
    >
      {/* Base landscape */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse at ${lakeCenter.x}% ${lakeCenter.y}%, rgba(16,185,129,0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 30% 70%, rgba(34,197,94,0.04) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 30%, rgba(34,197,94,0.03) 0%, transparent 40%),
            linear-gradient(180deg, #1a1d23 0%, #1e2229 50%, #1a1d23 100%)
          `,
        }} />
      </div>

      {/* Road network */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M 30,0 Q 40,30 50,50 T 70,100" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6" />
        <path d="M 0,40 Q 25,45 50,50 T 100,55" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6" />
        <path d="M 40,0 Q 45,25 50,50 T 60,100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.4" strokeDasharray="1,1.5" />
        <path d="M 0,60 Q 30,55 50,50 T 100,45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.4" strokeDasharray="1,1.5" />
      </svg>

      {/* Nal Sarovar water body */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${lakeCenter.x - lakeRx}%`,
          top: `${lakeCenter.y - lakeRy}%`,
          width: `${lakeRx * 2}%`,
          height: `${lakeRy * 2}%`,
          borderRadius: '40% 60% 50% 50% / 45% 50% 50% 55%',
          background: 'radial-gradient(ellipse, rgba(14,116,144,0.25) 0%, rgba(14,116,144,0.08) 60%, transparent 80%)',
          border: '1px solid rgba(14,116,144,0.2)',
          boxShadow: 'inset 0 0 40px rgba(14,116,144,0.1)',
        }}
      >
        <div className="absolute inset-0" style={{
          background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 20px, rgba(255,255,255,0.02) 20px, rgba(255,255,255,0.02) 21px)',
        }} />
      </div>

      {/* Lat/Lng grid lines */}
      {latLines.map(lat => {
        const y = toYPct(lat);
        return (
          <div key={`lat-${lat}`} className="absolute left-0 right-0 pointer-events-none" style={{ top: `${y}%` }}>
            <div className="absolute inset-x-0 border-t border-white/[0.04]" />
          </div>
        );
      })}
      {lngLines.map(lng => {
        const x = toXPct(lng);
        return (
          <div key={`lng-${lng}`} className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${x}%` }}>
            <div className="absolute inset-y-0 border-l border-white/[0.04]" />
          </div>
        );
      })}

      {/* Lat labels */}
      <div className="absolute top-1 left-2 z-10 text-[8px] text-gray-600 font-mono pointer-events-none">
        {bounds.north.toFixed(2)}°N
      </div>
      <div className="absolute bottom-1 left-2 z-10 text-[8px] text-gray-600 font-mono pointer-events-none">
        {bounds.south.toFixed(2)}°N
      </div>

      {/* Lng labels */}
      <div className="absolute bottom-1 left-2 z-10 text-[8px] text-gray-600 font-mono pointer-events-none">
        {bounds.west.toFixed(2)}°E
      </div>
      <div className="absolute bottom-1 right-2 z-10 text-[8px] text-gray-600 font-mono pointer-events-none">
        {bounds.east.toFixed(2)}°E
      </div>

      {/* Children */}
      {children(renderProps)}
    </div>
  );
}
