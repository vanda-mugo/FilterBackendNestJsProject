#!/bin/bash

# Database setup script for NestJS Filter Backend

echo " Setting up database for NestJS Filter Backend"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo " Docker is not running. Please start Docker first."
    exit 1
fi

# Start PostgreSQL container
echo " Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo " Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is ready
while ! docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo " Still waiting for PostgreSQL..."
    sleep 2
done

echo " PostgreSQL is ready!"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo " Installing dependencies..."
    npm install
fi

# Run migrations
echo " Running database migrations..."
npm run migration:run

# Run seeds
echo " Seeding database with sample data..."
npm run seed

echo ""
echo " Database setup complete!"
echo ""
echo " Your database now contains:"
echo "  - Users table with proper schema"
echo "  - Sample data for testing filters"
echo ""
echo " You can now start the application with:"
echo "  npm run start:dev"
echo ""
echo " Test the filter endpoints:"
echo "  GET  http://localhost:3000/users"
echo "  GET  http://localhost:3000/users/filter?filter=..."
echo "  POST http://localhost:3000/users/filter"
echo ""
