#!/bin/bash

set -e

echo "Waiting for database connection..."
while ! mysqladmin ping -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" --silent; do
    echo 'waiting for mysql...'
    sleep 1
done

echo "Database is up!"

# Generate app key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:+wPWg6K6KLq0p5zC/ZLl0rG0K6K6KLq0p5zC/ZLl0rG0=" ]; then
    echo "Generating application key..."
    php artisan key:generate
fi

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Seed database
echo "Seeding database..."
php artisan db:seed

# Cache configuration
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Clear and warm up cache
php artisan cache:clear
php artisan cache:warmup

echo "Starting Laravel application..."
php artisan serve --host=0.0.0.0 --port=8000
