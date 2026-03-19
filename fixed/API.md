# JourneyBook API Reference

Base URL: `http://localhost:5000/api`  
Production: `https://your-backend.onrender.com/api`

All protected routes require: `Authorization: Bearer <token>`

---

## Authentication

### POST `/auth/register`
Create a new user account.

**Body:**
```json
{ "name": "Jose Lopes", "email": "jose@email.com", "password": "secret123" }
```

**Response `201`:**
```json
{
  "message": "User registered successfully",
  "user": { "id": "...", "name": "Jose Lopes", "email": "jose@email.com", "role": "user" },
  "token": "<access_token>",
  "refreshToken": "<refresh_token>"
}
```

---

### POST `/auth/login`
Authenticate and receive tokens.

**Body:**
```json
{ "email": "jose@email.com", "password": "secret123" }
```

**Response `200`:**
```json
{
  "message": "Login successful",
  "user": { "id": "...", "name": "Jose Lopes", "email": "jose@email.com", "role": "user" },
  "token": "<access_token>",
  "refreshToken": "<refresh_token>"
}
```

---

### GET `/auth/profile` 🔒
Get the authenticated user's profile and booking history.

**Response `200`:**
```json
{ "user": { "id": "...", "name": "...", "email": "...", "role": "user", "bookings": [...] } }
```

---

### POST `/auth/refresh`
Exchange a refresh token for a new access + refresh token pair.

**Body:**
```json
{ "refreshToken": "<refresh_token>" }
```

**Response `200`:**
```json
{ "token": "<new_access_token>", "refreshToken": "<new_refresh_token>" }
```

---

## Flights

### GET `/flights/search`
Search for flights. Tries Duffel API first, falls back to MongoDB cache.

**Query params:**

| Param | Required | Example |
|---|---|---|
| `origin` | ✅ | `CPT` |
| `destination` | ✅ | `DXB` |
| `date` | ✅ | `2026-06-15` |
| `cabinClass` | ❌ | `economy` \| `business` \| `first` |

**Response `200`:**
```json
{
  "count": 3,
  "flights": [
    {
      "_id": "...",
      "airline": "Emirates",
      "flightNumber": "EK771",
      "origin": { "city": "Cape Town", "airport": "Cape Town International", "code": "CPT" },
      "destination": { "city": "Dubai", "airport": "Dubai International", "code": "DXB" },
      "departure": { "date": "2026-06-15T00:00:00Z", "time": "19:35" },
      "arrival": { "date": "2026-06-16T00:00:00Z", "time": "07:30" },
      "duration": "9h 55m",
      "price": 8500,
      "availableSeats": 9,
      "class": "economy",
      "stops": 0,
      "amenities": ["WiFi", "Meals"]
    }
  ],
  "source": "duffel" | "database" | "none"
}
```

---

### GET `/flights`
Get all seeded/cached flights.

**Response `200`:** Array of flight objects.

---

### GET `/flights/:id`
Get a single flight by MongoDB ID.

---

## Bookings

### POST `/bookings` 🔒
Create a booking. Supports both local (seeded) flights and live Duffel offers.

**Body (local flight):**
```json
{
  "flightId": "<mongodb_id>",
  "passengers": 1,
  "class": "economy",
  "contactEmail": "jose@email.com",
  "contactPhone": "+27683727498"
}
```

**Body (live Duffel offer):**
```json
{
  "flightId": "off_0000000000000000000000",
  "duffelOfferId": "off_0000000000000000000000",
  "passengers": 1,
  "class": "economy",
  "contactEmail": "jose@email.com",
  "contactPhone": "+27683727498",
  "passengerDetails": {
    "givenName": "Jose", "familyName": "Lopes",
    "bornOn": "1990-01-01", "gender": "m", "title": "mr"
  }
}
```

**Response `201`:**
```json
{
  "message": "Booking confirmed",
  "booking": { "_id": "...", "bookingReference": "JBX4K2F9AB", "status": "confirmed", ... },
  "source": "duffel" | "database"
}
```

---

### GET `/bookings` 🔒
Get all bookings for the authenticated user.

**Response `200`:**
```json
{ "count": 2, "bookings": [...] }
```

---

### GET `/bookings/:id` 🔒
Get a single booking with populated flight data.

---

### DELETE `/bookings/:id` 🔒
Cancel a booking. Cancels via Duffel API if it's a live order, restores seats for local flights.

**Response `200`:**
```json
{ "message": "Booking cancelled", "booking": { "status": "cancelled", ... } }
```

---

## AI Planner

### POST `/ai/plan` 🔒
Generate a personalised multi-day travel itinerary using Claude AI.  
Falls back to detailed demo plans when `ANTHROPIC_API_KEY` is not set.

**Body:**
```json
{
  "prompt": "Plan a 5-day beach trip to Zanzibar under R20,000",
  "origin": "CPT",
  "budget": "20000",
  "duration": "5"
}
```

**Response `200`:**
```json
{
  "plan": {
    "destination": "Zanzibar, Tanzania",
    "duration": "5 days",
    "totalBudget": "R18,000–R22,000",
    "summary": "...",
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival & Stone Town",
        "activities": ["Fly CPT→ZNZ", "Check into hotel", "Evening walk"],
        "accommodation": "Stone Town Heritage Hotel",
        "estimatedCost": 3200
      }
    ],
    "flights": [...],
    "tips": ["Book snorkelling in advance", "Carry cash"],
    "bestTimeToVisit": "June–October",
    "requiredDocuments": ["Valid passport", "Yellow fever certificate"]
  },
  "source": "ai" | "demo"
}
```

---

## Payments

### POST `/payments/create-intent` 🔒
Create a Stripe PaymentIntent for a pending booking.

**Body:**
```json
{ "bookingId": "<booking_id>" }
```

**Response `200`:**
```json
{ "clientSecret": "pi_xxx_secret_xxx", "bookingReference": "JBX4K2F9AB", "amount": 8500 }
```

---

### POST `/payments/confirm` 🔒
Confirm payment after Stripe processes it.

**Body:**
```json
{ "bookingId": "<booking_id>", "paymentIntentId": "pi_xxx" }
```

---

### POST `/payments/webhook`
Stripe webhook handler. Verifies signature and updates booking on `payment_intent.succeeded`.

---

## Location Search

### GET `/locations/search`
Search airports and cities via Travelpayouts autocomplete.

**Query params:**

| Param | Required | Example |
|---|---|---|
| `q` | ✅ | `cape town` |

**Response `200`:**
```json
[
  { "city": "Cape Town", "country": "South Africa", "airport": "Cape Town International", "code": "CPT", "type": "airport" },
  { "city": "Cape Town", "country": "South Africa", "airport": "Cape Town CBD Heliport", "code": "HEL", "type": "airport" }
]
```

---

## Health

### GET `/health`
Server and database status check.

**Response `200`:**
```json
{ "status": "success", "message": "JourneyBook API v2 running", "environment": "production", "database": "connected", "timestamp": "2026-03-18T..." }
```

---

## Error format

All errors follow this shape:
```json
{ "error": "Human-readable message" }
```

Validation errors:
```json
{ "error": "Validation failed", "details": [{ "msg": "Valid email is required", "path": "email" }] }
```

## Rate limiting

All `/api/*` routes are rate limited: **100 requests per 15 minutes** per IP.  
Configurable via `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS` in `.env`.
