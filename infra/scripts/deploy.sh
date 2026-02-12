#!/bin/bash
# GreenLoop Production Deployment
# Builds and starts all services via Docker Compose

set -e

echo "Deploying GreenLoop platform..."

cd "$(dirname "$0")/../docker"

# Build all images
docker compose build

# Run database migrations
docker compose run --rm backend npx prisma migrate deploy

# Start all services
docker compose up -d

echo ""
echo "GreenLoop deployed successfully!"
echo "  Frontend:    http://localhost:3000"
echo "  Backend API: http://localhost:4000"
echo "  CV Service:  http://localhost:5000"
echo "  IoT Gateway: http://localhost:4100"
