import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Play, Shield, ChevronDown } from 'lucide-react';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-blue-500/12 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[60%] left-[20%] w-[300px] h-[300px] bg-emerald-400/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[10%] right-[30%] w-[350px] h-[350px] bg-blue-400/8 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '0.8s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-sm mb-8 backdrop-blur-sm"
        >
          <Shield size={14} />
          <span>Next-Gen Wetland Protection System</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          <span className="text-white">AI-Powered</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Wetland Guardian
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Protecting wetlands through Artificial Intelligence, IoT and Real-Time Environmental Monitoring.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate('/login')}
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full" />
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
            <span className="absolute inset-[1.5px] bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2 group-hover:scale-[1.02] transition-transform duration-300">
              Get Started
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => {
              document.querySelector('#problem')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium text-gray-300 border border-white/10 hover:border-white/20 hover:text-white transition-all duration-300 bg-white/[0.03] hover:bg-white/[0.06]"
          >
            <Play size={16} />
            Watch Demo
          </button>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={() => document.querySelector('#problem')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-gray-500 hover:text-gray-300 transition-colors animate-bounce"
      >
        <ChevronDown size={24} />
      </motion.button>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
    </section>
  );
}
