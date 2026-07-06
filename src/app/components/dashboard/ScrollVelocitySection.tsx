import { useRef, useLayoutEffect, useState } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from 'motion/react';

function useElementWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) setWidth(ref.current.offsetWidth);
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [ref]);
  return width;
}

function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  const mod = (((v - min) % range) + range) % range;
  return mod + min;
}

function VelocityRow({ children, baseVelocity }: { children: React.ReactNode; baseVelocity: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 3], { clamp: false });

  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef);
  const dirRef = useRef(1);

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return '0px';
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  useAnimationFrame((_t, delta) => {
    let moveBy = dirRef.current * baseVelocity * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) dirRef.current = -1;
    else if (vf > 0) dirRef.current = 1;
    moveBy += dirRef.current * moveBy * vf;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="relative overflow-hidden whitespace-nowrap">
      <motion.div className="flex" style={{ x }}>
        <span ref={copyRef} className="flex-shrink-0">{children}&nbsp;</span>
        <span className="flex-shrink-0">{children}&nbsp;</span>
        <span className="flex-shrink-0">{children}&nbsp;</span>
        <span className="flex-shrink-0">{children}&nbsp;</span>
        <span className="flex-shrink-0">{children}&nbsp;</span>
        <span className="flex-shrink-0">{children}&nbsp;</span>
      </motion.div>
    </div>
  );
}

interface ScrollVelocitySectionProps {
  topText?: string;
  bottomText?: string;
  topSpeed?: number;
  bottomSpeed?: number;
  topOpacity?: number;
  bottomOpacity?: number;
  topSize?: string;
  bottomSize?: string;
  border?: boolean;
}

export default function ScrollVelocitySection({
  topText = 'AI Powered Monitoring  •  Real-Time Sensor Network  •  Nal Sarovar Wetland  •  IoT Sensor Nodes  •  Water Quality Analytics  •  Environmental Intelligence  •  ',
  bottomText = 'Live Monitoring  •  Predictive AI  •  Biodiversity Protection  •  Government Command Center  •  Wetland Conservation  •  Emergency Response  •  ',
  topSpeed = 6,
  bottomSpeed = -7,
  topOpacity = 55,
  bottomOpacity = 40,
  topSize = 'clamp(2.5rem, 5vw, 4.5rem)',
  bottomSize = 'clamp(2rem, 4vw, 3.5rem)',
  border = true,
}: ScrollVelocitySectionProps) {
  return (
    <div className={`hidden md:block overflow-hidden select-none ${border ? 'border-t border-b border-white/[0.04]' : ''}`}>
      <div className="relative py-5">
        <VelocityRow baseVelocity={topSpeed}>
          <span
            className="bg-gradient-to-r from-white/55 via-white/75 to-white/55 bg-clip-text text-transparent font-light tracking-wide"
            style={{ fontSize: topSize, lineHeight: 1.15, opacity: topOpacity / 100 }}
          >
            {topText}
          </span>
        </VelocityRow>
        <VelocityRow baseVelocity={bottomSpeed}>
          <span
            className="bg-gradient-to-r from-white/40 via-white/60 to-white/40 bg-clip-text text-transparent font-light tracking-wide"
            style={{ fontSize: bottomSize, lineHeight: 1.15, opacity: bottomOpacity / 100 }}
          >
            {bottomText}
          </span>
        </VelocityRow>
      </div>
    </div>
  );
}
