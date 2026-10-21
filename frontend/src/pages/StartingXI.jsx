import React, { useState } from 'react';
import {
  Crosshair, Shield, Sparkles, AlertTriangle,
  UserCheck, Compass, Star, TrendingUp, ChevronRight
} from 'lucide-react';
import Pitch from '../components/Pitch';

function ScoreBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono font-bold text-white">{value}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function StartingXI({ optimizationResult, onNavigateToSetup }) {
  const [selectedStarter, setSelectedStarter] = useState(
    optimizationResult?.starters?.[0] || null
  );

  if (!optimizationResult?.starters) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-5 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
          <Crosshair className="w-10 h-10 text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Lineup Computed Yet</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Configure your match fixture, formation, and tactical objective in Match Setup to run the constrained Starting XI optimization algorithm.
        </p>
        <button
          onClick={onNavigateToSetup}
          className="btn-primary mx-auto"
        >
          <Compass className="w-4 h-4" />
          Go to Match Setup
        </button>
      </div>
    );
  }

  const {
    team_id, opponent_id, formation, tactical_objective,
    average_suitability_score, starters, bench,
    tactical_summary, warnings
  } = optimizationResult;

  const activeStarter = selectedStarter || starters[0];
  const p = activeStarter?.player;

  const tacticalColor =
    tactical_objective === 'high_press'     ? '#ef4444' :
    tactical_objective === 'counter_attack' ? '#f59e0b' :
    tactical_objective === 'possession'     ? '#3b82f6' :
    tactical_objective === 'low_block'      ? '#8b5cf6' : '#10b981';

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="section-label"><Crosshair className="w-4 h-4" /> Optimal Lineup Solution</div>
          <h1 className="page-title flex items-center gap-3">
            {team_id}
            <span className="text-slate-500">vs</span>
            {opponent_id}
            <span
              className="text-sm px-3 py-1 rounded-full font-mono font-bold"
              style={{ background: '#10b98115', color: '#10b981', border: '1px solid #10b98130' }}
            >
              {formation}
            </span>
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-500">
              Constrained assignment optimization ·
            </span>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-bold"
              style={{ background: tacticalColor + '15', color: tacticalColor, border: `1px solid ${tacticalColor}25` }}
            >
              {tactical_objective.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="card-sm px-5 py-3 text-right shrink-0">
          <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Avg Suitability</div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{average_suitability_score}</div>
          <div className="text-[10px] text-slate-600">out of 100</div>
        </div>
      </div>

      {/* Warnings */}
      {warnings?.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{warnings.join(' ')}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Pitch (7 cols) ──────────────────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card p-4 shadow-2xl">
            <Pitch
              formation={formation}
              starters={starters}
              onSelectPlayer={setSelectedStarter}
              selectedPlayerId={activeStarter?.player?.player_id}
            />
          </div>

          {/* Tactical Summary */}
          <div className="card p-5 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block mb-1">Managerial Briefing</span>
              <p className="text-xs text-slate-300 leading-relaxed">{tactical_summary}</p>
            </div>
          </div>
        </div>

        {/* ── Detail Panel (5 cols) ─────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Player Card */}
          {p && (
            <div className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-emerald text-[10px]">{activeStarter.role_code}</span>
                    <span className="text-[11px] text-slate-500">{activeStarter.role_name}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{p.name}</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Natural position: {p.primary_position}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    {Math.round(p.suitability_score)}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Suitability</div>
                </div>
              </div>

              {/* Tactical Instruction */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/15">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tactical Instruction</span>
                <span className="text-xs text-emerald-300 font-medium leading-relaxed">{activeStarter.tactical_instruction}</span>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-slate-300">Suitability Factor Breakdown</span>
                <ScoreBar label="Recent Rolling Form"     value={p.form_score}         color="#3b82f6" />
                <ScoreBar label="Role Capability"        value={p.role_score}         color="#10b981" />
                <ScoreBar label="Tactical Matchup Fit"   value={p.tactical_score}     color="#f59e0b" />
                <ScoreBar label="Availability & Workload" value={p.availability_score} color="#8b5cf6" />
              </div>

              {/* Strengths & Risks */}
              <div className="space-y-2">
                {p.strengths?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-emerald-400 mb-1.5">Selection Drivers</p>
                    {p.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300 mb-1">
                        <span className="text-emerald-400 shrink-0">✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
                {p.risks?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-rose-400 mb-1.5">Identified Risks</p>
                    {p.risks.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400 mb-1">
                        <span className="text-amber-400 shrink-0">⚠</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bench */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                Recommended Bench
              </h3>
              <span className="text-[10px] font-mono text-slate-500">{bench?.length || 0} players</span>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {bench?.map(sub => (
                <div
                  key={sub.player_id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-slate-800/50 hover:border-slate-700/60 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-400">
                      {sub.primary_position}
                    </span>
                    <span className="font-semibold text-slate-200">{sub.name}</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400">{Math.round(sub.suitability_score)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
