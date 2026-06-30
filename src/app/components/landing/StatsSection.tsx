import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Activity, Brain, Shield, Bell } from 'lucide-react';

const stats = [
  { icon: Activity, label: 'Prediction Accuracy', value: 99, suffix: '%', color: 'from-emerald-400 to-emerald-600', desc: 'AI model precision' },
  { icon: Shield, label: 'Sensors Supported', value: 500, suffix: '+', color: 'from-blue-400 to-blue-600', desc: 'IoT device compatibility' },
  { icon: Bell, label: 'Alerts Processed', value: 1000, suffix: '+', color: 'from-amber-400 to-orange-600', desc: 'And counting' },
  { icon: Brain, label: '24/7 Monitoring', value: 7, suffix: ' Days', color: 'from-cyan-400 to-blue-600', desc: 'Continuous protection' },
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export function StatsSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">Conservationists</span>
            {' '}Worldwide
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent rounded-2xl" />
                <div className="relative p-6 sm:p-8 rounded-2xl border border-white/[0.06] bg-black/40 backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 text-center">
                  <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg mb-4 mx-auto`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 tracking-tight">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{stat.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
