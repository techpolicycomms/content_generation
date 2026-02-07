# GreenLoop Platform Architecture

## System Overview

GreenLoop is a circular economy platform for waste collection, recycling, and material recovery. It connects event organisers, volunteers, operations managers, city officials, and smart waste bins into a unified system.

## Service Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│  (Next.js)   │     │  (Express)   │     │   Database   │
│  Port 3000   │     │  Port 4000   │     │  Port 5432   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                    ┌───────┼────────┐
                    ▼                ▼
            ┌──────────────┐  ┌──────────────┐
            │  CV Service  │  │  IoT Gateway │
            │  (FastAPI)   │  │  (Node.js)   │
            │  Port 5000   │  │  Port 4100   │
            └──────────────┘  └──────┬───────┘
                                     │
                              ┌──────┴───────┐
                              │  Mosquitto   │
                              │    MQTT      │
                              │  Port 1883   │
                              └──────────────┘
```

## Data Flow

1. **User Authentication**: Users sign up/log in via local auth or OAuth (Google/Apple). JWT tokens are issued for session management.

2. **Event Management**: Organisers create events with GPS-located collection points. Volunteers join events and submit collection readings.

3. **CV Analysis**: Photos taken at collection points are sent to the CV service, which uses a trained YOLO model to count and classify waste items.

4. **Smart Bin Integration**: IoT-enabled bins publish sensor data (fill level, battery, classifications) via MQTT. The IoT gateway normalises and forwards events to the backend.

5. **Inventory & Orders**: Processed waste becomes inventory batches. Buyers can purchase recycled materials through the orders system.

6. **Reporting**: Impact data (kg diverted, contamination rates, revenue) is aggregated for dashboards and CSV/JSON exports for city partners.

## Role-Based Access Control (RBAC)

| Role           | Access                                               |
|----------------|------------------------------------------------------|
| volunteer      | Events, own collection readings                      |
| organiser      | Events (CRUD), collection, event-level reports       |
| ops_manager    | Inventory, orders, smart bins                        |
| city_official  | Reports, exports (read-only)                         |
| admin          | Full system access                                   |

## Security

- JWT-based authentication with middleware guards
- Role-based access enforced at the API layer
- Device API keys for smart bin authentication
- Environment variables for all secrets (never exposed to client)
- HTTPS required for geolocation and camera APIs
- Row-Level Security (RLS) ready for Supabase/PostgreSQL
