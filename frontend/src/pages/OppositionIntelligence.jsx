import React, { useState, useEffect } from 'react';
import {
  Trophy, Shield, AlertTriangle, ChevronRight,
  Activity, Target, TrendingDown, TrendingUp, Zap
} from 'lucide-react';
import { api } from '../api/client';

const SEVERITY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

function RadarBar({ label, value, max = 2.5, color = '#10b981' }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono font-semibold" style={{ color }}>{value.toFixed(2)}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function TacticalFactor({ factor }) {
  const color = SEVERITY_COLORS[factor.severity] || '#94a3b8';
  return (
    <div className="p-4 rounded-xl border bg-white/[0.02] transition-all hover:border-slate-700" style={{ borderColor: color + '25' }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-slate-100">{factor.category}</span>
        <span
          className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color, background: color + '1a', border: `1px solid ${color}30` }}
        >
          {factor.severity}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">{factor.description}</p>
      <p className="text-[11px] text-slate-600 mt-1.5 italic">{factor.data_evidence}</p>
    </div>
  );
}

export default function OppositionIntelligence({ defaultOpponentId = 'RMA' }) {
  const [teams,      setTeams]      = useState([]);
  const [myTeam,     setMyTeam]     = useState('MCI');
  const [opponent,   setOpponent]   = useState(defaultOpponentId);
  const [analysis,   setAnalysis]   = useState(null);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    api.getTeams().then(setTeams).catch(console.error);
  }, []);

  useEffect(() => {
    if (!opponent) return;
    setLoading(true);
    api.analyzeOpposition({ team_id: myTeam, opponent_id: opponent })
      .then(setAnalysis)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [opponent, myTeam]);

  const pressingColor = analysis?.ppda_avg < 9.5 ? '#ef4444'
    : analysis?.ppda_avg < 13 ? '#f59e0b' : '#10b981';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div>
        <div className="section-label"><Trophy className="w-4 h-4" /> Pre-Match Opposition Scouting Report</div>
        <h1 className="page-title">Opposition Intelligence</h1>
        <p className="page-sub">Tactical blueprint, pressing diagnostics, vulnerability maps, and recommended counter-approaches.</p>
      </div>

      {/* Team Selector */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">My Team</label>
            <select value={myTeam} onChange={e => setMyTeam(e.target.value)} className="select-field w-44">
              {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
            </select>
          </div>
          <span className="text-slate-600 font-bold text-lg">vs</span>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Opponent</label>
            <select value={opponent} onChange={e => setOpponent(e.target.value)} className="select-field w-44">
              {teams.filter(t => t.id !== myTeam).map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
              ))}
            </select>
          </div>
          {loading && (
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </div>
          )}
        </div>
      </div>

      {analysis && !loading && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Matches Analyzed',  value: analysis.matches_analyzed,              color: '#94a3b8' },
              { label: 'Goals Scored / G',  value: analysis.goals_scored_avg?.toFixed(2),  color: '#10b981' },
              { label: 'Goals Conceded / G',value: analysis.goals_conceded_avg?.toFixed(2),color: '#ef4444' },
              { label: 'xG / Game',         value: analysis.xg_avg?.toFixed(2),            color: '#f59e0b' },
              { label: 'xG Conceded / G',   value: analysis.xg_conceded_avg?.toFixed(2),   color: '#3b82f6' },
              { label: 'Possession %',      value: `${analysis.possession_avg?.toFixed(1)}%`, color: '#8b5cf6' },
            ].map(({ label, value, color }) => (
              <div key={label} className="stat-card text-center items-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</div>
                <div className="text-2xl font-black font-mono" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Pressing & Tactical Profile ─────────────────── */}
            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Pressing Profile
              </h2>

              <div className="text-center py-4 rounded-2xl border bg-white/[0.02]" style={{ borderColor: pressingColor + '30' }}>
                <div className="text-4xl font-black font-mono" style={{ color: pressingColor }}>
                  {analysis.ppda_avg?.toFixed(1)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">PPDA (lower = more aggressive)</div>
                <div
                  className="mt-3 inline-block px-4 py-1.5 rounded-full text-xs font-bold"
                  style={{ color: pressingColor, background: pressingColor + '15', border: `1px solid ${pressingColor}30` }}
                >
                  {analysis.pressing_intensity}
                </div>
              </div>

              <div className="space-y-3">
                <RadarBar label="xG Created / Game"   value={analysis.xg_avg || 0}          max={2.5} color="#f59e0b" />
                <RadarBar label="xG Conceded / Game"  value={analysis.xg_conceded_avg || 0} max={2.5} color="#ef4444" />
                <RadarBar label="Possession %"        value={analysis.possession_avg || 50}  max={75}  color="#8b5cf6" />
              </div>

              {/* Formation Vulnerability */}
              {analysis.formation_vulnerabilities && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400">Formation Vulnerability Index</p>
                  {Object.entries(analysis.formation_vulnerabilities).map(([form, score]) => (
                    <div key={form} className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold text-slate-300 w-14">{form}</span>
                      <div className="flex-1 progress-bar">
                        <div className="progress-fill" style={{
                          width: `${Math.min(100, (score / 2) * 100)}%`,
                          background: score > 1.5 ? '#ef4444' : score > 1.0 ? '#f59e0b' : '#10b981'
                        }} />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 w-8 text-right">{score.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Vulnerabilities & Strengths ─────────────────── */}
            <div className="space-y-4">
              <div className="card p-5 space-y-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Exploitable Vulnerabilities ({analysis.vulnerabilities?.length || 0})
                </h2>
                {analysis.vulnerabilities?.length ? (
                  <div className="space-y-2">
                    {analysis.vulnerabilities.map((v, i) => <TacticalFactor key={i} factor={v} />)}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-3">No major vulnerabilities detected.</p>
                )}
              </div>

              <div className="card p-5 space-y-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Key Strengths ({analysis.strengths?.length || 0})
                </h2>
                {analysis.strengths?.length ? (
                  <div className="space-y-2">
                    {analysis.strengths.map((s, i) => <TacticalFactor key={i} factor={s} />)}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-3">No dominant strengths detected.</p>
                )}
              </div>
            </div>

            {/* ── Recommended Tactics ─────────────────────────── */}
            <div className="card p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Recommended Tactics
              </h2>
              <p className="text-[11px] text-slate-500">
                AI-generated tactical instructions based on {analysis.matches_analyzed} historical matches.
              </p>

              <div className="space-y-2.5">
                {analysis.recommended_tactics?.map((tactic, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-emerald-500/10 hover:border-emerald-500/20 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-[10px] font-black text-emerald-400 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{tactic}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
                Analysis based on {analysis.matches_analyzed} matches · Data from StatsBomb format
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
