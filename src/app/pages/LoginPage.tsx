import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { motion } from 'motion/react';
import { toast, Toaster } from 'sonner';
import { Eye, EyeOff, Droplets, Loader2, Shield } from 'lucide-react';
import ShinyText from '../components/ShinyText';
import ElectricBorder from '../components/ElectricBorder';
import { useAuth } from '@/context/AuthContext';
import type { LoginCredentials } from '@/types/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  if (isAuthenticated) {
    return null;
  }

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const creds: LoginCredentials = { email: email.trim(), password, rememberMe };
      await login(creds);
      toast.success('Login successful. Welcome back.');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('[Login] Error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' },
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08)_0%,_transparent_60%)]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 mb-4 shadow-lg shadow-emerald-500/20">
            <Droplets className="text-white" size={24} />
          </div>
          <h1><ShinyText text="AvianGuard" color="#FFFFFF" shineColor="#22D3EE" spread={100} speed={3} className="text-xl font-bold" /></h1>
          <p className="text-sm text-gray-500 mt-1">Wetland Monitoring Command Center</p>
        </div>

          <ElectricBorder color="#22D3EE" speed={0.3} chaos={0.15} borderRadius={16}>
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                placeholder="admin@avianguard.org"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
              />
              {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-400 mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/[0.1] bg-white/[0.04] text-emerald-500 focus:ring-emerald-500/20"
                />
                <span className="text-[11px] text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {isLoading ? 'Authenticating...' : 'Sign In to Command Center'}
            </button>
          </form>
        </div>
          </ElectricBorder>

        <p className="text-center text-[10px] text-gray-600 mt-6">
          Authorized personnel only. All access is monitored and logged.
        </p>
      </motion.div>
    </div>
  );
}
