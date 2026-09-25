// Central place the rest of the app reads backend config from.
// Nothing here changes behaviour today: VITE_API_BASE_URL is empty by
// default, so USE_REAL_API is false and every service keeps using its
// built-in mock implementation exactly as before.
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const USE_REAL_API = Boolean(API_BASE);
export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
