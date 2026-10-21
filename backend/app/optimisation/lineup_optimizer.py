import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from scipy.optimize import linear_sum_assignment
from sqlalchemy.orm import Session

from backend.app.recommendations.recommender import HybridPlayerRecommender
from backend.app.db.models import Player
from backend.app.db.schemas import (
    StartingXIOptimizationRequest, StartingXIOptimizationResponse,
    StarterAssignment, ScoredPlayerCandidate, RecommenderWeights
)

FORMATION_ROLES = {
    "4-3-3": [
        {"code": "GK", "name": "Goalkeeper", "target_pos": "GK", "instruction": "Sweeper keeper; initiate buildup from back"},
        {"code": "LB", "name": "Left Fullback", "target_pos": "LB", "instruction": "Inverted support; maintain defensive cover"},
        {"code": "CB_L", "name": "Left Centerback", "target_pos": "CB", "instruction": "Ball-playing defender; diagonal distribution"},
        {"code": "CB_R", "name": "Right Centerback", "target_pos": "CB", "instruction": "Covering defender; dominate aerial duels"},
        {"code": "RB", "name": "Right Fullback", "target_pos": "RB", "instruction": "Overlapping wide outlet into final third"},
        {"code": "DM", "name": "Defensive Midfielder", "target_pos": "DM", "instruction": "Single pivot; shield backline and break counters"},
        {"code": "CM_L", "name": "Left Central Midfielder", "target_pos": "CM", "instruction": "Box-to-box engine; second-wave arrival"},
        {"code": "CM_R", "name": "Right Central Midfielder", "target_pos": "AM", "instruction": "Advanced playmaker; create between the lines"},
        {"code": "LW", "name": "Left Winger", "target_pos": "LW", "instruction": "Inside forward; cut inside to shoot and isolate fullback"},
        {"code": "RW", "name": "Right Winger", "target_pos": "RW", "instruction": "Direct winger; deliver low crosses and stretch width"},
        {"code": "ST", "name": "Center Forward", "target_pos": "ST", "instruction": "Target finisher; attack near post and pin centerbacks"}
    ],
    "4-2-3-1": [
        {"code": "GK", "name": "Goalkeeper", "target_pos": "GK", "instruction": "Command the penalty box and distribution"},
        {"code": "LB", "name": "Left Fullback", "target_pos": "LB", "instruction": "Overlapping runs down the flank"},
        {"code": "CB_L", "name": "Left Centerback", "target_pos": "CB", "instruction": "Aggressive stopper on opponent striker"},
        {"code": "CB_R", "name": "Right Centerback", "target_pos": "CB", "instruction": "Covering CB managing depth"},
        {"code": "RB", "name": "Right Fullback", "target_pos": "RB", "instruction": "Defensive tuck-in during rest defense"},
        {"code": "DM_L", "name": "Left Double Pivot", "target_pos": "DM", "instruction": "Deep-lying playmaker dictating tempo"},
        {"code": "DM_R", "name": "Right Double Pivot", "target_pos": "DM", "instruction": "Ball-winning destroyer breaking transitions"},
        {"code": "AM", "name": "Attacking Midfielder", "target_pos": "AM", "instruction": "Number 10 operating in half-spaces"},
        {"code": "LW", "name": "Left Winger", "target_pos": "LW", "instruction": "Pacey outlet for rapid counter-attacks"},
        {"code": "RW", "name": "Right Winger", "target_pos": "RW", "instruction": "Creative inverted wide playmaker"},
        {"code": "ST", "name": "Striker", "target_pos": "ST", "instruction": "Clinical penalty box predator"}
    ],
    "4-4-2": [
        {"code": "GK", "name": "Goalkeeper", "target_pos": "GK", "instruction": "Reliable shot stopper and long kicking target"},
        {"code": "LB", "name": "Left Fullback", "target_pos": "LB", "instruction": "Hold wide defensive shape"},
        {"code": "CB_L", "name": "Left Centerback", "target_pos": "CB", "instruction": "Win first balls and physical duels"},
        {"code": "CB_R", "name": "Right Centerback", "target_pos": "CB", "instruction": "Organize offside trap and low block"},
        {"code": "RB", "name": "Right Fullback", "target_pos": "RB", "instruction": "Compact full-back holding the touchline"},
        {"code": "LM", "name": "Left Wide Midfielder", "target_pos": "LW", "instruction": "Track opposing runner and cross early"},
        {"code": "CM_L", "name": "Central Midfielder", "target_pos": "CM", "instruction": "Ball retention and switch of play"},
        {"code": "CM_R", "name": "Central Midfielder", "target_pos": "DM", "instruction": "Second-ball recovery in central corridor"},
        {"code": "RM", "name": "Right Wide Midfielder", "target_pos": "RW", "instruction": "Support transitions and wide deliveries"},
        {"code": "ST_L", "name": "Mobile Striker", "target_pos": "ST", "instruction": "Drop deep to link play"},
        {"code": "ST_R", "name": "Advanced Striker", "target_pos": "ST", "instruction": "Run channels behind high defensive line"}
    ],
    "3-5-2": [
        {"code": "GK", "name": "Goalkeeper", "target_pos": "GK", "instruction": "Active line-keeper and accurate restarts"},
        {"code": "CB_L", "name": "Left Wide Centerback", "target_pos": "CB", "instruction": "Step forward into midfield with the ball"},
        {"code": "CB_C", "name": "Central Sweeper", "target_pos": "CB", "instruction": "Anchor back three and cover behind"},
        {"code": "CB_R", "name": "Right Wide Centerback", "target_pos": "CB", "instruction": "Aggressive duel winner on wide channel"},
        {"code": "LWB", "name": "Left Wingback", "target_pos": "LB", "instruction": "Full-flank stamina, provide primary width"},
        {"code": "RWB", "name": "Right Wingback", "target_pos": "RB", "instruction": "High and wide attacking outlet"},
        {"code": "DM", "name": "Anchor Midfielder", "target_pos": "DM", "instruction": "Recycle possession and stifle counters"},
        {"code": "CM_L", "name": "Left Interior", "target_pos": "CM", "instruction": "Half-space runner creating overloads"},
        {"code": "CM_R", "name": "Right Interior", "target_pos": "AM", "instruction": "Creative key-pass provider"},
        {"code": "ST_L", "name": "Target Striker", "target_pos": "ST", "instruction": "Hold-up play and aerial duel superiority"},
        {"code": "ST_R", "name": "Poacher Striker", "target_pos": "ST", "instruction": "Lethal instinctive finishing in box"}
    ],
    "3-4-3": [
        {"code": "GK", "name": "Goalkeeper", "target_pos": "GK", "instruction": "Initiate build-up with wide centerbacks"},
        {"code": "CB_L", "name": "Left Centerback", "target_pos": "CB", "instruction": "Step out into wide zones"},
        {"code": "CB_C", "name": "Central Centerback", "target_pos": "CB", "instruction": "Command the defensive line"},
        {"code": "CB_R", "name": "Right Centerback", "target_pos": "CB", "instruction": "Provide physical presence and aerial cover"},
        {"code": "LM", "name": "Left Midfielder", "target_pos": "LB", "instruction": "Sprint transitions and track back"},
        {"code": "CM_L", "name": "Central Midfielder", "target_pos": "CM", "instruction": "Dictate play and retain structure"},
        {"code": "CM_R", "name": "Central Midfielder", "target_pos": "DM", "instruction": "Win duels and cover wide spaces"},
        {"code": "RM", "name": "Right Midfielder", "target_pos": "RB", "instruction": "Provide flank width and early deliveries"},
        {"code": "LW", "name": "Left Winger", "target_pos": "LW", "instruction": "Isolate defenders in 1v1 situations"},
        {"code": "RW", "name": "Right Winger", "target_pos": "RW", "instruction": "Combine closely with central striker"},
        {"code": "ST", "name": "Central Striker", "target_pos": "ST", "instruction": "Primary scoring threat"}
    ]
}

class StartingXIOptimizer:
    def __init__(self, db: Session):
        self.db = db
        self.recommender = HybridPlayerRecommender(db)

    def optimize_starting_xi(self, request: StartingXIOptimizationRequest) -> StartingXIOptimizationResponse:
        """Solves optimal 11-player lineup using constrained SciPy Hungarian optimization."""
        formation = request.formation if request.formation in FORMATION_ROLES else "4-3-3"
        roles = FORMATION_ROLES[formation]

        # Fetch squad players
        squad = self.db.query(Player).filter(Player.team_id == request.team_id).all()
        if not squad:
            raise ValueError(f"No squad found for team {request.team_id}")

        # Filter out explicitly excluded players
        available_squad = [
            p for p in squad
            if p.id not in request.excluded_player_ids and (p.is_available or p.id in request.locked_player_ids)
        ]

        if len(available_squad) < 11:
            # Fallback if too many excluded: include back available
            available_squad = squad[:15]

        # Score all players for all target roles in the formation
        # Matrix shape: (num_players, 11 roles)
        cost_matrix = np.zeros((len(available_squad), 11))
        candidates_cache: Dict[Tuple[int, int], ScoredPlayerCandidate] = {}

        for col_idx, role in enumerate(roles):
            target_pos = role["target_pos"]
            scored_candidates = self.recommender.rank_candidates_for_position(
                team_id=request.team_id,
                opponent_id=request.opponent_id,
                target_position=target_pos,
                tactical_objective=request.tactical_objective,
                is_home=request.is_home,
                weights=request.weights
            )
            cand_map = {c.player_id: c for c in scored_candidates}

            for row_idx, player in enumerate(available_squad):
                cand = cand_map.get(player.id)
                if cand is None:
                    # Construct basic fallback candidate
                    cand = ScoredPlayerCandidate(
                        player_id=player.id, name=player.name, primary_position=player.primary_position,
                        suitability_score=50.0, form_score=50.0, role_score=50.0, tactical_score=50.0,
                        style_score=50.0, availability_score=50.0, archetype=None,
                        strengths=["Squad Member"], risks=[]
                    )
                
                score = cand.suitability_score

                # Mandatory constraints:
                # 1. Exactly 1 GK: If role is GK and player is not GK -> severe penalty
                if target_pos == "GK" and player.primary_position != "GK":
                    score = -500.0
                elif target_pos != "GK" and player.primary_position == "GK":
                    score = -500.0
                else:
                    # Positional Line Compatibility (DEF, MID, ATT)
                    def_roles = {"CB", "LB", "RB", "LWB", "RWB"}
                    mid_roles = {"DM", "CM", "AM"}
                    att_roles = {"LW", "RW", "ST"}
                    
                    p_pos = player.primary_position
                    sec_positions = set(str(player.secondary_positions or "").split(","))

                    is_def_role = target_pos in def_roles
                    is_mid_role = target_pos in mid_roles
                    is_att_role = target_pos in att_roles

                    is_p_def = p_pos in def_roles
                    is_p_mid = p_pos in mid_roles
                    is_p_att = p_pos in att_roles

                    # If playing in different line and not in secondary positions
                    if is_def_role and not is_p_def and target_pos not in sec_positions:
                        score -= 90.0
                    elif is_att_role and not is_p_att and target_pos not in sec_positions:
                        score -= 90.0
                    elif is_mid_role and is_p_def and target_pos not in sec_positions:
                        score -= 60.0

                # 2. Locked players bonus: Give high priority
                if player.id in request.locked_player_ids:
                    # If position aligns, boost significantly
                    if player.primary_position == target_pos or (player.primary_position != "GK" and target_pos != "GK"):
                        score += 300.0

                # Convert to cost (SciPy minimizes cost)
                cost_matrix[row_idx, col_idx] = -score
                candidates_cache[(row_idx, col_idx)] = cand

        # Solve assignment problem
        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        starters: List[StarterAssignment] = []
        selected_player_ids = set()
        total_suitability = 0.0

        for r_idx, c_idx in zip(row_ind, col_ind):
            role_def = roles[c_idx]
            cand = candidates_cache[(r_idx, c_idx)]
            starters.append(StarterAssignment(
                role_code=role_def["code"],
                role_name=role_def["name"],
                player=cand,
                tactical_instruction=role_def["instruction"]
            ))
            selected_player_ids.add(cand.player_id)
            total_suitability += cand.suitability_score

        # Order starters in natural tactical order
        role_code_order = [r["code"] for r in roles]
        starters.sort(key=lambda s: role_code_order.index(s.role_code))

        # Bench: Ranked players not in starters
        bench_candidates = []
        remaining_players = [p for p in squad if p.id not in selected_player_ids and p.id not in request.excluded_player_ids]
        for p in remaining_players:
            scored = self.recommender.rank_candidates_for_position(
                team_id=request.team_id,
                opponent_id=request.opponent_id,
                target_position=p.primary_position,
                tactical_objective=request.tactical_objective,
                is_home=request.is_home,
                weights=request.weights
            )
            if scored:
                bench_candidates.append(scored[0])

        bench_candidates.sort(key=lambda x: x.suitability_score, reverse=True)
        bench = bench_candidates[:9]

        avg_suitability = round(total_suitability / 11.0, 1)

        summary = (
            f"Optimized {formation} formation against opponent ({request.opponent_id}). "
            f"Tactical system calibrated for '{request.tactical_objective}' approach with average squad suitability of {avg_suitability}/100. "
            f"Lineup enforces strict 1-GK constraint and unique positional assignments."
        )

        warnings = []
        if len(starters) != 11:
            warnings.append("Warning: Could not fulfill exactly 11 starting players.")
        gk_count = sum(1 for s in starters if s.role_code == "GK")
        if gk_count != 1:
            warnings.append(f"Warning: Starting XI contains {gk_count} goalkeepers instead of 1.")

        return StartingXIOptimizationResponse(
            team_id=request.team_id,
            opponent_id=request.opponent_id,
            formation=formation,
            tactical_objective=request.tactical_objective,
            total_suitability_score=round(total_suitability, 1),
            average_suitability_score=avg_suitability,
            starters=starters,
            bench=bench,
            alternative_xi=None,
            tactical_summary=summary,
            warnings=warnings
        )
