import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

const TOKEN_KEY = 'wizjobai_token';

export const tokenStore = {
  get() {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // backend also sets an httpOnly cookie; harmless to send it
  headers: { 'Content-Type': 'application/json' },
});

// Attach the bearer token (mirrors backend's `protect` middleware, which accepts
// either the Authorization header or the `token` cookie).
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors into the { message, code, details } shape sent by
// backend/src/middleware/errorHandler.js so components never touch axios internals.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;
    const normalized = {
      message: payload?.message || error.message || 'Something went wrong. Please try again.',
      code: payload?.code || 'UNKNOWN',
      details: payload?.details,
      status: error.response?.status,
    };
    return Promise.reject(normalized);
  }
);

// Thin wrappers for every auth/user endpoint exposed by the backend.
export const authApi = {
  register: (body) => api.post('/auth/register', body).then((r) => r.data),
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  sendVerificationOtp: (email) => api.post('/auth/otp/send', { email }).then((r) => r.data),
  verifyEmailOtp: (email, otp) => api.post('/auth/otp/verify-email', { email, otp }).then((r) => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  verifyResetOtp: (email, otp) => api.post('/auth/verify-reset-otp', { email, otp }).then((r) => r.data),
  resetPassword: (body) => api.post('/auth/reset-password', body).then((r) => r.data),
  updatePassword: (body) => api.patch('/auth/update-password', body).then((r) => r.data),
};

export const userApi = {
  updateMe: (body) => api.patch('/users/me', body).then((r) => r.data),
  uploadAvatar: (formData) =>
    api
      .post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),
  deleteAvatar: () => api.delete('/users/me/avatar').then((r) => r.data),
};

// Thin wrappers for the dashboard's analytics/jobs/bots/applications endpoints.
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard').then((r) => r.data),
};

export const jobsApi = {
  list: (params) => api.get('/jobs', { params }).then((r) => r.data),
  get: (id) => api.get(`/jobs/${id}`).then((r) => r.data),
  saved: (params) => api.get('/jobs/saved/me', { params }).then((r) => r.data),
  save: (id) => api.post(`/jobs/${id}/save`).then((r) => r.data),
  unsave: (id) => api.delete(`/jobs/${id}/save`).then((r) => r.data),
  report: (id, body) => api.post(`/jobs/${id}/report`, body).then((r) => r.data),
  // Recruiter/admin-only management endpoints - the backend enforces the role
  // and ownership checks, these are just thin wrappers.
  create: (body) => api.post('/jobs', body).then((r) => r.data),
  update: (id, body) => api.patch(`/jobs/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/jobs/${id}`).then((r) => r.data),
};

export const botsApi = {
  list: () => api.get('/bots').then((r) => r.data),
  get: (id) => api.get(`/bots/${id}`).then((r) => r.data),
  create: (body) => api.post('/bots', body).then((r) => r.data),
  update: (id, body) => api.patch(`/bots/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/bots/${id}`).then((r) => r.data),
  pause: (id) => api.patch(`/bots/${id}/pause`).then((r) => r.data),
  resume: (id) => api.patch(`/bots/${id}/resume`).then((r) => r.data),
  addActivity: (id, body) => api.post(`/bots/${id}/activity`, body).then((r) => r.data),
};

export const applicationsApi = {
  me: (params) => api.get('/applications/me', { params }).then((r) => r.data),
  // `resume`/`coverLetter` are optional - applying with neither is a valid
  // one-click "Easy Apply", matching backend/src/controllers/applicationController.js.
  apply: (jobId, { resume, coverLetter } = {}) => {
    const formData = new FormData();
    if (resume) formData.append('resume', resume);
    if (coverLetter) formData.append('coverLetter', coverLetter);
    return api
      .post(`/applications/${jobId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};
