#!/bin/bash

set -e

echo "Waiting for database connection..."
while ! mysqladmin ping --skip-ssl-verify-server-cert -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" --silent; do
    echo 'waiting for mysql...'
    sleep 1
done

echo "Database is up!"

# Generate app key only when missing
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force --no-interaction
fi

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Seed database only when productos table is empty
PRODUCT_COUNT=$(mysql --skip-ssl-verify-server-cert -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" -N -s "$DB_DATABASE" -e "SELECT COUNT(*) FROM productos;" 2>/dev/null || echo "0")
if [ "${PRODUCT_COUNT:-0}" -eq 0 ]; then
    echo "Seeding database..."
    php artisan db:seed --force --no-interaction
else
    echo "Seed data already present (${PRODUCT_COUNT} productos), skipping seeding."
fi

# Cache configuration
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Clear application cache
php artisan cache:clear

echo "Starting Laravel application..."
php artisan serve --host=0.0.0.0 --port=8000
