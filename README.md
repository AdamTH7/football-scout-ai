# Football Scout AI — Tactical Intelligence & Lineup Optimization System

An end-to-end Machine Learning, Statistical Analysis, and Tactical Decision Support platform for professional football clubs, sporting directors, and data analysts.

---

## 🌟 Key Capabilities

### 1. 🎯 Starting XI Tactical Optimizer & Mixed-Integer Solver
- **Tactical Objectives**: Supports `Balanced Control`, `High Press & Aggressive Overloads`, `Low-Block & Quick Counter-Attack`, `Possession Dominance & Field Tilt`, and `Set-Piece Dominance`.
- **Optimization Engine**: Positional constraints, team chemistry synergies, fatigue degradation penalty, disciplinary suspensions, and player role suitability scores.
- **Interactive Pitch**: SVG football pitch with tactical badges, score breakdowns (Technical, Tactical, Fitness, Form), and dynamic bench recommendations.

### 2. 🔍 Hybrid Player Scout & Statistical Twins
- **Scouting Recommendation Engine**: Content-based and collaborative similarity using Euclidean & Cosine distance metrics over per-90 normalized stats.
- **Statistical Twin Detection**: Discover nearest neighbors across leagues to replace departing stars or find undervalued talents.
- **Comprehensive Profiles**: 6-stat spider grids, form ratings, fitness monitors, contract status, and market valuations.

### 3. 🛡️ Opposition Intelligence & Weakness Exploitation
- **Pressing & Tactical Profiles**: PPDA (Passes Allowed Per Defensive Action), field tilt %, directness, and build-up tendencies.
- **Vulnerability Analysis**: Flank exploit warnings, space conceded between lines, set-piece fragility, and transition weaknesses.
- **Actionable Counter-Strategies**: Tailored tactical gameplans with priority levels and tactical factor badges.

### 4. 🔮 Multi-Class Match Outcome & xG Predictor
- **Supervised ML Models**: Random Forest, XGBoost / Gradient Boosting, and Multinomial Logistic Regression.
- **Chronological Out-of-Sample Validation**: Zero data leakage split respecting temporal match sequences.
- **Win Probability Tri-Bar**: Home Win, Draw, Away Win probabilities with calibration curves and Brier scores.
- **In-Game Substitution Engine**: Simulates minute-by-minute win probability impact and expected goal shift before making changes.

### 5. 🔬 Exploratory Data Science & Statistics Lab
- **Pearson & Spearman Correlation Heatmap**: Matrix computation with statistical significance ($p < 0.05$).
- **PCA & Scree Plot Analysis**: Dimensionality reduction with cumulative explained variance and component loadings.
- **2D PCA Projection**: Interactive scatter plot projecting players onto tactical axes.
- **K-Means Archetype Clustering**: Unsupervised discovery of playing styles with Silhouette score validation.
- **Descriptive Statistics**: Quartiles, central tendencies, standard deviations, and skewness across all performance indicators.

### 6. 📊 Supervised ML Model Evaluation
- **Full Model Metrics**: Accuracy, Macro F1, Precision, Recall, Log Loss, and Brier Score.
- **Colorized Confusion Matrix**: Heatmap cells indicating misclassification patterns.
- **Feature Importance Chart**: Gini impurity / gain rankings showing key tactical drivers.

---

## 🏗️ Architecture

```
RS + ML/
├── backend/
│   ├── app/
│   │   ├── analytics/          # Statistics, PCA, and K-Means engines
│   │   ├── api/                # FastAPI routing & schemas
│   │   ├── core/               # Configuration & settings
│   │   ├── data_pipeline/      # Ingestion, validation & demo seeders
│   │   ├── db/                 # SQLite & SQLAlchemy models
│   │   ├── models/             # Match predictor ML pipeline (Scikit-learn/Joblib)
│   │   ├── optimisation/       # Starting XI linear/heuristic solver
│   │   ├── recommendations/    # Hybrid recommender & similarity
│   │   └── tactical_analysis/  # Opposition intelligence & substitutions
│   ├── data/                   # SQLite database & CSV artifacts
│   └── tests/                  # Pytest test suite (10/10 passing)
└── frontend/
    ├── src/
    │   ├── api/                # Unified API client
    │   ├── components/         # Pitch SVG, Sidebar, Navbar
    │   ├── pages/              # 9 feature pages
    │   ├── index.css           # Custom dark theme & neon emerald styling
    │   └── App.jsx             # Router & app state
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### Backend Setup
```bash
# Navigate to backend and activate virtualenv
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
# or source venv/bin/activate # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive API documentation is available at `http://localhost:8000/docs`.

### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173` to launch the platform.

### Running Test Suite
```bash
.\backend\venv\Scripts\python.exe -m pytest
```

---

## 🛡️ License
Private and Confidential. Built for football analytics research and development.
