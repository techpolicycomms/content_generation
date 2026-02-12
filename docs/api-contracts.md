# GreenLoop API Contracts

Base URL: `http://localhost:4000/api`

## Authentication

### POST /auth/signup
```json
Request:  { "email": "...", "password": "...", "name": "..." }
Response: { "token": "jwt...", "user": { "id", "email", "name" } }
```

### POST /auth/login
```json
Request:  { "email": "...", "password": "..." }
Response: { "token": "jwt...", "user": { "id", "email", "name", "roles": [...] } }
```

### GET /auth/me (requires JWT)
```json
Response: { "id", "email", "name", "roles": [...] }
```

### GET /auth/google → Redirects to Google consent screen
### POST /auth/apple/callback → Handles Apple Sign-In callback

## Events

### GET /events?page=1&limit=20
### GET /events/:id
### POST /events (organiser+)
### PATCH /events/:id (organiser+)
### POST /events/:id/join
### DELETE /events/:id/leave

## Collection

### POST /collection/points (organiser+)
### GET /collection/points/event/:eventId
### POST /collection/readings
### GET /collection/readings/point/:pointId
### PATCH /collection/readings/:id/verify (organiser+)

## Inventory

### GET /inventory/batches (ops_manager+)
### POST /inventory/batches (ops_manager+)
### PATCH /inventory/batches/:id/status (ops_manager+)
### GET /inventory/items (ops_manager+)
### GET /inventory/items/:id (ops_manager+)
### POST /inventory/items (ops_manager+)
### PATCH /inventory/items/:id (ops_manager+)

## Orders

### GET /orders (ops_manager+)
### GET /orders/:id (ops_manager+)
### POST /orders (ops_manager+)
### PATCH /orders/:id/status (ops_manager+)

## Smart Bins

### GET /smartbins (ops_manager+)
### POST /smartbins (ops_manager+)
### GET /smartbins/device/:deviceId (ops_manager+)
### GET /smartbins/:id/events (ops_manager+)
### PATCH /smartbins/device/:deviceId/status (ops_manager+)
### POST /smartbins/webhook/bin-event (device API key auth)

## Reports

### GET /reports/impact (organiser+, city_official)
### GET /reports/impact/event/:eventId (organiser+, city_official)
### GET /reports/export/csv (city_official+)
### GET /reports/export/json (city_official+)

## CV Service (Internal)

Base URL: `http://localhost:5000`

### POST /analyze-image (multipart file upload)
### POST /analyze-url
```json
Request:  { "imageUrl": "..." }
Response: { "lanyardCount", "plasticCount", "metalCount", "glassCount", "otherCount", "cvConfidence" }
```
