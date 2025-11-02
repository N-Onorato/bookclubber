FROM node:24-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Next.js application (don't access /app/data during build - volume not mounted yet)
RUN npm run build

# Remove dev dependencies to reduce image size
# Keep tsx and cross-env for migrations at runtime
RUN npm prune --production && \
    npm install --no-save tsx cross-env @cytoplum/numtwo && \
    npm cache clean --force

# Copy startup script
COPY scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next /app/start.sh

# Don't switch to nextjs user yet - Railway needs to mount volume first
# The startup script will handle directory creation with proper permissions

EXPOSE 3000

# Use startup script that handles database initialization at runtime
CMD ["/app/start.sh"]