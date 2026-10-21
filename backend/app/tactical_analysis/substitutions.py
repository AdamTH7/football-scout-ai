from typing import Dict, Any, List
from sqlalchemy.orm import Session
import pandas as pd

from backend.app.db.models import Player
from backend.app.db.schemas import (
    SubstitutionScenarioRequest, SubstitutionScenarioResponse,
    SubstitutionRecommendation
)
from backend.app.recommendations.recommender import HybridPlayerRecommender

class SubstitutionEngine:
    def __init__(self, db: Session):
        self.db = db
        self.recommender = HybridPlayerRecommender(db)

    def recommend_substitutions(self, request: SubstitutionScenarioRequest) -> SubstitutionScenarioResponse:
        """Generates scenario-based in-game substitution recommendations with tactical rationale."""
        # Query squad
        squad = self.db.query(Player).filter(Player.team_id == request.team_id).all()
        squad_map = {p.id: p for p in squad}

        active_players = [squad_map[pid] for pid in request.active_player_ids if pid in squad_map]
        bench_players = [
            p for p in squad
            if p.id not in request.active_player_ids
            and p.id not in request.already_substituted_ids
            and p.is_available
            and p.primary_position != "GK"
        ]

        # Determine game state
        score_diff = (request.score_home - request.score_away) if request.is_home else (request.score_away - request.score_home)
        
        recommendations: List[SubstitutionRecommendation] = []

        # Find fatigued or tactical change candidates among active outfield players
        outfield_actives = [p for p in active_players if p.primary_position != "GK"]
        # Sort active outfield by fatigue index descending
        outfield_actives.sort(key=lambda p: (p.fatigue_index + (request.current_minute * 0.4)), reverse=True)

        used_bench_ids = set()

        for active in outfield_actives[:3]:
            # Look for suitable bench player in same or complementary role
            matching_bench = [
                b for b in bench_players
                if b.id not in used_bench_ids
                and (b.primary_position == active.primary_position or (b.secondary_positions and active.primary_position in b.secondary_positions))
            ]

            if not matching_bench:
                # Any bench player of same broad line (def, mid, att)
                matching_bench = [b for b in bench_players if b.id not in used_bench_ids]

            if not matching_bench:
                continue

            bench_pick = matching_bench[0]
            used_bench_ids.add(bench_pick.id)

            # Build tactical explanation
            priority = "Tactical"
            if request.current_minute >= 70 and active.fatigue_index > 25.0:
                priority = "Conditioning"
            elif request.tactical_objective == "chase_goal" and score_diff <= 0:
                priority = "Immediate"

            if request.tactical_objective == "chase_goal":
                impact = f"Injects fresh attacking speed and box presence to overturn deficit ({request.score_home}-{request.score_away})."
                reason = f"Replace {active.name} (accumulated fatigue {round(active.fatigue_index + request.current_minute * 0.3, 1)}) with {bench_pick.name} for direct vertical threat."
            elif request.tactical_objective == "protect_lead":
                impact = f"Solidifies defensive transition stability and closes half-spaces in late game."
                reason = f"Introduce {bench_pick.name} to reinforce pressing resistance and secure the lead."
            else:
                impact = f"Preserves team pressing intensity and physical output in the final {90 - request.current_minute} minutes."
                reason = f"Proactive stamina rotation replacing {active.name} with {bench_pick.name}."

            recommendations.append(SubstitutionRecommendation(
                player_out_id=active.id,
                player_out_name=active.name,
                player_in_id=bench_pick.id,
                player_in_name=bench_pick.name,
                target_role=active.primary_position,
                priority=priority,
                tactical_reason=reason,
                expected_impact=impact
            ))

        scenario_desc = (
            f"Match minute {request.current_minute}' | Scoreline: {request.score_home}-{request.score_away} | "
            f"Objective: {request.tactical_objective.replace('_', ' ').title()}"
        )

        notes = (
            f"Evaluated active squad fatigue thresholds and bench alternatives. "
            f"A total of {len(recommendations)} scenario-based tactical adjustments suggested."
        )

        return SubstitutionScenarioResponse(
            scenario_description=scenario_desc,
            recommendations=recommendations,
            tactical_notes=notes
        )
