import React, { useState, useEffect } from 'react';
import {
  FlaskConical, BarChart3, ScatterChart as ScatterIcon,
  HelpCircle, Sparkles, Layers, Sliders, ChevronDown, Activity
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, ScatterChart, Scatter, Cell, ZAxis
} from 'recharts';
import { api } from '../api/client';

export default function DataScienceLab() {
  const [activeSubTab, setActiveSubTab] = useState('correlation');
  const [correlationData, setCorrelationData] = useState(null);
  const [pcaData, setPcaData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pcaComponents, setPcaComponents] = useState(5);
  const [kClusters, setKClusters] = useState(5);

  useEffect(() => {
    async function fetchLabData() {
      try {
        setLoading(true);
        const [corr, pca, clusters, summary] = await Promise.all([
          api.getCorrelationMatrix(),
          api.getPcaResults(pcaComponents),
          api.getClusterResults(kClusters),
          api.getAnalyticsSummary()
        ]);
        setCorrelationData(corr);
        setPcaData(pca);
        setClusterData(clusters);
        setSummaryData(summary);
      } catch (e) {
        console.error("Failed to load lab data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLabData();
  }, [pcaComponents, kClusters]);

  const subTabs = [
    { id: 'correlation', label: 'Pearson & Spearman Correlation' },
    { id: 'pca', label: 'PCA & Scree Plot' },
    { id: 'clustering', label: 'K-Means Player Archetypes' },
    { id: 'descriptive', label: 'Descriptive Statistics' },
  ];

  const getColorForPosition = (pos) => {
    switch (pos) {
      case 'ST': return '#ef4444';
      case 'LW':
      case 'RW': return '#f59e0b';
      case 'AM':
      case 'CM': return '#10b981';
      case 'DM': return '#06b6d4';
      case 'CB': return '#3b82f6';
      case 'LB':
      case 'RB': return '#8b5cf6';
      default: return '#94a3b8';
    }
  };

  const getClusterColor = (cId) => {
    const palette = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];
    return palette[cId % palette.length];
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs text-slate-400">Computing mathematical matrices and transformations…</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div>
        <div className="section-label">
          <FlaskConical className="w-4 h-4" />
          Exploratory Data Analysis & Dimensionality Reduction
        </div>
        <h1 className="page-title">Data Science & Statistical Lab</h1>
        <p className="page-sub">
          Rigorous statistical analysis, correlation significance, principal component loadings, and archetype discovery.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                : 'bg-white/[0.02] text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub Tab 1: Correlation */}
      {activeSubTab === 'correlation' && correlationData && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Pearson Correlation Heatmap Matrix</h2>
                <p className="text-xs text-slate-400">
                  Linear co-movement across per-90 metrics (sample: {correlationData.sample_count} players with ≥ 90 mins).
                </p>
              </div>
              <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-900/60 px-3.5 py-1.5 rounded-full max-w-md">
                {correlationData.disclaimer}
              </div>
            </div>

            {/* Correlation Grid Table */}
            <div className="overflow-x-auto pb-2">
              <table className="w-full text-center text-[11px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-2.5 text-left font-semibold text-slate-400">Metric</th>
                    {correlationData.metrics.map((m, idx) => (
                      <th key={idx} className="p-2.5 font-mono text-[10px] text-slate-300 max-w-[75px] truncate" title={m}>
                        {m.slice(0, 8)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationData.matrix.map((row, rIdx) => (
                    <tr key={rIdx} className="border-t border-slate-800/60">
                      <td className="p-2.5 text-left font-semibold text-slate-300 whitespace-nowrap">
                        {correlationData.metrics[rIdx]}
                      </td>
                      {row.map((val, cIdx) => {
                        const isPositive = val >= 0;
                        const intensity = Math.abs(val);
                        let bg = 'rgba(15, 23, 42, 0.6)';
                        if (rIdx === cIdx) {
                          bg = 'rgba(16, 185, 129, 0.4)';
                        } else if (isPositive) {
                          bg = `rgba(16, 185, 129, ${intensity * 0.7})`;
                        } else {
                          bg = `rgba(239, 68, 68, ${intensity * 0.7})`;
                        }

                        return (
                          <td
                            key={cIdx}
                            style={{ backgroundColor: bg }}
                            className="p-2.5 font-mono text-[11px] font-bold text-white transition-all hover:ring-1 hover:ring-white/50 cursor-default"
                            title={`${correlationData.metrics[rIdx]} vs ${correlationData.metrics[cIdx]}: r=${val}`}
                          >
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Significant Correlation Pairs */}
          <div className="card p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">Statistical Significance & Spearman Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {correlationData.details
                .filter(d => d.significant && d.metric_x !== d.metric_y && Math.abs(d.pearson_r) >= 0.45)
                .slice(0, 6)
                .map((pair, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="font-semibold text-slate-200">
                      {pair.metric_x} ↔ {pair.metric_y}
                    </div>
                    <div className="flex justify-between font-mono text-[11px] pt-1">
                      <span className="text-emerald-400">Pearson r: {pair.pearson_r}</span>
                      <span className="text-blue-400">Spearman ρ: {pair.spearman_rho}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      p-value: {pair.p_value} (p &lt; 0.05 statistically significant)
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 2: PCA */}
      {activeSubTab === 'pca' && pcaData && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scree Plot Chart */}
            <div className="card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">PCA Scree Plot (Explained Variance %)</h3>
                <p className="text-xs text-slate-400">Percentage of total player statistical variance captured</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pcaData.scree_plot}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="component" stroke="#64748b" textAnchor="middle" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d1420', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Bar dataKey="variance" fill="#10b981" radius={[4, 4, 0, 0]} name="Variance %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cumulative Explained Variance Chart */}
            <div className="card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Cumulative Explained Variance</h3>
                <p className="text-xs text-slate-400">Cumulative capture across principal components</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pcaData.scree_plot}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="component" stroke="#64748b" />
                    <YAxis domain={[0, 100]} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d1420', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Line type="monotone" dataKey="cumulative" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} name="Cumulative %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 2D PCA Scatterplot */}
          <div className="card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">2D PCA Player Projection (PC1 vs PC2)</h3>
              <p className="text-xs text-slate-400">
                Dimensional projection of outfield players. Colors represent playing positions.
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="pc1" name="PC1" stroke="#64748b" label={{ value: 'PC1 (Chance Creation & Progression)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="number" dataKey="pc2" name="PC2" stroke="#64748b" label={{ value: 'PC2 (Defensive Actions & Aerials)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                  <ZAxis range={[60, 60]} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0d1420] border border-slate-700 p-3 rounded-xl text-xs shadow-xl space-y-1">
                          <div className="font-bold text-white">{d.name} ({d.position})</div>
                          <div className="text-slate-400 text-[10px]">Club: {d.team_id}</div>
                          <div className="font-mono text-emerald-400 text-[10px]">PC1: {d.pc1} | PC2: {d.pc2}</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="Players" data={pcaData.scatter_points}>
                    {pcaData.scatter_points.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorForPosition(entry.position)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Component Loadings Table */}
          <div className="card p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">Principal Component Loadings (Feature Influences)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3 font-semibold">Original Metric</th>
                    <th className="py-2.5 px-3 font-semibold text-right">PC1 Loading</th>
                    <th className="py-2.5 px-3 font-semibold text-right">PC2 Loading</th>
                    <th className="py-2.5 px-3 font-semibold text-right">PC3 Loading</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {pcaData.loadings.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{row.feature}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${row.PC1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{row.PC1}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${row.PC2 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{row.PC2}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${row.PC3 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{row.PC3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 3: Clustering Archetypes */}
      {activeSubTab === 'clustering' && clusterData && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between card p-5">
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>Discovered Tactical Archetypes (K-Means)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                  k = {clusterData.k}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Evaluated with Silhouette Diagnostic Score:{' '}
                <span className="font-mono text-emerald-400 font-bold">{clusterData.silhouette_score}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Clusters:</span>
              <select
                value={kClusters}
                onChange={(e) => setKClusters(parseInt(e.target.value))}
                className="select-field text-xs py-1 px-3"
              >
                <option value={3}>3 Clusters</option>
                <option value={4}>4 Clusters</option>
                <option value={5}>5 Clusters</option>
                <option value={6}>6 Clusters</option>
              </select>
            </div>
          </div>

          {/* Archetype Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusterData.profiles.map((profile) => (
              <div
                key={profile.cluster_id}
                className="card p-5 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{ backgroundColor: getClusterColor(profile.cluster_id) }}
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  />
                  <span className="text-[10px] font-mono text-slate-400">{profile.size} Players</span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white">{profile.label}</h3>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Rep: {profile.representative_players.slice(0, 3).join(', ')}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Measured Traits</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.top_characteristics.map((c, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-emerald-400 border border-emerald-900/40">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono grid grid-cols-2 gap-1 text-slate-400">
                  <div>xG: <span className="text-white font-bold">{profile.mean_stats.xg}</span></div>
                  <div>Assists: <span className="text-white font-bold">{profile.mean_stats.assists}</span></div>
                  <div>Prog Passes: <span className="text-white font-bold">{profile.mean_stats.progressive_passes}</span></div>
                  <div>Tackles: <span className="text-white font-bold">{profile.mean_stats.tackles}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab 4: Descriptive Stats */}
      {activeSubTab === 'descriptive' && summaryData && (
        <div className="card p-6 space-y-4 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-white">Descriptive Statistical Distributions</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Summary quantiles, central tendencies, and higher moments for per-90 metrics.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-sans">
                  <th className="py-2.5 px-3 font-semibold">Metric</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Mean</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Std</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Median</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Q25</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Q75</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Skewness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {summaryData.descriptive_stats.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{row.metric}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{row.mean}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{row.std}</td>
                    <td className="py-2.5 px-3 text-right text-white">{row.median}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{row.q25}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{row.q75}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{row.skewness}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
