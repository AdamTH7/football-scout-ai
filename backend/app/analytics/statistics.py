import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

from backend.app.data_pipeline.ingestion import DataPipeline

NUMERICAL_ANALYSIS_METRICS = [
    "goals_p90", "xg_p90", "assists_p90", "xa_p90",
    "key_passes_p90", "progressive_passes_p90",
    "progressive_carries_p90", "successful_dribbles_p90",
    "tackles_p90", "interceptions_p90", "recoveries_p90",
    "aerials_won_p90"
]

class StatisticsEngine:
    def __init__(self, db: Session):
        self.pipeline = DataPipeline(db)

    def calculate_correlations(self) -> Dict[str, Any]:
        """Calculates Pearson and Spearman correlations, p-values, sample counts."""
        df = self.pipeline.get_player_per90_metrics(min_minutes=90)
        if df.empty:
            return {"metrics": [], "matrix": [], "spearman_matrix": [], "details": [], "sample_count": 0, "disclaimer": ""}

        available_metrics = [m for m in NUMERICAL_ANALYSIS_METRICS if m in df.columns]
        sub_df = df[available_metrics].dropna()
        n = len(sub_df)

        pearson_mat = []
        spearman_mat = []
        details = []

        for m_x in available_metrics:
            p_row = []
            s_row = []
            for m_y in available_metrics:
                if m_x == m_y:
                    p_val = 1.0
                    s_val = 1.0
                    pval = 0.0
                else:
                    p_r, pval = stats.pearsonr(sub_df[m_x], sub_df[m_y])
                    s_r, _ = stats.spearmanr(sub_df[m_x], sub_df[m_y])
                    p_val = round(float(p_r), 3)
                    s_val = round(float(s_r), 3)

                p_row.append(p_val)
                s_row.append(s_val)

                if m_x <= m_y:
                    details.append({
                        "metric_x": m_x.replace("_p90", " / 90").replace("_", " ").title(),
                        "metric_y": m_y.replace("_p90", " / 90").replace("_", " ").title(),
                        "pearson_r": p_val,
                        "spearman_rho": s_val,
                        "p_value": round(float(pval), 5),
                        "sample_size": n,
                        "significant": bool(pval < 0.05)
                    })
            pearson_mat.append(p_row)
            spearman_mat.append(s_row)

        clean_labels = [m.replace("_p90", "").replace("_", " ").title() for m in available_metrics]

        return {
            "metrics": clean_labels,
            "raw_metric_keys": available_metrics,
            "matrix": pearson_mat,
            "spearman_matrix": spearman_mat,
            "details": details,
            "sample_count": n,
            "disclaimer": "Note: Statistical correlation demonstrates linear or monotonic co-movement, but does not establish tactical causation. Sample includes players with >= 90 minutes."
        }

    def get_descriptive_summary(self) -> Dict[str, Any]:
        """Provides descriptive distribution statistics for player performance."""
        df = self.pipeline.get_player_per90_metrics(min_minutes=90)
        if df.empty:
            return {"total_players": 0, "total_matches": 0, "total_teams": 0, "competitions": [], "descriptive_stats": [], "position_distributions": {}}

        available_metrics = [m for m in NUMERICAL_ANALYSIS_METRICS if m in df.columns]
        rows = []
        for m in available_metrics:
            series = df[m].dropna()
            if len(series) > 0:
                rows.append({
                    "metric": m.replace("_p90", " / 90").replace("_", " ").title(),
                    "mean": round(float(series.mean()), 2),
                    "std": round(float(series.std()), 2),
                    "median": round(float(series.median()), 2),
                    "q25": round(float(series.quantile(0.25)), 2),
                    "q75": round(float(series.quantile(0.75)), 2),
                    "min": round(float(series.min()), 2),
                    "max": round(float(series.max()), 2),
                    "skewness": round(float(stats.skew(series)), 2)
                })

        pos_dist = df["primary_position"].value_counts().to_dict()
        coverage = self.pipeline.get_coverage_report()

        return {
            "total_players": len(df),
            "total_matches": coverage["matches_count"],
            "total_teams": coverage["teams_count"],
            "competitions": coverage["competitions_list"],
            "descriptive_stats": rows,
            "position_distributions": pos_dist
        }
