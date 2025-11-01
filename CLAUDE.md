# Book Club Platform - Development Documentation

This file tracks important implementation details, commands, and file locations
for development with Claude.

# Auto-Documentation Note

**For Claude:** When making significant architectural changes or discovering
important patterns/gotchas, automatically update this CLAUDE.md file with:

1. Relevant implementation notes
2. Key files and their purposes
3. Important patterns or conventions discovered
4. Common mistakes to avoid (like the getInstance() issue)
5. Update the "Recent Updates" section with dated entries
6. **Important**: This file takes up context space. Limit it to ~350 lines and
   refactor as needed.

## Recent Updates (2025-11-01)

### Schema Alignment and Migration Fixes

Fixed multiple schema mismatch issues and established systematic approach to
prevent future issues.

#### Issues Identified and Fixed:

1. **Database path mismatch** - Migrations were applied to `bookclubber.db` but
   app was using `data/bookclub.db`
   - **Fix**: Created `.env.local` with `DATABASE_PATH=./bookclubber.db`

2. **Missing columns in suggestions table**
   - **Migration v3**: Added `reason` column for suggestion explanations
   - **Migration v4**: Added `updated_at` column with auto-update trigger

3. **Missing columns in books table**
   - **Migration v2**: Added generic `source` and `source_id` columns for
     external book tracking

#### New Documentation:

Created [SCHEMA_ALIGNMENT.md](SCHEMA_ALIGNMENT.md) with:

- Root cause analysis of schema mismatches
- Comprehensive checklist for creating migrations
- Guidelines for writing service layer code
- Database configuration best practices
- Quick reference commands
- Prevention strategies

#### Current Migration Status:

- ✅ v1: Initial schema (all tables)
- ✅ v2: Generic book source tracking
- ✅ v3: Suggestion reasons
- ✅ v4: Suggestion updated_at timestamp

**Important**: Always restart dev server after applying migrations!

### Book Suggestion System Implementation

Implemented complete book suggestion workflow with Open Library integration.

#### Key Components:

1. **Services**
   - **CycleService**
     ([lib/services/cycleService.ts](lib/services/cycleService.ts))
     - Create and manage suggestion/voting cycles
     - Track cycle phases (pending, suggestion, voting, completed)
     - Validate user suggestion eligibility
     - Update cycle status and set winning books

   - **SuggestionService**
     ([lib/services/suggestionService.ts](lib/services/suggestionService.ts))
     - Create, update, and delete book suggestions
     - Get suggestions by cycle or user
     - Check for duplicate suggestions
     - Fetch suggestions with book and user details

   - **BookService**
     ([lib/services/bookService.ts](lib/services/bookService.ts))
     - Search books via Open Library API
     - Fetch detailed book information
     - Create/update books in local database
     - Proper User-Agent header:
       `dataDumperBookClub/1.0 (n_onorato@outlook.com)`

2. **API Routes**
   - **Cycles**
     - `GET /api/cycles` - Get all cycles
     - `POST /api/cycles` - Create new cycle (admin only)
     - `GET /api/cycles/active` - Get currently active cycle
     - `GET /api/cycles/[id]` - Get specific cycle
     - `PATCH /api/cycles/[id]` - Update cycle status (admin only)

   - **Suggestions**
     - `POST /api/suggestions` - Create suggestion
     - `GET /api/suggestions?cycleId=xxx` - Get cycle suggestions
     - `PATCH /api/suggestions/[id]` - Update suggestion reason
     - `DELETE /api/suggestions/[id]` - Delete suggestion

   - **Books**
     - `GET /api/books/search?q=query` - Search Open Library
     - `POST /api/books` - Create book from Open Library data
     - `GET /api/books` - Get all books

3. **UI Pages**
   - **Dashboard** ([app/dashboard/page.tsx](app/dashboard/page.tsx))
     - Main hub with navigation to all features
     - Shows user role (admin/member)
     - Whimsical bookish design

   - **Admin Panel**
     ([app/dashboard/admin/page.tsx](app/dashboard/admin/page.tsx))
     - Create and manage cycles
     - Set cycle dates and max suggestions per user
     - Activate/complete cycles
     - View all cycles with status

   - **Suggestions Page**
     ([app/dashboard/suggestions/page.tsx](app/dashboard/suggestions/page.tsx))
     - View all suggestions for active cycle
     - Search and suggest books via Open Library
     - Add optional reasoning for suggestions
     - Track user's suggestion count vs limit
     - Beautiful book card grid layout

4. **Workflow**
   - Admin creates a cycle with suggestion and voting dates
   - Admin activates the cycle
   - Users search for books via Open Library integration
   - Users submit up to max suggestions per cycle
   - Books are automatically added to local database
   - All suggestions visible to all members
   - Phase automatically determined by current date vs cycle dates

### Authentication System Implementation

Implemented full authentication system with session-based auth using HTTP-only
cookies.

#### Key Changes Made:

1. **Authentication Service**
   ([lib/services/authService.ts](lib/services/authService.ts))
   - Uses `getDatabase()` from `lib/db/connection.ts` (NOT
     `DatabaseService.getInstance()`)
   - Implements bcrypt password hashing (10 rounds)
   - UUID-based session tokens with 30-day expiration
   - Session validation and cleanup methods

2. **API Routes**
   - `POST /api/auth/register` - User registration with validation
   - `POST /api/auth/login` - Authentication with session creation
   - `POST /api/auth/logout` - Session deletion and cleanup
   - `GET /api/auth/me` - Get current authenticated user

3. **Auth Helpers** ([lib/auth.ts](lib/auth.ts))
   - `getCurrentUser()` - Retrieve user from session cookie
   - `isAuthenticated()` - Check auth status
   - `requireAuth()` - Enforce authentication
   - `requireAdmin()` - Enforce admin role

4. **UI Implementation**
   - Whimsical bookish design theme applied to all auth pages
   - Dark candlelight aesthetic with Lora serif and Inter sans-serif fonts
   - Semi-transparent cards with backdrop blur effects
   - Literary quotes and decorative elements

## Recent Updates (2025-10-31)

### Database Schema Migration

Successfully migrated from initial MVP schema to comprehensive spec-compliant
schema.

#### Key Changes Made:

1. **Updated Technical Specification**
   ([book-club-technical-spec.md](book-club-technical-spec.md))
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
   - Added new types for Cycle, ReadingChunk, Meeting, BlockedAuthor, Theme,
     etc.
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

### Important: Database Connection Pattern

**CRITICAL:** When accessing the database in services, use `getDatabase()` from
`lib/db/connection.ts`:

```typescript
import { getDatabase } from "../db/connection";

// Correct usage:
const db = getDatabase();
const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
```

**DO NOT** use `DatabaseService.getInstance()` - this method does not exist. The
`DatabaseService` class only provides static helper methods (`get()`, `all()`,
`run()`, etc.).
