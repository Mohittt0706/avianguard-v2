import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  User, Settings, LogOut, ChevronDown, Shield, LogOut as LogOutIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function ProfileMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'text-emerald-400',
    DISTRICT_OFFICER: 'text-blue-400',
    OPERATOR: 'text-amber-400',
    VIEWER: 'text-gray-400',
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-medium text-white leading-tight">{user.name}</p>
          <p className={`text-[10px] ${roleColors[user.role] || 'text-gray-500'} leading-tight`}>
            {user.role.replace('_', ' ')}
          </p>
        </div>
        <ChevronDown size={12} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-white/[0.1] rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-xs font-medium text-white">{user.name}</p>
              <p className="text-[10px] text-gray-500">{user.email}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-medium text-emerald-400 mt-1.5">
                <Shield size={8} />
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <div className="py-1">
              <button onClick={() => { /* placeholder */ toast.success('Profile page coming soon'); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
              ><User size={13} /> My Profile</button>
              <button onClick={() => { navigate('/dashboard/settings'); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
              ><Settings size={13} /> Settings</button>
            </div>
            <div className="border-t border-white/[0.06] py-1">
              {confirmLogout ? (
                <div className="px-4 py-2 space-y-2">
                  <p className="text-[10px] text-gray-500">Confirm logout?</p>
                  <div className="flex gap-2">
                    <button onClick={handleLogout}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-medium text-white bg-red-500 hover:bg-red-400 transition-all"
                    >Yes, Logout</button>
                    <button onClick={() => setConfirmLogout(false)}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-medium text-gray-400 bg-white/[0.04] hover:text-white transition-all"
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmLogout(true)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                ><LogOutIcon size={13} /> Logout</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
