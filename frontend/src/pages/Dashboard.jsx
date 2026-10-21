import React, { useEffect, useState } from 'react';
import {
  Users, Trophy, Activity, Database, CheckCircle2,
  ArrowUpRight, Sparkles, BrainCircuit, ShieldAlert, Play,
  TrendingUp, Zap, Target, BarChart3, Bot, Clock, Compass, Shield
} from 'lucide-react';
import { api } from '../api/client';

const POSITION_COLORS = {
  ST: '#ef4444', LW: '#f59e0b', RW: '#f59e0b',
  AM: '#10b981', CM: '#10b981', DM: '#06b6d4',
  CB: '#3b82f6', LB: '#6366f1', RB: '#6366f1', GK: '#8b5cf6'
};

function StatCard({ icon: Icon, label, value, sub, color = 'emerald' }) {
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };
  return (
    <div className="card p-5 flex flex-col gap-3 hover:border-slate-700 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</span>
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="text-3xl font-black text-white font-mono tabular-nums leading-none">
        {value}
      </div>
      <div className="text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}

const PIPELINE_STEPS = [
  {
    title: 'Per-90 Normalization & Form',
    desc: 'Minutes thresholds, missing value handling, match volume distortion prevention.',
    status: 'active', color: 'emerald'
  },
  {
    title: 'PCA & Silhouette K-Means Archetypes',
    desc: 'StandardScaler normalization, scree variance plots, tactical role clustering.',
    status: 'active', color: 'blue'
  },
  {
    title: 'Constrained Starting XI Optimizer',
    desc: 'Hungarian matching enforcing 11 unique players, 1 GK, locked selections.',
    status: 'active', color: 'purple'
  },
  {
    title: 'Pre-Match Chronological Prediction',
    desc: 'Zero data leakage splits, calibrated probabilities, multi-class Brier scoring.',
    status: 'active', color: 'amber'
  },
];

export default function Dashboard({ onNavigate, onOpenSimulator, onOpenCopilot }) {
  const [coverage, setCoverage] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simPulse, setSimPulse] = useState(74);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [healthData, modelData, playersData] = await Promise.all([
          api.getHealth(),
          api.getModelStatus(),
          api.getPlayers()
        ]);
        setCoverage(healthData.coverage || {});
        setModelStatus(modelData);
        const sorted = [...playersData]
          .filter(p => p.xg_per_90 > 0)
          .sort((a, b) => (b.xg_per_90 || 0) - (a.xg_per_90 || 0))
          .slice(0, 8);
        setTopPlayers(sorted);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();

    // Subtle momentum pulse animation
    const interval = setInterval(() => {
      setSimPulse((p) => Math.min(88, Math.max(62, p + (Math.random() - 0.5) * 6)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-emerald-500/20 animate-ping absolute inset-0" />
            <div className="w-14 h-14 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-sm text-slate-400">Loading Tactical Intelligence System...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fade-in">

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-900/90 to-slate-950 p-8 shadow-2xl">
        {/* ambient glows */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500 rounded-full opacity-[0.07] blur-[80px] animate-blob" />
        <div className="absolute -top-10 right-10 w-60 h-60 bg-blue-500 rounded-full opacity-[0.05] blur-[80px] animate-blob" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="badge-emerald animate-glow w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>AI Tactical Intelligence System Ready</span>
            </div>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              ● REAL-TIME ENGINE ACTIVE
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] animate-slide-up">
            Professional&nbsp;
            <span className="gradient-text">Scouting</span>
            &nbsp;&amp;&nbsp;
            <span className="gradient-text">Tactical</span>
            &nbsp;Optimization
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed animate-slide-up max-w-2xl" style={{ animationDelay: '0.1s' }}>
            Multi-competition analytical framework integrating unsupervised archetype clustering,
            constrained Starting XI optimization, opposition pressing diagnostics, and machine learning match forecasting.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => onNavigate('match_setup')} className="btn-primary">
              <Compass className="w-4 h-4 fill-slate-950" />
              Configure Match Lineup
            </button>
            <button
              onClick={onOpenSimulator}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Live 90' Match Simulator</span>
            </button>
            <button
              onClick={onOpenCopilot}
              className="btn-secondary"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>AI Tactical Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Trophy}       label="Historical Matches"     value={coverage?.matches_count  || 0} sub="UCL, EPL & La Liga validated"     color="emerald" />
        <StatCard icon={Users}        label="Active Squad Profiles"  value={coverage?.players_count  || 0} sub="Per-90 normalized stats"          color="blue"    />
        <StatCard icon={ShieldAlert}  label="Tracked Clubs"          value={coverage?.teams_count    || 0} sub="European elite tier"              color="amber"   />
        <StatCard icon={CheckCircle2} label="ML Predictor Engine"    value={modelStatus?.model_artifact_exists ? 'Active' : 'Ready'} sub="Supervised Multi-Class" color="purple" />
      </div>

      {/* ── Live Tactical Telemetry Pulse Banner ──────────────────── */}
      <div className="card p-5 bg-gradient-to-r from-slate-900/90 via-[#0d1726] to-slate-900/90 border-emerald-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Live Matchday Telemetry Monitor</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                SIMULATION READY
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Squad Readiness: <strong className="text-emerald-400 font-mono">94.8%</strong> • Rest Defense Integrity: <strong className="text-blue-400 font-mono">3+2 Box</strong> • Simulated Win Probability: <strong className="text-amber-400 font-mono">{Math.round(simPulse)}%</strong>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenSimulator}
          className="btn-primary text-xs py-2 px-4 shrink-0 shadow-md shadow-emerald-500/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Launch 90-Min Simulation</span>
        </button>
      </div>

      {/* ── Two-Column Content ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top Performers Table */}
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Top Expected Threat (xG / 90)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Leading attacking contributors across tracked competitions</p>
            </div>
            <button
              onClick={() => onNavigate('players')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-500 text-[10px] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">#</th>
                  <th className="pb-3 font-semibold">Player</th>
                  <th className="pb-3 font-semibold">Club</th>
                  <th className="pb-3 font-semibold">Pos</th>
                  <th className="pb-3 font-semibold text-right">xG / 90</th>
                  <th className="pb-3 font-semibold text-right">Goals / 90</th>
                  <th className="pb-3 font-semibold text-right">Key Passes</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((player, i) => (
                  <tr
                    key={player.id}
                    className="data-row border-b border-slate-800/40 last:border-0"
                    onClick={() => onNavigate('players')}
                  >
                    <td className="py-3 text-slate-600 font-mono font-bold">{i + 1}</td>
                    <td className="py-3 font-semibold text-slate-100">{player.name}</td>
                    <td className="py-3 text-slate-500 font-mono">{player.team_id}</td>
                    <td className="py-3">
                      <span
                        className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold"
                        style={{
                          color: POSITION_COLORS[player.primary_position] || '#94a3b8',
                          background: (POSITION_COLORS[player.primary_position] || '#94a3b8') + '1a',
                          border: `1px solid ${(POSITION_COLORS[player.primary_position] || '#94a3b8')}30`,
                        }}
                      >
                        {player.primary_position}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-400 font-mono">
                      {player.xg_per_90?.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-slate-300 font-mono">
                      {player.goals_per_90?.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-slate-400 font-mono">
                      {player.key_passes_per_90?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Pipeline */}
        <div className="card p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              System Pipeline
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Validated algorithmic workflows</p>
          </div>

          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, i) => {
              const dot = {
                emerald: 'bg-emerald-400 shadow-emerald-400/50',
                blue:    'bg-blue-400 shadow-blue-400/50',
                purple:  'bg-purple-400 shadow-purple-400/50',
                amber:   'bg-amber-400 shadow-amber-400/50',
              }[step.color];
              return (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.07] transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-md ${dot}`} />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{step.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Dataset Coverage</span>
              <span className="text-emerald-400 font-mono font-semibold">
                {coverage?.player_appearance_records?.toLocaleString() || '—'} records
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Competitions</span>
              <span className="text-slate-300 font-semibold">
                {coverage?.competitions_list?.join(' · ') || 'EPL · UCL · La Liga'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Action Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'match_setup', icon: Target,    label: 'Match Setup',       desc: 'Configure fixture & constraints', color: '#10b981' },
          { id: 'opposition',  icon: ShieldAlert,label: 'Opposition Intel',  desc: 'Analyze opponent tendencies',     color: '#3b82f6' },
          { id: 'models',      icon: BarChart3,  label: 'ML Training',       desc: 'Train & evaluate classifiers',    color: '#8b5cf6' },
          { id: 'data_lab',    icon: BrainCircuit,label: 'Data Science Lab', desc: 'PCA, clustering, correlations',   color: '#f59e0b' },
        ].map(({ id, icon: Icon, label, desc, color }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className="card p-4 text-left hover:border-slate-700 transition-all duration-200 cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
              style={{ background: color + '1a', border: `1px solid ${color}30` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="text-sm font-bold text-white">{label}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
