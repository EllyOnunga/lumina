#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Running migrations..."
node dist/migrate.cjs

echo "Starting application..."
node dist/index.cjs
