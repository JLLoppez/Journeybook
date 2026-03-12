# Production Build Notes

## What was completed
- Added backend environment loader and safer startup flow
- Added graceful shutdown for Node server
- Added CORS allowlist handling and better health response
- Removed duplicate Booking schema index warning
- Added frontend auth bootstrap from persisted token
- Added typed Vite env declarations
- Added Dockerfiles for frontend and backend
- Added production docker compose stack
- Added frontend Nginx SPA routing config
- Added PM2 ecosystem file
- Added deployment-ready README

## What still needs real credentials
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `DUFFEL_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ANTHROPIC_API_KEY`
- `VITE_API_URL`

## Final deployment checklist
1. Run `npm install` in both `frontend` and `backend`
2. Run `npm run build` in both apps
3. Confirm backend `/api/health`
4. Confirm frontend talks to deployed API URL
5. Add reverse proxy / TLS in front of API and frontend
6. Configure Stripe webhook endpoint
7. Seed demo flights only if using fallback mode
