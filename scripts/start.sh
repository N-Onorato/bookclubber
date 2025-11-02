#!/bin/sh
set -e

echo "Starting Book Club application..."

# Ensure data directory and subdirectories exist
mkdir -p /app/data/covers
echo "Data directory ready at /app/data"

# Check if database exists
if [ ! -f "/app/data/bookclub.db" ]; then
    echo "Database not found. Initializing database (migrations + admin seed)..."
    npm run db:init
else
    echo "Database found. Running any pending migrations..."
    npm run db:migrate || echo "No pending migrations or migration failed"
fi

echo "Starting Next.js server..."
exec npm start
