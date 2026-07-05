import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Droplets, Bell, BellOff, CheckCircle, Clock, AlertTriangle,
  Smartphone, Search, Loader2, MessageSquare, Eye, EyeOff,
  ChevronDown, MapPin, Globe, Shield,
} from 'lucide-react';
import { citizenApi } from '@/services/citizenApi';
import type { NotificationInboxEntry, NotificationInboxResponse } from '@/types/citizen';

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  LOW: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

export default function NotificationInboxPage() {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inbox, setInbox] = useState<NotificationInboxResponse | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!mobile.trim() || mobile.trim().length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await citizenApi.getNotificationInbox(mobile.trim());
      setInbox(res.data);
    } catch {
      setError('No account found with this mobile number');
      setInbox(null);
    } finally {
      setLoading(false);
    }
  }, [mobile]);

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await citizenApi.markAsRead(id);
      setInbox(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map(n =>
            n.id === id ? { ...n, readAt: new Date().toISOString() } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        };
      });
    } catch { /* ignore */ }
  }, []);

  const handleAcknowledge = useCallback(async (id: string) => {
    setAcknowledging(id);
    try {
      await citizenApi.acknowledgeNotification(id);
      setInbox(prev => {
        if (!prev) return prev;
        const wasUnread = prev.notifications.find(x => x.id === id && !x.readAt);
        return {
          ...prev,
          notifications: prev.notifications.map(n =>
            n.id === id ? { ...n, acknowledgedAt: new Date().toISOString(), readAt: n.readAt || new Date().toISOString() } : n
          ),
          unreadCount: wasUnread ? prev.unreadCount - 1 : prev.unreadCount,
        };
      });
    } catch { /* ignore */ } finally {
      setAcknowledging(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(0,229,255,0.06)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(52,211,153,0.06)' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 mb-4">
            <Bell size={28} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Notification Inbox</h1>
          <p className="text-sm text-gray-400">View your environmental alerts and emergency notifications</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6 mb-6">
          <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2 block">
            Enter your registered mobile number
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="tel"
                value={mobile}
                onChange={e => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. 9876543210"
                maxLength={10}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || mobile.length < 10}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Search
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>

        {inbox && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  {inbox.citizen.fullName}'s Notifications
                </h2>
                <p className="text-[10px] text-gray-500">
                  {inbox.notifications.length} total · {inbox.unreadCount} unread
                </p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-emerald-400" />
                <span className="text-[10px] text-gray-400">{inbox.citizen.nearbyWetland}</span>
              </div>
            </div>

            {inbox.notifications.length === 0 ? (
              <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-10 text-center">
                <BellOff size={32} className="text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No notifications yet</p>
                <p className="text-[10px] text-gray-600 mt-1">You will see alerts here when they are sent to your area</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inbox.notifications.map((n) => {
                  const isExpanded = expandedId === n.id;
                  const sev = SEVERITY_CONFIG[n.severity] || SEVERITY_CONFIG.LOW;
                  const isUnread = !n.readAt;

                  return (
                    <div
                      key={n.id}
                      className={`bg-white/[0.03] rounded-xl border transition-all ${
                        isUnread ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-white/[0.06]'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setExpandedId(isExpanded ? null : n.id);
                          if (isUnread) handleMarkRead(n.id);
                        }}
                        className="w-full flex items-start gap-3 p-4 text-left"
                      >
                        <div className={`p-1.5 rounded-lg ${sev.bg} shrink-0 mt-0.5`}>
                          <AlertTriangle size={14} className={sev.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                            {isUnread && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-gray-400 line-clamp-1">{n.message}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${sev.bg} ${sev.color}`}>
                              {n.severity}
                            </span>
                            {n.wetland && (
                              <span className="text-[9px] text-gray-500 flex items-center gap-1">
                                <Globe size={8} /> {n.wetland}
                              </span>
                            )}
                            <span className="text-[9px] text-gray-600">{new Date(n.sentAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-white/[0.04] pt-3 space-y-3">
                          <div>
                            <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-1">Full Message</p>
                            <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                          </div>
                          {n.description && (
                            <div>
                              <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-1">Details</p>
                              <p className="text-xs text-gray-400 leading-relaxed">{n.description}</p>
                            </div>
                          )}
                          {n.recommendedAction && (
                            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                              <p className="text-[9px] font-medium text-amber-400 uppercase tracking-wider mb-1">Recommended Action</p>
                              <p className="text-xs text-amber-300/80">{n.recommendedAction}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-[9px] text-gray-500">
                            <span className="flex items-center gap-1"><Smartphone size={8} /> {n.deliveryMethod}</span>
                            <span className="flex items-center gap-1"><Clock size={8} /> {new Date(n.sentAt).toLocaleString()}</span>
                            {n.readAt && <span className="flex items-center gap-1 text-emerald-400"><Eye size={8} /> Read</span>}
                            {n.acknowledgedAt && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle size={8} /> Acknowledged</span>}
                          </div>
                          {!n.acknowledgedAt && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAcknowledge(n.id); }}
                              disabled={acknowledging === n.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                            >
                              {acknowledging === n.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />}
                              Acknowledge
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => window.history.back()}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
