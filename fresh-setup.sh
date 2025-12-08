#!/bin/bash

# Complete Fresh Setup with SQLite
# One command to rule them all!

set -e

echo "🚀 Starting Fresh KPI Setup with SQLite..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Stop and clean everything
echo "🛑 Stopping all containers..."
docker-compose down -v 2>/dev/null || true

# Remove old data
echo "🗑️  Cleaning old data..."
rm -f database/database.sqlite
rm -f .env

# Create .env with SQLite
echo "📝 Creating .env file..."
cat > .env << 'EOF'
APP_NAME=KPI
APP_ENV=production
APP_KEY=base64:z3PDtrWkgngQRT8w5y6N8gBBt6BBB40rrxdhXx7draM=
APP_DEBUG=true
APP_URL=http://136.114.13.97

LOG_CHANNEL=stderr
LOG_LEVEL=debug

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/html/database/database.sqlite

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

VITE_APP_NAME=KPI
EOF

# Create SQLite database
echo "💾 Creating SQLite database..."
mkdir -p database
touch database/database.sqlite
chmod 777 database/database.sqlite

# Update docker-compose to use port 80
echo "🔧 Configuring port 80..."
sed -i 's/"8000:8080"/"80:8080"/' docker-compose.yml 2>/dev/null || sed -i '' 's/"8000:8080"/"80:8080"/' docker-compose.yml

# Build and start
echo "🏗️  Building containers..."
docker-compose build --no-cache

echo "🚀 Starting containers..."
docker-compose up -d

echo "⏳ Waiting for containers to be ready..."
sleep 20

# Run migrations
echo "📊 Running migrations..."
docker-compose exec -T app php artisan migrate --force

# Create admin user
echo "👤 Creating admin user..."
docker-compose exec -T app php artisan tinker --execute="
\$user = \App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@kpi.com',
    'password' => bcrypt('admin123'),
    'email_verified_at' => now(),
    'is_active' => true
]);
echo 'Admin user created successfully!';
" || echo "Admin user may already exist"

# Clear caches
echo "🧹 Clearing caches..."
docker-compose exec -T app php artisan config:clear
docker-compose exec -T app php artisan cache:clear
docker-compose exec -T app php artisan route:clear
docker-compose exec -T app php artisan view:clear

# Show status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Application URLs:"
echo "   http://136.114.13.97"
echo "   http://136.114.13.97:80"
echo ""
echo "👤 Login Credentials:"
echo "   Email: admin@kpi.com"
echo "   Password: admin123"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:    docker-compose logs -f app"
echo "   Restart:      docker-compose restart"
echo "   Stop:         docker-compose down"
echo "   Shell:        docker-compose exec app sh"
echo ""
echo "🎉 Happy coding!"
echo ""
