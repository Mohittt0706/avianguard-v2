import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Droplets, Clock, ArrowLeft } from 'lucide-react';

export default function RegistrationSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const id = (location.state as { id?: string })?.id || '—';

  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif] flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(0,229,255,0.06)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(52,211,153,0.06)' }} />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <div className="mb-8">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Droplets className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Avian<span className="text-emerald-400">Guard</span>
              </span>
            </button>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-8 sm:p-10 shadow-[0_0_0_1px_rgba(0,229,255,0.03),0_8px_40px_rgba(0,0,0,0.45)]">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <Clock size={64} className="text-amber-400 mx-auto mb-4" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-2"
            >
              Registration Submitted
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-400 leading-relaxed mb-2"
            >
              Your registration is pending approval. You will receive a confirmation once an administrator reviews your application.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-8"
            >
              <Clock size={12} />
              Pending Approval — ID: {id}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <button
                onClick={() => navigate('/')}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-500/20"
              >
                Return to Home
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] border border-white/[0.06] transition-all"
              >
                <ArrowLeft size={14} />
                Register Another
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
