import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Shield } from 'lucide-react';
import ShinyText from '../ShinyText';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-sm mb-10 backdrop-blur-sm"
        >
          <Shield size={14} />
          <span>AI-Powered Wetland Protection</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          <span className="text-white">AI-Powered</span>
          <br />
          <ShinyText
            text="Wetland Guardian"
            color="#FFFFFF"
            shineColor="#22D3EE"
            spread={80}
            speed={3}
            className="font-extrabold"
          />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Real-time environmental monitoring powered by AI and IoT.
          Detect threats before they become emergencies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex justify-center"
        >
          <button
            onClick={() => navigate('/register')}
            className="group relative inline-flex items-center gap-2 px-10 py-3.5 rounded-full text-sm font-semibold text-white overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full" />
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
            <span className="absolute inset-[1.5px] bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2 group-hover:scale-[1.02] transition-transform duration-300">
              Get Started
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
    </section>
  );
}
