# ✈ JourneyBook

> *"The world is a book, and those who do not travel read only one page."* — Saint Augustine

**JourneyBook** is a full-stack travel booking platform with live flight search, AI-powered trip planning, Stripe payments, and automatic currency detection — built for South African travellers going global.

---

**[Live Demo](https://journeybook.vercel.app)** · **[Backend API](https://journeybook-vom8.onrender.com)**

---

## Overview

JourneyBook is a production-grade MERN stack travel platform built with TypeScript. Users search live flights via the Duffel API, book and manage trips, process payments through Stripe, and generate personalised multi-day itineraries powered by Claude AI. The platform detects the user's location and currency automatically via IP geolocation and converts costs in real time. It falls back gracefully to seeded data and demo mode when external APIs are unavailable — keeping it always demonstrable.

---

## Features

- ✈️ **Live flight search** — Duffel API integration for real-time flight offers by route, date & cabin class
- 🤖 **AI trip planner** — Claude AI generates personalised day-by-day itineraries scaled to group size, budget, trip type and travel style
- 👨‍👩‍👧 **Passenger selector** — Adults (12+), Children (2–11), Infants (free lap travel) with smart validation
- 💱 **Auto currency detection** — IP geolocation detects user country and currency on first visit; live exchange rates via open.er-api.com
- 🗓️ **One-way & return trips** — Full date selection; AI plan pre-fills FlightSearch with all details on "Select This Plan"
- 💳 **Stripe payments** — Secure booking and payment processing with webhook support
- 📋 **Booking dashboard** — Authenticated users manage all trips, view history, and cancel bookings
- 🔒 **JWT authentication** — Access + refresh token rotation; silent re-authentication on expiry
- 🛡️ **Production hardened** — Helmet, CORS, rate limiting, express-validator, bcrypt, graceful shutdown
- 🧪 **Jest test suite** — 66 tests across 7 suites covering auth, bookings, AI planner, JWT, flight fallback, location and rate limiting
- 🐳 **Docker support** — Dockerfile and docker-compose for containerised deployment
- ⚙️ **PM2 ready** — ecosystem.config.js for process management

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


![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)




![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)




![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)



---

© 2026 JourneyBook • All Rights Reserved • Built by [Jall Technologies](https://jallopes.vercel.app/)

This project and its source code are the intellectual property of Jose Lopes. No part of this codebase, design, or concept may be reproduced, distributed, or used without explicit written permission from the author.

For licensing enquiries: [abiliolopes300@gmail.com](mailto:abiliolopes300@gmail.com)
