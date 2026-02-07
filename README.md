# GreenLoop Platform

Circular economy platform for waste collection, recycling, and material recovery. Connects event organisers, volunteers, operations managers, city officials, and smart waste bins.

## Project Structure

```
greenloop-platform/
├── frontend/          # Next.js UI (dashboards, forms, maps, CV upload)
├── backend/           # Express API (auth, RBAC, business logic, Prisma ORM)
├── cv-service/        # FastAPI microservice for waste image classification (YOLO)
├── iot-gateway/       # MQTT/HTTP bridge for smart bin hardware
├── infra/             # Docker Compose, deployment scripts
├── docs/              # Architecture diagrams, API contracts
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)

### Development Setup

```bash
# 1. Start infrastructure
cd infra/docker && docker compose up postgres mosquitto -d

# 2. Setup backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev

# 3. Setup frontend
cd frontend
npm install
npm run dev

# 4. Setup CV service (optional)
cd cv-service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn src.api.routes:app --port 5000 --reload

# 5. Setup IoT gateway (optional)
cd iot-gateway
cp .env.example .env
npm install && npm run dev
```

### Docker (all services)

```bash
cd infra/docker
docker compose up --build
```

| Service      | URL                    |
|-------------|------------------------|
| Frontend    | http://localhost:3000   |
| Backend API | http://localhost:4000   |
| CV Service  | http://localhost:5000   |
| IoT Gateway | http://localhost:4100   |

## Features

- **User Accounts** - Local signup, Google OAuth, Apple Sign-In
- **Role-Based Dashboards** - Volunteer, Organiser, Ops Manager, City Official, Admin
- **Event Management** - Create/join waste collection events with GPS-located collection points
- **Mobile Device Features** - Camera capture for CV analysis, geolocation for collection points
- **CV Waste Classification** - YOLO-based lanyard/plastic/metal/glass detection from photos
- **Inventory Management** - Track processed material batches and sellable inventory items
- **Order Processing** - Purchase/sale workflow for recycled materials
- **Smart Bin Integration** - MQTT/HTTP ingestion from Raspberry Pi and Arduino-based bins
- **Impact Reporting** - Aggregate metrics with CSV/JSON export for city partners

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | Next.js, React, TypeScript, Tailwind CSS      |
| Backend   | Express, TypeScript, Prisma, PostgreSQL        |
| CV        | FastAPI, Python, YOLO/PyTorch                  |
| IoT       | Node.js, MQTT (Mosquitto)                      |
| Infra     | Docker Compose, PostgreSQL, Mosquitto          |

## Demo Accounts (after seeding)

| Email                      | Password      | Role       |
|---------------------------|---------------|------------|
| admin@greenloop.io        | admin123      | admin      |
| organiser@greenloop.io    | organiser123  | organiser  |
| volunteer@greenloop.io    | volunteer123  | volunteer  |

## Documentation

- [Architecture](docs/architecture.md) - System design and data flow
- [API Contracts](docs/api-contracts.md) - Full endpoint reference
