# Book Club Platform - Development Documentation

This file tracks important implementation details, commands, and file locations for development with Claude.

## Recent Updates (2025-10-31)

### Database Schema Migration

Successfully migrated from initial MVP schema to comprehensive spec-compliant schema.

#### Key Changes Made:

1. **Updated Technical Specification** ([book-club-technical-spec.md](book-club-technical-spec.md))
   - Changed from Prisma/Drizzle ORM to raw SQLite with custom service layer
   - Updated authentication from NextAuth.js/Clerk to custom session-based auth
   - Confirmed Tailwind CSS as styling solution
   - Updated environment variables to match implementation

2. **Database Schema Overhaul** ([lib/db/schema.sql](lib/db/schema.sql))
   - Changed from INTEGER autoincrement IDs to TEXT UUIDs
   - Changed from first_name/last_name to single name field
   - Added comprehensive tables:
     - `sessions` - User session management
     - `cycles` - Suggestion/voting period management
     - `suggestions` - Per-cycle book suggestions
     - `votes` - Per-cycle voting system
     - `reading_chunks` - Reading schedule breakdown
     - `meetings` - Meeting scheduling
     - `blocked_authors` - Author blocklist
     - `themes` - Theme wheel functionality
     - `rankings` - Tier list rankings (Phase 2)
     - `audit_log` - System audit trail
     - `events` - Event notification queue
   - Added comprehensive indexes for performance
   - Added triggers for auto-updating timestamps

3. **Migration System** ([migrations.yaml](migrations.yaml))
   - Using `@cytoplum/numtwo` for database migrations
   - Replaced initial migration with comprehensive schema
   - Migration is reversible with proper down migration

4. **Type Definitions** ([lib/types.ts](lib/types.ts))
   - Updated all interfaces to match new schema
   - Changed IDs from number to string (UUIDs)
   - Added new types for Cycle, ReadingChunk, Meeting, BlockedAuthor, Theme, etc.
   - Added extended types with relations
   - Added request/response types for API endpoints

5. **Database Service** ([lib/db/connection.ts](lib/db/connection.ts))
   - Added foreign key enforcement
   - Added transaction support method
   - Added cache clearing capability

6. **Database Initialization** ([lib/db/init.ts](lib/db/init.ts))
   - Updated to use UUIDs for user IDs
   - Updated to use single name field
   - Added foreign key enforcement

## Important Files

### Configuration
- `package.json` - npm scripts and dependencies
- `migrations.yaml` - Database migration definitions
- `tailwind.config.js` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration

### Database
- `lib/db/schema.sql` - Complete database schema (reference)
- `lib/db/connection.ts` - Database connection and service layer
- `lib/db/init.ts` - Database initialization script
- `lib/types.ts` - TypeScript type definitions

### Documentation
- `book-club-technical-spec.md` - Complete technical specification
- `book-club-product-spec.md` - Product requirements
- `README.md` - Setup and deployment instructions

## Common Commands

### Database Management

```bash
# Initialize/migrate database
npm run db:init

# Check migration status
npm run db:migrate:status

# Drop old database and reinitialize (DESTRUCTIVE)
rm -f bookclubber.db bookclubber.db-shm bookclubber.db-wal
npm run db:init

# Inspect database tables
sqlite3 bookclubber.db ".tables"

# View database schema
sqlite3 bookclubber.db ".schema"

# Query database
sqlite3 bookclubber.db "SELECT * FROM users;"
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Stop containers
docker-compose down
```

## Database Schema Overview

### Core Tables
- `users` - User accounts with UUID primary keys
- `sessions` - User authentication sessions
- `books` - Book metadata with series tracking and status
- `cycles` - Suggestion/voting period management
- `suggestions` - Book suggestions per cycle
- `votes` - Voting records per cycle
- `reading_chunks` - Reading schedule breakdown
- `meetings` - Meeting scheduling

### Feature Tables
- `blocked_authors` - Author blocklist
- `themes` - Theme wheel options

### Phase 2 Tables
- `rankings` - Tier list rankings (S/A/B/C/D/F)

### System Tables
- `audit_log` - Audit trail for all actions
- `events` - Event queue for notifications

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: SQLite with WAL mode
- **Database Layer**: Raw SQLite with custom service layer (better-sqlite3)
- **Migrations**: @cytoplum/numtwo
- **Authentication**: Custom session-based auth with HTTP-only cookies
- **State Management**: React Context + SWR (planned)
- **Styling**: Tailwind CSS
- **Password Hashing**: bcrypt
- **UUID Generation**: crypto.randomUUID()

## Environment Variables

```env
DATABASE_PATH="./bookclubber.db"
SESSION_SECRET="your-session-secret"
NODE_ENV="development"
```

## Default Admin User

After running `npm run db:init`, a default admin user is created:
- **Email**: admin@bookclub.com
- **Password**: admin123
- **Role**: admin

**⚠️ Important**: Change the default admin password after first login!

## Next Steps

1. Update existing API routes to work with new schema
2. Create auth service using new sessions table
3. Implement cycle management endpoints
4. Build out suggestion/voting workflow
5. Create reading schedule management
6. Implement meeting scheduling

## Notes for Future Development

- All tables use TEXT UUID primary keys (via `crypto.randomUUID()`)
- Foreign keys are enforced via `PRAGMA foreign_keys = ON`
- Soft deletes implemented via `deleted_at` column on books table
- Timestamps auto-update via triggers on users, books, meetings, rankings
- Indexes created for common query patterns
- Using migrations for schema versioning - never modify existing migrations
- Cache invalidation available via `DatabaseService.clearCache()`
- Transaction support via `DatabaseService.transaction()`
