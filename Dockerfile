# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build both client, server, and migration script
RUN npm run build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Copy the build output and migrations
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/start.sh ./start.sh

# Install only production dependencies
RUN npm ci --omit=dev

# Make start script executable
RUN chmod +x ./start.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Run the startup script which handles migrations and starts the app
CMD ["./start.sh"]
