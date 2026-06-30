import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Droplets, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow duration-300">
              <Droplets className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Avian<span className="text-emerald-400">Guard</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="relative group px-5 py-2 rounded-full text-sm font-medium text-white overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full" />
              <span className="absolute inset-[1px] bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Get Started</span>
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-4 space-y-1 bg-black/80 backdrop-blur-xl border-t border-white/10">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.href)}
              className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              {link.label}
            </button>
          ))}
          <hr className="border-white/5 my-2" />
          <button
            onClick={() => { setMobileOpen(false); navigate('/login'); }}
            className="block w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 text-left transition-all"
          >
            Log In
          </button>
          <button
            onClick={() => { setMobileOpen(false); navigate('/register'); }}
            className="block w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg text-center"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
