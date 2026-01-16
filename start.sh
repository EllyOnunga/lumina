#!/bin/sh

# Build the migration script if it wasn't already bundled, 
# but here we'll just use tsx to run it since it's already in the image 
# and node_modules are there in the build stage.
# However, in production stage we don't want tsx.
# So I should bundle the migration script too or just run it in the build stage.

# Better: Run migrations during container startup
echo "Running migrations..."
# We use node to run a bundled version or just use the production-ready script.
# Since we have node_modules, we can use tsx if we kept it, but we didn't in production.
# So I'll build the migration script in the builder stage.

node dist/migrate.cjs

echo "Starting application..."
node dist/index.cjs
