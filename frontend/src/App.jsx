import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TelemetryBar from './components/TelemetryBar';
import LiveMatchSimulator from './components/LiveMatchSimulator';
import TacticalCopilot from './components/TacticalCopilot';
import Dashboard from './pages/Dashboard';
import MatchSetup from './pages/MatchSetup';
import StartingXI from './pages/StartingXI';
import PlayerExplorer from './pages/PlayerExplorer';
import OppositionIntelligence from './pages/OppositionIntelligence';
import DataScienceLab from './pages/DataScienceLab';
import ModelEvaluation from './pages/ModelEvaluation';
import MatchPrediction from './pages/MatchPrediction';
import DataManagement from './pages/DataManagement';
import { api } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const [matchConfig, setMatchConfig] = useState({
    team_id: 'MCI',
    opponent_id: 'RMA',
    formation: '4-3-3',
    tactical_objective: 'balanced',
    is_home: true,
    locked_player_ids: [],
    excluded_player_ids: [],
    weights: {
      form_weight: 0.25,
      role_weight: 0.25,
      tactical_weight: 0.25,
      style_weight: 0.15,
      availability_weight: 0.10
    }
  });

  // Verify backend health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await api.getHealth();
        if (res && res.status === 'healthy') {
          setBackendStatus(true);
        }
      } catch (e) {
        console.warn("Backend not detected yet on http://localhost:8000", e);
        setBackendStatus(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handler to run Lineup Optimization
  const handleRunOptimization = async () => {
    try {
      setIsOptimizing(true);
      const res = await api.optimizeStartingXi(matchConfig);
      setOptimizationResult(res);
      setActiveTab('starting_xi');
    } catch (e) {
      alert(`Optimization Error: ${e.message}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
      />

      <main className="flex-1 px-4 lg:px-8 pt-6 pb-6">
        {isOptimizing && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-3 shadow-2xl">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-white">Solving Constrained Lineup Optimization…</span>
              <span className="text-xs text-slate-400">Evaluating 11 unique positions & role compatibility</span>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onOpenCopilot={() => setIsCopilotOpen(true)}
          />
        )}

        {activeTab === 'match_setup' && (
          <MatchSetup
            matchConfig={matchConfig}
            setMatchConfig={setMatchConfig}
            onRunOptimization={handleRunOptimization}
          />
        )}

        {activeTab === 'starting_xi' && (
          <StartingXI
            optimizationResult={optimizationResult}
            onNavigateToSetup={() => setActiveTab('match_setup')}
          />
        )}

        {activeTab === 'players' && (
          <PlayerExplorer />
        )}

        {activeTab === 'opposition' && (
          <OppositionIntelligence defaultOpponentId={matchConfig.opponent_id} />
        )}

        {activeTab === 'data_lab' && (
          <DataScienceLab />
        )}

        {activeTab === 'models' && (
          <ModelEvaluation />
        )}

        {activeTab === 'prediction' && (
          <MatchPrediction onOpenSimulator={() => setIsSimulatorOpen(true)} />
        )}

        {activeTab === 'data_mgmt' && (
          <DataManagement />
        )}
      </main>

      {/* Floating Tactical Telemetry Bar */}
      <TelemetryBar
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* Live Match Simulator Modal */}
      <LiveMatchSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        homeTeam={matchConfig.team_id}
        awayTeam={matchConfig.opponent_id}
      />

      {/* Tactical AI Copilot Drawer */}
      <TacticalCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-3.5 px-6 text-center text-xs text-slate-500">
        AI Football Scout & Tactical Intelligence System • UCL, EPL & La Liga Machine Learning Engine
      </footer>
    </div>
  );
}
