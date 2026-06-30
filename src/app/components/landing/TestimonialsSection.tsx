import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "AvianGuard has completely transformed how we monitor our protected wetlands. The AI predictions have helped us prevent three major contamination events this year alone.",
    name: "Dr. Sarah Chen",
    role: "Senior Environmental Scientist",
    org: "Forest Department",
    initials: "SC",
    gradient: "from-emerald-500 to-blue-600",
  },
  {
    quote: "The real-time dashboard gives us visibility we've never had before. We can now make data-driven decisions that directly impact conservation outcomes.",
    name: "James Omondi",
    role: "Conservation Lead",
    org: "Kenya Wildlife Service",
    initials: "JO",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    quote: "As a researcher, having access to high-resolution environmental data with AI-powered insights has accelerated our wetland biodiversity study by months.",
    name: "Prof. Maria Rodriguez",
    role: "Research Director",
    org: "Institute of Ecology",
    initials: "MR",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    quote: "The alert system is a game-changer. We get notified instantly when water quality parameters shift, allowing us to respond before any real damage occurs.",
    name: "Rajesh Patel",
    role: "Program Manager",
    org: "Wetland Conservation NGO",
    initials: "RP",
    gradient: "from-amber-500 to-orange-600",
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-sm mb-5">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">Experts</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base lg:text-lg">
            Hear from the conservation professionals who use AvianGuard daily.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-6 lg:p-8 rounded-2xl border border-white/[0.06] bg-black/40 backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300">
                <Quote size={24} className="text-emerald-500/30 mb-4" />
                <p className="text-sm text-gray-300 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}, {t.org}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
