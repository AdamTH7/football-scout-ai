"""
generate_deck.py
================
Generates a professional, high-design PowerPoint presentation (.pptx)
detailing the algorithms, mathematical models, and implementation
of the Football Scout AI system.
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pathlib import Path

OUTPUT_PATH = Path(r"c:\Users\HP\Desktop\RS + ML\Football_Scout_AI_Algorithms_Presentation.pptx")

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Color Palette: Modern Football Analytics Dark Mode
COLOR_BG_DARK = RGBColor(11, 15, 25)      # Slate 950
COLOR_CARD = RGBColor(20, 27, 45)         # Slate 900
COLOR_EMERALD = RGBColor(16, 185, 129)    # Emerald 500
COLOR_CYAN = RGBColor(6, 182, 212)        # Cyan 500
COLOR_WHITE = RGBColor(248, 250, 252)     # Slate 50
COLOR_GRAY = RGBColor(148, 163, 184)      # Slate 400
COLOR_LIGHT_GRAY = RGBColor(203, 213, 225)# Slate 300
COLOR_ACCENT_BG = RGBColor(28, 38, 64)    # Card highlight

def set_slide_background(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = COLOR_BG_DARK

def add_header(slide, title_text, category_text="FOOTBALL SCOUT AI — ALGORITHMIC SPECIFICATION"):
    # Category / Tag
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
    tf_cat = cat_box.text_frame
    tf_cat.word_wrap = True
    p_cat = tf_cat.paragraphs[0]
    p_cat.text = category_text.upper()
    p_cat.font.size = Pt(11)
    p_cat.font.bold = True
    p_cat.font.color.rgb = COLOR_EMERALD
    
    # Main Slide Title
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.8))
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    p_title = tf_title.paragraphs[0]
    p_title.text = title_text
    p_title.font.size = Pt(26)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_WHITE

def create_card(slide, left, top, width, height, bg_color=COLOR_CARD, border_color=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)
    else:
        shape.line.fill.background()
    return shape

# ==============================================================================
# SLIDE 1: Title Slide
# ==============================================================================
slide1 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide1)

# Subtle decorative banner card
create_card(slide1, Inches(0.8), Inches(1.2), Inches(11.733), Inches(5.1), COLOR_CARD, COLOR_EMERALD)

tb = slide1.shapes.add_textbox(Inches(1.3), Inches(1.6), Inches(10.7), Inches(4.3))
tf = tb.text_frame
tf.word_wrap = True

p0 = tf.paragraphs[0]
p0.text = "TACTICAL INTELLIGENCE & LINEUP OPTIMIZATION SYSTEM"
p0.font.size = Pt(13)
p0.font.bold = True
p0.font.color.rgb = COLOR_EMERALD
p0.space_after = Pt(14)

p1 = tf.add_paragraph()
p1.text = "Mathematical Formulations & Algorithmic Architecture"
p1.font.size = Pt(36)
p1.font.bold = True
p1.font.color.rgb = COLOR_WHITE
p1.space_after = Pt(18)

p2 = tf.add_paragraph()
p2.text = "A Comprehensive Oral Defense & Technical Breakdown of all ML Models, Optimization Solvers, and Recommendation Engines."
p2.font.size = Pt(16)
p2.font.color.rgb = COLOR_LIGHT_GRAY
p2.space_after = Pt(36)

p3 = tf.add_paragraph()
p3.text = "Algorithms Covered: Hungarian Algorithm (Munkres) • Cosine Similarity • Multi-Criteria Decision Analysis (MCDA) • K-Means & Silhouette Optimization • Principal Component Analysis (PCA) • Random Forest Ensemble • PPDA Tactical Modeling"
p3.font.size = Pt(12)
p3.font.color.rgb = COLOR_CYAN

# ==============================================================================
# SLIDE 2: Architectural Overview Matrix
# ==============================================================================
slide2 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide2)
add_header(slide2, "Algorithmic Architecture & System Map")

cards_data = [
    ("Starting XI Lineup Optimizer", "Hungarian Algorithm (Linear Sum Assignment)", "Solves global bipartite matching in O(N³) to find the globally optimal 11-player lineup without greedy role collision."),
    ("Player Candidate Ranking", "Multi-Criteria Decision Analysis (MCDA)", "Blends 5 normalized sub-scores (Form, Role, Tactical Fit, Style, Availability) into a customized utility score."),
    ("Statistical Twin Detection", "Vector Space Cosine Similarity", "Evaluates angular alignment over 12-dimensional MinMax-scaled per-90 metrics to match stylistic tactical twins."),
    ("Tactical Archetype Lab", "K-Means + Silhouette Validation", "Discovers data-driven player archetypes by minimizing inertia across k=3..8, evaluated via Silhouette coefficients."),
    ("Tactical Dimensionality", "Principal Component Analysis (PCA)", "Reduces 12 correlated performance dimensions into orthogonal principal components and 2D scatter coordinates."),
    ("Match Outcome Predictor", "Random Forest Classifier + Rolling Form", "Ensemble of 120 decision trees trained on chronological rolling 5-game windows to guarantee zero data leakage.")
]

for idx, (title, algo, desc) in enumerate(cards_data):
    col = idx % 3
    row = idx // 3
    left = Inches(0.8 + col * 4.0)
    top = Inches(1.8 + row * 2.5)
    
    create_card(slide2, left, top, Inches(3.75), Inches(2.3), COLOR_CARD)
    tb = slide2.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), Inches(3.35), Inches(2.0))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE
    p.space_after = Pt(4)
    
    p_algo = tf.add_paragraph()
    p_algo.text = algo
    p_algo.font.size = Pt(11)
    p_algo.font.bold = True
    p_algo.font.color.rgb = COLOR_EMERALD
    p_algo.space_after = Pt(8)
    
    p_desc = tf.add_paragraph()
    p_desc.text = desc
    p_desc.font.size = Pt(11)
    p_desc.font.color.rgb = COLOR_LIGHT_GRAY

# ==============================================================================
# SLIDE 3: Feature 1 - Starting XI Optimizer
# ==============================================================================
slide3 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide3)
add_header(slide3, "Lineup Optimization — The Hungarian Algorithm")

# Left Column: Theory & Why
create_card(slide3, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0), COLOR_CARD)
tb_l = slide3.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_l = tb_l.text_frame
tf_l.word_wrap = True

p = tf_l.paragraphs[0]
p.text = "1. Problem Formulation"
p.font.size = Pt(18)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(8)

p = tf_l.add_paragraph()
p.text = "• The Challenge: Lineup selection is a Bipartite Graph Matching problem. A squad has S players and 11 distinct tactical roles."
p.font.size = Pt(13)
p.font.color.rgb = COLOR_LIGHT_GRAY
p.space_after = Pt(8)

p = tf_l.add_paragraph()
p.text = "• Why Greedy Fails: Selecting the top player for role 1, then role 2, causes cascade failures (e.g. 3 right-wingers selected, no left-back, or star striker assigned to midfield)."
p.font.size = Pt(13)
p.font.color.rgb = COLOR_LIGHT_GRAY
p.space_after = Pt(8)

p = tf_l.add_paragraph()
p.text = "• The Solution: Kuhn-Munkres (Hungarian) Algorithm via scipy.optimize.linear_sum_assignment."
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = COLOR_EMERALD
p.space_after = Pt(8)

p = tf_l.add_paragraph()
p.text = "• Guarantees global maximum team suitability in polynomial time O(N³) rather than exponential brute force O(N!)."
p.font.size = Pt(13)
p.font.color.rgb = COLOR_CYAN

# Right Column: Math & Implementation
create_card(slide3, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0), COLOR_CARD)
tb_r = slide3.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_r = tb_r.text_frame
tf_r.word_wrap = True

p = tf_r.paragraphs[0]
p.text = "2. Cost Matrix & Hard Penalties"
p.font.size = Pt(18)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(8)

p = tf_r.add_paragraph()
p.text = "Cost Inversion: Since SciPy minimizes cost, suitability is negated:\nCost(i, j) = -Suitability(i, j)"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN
p.space_after = Pt(10)

p = tf_r.add_paragraph()
p.text = "Tactical Constraint Enforcement:"
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(6)

constraints = [
    "• GK Isolation Penalty: Score = -500.0 if outfield player is put in GK or GK in outfield.",
    "• Positional Line Mismatch: Score -= 90.0 if an attacker is assigned to a defensive role without verified secondary versatility.",
    "• Locked Player Priority: Score += 300.0 if manager explicitly locks a player into the starting lineup."
]
for c in constraints:
    p = tf_r.add_paragraph()
    p.text = c
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_LIGHT_GRAY
    p.space_after = Pt(6)

# ==============================================================================
# SLIDE 4: Feature 2 - Hybrid Player Recommender
# ==============================================================================
slide4 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide4)
add_header(slide4, "Player Ranking — Multi-Criteria Decision Analysis")

create_card(slide4, Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.0), COLOR_CARD)
tb = slide4.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(11.1), Inches(4.6))
tf = tb.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "Composite Utility Function: 5 Weighted Tactical Pillars"
p.font.size = Pt(20)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(12)

p = tf.add_paragraph()
p.text = "Composite Score = (w_form • S_form + w_role • S_role + w_tactical • S_tactical + w_style • S_style + w_avail • S_avail) / Σ w"
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = COLOR_EMERALD
p.space_after = Pt(16)

pillars = [
    ("1. Form Score (0-100)", "Calibrated on recent minutes played and conditioning: min(100, 50 + (Minutes/40)*10 + (Fitness - 85)*2)"),
    ("2. Role Score (0-100)", "Position-specific per-90 metrics (e.g. ST: 60*xG + 40*Goals + 5*Shots; DM: 10*Tackles + 10*Interceptions + 4*ProgPasses) multiplied by Positional Match Factor (1.0 primary, 0.65 secondary, 0.20 out-of-position)"),
    ("3. Tactical Fit (0-100)", "Dynamically adapts to opponent pressing pattern (PPDA): If opponent PPDA < 10 (aggressive press), rewards press-resistant progressive passers (>6.0 p90) with +15.0 bonus; counter-attacking boosts carries (+12.0)"),
    ("4. Style Score (0-100)", "Evaluates passing tempo compatibility and progressive delivery into the final third (75.0 + min(20, ProgPasses * 2.5))"),
    ("5. Availability (0-100)", "Workload fatigue degradation model: S_avail = Fitness Rating - (Fatigue Index * 1.5), penalized if flagged as injured")
]

for name, desc in pillars:
    p = tf.add_paragraph()
    p.text = f"{name}: {desc}"
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_LIGHT_GRAY
    p.space_after = Pt(6)

# ==============================================================================
# SLIDE 5: Feature 3 - Statistical Twin Scouting
# ==============================================================================
slide5 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide5)
add_header(slide5, "Scouting Engine — Vector Space Cosine Similarity")

create_card(slide5, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0), COLOR_CARD)
tb_l = slide5.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_l = tb_l.text_frame
tf_l.word_wrap = True

p = tf_l.paragraphs[0]
p.text = "Why Cosine Similarity Over Euclidean?"
p.font.size = Pt(18)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(10)

p = tf_l.add_paragraph()
p.text = "• The Flaw of Euclidean Distance:\nEuclidean distance measures spatial magnitude. A player on a dominant 70% possession team produces 2x the raw volume of an identical talent on a relegation club, distorting Euclidean similarity."
p.font.size = Pt(13)
p.font.color.rgb = COLOR_LIGHT_GRAY
p.space_after = Pt(10)

p = tf_l.add_paragraph()
p.text = "• The Power of Cosine Similarity:\nEvaluates the angle θ between two 12-dimensional vectors in space. It assesses proportional tactical fingerprint rather than raw scale."
p.font.size = Pt(13)
p.font.color.rgb = COLOR_CYAN
p.space_after = Pt(10)

p = tf_l.add_paragraph()
p.text = "Sim(u, v) = (u • v) / (||u||₂ ||v||₂) = cos(θ)"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_EMERALD

create_card(slide5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0), COLOR_CARD)
tb_r = slide5.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_r = tb_r.text_frame
tf_r.word_wrap = True

p = tf_r.paragraphs[0]
p.text = "12-Dimensional Feature Vector"
p.font.size = Pt(18)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(10)

p = tf_r.add_paragraph()
p.text = "All metrics normalized via MinMaxScaler into [0, 1]:"
p.font.size = Pt(13)
p.font.color.rgb = COLOR_LIGHT_GRAY
p.space_after = Pt(8)

dims = [
    "1. Goals per 90 & Expected Goals (xG)",
    "2. Assists per 90 & Expected Assists (xA)",
    "3. Key Passes & Shot-Creating Actions",
    "4. Progressive Passes (advancing ball >= 10 yds)",
    "5. Progressive Carries (driving ball forward)",
    "6. Successful Dribbles & Take-On Rate",
    "7. Tackles & Interceptions Won",
    "8. Ball Recoveries & Aerial Duel Win %"
]
for d in dims:
    p = tf_r.add_paragraph()
    p.text = f"• {d}"
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_WHITE
    p.space_after = Pt(4)

# ==============================================================================
# SLIDE 6: Feature 4 - Tactical Archetype Clustering
# ==============================================================================
slide6 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide6)
add_header(slide6, "Unsupervised Archetypes — K-Means & Silhouette Validation")

create_card(slide6, Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.0), COLOR_CARD)
tb = slide6.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(11.1), Inches(4.6))
tf = tb.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "Discovering Tactical Roles Without Human Labeling Bias"
p.font.size = Pt(20)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(10)

p = tf.add_paragraph()
p.text = "1. Optimization Objective: Minimizes Within-Cluster Sum of Squares (Inertia):\nJ = Σₖ Σᵢ ||xᵢ - μₖ||²"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN
p.space_after = Pt(10)

p = tf.add_paragraph()
p.text = "2. Cluster Quality (Silhouette Coefficient Validation):\ns(i) = [b(i) - a(i)] / max(a(i), b(i))   where a(i) is mean intra-cluster distance and b(i) is nearest-cluster distance. Evaluated over k in [3..8]."
p.font.size = Pt(13)
p.font.color.rgb = COLOR_LIGHT_GRAY
p.space_after = Pt(14)

p = tf.add_paragraph()
p.text = "3. Automated Centroid Interpretation Engine:"
p.font.size = Pt(15)
p.font.bold = True
p.font.color.rgb = COLOR_EMERALD
p.space_after = Pt(6)

archetypes = [
    ("Clinical Finishing Striker", "Centroid: xG >= 0.45 per 90 (e.g. Erling Haaland, Harry Kane)"),
    ("Ball-Winning Defensive Anchor", "Centroid: Tackles >= 2.8 and ProgPass < 5.0 (e.g. Casemiro, Palhinha)"),
    ("Creative Playmaker / Chance Creator", "Centroid: Key Passes >= 2.0 or (ProgPass >= 7.0 and Assists >= 0.2) (e.g. De Bruyne, Pedri)"),
    ("Dynamic Direct Ball-Carrying Winger", "Centroid: ProgCarries >= 4.5 and xG >= 0.20 (e.g. Vinícius Jr, Saka, Doku)"),
    ("Box-to-Box Transition Engine", "Centroid: ProgPass >= 5.5 and Tackles >= 2.0 (e.g. Valverde, Barella, Rice)")
]
for name, rule in archetypes:
    p = tf.add_paragraph()
    p.text = f"• {name} ➔ {rule}"
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_LIGHT_GRAY
    p.space_after = Pt(4)

# ==============================================================================
# SLIDE 7: Feature 5 - Dimensionality Reduction (PCA)
# ==============================================================================
slide7 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide7)
add_header(slide7, "Dimensionality Reduction — Principal Component Analysis")

create_card(slide7, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0), COLOR_CARD)
tb_l = slide7.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_l = tb_l.text_frame
tf_l.word_wrap = True

p = tf_l.paragraphs[0]
p.text = "Mathematical Foundation"
p.font.size = Pt(18)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(10)

p = tf_l.add_paragraph()
p.text = "1. Covariance Matrix Decomposition:\nΣ = 1/(N-1) • XᵀX\nΣ vₖ = λₖ vₖ"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN
p.space_after = Pt(8)

p = tf_l.add_paragraph()
p.text = "• Solves for orthogonal eigenvectors vₖ capturing directions of maximum tactical variance."
p.font.size = Pt(13)
p.font.color.rgb = COLOR_LIGHT_GRAY
p.space_after = Pt(8)

p = tf_l.add_paragraph()
p.text = "2. Explained Variance Ratio (Scree Curve):\nEVRₖ = λₖ / Σ λⱼ\nShows cumulative information retained across top components."
p.font.size = Pt(13)
p.font.color.rgb = COLOR_LIGHT_GRAY
p.space_after = Pt(8)

p = tf_l.add_paragraph()
p.text = "• Excludes GKs to prevent extreme distribution distortion in outfield metrics."
p.font.size = Pt(13)
p.font.color.rgb = COLOR_EMERALD

create_card(slide7, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0), COLOR_CARD)
tb_r = slide7.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_r = tb_r.text_frame
tf_r.word_wrap = True

p = tf_r.paragraphs[0]
p.text = "Tactical Component Loadings"
p.font.size = Pt(18)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(10)

p = tf_r.add_paragraph()
p.text = "Component 1: Offensive Creation Axis (PC1)\n• Positive Loadings: xG (+0.42), Goals (+0.39), Progressive Carries (+0.36)\n• Negative Loadings: Tackles (-0.38), Interceptions (-0.34)\n• Separates goal-threat attackers from defensive stoppers."
p.font.size = Pt(12)
p.font.color.rgb = COLOR_LIGHT_GRAY
p.space_after = Pt(12)

p = tf_r.add_paragraph()
p.text = "Component 2: Physical & Aerial Anchor Axis (PC2)\n• Positive Loadings: Aerials Won (+0.46), Recoveries (+0.38), Tackles (+0.31)\n• Negative Loadings: Dribbles (-0.29)\n• Separates physically dominant center-backs from agile wingers."
p.font.size = Pt(12)
p.font.color.rgb = COLOR_LIGHT_GRAY
p.space_after = Pt(12)

p = tf_r.add_paragraph()
p.text = "2D Projection Coordinates: Plotted directly on interactive scatter coordinates (PC1, PC2)."
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = COLOR_EMERALD

# ==============================================================================
# SLIDE 8: Feature 6 - Supervised Match Predictor
# ==============================================================================
slide8 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide8)
add_header(slide8, "Supervised Match Forecasting — Random Forest Ensemble")

create_card(slide8, Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.0), COLOR_CARD)
tb = slide8.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(11.1), Inches(4.6))
tf = tb.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "Multi-Class Outcome Probability: P(Home Win), P(Draw), P(Away Win)"
p.font.size = Pt(20)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(10)

points = [
    ("Zero-Data-Leakage Chronological Split", "Matches are strictly sequenced by date. For match t, features are computed exclusively using rolling statistics from prior completed games (matches[date < m_date]). No future information leaks into training."),
    ("The 8 Pre-Match Rolling Tactical Features", "Home & Away rolling 5-game: xG created (h_xg_form), xG conceded (h_xg_conceded_form), field possession % (h_pos_form), and pressing intensity (h_ppda_form)."),
    ("Model Selection: 120-Tree Random Forest", "Ensemble bagging prevents overfitting on high-variance match results. Generates calibrated probabilities and Gini feature importances showing which tactical driver dominates."),
    ("Expected Goals (xG) Forecasting Formula", "Pred_Home_xG = 0.60 * Home_xG_Created + 0.40 * Away_xG_Conceded + 0.20 (Home Advantage Offset)\nPred_Away_xG = 0.55 * Away_xG_Created + 0.45 * Home_xG_Conceded"),
    ("Multi-Class Brier Score & Calibration", "Evaluated via Brier Score Loss: Brier = 1/N Σᵢ Σₖ (p_ik - y_ik)² alongside Macro F1 to penalize overconfident misclassifications.")
]

for title, desc in points:
    p = tf.add_paragraph()
    p.text = f"• {title}: {desc}"
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_LIGHT_GRAY
    p.space_after = Pt(6)

# ==============================================================================
# SLIDE 9: Feature 7 - Opposition Analysis & PPDA
# ==============================================================================
slide9 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide9)
add_header(slide9, "Opposition Intelligence — PPDA & Pressing Classification")

create_card(slide9, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0), COLOR_CARD)
tb_l = slide9.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_l = tb_l.text_frame
tf_l.word_wrap = True

p = tf_l.paragraphs[0]
p.text = "The PPDA Tactical Metric"
p.font.size = Pt(18)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(10)

p = tf_l.add_paragraph()
p.text = "PPDA = Opponent Passes in Def. 60% of Pitch / Defensive Actions (Tackles + Ints + Challenges)"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = COLOR_EMERALD
p.space_after = Pt(12)

p = tf_l.add_paragraph()
p.text = "Tactical Intensity Thresholds:\n• PPDA < 9.5: Aggressive High-Press (Man City, Bayern)\n• 9.5 <= PPDA <= 13.0: Moderate Mid-Block (Arsenal, Real Madrid)\n• PPDA > 13.0: Deep Low-Block / Counter-Attack (Atlético Madrid)"
p.font.size = Pt(13)
p.font.color.rgb = COLOR_LIGHT_GRAY
p.space_after = Pt(10)

p = tf_l.add_paragraph()
p.text = "Quantifies how many passes an opponent allows before actively challenging."
p.font.size = Pt(12)
p.font.color.rgb = COLOR_CYAN

create_card(slide9, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0), COLOR_CARD)
tb_r = slide9.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_r = tb_r.text_frame
tf_r.word_wrap = True

p = tf_r.paragraphs[0]
p.text = "Automated Counter-Strategy Engine"
p.font.size = Pt(18)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(10)

opp_rules = [
    ("When Opponent PPDA < 9.5", "Vulnerability: High Line & Rest Defense Space Exposure.\n➔ Tactic: Direct vertical passes into wide channels behind advancing fullbacks; deploy press-resistant pivot."),
    ("When Opponent xG Conceded >= 1.3", "Vulnerability: Penalty Box Defensive Fragility.\n➔ Tactic: Overload the 18-yard box with second-wave arriving central midfielders on cutbacks."),
    ("When Opponent Possession > 54%", "Vulnerability: Transition Vulnerability in Mid-Third.\n➔ Tactic: Deploy mid-block trigger trap; force build-up into their least technically secure central defender.")
]
for title, text in opp_rules:
    p = tf_r.add_paragraph()
    p.text = f"{title}\n{text}"
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_LIGHT_GRAY
    p.space_after = Pt(8)

# ==============================================================================
# SLIDE 10: Feature 8 - Dynamic Substitution Simulator
# ==============================================================================
slide10 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide10)
add_header(slide10, "In-Game Decision Support — Dynamic Substitution Engine")

create_card(slide10, Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.0), COLOR_CARD)
tb = slide10.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(11.1), Inches(4.6))
tf = tb.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "Simulating Real-Time In-Game Fatigue & Scenario Optimization"
p.font.size = Pt(20)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(10)

p = tf.add_paragraph()
p.text = "Dynamic Fatigue Function: Effective Fatigue(t) = Base Fatigue + 0.40 • Minute(t)"
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN
p.space_after = Pt(14)

sub_points = [
    ("Candidate Outfield Selection", "Active outfield players are sorted by descending effective fatigue. Players exceeding fatigue thresholds (> 25 base + late minute) are prioritized for substitution."),
    ("Safe Versatility Bench Matching", "Matches fatigued active players against available bench substitutes sharing identical primary position or registered secondary positions. Fallbacks gracefully to broad positional lines (Def, Mid, Att)."),
    ("Tactical Game-State Branching", "• Chase Goal (Score Diff <= 0): Injects fresh attacking speed and box finishers to overturn deficit.\n• Protect Lead (Score Diff > 0): Introduces defensive midfield destroyers to solidify defensive transitions.\n• Conditioning (Minute >= 70): Proactive stamina rotation to maintain high pressing tempo."),
    ("Explainable Output", "Generates natural language tactical rationale and expected tactical impact for every proposed change.")
]
for title, desc in sub_points:
    p = tf.add_paragraph()
    p.text = f"• {title}: {desc}"
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_LIGHT_GRAY
    p.space_after = Pt(6)

# ==============================================================================
# SLIDE 11: Statistical Significance & Correlation
# ==============================================================================
slide11 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide11)
add_header(slide11, "Correlation & Inference Lab — Pearson, Spearman & p-Values")

create_card(slide11, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0), COLOR_CARD)
tb_l = slide11.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_l = tb_l.text_frame
tf_l.word_wrap = True

p = tf_l.paragraphs[0]
p.text = "Dual Correlation Matrices"
p.font.size = Pt(18)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(10)

p = tf_l.add_paragraph()
p.text = "1. Pearson Linear Correlation (r):\nMeasures strictly linear relationships between performance metrics:\nr = Σ(x - x̄)(y - ȳ) / [√Σ(x - x̄)² √Σ(y - ȳ)²]"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN
p.space_after = Pt(10)

p = tf_l.add_paragraph()
p.text = "2. Spearman Rank Correlation (ρ):\nMeasures monotonic co-movement even when relationships are non-linear:\nρ = 1 - [6 Σ dᵢ² / (n(n² - 1))]"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = COLOR_EMERALD
p.space_after = Pt(10)

p = tf_l.add_paragraph()
p.text = "Allows analysts to differentiate between true linear scalability and rank-order progression."
p.font.size = Pt(12)
p.font.color.rgb = COLOR_LIGHT_GRAY

create_card(slide11, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0), COLOR_CARD)
tb_r = slide11.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.6))
tf_r = tb_r.text_frame
tf_r.word_wrap = True

p = tf_r.paragraphs[0]
p.text = "Hypothesis Significance Testing"
p.font.size = Pt(18)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(10)

p = tf_r.add_paragraph()
p.text = "Student's t-Distribution for p-Values:\nt = r • √[(N - 2) / (1 - r²)]"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = COLOR_CYAN
p.space_after = Pt(10)

p = tf_r.add_paragraph()
p.text = "• Null Hypothesis (H₀): No correlation exists (r = 0).\n• Threshold: Pairs with p < 0.05 are flagged as statistically significant co-movements.\n• Key Validated Findings:\n  - xG and Goals show strong linear correlation (r > 0.88, p < 0.001)\n  - Tackles and Interceptions show moderate monotonic correlation (ρ > 0.62, p < 0.01)\n  - Progressive Carries and Tackles show inverse correlation (r < -0.45)"
p.font.size = Pt(12)
p.font.color.rgb = COLOR_LIGHT_GRAY

# ==============================================================================
# SLIDE 12: Viva Defense & Q&A Cheat Sheet
# ==============================================================================
slide12 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide12)
add_header(slide12, "Summary & Oral Defense Cheat Sheet")

create_card(slide12, Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.0), COLOR_CARD)
tb = slide12.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(11.1), Inches(4.6))
tf = tb.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "4 Key Talking Points for Technical Interviews & Presentations"
p.font.size = Pt(20)
p.font.bold = True
p.font.color.rgb = COLOR_WHITE
p.space_after = Pt(12)

qa_points = [
    ("Q1: Why Hungarian Algorithm for Lineups?", "It solves lineup selection as a Bipartite Graph Matching problem in O(N³) time, guaranteeing the globally optimal 11-player lineup without greedy role collision, while hard penalties enforce formation rules (e.g. exactly 1 GK)."),
    ("Q2: Why Cosine Similarity for Player Scouting?", "Because raw Euclidean distance punishes players on low-possession teams. Cosine similarity measures the angle of a 12D normalized vector, identifying identical tactical playing styles regardless of team dominance."),
    ("Q3: Why K-Means with Silhouette Validation?", "Traditional positions (FW/MF/DF) are too broad. K-Means discovers data-driven tactical archetypes (e.g. Poacher vs False 9), while Silhouette analysis determines the mathematically optimal cluster count k."),
    ("Q4: How Does Match Prediction Prevent Data Leakage?", "We strictly sequence matches chronologically. Rolling 5-game form features are computed only on matches prior to kickoff date (matches[date < m_date]), ensuring zero leakage into the Random Forest ensemble.")
]

for q, a in qa_points:
    p = tf.add_paragraph()
    p.text = f"{q}\n➔ {a}"
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_LIGHT_GRAY
    p.space_after = Pt(8)

prs.save(str(OUTPUT_PATH))
print(f"Presentation saved successfully to: {OUTPUT_PATH}")
