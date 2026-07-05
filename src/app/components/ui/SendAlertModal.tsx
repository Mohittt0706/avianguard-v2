'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Eye, Globe, Smartphone, MessageSquare, AtSign, Loader2, AlertTriangle, ChevronDown, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { citizenApi } from '@/services/citizenApi';
import type { Citizen, CitizenAlertNotification } from '@/types/citizen';

interface SendAlertModalProps {
  citizen: Citizen;
  onClose: () => void;
  onSent: (notification: CitizenAlertNotification) => void;
}

const SEVERITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const LANGUAGE_OPTIONS = ['Hindi', 'Gujarati', 'English'] as const;
const DELIVERY_OPTIONS = ['SMS', 'WhatsApp', 'Email', 'Push'] as const;

const SEVERITY_CONFIG: Record<string, { color: string; bg: string }> = {
  LOW: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10' },
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10' },
};

const DELIVERY_ICONS: Record<string, typeof Send> = {
  SMS: MessageSquare,
  WhatsApp: Smartphone,
  Email: AtSign,
  Push: Radio,
};

interface DarkDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
}

function DarkDropdown({ value, onChange, options, placeholder }: DarkDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white hover:border-white/[0.12] transition-all outline-none focus:border-emerald-500/40"
      >
        <span className={value ? 'text-white truncate' : 'text-gray-600 truncate'}>
          {value || placeholder || 'Select...'}
        </span>
        <ChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-gray-900 border border-white/[0.1] rounded-lg max-h-40 overflow-y-auto shadow-xl">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                value === opt
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className="truncate">{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SendAlertModal({ citizen, onClose, onSent }: SendAlertModalProps) {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('');
  const [message, setMessage] = useState('');
  const [wetland, setWetland] = useState(citizen.nearbyWetland || '');
  const [language, setLanguage] = useState(citizen.language || 'Hindi');
  const [deliveryMethod, setDeliveryMethod] = useState(citizen.alertMethods[0] || 'SMS');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const canSend = title.trim() && severity && message.trim();

  async function handleSend() {
    if (!canSend || sending) return;
    setSending(true);
    try {
      const result = await citizenApi.sendAlert(citizen.id, {
        title: title.trim(),
        severity,
        message: message.trim(),
        wetland: wetland.trim() || undefined,
        language,
        deliveryMethod,
      });
      onSent(result.data.notification);
      toast.success('Alert sent successfully');
    } catch {
      toast.error('Failed to send alert');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Send Emergency Alert</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">
                To: {citizen.fullName} ({citizen.mobile})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Alert Title */}
        <div className="mb-3">
          <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">
            Alert Title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Flood Warning - Immediate Evacuation"
            className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
          />
        </div>

        {/* Severity */}
        <div className="mb-3">
          <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">
            Severity
          </label>
          <div className="flex gap-1.5">
            {SEVERITY_OPTIONS.map(s => {
              const cfg = SEVERITY_CONFIG[s];
              const active = severity === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                    active
                      ? `${cfg.color} ${cfg.bg} border-current`
                      : 'text-gray-500 bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:text-gray-300'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div className="mb-3">
          <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">
            Message
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type the emergency alert message..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all resize-none"
          />
        </div>

        {/* Affected Wetland */}
        <div className="mb-3">
          <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">
            Affected Wetland
          </label>
          <input
            type="text"
            value={wetland}
            onChange={e => setWetland(e.target.value)}
            placeholder="Wetland name"
            className="w-full px-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 outline-none focus:border-emerald-500/40 transition-all"
          />
        </div>

        {/* Language + Delivery Method row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">
              Language
            </label>
            <DarkDropdown
              value={language}
              onChange={setLanguage}
              options={LANGUAGE_OPTIONS}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">
              Delivery Method
            </label>
            <DarkDropdown
              value={deliveryMethod}
              onChange={setDeliveryMethod}
              options={DELIVERY_OPTIONS}
            />
          </div>
        </div>

        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[10px] font-medium text-gray-400 bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:text-gray-300 transition-all mb-4"
        >
          <Eye size={13} />
          {showPreview ? 'Hide Preview' : 'Show Phone Preview'}
        </button>

        {/* Phone Preview */}
        {showPreview && (
          <div className="mb-4">
            <div className="bg-gray-900 border border-white/[0.08] rounded-2xl p-4 max-w-[240px] mx-auto">
              {/* Status bar */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1">
                  <Globe size={10} className="text-gray-500" />
                  <span className="text-[8px] text-gray-500">Weather Alert</span>
                </div>
                <span className="text-[8px] text-gray-600">now</span>
              </div>

              {/* Notification card */}
              <div className="bg-white/[0.06] border border-white/[0.08] rounded-xl p-3">
                <div className="flex items-start gap-2 mb-2">
                  <div className={`p-1 rounded ${severity ? SEVERITY_CONFIG[severity].bg : 'bg-gray-500/10'}`}>
                    <AlertTriangle
                      size={10}
                      className={severity ? SEVERITY_CONFIG[severity].color : 'text-gray-500'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-white truncate">
                      {title || 'Alert Title'}
                    </p>
                    <p className="text-[8px] text-gray-500 mt-0.5">
                      Wetland Emergency System
                    </p>
                  </div>
                </div>
                <p className="text-[9px] text-gray-300 leading-relaxed">
                  {message || 'Your alert message will appear here...'}
                </p>
                {wetland && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/[0.04]">
                    <Globe size={8} className="text-emerald-400" />
                    <span className="text-[8px] text-emerald-400">{wetland}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/[0.04]">
                  {(() => {
                    const Icon = DELIVERY_ICONS[deliveryMethod] || MessageSquare;
                    return <Icon size={8} className="text-gray-500" />;
                  })()}
                  <span className="text-[8px] text-gray-500">
                    via {deliveryMethod} · {language}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!canSend || sending}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={13} />
                Send Alert
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
