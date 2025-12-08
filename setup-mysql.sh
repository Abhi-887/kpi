#!/bin/bash

# Quick MySQL Setup Script
# Run this on server after git pull

set -e

echo "🔧 Setting up MySQL configuration..."

# MySQL password
MYSQL_PASS="Rexwal@7008"

# Create .env file
cat > .env << EOF
APP_NAME=KPI
APP_ENV=production
APP_KEY=base64:z3PDtrWkgngQRT8w5y6N8gBBt6BBB40rrxdhXx7draM=
APP_DEBUG=true
APP_URL=http://136.114.13.97

LOG_CHANNEL=stderr
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=34.172.79.48
DB_PORT=3306
DB_DATABASE=kpi
DB_USERNAME=root
DB_PASSWORD=${MYSQL_PASS}

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

VITE_APP_NAME=KPI
EOF

echo "✅ .env file created"

# Rebuild and restart
echo "🏗️  Rebuilding containers..."
docker-compose down
docker-compose up -d --build

echo "⏳ Waiting for containers..."
sleep 15

# Test connection
echo "🔍 Testing MySQL connection..."
docker-compose exec -T app php artisan db:show

# Run migrations
echo "📊 Running migrations..."
docker-compose exec -T app php artisan migrate:fresh --force

# Clear cache
echo "🧹 Clearing caches..."
docker-compose exec -T app php artisan config:clear
docker-compose exec -T app php artisan cache:clear

echo ""
echo "✅ Setup complete!"
echo "🌐 Access: http://136.114.13.97:8000"
