import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { toast, Toaster } from 'sonner';
import { Droplets, Eye, EyeOff, Loader2, CheckCircle, Shield } from 'lucide-react';
import { authApi } from '@/services/authApi';

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (!pw) return { label: '', color: '', width: '0%' };
  const score = [
    pw.length >= 8, /[a-z]/.test(pw), /[A-Z]/.test(pw), /\d/.test(pw), /[^a-zA-Z0-9]/.test(pw),
  ].filter(Boolean).length;
  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (score <= 3) return { label: 'Medium', color: 'bg-amber-500', width: '50%' };
  if (score <= 4) return { label: 'Strong', color: 'bg-emerald-400', width: '75%' };
  return { label: 'Very Strong', color: 'bg-emerald-500', width: '100%' };
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'mock-reset-token';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);
  const match = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      toast.success('Password has been reset successfully');
    } catch {
      toast.error('Failed to reset password. The link may have expired.');
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
          <h1 className="text-xl font-bold text-white">Set New Password</h1>
          <p className="text-sm text-gray-500 mt-1">Create a strong password for your account</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 shadow-2xl">
          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10">
                <CheckCircle size={24} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Password reset successful</p>
                <p className="text-xs text-gray-500 mt-1">You can now log in with your new password</p>
              </div>
              <Link to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20"
              ><Shield size={14} /> Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">New Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <p className={`text-[10px] ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
                />
                {confirmPassword && (
                  <p className={`text-[10px] mt-1 ${match ? 'text-emerald-400' : 'text-red-400'}`}>
                    {match ? 'Passwords match' : 'Passwords do not match'}
                  </p>
                )}
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-60 shadow-lg shadow-emerald-500/20"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
