#!/bin/bash

# KPI - Ultra Quick Start (Local Development)
# Just run: ./quick-start.sh

set -e

echo "⚡ KPI Quick Start..."

# Stop any running containers
docker-compose down 2>/dev/null || true

# Start fresh
docker-compose up -d --build

# Wait for app to be ready
sleep 5

# Setup application
docker-compose exec -T app sh -c "
    [ ! -f .env ] && cp .env.example .env
    touch database/database.sqlite
    php artisan key:generate
    php artisan migrate --force
    php artisan config:clear
"

echo ""
echo "✅ App is ready at: http://localhost:8000"
echo ""
echo "Commands:"
echo "  Stop:  docker-compose down"
echo "  Logs:  docker-compose logs -f"
echo "  Shell: docker-compose exec app sh"
echo ""
