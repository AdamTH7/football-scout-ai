const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function handleResponse(res) {
  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const data = await res.json();
      if (data && data.detail) errorDetail = data.detail;
    } catch (e) {
      // ignore
    }
    throw new Error(errorDetail || `API request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health
  getHealth: () => fetch(`${API_BASE_URL}/health`).then(handleResponse),

  // Entities
  getCompetitions: () => fetch(`${API_BASE_URL}/competitions`).then(handleResponse),
  getSeasons: (compId) => fetch(`${API_BASE_URL}/seasons${compId ? `?competition_id=${compId}` : ''}`).then(handleResponse),
  getTeams: (compId) => fetch(`${API_BASE_URL}/teams${compId ? `?competition_id=${compId}` : ''}`).then(handleResponse),
  getPlayers: (params = {}) => {
    const q = new URLSearchParams();
    if (params.team_id) q.append('team_id', params.team_id);
    if (params.position) q.append('position', params.position);
    if (params.search) q.append('search', params.search);
    return fetch(`${API_BASE_URL}/players?${q.toString()}`).then(handleResponse);
  },
  getPlayerDetails: (id) => fetch(`${API_BASE_URL}/players/${id}`).then(handleResponse),
  getSimilarPlayers: (id, limit = 5) => fetch(`${API_BASE_URL}/players/${id}/similar?limit=${limit}`).then(handleResponse),

  // Analytics
  getAnalyticsSummary: () => fetch(`${API_BASE_URL}/analytics/summary`).then(handleResponse),
  getCorrelationMatrix: () => fetch(`${API_BASE_URL}/analytics/correlation`).then(handleResponse),
  getPcaResults: (nComponents = 5) => fetch(`${API_BASE_URL}/analytics/pca?n_components=${nComponents}`).then(handleResponse),
  getClusterResults: (k = 5) => fetch(`${API_BASE_URL}/analytics/clusters?k=${k}`).then(handleResponse),

  // Scout & Intelligence
  recommendPlayers: (payload) => fetch(`${API_BASE_URL}/scout/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleResponse),

  optimizeStartingXi: (payload) => fetch(`${API_BASE_URL}/scout/starting-xi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleResponse),

  analyzeOpposition: (payload) => fetch(`${API_BASE_URL}/scout/opposition-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleResponse),

  predictMatch: (payload) => fetch(`${API_BASE_URL}/scout/match-prediction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleResponse),

  recommendSubstitutions: (payload) => fetch(`${API_BASE_URL}/scout/substitutions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleResponse),

  // Data & ML models
  triggerDataImport: () => fetch(`${API_BASE_URL}/data/import`, {
    method: 'POST'
  }).then(handleResponse),

  trainModel: (payload) => fetch(`${API_BASE_URL}/models/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(handleResponse),

  getModelStatus: () => fetch(`${API_BASE_URL}/models/status`).then(handleResponse)
};
