import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, ChevronUp, ChevronDown,
  Sparkles, Activity, ShieldCheck, HeartPulse, Star, TrendingUp
} from 'lucide-react';
import { api } from '../api/client';

const POSITION_COLORS = {
  ST: '#ef4444', LW: '#f59e0b', RW: '#f59e0b',
  AM: '#10b981', CM: '#10b981', DM: '#06b6d4',
  CB: '#3b82f6', LB: '#6366f1', RB: '#6366f1', GK: '#8b5cf6'
};

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];

function StatMini({ label, value, color = '#10b981' }) {
  return (
    <div className="bg-[#080e1a] border border-slate-800/60 rounded-xl p-3 flex flex-col gap-1 text-center">
      <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</div>
      <div className="text-lg font-black font-mono" style={{ color }}>{value}</div>
    </div>
  );
}

function FitnessBar({ value, max = 100 }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct > 85 ? '#10b981' : pct > 65 ? '#f59e0b' : '#ef4444';
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function PlayerExplorer() {
  const [players,        setPlayers]        = useState([]);
  const [teams,          setTeams]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedTeam,   setSelectedTeam]   = useState('');
  const [selectedPos,    setSelectedPos]    = useState('');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [sortKey,        setSortKey]        = useState('xg_per_90');
  const [sortDir,        setSortDir]        = useState('desc');
  const [activePlayer,   setActivePlayer]   = useState(null);
  const [similarPlayers, setSimilarPlayers] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    api.getTeams().then(setTeams).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.getPlayers({
        team_id:  selectedTeam  || undefined,
        position: selectedPos   || undefined,
        search:   searchTerm    || undefined,
      })
        .then(data => {
          setPlayers(data);
          if (data.length > 0 && !activePlayer) handleSelect(data[0]);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedTeam, selectedPos, searchTerm]);

  const handleSelect = async (player) => {
    setActivePlayer(player);
    setLoadingSimilar(true);
    try {
      const sims = await api.getSimilarPlayers(player.id, 4);
      setSimilarPlayers(sims);
    } catch (e) {
      setSimilarPlayers([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...players].sort((a, b) => {
    const va = a[sortKey] ?? 0;
    const vb = b[sortKey] ?? 0;
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-emerald-400" />
      : <ChevronDown className="w-3 h-3 text-emerald-400" />;
  };

  const p = activePlayer;

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16 animate-fade-in">
      {/* Header */}
      <div>
        <div className="section-label"><Users className="w-4 h-4" /> Talent Database & Statistical Comparison</div>
        <h1 className="page-title">Player Intelligence Explorer</h1>
        <p className="page-sub">Per-90 normalized profiles, statistical twins via cosine similarity, and workload metrics.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search player name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          <select
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
            className="select-field w-44"
          >
            <option value="">All Clubs</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedPos('')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all border ${
                selectedPos === ''
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              ALL
            </button>
            {POSITIONS.map(pos => (
              <button
                key={pos}
                onClick={() => setSelectedPos(pos === selectedPos ? '' : pos)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all border ${
                  selectedPos === pos
                    ? 'text-slate-950'
                    : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                }`}
                style={selectedPos === pos ? {
                  background: POSITION_COLORS[pos] || '#10b981',
                  borderColor: POSITION_COLORS[pos] || '#10b981',
                } : {}}
              >
                {pos}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-mono ml-auto shrink-0">
            {players.length} Players
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Player Table ─────────────────────────────────── */}
        <div className="lg:col-span-7 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#080e1a] border-b border-slate-800/80">
                <tr className="text-slate-500 text-[10px] uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">Player</th>
                  <th className="px-2 py-3 font-semibold text-center">Club</th>
                  <th className="px-2 py-3 font-semibold text-center">Pos</th>
                  {[
                    { key: 'xg_per_90',                  label: 'xG/90' },
                    { key: 'xa_per_90',                  label: 'xA/90' },
                    { key: 'progressive_passes_per_90',  label: 'Prog Pass' },
                    { key: 'tackles_interceptions_per_90', label: 'Def Act' },
                  ].map(col => (
                    <th
                      key={col.key}
                      className="px-2 py-3 text-right font-semibold cursor-pointer hover:text-slate-300 transition-colors"
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="flex items-center justify-end gap-1">
                        {col.label} <SortIcon col={col.key} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : sorted.map(player => {
                  const isActive = activePlayer?.id === player.id;
                  const posColor = POSITION_COLORS[player.primary_position] || '#94a3b8';
                  return (
                    <tr
                      key={player.id}
                      onClick={() => handleSelect(player)}
                      className={`data-row border-b border-slate-800/30 last:border-0 ${isActive ? 'active' : ''}`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${player.is_available ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span className={`font-semibold ${isActive ? 'text-emerald-400' : 'text-slate-100'}`}>
                            {player.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-center text-slate-500 font-mono">{player.team_id}</td>
                      <td className="px-2 py-2.5 text-center">
                        <span
                          className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold"
                          style={{ color: posColor, background: posColor + '1a', border: `1px solid ${posColor}25` }}
                        >
                          {player.primary_position}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right font-bold text-emerald-400 font-mono">
                        {(player.xg_per_90 || 0).toFixed(2)}
                      </td>
                      <td className="px-2 py-2.5 text-right text-blue-400 font-mono">
                        {(player.xa_per_90 || 0).toFixed(2)}
                      </td>
                      <td className="px-2 py-2.5 text-right text-slate-400 font-mono">
                        {(player.progressive_passes_per_90 || 0).toFixed(1)}
                      </td>
                      <td className="px-2 py-2.5 text-right text-slate-400 font-mono">
                        {(player.tackles_interceptions_per_90 || 0).toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Player Detail Panel ─────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          {p ? (
            <>
              {/* Profile Card */}
              <div className="card p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="badge text-[10px] font-bold"
                        style={{
                          color: POSITION_COLORS[p.primary_position] || '#94a3b8',
                          background: (POSITION_COLORS[p.primary_position] || '#94a3b8') + '1a',
                          border: `1px solid ${(POSITION_COLORS[p.primary_position] || '#94a3b8')}30`,
                        }}
                      >
                        {p.team_id} · {p.primary_position}
                      </span>
                      {!p.is_available && <span className="badge-rose text-[10px]">⚠ Unavailable</span>}
                    </div>
                    <h2 className="text-xl font-extrabold text-white">{p.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.nationality} · Age {p.age} · {p.preferred_foot} Foot
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black font-mono text-emerald-400">
                      {(p.fitness_rating || 0).toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Fitness</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
                    <span>Fitness</span>
                    <span>Fatigue: {p.fatigue_index?.toFixed(0)}/100</span>
                  </div>
                  <FitnessBar value={p.fitness_rating || 0} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <StatMini label="xG / 90"     value={(p.xg_per_90 || 0).toFixed(2)}         color="#10b981" />
                  <StatMini label="xA / 90"     value={(p.xa_per_90 || 0).toFixed(2)}         color="#3b82f6" />
                  <StatMini label="Key Passes"  value={(p.key_passes_per_90 || 0).toFixed(2)} color="#f59e0b" />
                  <StatMini label="Prog Passes" value={(p.progressive_passes_per_90 || 0).toFixed(1)} color="#8b5cf6" />
                  <StatMini label="Tackles+Int" value={(p.tackles_interceptions_per_90 || 0).toFixed(1)} color="#06b6d4" />
                  <StatMini label="Matches"     value={p.matches_played || 0}                 color="#94a3b8" />
                </div>

                {p.secondary_positions && (
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] text-slate-500">Also plays:</span>
                    {p.secondary_positions.split(',').filter(Boolean).map(pos => (
                      <span key={pos} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono font-bold">
                        {pos.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Statistical Twins */}
              <div className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Statistical Twins
                  </h3>
                  <span className="text-[10px] text-slate-500">Cosine similarity</span>
                </div>

                {loadingSimilar ? (
                  <div className="py-4 flex justify-center">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : similarPlayers.length > 0 ? (
                  <div className="space-y-2">
                    {similarPlayers.map(sim => {
                      const pct = sim.similarity_score;
                      const pctNum = typeof pct === 'number' ? pct : parseFloat(pct);
                      return (
                        <div key={sim.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-slate-800/60 hover:border-slate-700 transition-colors">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0"
                            style={{
                              color: POSITION_COLORS[sim.primary_position] || '#94a3b8',
                              background: (POSITION_COLORS[sim.primary_position] || '#94a3b8') + '15',
                              border: `1px solid ${(POSITION_COLORS[sim.primary_position] || '#94a3b8')}25`,
                            }}
                          >
                            {sim.primary_position}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-200 truncate">{sim.name}</div>
                            <div className="text-[11px] text-slate-500">{sim.team_id}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {sim.top_common_strengths?.slice(0, 2).map((t, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-black font-mono text-emerald-400">
                              {pctNum.toFixed(1)}%
                            </div>
                            <div className="text-[10px] text-slate-600">match</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-3">No similar players found.</p>
                )}
              </div>
            </>
          ) : (
            <div className="card p-12 text-center text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a player to view their profile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
