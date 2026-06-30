import { motion } from 'motion/react';
import { Droplets, Bird, Skull, Radio, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

const problems = [
  {
    icon: Droplets,
    title: 'Water Contamination',
    description: 'Industrial runoff and agricultural waste are poisoning wetland ecosystems at an alarming rate, destroying natural habitats.',
    color: 'from-red-500 to-orange-600',
    gradient: 'from-red-500/10 to-orange-500/5',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/10',
  },
  {
    icon: Bird,
    title: 'Bird Extinction Threat',
    description: 'Migratory bird populations are declining rapidly as wetlands disappear. Over 40% of wetland-dependent species face extinction.',
    color: 'from-amber-500 to-yellow-600',
    gradient: 'from-amber-500/10 to-yellow-500/5',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/10',
  },
  {
    icon: Skull,
    title: 'Ecosystem Collapse',
    description: 'Without real-time intervention, entire wetland ecosystems risk irreversible damage, affecting biodiversity and local communities.',
    color: 'from-purple-500 to-pink-600',
    gradient: 'from-purple-500/10 to-pink-500/5',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/10',
  },
  {
    icon: Radio,
    title: 'No Real-Time Monitoring',
    description: 'Traditional monitoring methods are slow, manual and unreliable. By the time problems are detected, it is often too late to act.',
    color: 'from-cyan-500 to-blue-600',
    gradient: 'from-cyan-500/10 to-blue-500/5',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/10',
  },
];

export function ProblemSection() {
  const navigate = useNavigate();

  return (
    <section id="problem" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 lg:mb-24"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-red-300 text-sm mb-5">
            The Crisis
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Wetlands Are{' '}
            <span className="bg-gradient-to-r from-red-300 to-amber-300 bg-clip-text text-transparent">Disappearing</span>
            <br />
            Faster Than We Can Track
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base lg:text-lg">
            Every year, we lose millions of acres of wetlands. The impact on biodiversity, climate, and human communities is catastrophic — yet most monitoring is still done manually.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${problem.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`relative h-full p-6 lg:p-8 rounded-2xl border ${problem.border} bg-black/40 backdrop-blur-sm group-hover:bg-black/20 transition-all duration-300`}>
                  <div className={`inline-flex p-3 rounded-xl ${problem.iconBg} mb-5`}>
                    <Icon className="text-white" size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{problem.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{problem.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Learn how AvianGuard solves this
            <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
