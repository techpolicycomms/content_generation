#!/bin/bash
# GreenLoop Development Environment Setup
# Run from the project root: bash infra/scripts/setup-dev.sh

set -e

echo "Setting up GreenLoop development environment..."

# Backend
echo "Installing backend dependencies..."
cd backend
cp .env.example .env
npm install
npx prisma generate
cd ..

# Frontend
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# IoT Gateway
echo "Installing IoT gateway dependencies..."
cd iot-gateway
cp .env.example .env
npm install
cd ..

# CV Service
echo "Setting up CV service..."
cd cv-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

echo ""
echo "Setup complete! Next steps:"
echo "  1. Start database: cd infra/docker && docker compose up postgres mosquitto -d"
echo "  2. Run migrations: cd backend && npx prisma migrate dev --name init"
echo "  3. Seed data:      cd backend && npm run seed"
echo "  4. Start backend:  cd backend && npm run dev"
echo "  5. Start frontend: cd frontend && npm run dev"
echo "  6. Start CV:       cd cv-service && source venv/bin/activate && uvicorn src.api.routes:app --port 5000 --reload"
echo "  7. Start IoT GW:   cd iot-gateway && npm run dev"
