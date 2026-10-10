/**
 * Thin fetch wrapper. All calls go through the Vite proxy to Flask.
 * Shopping still works if these requests fail.
 */

const TOKEN_KEY = "cartt_auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || data.error || "Request failed");
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

export const api = {
  health: () => request("/api/health"),
  signup: (body) => request("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/api/auth/me"),
  logout: () => request("/api/auth/logout", { method: "POST", body: JSON.stringify({}) }),
  checkout: (body) => request("/api/checkout", { method: "POST", body: JSON.stringify(body) }),
  startSession: (body) => request("/api/session/start", { method: "POST", body: JSON.stringify(body) }),
  sendEvents: (body) => request("/api/session/events", { method: "POST", body: JSON.stringify(body) }),
  sendFeatures: (body) => request("/api/session/features", { method: "POST", body: JSON.stringify(body) }),
  predict: (body) => request("/api/predict", { method: "POST", body: JSON.stringify(body) }),
  purchase: (sessionId) =>
    request("/api/session/purchase", { method: "POST", body: JSON.stringify({ session_id: sessionId }) }),
  abandon: (sessionId) =>
    request("/api/session/abandon", { method: "POST", body: JSON.stringify({ session_id: sessionId }) }),
  dashboardSummary: () => request("/api/dashboard/summary"),
  dashboardSessions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/dashboard/sessions${query ? `?${query}` : ""}`);
  },
  liveSession: () => request("/api/dashboard/live"),
  modelMetrics: () => request("/api/model/metrics"),
  modelFeatures: () => request("/api/model/features"),
  simulate: (level) => request("/api/demo/simulate", { method: "POST", body: JSON.stringify({ level }) }),
};
