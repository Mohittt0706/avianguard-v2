import { useState, useEffect } from 'react';
import {
  Brain, Activity, AlertTriangle, Shield, MapPin, Crosshair,
  Target, Eye, X, Bell, TrendingUp, Lightbulb, Search,
} from 'lucide-react';
import ElectricBorder from '../ElectricBorder';
import { aiApi, type AICard, type AIAnalysisResponse } from '@/services/aiApi';

const severityConfig: Record<string, { color: string; bg: string; border: string; cardBorder: string; dot: string; glow: string }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', cardBorder: 'border-l-red-500', dot: 'bg-red-500', glow: 'shadow-red-500/10' },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', cardBorder: 'border-l-orange-500', dot: 'bg-orange-500', glow: 'shadow-orange-500/10' },
  MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', cardBorder: 'border-l-amber-500', dot: 'bg-amber-500', glow: 'shadow-amber-500/10' },
  LOW: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', cardBorder: 'border-l-emerald-500', dot: 'bg-emerald-500', glow: 'shadow-emerald-500/10' },
  NONE: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', cardBorder: 'border-l-gray-500', dot: 'bg-gray-500', glow: 'shadow-gray-500/10' },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function getConfidenceColor(score: number) {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 70) return 'bg-amber-500';
  return 'bg-orange-500';
}

function getRiskBg(score: number) {
  if (score >= 70) return 'from-red-500/20 to-red-600/10';
  if (score >= 40) return 'from-orange-500/20 to-amber-600/10';
  if (score >= 20) return 'from-amber-500/20 to-yellow-600/10';
  return 'from-emerald-500/20 to-green-600/10';
}

function getRiskColor(score: number) {
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-orange-400';
  if (score >= 20) return 'text-amber-400';
  return 'text-emerald-400';
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.06] rounded-xl ${className}`} />;
}

function CardDetailModal({ card, onClose }: { card: AICard; onClose: () => void }) {
  const sevKey = card.severity in severityConfig ? card.severity : 'NONE';
  const sev = severityConfig[sevKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <ElectricBorder color={card.severity === 'CRITICAL' ? '#DC2626' : '#F59E0B'} speed={0.6} chaos={0.08} borderRadius={16}>
        <div className="relative bg-gray-900 border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className={`px-6 py-4 border-b border-white/[0.06] flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${sev.bg}`}>
                <Activity size={20} className={sev.color} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{card.sensorName}</h3>
                <p className="text-xs text-gray-500">{card.sensorLocation}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all">
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Alert Details</span>
                <span className={`text-xs font-medium ${sev.color}`}>{card.severity}</span>
              </div>
              <p className="text-sm text-gray-200 mt-1 leading-relaxed">{card.description}</p>
            </div>
            {card.currentValue != null && (
              <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                <span className="text-xs text-gray-500">Current Reading</span>
                <p className="text-lg font-bold text-white mt-1">{card.currentValue} <span className="text-xs font-normal text-gray-500">{card.safeRange ? `Safe: ${card.safeRange}` : ''}</span></p>
              </div>
            )}
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <span className="text-[11px] text-gray-500 flex items-center gap-1"><Crosshair size={11} className="text-orange-500" /> Possible Cause</span>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{card.possibleCause}</p>
            </div>
            <div className={`p-3 rounded-xl border ${sev.border} ${sev.bg}`}>
              <span className="text-[11px] font-semibold text-white flex items-center gap-1 mb-1"><Shield size={11} className={sev.color} /> Suggested Action</span>
              <p className="text-xs text-gray-200 leading-relaxed">{card.suggestedAction}</p>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end">
            <button onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-white/[0.06] hover:bg-white/[0.1] transition-all">
              Close
            </button>
          </div>
        </div>
      </ElectricBorder>
    </div>
  );
}

export function AIAlertsPage() {
  const [data, setData] = useState<AIAnalysisResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<AICard | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadAnalysis();
    const interval = setInterval(loadAnalysis, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadAnalysis() {
    try {
      const res = await aiApi.getAnalysis();
      setData(res.data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load AI analysis';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-xl" />
          <div className="space-y-2"><Skeleton className="h-6 w-56" /><Skeleton className="h-4 w-72" /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid lg:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Brain size={40} className="text-red-400 mb-4" />
        <p className="text-sm text-gray-400 mb-2">Failed to load AI analysis</p>
        <p className="text-xs text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-xs font-semibold text-white hover:from-emerald-400 hover:to-blue-500 transition-all"
        >Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const filteredCards = filter === 'all'
    ? data.cards
    : data.cards.filter(c => c.severity === filter);

  const severityCounts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const c of data.cards) {
    if (severityCounts[c.severity] !== undefined) severityCounts[c.severity]++;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-purple-500/10 rounded-xl">
          <Brain size={22} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI Decision Center</h1>
          <p className="text-sm text-gray-400">AI-powered environmental threat analysis & decision support system</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Risk Score', value: `${data.riskScore}/100`, icon: Target, color: getRiskColor(data.riskScore), bg: `bg-${getRiskColor(data.riskScore).replace('text-', '')}/10` },
          { label: 'AI Confidence', value: `${data.confidenceScore}%`, icon: Brain, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Active Threats', value: data.totalAlerts, icon: AlertTriangle, color: data.totalAlerts > 0 ? 'text-red-400' : 'text-emerald-400', bg: data.totalAlerts > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10' },
          { label: 'Sensors Online', value: `${data.onlineSensors}/${data.totalSensors}`, icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        ].map(stat => {
          const Icon = stat.icon;
          const bgClass = stat.bg;
          return (
            <div key={stat.label} className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${bgClass}`}>
                  <Icon size={14} className={stat.color} />
                </div>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* Risk Score Bar */}
      <div className={`bg-gradient-to-r ${getRiskBg(data.riskScore)} backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5`}>
        <div className="flex items-center gap-3 mb-3">
          <Shield size={18} className={getRiskColor(data.riskScore)} />
          <h2 className="text-sm font-bold text-white">Risk Assessment</h2>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getRiskColor(data.riskScore)} bg-white/[0.06]`}>
            Score: {data.riskScore}/100
          </span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{data.summary}</p>
        {/* Risk bar */}
        <div className="mt-3 h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              data.riskScore >= 70 ? 'bg-red-500' : data.riskScore >= 40 ? 'bg-orange-500' : data.riskScore >= 20 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${data.riskScore}%` }}
          />
        </div>
      </div>

      {/* AI Analysis Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* AI Summary */}
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">AI Summary</h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{data.summary}</p>
        </div>

        {/* Recommendation */}
        <div className="bg-gradient-to-br from-emerald-500/[0.06] to-blue-500/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Recommendation</h3>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">{data.recommendation}</p>
        </div>

        {/* Trend Analysis */}
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Trend Analysis</h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{data.trendAnalysis}</p>
          {data.trendSummary && (
            <p className="text-xs text-gray-500 mt-2">{data.trendSummary}</p>
          )}
        </div>

        {/* Possible Cause */}
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Search size={16} className="text-orange-400" />
            <h3 className="text-sm font-bold text-white">Possible Cause</h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{data.possibleCause}</p>
        </div>
      </div>

      {/* Suggested Action */}
      <div className="bg-gradient-to-r from-red-500/[0.06] via-orange-500/[0.04] to-transparent backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-red-400" />
          <h3 className="text-sm font-bold text-white">Suggested Action</h3>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed">{data.suggestedAction}</p>
      </div>

      {/* Active Threat Cards */}
      {data.totalAlerts > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              <h2 className="text-sm font-bold text-white">Active Threats</h2>
              <span className="text-xs text-gray-500">({data.totalAlerts} threat{data.totalAlerts !== 1 ? 's' : ''} detected)</span>
            </div>
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Target size={13} className="text-gray-500" />
              {['all', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(f => {
                const sev = f !== 'all' ? severityConfig[f] : null;
                const count = f === 'all' ? data.totalAlerts : (severityCounts[f] || 0);
                if (count === 0 && f !== 'all') return null;
                return (
                  <button key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      filter === f
                        ? sev ? `${sev.bg} ${sev.border} ${sev.color} border` : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'text-gray-500 hover:text-white hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    {f === 'all' ? 'All' : f}
                    <span className="ml-1 opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {filteredCards.map(card => {
              const sevKey = card.severity in severityConfig ? card.severity : 'NONE';
              const sev = severityConfig[sevKey];
              return (
                <div key={card.id}
                  className={`group bg-white/[0.03] backdrop-blur-sm rounded-2xl border ${sev.border} border-l-[3px] ${sev.cardBorder} overflow-hidden hover:bg-white/[0.05] transition-all duration-300 hover:shadow-xl ${sev.glow}`}
                >
                  <div className="px-5 pt-4 pb-3 flex items-start justify-between border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${sev.bg}`}>
                        <Activity size={18} className={sev.color} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${sev.bg} ${sev.color} border ${sev.border} uppercase tracking-wider`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} ${card.severity === 'CRITICAL' ? 'animate-pulse' : ''}`} />
                            {card.severity}
                          </span>
                          <span className="text-[10px] font-mono text-gray-600">{card.alertType}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{formatTime(card.timestamp)}</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${sev.dot} ${card.severity === 'CRITICAL' ? 'animate-pulse' : ''}`} />
                  </div>

                  <div className="px-5 py-3 border-b border-white/[0.04]">
                    <p className="text-sm text-white">{card.sensorName}</p>
                    <p className="text-xs text-gray-500">{card.sensorLocation}</p>
                  </div>

                  <div className="px-5 py-3 border-b border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Brain size={11} className="text-emerald-500" /> AI Confidence
                      </span>
                      <span className="text-xs font-bold text-white">{card.confidenceScore}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${getConfidenceColor(card.confidenceScore)}`}
                        style={{ width: `${card.confidenceScore}%` }} />
                    </div>
                  </div>

                  <div className="px-5 py-3 space-y-2">
                    <p className="text-xs text-gray-300 leading-relaxed">{card.summary}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{card.possibleCause}</p>
                  </div>

                  <div className="px-5 py-3 flex items-center gap-3 border-t border-white/[0.04]">
                    <button
                      onClick={() => setSelectedCard(card)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all"
                    >
                      <Eye size={13} /> View Details
                    </button>
                    <div className={`flex-1 p-2.5 rounded-xl border ${sev.border} ${sev.bg}`}>
                      <p className="text-[10px] text-gray-200 leading-relaxed line-clamp-2">{card.suggestedAction}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty State */}
      {data.totalAlerts === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.03] rounded-2xl border border-white/[0.06]">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <Shield size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No environmental threats detected.</h2>
          <p className="text-sm text-gray-500 mb-1">All monitored wetlands are within safe parameters.</p>
          <p className="text-xs text-gray-600">{data.onlineSensors}/{data.totalSensors} sensors online across {data.totalWetlands} wetlands</p>
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
