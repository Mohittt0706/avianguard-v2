import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Droplets, ArrowRight, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard/citizens');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col font-['Inter',sans-serif] overflow-hidden bg-black">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[180px]" style={{ backgroundColor: 'rgba(0,229,255,0.05)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(52,211,153,0.05)' }} />
        <div className="absolute top-[30%] left-[60%] w-[400px] h-[400px] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(99,102,241,0.03)' }} />

        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }} />
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <Droplets className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Avian<span className="text-emerald-400">Guard</span>
              </span>
            </button>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-sm text-gray-500">Sign in to manage citizen registrations and alerts</p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-6 sm:p-8 shadow-[0_0_0_1px_rgba(0,229,255,0.03),0_8px_40px_rgba(0,0,0,0.45)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aviangov.in"
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none transition-all focus:border-emerald-500/40 focus:bg-emerald-500/[0.03] focus:shadow-[0_0_0_1px_rgba(52,211,153,0.1)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none transition-all focus:border-emerald-500/40 focus:bg-emerald-500/[0.03] focus:shadow-[0_0_0_1px_rgba(52,211,153,0.1)] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded accent-emerald-500 bg-white/[0.04] border border-white/[0.1]"
                  />
                  Remember me
                </label>
                <button type="button" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={16} />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield size={12} />
                <span>Demo credentials: admin@aviangov.in / admin123</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="mt-8 mx-auto flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
