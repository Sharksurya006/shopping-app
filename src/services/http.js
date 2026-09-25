// Thin fetch wrapper every service uses once a backend exists.
// Adds the base URL, JSON headers, the auth token (if logged in),
// a timeout, and turns non-2xx responses into thrown Errors with
// a .status and .data so callers can branch on them.
import { API_BASE } from '../config/env';
import { useStore } from '../store';

function withTimeout(ms, promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms)),
  ]);
}

async function request(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const token = auth ? useStore.getState().token : null;
  const res = await withTimeout(
    15000,
    fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  );
  let data = null;
  try { data = await res.json(); } catch { /* empty or non-JSON body */ }
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const http = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
