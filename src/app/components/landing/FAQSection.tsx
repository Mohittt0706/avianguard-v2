import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'What is AvianGuard?',
    a: 'AvianGuard is an AI-powered wetland monitoring and early warning system that uses IoT sensors, machine learning, and real-time dashboards to protect wetland ecosystems from environmental threats.',
  },
  {
    q: 'How does the sensor system work?',
    a: 'IoT sensors deployed in wetlands continuously measure water quality parameters (TDS, pH, temperature). Data is transmitted via ESP32 microcontrollers to the cloud, where AI models analyze it for anomalies.',
  },
  {
    q: 'Who can use AvianGuard?',
    a: 'AvianGuard is designed for forest departments, environmental researchers, government agencies, NGOs, and local communities — anyone involved in wetland conservation and monitoring.',
  },
  {
    q: 'What parameters does it monitor?',
    a: 'The system currently monitors Total Dissolved Solids (TDS), water temperature, and pH levels. Additional sensors for turbidity, dissolved oxygen, and nitrate levels are in development.',
  },
  {
    q: 'How accurate are the AI predictions?',
    a: 'Our AI models achieve over 99% accuracy in anomaly detection and risk prediction, trained on extensive environmental datasets and continuously improved through machine learning.',
  },
  {
    q: 'What happens when an alert is triggered?',
    a: 'When sensor readings exceed safety thresholds, the system sends instant notifications via SMS, email, and in-app alerts to designated stakeholders for immediate action.',
  },
  {
    q: 'Can I export data for reports?',
    a: 'Yes, AvianGuard supports automated PDF report generation with historical data, trend analysis, and compliance documentation suitable for regulatory submissions.',
  },
  {
    q: 'Is the system accessible remotely?',
    a: 'Yes, all data is stored securely in the cloud via Firebase, enabling real-time access from anywhere with an internet connection through our web dashboard.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-sm mb-5">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className={`rounded-xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'
                  }`}>
                    {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
