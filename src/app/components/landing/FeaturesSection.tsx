import { motion } from 'motion/react';
import { Radio, Brain, Bell, Map, FileText, Users } from 'lucide-react';

const features = [
  {
    icon: Radio,
    title: 'Real-Time Monitoring',
    description: 'IoT sensors measure TDS, temperature, pH, and turbidity every 6 seconds.',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Brain,
    title: 'AI Prediction',
    description: 'ML models analyze data to predict environmental threats before they escalate.',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: Bell,
    title: 'Emergency Alerts',
    description: 'Instant SMS and WhatsApp notifications when critical thresholds are breached.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Map,
    title: 'Interactive Maps',
    description: 'Visualize sensor locations and wetland health status on an interactive map.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: FileText,
    title: 'Reports',
    description: 'Generate automated PDF reports with historical data and compliance documentation.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Users,
    title: 'Citizen Alert System',
    description: 'Register local residents to receive environmental alerts in their preferred language.',
    gradient: 'from-teal-500 to-emerald-600',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Key Features
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base">
            Everything you need to monitor, analyze, and protect wetland ecosystems.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative"
              >
                <div className="relative h-full p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300">
                  <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${feature.gradient} mb-4`}>
                    <Icon className="text-white" size={18} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
