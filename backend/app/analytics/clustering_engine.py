import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
from sqlalchemy.orm import Session

from backend.app.data_pipeline.ingestion import DataPipeline

CLUSTERING_FEATURES = [
    "goals_p90", "xg_p90", "assists_p90", "xa_p90",
    "key_passes_p90", "progressive_passes_p90",
    "progressive_carries_p90", "successful_dribbles_p90",
    "tackles_p90", "interceptions_p90", "recoveries_p90",
    "aerials_won_p90"
]

class ClusteringEngine:
    def __init__(self, db: Session):
        self.pipeline = DataPipeline(db)

    def run_clustering(self, k: int = 5) -> Dict[str, Any]:
        """Performs K-Means clustering with silhouette evaluation and data-driven archetyping."""
        df = self.pipeline.get_player_per90_metrics(min_minutes=90)
        df = df[df["primary_position"] != "GK"].copy()
        if df.empty or len(df) < k + 1:
            return {"k": k, "silhouette_score": 0.0, "candidate_k_evaluations": [], "profiles": [], "scatter_points": []}

        features = [f for f in CLUSTERING_FEATURES if f in df.columns]
        X = df[features].fillna(0.0).values

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Evaluate candidate k
        candidate_evals = []
        max_possible_k = min(8, len(df) - 1)
        for cand_k in range(3, max_possible_k + 1):
            km_cand = KMeans(n_clusters=cand_k, random_state=42, n_init=10)
            labels_cand = km_cand.fit_predict(X_scaled)
            sil_cand = silhouette_score(X_scaled, labels_cand)
            candidate_evals.append({"k": cand_k, "silhouette_score": round(float(sil_cand), 3), "inertia": round(float(km_cand.inertia_), 1)})

        # Fit with chosen k
        k_final = min(k, len(df) - 1)
        kmeans = KMeans(n_clusters=k_final, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(X_scaled)
        main_silhouette = round(float(silhouette_score(X_scaled, cluster_labels)), 3)

        df["cluster"] = cluster_labels

        # 2D PCA for visual mapping
        pca = PCA(n_components=2, random_state=42)
        X_2d = pca.fit_transform(X_scaled)
        df["pca_x"] = [round(float(v), 3) for v in X_2d[:, 0]]
        df["pca_y"] = [round(float(v), 3) for v in X_2d[:, 1]]

        profiles = []
        for c_id in range(k_final):
            c_members = df[df["cluster"] == c_id]
            size = len(c_members)
            if size == 0:
                continue

            means = c_members[features].mean().to_dict()
            clean_means = {k.replace("_p90", ""): round(float(v), 2) for k, v in means.items()}

            # Label archetypes using measured characteristics
            archetype_label = self._infer_archetype(clean_means)

            # Top characteristics
            top_traits = []
            if clean_means.get("goals", 0) > 0.4 or clean_means.get("xg", 0) > 0.4:
                top_traits.append("Elite Box Threat & Finishing")
            if clean_means.get("progressive_passes", 0) > 6.0:
                top_traits.append("High Progressive Ball Distribution")
            if clean_means.get("key_passes", 0) > 1.8 or clean_means.get("xa", 0) > 0.25:
                top_traits.append("Creative Chance Generation")
            if clean_means.get("tackles", 0) > 2.5 or clean_means.get("interceptions", 0) > 2.0:
                top_traits.append("Active Defensive Interruption")
            if clean_means.get("progressive_carries", 0) > 4.0:
                top_traits.append("Direct Line-Breaking Carries")
            if not top_traits:
                top_traits = ["Balanced Squad Function", "Tactical Support Role"]

            reps = c_members["name"].head(4).tolist()

            profiles.append({
                "cluster_id": c_id,
                "label": archetype_label,
                "size": size,
                "top_characteristics": top_traits,
                "mean_stats": clean_means,
                "representative_players": reps
            })

        scatter_points = []
        cluster_label_map = {p["cluster_id"]: p["label"] for p in profiles}

        for _, r in df.iterrows():
            c_id = int(r["cluster"])
            scatter_points.append({
                "player_id": r["player_id"],
                "name": r["name"],
                "team_id": r["team_id"],
                "position": r["primary_position"],
                "cluster": c_id,
                "archetype": cluster_label_map.get(c_id, f"Cluster {c_id}"),
                "x": r["pca_x"],
                "y": r["pca_y"],
                "xg_p90": r.get("xg_p90", 0.0),
                "assists_p90": r.get("assists_p90", 0.0),
                "tackles_p90": r.get("tackles_p90", 0.0)
            })

        return {
            "k": k_final,
            "silhouette_score": main_silhouette,
            "candidate_k_evaluations": candidate_evals,
            "profiles": profiles,
            "scatter_points": scatter_points
        }

    def _infer_archetype(self, stats: Dict[str, float]) -> str:
        """Determines tactical archetype from measured cluster mean characteristics."""
        xg = stats.get("xg", 0.0)
        tackles = stats.get("tackles", 0.0)
        kp = stats.get("key_passes", 0.0)
        prog_p = stats.get("progressive_passes", 0.0)
        prog_c = stats.get("progressive_carries", 0.0)
        aerials = stats.get("aerials_won", 0.0)

        if xg >= 0.45:
            return "Clinical Finishing Striker"
        elif tackles >= 2.8 and prog_p < 5.0:
            return "Ball-Winning Defensive Anchor"
        elif kp >= 2.0 or (prog_p >= 7.0 and stats.get("assists", 0.0) >= 0.2):
            return "Creative Playmaker / Chance Creator"
        elif prog_c >= 4.5 and xg >= 0.2:
            return "Dynamic Direct Ball-Carrying Winger"
        elif aerials >= 3.0 and tackles >= 1.8:
            return "Progressive Aerial Stopper"
        elif prog_p >= 5.5 and tackles >= 2.0:
            return "Box-to-Box Transition Engine"
        else:
            return "Tactical Positional Operator"
