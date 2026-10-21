from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Competition(Base):
    __tablename__ = "competitions"
    id = Column(String, primary_key=True)  # e.g., "EPL", "UCL", "LALIGA"
    name = Column(String, nullable=False)
    country = Column(String, nullable=True)
    tier = Column(Integer, default=1)

    seasons = relationship("Season", back_populates="competition")
    matches = relationship("Match", back_populates="competition")

class Season(Base):
    __tablename__ = "seasons"
    id = Column(String, primary_key=True)  # e.g., "2023-24"
    competition_id = Column(String, ForeignKey("competitions.id"), primary_key=True)
    name = Column(String, nullable=False)

    competition = relationship("Competition", back_populates="seasons")

class Team(Base):
    __tablename__ = "teams"
    id = Column(String, primary_key=True)  # e.g., "MCI", "RMA", "FCB"
    name = Column(String, nullable=False)
    short_name = Column(String, nullable=False)
    competition_id = Column(String, ForeignKey("competitions.id"), nullable=False)
    home_stadium = Column(String, nullable=True)

    players = relationship("Player", back_populates="team")

class Player(Base):
    __tablename__ = "players"
    id = Column(String, primary_key=True)  # e.g., "p_haaland_09"
    name = Column(String, nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    primary_position = Column(String, nullable=False)  # GK, CB, LB, RB, DM, CM, AM, LW, RW, ST
    secondary_positions = Column(String, default="")  # comma separated
    age = Column(Integer, default=25)
    nationality = Column(String, default="")
    preferred_foot = Column(String, default="Right")
    is_available = Column(Boolean, default=True)
    fitness_rating = Column(Float, default=100.0)  # 0 to 100
    fatigue_index = Column(Float, default=10.0)  # 0 to 100

    team = relationship("Team", back_populates="players")
    match_stats = relationship("PlayerMatchStat", back_populates="player")

class Match(Base):
    __tablename__ = "matches"
    id = Column(String, primary_key=True)
    competition_id = Column(String, ForeignKey("competitions.id"), nullable=False)
    season_id = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    home_team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    home_xg = Column(Float, nullable=True)
    away_xg = Column(Float, nullable=True)
    status = Column(String, default="completed")  # completed, scheduled

    competition = relationship("Competition", back_populates="matches")
    player_stats = relationship("PlayerMatchStat", back_populates="match")
    team_stats = relationship("TeamMatchStat", back_populates="match")

class PlayerMatchStat(Base):
    __tablename__ = "player_match_stats"
    id = Column(Integer, primary_key=True, autoincrement=True)
    match_id = Column(String, ForeignKey("matches.id"), nullable=False)
    player_id = Column(String, ForeignKey("players.id"), nullable=False)
    team_id = Column(String, nullable=False)
    minutes_played = Column(Integer, default=0)
    position = Column(String, nullable=False)
    starter = Column(Boolean, default=True)
    
    # Offensive metrics
    goals = Column(Integer, default=0)
    xg = Column(Float, default=0.0)
    shots = Column(Integer, default=0)
    shots_on_target = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    xa = Column(Float, default=0.0)
    key_passes = Column(Integer, default=0)
    progressive_passes = Column(Integer, default=0)
    progressive_carries = Column(Integer, default=0)
    successful_dribbles = Column(Integer, default=0)
    
    # Defensive & Possession metrics
    tackles = Column(Integer, default=0)
    interceptions = Column(Integer, default=0)
    recoveries = Column(Integer, default=0)
    clearances = Column(Integer, default=0)
    aerials_won = Column(Integer, default=0)
    aerials_lost = Column(Integer, default=0)
    fouls_committed = Column(Integer, default=0)
    passes_completed = Column(Integer, default=0)
    passes_attempted = Column(Integer, default=0)
    
    # Goalkeeper metrics
    saves = Column(Integer, default=0)
    goals_conceded = Column(Integer, default=0)
    clean_sheet = Column(Boolean, default=False)
    psxg = Column(Float, default=0.0)

    match = relationship("Match", back_populates="player_stats")
    player = relationship("Player", back_populates="match_stats")

class TeamMatchStat(Base):
    __tablename__ = "team_match_stats"
    id = Column(Integer, primary_key=True, autoincrement=True)
    match_id = Column(String, ForeignKey("matches.id"), nullable=False)
    team_id = Column(String, nullable=False)
    is_home = Column(Boolean, default=True)
    formation = Column(String, default="4-3-3")
    possession_pct = Column(Float, default=50.0)
    shots = Column(Integer, default=0)
    shots_on_target = Column(Integer, default=0)
    xg = Column(Float, default=0.0)
    xg_conceded = Column(Float, default=0.0)
    goals_scored = Column(Integer, default=0)
    goals_conceded = Column(Integer, default=0)
    ppda = Column(Float, default=10.0)  # Passes Allowed Per Defensive Action (Pressing intensity)
    passes_total = Column(Integer, default=0)
    pass_accuracy_pct = Column(Float, default=80.0)
    deep_completions = Column(Integer, default=0)
    box_touches = Column(Integer, default=0)
    high_turnovers = Column(Integer, default=0)

    match = relationship("Match", back_populates="team_stats")

class MLModelRecord(Base):
    __tablename__ = "ml_models"
    id = Column(String, primary_key=True)  # e.g., "match_predictor_rf_v1"
    model_type = Column(String, nullable=False)  # random_forest, logistic_regression, etc.
    task = Column(String, nullable=False)  # match_outcome, player_rating
    trained_at = Column(DateTime, default=datetime.utcnow)
    metrics_json = Column(JSON, nullable=True)
    feature_names_json = Column(JSON, nullable=True)
    artifact_path = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
