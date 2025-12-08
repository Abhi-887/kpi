# Docker Setup for KPI Laravel Application

## Quick Start

### Development Environment

1. **Start the application**:
   ```bash
   docker-compose up -d
   ```

2. **Access the application**:
   - Open browser: http://localhost:8000

3. **Stop the application**:
   ```bash
   docker-compose down
   ```

### First Time Setup

```bash
# Build and start containers
docker-compose up -d --build

# The setup runs automatically:
# - Copies .env.example to .env
# - Installs composer dependencies
# - Generates application key
# - Creates SQLite database
# - Runs migrations
# - Installs npm dependencies
# - Builds frontend assets
```

## Useful Commands

### Application Commands

```bash
# View logs
docker-compose logs -f app

# Run artisan commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan tinker

# Run tests
docker-compose exec app php artisan test

# Install new packages
docker-compose exec app composer require package/name
docker-compose exec app npm install package-name

# Clear cache
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
```

### Database Commands

```bash
# Run migrations
docker-compose exec app php artisan migrate

# Fresh migration with seeding
docker-compose exec app php artisan migrate:fresh --seed

# Access database (SQLite)
docker-compose exec app sqlite3 database/database.sqlite
```

### Queue Commands

```bash
# View queue logs
docker-compose logs -f queue

# Restart queue worker
docker-compose restart queue
```

## Production Deployment

### Using Docker Compose (Production)

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Start production containers
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Using Google Cloud Build

The application is configured for Google Cloud Build. The Dockerfile supports:

1. **Branch**: `^main$` (matches your current branch)
2. **Build Type**: Dockerfile
3. **Source Location**: `/Dockerfile`

#### Cloud Build Steps:

1. Connect your GitHub repository
2. Configure trigger for `main` branch
3. Set Dockerfile location to `/Dockerfile`
4. Deploy to Cloud Run or GKE

#### Environment Variables (Production):

Set these in Cloud Run/GKE:

```
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:your-generated-key
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=your-database
DB_USERNAME=your-username
DB_PASSWORD=your-password

CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
REDIS_HOST=your-redis-host
```

## Docker Services

### Development Services:
- **app**: Laravel application (port 8000)
- **queue**: Queue worker for background jobs
- **redis**: Redis cache server

### Production Services (docker-compose.prod.yml):
- **app**: Laravel application (optimized)
- **queue**: Queue worker
- **db**: MySQL 8.0 database
- **redis**: Redis cache
- **nginx**: Web server (ports 80/443)

## Troubleshooting

### Permission Issues
```bash
docker-compose exec app chmod -R 755 storage bootstrap/cache
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### Rebuild Containers
```bash
docker-compose down -v
docker-compose up -d --build
```

### Clear All Docker Data
```bash
docker-compose down -v --remove-orphans
docker system prune -a --volumes
```

### Frontend Not Updating
```bash
docker-compose exec app npm run build
```

## Performance Tips

1. **Use volumes for development** - Already configured
2. **Use Redis for cache** - Already configured
3. **Enable OPcache in production** - Built into PHP-FPM
4. **Use CDN for assets** - Configure in production
5. **Enable queue workers** - Already configured

## Security

- Don't commit `.env` file
- Change default passwords in production
- Use HTTPS in production (configure nginx SSL)
- Keep Docker images updated
- Run security scans regularly

## Support

For issues related to:
- Laravel: Check Laravel logs in `storage/logs`
- Docker: Run `docker-compose logs`
- Database: Check connection in `.env` file
