import { NavLink } from 'react-router';
import { LayoutDashboard, Bell, Activity, Map, FileText, Users, LogOut, Droplets, UserCheck, AlertTriangle } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/alert-center', icon: AlertTriangle, label: 'Alert Center' },
  { to: '/dashboard/alerts', icon: Bell, label: 'AI Decision Center' },
  { to: '/dashboard/sensors', icon: Activity, label: 'Live Sensors' },
  { to: '/dashboard/maps', icon: Map, label: 'Maps' },
  { to: '/dashboard/reports', icon: FileText, label: 'Reports' },
  { to: '/dashboard/users', icon: Users, label: 'Users' },
  { to: '/dashboard/citizens', icon: UserCheck, label: 'Citizen Requests' },
];

interface SidebarProps {
  onSignOut?: () => void;
}

export function Sidebar({ onSignOut }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-black border-r border-white/[0.06] flex flex-col z-40">
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
          <Droplets className="text-white" size={14} />
        </div>
        <span className="text-sm font-bold text-white">Avian<span className="text-emerald-400">Guard</span></span>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 pb-3 border-t border-white/[0.06] pt-3">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 w-full transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
