# ✈️ JourneyBook

> A full-stack travel booking platform with live flight search, Stripe payments, and an AI-powered trip planner.

---

## Overview

JourneyBook is a MERN stack travel booking platform built with TypeScript. Users can search for live flights via the Duffel API, book and manage trips, process payments through Stripe, and generate personalised multi-day travel itineraries powered by Claude AI. The platform falls back gracefully to a database and demo mode when external APIs are unavailable — keeping it always demonstrable.

---

## Features

- ✈️ **Live flight search** — Duffel API integration for real-time flight offers by route, date & cabin class
- 💾 **Smart fallback** — Automatically falls back to seeded MongoDB data when Duffel is unavailable
- 💳 **Stripe payments** — Secure booking and payment processing
- 🤖 **AI trip planner** — Claude (claude-opus-4-6) generates detailed multi-day itineraries with day-by-day activities, accommodation, costs & travel tips
- 🗺️ **City name search** — Search flights by city name with IATA airport code resolution
- 📋 **Booking dashboard** — Authenticated users can view and manage all their bookings
- 🔒 **JWT authentication** — Secure login, registration and protected routes
- 🛡️ **Production hardened** — Helmet, CORS, rate limiting, input validation via express-validator
- 🐳 **Docker support** — Dockerfile and docker-compose for containerised deployment
- ⚙️ **PM2 ready** — ecosystem.config.js included for process management

---

## Tech Stack

### Frontend


![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)




![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)




![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)




![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)



### Backend


![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)




![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)




![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)




![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)



### Integrations


![Duffel](https://img.shields.io/badge/Duffel_API-000000?style=for-the-badge)




![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)




![Claude](https://img.shields.io/badge/Claude_AI-CC785C?style=for-the-badge)



### Deployment


![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)




![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)



---

© 2026 JourneyBook • All Rights Reserved • Built by Jall Technologies
