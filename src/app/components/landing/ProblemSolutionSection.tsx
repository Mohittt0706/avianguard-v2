import { motion } from 'motion/react';
import { AlertTriangle, Cpu, ArrowRight } from 'lucide-react';

export function ProblemSolutionSection() {
  return (
    <section id="problem" className="relative py-24 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 text-red-300 text-xs mb-5">
              <AlertTriangle size={12} />
              The Problem
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Wetlands are under threat
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Industrial runoff, pollution, and illegal dumping damage wetland ecosystems daily.
              Traditional monitoring is slow and manual — by the time issues are detected, 
              the damage is often irreversible.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-xs mb-5">
              <Cpu size={12} />
              Our Solution
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              AI + IoT real-time monitoring
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-6">
              AvianGuard deploys IoT sensors across wetlands to measure water quality,
              detect pollution, and track wildlife. AI analyzes the data in real-time 
              and sends instant alerts via SMS and WhatsApp.
            </p>
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <span>From detection to notification in seconds</span>
              <ArrowRight size={14} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
