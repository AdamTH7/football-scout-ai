import React, { useState, useEffect } from 'react';
import {
  Database, RefreshCw, CheckCircle2, ShieldCheck,
  FileSpreadsheet, HardDrive, Check, Activity, Layers
} from 'lucide-react';
import { api } from '../api/client';

export default function DataManagement() {
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importMessage, setImportMessage] = useState(null);

  useEffect(() => {
    fetchCoverage();
  }, []);

  const fetchCoverage = async () => {
    try {
      const health = await api.getHealth();
      setCoverage(health.coverage);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      const res = await api.triggerDataImport();
      setImportMessage(res);
      await fetchCoverage();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="section-label">
            <Database className="w-4 h-4" />
            Historical Football Ingestion & Schema Integrity
          </div>
          <h1 className="page-title">Data Management & Provenance</h1>
          <p className="page-sub">
            Monitor competition coverage, inspect data quality validation, and synchronize datasets.
          </p>
        </div>

        <button
          onClick={handleImport}
          disabled={loading}
          className="btn-primary text-xs py-2.5 px-4 shrink-0 cursor-pointer shadow-lg shadow-emerald-500/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synchronizing…' : 'Resync & Revalidate Data'}</span>
        </button>
      </div>

      {/* Coverage Status Card */}
      <div className="card p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-white">Database Coverage & Storage Integrity</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Active Ingestion Mode:{' '}
                <span className="text-emerald-400 font-bold font-mono">
                  {coverage?.data_mode || 'SQLite Relational Storage'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.03] border border-slate-800 px-3 py-1.5 rounded-lg">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQLite Embedded DB</span>
          </div>
        </div>

        {importMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              {importMessage.message} ({importMessage.records_processed} match appearances validated).
            </span>
          </div>
        )}

        {/* Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="stat-card">
            <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Competitions</div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {coverage?.competitions_count || 3}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">UCL, EPL, La Liga</div>
          </div>

          <div className="stat-card">
            <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Tracked Clubs</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {coverage?.teams_count || 14}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Top European Leagues</div>
          </div>

          <div className="stat-card">
            <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Roster Players</div>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1">
              {coverage?.players_count || 100}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Positional & Per-90 records</div>
          </div>

          <div className="stat-card">
            <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Match Events</div>
            <div className="text-2xl font-black text-purple-400 font-mono mt-1">
              {coverage?.matches_count || 200}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">3 Historical Seasons</div>
          </div>
        </div>
      </div>

      {/* Provenance & Schema Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Schema Standards & Data Pipeline Rules</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Data pipeline adheres strictly to zero-leakage protocols. Minutes validation guarantees that only appearances with valid playing time contribute to rolling form metrics.
          </p>
          <div className="space-y-2 text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Unique key constraints on players, clubs, and fixtures</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Per-90 standardizing formula: (metric / minutes) × 90</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Rolling 5-match window computed strictly prior to fixture date</span>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Data Provenance & Format Support</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Standardized schemas compatible with StatsBomb Open Data events and Football-Data.co.uk historical CSV archives.
          </p>
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
            <div><span className="text-slate-500">Storage:</span> backend/data/football_scout.db</div>
            <div><span className="text-slate-500">Artifacts:</span> backend/data/artifacts/</div>
            <div><span className="text-slate-500">Seed Datasets:</span> backend/data/demo/*.csv</div>
          </div>
        </div>
      </div>
    </div>
  );
}
