# KPI - Laravel Application

Comprehensive logistics and supply chain management system.

## 🚀 One-Click Deployment (SSH)

### Remote Server Setup (VPS/Cloud):

```bash
curl -sSL https://raw.githubusercontent.com/Abhi-887/kpi/main/deploy.sh | bash
```

This will:
- ✅ Install Docker & Docker Compose (if needed)
- ✅ Clone the repository
- ✅ Setup environment
- ✅ Build containers
- ✅ Run migrations
- ✅ Start the application

**That's it!** Your app will be running at `http://your-server-ip:8000`

---

## 💻 Local Development

### Option 1: Quick Start (Recommended)

```bash
git clone https://github.com/Abhi-887/kpi.git
cd kpi
chmod +x quick-start.sh
./quick-start.sh
```

Access: http://localhost:8000

### Option 2: Manual Docker Setup

```bash
# Clone repository
git clone https://github.com/Abhi-887/kpi.git
cd kpi

# Start with Docker
docker-compose up -d

# Setup application
docker-compose exec app cp .env.example .env
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan migrate
```

### Option 3: Native Development (without Docker)

```bash
# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Create database
touch database/database.sqlite
php artisan migrate

# Start development
composer run dev
```

Access: http://localhost:8000

---

## 🐳 Docker Commands

```bash
# Start application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart
docker-compose restart

# Run artisan commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan test

# Access container shell
docker-compose exec app sh

# Rebuild containers
docker-compose up -d --build
```

---

## ☁️ Google Cloud Run Deployment

Your app is configured for Cloud Run! Just push to `main` branch.

**Manual deployment:**

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/kpi
gcloud run deploy kpi --image gcr.io/PROJECT_ID/kpi --platform managed --region europe-west1 --allow-unauthenticated
```

Set environment variables in Cloud Run console.

---

## 🛠️ Common Tasks

### Run Migrations
```bash
docker-compose exec app php artisan migrate
```

### Run Tests
```bash
docker-compose exec app php artisan test
```

### Clear Cache
```bash
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
```

### Access Tinker
```bash
docker-compose exec app php artisan tinker
```

### View Database
```bash
docker-compose exec app sqlite3 database/database.sqlite
```

---

## 📁 Project Structure

```
kpi/
├── app/                    # Application code
│   ├── Http/Controllers/  # Controllers
│   ├── Models/            # Eloquent models
│   ├── Services/          # Business logic
│   └── ...
├── database/              # Migrations, seeders, factories
├── resources/
│   ├── js/                # React/Inertia components
│   └── views/             # Blade templates
├── routes/                # Route definitions
├── tests/                 # Pest tests
├── docker-compose.yml     # Docker development setup
├── Dockerfile             # Production container
└── deploy.sh              # One-click deployment script
```

---

## 🔧 Environment Variables

Key variables for production:

```env
APP_KEY=base64:your-key
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=kpi
DB_USERNAME=your-user
DB_PASSWORD=your-password
```

---

## 📚 Technology Stack

- **Backend**: Laravel 12, PHP 8.4
- **Frontend**: React 19, Inertia.js v2, Tailwind CSS v4
- **Database**: MySQL/SQLite
- **Cache**: Redis
- **Testing**: Pest v4
- **Authentication**: Laravel Fortify
- **Deployment**: Docker, Google Cloud Run

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📝 License

MIT License

---

## 🆘 Troubleshooting

### Port 8000 already in use
```bash
# Stop other services
docker-compose down
# Or use different port
PORT=8001 docker-compose up -d
```

### Permission errors
```bash
docker-compose exec app chmod -R 777 storage bootstrap/cache
```

### Database errors
```bash
# Reset database
docker-compose exec app php artisan migrate:fresh --seed
```

### Clear everything and start fresh
```bash
docker-compose down -v
rm -rf database/database.sqlite
./quick-start.sh
```

---

## 📞 Support

For issues and questions, please open an issue on GitHub.

**Happy coding! 🚀**
