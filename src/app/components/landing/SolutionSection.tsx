import { motion } from 'motion/react';
import { Radio, Cpu, Cloud, Brain, LayoutDashboard, Bell } from 'lucide-react';

const steps = [
  { icon: Radio, label: 'Sensors', desc: 'IoT sensors deployed across wetlands collect real-time water quality data including TDS, pH, and temperature.', color: '#10b981', gradient: 'from-emerald-500/20 to-emerald-600/5' },
  { icon: Cpu, label: 'ESP32', desc: 'Microcontrollers process raw sensor data and transmit it securely to the cloud via Wi-Fi or cellular networks.', color: '#3b82f6', gradient: 'from-blue-500/20 to-blue-600/5' },
  { icon: Cloud, label: 'Cloud', desc: 'Data is stored, processed and synchronized in real-time using Firebase, enabling access from anywhere in the world.', color: '#8b5cf6', gradient: 'from-purple-500/20 to-purple-600/5' },
  { icon: Brain, label: 'AI Engine', desc: 'Machine learning models detect anomalies, predict environmental risks and generate actionable intelligence automatically.', color: '#f59e0b', gradient: 'from-amber-500/20 to-amber-600/5' },
  { icon: LayoutDashboard, label: 'Dashboard', desc: 'Intuitive dashboards visualize all metrics, trends and predictions in real-time for informed decision making.', color: '#06b6d4', gradient: 'from-cyan-500/20 to-cyan-600/5' },
  { icon: Bell, label: 'Alerts', desc: 'Instant emergency notifications via SMS, email and in-app alerts when critical thresholds are exceeded.', color: '#ef4444', gradient: 'from-red-500/20 to-red-600/5' },
];

export function SolutionSection() {
  return (
    <section id="solution" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 lg:mb-24"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-sm mb-5">
            Our Solution
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            From Sensor to{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">Alert</span>
            <br />
            In Real-Time
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base lg:text-lg">
            A seamless pipeline of data collection, AI analysis, and instant action — designed for wetlands.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[76px] left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-emerald-500/40 via-blue-500/40 to-red-500/40" />

          <div className="hidden lg:grid lg:grid-cols-6 gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${step.color}15`, borderColor: `${step.color}40`, borderWidth: '1px' }}
                  >
                    <Icon size={28} style={{ color: step.color }} />
                    <div className="absolute inset-0 rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300" style={{ backgroundColor: step.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{step.label}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="lg:hidden space-y-5 max-w-lg mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="relative flex items-start gap-4"
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
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-white mb-1">{step.label}</h3>
                    <p className="text-xs text-gray-500">{step.desc}</p>
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
