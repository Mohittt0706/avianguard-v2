import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence } from 'motion/react';
import {
  Map, MapPin, Radio, Brain, Clock, Navigation, CheckCircle,
  Target, Droplets, Ruler, Activity, Wifi, Signal, Battery,
  Thermometer, TestTube, Gauge, Eye,
} from 'lucide-react';
import {
  MapContainer,
  type MapRenderProps,
  SensorMarker,
  StationPopup,
  MapToolbar,
  mockDataSource,
} from '../map';
import type { WetlandStation, Coordinates } from '../map';

const futureExpansions = [
  { name: 'Thol Lake', district: 'Mehsana', status: 'Planned' },
  { name: 'Khijadiya Bird Sanctuary', district: 'Jamnagar', status: 'Planned' },
  { name: 'Wadhvana Wetland', district: 'Vadodara', status: 'Planned' },
  { name: 'Narmada Estuary', district: 'Bharuch', status: 'Planned' },
];

export function MapsPage() {
  const navigate = useNavigate();
  const [stations] = useState<WetlandStation[]>(() =>
    (mockDataSource.getStations() as WetlandStation[]),
  );
  const [selectedStation, setSelectedStation] = useState<WetlandStation | null>(null);
  const flyToRef = useRef<(coords: Coordinates, zoom?: number) => void>(() => {});

  const healthyCount = stations.filter(s => s.status === 'healthy').length;
  const warningCount = stations.filter(s => s.status === 'warning').length;
  const criticalCount = stations.filter(s => s.status === 'critical').length;
  const totalSensors = stations.reduce(
    (sum, s) => sum + s.sensors.filter(sen => sen.label !== 'Battery').length, 0,
  );

  const popupSensors = selectedStation
    ? selectedStation.sensors.filter(s => s.label !== 'Battery')
    : [];

  return (
    <div className="space-y-4">

      {/* ===== PILOT DEPLOYMENT HEADER ===== */}
      <div className="bg-gradient-to-r from-emerald-500/[0.06] to-blue-500/[0.04] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MapPin size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Nal Sarovar — Pilot Deployment</h1>
              <p className="text-[11px] text-gray-500">Ahmedabad District · Sanand Taluka · Gujarat</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-400">System Active</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-gray-500">
              v2.1.0
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/[0.06]">
          {[
            { label: 'Monitoring Stations', value: `${stations.length} deployed`, icon: Radio, color: 'text-emerald-400' },
            { label: 'Connected Sensors', value: `${totalSensors} online`, icon: Activity, color: 'text-blue-400' },
            { label: 'Coverage Area', value: '~18 km²', icon: Ruler, color: 'text-cyan-400' },
            { label: 'AI Status', value: 'Healthy', icon: Brain, color: 'text-emerald-400' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2.5 bg-white/[0.03] rounded-lg border border-white/[0.06] px-3 py-2">
                <div className="p-1.5 rounded-lg bg-white/[0.04]">
                  <Icon size={13} className={s.color} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{s.value}</div>
                  <div className="text-[9px] text-gray-500">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== MAP + DEPLOYMENT SUMMARY ===== */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* MAP */}
        <div className="lg:col-span-3">
          <MapContainer className="aspect-[16/10]">
            {(renderProps: MapRenderProps) => {
              const { project, zoomIn, zoomOut, resetView, flyTo } = renderProps;
              flyToRef.current = flyTo;

              return (
                <>
                  {stations.map(station => (
                    <SensorMarker
                      key={station.id}
                      station={station}
                      isSelected={selectedStation?.id === station.id}
                      position={project(station.coordinates)}
                      visible={true}
                      onClick={() => {
                        setSelectedStation(station);
                        flyTo(station.coordinates, 12);
                      }}
                    />
                  ))}

                  <AnimatePresence>
                    {selectedStation && (
                      <div className="absolute top-3 left-3 z-20 w-72">
                        <div className="bg-[#1a1d23] border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden">
                          {/* Header */}
                          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.08]">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${
                                selectedStation.status === 'healthy' ? 'bg-emerald-500' :
                                selectedStation.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-white">{selectedStation.id}</div>
                                <div className="text-[10px] text-gray-500 truncate">{selectedStation.name}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedStation(null)}
                              className="p-1 rounded-md hover:bg-white/[0.08] transition-colors text-gray-500 hover:text-white shrink-0 ml-2"
                            >
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <path d="M2 2L11 11M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </button>
                          </div>

                          {/* Body */}
                          <div className="px-3.5 py-2.5 space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                              <MapPin size={10} className="text-gray-600" />
                              {selectedStation.coordinates.lat.toFixed(4)}°N, {selectedStation.coordinates.lng.toFixed(4)}°E
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              {popupSensors.map(s => {
                                const c = s.status === 'critical' ? 'text-red-400' : s.status === 'warning' ? 'text-amber-400' : 'text-emerald-400';
                                const bg = s.status === 'critical' ? 'bg-red-500/10' : s.status === 'warning' ? 'bg-amber-500/10' : 'bg-emerald-500/10';
                                return (
                                  <div key={s.label} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg ${bg}`}>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <s.icon size={9} className={c} />
                                      <span className="text-[9px] text-gray-500 truncate">{s.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-semibold ${c} shrink-0 ml-1`}>
                                      {s.value}{s.unit}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-gray-600 pt-1.5 border-t border-white/[0.06]">
                              <span className="flex items-center gap-1">
                                <Battery size={9} className={selectedStation.battery > 20 ? 'text-emerald-400' : 'text-red-400'} />
                                {selectedStation.battery}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Signal size={9} className={selectedStation.signal > 50 ? 'text-emerald-400' : 'text-amber-400'} />
                                {selectedStation.signal}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={9} />
                                {selectedStation.lastUpdated}
                              </span>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="px-3.5 py-2.5 border-t border-white/[0.06]">
                            <button
                              onClick={() => navigate('/dashboard/sensors')}
                              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all"
                            >
                              <Eye size={13} />
                              View Sensor Details
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Scale bar */}
                  <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 text-[8px] text-gray-600 bg-[#1a1d23]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-white/[0.06]">
                    <Ruler size={9} />
                    <span>1 km</span>
                    <div className="w-10 h-[2px] bg-gray-600 rounded" />
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 text-[8px] bg-[#1a1d23]/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                      <span className="text-gray-400">Healthy ({healthyCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                      <span className="text-gray-400">Warning ({warningCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                      <span className="text-gray-400">Critical ({criticalCount})</span>
                    </div>
                  </div>

                  <MapToolbar
                    onZoomIn={zoomIn}
                    onZoomOut={zoomOut}
                    onResetView={resetView}
                  />
                </>
              );
            }}
          </MapContainer>
        </div>

        {/* ===== DEPLOYMENT SUMMARY ===== */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="px-4 py-3 bg-emerald-500/[0.04] border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Deployment Summary</h2>
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              {[
                { label: 'District', value: 'Ahmedabad', icon: MapPin },
                { label: 'Taluka', value: 'Sanand', icon: MapPin },
                { label: 'Wetland', value: 'Nal Sarovar', icon: Droplets },
                { label: 'Stations', value: `${stations.length} deployed`, icon: Radio },
                { label: 'Sensors', value: `${totalSensors} online`, icon: Activity },
                { label: 'Coverage', value: '~18 km²', icon: Ruler },
                { label: 'AI Health', value: '87%', icon: Brain },
                { label: 'Last Sync', value: '3 sec ago', icon: Clock },
              ].map(d => {
                const Icon = d.icon;
                return (
                  <div key={d.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Icon size={11} className="text-gray-500" />
                      <span className="text-[11px] text-gray-400">{d.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-white">{d.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status summary */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Healthy', value: healthyCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: 'Warning', value: warningCount, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { label: 'Critical', value: criticalCount, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} ${s.border} rounded-lg border p-3 text-center`}>
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[9px] text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick link */}
          <button
            onClick={() => navigate('/dashboard/sensors')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all"
          >
            <Activity size={14} />
            View All Sensor Data
          </button>
        </div>
      </div>

      {/* ===== FUTURE EXPANSION ROADMAP ===== */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} className="text-amber-400" />
          <h2 className="text-sm font-bold text-white">Future Expansion Roadmap</h2>
          <span className="ml-auto text-[10px] text-gray-600">Phase 2 — Gujarat Wetland Monitoring Network</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {futureExpansions.map((site, i) => (
            <div
              key={site.name}
              className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{site.name}</div>
                    <div className="text-[10px] text-gray-500">{site.district} District</div>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                <span className="text-[10px] text-amber-400/70 font-medium">Planned — Phase 2</span>
              </div>
              {i < futureExpansions.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-1.5 -translate-y-1/2 z-10">
                  <div className="w-3 h-[2px] bg-white/[0.08]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
