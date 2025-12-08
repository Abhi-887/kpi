# Multi-stage build for Laravel application
FROM php:8.4-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    sqlite \
    sqlite-dev \
    oniguruma-dev \
    nodejs \
    npm

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_sqlite pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application files
COPY . .

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Production stage
FROM base AS production

# Install dependencies
RUN composer install --optimize-autoloader --no-dev --no-interaction

# Install ALL npm dependencies (including dev) for build, then remove
RUN npm ci \
    && npm run build \
    && rm -rf node_modules

# Generate application key if not exists
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Expose port (Cloud Run uses PORT env variable, default 8080)
EXPOSE 8080

# Start application - Use PORT environment variable from Cloud Run
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}

# Development stage
FROM base AS development

# Install all dependencies including dev
RUN composer install --no-interaction

# Install all npm dependencies
RUN npm install

EXPOSE 8080

CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
