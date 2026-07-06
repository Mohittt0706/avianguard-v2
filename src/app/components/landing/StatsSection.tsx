import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Radio, Droplets, Users, Bell, Brain } from 'lucide-react';

interface Stat {
  icon: typeof Radio;
  label: string;
  value: number;
  suffix: string;
  gradient: string;
}

const stats: Stat[] = [
  { icon: Radio, label: 'Active Sensors', value: 128, suffix: '', gradient: 'from-emerald-500 to-emerald-600' },
  { icon: Droplets, label: 'Protected Wetlands', value: 24, suffix: '', gradient: 'from-blue-500 to-blue-600' },
  { icon: Users, label: 'Registered Citizens', value: 3412, suffix: '+', gradient: 'from-violet-500 to-purple-600' },
  { icon: Bell, label: 'Active Alerts', value: 156, suffix: '', gradient: 'from-amber-500 to-orange-600' },
  { icon: Brain, label: 'AI Accuracy', value: 97, suffix: '%', gradient: 'from-cyan-500 to-teal-600' },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Live System Status
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base">
            Real-time metrics from our wetland monitoring network
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="relative group"
              >
                <div className="relative h-full p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 text-center">
                  <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${stat.gradient} mb-3`}>
                    <Icon className="text-white" size={16} />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
