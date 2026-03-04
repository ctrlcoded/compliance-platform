import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Dev Auto-Login ──────────────────────────────────────────────────────────
// In development, automatically fetch a JWT from the dev-token endpoint
// and attach it to every request. This removes the need for a login UI
// during local testing.

let tokenPromise: Promise<string> | null = null;

async function getDevToken(): Promise<string> {
    const stored = localStorage.getItem('dev_token');
    if (stored) return stored;

    const { data } = await axios.post(`${API_BASE}/auth/dev-token`);
    const token: string = data.data.token;
    localStorage.setItem('dev_token', token);
    return token;
}

// Request interceptor: attach JWT token
api.interceptors.request.use(async (config) => {
    if (!tokenPromise) {
        tokenPromise = getDevToken();
    }
    const token = await tokenPromise;
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor: handle 401 by refreshing token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.error('API Error:', error.response?.data || error.message);

        // If we get 401, clear the cached token and retry once
        if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;
            localStorage.removeItem('dev_token');
            tokenPromise = null;
            const token = await getDevToken();
            error.config.headers.Authorization = `Bearer ${token}`;
            return api(error.config);
        }

        return Promise.reject(error);
    }
);

export default api;
