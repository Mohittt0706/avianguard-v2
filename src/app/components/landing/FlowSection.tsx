import { motion } from 'motion/react';
import { Radio, Cpu, Cloud, Brain, LayoutDashboard, Bell, ArrowDown } from 'lucide-react';

const steps = [
  { icon: Radio, label: 'Sensors', color: '#10b981', desc: 'IoT sensor deployment' },
  { icon: Cpu, label: 'ESP32', color: '#3b82f6', desc: 'Microcontroller processing' },
  { icon: Cloud, label: 'Cloud', color: '#8b5cf6', desc: 'Data storage & sync' },
  { icon: Brain, label: 'AI', color: '#f59e0b', desc: 'Anomaly detection & prediction' },
  { icon: LayoutDashboard, label: 'Dashboard', color: '#06b6d4', desc: 'Real-time visualization' },
  { icon: Bell, label: 'Alerts', color: '#ef4444', desc: 'Instant notifications' },
];

export function FlowSection() {
  return (
    <section id="about" className="relative py-20 lg:py-28 overflow-hidden">
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
          <span className="inline-block px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-300 text-sm mb-5">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            How It <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base lg:text-lg">
            From sensor to alert — a seamless pipeline of data collection, analysis, and action.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:grid lg:grid-cols-6 gap-4 items-start">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 relative"
                    style={{ backgroundColor: `${step.color}15`, borderColor: `${step.color}40`, borderWidth: '1px' }}
                  >
                    <Icon size={28} style={{ color: step.color }} />
                    <div
                      className="absolute inset-0 rounded-2xl blur-sm opacity-20"
                      style={{ backgroundColor: step.color }}
                    />
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">{step.label}</div>
                  <div className="text-xs text-gray-500">{step.desc}</div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-7 text-gray-600">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="lg:hidden space-y-6 max-w-md mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="relative flex items-center gap-5"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${step.color}15`, borderColor: `${step.color}40`, borderWidth: '1px' }}
                    >
                      <Icon size={22} style={{ color: step.color }} />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-px h-8 my-1 bg-gradient-to-b from-white/10 to-transparent" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{step.label}</div>
                    <div className="text-xs text-gray-500">{step.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
