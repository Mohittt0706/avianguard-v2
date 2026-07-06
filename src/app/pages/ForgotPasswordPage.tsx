import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { toast, Toaster } from 'sonner';
import { Droplets, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { authApi } from '@/services/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch {
      toast.error('Failed to send reset link. Try again.');
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 mb-4 shadow-lg shadow-emerald-500/20">
            <Droplets className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 shadow-2xl">
          {sent ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10">
                <CheckCircle size={24} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Reset link sent</p>
                <p className="text-xs text-gray-500 mt-1">Check your email for further instructions</p>
              </div>
              <Link to="/login"
                className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              ><ArrowLeft size={12} /> Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@avianguard.org"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
                />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-60 shadow-lg shadow-emerald-500/20"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/login"
                className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
              ><ArrowLeft size={12} /> Back to Login</Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
