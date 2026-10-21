import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, Zap, Activity, Shield, Trophy,
  ChevronRight, Volume2, VolumeX, Sparkles, AlertCircle, Clock
} from 'lucide-react';

const SAMPLE_EVENTS = [
  { min: 4, type: 'tackle', team: 'home', text: 'Rodri makes a crucial recovery tackle in the middle third.' },
  { min: 11, type: 'shot', team: 'home', xg: 0.18, text: 'Phil Foden cuts inside and strikes from 20 yards — tipped over the bar!' },
  { min: 19, type: 'counter', team: 'away', text: 'Vinícius Jr exploits space behind the right flank on a rapid transition.' },
  { min: 28, type: 'chance', team: 'away', xg: 0.32, text: 'Bellingham header from corner narrowly misses the top corner.' },
  { min: 36, type: 'goal', team: 'home', xg: 0.68, text: '⚽ GOAL! Haaland hammers home a low cross from De Bruyne!' },
  { min: 45, type: 'whistle', team: 'neutral', text: 'Half-Time whistle. Manchester City 1 - 0 Real Madrid. Possession 61% - 39%.' },
  { min: 53, type: 'press', team: 'home', text: 'High-press turnover forced inside Real Madrid penalty box.' },
  { min: 62, type: 'save', team: 'home', text: 'Ederson pulls off a reflex save to deny Rodrygo.' },
  { min: 71, type: 'sub', team: 'home', text: '🔄 Tactical substitution: Grealish on for Doku to retain midfield possession.' },
  { min: 79, type: 'goal', team: 'away', xg: 0.45, text: '⚽ GOAL! Real Madrid level the score with a clinical counter-attack finish.' },
  { min: 84, type: 'card', team: 'away', text: 'Tactical foul conceded on Haaland breaking into the box.' },
  { min: 89, type: 'goal', team: 'home', xg: 0.74, text: '⚽ GOAL! Bernardo Silva scores a dramatic late winner from the edge of the area!' },
  { min: 93, type: 'whistle', team: 'neutral', text: '🏁 FULL TIME! Manchester City 2 - 1 Real Madrid. Tactical objectives achieved!' }
];

export default function LiveMatchSimulator({ isOpen, onClose, homeTeam = 'MCI', awayTeam = 'RMA' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1x, 2x, 5x
  const [minute, setMinute] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeXg, setHomeXg] = useState(0.0);
  const [awayXg, setAwayXg] = useState(0.0);
  const [events, setEvents] = useState([]);
  const [momentum, setMomentum] = useState(55); // 0 to 100 (% Home dominance)
  const [tacticalPlan, setTacticalPlan] = useState('High-Intensity Control');
  const timerRef = useRef(null);
  const eventContainerRef = useRef(null);

  // Auto-scroll events to bottom
  useEffect(() => {
    if (eventContainerRef.current) {
      eventContainerRef.current.scrollTop = eventContainerRef.current.scrollHeight;
    }
  }, [events]);

  // Simulation step timer
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(timerRef.current);
      return;
    }

    const intervalTime = 300 / speed;

    timerRef.current = setInterval(() => {
      setMinute((prevMin) => {
        if (prevMin >= 93) {
          setIsPlaying(false);
          return 93;
        }

        const nextMin = prevMin + 1;

        // Fluctuating momentum
        setMomentum((prev) => {
          const shift = (Math.random() - 0.48) * 8;
          return Math.min(85, Math.max(20, prev + shift));
        });

        // Check if event triggers at this minute
        const ev = SAMPLE_EVENTS.find((e) => e.min === nextMin);
        if (ev) {
          setEvents((prevEvents) => [...prevEvents, ev]);
          if (ev.type === 'goal') {
            if (ev.team === 'home') {
              setHomeScore((s) => s + 1);
              setHomeXg((x) => +(x + (ev.xg || 0.5)).toFixed(2));
            } else if (ev.team === 'away') {
              setAwayScore((s) => s + 1);
              setAwayXg((x) => +(x + (ev.xg || 0.5)).toFixed(2));
            }
          } else if (ev.xg) {
            if (ev.team === 'home') setHomeXg((x) => +(x + ev.xg).toFixed(2));
            if (ev.team === 'away') setAwayXg((x) => +(x + ev.xg).toFixed(2));
          }
        }

        return nextMin;
      });
    }, intervalTime);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setMinute(0);
    setHomeScore(0);
    setAwayScore(0);
    setHomeXg(0.0);
    setAwayXg(0.0);
    setEvents([]);
    setMomentum(55);
  };

  const handleKickoff = () => {
    if (minute >= 93) handleReset();
    setIsPlaying(true);
  };

  const handleTacticalShift = (shiftName) => {
    setTacticalPlan(shiftName);
    const newEvent = {
      min: minute,
      type: 'sub',
      team: 'home',
      text: `⚡ In-game tactical intervention applied: ${shiftName}`
    };
    setEvents((prev) => [...prev, newEvent]);
    if (shiftName.includes('Overload')) setMomentum((m) => Math.min(85, m + 15));
    if (shiftName.includes('Low-Block')) setMomentum((m) => Math.max(30, m - 10));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-[#0b121e] border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Monte Carlo 90' Match Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  LIVE INTERACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Simulate spatial game state, xG shifts, and momentum transitions in real-time.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scoreboard & Clock */}
        <div className="p-6 bg-gradient-to-b from-slate-900/80 to-[#0b121e] border-b border-slate-800 space-y-5">
          <div className="grid grid-cols-3 items-center">
            {/* Home Team */}
            <div className="text-right space-y-1">
              <div className="text-xl sm:text-2xl font-black text-white">{homeTeam}</div>
              <div className="text-xs text-emerald-400 font-mono">xG: {homeXg.toFixed(2)}</div>
            </div>

            {/* Score & Minute */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white font-bold">{minute}'</span>
                {minute >= 45 && minute < 46 && (
                  <span className="text-amber-400 font-semibold">(HT)</span>
                )}
                {minute >= 90 && (
                  <span className="text-rose-400 font-semibold">(FT)</span>
                )}
              </div>

              <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest bg-black/40 px-5 py-1.5 rounded-xl border border-white/[0.06] shadow-inner">
                {homeScore} : {awayScore}
              </div>
            </div>

            {/* Away Team */}
            <div className="text-left space-y-1">
              <div className="text-xl sm:text-2xl font-black text-white">{awayTeam}</div>
              <div className="text-xs text-blue-400 font-mono">xG: {awayXg.toFixed(2)}</div>
            </div>
          </div>

          {/* Momentum Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-emerald-400">{homeTeam} Dominance ({Math.round(momentum)}%)</span>
              <span className="text-slate-400 font-mono text-[10px]">FIELD TILT & PRESS MOMENTUM</span>
              <span className="text-blue-400">{awayTeam} Counter ({100 - Math.round(momentum)}%)</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${momentum}%` }}
                className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              />
              <div
                style={{ width: `${100 - momentum}%` }}
                className="bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <button
                  onClick={handleKickoff}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{minute === 0 ? 'Kick Off Match' : 'Resume Match'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsPlaying(false)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Match</span>
                </button>
              )}

              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset simulation to 0'"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <span className="text-[10px] text-slate-500 px-2 font-semibold">SPEED</span>
              {[1, 2, 5, 10].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    speed === s
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Event Commentary Feed */}
        <div className="p-6 flex-1 flex flex-col min-h-[220px] overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Live Match Commentary & Telemetry
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {events.length} match events logged
            </span>
          </div>

          <div
            ref={eventContainerRef}
            className="flex-1 overflow-y-auto space-y-2 pr-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-mono text-xs"
          >
            {events.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8">
                <Clock className="w-8 h-8 mb-2 opacity-40 animate-spin" />
                <span>Click "Kick Off Match" to begin real-time tactical simulation</span>
              </div>
            ) : (
              events.map((ev, idx) => {
                const isGoal = ev.type === 'goal';
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border flex items-start gap-3 transition-all ${
                      isGoal
                        ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                        : 'bg-white/[0.02] border-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        isGoal ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {ev.min}'
                    </span>
                    <span className="flex-1 font-sans text-xs">{ev.text}</span>
                    {ev.xg && (
                      <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0">
                        xG {ev.xg}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* In-Game Tactical Interventions */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
              In-Game Tactical Interventions (Live Impact):
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                '⚡ High-Press Overload',
                '🛡️ Drop into Compact Low-Block',
                '🎯 Exploit Half-Space Transitions',
                '🔄 Midfield Ball Retention'
              ].map((shift) => (
                <button
                  key={shift}
                  onClick={() => handleTacticalShift(shift)}
                  disabled={!isPlaying || minute >= 90}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  {shift}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
