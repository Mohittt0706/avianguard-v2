import { useNavigate } from 'react-router';
import { Droplets, Github, Mail, MapPin, BookOpen, Scale, Shield } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Dashboard', 'API', 'Changelog', 'Documentation'],
  Company: ['About', 'Blog', 'Careers', 'Contact', 'Privacy'],
  Resources: ['Research', 'Case Studies', 'Webinars', 'Community', 'Support'],
  Legal: ['Terms', 'Privacy', 'Security', 'Cookies', 'License'],
};

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer id="contact" className="relative border-t border-white/[0.06] bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black to-black pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <Droplets className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Avian<span className="text-emerald-400">Guard</span>
              </span>
            </button>
            <p className="text-sm text-gray-500 leading-relaxed mb-5 max-w-xs">
              AI-powered wetland monitoring and early warning system. Protecting ecosystems through real-time intelligence and machine learning.
            </p>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <Github size={16} />
              </button>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <Mail size={16} />
              </button>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                <BookOpen size={16} />
              </button>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <button className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} AvianGuard. All rights reserved. Built with care for wetland conservation.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Shield size={12} />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Scale size={12} />
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin size={12} />
              <span>v1.0.0</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-[10px] text-gray-700 text-center leading-relaxed max-w-2xl mx-auto">
          AvianGuard is an open-source environmental monitoring platform. Data accuracy depends on sensor calibration and environmental conditions. 
          Always verify critical alerts through secondary validation. Not for use in life-critical decision making without human oversight.
        </div>
      </div>
    </footer>
  );
}
