import React, { useState, useEffect } from 'react';
import {
  Binary, RefreshCw, TrendingUp, Award, Cpu, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell
} from 'recharts';
import { api } from '../api/client';

const MODELS = [
  { value: 'random_forest',      label: 'Random Forest',           desc: 'Ensemble of decision trees' },
  { value: 'gradient_boost',     label: 'Gradient Boost / XGBoost',desc: 'Boosted tree ensemble' },
  { value: 'logistic_regression',label: 'Logistic Regression',     desc: 'Multinomial linear model' },
];

const IMPORT_COLORS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#06b6d4','#ef4444','#ec4899','#84cc16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1420] border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-300 font-semibold mb-1">{label}</p>
      <p className="text-emerald-400 font-mono font-bold">{payload[0]?.value?.toFixed(4)}</p>
    </div>
  );
};

export default function ModelEvaluation() {
  const [modelType,  setModelType]  = useState('random_forest');
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [status,     setStatus]     = useState('');

  useEffect(() => { runTrain('random_forest'); }, []);

  const runTrain = async (type = modelType) => {
    setLoading(true);
    setStatus('Splitting chronological datasets & fitting model…');
    try {
      const res = await api.trainModel({ model_type: type, target: 'match_outcome', test_size: 0.2 });
      setResult(res);
      setStatus('Model evaluated on chronological out-of-sample test set.');
    } catch (e) {
      setStatus(`Training failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = (type) => {
    setModelType(type);
    runTrain(type);
  };

  const confusionMax = result
    ? Math.max(...result.confusion_matrix.flat())
    : 1;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="section-label"><Binary className="w-4 h-4" /> Supervised Machine Learning & Out-of-Sample Validation</div>
          <h1 className="page-title">ML Model Performance</h1>
          <p className="page-sub">Evaluate chronological test accuracy, log loss, Brier score, and probability calibration.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <select
            value={modelType}
            onChange={e => handleModelChange(e.target.value)}
            className="select-field text-xs"
          >
            {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button
            onClick={() => runTrain()}
            disabled={loading}
            className="btn-primary text-xs py-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Fitting…' : 'Retrain'}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {status && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-xs ${
          loading
            ? 'bg-blue-950/30 border-blue-800/30 text-blue-300'
            : 'bg-emerald-950/30 border-emerald-800/30 text-emerald-300'
        }`}>
          {loading
            ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
            : <CheckCircle2 className="w-4 h-4 shrink-0" />
          }
          <span>{status}</span>
        </div>
      )}

      {/* Model Selector Tabs */}
      <div className="flex gap-3 flex-wrap">
        {MODELS.map(m => (
          <button
            key={m.value}
            onClick={() => handleModelChange(m.value)}
            disabled={loading}
            className={`flex flex-col items-start px-4 py-3 rounded-xl border cursor-pointer transition-all text-left ${
              modelType === m.value
                ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                : 'bg-white/[0.02] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <span className={`text-xs font-bold ${modelType === m.value ? 'text-emerald-400' : ''}`}>{m.label}</span>
            <span className="text-[10px] mt-0.5 opacity-60">{m.desc}</span>
          </button>
        ))}
      </div>

      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Metric Cards */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'Accuracy',        value: `${(result.accuracy * 100).toFixed(1)}%`,       color: '#10b981' },
              { label: 'Macro F1',        value: result.f1_macro.toFixed(3),                     color: '#3b82f6' },
              { label: 'Precision',       value: result.precision_macro.toFixed(3),              color: '#8b5cf6' },
              { label: 'Recall',          value: result.recall_macro.toFixed(3),                 color: '#f59e0b' },
              { label: 'Log Loss',        value: result.log_loss_value.toFixed(3),               color: '#ef4444' },
              { label: 'Brier Score',     value: result.brier_score.toFixed(3),                  color: '#06b6d4' },
            ].map(({ label, value, color }) => (
              <div key={label} className="stat-card text-center items-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</div>
                <div className="text-2xl font-black font-mono" style={{ color }}>{value}</div>
                <div className="text-[10px] text-slate-600">
                  {result.test_samples} test matches
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix */}
            <div className="card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Confusion Matrix
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Predicted vs actual outcome on {result.test_samples} out-of-sample test matches
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-slate-500 font-semibold text-[11px]">Actual ╲ Predicted</th>
                      {result.classes.map((cls, i) => (
                        <th key={i} className="p-2 text-slate-400 font-semibold text-[11px]">{cls}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.confusion_matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-2 text-left font-bold text-slate-300 text-[11px]">{result.classes[rIdx]}</td>
                        {row.map((val, cIdx) => {
                          const isCorrect = rIdx === cIdx;
                          const opacity = Math.max(0.2, val / confusionMax);
                          return (
                            <td
                              key={cIdx}
                              className="p-3 font-mono font-bold text-base rounded-lg"
                              style={{
                                background: isCorrect
                                  ? `rgba(16,185,129,${opacity * 0.4})`
                                  : `rgba(239,68,68,${opacity * 0.2})`,
                                color: isCorrect ? '#10b981' : '#ef4444',
                                border: isCorrect ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.1)',
                              }}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Importances */}
            <div className="card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Feature Importances
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Relative predictive influence per feature</p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={result.feature_importances}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 140, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#475569" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis
                      dataKey="feature"
                      type="category"
                      stroke="transparent"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      width={135}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                      {result.feature_importances.map((_, i) => (
                        <Cell key={i} fill={IMPORT_COLORS[i % IMPORT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Model Info Banner */}
          <div className="card p-5 flex flex-wrap items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Model ID:</span>
              <span className="font-mono text-slate-200">{result.model_id}</span>
            </div>
            <div>
              <span className="text-slate-400">Training samples: </span>
              <span className="font-mono text-emerald-400 font-bold">{result.training_samples}</span>
            </div>
            <div>
              <span className="text-slate-400">Test samples: </span>
              <span className="font-mono text-blue-400 font-bold">{result.test_samples}</span>
            </div>
            <div>
              <span className="text-slate-400">Classes: </span>
              <span className="font-semibold text-slate-300">{result.classes.join(' · ')}</span>
            </div>
            <div className="badge-emerald ml-auto">
              <CheckCircle2 className="w-3 h-3" /> Zero Data Leakage Split
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
