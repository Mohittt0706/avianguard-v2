import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Droplets, ArrowRight, Eye, EyeOff, Shield, TreePine, GraduationCap } from 'lucide-react';

const roles = [
  { id: 'admin', label: 'Admin', icon: Shield, desc: 'Full system access & control' },
  { id: 'officer', label: 'Forest Officer', icon: TreePine, desc: 'Monitor & manage protected wetlands' },
  { id: 'researcher', label: 'Researcher', icon: GraduationCap, desc: 'Access data & analytics' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-['Inter',sans-serif] overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <Droplets className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Avian<span className="text-emerald-400">Guard</span>
              </span>
            </button>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to your monitoring dashboard</p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 sm:p-8">
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-300 mb-3 block">Select Role</label>
              <div className="grid gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                        <Icon size={18} className={isSelected ? 'text-emerald-400' : 'text-gray-400'} />
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>{role.label}</div>
                        <div className="text-xs text-gray-500">{role.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
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
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-600 bg-white/5 accent-emerald-500" />
                  Remember me
                </label>
                <button type="button" className="text-emerald-400 hover:text-emerald-300 transition-colors">Forgot password?</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600" />
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight size={16} />
                    </span>
                  )}
                </span>
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-xs text-gray-600">
            By signing in, you agree to our{' '}
            <button className="text-emerald-400/70 hover:text-emerald-300">Terms of Service</button>
            {' '}and{' '}
            <button className="text-emerald-400/70 hover:text-emerald-300">Privacy Policy</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
