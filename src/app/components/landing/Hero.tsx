import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Shield } from 'lucide-react';
import ShinyText from '../ShinyText';
import Prism from '../Prism';
import ElectricBorder from '../ElectricBorder';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#030712' }}>
      <div className="absolute inset-0" style={{ backgroundColor: '#030712' }} />

      <div className="absolute inset-0 hidden md:block pointer-events-none opacity-[0.22] will-change-transform" style={{
        maskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)'
      }}>
        <Prism
          animationType="3drotate"
          height={4}
          baseWidth={6}
          glow={0.85}
          noise={0.15}
          scale={3.8}
          hueShift={2.5}
          colorFrequency={2.5}
          bloom={0.8}
          timeScale={0.12}
          transparent
          suspendWhenOffscreen
        />
      </div>

      <div className="absolute inset-0 pointer-events-none will-change-opacity" style={{
        background: 'linear-gradient(180deg, rgba(3,7,18,.30) 0%, rgba(3,7,18,.55) 50%, rgba(3,7,18,.85) 100%)'
      }} />

      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/8 via-blue-500/8 to-indigo-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-blue-500/6 via-indigo-500/6 to-purple-500/6 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-r from-cyan-500/[0.06] via-blue-500/[0.08] to-indigo-500/[0.06] rounded-full blur-[150px] pointer-events-none" />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/20 to-[#030712]/50 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-16 backdrop-blur-sm"
          style={{ color: '#10B981' }}
        >
          <Shield size={14} />
          <span>AI-Powered Wetland Protection</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8"
        >
          <ShinyText
            text="AI-Powered Wetland Guardian"
            color="#FFFFFF"
            shineColor="#22D3EE"
            spread={80}
            speed={3}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]"
          />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-16 leading-relaxed"
          style={{ color: '#CBD5E1' }}
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
          <ElectricBorder color="#22D3EE" speed={0.12} chaos={0.04} borderRadius={9999} className="inline-flex">
            <button
              onClick={() => navigate('/register')}
              className="group relative inline-flex items-center gap-2 px-10 py-3.5 rounded-full text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:brightness-110"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#10B981] via-[#06B6D4] to-[#3B82F6] rounded-full" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#10B981] via-[#06B6D4] to-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl scale-110" />
              <span className="absolute inset-[1.5px] bg-[#030712]/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2 group-hover:scale-[1.02] transition-transform duration-300">
                Get Started
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </ElectricBorder>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#030712] to-transparent pointer-events-none" />
    </section>
  );
}
