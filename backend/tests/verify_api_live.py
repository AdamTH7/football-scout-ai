import httpx
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base_url = "http://127.0.0.1:8000/api"

print("--- 1. Testing Health ---")
r = httpx.get(f"{base_url}/health")
print("Health Status:", r.status_code, r.json()["status"])

print("\n--- 2. Testing Starting XI Optimization ---")
payload = {
    "team_id": "MCI",
    "opponent_id": "RMA",
    "formation": "4-3-3",
    "tactical_objective": "possession"
}
r = httpx.post(f"{base_url}/scout/starting-xi", json=payload)
data = r.json()
print("Formation:", data["formation"])
print("Average Suitability:", data["average_suitability_score"])
print("Starters (Count = len):", len(data["starters"]))
for s in data["starters"]:
    print(f"  [{s['role_code']}]: {s['player']['name']} -> Suitability: {s['player']['suitability_score']}")

print("\n--- 3. Testing Match Prediction ---")
pred_payload = {"home_team_id": "MCI", "away_team_id": "RMA"}
r = httpx.post(f"{base_url}/scout/match-prediction", json=pred_payload)
pred = r.json()
print("Outcome Probabilities:")
print(f"  Home Win: {pred['home_win_prob']}% | Draw: {pred['draw_prob']}% | Away Win: {pred['away_win_prob']}%")
print(f"  Predicted xG: MCI {pred['predicted_home_xg']} vs RMA {pred['predicted_away_xg']}")

print("\n--- 4. Testing Opposition Intelligence ---")
r = httpx.post(f"{base_url}/scout/opposition-analysis", json={"team_id": "MCI", "opponent_id": "RMA"})
opp = r.json()
print(f"Opponent: {opp['opponent_name']} | PPDA: {opp['ppda_avg']} ({opp['pressing_intensity']})")
print(f"Vulnerabilities Found: {len(opp['vulnerabilities'])}")
print(f"Tactics Recommended: {len(opp['recommended_tactics'])}")

print("\n--- 5. Testing PCA ---")
r = httpx.get(f"{base_url}/analytics/pca?n_components=5")
pca = r.json()
print(f"PCA Variance Ratios: {pca['explained_variance_ratio']}")
print(f"Total Projected Players: {len(pca['scatter_points'])}")

print("\nAll live API endpoints verified successfully!")
