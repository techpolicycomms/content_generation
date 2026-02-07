# GreenLoop Platform

A full-stack circular economy platform that manages waste collection events, recycles materials into sellable inventory, and connects volunteers, organisers, operations teams, city officials and IoT-enabled smart bins under one roof.

## Why GreenLoop?

Waste diversion at festivals, campuses and city-wide events is still tracked on paper or disconnected spreadsheets. GreenLoop replaces that with a single system where:

- Volunteers photograph collected waste and an AI model counts lanyards, plastic, metal and glass automatically.
- Organisers create events, drop GPS-pinned collection points on a map, and monitor progress in real time.
- Operations managers turn sorted waste into tracked inventory batches and fulfil purchase orders.
- City officials pull impact reports (kg diverted, contamination rates, revenue) as CSV or JSON exports.
- Smart bins report fill levels over MQTT so crews know exactly when and where to collect.

## Architecture

```
                          ┌─────────────────┐
                          │    Frontend      │
                          │   Next.js :3000  │
                          └────────┬────────┘
                                   │ REST
                          ┌────────▼────────┐
                          │    Backend API   │
                          │  Express  :4000  │
                          └──┬──────────┬───┘
                             │          │
                ┌────────────▼──┐   ┌───▼────────────┐
                │  CV Service   │   │   IoT Gateway   │
                │ FastAPI :5000 │   │  Node.js :4100  │
                └───────────────┘   └───────┬────────┘
                                            │ MQTT
                                    ┌───────▼────────┐
                                    │   Mosquitto    │
                                    │   MQTT :1883   │
                                    └────────────────┘
                          ┌─────────────────┐
                          │   PostgreSQL     │
                          │     :5432        │
                          └─────────────────┘
```

## Project Structure

```
greenloop-platform/
├── backend/               46 files  Express + TypeScript + Prisma
│   ├── prisma/schema.prisma         12 database models
│   ├── src/config/                  env, db connection, OAuth config
│   ├── src/modules/
│   │   ├── auth/                    signup, login, JWT, Google & Apple OAuth
│   │   ├── users/                   CRUD, repository pattern
│   │   ├── roles/                   5-role RBAC, permission matrix
│   │   ├── events/                  event lifecycle, participants
│   │   ├── collection/              GPS collection points, CV readings
│   │   ├── inventory/               batches, SKU-tracked items
│   │   ├── orders/                  purchase / sale workflow
│   │   ├── smartbins/               device registry, webhook ingestion
│   │   └── reporting/               impact aggregation, CSV/JSON export
│   ├── src/middleware/              auth-guard, role-guard, error-handler
│   └── src/database/seed/          demo data for development
│
├── frontend/              22 files  Next.js + React + Tailwind CSS
│   ├── src/pages/                   dashboard, events, collection, inventory, admin
│   ├── src/components/              sidebar, topbar, OAuth buttons, GPS picker,
│   │                                photo capture, charts
│   └── src/lib/                     API client, auth helpers, RBAC map
│
├── cv-service/             8 files  FastAPI + YOLO / PyTorch
│   └── src/                         /analyze-image endpoint, inference engine,
│                                    image preprocessing, mock fallback
│
├── iot-gateway/            7 files  Node.js + MQTT
│   └── src/                         MQTT subscriber, HTTP listener, event forwarding
│
├── infra/                  4 files  Docker Compose, Mosquitto config,
│   ├── docker/                      setup-dev & deploy scripts
│   └── scripts/
│
└── docs/                   2 files  architecture diagram, full API contract reference
```

**89 source files total across 6 subsystems.**

## Data Model (Prisma / PostgreSQL)

| Model              | Purpose                                      |
|--------------------|----------------------------------------------|
| User               | Accounts (local + OAuth), profile info       |
| UserRole           | Many-to-many role assignments                |
| Event              | Waste collection events with GPS coordinates |
| EventParticipant   | Volunteer / lead / observer join records     |
| CollectionPoint    | Physical sorting stations at an event        |
| CollectionReading  | CV-analysed or manual waste counts per point |
| Batch              | Processed material batches (type, weight)    |
| InventoryItem      | SKU-tracked sellable items from batches      |
| Order              | Buyer purchase records                       |
| OrderItem          | Line items linking orders to inventory       |
| SmartBin           | IoT bin registry (device ID, GPS, fill %)    |
| SmartBinEvent      | Timestamped sensor payloads from bins        |

## Role-Based Access Control

| Role            | Can access                                                          |
|-----------------|---------------------------------------------------------------------|
| `volunteer`     | View events, join events, submit collection readings                |
| `organiser`     | Everything a volunteer can + create/manage events, view reports     |
| `ops_manager`   | Inventory, batches, orders, smart bin management                    |
| `city_official` | Impact reports and CSV/JSON data exports (read-only)                |
| `admin`         | Full system access including user management and role assignment    |

Access is enforced at the API layer through `auth-guard` (JWT verification) and `role-guard` (role check) middleware. The frontend sidebar hides menu items the user's role cannot reach.

## API Overview

All endpoints are documented in detail in [`docs/api-contracts.md`](docs/api-contracts.md).

| Area           | Endpoints                                       | Auth       |
|----------------|------------------------------------------------|------------|
| Auth           | `POST /signup`, `/login`, `GET /me`, OAuth     | Public     |
| Users          | `GET /`, `PATCH /:id`, `DELETE /:id`           | Admin      |
| Events         | CRUD + `/join`, `/leave`                       | JWT        |
| Collection     | Points CRUD, readings submit/verify            | JWT        |
| Inventory      | Batches + items CRUD                           | Ops Mgr    |
| Orders         | CRUD + status updates                          | Ops Mgr    |
| Smart Bins     | Registry, status, event log, webhook ingest    | Ops Mgr    |
| Reports        | Impact dashboard, event drill-down, CSV/JSON   | Organiser+ |

## Getting Started

### Prerequisites

| Tool               | Version | Required for          |
|--------------------|---------|-----------------------|
| Node.js            | 20+     | Backend, frontend, IoT|
| Python             | 3.11+   | CV service            |
| Docker + Compose   | Latest  | All-in-one startup    |
| PostgreSQL         | 16      | Only if not using Docker |

### Option A: Docker Compose (recommended)

```bash
# Clone and enter the repo
git clone https://github.com/techpolicycomms/content_generation.git
cd content_generation

# Start all services
cd infra/docker
docker compose up --build

# In a new terminal, run migrations and seed demo data
docker compose run --rm backend npx prisma migrate dev --name init
docker compose run --rm backend npm run seed
```

Open `http://localhost:3000` in your browser.

### Option B: Run services individually

```bash
# 1. Start Postgres and Mosquitto via Docker
cd infra/docker && docker compose up postgres mosquitto -d && cd ../..

# 2. Backend
cd backend
cp .env.example .env          # edit DB credentials if needed
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev                    # http://localhost:4000

# 3. Frontend  (new terminal)
cd frontend
npm install
npm run dev                    # http://localhost:3000

# 4. CV Service  (new terminal, optional)
cd cv-service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn src.api.routes:app --port 5000 --reload

# 5. IoT Gateway  (new terminal, optional)
cd iot-gateway
cp .env.example .env
npm install
npm run dev                    # http://localhost:4100
```

### Option C: One-command dev setup

```bash
bash infra/scripts/setup-dev.sh
```

This installs all dependencies across every service and prints the remaining manual steps.

## Service URLs

| Service        | URL                           | Health check              |
|----------------|-------------------------------|---------------------------|
| Frontend       | http://localhost:3000          | Open in browser           |
| Backend API    | http://localhost:4000          | `GET /health`             |
| CV Service     | http://localhost:5000          | `GET /health`             |
| IoT Gateway    | http://localhost:4100          | `GET /health`             |
| PostgreSQL     | localhost:5432                 | `pg_isready`              |
| Mosquitto MQTT | localhost:1883 (TCP) / 9001 (WS) | MQTT client connect    |

## Demo Accounts

After running `npm run seed` in the backend:

| Email                    | Password       | Role       |
|--------------------------|----------------|------------|
| admin@greenloop.io       | admin123       | admin      |
| organiser@greenloop.io   | organiser123   | organiser  |
| volunteer@greenloop.io   | volunteer123   | volunteer  |

## Tech Stack

| Layer      | Technologies                                          |
|------------|-------------------------------------------------------|
| Frontend   | Next.js 14, React 18, TypeScript, Tailwind CSS        |
| Backend    | Express 4, TypeScript, Prisma ORM, PostgreSQL 16      |
| Auth       | JWT, bcrypt, Google OAuth 2.0, Apple Sign-In          |
| CV         | FastAPI, Python, Ultralytics YOLOv8, PyTorch, Pillow  |
| IoT        | Node.js, MQTT.js, Eclipse Mosquitto                   |
| Infra      | Docker Compose, Dockerfiles per service               |

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens verified on every protected route via `auth-guard` middleware
- Role-based access enforced via `role-guard` middleware
- Smart bins authenticate with per-device API keys
- All secrets stored in server-side environment variables (never prefixed with `NEXT_PUBLIC_`)
- Geolocation and camera APIs require HTTPS and user permission
- Prisma parameterised queries prevent SQL injection
- Row-Level Security (RLS) ready for Supabase/PostgreSQL deployments

## Deployment

### Railway (simplest cloud deploy)

1. Push your code to GitHub
2. Sign in to [railway.app](https://railway.app) with GitHub
3. Create a new project from your repo
4. Add a PostgreSQL plugin
5. Set the environment variables from `backend/.env.example`
6. Railway auto-detects `docker-compose.yml` and deploys all services

### Render / Fly.io

Deploy each service as a separate Docker web service pointing at the corresponding `Dockerfile`. Connect them via internal networking and attach a managed PostgreSQL instance.

### Vercel (frontend only)

1. Import the repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend/`
3. Add `NEXT_PUBLIC_API_URL` pointing to your deployed backend
4. Deploy - the backend still needs a separate host (Railway, Render, etc.)

## Documentation

- [Architecture & Data Flow](docs/architecture.md)
- [Full API Contracts](docs/api-contracts.md)

## License

See [LICENSE](LICENSE) for details.
