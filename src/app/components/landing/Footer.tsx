import { useNavigate } from 'react-router';
import { Droplets, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer id="contact" className="relative border-t border-white/[0.06] bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <Droplets className="text-white" size={16} />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Avian<span className="text-emerald-400">Guard</span>
              </span>
            </button>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-5">
              AI-powered wetland monitoring and early warning system. Protecting ecosystems through real-time intelligence.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail size={13} />
                <span>contact@aviangov.in</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone size={13} />
                <span>+91 1800 123 4567</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {['Features', 'How It Works', 'Dashboard', 'Contact'].map(link => (
                <li key={link}>
                  <button
                    onClick={() => {
                      const id = link === 'How It Works' ? 'how-it-works' : link.toLowerCase();
                      if (id === 'features' || id === 'how-it-works' || id === 'contact') {
                        document.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate(`/${id}`);
                      }
                    }}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {['Documentation', 'API Reference', 'Research', 'Support'].map(link => (
                <li key={link}>
                  <button className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{link}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
                <li key={link}>
                  <button className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{link}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} AvianGuard. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Built with care for wetland conservation</span>
            <span className="hidden sm:inline">|</span>
            <MapPin size={12} className="hidden sm:inline" />
            <span className="hidden sm:inline">India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
