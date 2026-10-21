import React from 'react';
import {
  Activity, Users, LayoutDashboard, Compass, Crosshair,
  FlaskConical, Binary, Trophy, Database, ShieldCheck,
  ChevronRight, Zap, Download
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus }) {
  const tabs = [
    { id: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard },
    { id: 'match_setup',label: 'Match Setup',      icon: Compass },
    { id: 'starting_xi',label: 'Starting XI',      icon: Crosshair },
    { id: 'players',    label: 'Player Explorer',  icon: Users },
    { id: 'opposition', label: 'Opposition Intel', icon: Trophy },
    { id: 'data_lab',   label: 'Data Lab',         icon: FlaskConical },
    { id: 'models',     label: 'ML Evaluation',    icon: Binary },
    { id: 'prediction', label: 'Prediction',       icon: Activity },
    { id: 'data_mgmt',  label: 'Data Mgmt',        icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/[0.05] shadow-2xl">
      <div className="px-4 lg:px-6 py-2.5">
        <div className="flex items-center gap-4">

          {/* Brand */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 shrink-0 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-lg group-hover:scale-105 transition-transform">
              ⚽
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-extrabold tracking-tight text-white leading-tight">
                FOOTBALL&nbsp;<span className="text-emerald-400">SCOUT</span>
                <span className="ml-2 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 align-middle">
                  AI v1.0
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight">
                Tactical Intelligence System
              </div>
            </div>
          </button>

          {/* Nav Tabs — scrollable */}
          <nav className="flex-1 flex items-center overflow-x-auto no-scrollbar gap-0.5 py-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/12 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-px bg-emerald-400/60 rounded-full" />
                  )}
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Download PPT Button */}
          <a
            href="/Football_Scout_AI_Algorithms_Presentation.pptx"
            download="Football_Scout_AI_Algorithms_Presentation.pptx"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/25 cursor-pointer"
            title="Download Algorithmic PowerPoint Presentation"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download PPT</span>
          </a>

          {/* Status Badge */}
          <div className="shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              backendStatus
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse'
                : 'bg-amber-400 animate-pulse'
            }`} />
            <span className="text-slate-300 font-mono text-[10px] font-medium">
              {backendStatus ? 'EPL · UCL · LA LIGA' : 'CONNECTING...'}
            </span>
          </div>


        </div>
      </div>
    </header>
  );
}
