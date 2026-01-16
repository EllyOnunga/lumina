#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Running migrations..."
node dist/migrate.cjs

if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  node dist/seed.cjs
fi

echo "Starting application..."
node dist/index.cjs
