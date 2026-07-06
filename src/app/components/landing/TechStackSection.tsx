import { motion } from 'motion/react';
import {
  SiReact, SiTailwindcss, SiTypescript, SiFastapi, SiEspressif, SiFirebase,
} from 'react-icons/si';
import { Cpu, Brain, Eye, Shapes } from 'lucide-react';

const techs = [
  { icon: SiReact, label: 'React', color: '#61DAFB', bgColor: '#61DAFB15' },
  { icon: SiTailwindcss, label: 'Tailwind', color: '#06B6D4', bgColor: '#06B6D415' },
  { icon: SiTypescript, label: 'TypeScript', color: '#3178C6', bgColor: '#3178C615' },
  { icon: SiFastapi, label: 'FastAPI', color: '#009688', bgColor: '#00968815' },
  { icon: SiEspressif, label: 'ESP32', color: '#E7352B', bgColor: '#E7352B15' },
  { icon: SiFirebase, label: 'Firebase', color: '#FFCA28', bgColor: '#FFCA2815' },
  { icon: Cpu, label: 'ML', color: '#8B5CF6', bgColor: '#8B5CF615', custom: true },
  { icon: Brain, label: 'AI', color: '#F59E0B', bgColor: '#F59E0B15', custom: true },
  { icon: Eye, label: 'OpenCV', color: '#10B981', bgColor: '#10B98115', custom: true },
  { icon: Shapes, label: 'YOLO', color: '#EF4444', bgColor: '#EF444415', custom: true },
];

export function TechStackSection() {
  return (
    <section id="tech" className="relative py-24 lg:py-32 overflow-hidden">
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
          <span className="inline-block px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-300 text-sm mb-5">
            Technology Stack
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Built With{' '}
            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Modern Tech</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base lg:text-lg">
            Cutting-edge technologies powering the future of environmental monitoring.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 lg:gap-4 max-w-3xl mx-auto">
          {techs.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={tech.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative"
              >
                <div
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-black/40 backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300"
                  style={{ backgroundColor: `${tech.bgColor}` }}
                >
                  <Icon size={18} style={{ color: tech.color }} className="flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{tech.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
