import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any
from backend.app.core.config import settings

# Seed for reproducibility
random.seed(settings.RANDOM_SEED)
np.random.seed(settings.RANDOM_SEED)

COMPETITIONS_DATA = [
    {"id": "EPL", "name": "English Premier League", "country": "England", "tier": 1},
    {"id": "LALIGA", "name": "La Liga", "country": "Spain", "tier": 1},
    {"id": "UCL", "name": "UEFA Champions League", "country": "Europe", "tier": 1},
]

SEASONS_DATA = [
    {"id": "2022-23", "competition_id": "EPL", "name": "2022-2023"},
    {"id": "2023-24", "competition_id": "EPL", "name": "2023-2024"},
    {"id": "2024-25", "competition_id": "EPL", "name": "2024-2025"},
    {"id": "2022-23", "competition_id": "LALIGA", "name": "2022-2023"},
    {"id": "2023-24", "competition_id": "LALIGA", "name": "2023-2024"},
    {"id": "2024-25", "competition_id": "LALIGA", "name": "2024-2025"},
    {"id": "2022-23", "competition_id": "UCL", "name": "2022-2023"},
    {"id": "2023-24", "competition_id": "UCL", "name": "2023-2024"},
    {"id": "2024-25", "competition_id": "UCL", "name": "2024-2025"},
]

TEAMS_DATA = [
    # EPL
    {"id": "MCI", "name": "Manchester City", "short_name": "Man City", "competition_id": "EPL", "home_stadium": "Etihad Stadium"},
    {"id": "ARS", "name": "Arsenal", "short_name": "Arsenal", "competition_id": "EPL", "home_stadium": "Emirates Stadium"},
    {"id": "LIV", "name": "Liverpool", "short_name": "Liverpool", "competition_id": "EPL", "home_stadium": "Anfield"},
    {"id": "CHE", "name": "Chelsea", "short_name": "Chelsea", "competition_id": "EPL", "home_stadium": "Stamford Bridge"},
    {"id": "TOT", "name": "Tottenham Hotspur", "short_name": "Spurs", "competition_id": "EPL", "home_stadium": "Tottenham Hotspur Stadium"},
    {"id": "AVL", "name": "Aston Villa", "short_name": "Aston Villa", "competition_id": "EPL", "home_stadium": "Villa Park"},
    # La Liga
    {"id": "RMA", "name": "Real Madrid", "short_name": "Real Madrid", "competition_id": "LALIGA", "home_stadium": "Santiago Bernabeu"},
    {"id": "FCB", "name": "FC Barcelona", "short_name": "Barcelona", "competition_id": "LALIGA", "home_stadium": "Camp Nou"},
    {"id": "ATM", "name": "Atletico Madrid", "short_name": "Atlético", "competition_id": "LALIGA", "home_stadium": "Metropolitano"},
    {"id": "RSO", "name": "Real Sociedad", "short_name": "Real Sociedad", "competition_id": "LALIGA", "home_stadium": "Anoeta"},
    # UCL Continental Teams
    {"id": "BAY", "name": "Bayern Munich", "short_name": "Bayern", "competition_id": "UCL", "home_stadium": "Allianz Arena"},
    {"id": "PSG", "name": "Paris Saint-Germain", "short_name": "PSG", "competition_id": "UCL", "home_stadium": "Parc des Princes"},
    {"id": "INT", "name": "Inter Milan", "short_name": "Inter", "competition_id": "UCL", "home_stadium": "San Siro"},
    {"id": "BVB", "name": "Borussia Dortmund", "short_name": "Dortmund", "competition_id": "UCL", "home_stadium": "Signal Iduna Park"}
]

# Real squad rosters with key players
PLAYERS_MASTER = [
    # Manchester City
    {"id": "p_ederson", "name": "Ederson", "team_id": "MCI", "primary_position": "GK", "age": 30, "nationality": "Brazil", "foot": "Left"},
    {"id": "p_ortega", "name": "Stefan Ortega", "team_id": "MCI", "primary_position": "GK", "age": 31, "nationality": "Germany", "foot": "Right"},
    {"id": "p_dias", "name": "Rúben Dias", "team_id": "MCI", "primary_position": "CB", "age": 27, "nationality": "Portugal", "foot": "Right"},
    {"id": "p_stones", "name": "John Stones", "team_id": "MCI", "primary_position": "CB", "age": 30, "nationality": "England", "foot": "Right"},
    {"id": "p_akanji", "name": "Manuel Akanji", "team_id": "MCI", "primary_position": "CB", "age": 29, "nationality": "Switzerland", "foot": "Right"},
    {"id": "p_gvardiol", "name": "Joško Gvardiol", "team_id": "MCI", "primary_position": "LB", "age": 22, "nationality": "Croatia", "foot": "Left"},
    {"id": "p_walker", "name": "Kyle Walker", "team_id": "MCI", "primary_position": "RB", "age": 34, "nationality": "England", "foot": "Right"},
    {"id": "p_rodri", "name": "Rodri", "team_id": "MCI", "primary_position": "DM", "age": 28, "nationality": "Spain", "foot": "Right"},
    {"id": "p_kovacic", "name": "Mateo Kovačić", "team_id": "MCI", "primary_position": "CM", "age": 30, "nationality": "Croatia", "foot": "Right"},
    {"id": "p_debruyne", "name": "Kevin De Bruyne", "team_id": "MCI", "primary_position": "AM", "age": 33, "nationality": "Belgium", "foot": "Right"},
    {"id": "p_bernardo", "name": "Bernardo Silva", "team_id": "MCI", "primary_position": "AM", "age": 29, "nationality": "Portugal", "foot": "Left"},
    {"id": "p_foden", "name": "Phil Foden", "team_id": "MCI", "primary_position": "RW", "age": 24, "nationality": "England", "foot": "Left"},
    {"id": "p_grealish", "name": "Jack Grealish", "team_id": "MCI", "primary_position": "LW", "age": 28, "nationality": "England", "foot": "Right"},
    {"id": "p_doku", "name": "Jérémy Doku", "team_id": "MCI", "primary_position": "LW", "age": 22, "nationality": "Belgium", "foot": "Right"},
    {"id": "p_haaland", "name": "Erling Haaland", "team_id": "MCI", "primary_position": "ST", "age": 24, "nationality": "Norway", "foot": "Left"},

    # Real Madrid
    {"id": "p_courtois", "name": "Thibaut Courtois", "team_id": "RMA", "primary_position": "GK", "age": 32, "nationality": "Belgium", "foot": "Left"},
    {"id": "p_lunin", "name": "Andriy Lunin", "team_id": "RMA", "primary_position": "GK", "age": 25, "nationality": "Ukraine", "foot": "Right"},
    {"id": "p_militao", "name": "Éder Militão", "team_id": "RMA", "primary_position": "CB", "age": 26, "nationality": "Brazil", "foot": "Right"},
    {"id": "p_rudiger", "name": "Antonio Rüdiger", "team_id": "RMA", "primary_position": "CB", "age": 31, "nationality": "Germany", "foot": "Right"},
    {"id": "p_mendy", "name": "Ferland Mendy", "team_id": "RMA", "primary_position": "LB", "age": 29, "nationality": "France", "foot": "Left"},
    {"id": "p_carvajal", "name": "Dani Carvajal", "team_id": "RMA", "primary_position": "RB", "age": 32, "nationality": "Spain", "foot": "Right"},
    {"id": "p_tchouameni", "name": "Aurélien Tchouaméni", "team_id": "RMA", "primary_position": "DM", "age": 24, "nationality": "France", "foot": "Right"},
    {"id": "p_camavinga", "name": "Eduardo Camavinga", "team_id": "RMA", "primary_position": "CM", "age": 21, "nationality": "France", "foot": "Left"},
    {"id": "p_valverde", "name": "Federico Valverde", "team_id": "RMA", "primary_position": "CM", "age": 26, "nationality": "Uruguay", "foot": "Right"},
    {"id": "p_bellingham", "name": "Jude Bellingham", "team_id": "RMA", "primary_position": "AM", "age": 21, "nationality": "England", "foot": "Right"},
    {"id": "p_vinicius", "name": "Vinícius Júnior", "team_id": "RMA", "primary_position": "LW", "age": 24, "nationality": "Brazil", "foot": "Right"},
    {"id": "p_rodrygo", "name": "Rodrygo", "team_id": "RMA", "primary_position": "RW", "age": 23, "nationality": "Brazil", "foot": "Right"},
    {"id": "p_mbappe", "name": "Kylian Mbappé", "team_id": "RMA", "primary_position": "ST", "age": 25, "nationality": "France", "foot": "Right"},
    {"id": "p_brahim", "name": "Brahim Díaz", "team_id": "RMA", "primary_position": "AM", "age": 25, "nationality": "Morocco", "foot": "Both"},
    {"id": "p_endrick", "name": "Endrick", "team_id": "RMA", "primary_position": "ST", "age": 18, "nationality": "Brazil", "foot": "Left"},

    # Arsenal
    {"id": "p_raya", "name": "David Raya", "team_id": "ARS", "primary_position": "GK", "age": 28, "nationality": "Spain", "foot": "Right"},
    {"id": "p_saliba", "name": "William Saliba", "team_id": "ARS", "primary_position": "CB", "age": 23, "nationality": "France", "foot": "Right"},
    {"id": "p_gabriel", "name": "Gabriel Magalhães", "team_id": "ARS", "primary_position": "CB", "age": 26, "nationality": "Brazil", "foot": "Left"},
    {"id": "p_white", "name": "Ben White", "team_id": "ARS", "primary_position": "RB", "age": 26, "nationality": "England", "foot": "Right"},
    {"id": "p_zinchenko", "name": "Oleksandr Zinchenko", "team_id": "ARS", "primary_position": "LB", "age": 27, "nationality": "Ukraine", "foot": "Left"},
    {"id": "p_rice", "name": "Declan Rice", "team_id": "ARS", "primary_position": "DM", "age": 25, "nationality": "England", "foot": "Right"},
    {"id": "p_partey", "name": "Thomas Partey", "team_id": "ARS", "primary_position": "DM", "age": 31, "nationality": "Ghana", "foot": "Right"},
    {"id": "p_odegaard", "name": "Martin Ødegaard", "team_id": "ARS", "primary_position": "AM", "age": 25, "nationality": "Norway", "foot": "Left"},
    {"id": "p_saka", "name": "Bukayo Saka", "team_id": "ARS", "primary_position": "RW", "age": 22, "nationality": "England", "foot": "Left"},
    {"id": "p_martinelli", "name": "Gabriel Martinelli", "team_id": "ARS", "primary_position": "LW", "age": 23, "nationality": "Brazil", "foot": "Right"},
    {"id": "p_trossard", "name": "Leandro Trossard", "team_id": "ARS", "primary_position": "LW", "age": 29, "nationality": "Belgium", "foot": "Both"},
    {"id": "p_havertz", "name": "Kai Havertz", "team_id": "ARS", "primary_position": "ST", "age": 25, "nationality": "Germany", "foot": "Left"},
    {"id": "p_jesus", "name": "Gabriel Jesus", "team_id": "ARS", "primary_position": "ST", "age": 27, "nationality": "Brazil", "foot": "Right"},

    # Barcelona
    {"id": "p_terstegen", "name": "Marc-André ter Stegen", "team_id": "FCB", "primary_position": "GK", "age": 32, "nationality": "Germany", "foot": "Right"},
    {"id": "p_kounde", "name": "Jules Koundé", "team_id": "FCB", "primary_position": "RB", "age": 25, "nationality": "France", "foot": "Right"},
    {"id": "p_araujo", "name": "Ronald Araújo", "team_id": "FCB", "primary_position": "CB", "age": 25, "nationality": "Uruguay", "foot": "Right"},
    {"id": "p_cubarsi", "name": "Pau Cubarsí", "team_id": "FCB", "primary_position": "CB", "age": 17, "nationality": "Spain", "foot": "Right"},
    {"id": "p_balde", "name": "Alejandro Balde", "team_id": "FCB", "primary_position": "LB", "age": 20, "nationality": "Spain", "foot": "Left"},
    {"id": "p_pedri", "name": "Pedri", "team_id": "FCB", "primary_position": "CM", "age": 21, "nationality": "Spain", "foot": "Both"},
    {"id": "p_gavi", "name": "Gavi", "team_id": "FCB", "primary_position": "CM", "age": 20, "nationality": "Spain", "foot": "Right"},
    {"id": "p_dejong", "name": "Frenkie de Jong", "team_id": "FCB", "primary_position": "CM", "age": 27, "nationality": "Netherlands", "foot": "Right"},
    {"id": "p_yamal", "name": "Lamine Yamal", "team_id": "FCB", "primary_position": "RW", "age": 17, "nationality": "Spain", "foot": "Left"},
    {"id": "p_raphinha", "name": "Raphinha", "team_id": "FCB", "primary_position": "LW", "age": 27, "nationality": "Brazil", "foot": "Left"},
    {"id": "p_lewandowski", "name": "Robert Lewandowski", "team_id": "FCB", "primary_position": "ST", "age": 36, "nationality": "Poland", "foot": "Right"},
    {"id": "p_olmo", "name": "Dani Olmo", "team_id": "FCB", "primary_position": "AM", "age": 26, "nationality": "Spain", "foot": "Right"},

    # Liverpool
    {"id": "p_alisson", "name": "Alisson Becker", "team_id": "LIV", "primary_position": "GK", "age": 31, "nationality": "Brazil", "foot": "Right"},
    {"id": "p_vandijk", "name": "Virgil van Dijk", "team_id": "LIV", "primary_position": "CB", "age": 33, "nationality": "Netherlands", "foot": "Right"},
    {"id": "p_konate", "name": "Ibrahima Konaté", "team_id": "LIV", "primary_position": "CB", "age": 25, "nationality": "France", "foot": "Right"},
    {"id": "p_trent", "name": "Trent Alexander-Arnold", "team_id": "LIV", "primary_position": "RB", "age": 25, "nationality": "England", "foot": "Right"},
    {"id": "p_robertson", "name": "Andrew Robertson", "team_id": "LIV", "primary_position": "LB", "age": 30, "nationality": "Scotland", "foot": "Left"},
    {"id": "p_macallister", "name": "Alexis Mac Allister", "team_id": "LIV", "primary_position": "CM", "age": 25, "nationality": "Argentina", "foot": "Right"},
    {"id": "p_szoboszlai", "name": "Dominik Szoboszlai", "team_id": "LIV", "primary_position": "AM", "age": 23, "nationality": "Hungary", "foot": "Right"},
    {"id": "p_gravenberch", "name": "Ryan Gravenberch", "team_id": "LIV", "primary_position": "DM", "age": 22, "nationality": "Netherlands", "foot": "Right"},
    {"id": "p_salah", "name": "Mohamed Salah", "team_id": "LIV", "primary_position": "RW", "age": 32, "nationality": "Egypt", "foot": "Left"},
    {"id": "p_diaz_l", "name": "Luis Díaz", "team_id": "LIV", "primary_position": "LW", "age": 27, "nationality": "Colombia", "foot": "Right"},
    {"id": "p_nunez", "name": "Darwin Núñez", "team_id": "LIV", "primary_position": "ST", "age": 25, "nationality": "Uruguay", "foot": "Right"},
    {"id": "p_gakpo", "name": "Cody Gakpo", "team_id": "LIV", "primary_position": "LW", "age": 25, "nationality": "Netherlands", "foot": "Right"},

    # Bayern Munich
    {"id": "p_neuer", "name": "Manuel Neuer", "team_id": "BAY", "primary_position": "GK", "age": 38, "nationality": "Germany", "foot": "Right"},
    {"id": "p_upamecano", "name": "Dayot Upamecano", "team_id": "BAY", "primary_position": "CB", "age": 25, "nationality": "France", "foot": "Right"},
    {"id": "p_kim", "name": "Kim Min-jae", "team_id": "BAY", "primary_position": "CB", "age": 27, "nationality": "South Korea", "foot": "Right"},
    {"id": "p_davies", "name": "Alphonso Davies", "team_id": "BAY", "primary_position": "LB", "age": 23, "nationality": "Canada", "foot": "Left"},
    {"id": "p_kimmich", "name": "Joshua Kimmich", "team_id": "BAY", "primary_position": "RB", "age": 29, "nationality": "Germany", "foot": "Right"},
    {"id": "p_palhinha", "name": "João Palhinha", "team_id": "BAY", "primary_position": "DM", "age": 29, "nationality": "Portugal", "foot": "Right"},
    {"id": "p_musiala", "name": "Jamal Musiala", "team_id": "BAY", "primary_position": "AM", "age": 21, "nationality": "Germany", "foot": "Right"},
    {"id": "p_sane", "name": "Leroy Sané", "team_id": "BAY", "primary_position": "RW", "age": 28, "nationality": "Germany", "foot": "Left"},
    {"id": "p_coman", "name": "Kingsley Coman", "team_id": "BAY", "primary_position": "LW", "age": 28, "nationality": "France", "foot": "Right"},
    {"id": "p_kane", "name": "Harry Kane", "team_id": "BAY", "primary_position": "ST", "age": 31, "nationality": "England", "foot": "Right"},
    {"id": "p_muller", "name": "Thomas Müller", "team_id": "BAY", "primary_position": "AM", "age": 34, "nationality": "Germany", "foot": "Right"},

    # Paris Saint-Germain
    {"id": "p_donnarumma", "name": "Gianluigi Donnarumma", "team_id": "PSG", "primary_position": "GK", "age": 25, "nationality": "Italy", "foot": "Right"},
    {"id": "p_marquinhos", "name": "Marquinhos", "team_id": "PSG", "primary_position": "CB", "age": 30, "nationality": "Brazil", "foot": "Right"},
    {"id": "p_pacho", "name": "Willian Pacho", "team_id": "PSG", "primary_position": "CB", "age": 22, "nationality": "Ecuador", "foot": "Left"},
    {"id": "p_hakimi", "name": "Achraf Hakimi", "team_id": "PSG", "primary_position": "RB", "age": 25, "nationality": "Morocco", "foot": "Right"},
    {"id": "p_mendes", "name": "Nuno Mendes", "team_id": "PSG", "primary_position": "LB", "age": 22, "nationality": "Portugal", "foot": "Left"},
    {"id": "p_vitinha", "name": "Vitinha", "team_id": "PSG", "primary_position": "CM", "age": 24, "nationality": "Portugal", "foot": "Right"},
    {"id": "p_neves", "name": "João Neves", "team_id": "PSG", "primary_position": "DM", "age": 19, "nationality": "Portugal", "foot": "Right"},
    {"id": "p_zaire", "name": "Warren Zaïre-Emery", "team_id": "PSG", "primary_position": "CM", "age": 18, "nationality": "France", "foot": "Right"},
    {"id": "p_dembele", "name": "Ousmane Dembélé", "team_id": "PSG", "primary_position": "RW", "age": 27, "nationality": "France", "foot": "Both"},
    {"id": "p_barcola", "name": "Bradley Barcola", "team_id": "PSG", "primary_position": "LW", "age": 22, "nationality": "France", "foot": "Right"},
    {"id": "p_ramos", "name": "Gonçalo Ramos", "team_id": "PSG", "primary_position": "ST", "age": 23, "nationality": "Portugal", "foot": "Right"},

    # Inter Milan
    {"id": "p_sommer", "name": "Yann Sommer", "team_id": "INT", "primary_position": "GK", "age": 35, "nationality": "Switzerland", "foot": "Right"},
    {"id": "p_bastoni", "name": "Alessandro Bastoni", "team_id": "INT", "primary_position": "CB", "age": 25, "nationality": "Italy", "foot": "Left"},
    {"id": "p_acerbi", "name": "Francesco Acerbi", "team_id": "INT", "primary_position": "CB", "age": 36, "nationality": "Italy", "foot": "Left"},
    {"id": "p_pavard", "name": "Benjamin Pavard", "team_id": "INT", "primary_position": "CB", "age": 28, "nationality": "France", "foot": "Right"},
    {"id": "p_dimarco", "name": "Federico Dimarco", "team_id": "INT", "primary_position": "LB", "age": 26, "nationality": "Italy", "foot": "Left"},
    {"id": "p_dumfries", "name": "Denzel Dumfries", "team_id": "INT", "primary_position": "RB", "age": 28, "nationality": "Netherlands", "foot": "Right"},
    {"id": "p_calhanoglu", "name": "Hakan Çalhanoğlu", "team_id": "INT", "primary_position": "DM", "age": 30, "nationality": "Turkey", "foot": "Right"},
    {"id": "p_barella", "name": "Nicolò Barella", "team_id": "INT", "primary_position": "CM", "age": 27, "nationality": "Italy", "foot": "Right"},
    {"id": "p_mkhitaryan", "name": "Henrikh Mkhitaryan", "team_id": "INT", "primary_position": "CM", "age": 35, "nationality": "Armenia", "foot": "Both"},
    {"id": "p_martinez_l", "name": "Lautaro Martínez", "team_id": "INT", "primary_position": "ST", "age": 27, "nationality": "Argentina", "foot": "Right"},
    {"id": "p_thuram", "name": "Marcus Thuram", "team_id": "INT", "primary_position": "ST", "age": 27, "nationality": "France", "foot": "Right"},

    # Atletico Madrid
    {"id": "p_oblak", "name": "Jan Oblak", "team_id": "ATM", "primary_position": "GK", "age": 31, "nationality": "Slovenia", "foot": "Right"},
    {"id": "p_gimenez", "name": "José María Giménez", "team_id": "ATM", "primary_position": "CB", "age": 29, "nationality": "Uruguay", "foot": "Right"},
    {"id": "p_le_normand", "name": "Robin Le Normand", "team_id": "ATM", "primary_position": "CB", "age": 27, "nationality": "Spain", "foot": "Right"},
    {"id": "p_reinildo", "name": "Reinildo Mandava", "team_id": "ATM", "primary_position": "LB", "age": 30, "nationality": "Mozambique", "foot": "Left"},
    {"id": "p_molina", "name": "Nahuel Molina", "team_id": "ATM", "primary_position": "RB", "age": 26, "nationality": "Argentina", "foot": "Right"},
    {"id": "p_koke", "name": "Koke", "team_id": "ATM", "primary_position": "CM", "age": 32, "nationality": "Spain", "foot": "Right"},
    {"id": "p_de_paul", "name": "Rodrigo De Paul", "team_id": "ATM", "primary_position": "CM", "age": 30, "nationality": "Argentina", "foot": "Right"},
    {"id": "p_gallagher", "name": "Conor Gallagher", "team_id": "ATM", "primary_position": "CM", "age": 24, "nationality": "England", "foot": "Right"},
    {"id": "p_griezmann", "name": "Antoine Griezmann", "team_id": "ATM", "primary_position": "AM", "age": 33, "nationality": "France", "foot": "Left"},
    {"id": "p_alvarez_j", "name": "Julián Alvarez", "team_id": "ATM", "primary_position": "ST", "age": 24, "nationality": "Argentina", "foot": "Right"},
    {"id": "p_sorloth", "name": "Alexander Sørloth", "team_id": "ATM", "primary_position": "ST", "age": 28, "nationality": "Norway", "foot": "Left"},
]

def generate_demo_dataset():
    """Generates coherent, realistic football records for UCL, EPL, and La Liga."""
    competitions_df = pd.DataFrame(COMPETITIONS_DATA)
    seasons_df = pd.DataFrame(SEASONS_DATA)
    teams_df = pd.DataFrame(TEAMS_DATA)
    
    players_list = []
    for p in PLAYERS_MASTER:
        pos = p["primary_position"]
        # Determine secondary positions
        secondary = ""
        if pos == "CB": secondary = "LB,RB"
        elif pos == "LB": secondary = "LW,CB"
        elif pos == "RB": secondary = "RW,CB"
        elif pos == "DM": secondary = "CM,CB"
        elif pos == "CM": secondary = "AM,DM"
        elif pos == "AM": secondary = "LW,RW,CM"
        elif pos == "LW": secondary = "RW,ST"
        elif pos == "RW": secondary = "LW,AM"
        elif pos == "ST": secondary = "LW,RW"

        players_list.append({
            "id": p["id"],
            "name": p["name"],
            "team_id": p["team_id"],
            "primary_position": p["primary_position"],
            "secondary_positions": secondary,
            "age": p["age"],
            "nationality": p["nationality"],
            "preferred_foot": p["foot"],
            "is_available": random.random() > 0.08, # ~92% available
            "fitness_rating": round(random.uniform(82.0, 99.0), 1),
            "fatigue_index": round(random.uniform(5.0, 35.0), 1)
        })
    players_df = pd.DataFrame(players_list)

    # Generate Matches across 3 seasons
    matches_list = []
    team_stats_list = []
    player_stats_list = []

    match_counter = 1
    stat_counter = 1

    team_ids = [t["id"] for t in TEAMS_DATA]
    
    # We will simulate ~400 matches across the 3 competitions and seasons
    seasons = ["2022-23", "2023-24", "2024-25"]
    
    for s_idx, season in enumerate(seasons):
        start_date = datetime(2022 + s_idx, 8, 12)
        
        # EPL Matchdays
        epl_teams = [t["id"] for t in TEAMS_DATA if t["competition_id"] == "EPL"]
        for i in range(len(epl_teams)):
            for j in range(len(epl_teams)):
                if i != j:
                    h_team = epl_teams[i]
                    a_team = epl_teams[j]
                    m_date = start_date + timedelta(days=random.randint(1, 260))
                    m_id = f"m_{season}_EPL_{match_counter}"
                    match_counter += 1
                    
                    # Simulate match metrics
                    h_xg = round(np.random.gamma(shape=2.5, scale=0.7), 2)
                    a_xg = round(np.random.gamma(shape=1.9, scale=0.6), 2)
                    h_score = int(np.random.poisson(h_xg))
                    a_score = int(np.random.poisson(a_xg))
                    
                    matches_list.append({
                        "id": m_id,
                        "competition_id": "EPL",
                        "season_id": season,
                        "date": m_date.strftime("%Y-%m-%d %H:%M:%S"),
                        "home_team_id": h_team,
                        "away_team_id": a_team,
                        "home_score": h_score,
                        "away_score": a_score,
                        "home_xg": h_xg,
                        "away_xg": a_xg,
                        "status": "completed"
                    })
                    
                    # Team stats
                    h_pos = round(np.random.normal(52, 10), 1)
                    h_pos = max(25.0, min(75.0, h_pos))
                    a_pos = round(100.0 - h_pos, 1)
                    
                    team_stats_list.append({
                        "id": stat_counter,
                        "match_id": m_id,
                        "team_id": h_team,
                        "is_home": True,
                        "formation": random.choice(["4-3-3", "4-2-3-1", "3-4-3", "4-4-2"]),
                        "possession_pct": h_pos,
                        "shots": int(h_xg * 7 + random.randint(1, 5)),
                        "shots_on_target": max(h_score, int(h_xg * 3 + random.randint(0, 3))),
                        "xg": h_xg,
                        "xg_conceded": a_xg,
                        "goals_scored": h_score,
                        "goals_conceded": a_score,
                        "ppda": round(np.random.uniform(7.5, 14.5), 1),
                        "passes_total": int(h_pos * 9 + random.randint(50, 150)),
                        "pass_accuracy_pct": round(np.random.uniform(78.0, 92.0), 1),
                        "deep_completions": random.randint(4, 18),
                        "box_touches": random.randint(12, 38),
                        "high_turnovers": random.randint(3, 11)
                    })
                    stat_counter += 1
                    
                    team_stats_list.append({
                        "id": stat_counter,
                        "match_id": m_id,
                        "team_id": a_team,
                        "is_home": False,
                        "formation": random.choice(["4-3-3", "4-2-3-1", "3-5-2", "4-4-2"]),
                        "possession_pct": a_pos,
                        "shots": int(a_xg * 7 + random.randint(1, 5)),
                        "shots_on_target": max(a_score, int(a_xg * 3 + random.randint(0, 3))),
                        "xg": a_xg,
                        "xg_conceded": h_xg,
                        "goals_scored": a_score,
                        "goals_conceded": h_score,
                        "ppda": round(np.random.uniform(8.0, 16.0), 1),
                        "passes_total": int(a_pos * 9 + random.randint(50, 150)),
                        "pass_accuracy_pct": round(np.random.uniform(75.0, 90.0), 1),
                        "deep_completions": random.randint(2, 14),
                        "box_touches": random.randint(8, 28),
                        "high_turnovers": random.randint(2, 9)
                    })
                    stat_counter += 1

        # La Liga Matches
        laliga_teams = [t["id"] for t in TEAMS_DATA if t["competition_id"] == "LALIGA"]
        for i in range(len(laliga_teams)):
            for j in range(len(laliga_teams)):
                if i != j:
                    h_team = laliga_teams[i]
                    a_team = laliga_teams[j]
                    m_date = start_date + timedelta(days=random.randint(1, 260))
                    m_id = f"m_{season}_LALIGA_{match_counter}"
                    match_counter += 1
                    
                    h_xg = round(np.random.gamma(shape=2.3, scale=0.65), 2)
                    a_xg = round(np.random.gamma(shape=1.8, scale=0.6), 2)
                    h_score = int(np.random.poisson(h_xg))
                    a_score = int(np.random.poisson(a_xg))
                    
                    matches_list.append({
                        "id": m_id,
                        "competition_id": "LALIGA",
                        "season_id": season,
                        "date": m_date.strftime("%Y-%m-%d %H:%M:%S"),
                        "home_team_id": h_team,
                        "away_team_id": a_team,
                        "home_score": h_score,
                        "away_score": a_score,
                        "home_xg": h_xg,
                        "away_xg": a_xg,
                        "status": "completed"
                    })
                    
                    h_pos = round(np.random.normal(53, 9), 1)
                    h_pos = max(28.0, min(72.0, h_pos))
                    a_pos = round(100.0 - h_pos, 1)
                    
                    team_stats_list.append({
                        "id": stat_counter, "match_id": m_id, "team_id": h_team, "is_home": True,
                        "formation": "4-3-3", "possession_pct": h_pos, "shots": int(h_xg * 7 + 2),
                        "shots_on_target": max(h_score, int(h_xg * 3 + 1)), "xg": h_xg, "xg_conceded": a_xg,
                        "goals_scored": h_score, "goals_conceded": a_score, "ppda": round(np.random.uniform(8.0, 13.0), 1),
                        "passes_total": int(h_pos * 9 + 80), "pass_accuracy_pct": round(np.random.uniform(80.0, 93.0), 1),
                        "deep_completions": random.randint(4, 16), "box_touches": random.randint(14, 35), "high_turnovers": random.randint(3, 10)
                    })
                    stat_counter += 1
                    team_stats_list.append({
                        "id": stat_counter, "match_id": m_id, "team_id": a_team, "is_home": False,
                        "formation": "4-4-2", "possession_pct": a_pos, "shots": int(a_xg * 7 + 2),
                        "shots_on_target": max(a_score, int(a_xg * 3 + 1)), "xg": a_xg, "xg_conceded": h_xg,
                        "goals_scored": a_score, "goals_conceded": h_score, "ppda": round(np.random.uniform(9.0, 15.0), 1),
                        "passes_total": int(a_pos * 9 + 80), "pass_accuracy_pct": round(np.random.uniform(77.0, 90.0), 1),
                        "deep_completions": random.randint(2, 12), "box_touches": random.randint(8, 25), "high_turnovers": random.randint(2, 8)
                    })
                    stat_counter += 1

        # UCL Matches (Cross-continental big games)
        ucl_pool = ["MCI", "RMA", "ARS", "FCB", "LIV", "BAY", "PSG", "INT", "ATM"]
        for k in range(25):
            h_team, a_team = random.sample(ucl_pool, 2)
            m_date = start_date + timedelta(days=random.randint(30, 270))
            m_id = f"m_{season}_UCL_{match_counter}"
            match_counter += 1
            h_xg = round(np.random.gamma(shape=2.6, scale=0.7), 2)
            a_xg = round(np.random.gamma(shape=2.2, scale=0.65), 2)
            h_score = int(np.random.poisson(h_xg))
            a_score = int(np.random.poisson(a_xg))
            
            matches_list.append({
                "id": m_id,
                "competition_id": "UCL",
                "season_id": season,
                "date": m_date.strftime("%Y-%m-%d %H:%M:%S"),
                "home_team_id": h_team,
                "away_team_id": a_team,
                "home_score": h_score,
                "away_score": a_score,
                "home_xg": h_xg,
                "away_xg": a_xg,
                "status": "completed"
            })
            team_stats_list.append({
                "id": stat_counter, "match_id": m_id, "team_id": h_team, "is_home": True,
                "formation": "4-3-3", "possession_pct": 52.0, "shots": 14, "shots_on_target": 6,
                "xg": h_xg, "xg_conceded": a_xg, "goals_scored": h_score, "goals_conceded": a_score,
                "ppda": 9.5, "passes_total": 540, "pass_accuracy_pct": 86.5,
                "deep_completions": 11, "box_touches": 26, "high_turnovers": 6
            })
            stat_counter += 1
            team_stats_list.append({
                "id": stat_counter, "match_id": m_id, "team_id": a_team, "is_home": False,
                "formation": "4-2-3-1", "possession_pct": 48.0, "shots": 11, "shots_on_target": 4,
                "xg": a_xg, "xg_conceded": h_xg, "goals_scored": a_score, "goals_conceded": h_score,
                "ppda": 11.2, "passes_total": 480, "pass_accuracy_pct": 84.0,
                "deep_completions": 8, "box_touches": 19, "high_turnovers": 5
            })
            stat_counter += 1

    # Now generate realistic individual player match logs for roster players in their team's matches
    p_stat_id = 1
    # Group matches by team
    matches_df_temp = pd.DataFrame(matches_list)
    
    for _, match_row in matches_df_temp.iterrows():
        m_id = match_row["id"]
        h_team = match_row["home_team_id"]
        a_team = match_row["away_team_id"]
        
        for team_id in [h_team, a_team]:
            team_players = [p for p in PLAYERS_MASTER if p["team_id"] == team_id]
            if not team_players:
                continue
            
            # Pick 11 starters and up to 3 substitutes
            gks = [p for p in team_players if p["primary_position"] == "GK"]
            outfield = [p for p in team_players if p["primary_position"] != "GK"]
            
            starter_gk = gks[0] if gks else None
            starters_outfield = outfield[:10] if len(outfield) >= 10 else outfield
            subs = outfield[10:13] if len(outfield) > 10 else []
            
            # GK match record
            if starter_gk:
                mins = 90
                is_home = (team_id == h_team)
                conceded = match_row["away_score"] if is_home else match_row["home_score"]
                opp_xg = match_row["away_xg"] if is_home else match_row["home_xg"]
                saves = max(0, int(opp_xg * 2.5 + random.randint(0, 2) - conceded))
                
                player_stats_list.append({
                    "id": p_stat_id,
                    "match_id": m_id,
                    "player_id": starter_gk["id"],
                    "team_id": team_id,
                    "minutes_played": mins,
                    "position": "GK",
                    "starter": True,
                    "goals": 0, "xg": 0.0, "shots": 0, "shots_on_target": 0,
                    "assists": 0, "xa": 0.01 if random.random() > 0.8 else 0.0,
                    "key_passes": 1 if random.random() > 0.7 else 0,
                    "progressive_passes": random.randint(2, 7),
                    "progressive_carries": random.randint(0, 2),
                    "successful_dribbles": 0,
                    "tackles": 0, "interceptions": 0, "recoveries": random.randint(3, 8),
                    "clearances": random.randint(1, 4), "aerials_won": random.randint(0, 2),
                    "aerials_lost": 0, "fouls_committed": 0,
                    "passes_completed": random.randint(28, 48), "passes_attempted": random.randint(32, 54),
                    "saves": saves, "goals_conceded": conceded,
                    "clean_sheet": (conceded == 0),
                    "psxg": round(opp_xg * 0.9, 2)
                })
                p_stat_id += 1

            # Outfield starters
            for p in starters_outfield:
                pos = p["primary_position"]
                mins = random.choice([90, 90, 90, 82, 75, 68])
                
                # Attribute weights based on player profile
                goals = 0
                xg = 0.0
                assists = 0
                xa = 0.0
                shots = 0
                shots_ot = 0
                kp = 0
                prog_pass = 0
                prog_carry = 0
                dribbles = 0
                tackles = 0
                interceptions = 0
                recoveries = 0
                clearances = 0
                aerials = 0

                if pos == "ST":
                    xg = round(np.random.gamma(1.8, 0.3), 2)
                    goals = int(np.random.poisson(xg))
                    shots = max(goals, random.randint(1, 5))
                    shots_ot = max(goals, random.randint(0, shots))
                    xa = round(random.uniform(0.02, 0.35), 2)
                    assists = 1 if (random.random() < xa) else 0
                    kp = random.randint(0, 3)
                    prog_pass = random.randint(1, 4)
                    prog_carry = random.randint(2, 6)
                    dribbles = random.randint(1, 4)
                    tackles = random.randint(0, 2)
                    interceptions = random.randint(0, 1)
                    recoveries = random.randint(1, 4)
                    aerials = random.randint(1, 5)
                elif pos in ["LW", "RW"]:
                    xg = round(np.random.gamma(1.2, 0.25), 2)
                    goals = int(np.random.poisson(xg))
                    shots = max(goals, random.randint(1, 4))
                    shots_ot = max(goals, random.randint(0, shots))
                    xa = round(np.random.gamma(1.5, 0.2), 2)
                    assists = int(np.random.poisson(xa))
                    kp = random.randint(1, 4)
                    prog_pass = random.randint(3, 8)
                    prog_carry = random.randint(4, 9)
                    dribbles = random.randint(2, 6)
                    tackles = random.randint(1, 3)
                    interceptions = random.randint(0, 2)
                    recoveries = random.randint(2, 6)
                    aerials = random.randint(0, 2)
                elif pos in ["AM", "CM"]:
                    xg = round(random.uniform(0.05, 0.4), 2)
                    goals = 1 if random.random() < xg else 0
                    shots = random.randint(0, 3)
                    shots_ot = min(shots, random.randint(0, 2))
                    xa = round(np.random.gamma(1.6, 0.22), 2)
                    assists = int(np.random.poisson(xa))
                    kp = random.randint(1, 5)
                    prog_pass = random.randint(5, 12)
                    prog_carry = random.randint(3, 7)
                    dribbles = random.randint(1, 4)
                    tackles = random.randint(1, 4)
                    interceptions = random.randint(1, 3)
                    recoveries = random.randint(4, 9)
                    aerials = random.randint(1, 3)
                elif pos == "DM":
                    xg = round(random.uniform(0.01, 0.15), 2)
                    goals = 1 if random.random() < 0.08 else 0
                    shots = random.randint(0, 2)
                    shots_ot = 1 if goals > 0 else 0
                    xa = round(random.uniform(0.05, 0.25), 2)
                    assists = 1 if random.random() < 0.1 else 0
                    kp = random.randint(1, 3)
                    prog_pass = random.randint(6, 14)
                    prog_carry = random.randint(2, 5)
                    dribbles = random.randint(0, 2)
                    tackles = random.randint(2, 6)
                    interceptions = random.randint(2, 5)
                    recoveries = random.randint(6, 12)
                    aerials = random.randint(2, 5)
                elif pos in ["LB", "RB"]:
                    xg = round(random.uniform(0.01, 0.2), 2)
                    goals = 1 if random.random() < 0.06 else 0
                    shots = random.randint(0, 2)
                    shots_ot = 1 if goals > 0 else 0
                    xa = round(random.uniform(0.08, 0.35), 2)
                    assists = 1 if random.random() < 0.15 else 0
                    kp = random.randint(1, 4)
                    prog_pass = random.randint(4, 10)
                    prog_carry = random.randint(3, 7)
                    dribbles = random.randint(1, 3)
                    tackles = random.randint(2, 5)
                    interceptions = random.randint(1, 4)
                    recoveries = random.randint(4, 8)
                    aerials = random.randint(1, 4)
                elif pos == "CB":
                    xg = round(random.uniform(0.01, 0.12), 2)
                    goals = 1 if random.random() < 0.05 else 0
                    shots = random.randint(0, 1)
                    shots_ot = 1 if goals > 0 else 0
                    xa = round(random.uniform(0.0, 0.08), 2)
                    assists = 0
                    kp = 1 if random.random() > 0.8 else 0
                    prog_pass = random.randint(3, 9)
                    prog_carry = random.randint(1, 4)
                    dribbles = 0
                    tackles = random.randint(1, 4)
                    interceptions = random.randint(2, 5)
                    recoveries = random.randint(4, 9)
                    clearances = random.randint(3, 8)
                    aerials = random.randint(3, 8)

                player_stats_list.append({
                    "id": p_stat_id,
                    "match_id": m_id,
                    "player_id": p["id"],
                    "team_id": team_id,
                    "minutes_played": mins,
                    "position": pos,
                    "starter": True,
                    "goals": goals, "xg": xg, "shots": shots, "shots_on_target": shots_ot,
                    "assists": assists, "xa": xa, "key_passes": kp,
                    "progressive_passes": prog_pass,
                    "progressive_carries": prog_carry,
                    "successful_dribbles": dribbles,
                    "tackles": tackles, "interceptions": interceptions, "recoveries": recoveries,
                    "clearances": clearances, "aerials_won": aerials, "aerials_lost": random.randint(0, 3),
                    "fouls_committed": random.randint(0, 3),
                    "passes_completed": int(prog_pass * 4 + random.randint(15, 35)),
                    "passes_attempted": int(prog_pass * 4 + random.randint(20, 42)),
                    "saves": 0, "goals_conceded": 0, "clean_sheet": False, "psxg": 0.0
                })
                p_stat_id += 1

            # Subs
            for p in subs:
                mins = random.randint(15, 30)
                pos = p["primary_position"]
                player_stats_list.append({
                    "id": p_stat_id,
                    "match_id": m_id,
                    "player_id": p["id"],
                    "team_id": team_id,
                    "minutes_played": mins,
                    "position": pos,
                    "starter": False,
                    "goals": 1 if random.random() < 0.15 else 0,
                    "xg": round(random.uniform(0.02, 0.3), 2),
                    "shots": random.randint(0, 2), "shots_on_target": 1 if random.random() < 0.4 else 0,
                    "assists": 1 if random.random() < 0.1 else 0,
                    "xa": round(random.uniform(0.01, 0.2), 2),
                    "key_passes": random.randint(0, 2),
                    "progressive_passes": random.randint(1, 4),
                    "progressive_carries": random.randint(1, 3),
                    "successful_dribbles": random.randint(0, 2),
                    "tackles": random.randint(0, 2), "interceptions": random.randint(0, 2),
                    "recoveries": random.randint(1, 4), "clearances": 1 if pos == "CB" else 0,
                    "aerials_won": random.randint(0, 2), "aerials_lost": 1,
                    "fouls_committed": 1,
                    "passes_completed": random.randint(8, 18), "passes_attempted": random.randint(10, 22),
                    "saves": 0, "goals_conceded": 0, "clean_sheet": False, "psxg": 0.0
                })
                p_stat_id += 1

    matches_df = pd.DataFrame(matches_list)
    team_stats_df = pd.DataFrame(team_stats_list)
    player_stats_df = pd.DataFrame(player_stats_list)

    # Save CSVs to DEMO_DATA_DIR
    competitions_df.to_csv(settings.DEMO_DATA_DIR / "competitions.csv", index=False)
    seasons_df.to_csv(settings.DEMO_DATA_DIR / "seasons.csv", index=False)
    teams_df.to_csv(settings.DEMO_DATA_DIR / "teams.csv", index=False)
    players_df.to_csv(settings.DEMO_DATA_DIR / "players.csv", index=False)
    matches_df.to_csv(settings.DEMO_DATA_DIR / "matches.csv", index=False)
    team_stats_df.to_csv(settings.DEMO_DATA_DIR / "team_stats.csv", index=False)
    player_stats_df.to_csv(settings.DEMO_DATA_DIR / "player_stats.csv", index=False)

    return {
        "competitions": len(competitions_df),
        "seasons": len(seasons_df),
        "teams": len(teams_df),
        "players": len(players_df),
        "matches": len(matches_df),
        "team_match_stats": len(team_stats_df),
        "player_match_stats": len(player_stats_df),
    }

if __name__ == "__main__":
    summary = generate_demo_dataset()
    print("Demo dataset generated successfully:", summary)
