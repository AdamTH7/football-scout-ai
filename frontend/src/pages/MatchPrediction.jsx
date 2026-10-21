import React, { useState, useEffect } from 'react';
import {
  Activity, Play, Shield, Sparkles, ArrowRight,
  Users, Clock, Flame, ChevronRight, RefreshCw
} from 'lucide-react';
import { api } from '../api/client';

const OBJECTIVES = [
  { value: 'chase_goal',       label: 'Chase Goal',       color: '#ef4444', desc: 'Need to score' },
  { value: 'protect_lead',     label: 'Protect Lead',     color: '#10b981', desc: 'Hold the advantage' },
  { value: 'freshen_legs',     label: 'Freshen Legs',     color: '#3b82f6', desc: 'Conditioning' },
  { value: 'counter_opponent', label: 'Counter Opponent', color: '#f59e0b', desc: 'Tactical adjustment' },
];

function ProbabilityGauge({ homeProb, drawProb, awayProb, homeTeam, awayTeam }) {
  const home = parseFloat(homeProb) || 0;
  const draw = parseFloat(drawProb) || 0;
  const away = parseFloat(awayProb) || 0;

  return (
    <div className="space-y-3">
      {/* Main bar */}
      <div className="relative h-10 rounded-2xl overflow-hidden flex">
        <div
          className="flex items-center justify-center text-xs font-black text-slate-950 transition-all duration-700"
          style={{ width: `${home}%`, background: '#10b981' }}
        >
          {home > 10 && <span>{home.toFixed(0)}%</span>}
        </div>
        <div
          className="flex items-center justify-center text-xs font-black text-slate-950 transition-all duration-700"
          style={{ width: `${draw}%`, background: '#94a3b8' }}
        >
          {draw > 8 && <span>{draw.toFixed(0)}%</span>}
        </div>
        <div
          className="flex items-center justify-center text-xs font-black text-slate-950 transition-all duration-700"
          style={{ width: `${away}%`, background: '#3b82f6' }}
        >
          {away > 10 && <span>{away.toFixed(0)}%</span>}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-slate-300 font-semibold">{homeTeam} Win</span>
          <span className="font-black text-emerald-400 font-mono">{home.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span className="text-slate-400">Draw</span>
          <span className="font-bold text-slate-300 font-mono">{draw.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          <span className="text-slate-300 font-semibold">{awayTeam} Win</span>
          <span className="font-black text-blue-400 font-mono">{away.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export default function MatchPrediction({ onOpenSimulator }) {
  const [teams,     setTeams]     = useState([]);
  const [homeTeam,  setHomeTeam]  = useState('MCI');
  const [awayTeam,  setAwayTeam]  = useState('RMA');
  const [prediction,setPrediction]= useState(null);
  const [loading,   setLoading]   = useState(false);

  const [subMinute,    setSubMinute]    = useState(68);
  const [subScoreHome, setSubScoreHome] = useState(1);
  const [subScoreAway, setSubScoreAway] = useState(1);
  const [subObjective, setSubObjective] = useState('chase_goal');
  const [subRecs,      setSubRecs]      = useState(null);
  const [loadingSubs,  setLoadingSubs]  = useState(false);

  useEffect(() => {
    api.getTeams().then(setTeams).catch(console.error);
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await api.predictMatch({ home_team_id: homeTeam, away_team_id: awayTeam });
      setPrediction(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubstitutions = async () => {
    setLoadingSubs(true);
    try {
      const players = await api.getPlayers({ team_id: homeTeam });
      const activeIds = players.slice(0, 11).map(p => p.id);
      const res = await api.recommendSubstitutions({
        team_id:           homeTeam,
        opponent_id:       awayTeam,
        current_minute:    subMinute,
        score_home:        subScoreHome,
        score_away:        subScoreAway,
        is_home:           true,
        tactical_objective: subObjective,
        active_player_ids: activeIds,
      });
      setSubRecs(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubs(false);
    }
  };

  const homeName = teams.find(t => t.id === homeTeam)?.short_name || homeTeam;
  const awayName = teams.find(t => t.id === awayTeam)?.short_name || awayTeam;

  const confColor = prediction?.model_confidence === 'High' ? '#10b981'
    : prediction?.model_confidence === 'Moderate' ? '#f59e0b' : '#94a3b8';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="section-label"><Activity className="w-4 h-4" /> Match Outcome Probability & Scenario Tactical Intelligence</div>
          <h1 className="page-title">Match Prediction Engine</h1>
          <p className="page-sub">ML-powered win/draw/loss probabilities + xG forecasts + in-game substitution optimizer.</p>
        </div>

        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="btn-primary text-xs py-2.5 px-4 shrink-0 shadow-lg shadow-emerald-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Live 90' Match Simulator</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Prediction Setup ─────────────────────────────── */}
        <div className="space-y-5">
          <div className="card p-6 space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Configure Fixture
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Home Team</label>
                <select value={homeTeam} onChange={e => setHomeTeam(e.target.value)} className="select-field">
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Away Team</label>
                <select value={awayTeam} onChange={e => setAwayTeam(e.target.value)} className="select-field">
                  {teams.filter(t => t.id !== homeTeam).map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fixture Preview */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-slate-800/60">
              <div className="text-center">
                <div className="text-xl font-black text-white">{homeTeam}</div>
                <div className="text-[10px] text-slate-500">Home</div>
              </div>
              <div className="text-slate-600 font-bold">vs</div>
              <div className="text-center">
                <div className="text-xl font-black text-white">{awayTeam}</div>
                <div className="text-[10px] text-slate-500">Away</div>
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className="btn-primary w-full justify-center py-3 disabled:opacity-60"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />Predicting...</>
                : <><Play className="w-4 h-4 fill-slate-950" />Run Match Prediction</>
              }
            </button>
          </div>

          {/* Substitution Setup */}
          <div className="card p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              In-Game Substitution Optimizer
            </h2>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Minute</label>
                <input
                  type="number" min="45" max="120"
                  value={subMinute}
                  onChange={e => setSubMinute(parseInt(e.target.value))}
                  className="input-field text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Home Score</label>
                <input
                  type="number" min="0" max="10"
                  value={subScoreHome}
                  onChange={e => setSubScoreHome(parseInt(e.target.value))}
                  className="input-field text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Away Score</label>
                <input
                  type="number" min="0" max="10"
                  value={subScoreAway}
                  onChange={e => setSubScoreAway(parseInt(e.target.value))}
                  className="input-field text-center"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {OBJECTIVES.map(o => (
                <button
                  key={o.value}
                  onClick={() => setSubObjective(o.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all ${
                    subObjective === o.value ? 'text-slate-950' : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}
                  style={subObjective === o.value ? { background: o.color, borderColor: o.color } : {}}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubstitutions}
              disabled={loadingSubs}
              className="btn-secondary w-full justify-center py-2.5 disabled:opacity-60"
            >
              {loadingSubs
                ? <><div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />Analyzing...</>
                : <><Users className="w-3.5 h-3.5" />Get Substitution Advice</>
              }
            </button>
          </div>
        </div>

        {/* ── Prediction Results ───────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {prediction ? (
            <>
              {/* Probability Gauge */}
              <div className="card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white">Match Outcome Probabilities</h2>
                  <span
                    className="badge text-[10px] font-bold"
                    style={{ color: confColor, background: confColor + '15', border: `1px solid ${confColor}30` }}
                  >
                    {prediction.model_confidence} Confidence
                  </span>
                </div>

                <ProbabilityGauge
                  homeProb={prediction.home_win_prob}
                  drawProb={prediction.draw_prob}
                  awayProb={prediction.away_win_prob}
                  homeTeam={homeName}
                  awayTeam={awayName}
                />

                {/* xG Forecast */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-emerald-500/15 text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">{homeName} Expected xG</div>
                    <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                      {prediction.predicted_home_xg?.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">Home team forecast</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-blue-500/15 text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">{awayName} Expected xG</div>
                    <div className="text-3xl font-black text-blue-400 font-mono mt-1">
                      {prediction.predicted_away_xg?.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">Away team forecast</div>
                  </div>
                </div>
              </div>

              {/* Key Drivers */}
              <div className="card p-6 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Prediction Key Drivers
                </h3>
                <div className="space-y-2">
                  {prediction.key_drivers?.map((driver, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-slate-800/60">
                      <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-[9px] font-black text-amber-400 shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{driver}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 italic leading-relaxed pt-1">
                  {prediction.uncertainty_statement}
                </p>
              </div>
            </>
          ) : (
            <div className="card p-16 text-center space-y-3">
              <Activity className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-slate-500 text-sm">Configure fixture and run prediction to see results</p>
              <button onClick={handlePredict} className="btn-primary mx-auto">
                <Play className="w-4 h-4 fill-slate-950" /> Run Prediction
              </button>
            </div>
          )}

          {/* Substitution Recommendations */}
          {subRecs && (
            <div className="card p-6 space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                  Substitution Recommendations
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{subRecs.scenario_description}</p>
              </div>

              <div className="space-y-3">
                {subRecs.recommendations?.map((rec, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-800/60 bg-white/[0.02] space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge-rose text-[10px]">OUT: {rec.player_out_name}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="badge-emerald text-[10px]">IN: {rec.player_in_name}</span>
                      <span className="ml-auto badge-blue text-[10px]">{rec.priority}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{rec.tactical_reason}</p>
                    <p className="text-[11px] text-emerald-400 font-medium">Expected: {rec.expected_impact}</p>
                  </div>
                ))}
              </div>

              {subRecs.tactical_notes && (
                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/30">
                  <p className="text-xs text-blue-300">{subRecs.tactical_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
