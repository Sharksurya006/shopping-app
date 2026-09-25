# Connecting a real backend to NAYARA

The frontend runs entirely on mock data/services today — nothing here needs a
backend to work. This file is the contract for the backend that will eventually
replace those mocks, so it can be built independently and then plugged in by
changing environment variables only. **No frontend code changes should be
needed** to go live, beyond what's noted under "Known follow-ups" at the end.

## How the switch works

- `src/config/env.js` reads `VITE_API_BASE_URL` from `.env.local`. Empty → the
  app uses its built-in mocks, exactly as it does right now. Set → every
  service in `src/services/index.js` calls the real endpoint below instead.
- `src/services/http.js` is the single fetch wrapper: adds the base URL, JSON
  headers, `Authorization: Bearer <token>` (from the persisted store, set by
  `authService.login`/`signup`), a 15s timeout, and throws a normal `Error`
  (with `.status` and `.data`) on any non-2xx response.
- `src/services/endpoints.js` lists every path below as a constant — treat it
  as the source of truth if this document and the code ever drift.

To connect a backend: build it to the contract below, deploy it, then set in
`.env.local` (copy from `.env.example`):
```
VITE_API_BASE_URL=https://your-api.example.com
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx        # only needed for real card/UPI/etc. payments
```

All endpoints below are prefixed with `VITE_API_BASE_URL`. Request bodies and
responses are JSON. Authenticated endpoints expect `Authorization: Bearer <token>`.

## Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/auth/signup` | `{name, email, mobile, password, dob?, gender?}` | `{user: {name, email, mobile}, token}` |
| POST | `/api/auth/login` | `{email, password}` | `{user: {name, email}, token}` |
| POST | `/api/auth/logout` | — | `{}` |
| GET  | `/api/auth/me` | — | `{user}` (not yet called by the frontend; reserved for session restore) |

## OTP

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/otp/send` | `{contact}` (email or mobile) | `{requestId}` |
| POST | `/api/otp/verify` | `{code, requestId}` | `200 OK` on success, `4xx` on wrong/expired code |

## Products

| Method | Path | Response |
|---|---|---|
| GET | `/api/products` | `Product[]` — same shape as `src/data/products.js` (`id, sku, name, fabric, category, color, occasion, mrp, price, discount, rating, reviews, stock, isNew, best, length, images[]`) |
| GET | `/api/products/:id` | `Product` |
| GET | `/api/products/search?q=` | `Product[]` |

## Coupons

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/coupons` | — | `Coupon[]` (`{code, pct?, flat?, min}`) |
| POST | `/api/coupons/apply` | `{code, subtotal}` | `Coupon` on success, `4xx {message}` if invalid/below minimum |

## Orders

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/orders` | `{items, total, pay, txnId, speed, address}` | `Order` — adds `id, date, status` |
| GET | `/api/orders` | — | `Order[]` for the logged-in user |
| GET | `/api/orders/:id` | — | `Order` |
| POST | `/api/orders/:id/cancel` | — | `{ok}` |
| GET | `/api/orders/:id/tracking` | — | `string[]` — ordered list of statuses, e.g. `["Order Placed", "Payment Confirmed", ...]` |

## Payments

Frontend uses Razorpay Checkout as the default gateway (`src/services/index.js`,
`processViaGateway`) — swap it for another SDK there if you pick a different
provider. The two endpoints it needs:

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/payments/create-order` | `{amount, method}` | `{id, amount, currency}` — a Razorpay order object |
| POST | `/api/payments/verify` | `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` | `{ok: true}` after verifying the signature server-side (**never trust the client-side response alone**) |
| POST | `/api/payments/cod` | `{amount}` | `{ok: true, txnId}` |

## Invoices & notifications

| Method | Path | Response |
|---|---|---|
| GET | `/api/invoices/:id` | `{invoiceNo, ...order}` |
| POST | `/api/notifications/email` | `{orderId}` in body → `{delivered: true, at}` after actually sending |
| POST | `/api/notifications/whatsapp` | `{orderId}` in body → `{delivered: true, at}` after actually sending via WhatsApp Business Cloud API |

## Admin (dashboard + analytics only — wired so far)

| Method | Path | Response |
|---|---|---|
| GET | `/api/admin/stats` | `{revenue, orders, customers, lowStock}` |
| GET | `/api/admin/analytics/revenue` | `{m, revenue, orders}[]` — one entry per month |

## Known follow-ups (small, deliberate, not yet done)

These need a one-line change in the listed file once a backend exists — left
alone for now since they touch UI files and weren't asked for yet:

- **Admin tables** (`src/admin/Modules.jsx`, `src/pages/Account.jsx` order
  list): currently read from `src/data/extra.js` mock rows directly, not
  through `adminService`/`orderService`. `EP.admin.products/orders/customers/
  inventory/coupons/reviews/banners` are already defined in
  `src/services/endpoints.js` for when this is wired up.
- **Session restore on refresh**: `authService` stores the token on
  login/signup but nothing calls `GET /api/auth/me` on app load yet to restore
  `user` after a refresh.
