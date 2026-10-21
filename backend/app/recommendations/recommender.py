import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

from backend.app.data_pipeline.ingestion import DataPipeline
from backend.app.db.models import Player, TeamMatchStat, PlayerMatchStat
from backend.app.db.schemas import RecommenderWeights, ScoredPlayerCandidate

class HybridPlayerRecommender:
    def __init__(self, db: Session):
        self.db = db
        self.pipeline = DataPipeline(db)

    def rank_candidates_for_position(
        self,
        team_id: str,
        opponent_id: str,
        target_position: str,
        tactical_objective: str = "balanced",
        is_home: bool = True,
        weights: Optional[RecommenderWeights] = None
    ) -> List[ScoredPlayerCandidate]:
        """Ranks eligible squad players for a target role using a weighted multi-factor heuristic."""
        if weights is None:
            weights = RecommenderWeights()

        df = self.pipeline.get_player_per90_metrics(min_minutes=45)
        # Filter for this team's squad
        squad_df = df[df["team_id"] == team_id].copy()
        if squad_df.empty:
            # Fallback to query all players for this team directly
            players = self.db.query(Player).filter(Player.team_id == team_id).all()
            if not players:
                return []
            squad_df = pd.DataFrame([{
                "player_id": p.id, "name": p.name, "team_id": p.team_id,
                "primary_position": p.primary_position, "secondary_positions": p.secondary_positions,
                "is_available": p.is_available, "fitness_rating": p.fitness_rating, "fatigue_index": p.fatigue_index,
                "minutes_played": 180, "goals_p90": 0.2, "xg_p90": 0.2, "assists_p90": 0.1, "xa_p90": 0.1,
                "key_passes_p90": 1.0, "progressive_passes_p90": 4.0, "progressive_carries_p90": 3.0,
                "successful_dribbles_p90": 1.0, "tackles_p90": 1.5, "interceptions_p90": 1.2,
                "recoveries_p90": 5.0, "aerials_won_p90": 1.5, "saves_p90": 2.5
            } for p in players])

        # Opponent profile
        opp_stats_query = self.db.query(TeamMatchStat).filter(TeamMatchStat.team_id == opponent_id)
        opp_stats = pd.read_sql(opp_stats_query.statement, self.db.bind)
        opp_ppda = opp_stats["ppda"].mean() if not opp_stats.empty else 10.5
        opp_xg_conceded = opp_stats["xg_conceded"].mean() if not opp_stats.empty else 1.3

        candidates: List[ScoredPlayerCandidate] = []

        for _, row in squad_df.iterrows():
            pos = row["primary_position"]
            sec_pos = str(row.get("secondary_positions", "")).split(",")

            # Positional eligibility check
            pos_match = 1.0 if pos == target_position else (0.65 if target_position in sec_pos else 0.2)

            # 1. Form Score (0-100)
            mins = row.get("minutes_played", 90)
            form_score = min(100.0, 50.0 + (mins / 40.0) * 10.0 + (row.get("fitness_rating", 90.0) - 85.0) * 2.0)

            # 2. Role-specific performance score (0-100)
            role_score = self._compute_role_score(row, target_position) * pos_match

            # 3. Tactical matchup suitability (0-100)
            tactical_score = self._compute_tactical_score(row, target_position, opp_ppda, opp_xg_conceded, tactical_objective)

            # 4. Team-style compatibility (0-100)
            style_score = 75.0 + min(20.0, row.get("progressive_passes_p90", 2.0) * 2.5)

            # 5. Availability & Workload score (0-100)
            is_avail = bool(row.get("is_available", True))
            fit = float(row.get("fitness_rating", 100.0))
            fatigue = float(row.get("fatigue_index", 10.0))
            avail_score = (fit - fatigue * 1.5) if is_avail else 10.0
            avail_score = max(0.0, min(100.0, avail_score))

            # Composite weighted suitability score
            total_weight = (
                weights.form_weight + weights.role_weight + weights.tactical_weight +
                weights.style_weight + weights.availability_weight
            )
            suitability = (
                (weights.form_weight * form_score) +
                (weights.role_weight * role_score) +
                (weights.tactical_weight * tactical_score) +
                (weights.style_weight * style_score) +
                (weights.availability_weight * avail_score)
            ) / (total_weight if total_weight > 0 else 1.0)

            # Explainability: drivers and risks
            strengths = []
            risks = []

            if pos == target_position:
                strengths.append(f"Natural {target_position} with established positional familiarity")
            elif target_position in sec_pos:
                strengths.append(f"Demonstrated secondary flexibility in {target_position}")
            else:
                risks.append(f"Playing out of natural position ({pos})")

            if row.get("xg_p90", 0) > 0.35:
                strengths.append(f"High direct threat ({row.get('xg_p90', 0)} xG/90)")
            if row.get("key_passes_p90", 0) > 1.8:
                strengths.append(f"Elite chance creation ({row.get('key_passes_p90', 0)} key passes/90)")
            if row.get("progressive_passes_p90", 0) > 7.0:
                strengths.append(f"Press-resistant ball progression ({row.get('progressive_passes_p90', 0)} prog passes/90)")
            if row.get("tackles_p90", 0) + row.get("interceptions_p90", 0) > 4.0:
                strengths.append(f"High defensive ball recovery volume ({row.get('tackles_p90', 0) + row.get('interceptions_p90', 0)} / 90)")

            if not is_avail:
                risks.append("Medical status: Unconfirmed fitness / unavailable")
            if fatigue > 25.0:
                risks.append(f"Elevated workload fatigue index ({fatigue}/100)")
            if not strengths:
                strengths.append("Reliable foundational tactical profile")

            candidates.append(ScoredPlayerCandidate(
                player_id=row["player_id"],
                name=row["name"],
                primary_position=pos,
                suitability_score=round(suitability, 1),
                form_score=round(form_score, 1),
                role_score=round(role_score, 1),
                tactical_score=round(tactical_score, 1),
                style_score=round(style_score, 1),
                availability_score=round(avail_score, 1),
                archetype=None,
                strengths=strengths,
                risks=risks
            ))

        # Rank by suitability score descending
        candidates.sort(key=lambda x: x.suitability_score, reverse=True)
        return candidates

    def _compute_role_score(self, row: pd.Series, pos: str) -> float:
        """Calculates role-specific capability metric on 0-100 scale."""
        if pos == "GK":
            saves = row.get("saves_p90", 2.0)
            return min(100.0, 50.0 + saves * 15.0)
        elif pos in ["CB"]:
            def_act = row.get("clearances_p90", 2.0) * 6.0 + row.get("aerials_won_p90", 1.5) * 8.0 + row.get("tackles_p90", 1.0) * 10.0
            return min(100.0, 40.0 + def_act)
        elif pos in ["LB", "RB"]:
            wide_act = row.get("tackles_p90", 1.5) * 8.0 + row.get("progressive_carries_p90", 2.0) * 6.0 + row.get("key_passes_p90", 0.8) * 12.0
            return min(100.0, 40.0 + wide_act)
        elif pos in ["DM"]:
            mid_def = row.get("tackles_p90", 2.0) * 10.0 + row.get("interceptions_p90", 1.5) * 10.0 + row.get("progressive_passes_p90", 4.0) * 4.0
            return min(100.0, 40.0 + mid_def)
        elif pos in ["CM", "AM"]:
            mid_creat = row.get("key_passes_p90", 1.2) * 14.0 + row.get("progressive_passes_p90", 5.0) * 5.0 + row.get("xa_p90", 0.1) * 40.0
            return min(100.0, 35.0 + mid_creat)
        elif pos in ["LW", "RW"]:
            wing_act = row.get("successful_dribbles_p90", 1.5) * 10.0 + row.get("progressive_carries_p90", 4.0) * 6.0 + row.get("xg_p90", 0.2) * 35.0
            return min(100.0, 35.0 + wing_act)
        elif pos in ["ST"]:
            st_act = row.get("xg_p90", 0.3) * 60.0 + row.get("goals_p90", 0.3) * 40.0 + row.get("shots_p90", 2.0) * 5.0
            return min(100.0, 35.0 + st_act)
        return 70.0

    def _compute_tactical_score(self, row: pd.Series, pos: str, opp_ppda: float, opp_xg_c: float, objective: str) -> float:
        """Computes tactical fit against opponent's pressing pattern and defensive tendencies."""
        base = 70.0
        # Against aggressive pressing opponent (low PPDA < 10)
        if opp_ppda < 10.0:
            if row.get("progressive_passes_p90", 0) > 6.0 or row.get("successful_dribbles_p90", 0) > 2.0:
                base += 15.0 # Press resistance bonus
            else:
                base -= 5.0
        # Counter attacking objective
        if objective == "counter_attack":
            if row.get("progressive_carries_p90", 0) > 3.5:
                base += 12.0
        # High press objective
        elif objective == "high_press":
            if row.get("recoveries_p90", 0) > 5.0 or row.get("tackles_p90", 0) > 2.0:
                base += 12.0

        return max(20.0, min(100.0, base))

    def find_similar_players(self, player_id: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """Identifies statistical twins using cosine similarity across normalized per-90 metrics."""
        df = self.pipeline.get_player_per90_metrics(min_minutes=90)
        if df.empty or player_id not in df["player_id"].values:
            return []

        features = [
            "goals_p90", "xg_p90", "assists_p90", "xa_p90",
            "key_passes_p90", "progressive_passes_p90",
            "progressive_carries_p90", "successful_dribbles_p90",
            "tackles_p90", "interceptions_p90", "recoveries_p90",
            "aerials_won_p90"
        ]
        available_features = [f for f in features if f in df.columns]

        scaler = MinMaxScaler()
        X_norm = scaler.fit_transform(df[available_features].fillna(0.0))

        target_idx = df.index[df["player_id"] == player_id].tolist()[0]
        target_vec = X_norm[target_idx].reshape(1, -1)

        sims = cosine_similarity(target_vec, X_norm)[0]
        df["similarity"] = sims

        # Filter out self
        similar_df = df[df["player_id"] != player_id].sort_values("similarity", ascending=False).head(top_n)

        results = []
        for _, r in similar_df.iterrows():
            sim_pct = round(float(r["similarity"]) * 100, 1)
            # Find top shared traits
            traits = []
            if r.get("xg_p90", 0) > 0.3: traits.append("High Penalty Box xG")
            if r.get("progressive_passes_p90", 0) > 6.0: traits.append("Progressive Passing Volume")
            if r.get("tackles_p90", 0) > 2.0: traits.append("High Tackle Frequency")
            if not traits: traits = ["Positional Profile", "Ball Retention"]

            results.append({
                "id": r["player_id"],
                "name": r["name"],
                "team_id": r["team_id"],
                "primary_position": r["primary_position"],
                "similarity_score": sim_pct,
                "archetype": "Statistical Twin",
                "top_common_strengths": traits
            })

        return results
