import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sqlalchemy.orm import Session

from backend.app.data_pipeline.ingestion import DataPipeline

PCA_FEATURES = [
    "goals_p90", "xg_p90", "assists_p90", "xa_p90",
    "key_passes_p90", "progressive_passes_p90",
    "progressive_carries_p90", "successful_dribbles_p90",
    "tackles_p90", "interceptions_p90", "recoveries_p90",
    "aerials_won_p90"
]

class PCAEngine:
    def __init__(self, db: Session):
        self.pipeline = DataPipeline(db)

    def run_pca(self, n_components: int = 5) -> Dict[str, Any]:
        """Runs standard PCA on player per-90 features, returning variance, loadings, and 2D projections."""
        df = self.pipeline.get_player_per90_metrics(min_minutes=90)
        # Exclude goalkeepers from outfield tactical PCA to prevent skewing
        df = df[df["primary_position"] != "GK"].copy()
        if df.empty or len(df) < 5:
            return {
                "n_components": 0, "explained_variance_ratio": [], "cumulative_variance_ratio": [],
                "scree_plot": [], "loadings": [], "scatter_points": [], "features_used": [], "interpretation": {}
            }

        features = [f for f in PCA_FEATURES if f in df.columns]
        X = df[features].fillna(0.0).values

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        n_comp = min(n_components, len(features), len(df))
        pca = PCA(n_components=n_comp, random_state=42)
        X_pca = pca.fit_transform(X_scaled)

        explained_var = [round(float(v), 4) for v in pca.explained_variance_ratio_]
        cumulative_var = [round(float(v), 4) for v in np.cumsum(pca.explained_variance_ratio_)]

        scree_plot = [
            {"component": f"PC{i+1}", "variance": round(float(var) * 100, 2), "cumulative": round(float(cum) * 100, 2)}
            for i, (var, cum) in enumerate(zip(explained_var, cumulative_var))
        ]

        # Loadings
        loadings = []
        for i, feat in enumerate(features):
            clean_feat = feat.replace("_p90", "").replace("_", " ").title()
            row = {"feature": clean_feat}
            for comp_idx in range(min(3, n_comp)):
                row[f"PC{comp_idx+1}"] = round(float(pca.components_[comp_idx, i]), 3)
            loadings.append(row)

        # 2D Projections for scatter plot
        scatter_points = []
        for i, (_, row) in enumerate(df.iterrows()):
            scatter_points.append({
                "player_id": row["player_id"],
                "name": row["name"],
                "team_id": row["team_id"],
                "position": row["primary_position"],
                "pc1": round(float(X_pca[i, 0]), 3),
                "pc2": round(float(X_pca[i, 1]), 3) if n_comp > 1 else 0.0,
                "pc3": round(float(X_pca[i, 2]), 3) if n_comp > 2 else 0.0,
                "goals_p90": row.get("goals_p90", 0.0),
                "xg_p90": row.get("xg_p90", 0.0),
                "assists_p90": row.get("assists_p90", 0.0),
                "tackles_p90": row.get("tackles_p90", 0.0)
            })

        # Interpretations based on highest loadings
        interpretation = {}
        for comp_idx in range(min(3, n_comp)):
            comp_loadings = pca.components_[comp_idx]
            top_pos_idx = np.argsort(comp_loadings)[-2:]
            top_neg_idx = np.argsort(comp_loadings)[:2]
            pos_names = [features[idx].replace("_p90", "").replace("_", " ") for idx in top_pos_idx]
            neg_names = [features[idx].replace("_p90", "").replace("_", " ") for idx in top_neg_idx]
            interpretation[f"PC{comp_idx+1}"] = (
                f"Driven positively by ({', '.join(pos_names)}) and negatively by ({', '.join(neg_names)})."
            )

        return {
            "n_components": n_comp,
            "explained_variance_ratio": explained_var,
            "cumulative_variance_ratio": cumulative_var,
            "scree_plot": scree_plot,
            "loadings": loadings,
            "scatter_points": scatter_points,
            "features_used": features,
            "interpretation": interpretation
        }
