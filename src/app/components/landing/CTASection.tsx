import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/6 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-8"
        >
          Ready to Protect{' '}
          <span className="bg-gradient-to-r from-emerald-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Wetlands?
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate('/register')}
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full" />
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
            <span className="absolute inset-[1.5px] bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-full text-sm font-medium text-gray-300 border border-white/10 hover:border-white/20 hover:text-white transition-all duration-300"
          >
            Log In
          </button>
        </motion.div>
      </div>
    </section>
  );
}
