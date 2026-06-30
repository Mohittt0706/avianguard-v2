import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Activity, TrendingUp, Bell, Map, Brain, Droplets, Thermometer, TestTube } from 'lucide-react';

const mockCards = [
  { icon: Activity, label: 'Wetland Health', value: 'Excellent', color: '#10b981', change: '+2.4%' },
  { icon: Droplets, label: 'Water Quality', value: '234 ppm', color: '#3b82f6', change: '-1.2%' },
  { icon: Thermometer, label: 'Temperature', value: '26.3°C', color: '#f59e0b', change: '+0.8°C' },
  { icon: TestTube, label: 'pH Level', value: '7.2', color: '#8b5cf6', change: 'Stable' },
];

export function DashboardPreviewSection() {
  const navigate = useNavigate();

  return (
    <section id="preview" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 lg:mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-300 text-sm mb-5">
            Dashboard Preview
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            See Everything at a{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Glance</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base lg:text-lg">
            A powerful real-time dashboard that puts the health of your wetlands at your fingertips.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/3 via-transparent to-transparent pointer-events-none" />

          <div className="p-4 sm:p-6 lg:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-gray-300">System Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-amber-400" />
                <span className="text-xs text-gray-500">3 alerts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {mockCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${card.color}15` }}>
                        <Icon size={14} style={{ color: card.color }} />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500">{card.change}</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white">{card.value}</div>
                    <div className="text-[11px] text-gray-500">{card.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Trend Analysis</span>
              </div>
              <div className="h-32 sm:h-40 flex items-end gap-1 sm:gap-2">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${40 + Math.random() * 60}%`,
                        background: `linear-gradient(to top, rgba(16,185,129,${0.3 + Math.random() * 0.4}), rgba(59,130,246,${0.2 + Math.random() * 0.3}))`,
                        opacity: 0.6 + Math.random() * 0.4,
                      }}
                    />
                    {i % 4 === 0 && <span className="text-[8px] text-gray-600">{String(i).padStart(2, '0')}:00</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Map size={14} className="text-emerald-400" />
                  <span className="text-xs font-medium text-gray-300">Sensor Map</span>
                </div>
                <div className="aspect-video rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex p-2 rounded-lg bg-emerald-500/10 mb-2">
                      <Map size={20} className="text-emerald-400" />
                    </div>
                    <div className="text-xs text-gray-500">47 active sensors deployed</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={14} className="text-purple-400" />
                  <span className="text-xs font-medium text-gray-300">AI Prediction</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Risk Level</span>
                    <span className="text-emerald-400 font-medium">Low</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Next alert in</span>
                    <span className="text-gray-300">~4.5 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <button
            onClick={() => navigate('/login')}
            className="relative group inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full" />
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
            <span className="relative z-10 flex items-center gap-2">
              Explore Dashboard
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
