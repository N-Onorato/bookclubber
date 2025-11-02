# Railway Deployment Guide

## Required Environment Variables

Set these in your Railway project:

```
DATABASE_PATH=/app/data/bookclub.db
DATA_DIR=/app/data
SESSION_SECRET=your-secure-random-secret-here
NODE_ENV=production
```

## Volume Configuration

1. In Railway, attach a volume to your service
2. Mount path: `/app/data`
3. This volume will persist:
   - Database file (`/app/data/bookclub.db`)
   - Book cover images (`/app/data/covers/`)

## How It Works

1. **Build Phase**: Docker builds the application (no database access)
2. **Runtime**: Startup script (`/app/start.sh`) runs:
   - Creates `/app/data/covers` directory
   - Checks if database exists
   - If new: Runs migrations + seeds admin user
   - If existing: Runs pending migrations
   - Starts Next.js server

## First Deployment

On first deploy, the database will be initialized with:
- **Email**: admin@bookclub.com
- **Password**: admin123
- **⚠️ IMPORTANT**: Change this password immediately after first login!

## Troubleshooting

### "Unable to open database"
- Verify `DATABASE_PATH=/app/data/bookclub.db` is set
- Verify volume is mounted at `/app/data`
- Check Railway logs for startup script output

### Images not persisting
- Verify `DATA_DIR=/app/data` is set
- Verify volume is properly attached

### Database resets on deploy
- Verify the volume is attached (not ephemeral storage)
- Volume data persists across deployments
