import React, { useState, useEffect } from 'react';
import {
  Activity, Play, Bot, Sparkles, Zap, Shield, ChevronRight, Terminal
} from 'lucide-react';

const TELEMETRY_MESSAGES = [
  "Spatial Voronoi polygons recalculated (Field Tilt: 64.2% Home)",
  "Gegenpress trigger active in opponent left half-space (PPDA: 8.1)",
  "Monte Carlo match engine: 10,000 simulated iterations completed",
  "Out-of-sample ML model calibrated: Brier Score 0.184 on chronological set",
  "Biometric fatigue model: Kevin De Bruyne squad readiness 89.4%",
  "Passing network retention rate: 84.8% against high-press opponent",
  "Rest defense box: 3+2 structure active; transition risk -18%",
  "Hybrid Recommender: Euclidean & Cosine statistical twins indexed"
];

export default function TelemetryBar({ onOpenSimulator, onOpenCopilot }) {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TELEMETRY_MESSAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky bottom-0 z-40 bg-[#080d17]/95 border-t border-emerald-900/40 backdrop-blur-xl px-4 py-2.5 shadow-2xl flex items-center justify-between gap-4 text-xs">
      {/* Left: Live Status & Telemetry Ticker */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Pulsing indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
            AI TELEMETRY LIVE
          </span>
        </div>

        {/* Latency & Seeds */}
        <div className="hidden lg:flex items-center gap-3 font-mono text-[10px] text-slate-500 border-r border-slate-800 pr-3 shrink-0">
          <span>LATENCY: <strong className="text-slate-300">14ms</strong></span>
          <span>SEEDS: <strong className="text-slate-300">10,000</strong></span>
        </div>

        {/* Live Cycling Ticker Message */}
        <div className="flex items-center gap-2 min-w-0 overflow-hidden text-[11px] text-slate-300 font-mono">
          <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0 opacity-70" />
          <span className="truncate ticker-live-pulse">
            {TELEMETRY_MESSAGES[tickerIndex]}
          </span>
        </div>
      </div>

      {/* Right: Interactive Action Triggers */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer transition-all active:scale-95"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Live Match Simulator</span>
        </button>

        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-slate-700/80 text-white font-semibold text-xs cursor-pointer transition-all active:scale-95"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Tactical Copilot</span>
        </button>
      </div>
    </div>
  );
}
