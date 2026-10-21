from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

# --- Basic Entities ---

class CompetitionOut(BaseModel):
    id: str
    name: str
    country: Optional[str] = None
    tier: int = 1
    model_config = ConfigDict(from_attributes=True)

class SeasonOut(BaseModel):
    id: str
    competition_id: str
    name: str
    model_config = ConfigDict(from_attributes=True)

class TeamOut(BaseModel):
    id: str
    name: str
    short_name: str
    competition_id: str
    home_stadium: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PlayerOut(BaseModel):
    id: str
    name: str
    team_id: str
    primary_position: str
    secondary_positions: Optional[str] = ""
    age: int
    nationality: Optional[str] = ""
    preferred_foot: Optional[str] = "Right"
    is_available: bool = True
    fitness_rating: float = 100.0
    fatigue_index: float = 10.0
    
    # Aggregated/Computed stats
    matches_played: Optional[int] = 0
    goals_per_90: Optional[float] = 0.0
    xg_per_90: Optional[float] = 0.0
    assists_per_90: Optional[float] = 0.0
    xa_per_90: Optional[float] = 0.0
    key_passes_per_90: Optional[float] = 0.0
    progressive_passes_per_90: Optional[float] = 0.0
    tackles_interceptions_per_90: Optional[float] = 0.0
    clean_sheets: Optional[int] = 0
    archetype: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class SimilarPlayerOut(BaseModel):
    id: str
    name: str
    team_id: str
    primary_position: str
    similarity_score: float
    archetype: Optional[str] = None
    top_common_strengths: List[str]

# --- Recommendations & Starting XI ---

class RecommenderWeights(BaseModel):
    form_weight: float = Field(0.25, ge=0.0, le=1.0)
    role_weight: float = Field(0.25, ge=0.0, le=1.0)
    tactical_weight: float = Field(0.25, ge=0.0, le=1.0)
    style_weight: float = Field(0.15, ge=0.0, le=1.0)
    availability_weight: float = Field(0.10, ge=0.0, le=1.0)

class PlayerRecommendationRequest(BaseModel):
    team_id: str
    opponent_id: str
    target_position: str
    tactical_objective: Optional[str] = "balanced"  # high_press, counter_attack, possession, low_block, balanced
    is_home: bool = True
    weights: Optional[RecommenderWeights] = Field(default_factory=RecommenderWeights)

class ScoredPlayerCandidate(BaseModel):
    player_id: str
    name: str
    primary_position: str
    suitability_score: float
    form_score: float
    role_score: float
    tactical_score: float
    style_score: float
    availability_score: float
    archetype: Optional[str] = None
    strengths: List[str]
    risks: List[str]

class StartingXIOptimizationRequest(BaseModel):
    team_id: str
    opponent_id: str
    formation: str = "4-3-3"  # 4-3-3, 4-2-3-1, 4-4-2, 3-5-2, 3-4-3
    tactical_objective: str = "balanced"
    is_home: bool = True
    locked_player_ids: List[str] = []
    excluded_player_ids: List[str] = []
    weights: Optional[RecommenderWeights] = Field(default_factory=RecommenderWeights)

class StarterAssignment(BaseModel):
    role_code: str  # GK, CB_L, CB_R, LB, RB, DM, CM_L, CM_R, LW, RW, ST
    role_name: str
    player: ScoredPlayerCandidate
    tactical_instruction: str

class StartingXIOptimizationResponse(BaseModel):
    team_id: str
    opponent_id: str
    formation: str
    tactical_objective: str
    total_suitability_score: float
    average_suitability_score: float
    starters: List[StarterAssignment]
    bench: List[ScoredPlayerCandidate]
    alternative_xi: Optional[List[StarterAssignment]] = None
    tactical_summary: str
    warnings: List[str] = []

# --- Opposition Analysis ---

class OppositionAnalysisRequest(BaseModel):
    team_id: str
    opponent_id: str
    competition_id: Optional[str] = None

class TacticalFactor(BaseModel):
    category: str
    description: str
    severity: str  # High, Medium, Low
    data_evidence: str

class OppositionAnalysisResponse(BaseModel):
    opponent_id: str
    opponent_name: str
    matches_analyzed: int
    goals_scored_avg: float
    goals_conceded_avg: float
    xg_avg: float
    xg_conceded_avg: float
    possession_avg: float
    ppda_avg: float
    pressing_intensity: str  # Aggressive High-Press, Moderate Mid-Block, Deep Block
    vulnerabilities: List[TacticalFactor]
    strengths: List[TacticalFactor]
    recommended_tactics: List[str]
    formation_vulnerabilities: Dict[str, float]

# --- Substitutions Scenario ---

class SubstitutionScenarioRequest(BaseModel):
    team_id: str
    opponent_id: str
    current_minute: int = Field(65, ge=1, le=120)
    score_home: int = 1
    score_away: int = 1
    is_home: bool = True
    tactical_objective: str = "chase_goal"  # chase_goal, protect_lead, freshen_legs, counter_opponent
    active_player_ids: List[str]
    already_substituted_ids: List[str] = []

class SubstitutionRecommendation(BaseModel):
    player_out_id: str
    player_out_name: str
    player_in_id: str
    player_in_name: str
    target_role: str
    priority: str  # Immediate, Tactical, Conditioning
    tactical_reason: str
    expected_impact: str

class SubstitutionScenarioResponse(BaseModel):
    scenario_description: str
    recommendations: List[SubstitutionRecommendation]
    tactical_notes: str

# --- Match Prediction ---

class MatchPredictionRequest(BaseModel):
    home_team_id: str
    away_team_id: str
    competition_id: Optional[str] = None
    season_id: Optional[str] = None

class MatchPredictionResponse(BaseModel):
    home_team_id: str
    away_team_id: str
    home_win_prob: float
    draw_prob: float
    away_win_prob: float
    predicted_home_xg: float
    predicted_away_xg: float
    model_confidence: str  # High, Medium, Moderate
    model_name: str
    key_drivers: List[str]
    historical_h2h_matches: int
    uncertainty_statement: str

# --- Data Science Lab Analytics ---

class CorrelationCell(BaseModel):
    metric_x: str
    metric_y: str
    pearson_r: float
    spearman_rho: float
    p_value: float
    sample_size: int
    significant: bool

class CorrelationResponse(BaseModel):
    metrics: List[str]
    matrix: List[List[float]]
    spearman_matrix: List[List[float]]
    details: List[CorrelationCell]
    sample_count: int
    disclaimer: str

class PCAResponse(BaseModel):
    n_components: int
    explained_variance_ratio: List[float]
    cumulative_variance_ratio: List[float]
    scree_plot: List[Dict[str, Any]]
    loadings: List[Dict[str, Any]]
    scatter_points: List[Dict[str, Any]]
    features_used: List[str]
    interpretation: Dict[str, str]

class ClusterProfile(BaseModel):
    cluster_id: int
    label: str
    size: int
    top_characteristics: List[str]
    mean_stats: Dict[str, float]
    representative_players: List[str]

class ClusteringResponse(BaseModel):
    k: int
    silhouette_score: float
    candidate_k_evaluations: List[Dict[str, Any]]
    profiles: List[ClusterProfile]
    scatter_points: List[Dict[str, Any]]

class DescriptiveStatRow(BaseModel):
    metric: str
    mean: float
    std: float
    median: float
    q25: float
    q75: float
    min: float
    max: float
    skewness: float

class AnalyticsSummaryResponse(BaseModel):
    total_players: int
    total_matches: int
    total_teams: int
    competitions: List[str]
    descriptive_stats: List[DescriptiveStatRow]
    position_distributions: Dict[str, int]

# --- ML Model Status and Training ---

class ModelTrainRequest(BaseModel):
    model_type: str = "random_forest"  # random_forest, logistic_regression, gradient_boost
    target: str = "match_outcome"  # match_outcome, team_xg
    test_size: float = 0.2
    tune_hyperparameters: bool = False

class ModelTrainResponse(BaseModel):
    model_id: str
    model_type: str
    task: str
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    log_loss_value: float
    brier_score: float
    confusion_matrix: List[List[int]]
    classes: List[str]
    calibration_curve: Dict[str, List[float]]
    feature_importances: List[Dict[str, Any]]
    training_samples: int
    test_samples: int
    status: str

# --- Data Import & Quality ---

class DataImportResponse(BaseModel):
    status: str
    message: str
    records_processed: int
    duplicates_detected: int
    missing_values_handled: int
    coverage_summary: Dict[str, Any]
