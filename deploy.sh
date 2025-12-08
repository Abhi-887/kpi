#!/bin/bash

# KPI Laravel Application - One-Click Deployment Script
# Usage: curl -sSL https://raw.githubusercontent.com/Abhi-887/kpi/main/deploy.sh | bash

set -e

echo "🚀 Starting KPI Application Deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker installed successfully${NC}"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Installing...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed successfully${NC}"
fi

# Clone or pull repository
APP_DIR="$HOME/kpi-app"
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}📂 Application directory exists. Pulling latest changes...${NC}"
    cd "$APP_DIR"
    git pull origin main
else
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    git clone https://github.com/Abhi-887/kpi.git "$APP_DIR"
    cd "$APP_DIR"
fi

echo -e "${GREEN}✅ Repository ready${NC}"

# Create .env file if not exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cp .env.example .env
    
    # Generate app key
    echo -e "${YELLOW}🔑 Generating application key...${NC}"
    docker-compose run --rm app php artisan key:generate
fi

# Create database directory if not exists
mkdir -p database
touch database/database.sqlite

echo -e "${GREEN}✅ Environment configured${NC}"

# Build and start containers
echo -e "${YELLOW}🏗️  Building Docker containers...${NC}"
docker-compose up -d --build

echo -e "${GREEN}✅ Containers started${NC}"

# Wait for containers to be ready
echo -e "${YELLOW}⏳ Waiting for containers to be ready...${NC}"
sleep 10

# Run migrations
echo -e "${YELLOW}📊 Running database migrations...${NC}"
docker-compose exec -T app php artisan migrate --force

# Clear caches
echo -e "${YELLOW}🧹 Clearing caches...${NC}"
docker-compose exec -T app php artisan config:clear
docker-compose exec -T app php artisan cache:clear
docker-compose exec -T app php artisan route:clear

# Show application status
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🌐 Application is running at:${NC}"
echo -e "${YELLOW}   http://localhost:8000${NC}"
echo ""
echo -e "${GREEN}📋 Useful Commands:${NC}"
echo -e "   View logs:        ${YELLOW}cd $APP_DIR && docker-compose logs -f${NC}"
echo -e "   Stop app:         ${YELLOW}cd $APP_DIR && docker-compose down${NC}"
echo -e "   Restart app:      ${YELLOW}cd $APP_DIR && docker-compose restart${NC}"
echo -e "   Run migrations:   ${YELLOW}cd $APP_DIR && docker-compose exec app php artisan migrate${NC}"
echo -e "   Access shell:     ${YELLOW}cd $APP_DIR && docker-compose exec app sh${NC}"
echo -e "   Run tests:        ${YELLOW}cd $APP_DIR && docker-compose exec app php artisan test${NC}"
echo ""
echo -e "${GREEN}🎉 Happy coding!${NC}"
echo ""
