// Every path the frontend will call once a backend is connected.
// Kept in one file so the contract is easy to hand to whoever builds
// the backend, and easy to keep in sync if a path changes.
// Full request/response shapes are documented in /BACKEND.md.
export const EP = {
  products: {
    list: '/api/products',
    detail: id => `/api/products/${id}`,
    search: q => `/api/products/search?q=${encodeURIComponent(q)}`,
  },
  auth: {
    signup: '/api/auth/signup',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  otp: {
    send: '/api/otp/send',
    verify: '/api/otp/verify',
  },
  coupons: {
    list: '/api/coupons',
    apply: '/api/coupons/apply',
  },
  orders: {
    create: '/api/orders',
    list: '/api/orders',
    detail: id => `/api/orders/${id}`,
    cancel: id => `/api/orders/${id}/cancel`,
    tracking: id => `/api/orders/${id}/tracking`,
  },
  payments: {
    createOrder: '/api/payments/create-order',
    verify: '/api/payments/verify',
    cod: '/api/payments/cod',
  },
  invoices: {
    get: id => `/api/invoices/${id}`,
  },
  notifications: {
    email: '/api/notifications/email',
    whatsapp: '/api/notifications/whatsapp',
  },
  admin: {
    stats: '/api/admin/stats',
    revenue: '/api/admin/analytics/revenue',
    products: '/api/admin/products',
    orders: '/api/admin/orders',
    customers: '/api/admin/customers',
    inventory: '/api/admin/inventory',
    coupons: '/api/admin/coupons',
    reviews: '/api/admin/reviews',
    banners: '/api/admin/banners',
  },
};
