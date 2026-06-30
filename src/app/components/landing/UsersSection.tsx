import { motion } from 'motion/react';
import { TreePine, Building2, Landmark, Heart, Home, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

const users = [
  {
    icon: TreePine,
    title: 'Forest Department',
    description: 'Monitor protected wetlands, track biodiversity health, and receive instant alerts about environmental threats.',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Building2,
    title: 'Researchers',
    description: 'Access high-resolution environmental data, export reports, and analyze long-term ecological trends.',
    gradient: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: Landmark,
    title: 'Government Agencies',
    description: 'Enforce environmental regulations with real-time compliance data and automated policy monitoring.',
    gradient: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
  },
  {
    icon: Heart,
    title: 'NGOs & Conservationists',
    description: 'Track conservation impact, engage communities, and advocate with data-driven insights.',
    gradient: 'from-rose-500/20 to-rose-600/5',
    border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
  },
  {
    icon: Home,
    title: 'Local Communities',
    description: 'Stay informed about the health of nearby wetlands that directly affect livelihoods and local climate.',
    gradient: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
  },
];

export function UsersSection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-sm mb-5">
            Who It's For
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Built for{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">Everyone</span>
            {' '}Who Cares
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base lg:text-lg">
            From government agencies to local communities — AvianGuard serves every stakeholder in wetland conservation.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-5">
          {users.map((user, index) => {
            const Icon = user.icon;
            return (
              <motion.div
                key={user.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${user.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`relative h-full p-6 rounded-2xl border ${user.border} bg-black/40 backdrop-blur-sm hover:bg-black/20 transition-all duration-300`}>
                  <div className={`inline-flex p-3 rounded-xl ${user.iconBg} mb-4`}>
                    <Icon size={22} className={user.iconColor} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{user.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{user.description}</p>
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
            Start protecting your wetlands today
            <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
