import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, Bell, Brain, Activity, Map, FileText, Users, Droplets, UserCheck, AlertTriangle, Settings } from 'lucide-react';
import { alertApi } from '@/services/alertApi';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true, resource: 'dashboard', action: 'read' },
  { to: '/dashboard/alerts', icon: AlertTriangle, label: 'Alert Center', alertKey: 'active' as const, resource: 'alerts', action: 'read' },
  { to: '/dashboard/ai', icon: Brain, label: 'AI Decision Center', resource: 'ai', action: 'read' },
  { to: '/dashboard/sensors', icon: Activity, label: 'Live Sensors', resource: 'sensors', action: 'read' },
  { to: '/dashboard/maps', icon: Map, label: 'Maps', resource: 'maps', action: 'read' },
  { to: '/dashboard/reports', icon: FileText, label: 'Reports', resource: 'reports', action: 'read' },
  { to: '/dashboard/users', icon: Users, label: 'Users', resource: 'users', action: 'read' },
  { to: '/dashboard/citizens', icon: UserCheck, label: 'Citizen Management', resource: 'citizens', action: 'read' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings', resource: 'settings', action: 'read' },
];

export function Sidebar() {
  const [activeCount, setActiveCount] = useState(0);
  const { hasPermission } = useAuth();

  useEffect(() => {
    function fetchCount() {
      alertApi.getStats().then(r => setActiveCount(r.data.active)).catch(() => {});
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    window.addEventListener('sensor:updated', fetchCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener('sensor:updated', fetchCount);
    };
  }, []);

  const visibleItems = navItems.filter(item => hasPermission(item.resource, item.action));

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-black border-r border-white/[0.06] flex flex-col z-40">
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
          <Droplets className="text-white" size={14} />
        </div>
        <span className="text-sm font-bold text-white">Avian<span className="text-emerald-400">Guard</span></span>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1">
        {visibleItems.map((item) => (
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
            <span className="flex-1">{item.label}</span>
            {item.alertKey === 'active' && activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-400 leading-none">
                {activeCount > 99 ? '99+' : activeCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
