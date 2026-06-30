import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Radio, Brain, Bell, BarChart3, Bird, FileText, Cloud, Users, ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Radio,
    title: 'Real-Time Monitoring',
    description: 'Continuous data collection from IoT sensors measuring TDS, temperature, pH, and more — updated every 6 seconds.',
    gradient: 'from-emerald-500 to-emerald-600',
    glow: 'shadow-emerald-500/10',
  },
  {
    icon: Brain,
    title: 'AI Prediction',
    description: 'Machine learning models analyze patterns to predict environmental threats before they become critical emergencies.',
    gradient: 'from-blue-500 to-blue-600',
    glow: 'shadow-blue-500/10',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Multi-channel alert system that notifies stakeholders via SMS, email, and platform notifications when thresholds are breached.',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/10',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    description: 'Beautiful real-time charts and visualizations that make complex environmental data easy to understand at a glance.',
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/10',
  },
  {
    icon: Bird,
    title: 'Bird Detection',
    description: 'AI-powered camera integration identifies migratory bird species and tracks population changes across protected wetlands.',
    gradient: 'from-teal-500 to-emerald-600',
    glow: 'shadow-teal-500/10',
  },
  {
    icon: FileText,
    title: 'PDF Reports',
    description: 'Automatically generate comprehensive PDF reports with historical data, trends, and compliance documentation.',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/10',
  },
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description: 'All sensor data is securely stored in the cloud with Firebase, enabling access from anywhere with internet connectivity.',
    gradient: 'from-sky-500 to-indigo-600',
    glow: 'shadow-sky-500/10',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Granular access controls for Admins, Forest Officers, and Researchers — each role sees exactly what they need.',
    gradient: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/10',
  },
];

export function FeaturesSection() {
  const navigate = useNavigate();

  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
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
            Platform Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Protect Wetlands
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base lg:text-lg">
            A comprehensive suite of tools designed for modern wetland conservation and environmental monitoring.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full p-6 lg:p-7 rounded-2xl border border-white/[0.06] bg-black/40 backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow} mb-5`}>
                    <Icon className="text-white" size={22} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors group/link"
          >
            See all features in action
            <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
