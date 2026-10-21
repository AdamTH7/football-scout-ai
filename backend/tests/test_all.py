import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from backend.app.core.config import settings
from backend.app.db.models import Base, Player, Team, Match
from backend.app.data_pipeline.ingestion import DataPipeline
from backend.app.analytics.statistics import StatisticsEngine
from backend.app.analytics.pca_engine import PCAEngine
from backend.app.analytics.clustering_engine import ClusteringEngine
from backend.app.models.match_predictor import MatchPredictor
from backend.app.recommendations.recommender import HybridPlayerRecommender
from backend.app.optimisation.lineup_optimizer import StartingXIOptimizer
from backend.app.tactical_analysis.opposition import OppositionAnalyzer
from backend.app.tactical_analysis.substitutions import SubstitutionEngine
from backend.app.db.schemas import (
    StartingXIOptimizationRequest, OppositionAnalysisRequest, SubstitutionScenarioRequest
)

@pytest.fixture(scope="session")
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    # Ingest data
    pipeline = DataPipeline(db)
    pipeline.ensure_demo_data()
    pipeline.seed_database_from_csvs(settings.DEMO_DATA_DIR)
    
    yield db
    db.close()

def test_data_ingestion_and_counts(test_db):
    teams_count = test_db.query(Team).count()
    players_count = test_db.query(Player).count()
    matches_count = test_db.query(Match).count()

    assert teams_count >= 10, "Should have loaded at least 10 teams"
    assert players_count >= 80, "Should have loaded at least 80 players"
    assert matches_count >= 50, "Should have loaded at least 50 matches"

def test_per90_metrics(test_db):
    pipeline = DataPipeline(test_db)
    df = pipeline.get_player_per90_metrics(min_minutes=90)
    assert not df.empty
    assert "goals_p90" in df.columns
    assert "xg_p90" in df.columns
    assert "progressive_passes_p90" in df.columns
    # All per-90 metrics should be non-negative
    assert (df["xg_p90"] >= 0).all()

def test_pearson_and_spearman_correlations(test_db):
    engine = StatisticsEngine(test_db)
    res = engine.calculate_correlations()
    assert "metrics" in res
    assert len(res["metrics"]) > 5
    assert len(res["matrix"]) == len(res["metrics"])
    assert len(res["spearman_matrix"]) == len(res["metrics"])
    assert res["sample_count"] > 0
    # Diagonal of Pearson matrix must be 1.0
    for i in range(len(res["metrics"])):
        assert res["matrix"][i][i] == 1.0

def test_pca_pipeline(test_db):
    pca_eng = PCAEngine(test_db)
    res = pca_eng.run_pca(n_components=4)
    assert res["n_components"] == 4
    assert len(res["explained_variance_ratio"]) == 4
    # Cumulative variance must be increasing
    assert res["cumulative_variance_ratio"][-1] >= res["cumulative_variance_ratio"][0]
    assert len(res["scatter_points"]) > 20
    assert "PC1" in res["scree_plot"][0]["component"]

def test_clustering_pipeline(test_db):
    cluster_eng = ClusteringEngine(test_db)
    res = cluster_eng.run_clustering(k=5)
    assert res["k"] == 5
    assert res["silhouette_score"] > -1.0
    assert len(res["profiles"]) <= 5
    assert len(res["scatter_points"]) > 20
    # Every profile has top characteristics
    for p in res["profiles"]:
        assert len(p["top_characteristics"]) > 0

def test_player_recommendation_and_ranking(test_db):
    recommender = HybridPlayerRecommender(test_db)
    candidates = recommender.rank_candidates_for_position(
        team_id="MCI",
        opponent_id="RMA",
        target_position="ST"
    )
    assert len(candidates) > 0
    # Top striker candidate should have high suitability
    top_cand = candidates[0]
    assert top_cand.suitability_score > 0
    assert top_cand.player_id in [c.player_id for c in candidates]
    # Check similar player search
    similar = recommender.find_similar_players(top_cand.player_id, top_n=3)
    assert isinstance(similar, list)

def test_starting_xi_optimization_constraints(test_db):
    optimizer = StartingXIOptimizer(test_db)
    req = StartingXIOptimizationRequest(
        team_id="MCI",
        opponent_id="ARS",
        formation="4-3-3",
        tactical_objective="possession",
        locked_player_ids=["p_haaland"],
        excluded_player_ids=[]
    )
    res = optimizer.optimize_starting_xi(req)
    
    assert res.formation == "4-3-3"
    assert len(res.starters) == 11, "Starting XI MUST contain exactly 11 players"

    # Verify UNIQUE players
    starter_ids = [s.player.player_id for s in res.starters]
    assert len(set(starter_ids)) == 11, "All 11 starting players MUST be unique without duplicate assignments"

    # Verify EXACTLY 1 Goalkeeper
    gk_count = sum(1 for s in res.starters if s.role_code == "GK")
    assert gk_count == 1, "Starting XI MUST contain exactly one Goalkeeper"

    # Verify locked player was selected
    assert "p_haaland" in starter_ids, "Locked player Erling Haaland MUST be included in the Starting XI"

    # Verify bench candidates are populated
    assert len(res.bench) > 0, "Bench candidates should be recommended"

def test_opposition_intelligence(test_db):
    analyzer = OppositionAnalyzer(test_db)
    req = OppositionAnalysisRequest(team_id="MCI", opponent_id="RMA")
    res = analyzer.analyze_opponent(req)
    assert res.matches_analyzed > 0
    assert res.ppda_avg > 0
    assert len(res.recommended_tactics) > 0

def test_match_prediction_pipeline(test_db):
    predictor = MatchPredictor(test_db)
    train_res = predictor.train(model_type="random_forest", test_size=0.2)
    assert train_res["status"] == "trained_successfully"
    assert train_res["accuracy"] > 0.3
    assert len(train_res["confusion_matrix"]) == 3
    
    # Inference
    pred = predictor.predict("MCI", "RMA")
    assert round(pred["home_win_prob"] + pred["draw_prob"] + pred["away_win_prob"], 1) == 100.0
    assert pred["predicted_home_xg"] > 0
    assert pred["predicted_away_xg"] > 0

def test_substitution_engine(test_db):
    sub_engine = SubstitutionEngine(test_db)
    mci_players = [p.id for p in test_db.query(Player).filter(Player.team_id == "MCI").all()][:11]
    req = SubstitutionScenarioRequest(
        team_id="MCI",
        opponent_id="LIV",
        current_minute=68,
        score_home=1,
        score_away=2,
        is_home=True,
        tactical_objective="chase_goal",
        active_player_ids=mci_players
    )
    res = sub_engine.recommend_substitutions(req)
    assert len(res.recommendations) > 0
    assert res.recommendations[0].player_out_id in mci_players
