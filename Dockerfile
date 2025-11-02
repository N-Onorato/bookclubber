FROM node:24-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Create data directory with proper permissions for Railway volume
# Railway mounts volume at /app/data - this ensures subdirectories exist
RUN mkdir -p /app/data/covers && chmod -R 755 /app/data

# Build Next.js application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/data /app/.next
USER nextjs

EXPOSE 3000

# Note: Database initialization happens on first run via Railway volume
# Migrations run automatically when database doesn't exist
CMD ["npm", "start"]