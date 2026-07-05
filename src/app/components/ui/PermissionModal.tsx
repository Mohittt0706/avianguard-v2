import { useState, useEffect } from 'react';
import {
  Shield, X, Check, ChevronDown, ChevronRight, Save, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { userApi } from '@/services/userApi';
import { useAuth } from '@/context/AuthContext';
import type { User, UserRole } from '@/types/auth';
import { ROLE_PERMISSIONS } from '@/types/auth';

const RESOURCES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'sensors', label: 'Sensors' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'reports', label: 'Reports' },
  { key: 'citizens', label: 'Citizen Alerts' },
  { key: 'maps', label: 'Maps' },
  { key: 'settings', label: 'Settings' },
  { key: 'ai', label: 'AI Center' },
  { key: 'users', label: 'User Management' },
];

const ACTIONS = ['read', 'create', 'update', 'delete', 'export'] as const;

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', OPERATOR: 'Operator', VIEWER: 'Viewer',
};

interface PermissionModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export function PermissionModal({ user, onClose, onSave }: PermissionModalProps) {
  const { hasPermission, user: currentUser } = useAuth();
  const canEditPermissions = hasPermission('users', 'update') || currentUser?.role === 'SUPER_ADMIN';

  const [permissions, setPermissions] = useState<Record<string, string[]>>(() => {
    const roleDefaults = ROLE_PERMISSIONS[user.role as UserRole] || {};
    if (user.permissions && typeof user.permissions === 'object') {
      const merged: Record<string, string[]> = {};
      for (const res of RESOURCES) {
        merged[res.key] = user.permissions[res.key] !== undefined
          ? user.permissions[res.key]
          : (roleDefaults[res.key] || []);
      }
      return merged;
    }
    return { ...roleDefaults };
  });

  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set(RESOURCES.filter(r => (permissions[r.key] || []).length > 0).map(r => r.key))
  );
  const [saving, setSaving] = useState(false);

  const toggleResource = (resource: string) => {
    setExpandedResources(prev => {
      const next = new Set(prev);
      if (next.has(resource)) next.delete(resource);
      else next.add(resource);
      return next;
    });
  };

  const toggleAction = (resource: string, action: string) => {
    setPermissions(prev => {
      const current = prev[resource] || [];
      const next = current.includes(action)
        ? current.filter(a => a !== action)
        : [...current, action];
      return { ...prev, [resource]: next };
    });
  };

  const setAllActions = (resource: string, enabled: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [resource]: enabled ? [...ACTIONS] : [],
    }));
  };

  const applyRoleDefaults = (role: UserRole) => {
    const defaults = ROLE_PERMISSIONS[role] || {};
    const newPerms: Record<string, string[]> = {};
    for (const res of RESOURCES) {
      newPerms[res.key] = defaults[res.key] || [];
    }
    setPermissions(newPerms);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userApi.update(user.id, { permissions } as Partial<User>);
      toast.success('Permissions updated successfully');
      onSave(res.data.user);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const totalPermissions = Object.values(permissions).flat().length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Shield size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Edit Permissions</h3>
              <p className="text-[10px] text-gray-500">{user.name} — {roleLabels[user.role]}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/[0.06]">
          <div className="text-[10px] text-gray-500">
            <span className="text-white font-medium">{totalPermissions}</span> permissions active across{' '}
            <span className="text-white font-medium">{Object.values(permissions).filter(a => a.length > 0).length}</span> resources
          </div>
          <div className="flex-1" />
          {canEditPermissions && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500 mr-1">Apply role defaults:</span>
              {(['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'VIEWER'] as UserRole[]).map(role => (
                <button key={role} onClick={() => applyRoleDefaults(role)}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                    role === user.role
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/[0.04] text-gray-500 hover:text-white border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >{roleLabels[role]}</button>
              ))}
            </div>
          )}
        </div>

        {/* Resources */}
        <div className="space-y-1">
          {RESOURCES.map(res => {
            const actions = permissions[res.key] || [];
            const allActive = ACTIONS.every(a => actions.includes(a));
            const someActive = actions.length > 0 && !allActive;
            const isExpanded = expandedResources.has(res.key);

            return (
              <div key={res.key} className="bg-white/[0.02] rounded-lg border border-white/[0.04] overflow-hidden">
                <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/[0.03] transition-all"
                  onClick={() => toggleResource(res.key)}
                >
                  {isExpanded
                    ? <ChevronDown size={12} className="text-gray-500 shrink-0" />
                    : <ChevronRight size={12} className="text-gray-500 shrink-0" />
                  }
                  <span className="text-xs font-medium text-white flex-1">{res.label}</span>
                  <span className="text-[10px] text-gray-600">{actions.length}/{ACTIONS.length}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    allActive ? 'bg-emerald-400' : someActive ? 'bg-amber-400' : 'bg-gray-600'
                  }`} />
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-2">
                      <button onClick={(e) => { e.stopPropagation(); setAllActions(res.key, !allActive); }}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                          allActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/[0.04] text-gray-500 hover:text-white'
                        }`}
                      >{allActive ? 'Deselect All' : 'Select All'}</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ACTIONS.map(action => {
                        const has = actions.includes(action);
                        return (
                          <button key={action}
                            onClick={(e) => { e.stopPropagation(); toggleAction(res.key, action); }}
                            disabled={!canEditPermissions}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${
                              has
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-white/[0.03] text-gray-600 border-white/[0.04] hover:border-white/[0.1] hover:text-gray-400'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {has && <Check size={9} />}
                            {action}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-white/[0.06]">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all"
          >Cancel</button>
          {canEditPermissions && (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save Permissions
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
