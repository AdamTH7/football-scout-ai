import React, { useState, useEffect, useRef } from 'react';
import {
  Compass, Sliders, Shield, Users,
  Lock, Ban, Sparkles, ChevronDown, Target
} from 'lucide-react';
import { api } from '../api/client';

const FORMATIONS = [
  { value: '4-3-3',   label: '4-3-3',   desc: 'Attack / Width' },
  { value: '4-2-3-1', label: '4-2-3-1', desc: 'Double Pivot & #10' },
  { value: '4-4-2',   label: '4-4-2',   desc: 'Compact Block & 2 Strikers' },
  { value: '3-5-2',   label: '3-5-2',   desc: 'Wingback Flank Control' },
  { value: '3-4-3',   label: '3-4-3',   desc: 'High Overload' },
];

const OBJECTIVES = [
  { value: 'balanced',      label: 'Balanced',       color: '#10b981' },
  { value: 'high_press',    label: 'High Press',      color: '#ef4444' },
  { value: 'possession',    label: 'Possession',      color: '#3b82f6' },
  { value: 'counter_attack',label: 'Counter Attack',  color: '#f59e0b' },
  { value: 'low_block',     label: 'Low Block',       color: '#8b5cf6' },
];

const WEIGHT_KEYS = [
  { key: 'form_weight',         label: 'Recent Rolling Form',      color: '#10b981' },
  { key: 'role_weight',         label: 'Role Capability Score',    color: '#3b82f6' },
  { key: 'tactical_weight',     label: 'Tactical Matchup Fit',     color: '#f59e0b' },
  { key: 'style_weight',        label: 'Team-Style Compatibility',  color: '#8b5cf6' },
  { key: 'availability_weight', label: 'Availability & Workload',  color: '#06b6d4' },
];

function getTacticalHint(label, pct) {
  if (label.includes('Form')) {
    if (pct >= 40) return '🔥 Prioritizes players in peak 5-match rolling form';
    if (pct <= 10) return '❄ Low form sensitivity; relies heavily on base ratings';
    return 'Balanced form weighting across recent appearances';
  }
  if (label.includes('Role')) {
    if (pct >= 40) return '🎯 Strict role specialization; minimal out-of-position leeway';
    return 'Allows versatile players to cover adjacent tactical roles';
  }
  if (label.includes('Tactical')) {
    if (pct >= 40) return '🛡️ Aggressive anti-opposition tailoring based on opponent flaws';
    return 'Standard tactical matchup emphasis';
  }
  if (label.includes('Style')) {
    if (pct >= 30) return '🔄 Strict adherence to manager possession and pressing philosophy';
    return 'Flexible tactical style adaptation';
  }
  if (label.includes('Availability')) {
    if (pct >= 25) return '🔋 Strict biometric protection; rests fatigued or minor-knock players';
    return 'Aggressive squad deployment; accepts higher fatigue risk';
  }
  return '';
}

function WeightSlider({ label, color, value, onChange }) {
  const pct = Math.round(value * 100);
  const hint = getTacticalHint(label, pct);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-300 font-semibold">{label}</span>
        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white/[0.04]" style={{ color }}>{pct}%</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0" max="1" step="0.05"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, ${color} ${pct}%, #1e293b ${pct}%)`,
          }}
          className="w-full h-1.5 rounded-full cursor-pointer"
        />
      </div>
      <div className="text-[10px] text-slate-500 font-mono transition-all">
        {hint}
      </div>
    </div>
  );
}

export default function MatchSetup({ matchConfig, setMatchConfig, onRunOptimization }) {
  const [teams, setTeams]           = useState([]);
  const [squad, setSquad]           = useState([]);
  const [loadingSquad, setLoadingSquad] = useState(false);
  const [posFilter, setPosFilter]   = useState('ALL');

  useEffect(() => {
    api.getTeams().then(setTeams).catch(console.error);
  }, []);

  useEffect(() => {
    if (!matchConfig.team_id) return;
    setLoadingSquad(true);
    api.getPlayers({ team_id: matchConfig.team_id })
      .then(setSquad)
      .catch(console.error)
      .finally(() => setLoadingSquad(false));
  }, [matchConfig.team_id]);

  const toggleLock = (id) => {
    const locked = matchConfig.locked_player_ids.includes(id);
    setMatchConfig(prev => ({
      ...prev,
      locked_player_ids: locked
        ? prev.locked_player_ids.filter(x => x !== id)
        : [...prev.locked_player_ids, id],
      excluded_player_ids: prev.excluded_player_ids.filter(x => x !== id),
    }));
  };

  const toggleExclude = (id) => {
    const excluded = matchConfig.excluded_player_ids.includes(id);
    setMatchConfig(prev => ({
      ...prev,
      excluded_player_ids: excluded
        ? prev.excluded_player_ids.filter(x => x !== id)
        : [...prev.excluded_player_ids, id],
      locked_player_ids: prev.locked_player_ids.filter(x => x !== id),
    }));
  };

  const handleWeight = (key, val) => {
    setMatchConfig(prev => ({ ...prev, weights: { ...prev.weights, [key]: val } }));
  };

  const positions = ['ALL', ...Array.from(new Set(squad.map(p => p.primary_position))).sort()];
  const filteredSquad = posFilter === 'ALL' ? squad : squad.filter(p => p.primary_position === posFilter);

  const selectedObjective = OBJECTIVES.find(o => o.value === matchConfig.tactical_objective);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div>
        <div className="section-label"><Compass className="w-4 h-4" /> Matchday Parameters & Tactical Directive</div>
        <h1 className="page-title">Match Setup & Constraints</h1>
        <p className="page-sub">Define matchup, formation blueprint, tactical priority, player constraints, and optimizer weights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left 2/3 ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Fixture Card */}
          <div className="card p-6 space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Fixture & Venue Selection
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Your Team</label>
                <select
                  value={matchConfig.team_id}
                  onChange={e => setMatchConfig({ ...matchConfig, team_id: e.target.value, locked_player_ids: [], excluded_player_ids: [] })}
                  className="select-field"
                >
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Opponent</label>
                <select
                  value={matchConfig.opponent_id}
                  onChange={e => setMatchConfig({ ...matchConfig, opponent_id: e.target.value })}
                  className="select-field"
                >
                  {teams.filter(t => t.id !== matchConfig.team_id).map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Formation</label>
                <select
                  value={matchConfig.formation}
                  onChange={e => setMatchConfig({ ...matchConfig, formation: e.target.value })}
                  className="select-field"
                >
                  {FORMATIONS.map(f => (
                    <option key={f.value} value={f.value}>{f.label} — {f.desc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Tactical Objective</label>
                <select
                  value={matchConfig.tactical_objective}
                  onChange={e => setMatchConfig({ ...matchConfig, tactical_objective: e.target.value })}
                  className="select-field"
                >
                  {OBJECTIVES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Venue</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-700/60 bg-[#080e1a] p-0.5 gap-0.5">
                  {['Home', 'Away'].map(v => {
                    const isHome = v === 'Home';
                    const active = matchConfig.is_home === isHome;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setMatchConfig({ ...matchConfig, is_home: isHome })}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                          active
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tactical Objective Visual */}
            <div className="flex flex-wrap gap-2 pt-1">
              {OBJECTIVES.map(o => (
                <button
                  key={o.value}
                  onClick={() => setMatchConfig({ ...matchConfig, tactical_objective: o.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    matchConfig.tactical_objective === o.value
                      ? 'text-slate-950'
                      : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}
                  style={matchConfig.tactical_objective === o.value ? {
                    background: o.color, borderColor: o.color
                  } : {}}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Squad Roster */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Squad Availability & Constraint Locking
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Lock must-start players or exclude injured / suspended ones</p>
              </div>
              <div className="flex items-center gap-3">
                {matchConfig.locked_player_ids.length > 0 && (
                  <span className="badge-emerald">
                    <Lock className="w-3 h-3" /> {matchConfig.locked_player_ids.length} Locked
                  </span>
                )}
                {matchConfig.excluded_player_ids.length > 0 && (
                  <span className="badge-rose">
                    <Ban className="w-3 h-3" /> {matchConfig.excluded_player_ids.length} Excluded
                  </span>
                )}
              </div>
            </div>

            {/* Position Filter */}
            <div className="flex flex-wrap gap-1.5">
              {positions.map(pos => (
                <button
                  key={pos}
                  onClick={() => setPosFilter(pos)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all border ${
                    posFilter === pos
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            {loadingSquad ? (
              <div className="py-10 text-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Loading squad...</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {filteredSquad.map(player => {
                  const isLocked   = matchConfig.locked_player_ids.includes(player.id);
                  const isExcluded = matchConfig.excluded_player_ids.includes(player.id);
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs border transition-all ${
                        isLocked   ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : isExcluded ? 'bg-rose-950/20 border-rose-800/30 text-slate-500 opacity-50'
                        : 'bg-white/[0.02] border-slate-800/60 text-slate-200 hover:border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 text-center font-mono text-[10px] font-bold px-1 py-0.5 rounded bg-slate-900 text-slate-300">
                          {player.primary_position}
                        </span>
                        <span className="font-semibold">{player.name}</span>
                        {!player.is_available && (
                          <span className="text-[10px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900">
                            ⚠ Unconfirmed
                          </span>
                        )}
                        {player.fatigue_index > 30 && (
                          <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900">
                            Fatigued
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-600 font-mono mr-1">
                          {player.fitness_rating?.toFixed(0)}%
                        </span>
                        <button
                          onClick={() => toggleLock(player.id)}
                          className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                            isLocked
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 hover:text-emerald-400 hover:bg-slate-700'
                          }`}
                          title="Lock in Starting XI"
                        >
                          <Lock className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => toggleExclude(player.id)}
                          className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                            isExcluded
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30'
                              : 'bg-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-700'
                          }`}
                          title="Exclude from selection"
                        >
                          <Ban className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right 1/3 ────────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Optimizer Weights
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                HEURISTIC
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Balance player selection components to match your tactical philosophy.
            </p>

            <div className="space-y-5">
              {WEIGHT_KEYS.map(w => (
                <WeightSlider
                  key={w.key}
                  label={w.label}
                  color={w.color}
                  value={matchConfig.weights[w.key]}
                  onChange={val => handleWeight(w.key, val)}
                />
              ))}
            </div>

            {/* Weight Total Indicator */}
            <div className="pt-2 border-t border-slate-800/60">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Total Weight Sum</span>
                <span className="font-mono text-slate-300">
                  {Object.values(matchConfig.weights).reduce((a,b) => a+b, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Optimize Button */}
          <button
            type="button"
            onClick={onRunOptimization}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.98] glow-emerald"
          >
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>Optimize Starting XI & Tactical Blueprint</span>
          </button>

          {/* Info Card */}
          <div className="card-sm p-4 space-y-2">
            <p className="text-[11px] text-slate-400 font-semibold">How it works</p>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              {[
                'Constrained assignment via Hungarian algorithm',
                'Evaluates all 11 positions simultaneously',
                'Respects locked & excluded player constraints',
                'Generates managerial briefing & bench options',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
