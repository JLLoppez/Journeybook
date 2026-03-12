# JourneyBook v2

JourneyBook is a full-stack travel booking platform with:
- React + Vite frontend
- Node.js + Express + TypeScript backend
- MongoDB persistence
- Duffel live flight search fallback to local flight inventory
- Stripe payment intent flow
- AI trip planner fallback mode

## Production-ready improvements included
- environment-based backend config
- graceful shutdown and health endpoint
- stricter CORS and security headers
- SPA-safe frontend Nginx config
- Dockerfiles for frontend and backend
- production docker-compose file
- PM2 ecosystem file for backend
- frontend auth bootstrap using stored token
- cleaned booking reference generation and duplicate index removal

## Folder structure
- `frontend/` – React client
- `backend/` – Express API
- `docker-compose.production.yml` – production container stack

## Quick start

### Backend
1. Copy `backend/.env.example` to `backend/.env`
2. Fill in MongoDB, JWT, Duffel, Stripe, and Anthropic values
3. Run:
   - `npm install`
   - `npm run build`
   - `npm start`

### Frontend
1. Copy `frontend/.env.production.example` to `frontend/.env.production`
2. Set `VITE_API_URL`
3. Run:
   - `npm install`
   - `npm run build`
   - `npm run preview`

## Docker production run
```bash
cp backend/.env.example backend/.env
cp frontend/.env.production.example frontend/.env.production

docker compose -f docker-compose.production.yml up --build -d
```

## Important note
This environment does not have package registry access, so I could not complete a real `npm install` and run a final verified build inside the container. The source has been upgraded and packaged for deployment, but you still need to run the install/build steps on a machine or VPS with internet access.
