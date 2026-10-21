import React, { useState } from 'react';
import { Shield, Star, Info, Zap, Eye, Compass, Layers, Activity } from 'lucide-react';

// Normalized coordinates (x %, y %) for formations on pitch (0% top, 100% bottom; 0% left, 100% right)
const FORMATION_COORDINATES = {
  "4-3-3": {
    "GK": { x: 50, y: 88, connections: ["CB_L", "CB_R"] },
    "LB": { x: 15, y: 72, connections: ["CB_L", "CM_L", "LW"] },
    "CB_L": { x: 38, y: 74, connections: ["GK", "CB_R", "DM", "LB"] },
    "CB_R": { x: 62, y: 74, connections: ["GK", "CB_L", "DM", "RB"] },
    "RB": { x: 85, y: 72, connections: ["CB_R", "CM_R", "RW"] },
    "DM": { x: 50, y: 56, connections: ["CB_L", "CB_R", "CM_L", "CM_R"] },
    "CM_L": { x: 32, y: 44, connections: ["DM", "LW", "ST", "CM_R"] },
    "CM_R": { x: 68, y: 44, connections: ["DM", "RW", "ST", "CM_L"] },
    "LW": { x: 18, y: 22, connections: ["CM_L", "ST"] },
    "RW": { x: 82, y: 22, connections: ["CM_R", "ST"] },
    "ST": { x: 50, y: 16, connections: ["LW", "RW", "CM_L", "CM_R"] }
  },
  "4-2-3-1": {
    "GK": { x: 50, y: 88, connections: ["CB_L", "CB_R"] },
    "LB": { x: 15, y: 72, connections: ["CB_L", "DM_L", "LW"] },
    "CB_L": { x: 38, y: 74, connections: ["GK", "CB_R", "DM_L"] },
    "CB_R": { x: 62, y: 74, connections: ["GK", "CB_L", "DM_R"] },
    "RB": { x: 85, y: 72, connections: ["CB_R", "DM_R", "RW"] },
    "DM_L": { x: 36, y: 56, connections: ["CB_L", "DM_R", "AM", "LW"] },
    "DM_R": { x: 64, y: 56, connections: ["CB_R", "DM_L", "AM", "RW"] },
    "AM": { x: 50, y: 38, connections: ["DM_L", "DM_R", "LW", "RW", "ST"] },
    "LW": { x: 18, y: 30, connections: ["AM", "ST", "LB"] },
    "RW": { x: 82, y: 30, connections: ["AM", "ST", "RB"] },
    "ST": { x: 50, y: 15, connections: ["AM", "LW", "RW"] }
  },
  "4-4-2": {
    "GK": { x: 50, y: 88, connections: ["CB_L", "CB_R"] },
    "LB": { x: 15, y: 72, connections: ["CB_L", "LM"] },
    "CB_L": { x: 38, y: 74, connections: ["GK", "CB_R", "CM_L"] },
    "CB_R": { x: 62, y: 74, connections: ["GK", "CB_L", "CM_R"] },
    "RB": { x: 85, y: 72, connections: ["CB_R", "RM"] },
    "LM": { x: 16, y: 46, connections: ["LB", "CM_L", "ST_L"] },
    "CM_L": { x: 38, y: 50, connections: ["CB_L", "CM_R", "LM", "ST_L"] },
    "CM_R": { x: 62, y: 50, connections: ["CB_R", "CM_L", "RM", "ST_R"] },
    "RM": { x: 84, y: 46, connections: ["RB", "CM_R", "ST_R"] },
    "ST_L": { x: 38, y: 18, connections: ["CM_L", "LM", "ST_R"] },
    "ST_R": { x: 62, y: 18, connections: ["CM_R", "RM", "ST_L"] }
  },
  "3-5-2": {
    "GK": { x: 50, y: 88, connections: ["CB_L", "CB_C", "CB_R"] },
    "CB_L": { x: 26, y: 74, connections: ["GK", "CB_C", "LWB"] },
    "CB_C": { x: 50, y: 76, connections: ["GK", "CB_L", "CB_R", "DM"] },
    "CB_R": { x: 74, y: 74, connections: ["GK", "CB_C", "RWB"] },
    "LWB": { x: 12, y: 52, connections: ["CB_L", "CM_L", "ST_L"] },
    "DM": { x: 50, y: 58, connections: ["CB_C", "CM_L", "CM_R"] },
    "CM_L": { x: 34, y: 42, connections: ["DM", "LWB", "CM_R", "ST_L"] },
    "CM_R": { x: 66, y: 42, connections: ["DM", "RWB", "CM_L", "ST_R"] },
    "RWB": { x: 88, y: 52, connections: ["CB_R", "CM_R", "ST_R"] },
    "ST_L": { x: 38, y: 18, connections: ["CM_L", "ST_R"] },
    "ST_R": { x: 62, y: 18, connections: ["CM_R", "ST_L"] }
  },
  "3-4-3": {
    "GK": { x: 50, y: 88, connections: ["CB_L", "CB_C", "CB_R"] },
    "CB_L": { x: 26, y: 74, connections: ["GK", "CB_C", "LM"] },
    "CB_C": { x: 50, y: 76, connections: ["GK", "CB_L", "CB_R", "CM_L", "CM_R"] },
    "CB_R": { x: 74, y: 74, connections: ["GK", "CB_C", "RM"] },
    "LM": { x: 14, y: 48, connections: ["CB_L", "CM_L", "LW"] },
    "CM_L": { x: 38, y: 52, connections: ["CB_C", "LM", "CM_R", "ST"] },
    "CM_R": { x: 62, y: 52, connections: ["CB_C", "RM", "CM_L", "ST"] },
    "RM": { x: 86, y: 48, connections: ["CB_R", "CM_R", "RW"] },
    "LW": { x: 20, y: 22, connections: ["LM", "ST"] },
    "ST": { x: 50, y: 16, connections: ["LW", "RW", "CM_L", "CM_R"] },
    "RW": { x: 80, y: 22, connections: ["RM", "ST"] }
  }
};

export default function Pitch({
  formation = "4-3-3",
  starters = [],
  onSelectPlayer,
  selectedPlayerId
}) {
  const [showPassingLanes, setShowPassingLanes] = useState(true);
  const [showPressZones, setShowPressZones] = useState(false);
  const [showChannels, setShowChannels] = useState(false);
  const [hoveredRole, setHoveredRole] = useState(null);

  const coordsMap = FORMATION_COORDINATES[formation] || FORMATION_COORDINATES["4-3-3"];

  // Find currently active role
  const activeStarter = starters.find(s => s.player?.player_id === selectedPlayerId);
  const activeRole = activeStarter ? activeStarter.role_code : hoveredRole;

  // Build list of unique passing lane lines to render
  const passingLanes = [];
  const processedPairs = new Set();

  Object.entries(coordsMap).forEach(([sourceRole, sourceData]) => {
    (sourceData.connections || []).forEach(targetRole => {
      const pairKey = [sourceRole, targetRole].sort().join('--');
      if (!processedPairs.has(pairKey) && coordsMap[targetRole]) {
        processedPairs.add(pairKey);
        passingLanes.push({
          sourceRole,
          targetRole,
          x1: sourceData.x,
          y1: sourceData.y,
          x2: coordsMap[targetRole].x,
          y2: coordsMap[targetRole].y,
          isActive: activeRole === sourceRole || activeRole === targetRole
        });
      }
    });
  });

  return (
    <div className="space-y-3">
      {/* Interactive Controls Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300">Tactical Pitch View</span>
        </div>

        {/* Toggle Overlays */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowPassingLanes(!showPassingLanes)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              showPassingLanes
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10'
                : 'bg-white/[0.03] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle passing network channels"
          >
            <Zap className="w-3 h-3" />
            <span>Passing Network</span>
          </button>

          <button
            onClick={() => setShowPressZones(!showPressZones)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              showPressZones
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10'
                : 'bg-white/[0.03] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle high & mid pressing pressure blocks"
          >
            <Shield className="w-3 h-3" />
            <span>Press Blocks</span>
          </button>

          <button
            onClick={() => setShowChannels(!showChannels)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              showChannels
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-400 shadow-sm shadow-blue-500/10'
                : 'bg-white/[0.03] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle 5 tactical pitch channels & half-spaces"
          >
            <Layers className="w-3 h-3" />
            <span>5 Channels</span>
          </button>
        </div>
      </div>

      {/* Main Football Pitch Container */}
      <div className="relative w-full aspect-[4/5] max-h-[640px] football-pitch rounded-2xl border-2 border-emerald-900/60 shadow-2xl flex flex-col justify-between overflow-hidden select-none">
        {/* Background Grass Stripes */}
        <div className="absolute inset-0 pitch-stripes pointer-events-none" />

        {/* Live Radar Scanning Sweep Beam */}
        <div className="absolute inset-x-0 h-28 bg-gradient-to-b from-transparent via-emerald-400/[0.08] to-transparent pointer-events-none radar-sweep-beam" />

        {/* 5 Tactical Channels Overlay */}
        {showChannels && (
          <div className="absolute inset-0 grid grid-cols-5 pointer-events-none z-0">
            <div className="border-r border-blue-400/20 bg-blue-500/[0.02] flex items-end justify-center pb-3">
              <span className="text-[9px] font-mono text-blue-300/60 uppercase">Left Flank</span>
            </div>
            <div className="border-r border-blue-400/25 bg-blue-500/[0.04] flex items-end justify-center pb-3">
              <span className="text-[9px] font-mono text-blue-300/80 uppercase font-bold">L Half-Space</span>
            </div>
            <div className="border-r border-blue-400/20 bg-blue-500/[0.02] flex items-end justify-center pb-3">
              <span className="text-[9px] font-mono text-blue-300/60 uppercase">Central</span>
            </div>
            <div className="border-r border-blue-400/25 bg-blue-500/[0.04] flex items-end justify-center pb-3">
              <span className="text-[9px] font-mono text-blue-300/80 uppercase font-bold">R Half-Space</span>
            </div>
            <div className="bg-blue-500/[0.02] flex items-end justify-center pb-3">
              <span className="text-[9px] font-mono text-blue-300/60 uppercase">Right Flank</span>
            </div>
          </div>
        )}

        {/* Pressing Blocks Overlay */}
        {showPressZones && (
          <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
            <div className="h-[35%] bg-rose-500/[0.08] border-b border-rose-500/30 flex items-center justify-center">
              <span className="text-[10px] font-mono uppercase font-bold text-rose-400/70 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                ⚡ High-Press Zone (Gegenpress)
              </span>
            </div>
            <div className="h-[35%] bg-amber-500/[0.06] border-b border-amber-500/30 flex items-center justify-center">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400/70 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                🛡️ Mid-Block Containment
              </span>
            </div>
            <div className="flex-1 bg-emerald-500/[0.04] flex items-center justify-center">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400/70 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                🏰 Defensive Rest Protection
              </span>
            </div>
          </div>
        )}

        {/* Pitch Markings */}
        {/* Halfway Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2 pointer-events-none" />
        
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full border-2 border-white/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-white/30 rounded-full" />
        </div>

        {/* Top Penalty Area (Opponent Box) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-b-2 border-x-2 border-white/20 rounded-b-md pointer-events-none flex flex-col items-center justify-end pb-2">
          <div className="w-1.5 h-1.5 bg-white/30 rounded-full mb-1" />
          <div className="w-[30%] h-[40%] border-b-2 border-x-2 border-white/20 rounded-b-sm" />
        </div>

        {/* Bottom Penalty Area (Defending Box) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-t-2 border-x-2 border-white/20 rounded-t-md pointer-events-none flex flex-col items-center justify-start pt-2">
          <div className="w-[30%] h-[40%] border-t-2 border-x-2 border-white/20 rounded-t-sm mb-1" />
          <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
        </div>

        {/* SVG Passing Network Vector Layer */}
        {showPassingLanes && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]">
            <defs>
              <linearGradient id="lane-active" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="lane-idle" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.18" />
              </linearGradient>
            </defs>

            {passingLanes.map((lane, idx) => (
              <line
                key={idx}
                x1={`${lane.x1}%`}
                y1={`${lane.y1}%`}
                x2={`${lane.x2}%`}
                y2={`${lane.y2}%`}
                stroke={lane.isActive ? "url(#lane-active)" : "url(#lane-idle)"}
                strokeWidth={lane.isActive ? "2.5" : "1.2"}
                className={lane.isActive ? "passing-lane-flow" : ""}
                strokeDasharray={lane.isActive ? "6 3" : "3 3"}
              />
            ))}
          </svg>
        )}

        {/* Starters Interactive Tokens */}
        {starters.map((starter) => {
          const role = starter.role_code;
          const coords = coordsMap[role] || { x: 50, y: 50 };
          const isSelected = selectedPlayerId === starter.player?.player_id;
          const isHovered = hoveredRole === role;
          const score = starter.player?.suitability_score || 80;

          return (
            <div
              key={starter.player?.player_id || role}
              onClick={() => onSelectPlayer && onSelectPlayer(starter)}
              onMouseEnter={() => setHoveredRole(role)}
              onMouseLeave={() => setHoveredRole(null)}
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className={`absolute cursor-pointer group transition-transform duration-200 z-10 flex flex-col items-center`}
            >
              {/* Pulsing halo around selected player */}
              {isSelected && (
                <div className="absolute -inset-3 rounded-full border-2 border-emerald-400 pulse-ring-anim pointer-events-none" />
              )}

              {/* Player Token Circle */}
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 shadow-xl ${
                  isSelected
                    ? 'bg-emerald-500 border-white ring-4 ring-emerald-400/50 scale-110 shadow-emerald-500/50'
                    : isHovered
                    ? 'bg-emerald-950 border-emerald-300 scale-110 shadow-emerald-400/30 ring-2 ring-emerald-400/40'
                    : 'bg-slate-900/90 border-emerald-400/70 hover:border-emerald-300 hover:scale-105'
                }`}
              >
                <span className={`text-xs font-black tracking-wider ${isSelected ? 'text-slate-950 font-black' : 'text-emerald-300'}`}>
                  {role}
                </span>

                {/* Suitability Score Pill */}
                <div
                  className={`absolute -top-2.5 -right-2 px-1.5 py-0.5 text-[9px] font-bold rounded-full border shadow-sm ${
                    score >= 85
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : score >= 70
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-rose-600 text-white border-rose-400'
                  }`}
                >
                  {Math.round(score)}
                </div>
              </div>

              {/* Player Name Tag */}
              <div
                className={`mt-1.5 px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap shadow-md transition-colors ${
                  isSelected
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-slate-950/85 text-slate-200 border border-slate-700/60 group-hover:bg-slate-900 group-hover:text-emerald-300'
                }`}
              >
                {starter.player?.name ? starter.player.name.split(' ').slice(-1)[0] : role}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
