import pandas as pd
import numpy as np
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from backend.app.db.models import Team, TeamMatchStat, Match
from backend.app.db.schemas import OppositionAnalysisRequest, OppositionAnalysisResponse, TacticalFactor

class OppositionAnalyzer:
    def __init__(self, db: Session):
        self.db = db

    def analyze_opponent(self, request: OppositionAnalysisRequest) -> OppositionAnalysisResponse:
        """Evaluates historical opponent tactical metrics to extract strengths, weaknesses, and tactics."""
        opp_team = self.db.query(Team).filter(Team.id == request.opponent_id).first()
        opp_name = opp_team.name if opp_team else request.opponent_id

        stats_query = self.db.query(TeamMatchStat).filter(TeamMatchStat.team_id == request.opponent_id)
        df = pd.read_sql(stats_query.statement, self.db.bind)

        if df.empty:
            # Fallback heuristic profile
            return OppositionAnalysisResponse(
                opponent_id=request.opponent_id,
                opponent_name=opp_name,
                matches_analyzed=0,
                goals_scored_avg=1.4,
                goals_conceded_avg=1.1,
                xg_avg=1.5,
                xg_conceded_avg=1.2,
                possession_avg=52.0,
                ppda_avg=10.5,
                pressing_intensity="Moderate Mid-Block",
                vulnerabilities=[],
                strengths=[],
                recommended_tactics=["Maintain disciplined compact defensive shape", "Exploit transition moments"],
                formation_vulnerabilities={"4-3-3": 1.2, "4-4-2": 1.4}
            )

        n_matches = len(df)
        g_scored = round(float(df["goals_scored"].mean()), 2)
        g_conceded = round(float(df["goals_conceded"].mean()), 2)
        xg_avg = round(float(df["xg"].mean()), 2)
        xg_c_avg = round(float(df["xg_conceded"].mean()), 2)
        pos_avg = round(float(df["possession_pct"].mean()), 1)
        ppda_avg = round(float(df["ppda"].mean()), 1)

        # Pressing classification
        if ppda_avg < 9.5:
            pressing_type = "Aggressive High-Press"
        elif ppda_avg < 13.0:
            pressing_type = "Moderate Mid-Block"
        else:
            pressing_type = "Low-Block / Deep Defensive Line"

        vulnerabilities: List[TacticalFactor] = []
        strengths: List[TacticalFactor] = []
        tactics: List[str] = []

        # Analyze pressing vulnerability
        if ppda_avg < 9.5:
            vulnerabilities.append(TacticalFactor(
                category="High Line & Press Exposure",
                description="Aggressive pressing structure leaves significant space behind the fullback line during rest defense.",
                severity="High",
                data_evidence=f"Opponent PPDA is {ppda_avg} (intense front press leaving vertical transition gaps)."
            ))
            tactics.append("Direct vertical passes into wide channels behind advancing fullbacks.")
            tactics.append("Utilize press-resistant midfielders to bypass the initial 3-man pressing trap.")
        else:
            strengths.append(TacticalFactor(
                category="Compact Defensive Shape",
                description="Opponent maintains compact central corridors and avoids reckless overcommitment in the high third.",
                severity="Medium",
                data_evidence=f"PPDA of {ppda_avg} with disciplined spatial recovery."
            ))
            tactics.append("Circulate possession with tempo to create wide overloads and pull central defenders out of zone.")

        # Analyze defensive concessions
        if xg_c_avg >= 1.3:
            vulnerabilities.append(TacticalFactor(
                category="Box Defensive Vulnerability",
                description="Consistently concedes high-quality scoring chances inside the 18-yard box.",
                severity="High",
                data_evidence=f"Conceding an average of {xg_c_avg} xG per match across historical data."
            ))
            tactics.append("Attack the penalty box with late-arriving central midfielders on second-phase cutbacks.")

        # Analyze possession and attacking threat
        if pos_avg > 54.0:
            strengths.append(TacticalFactor(
                category="Positional Possession Control",
                description="Dominates match tempo through sustained territorial possession and high passing volume.",
                severity="High",
                data_evidence=f"Controls {pos_avg}% possession on average."
            ))
            tactics.append("Deploy a mid-block trigger trap; force distribution to their less technically secure centerback.")
        else:
            vulnerabilities.append(TacticalFactor(
                category="Vulnerable to Sustained Pressure",
                description="Struggles to retain possession when pinned under sustained counter-pressing.",
                severity="Medium",
                data_evidence=f"Averages only {pos_avg}% possession."
            ))

        if g_scored > 1.8:
            strengths.append(TacticalFactor(
                category="Clinical Attacking Output",
                description="High finishing conversion and diverse threat generation across central and half-space lanes.",
                severity="High",
                data_evidence=f"Averages {g_scored} goals and {xg_avg} xG per match."
            ))
            tactics.append("Double up on wide wingers and maintain defensive midfield protection in Zone 14.")

        # Formation vulnerability breakdown
        form_vuln = {
            "4-3-3": round(float(xg_c_avg * 0.95), 2),
            "4-2-3-1": round(float(xg_c_avg * 1.05), 2),
            "3-5-2": round(float(xg_c_avg * 0.9), 2),
            "4-4-2": round(float(xg_c_avg * 1.1), 2)
        }

        return OppositionAnalysisResponse(
            opponent_id=request.opponent_id,
            opponent_name=opp_name,
            matches_analyzed=n_matches,
            goals_scored_avg=g_scored,
            goals_conceded_avg=g_conceded,
            xg_avg=xg_avg,
            xg_conceded_avg=xg_c_avg,
            possession_avg=pos_avg,
            ppda_avg=ppda_avg,
            pressing_intensity=pressing_type,
            vulnerabilities=vulnerabilities,
            strengths=strengths,
            recommended_tactics=tactics,
            formation_vulnerabilities=form_vuln
        )
