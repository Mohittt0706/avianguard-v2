import { useState, useEffect } from 'react';
import {
  Radio, X, Loader2, CheckCircle, XCircle, Smartphone,
  MessageSquare, AtSign, AlertTriangle, Globe, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { citizenApi } from '@/services/citizenApi';
import type { Citizen, EmergencyBroadcastResult } from '@/types/citizen';

const WETLANDS = [
  'Nal Sarovar', 'Thol Lake', 'Khijadiya', 'Pariej',
  'Wadhvana', 'Narmada Estuary', 'Gulf of Kutch',
];

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const LANGUAGES = ['Hindi', 'Gujarati', 'English'] as const;

const DELIVERY_METHODS = ['SMS', 'WhatsApp', 'Email', 'Push', 'All'] as const;

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  LOW: { label: 'LOW', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  MEDIUM: { label: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  HIGH: { label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  CRITICAL: { label: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

interface EmergencyBroadcastModalProps {
  onClose: () => void;
  onSent: (result: EmergencyBroadcastResult) => void;
}

export function EmergencyBroadcastModal({ onClose, onSent }: EmergencyBroadcastModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [wetland, setWetland] = useState(WETLANDS[0]);
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<string>('HIGH');
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('English');
  const [deliveryMethod, setDeliveryMethod] = useState('All');

  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<EmergencyBroadcastResult | null>(null);

  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      setLoadingCount(true);
      try {
        const res = await citizenApi.getStats();
        if (cancelled) return;
        const wetlandEntry = res.data.byWetland.find(
          w => w.wetland.toLowerCase() === wetland.toLowerCase()
        );
        setRecipientCount(wetlandEntry?.count ?? 0);
      } catch {
        if (!cancelled) setRecipientCount(0);
      } finally {
        if (!cancelled) setLoadingCount(false);
      }
    }
    fetchCount();
    return () => { cancelled = true; };
  }, [wetland]);

  const canProceedStep1 = title.trim() !== '' && message.trim() !== '';

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await citizenApi.emergencyBroadcast({
        wetland,
        title: title.trim(),
        severity,
        message: message.trim(),
        language,
        deliveryMethod,
      });
      setResult(res.data);
      setStep(3);
      toast.success('Emergency broadcast sent successfully');
      onSent(res.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const successRate = result
    ? result.total > 0 ? Math.round((result.sent / result.total) * 100) : 0
    : 0;

  const methodBreakdown = result?.deliveryStats ?? [];

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'sms': return <Smartphone size={14} className="text-blue-400" />;
      case 'whatsapp': return <MessageSquare size={14} className="text-emerald-400" />;
      case 'email': return <AtSign size={14} className="text-purple-400" />;
      case 'push': return <Radio size={14} className="text-cyan-400" />;
      default: return <Globe size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-950 border border-white/[0.08] rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <Radio size={18} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Emergency Broadcast</h3>
              <p className="text-[10px] text-gray-500">
                {step === 1 && 'Configure alert parameters'}
                {step === 2 && 'Review and confirm broadcast'}
                {step === 3 && 'Delivery results'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-5">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                step === s
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : step > s
                    ? 'bg-emerald-500/10 text-emerald-400/60 border-emerald-500/20'
                    : 'bg-white/[0.04] text-gray-600 border-white/[0.06]'
              }`}>
                {step > s ? <CheckCircle size={12} /> : s}
              </div>
              {s < 3 && (
                <div className={`w-8 h-px ${step > s ? 'bg-emerald-500/30' : 'bg-white/[0.06]'}`} />
              )}
            </div>
          ))}
          <div className="flex-1" />
          <span className="text-[10px] text-gray-600">Step {step} of 3</span>
        </div>

        {/* Step 1: Configure */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Wetland Selector */}
            <div>
              <label className="block text-[10px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Target Wetland</label>
              <select
                value={wetland}
                onChange={e => setWetland(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white hover:border-white/[0.12] transition-all outline-none focus:border-emerald-500/40"
              >
                {WETLANDS.map(w => (
                  <option key={w} value={w} className="bg-gray-900 text-white">{w}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Alert Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Flash Flood Warning"
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 hover:border-white/[0.12] transition-all outline-none focus:border-emerald-500/40"
              />
            </div>

            {/* Severity + Language row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Severity</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white hover:border-white/[0.12] transition-all outline-none focus:border-emerald-500/40"
                >
                  {SEVERITIES.map(s => (
                    <option key={s} value={s} className="bg-gray-900 text-white">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white hover:border-white/[0.12] transition-all outline-none focus:border-emerald-500/40"
                >
                  {LANGUAGES.map(l => (
                    <option key={l} value={l} className="bg-gray-900 text-white">{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Delivery Method */}
            <div>
              <label className="block text-[10px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Delivery Method</label>
              <select
                value={deliveryMethod}
                onChange={e => setDeliveryMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white hover:border-white/[0.12] transition-all outline-none focus:border-emerald-500/40"
              >
                {DELIVERY_METHODS.map(m => (
                  <option key={m} value={m} className="bg-gray-900 text-white">{m}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-[10px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="Enter the emergency message to broadcast..."
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/[0.06] text-white placeholder:text-gray-600 hover:border-white/[0.12] transition-all outline-none focus:border-emerald-500/40 resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-gray-600">{message.length} characters</span>
              </div>
            </div>

            {/* Recipient Preview */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <Users size={16} className="text-emerald-400 shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-400">Estimated recipients in </span>
                <span className="text-xs font-medium text-white">{wetland}:</span>
              </div>
              {loadingCount ? (
                <Loader2 size={14} className="text-gray-500 animate-spin" />
              ) : (
                <span className="text-sm font-bold text-emerald-400">{recipientCount ?? 0}</span>
              )}
            </div>

            {/* Severity Preview Badge */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Severity preview:</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${SEVERITY_CONFIG[severity].bg} ${SEVERITY_CONFIG[severity].color} ${SEVERITY_CONFIG[severity].border}`}>
                <AlertTriangle size={10} />
                {SEVERITY_CONFIG[severity].label}
              </span>
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Wetland</span>
                <span className="text-xs font-medium text-white">{wetland}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Severity</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${SEVERITY_CONFIG[severity].bg} ${SEVERITY_CONFIG[severity].color} ${SEVERITY_CONFIG[severity].border}`}>
                  <AlertTriangle size={10} />
                  {SEVERITY_CONFIG[severity].label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Language</span>
                <span className="text-xs font-medium text-white">{language}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Delivery</span>
                <span className="text-xs font-medium text-white">{deliveryMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Recipients</span>
                <span className="text-xs font-bold text-emerald-400">{recipientCount ?? 0} citizens</span>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1.5">Title</span>
                <span className="text-xs font-medium text-white block">{title}</span>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1.5">Message Preview</span>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{message}</p>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-400">This action cannot be undone</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  An emergency alert will be sent to all {recipientCount ?? 0} registered citizens in {wetland}.
                </p>
              </div>
            </div>

            {/* Confirm Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.05] transition-all">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/[0.12] bg-white/[0.04] text-emerald-500 focus:ring-emerald-500/40 accent-emerald-500"
              />
              <span className="text-xs text-gray-300 leading-relaxed">
                I understand this will send an emergency alert to all citizens in <strong className="text-white">{wetland}</strong>
              </span>
            </label>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <div className="space-y-4">
            {/* Success Banner */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <CheckCircle size={20} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-400">Broadcast Sent Successfully</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Emergency alert delivered to citizens in {wetland}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                <p className="text-lg font-bold text-white">{result.total}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Total Contacted</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-center">
                <p className="text-lg font-bold text-emerald-400">{result.sent}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Delivered</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-center">
                <p className="text-lg font-bold text-red-400">{result.failed}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Failed</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                <p className={`text-lg font-bold ${successRate >= 90 ? 'text-emerald-400' : successRate >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                  {successRate}%
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Success Rate</p>
              </div>
            </div>

            {/* Success Rate Bar */}
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Delivery Progress</span>
                <span className="text-[10px] font-medium text-white">{successRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    successRate >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                    successRate >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                    'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>

            {/* Method Breakdown */}
            {methodBreakdown.length > 0 && (
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Delivery by Method</p>
                <div className="space-y-2">
                  {methodBreakdown.map((stat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {getMethodIcon(stat.method)}
                      <span className="text-xs text-white flex-1">{stat.method}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-300">{stat.count}</span>
                        {stat.status === 'success' ? (
                          <CheckCircle size={14} className="text-emerald-400" />
                        ) : (
                          <XCircle size={14} className="text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Details */}
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Delivery Summary</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span className="text-xs text-gray-400">Successfully Delivered</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-400">{result.sent}</span>
                </div>
                {result.failed > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle size={14} className="text-red-400" />
                      <span className="text-xs text-gray-400">Failed Deliveries</span>
                    </div>
                    <span className="text-xs font-medium text-red-400">{result.failed}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-white/[0.06]">
          {step < 3 ? (
            <>
              <button onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all"
              >
                Cancel
              </button>
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review Broadcast
                </button>
              )}
              {step === 2 && (
                <>
                  <button onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!confirmed || sending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Radio size={12} />
                        Send Emergency Broadcast
                      </>
                    )}
                  </button>
                </>
              )}
            </>
          ) : (
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
