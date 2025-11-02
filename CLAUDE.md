# Auto-Documentation Note

**For Claude:** When making significant changes, update this file with critical patterns and gotchas. Keep it under 200 lines.

## Critical Patterns & Gotchas

### Database Connection Pattern ⚠️

**ALWAYS** use `getDatabase()` from [lib/db/connection.ts](lib/db/connection.ts):

```typescript
import { getDatabase } from "../db/connection";
const db = getDatabase();
const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
```

**DO NOT** use `DatabaseService.getInstance()` - this method does not exist.

### Image Storage System

- **Storage**: `/app/data/covers/` (Railway) or `./data/covers/` (local)
- **Database**: `local_cover_path` + `original_cover_url` columns on books table
- **Service**: [lib/services/imageService.ts](lib/services/imageService.ts)
- **API**: `/api/covers/[filename]` serves cached images
- Images download once from Open Library, serve locally thereafter
- Configure via `DATA_DIR` env var

### Open Library Integration

- **User-Agent**: `dataDumperBookClub/1.0 (n_onorato@outlook.com)` (required)
- **Service**: [lib/services/bookService.ts](lib/services/bookService.ts)
- Books auto-saved to local DB on first fetch

### Authentication

- Session-based auth with HTTP-only cookies
- bcrypt password hashing (10 rounds)
- 30-day session expiration
- **Service**: [lib/services/authService.ts](lib/services/authService.ts)
- **Helpers**: [lib/auth.ts](lib/auth.ts) - `getCurrentUser()`, `requireAuth()`, `requireAdmin()`

## Key Files

- [lib/db/connection.ts](lib/db/connection.ts) - Database connection (use `getDatabase()`)
- [lib/db/schema.sql](lib/db/schema.sql) - Schema reference
- [lib/types.ts](lib/types.ts) - TypeScript definitions
- [migrations.yaml](migrations.yaml) - Migration definitions
- [lib/services/*](lib/services/) - Business logic layer

## Common Commands

```bash
# Database
npm run db:init      # Run migrations + seed admin user
npm run db:seed      # Add sample data (dev only)
npm run db:migrate   # Run migrations only

# Development
npm run dev          # Start dev server
npm run build        # Build for production

# SQLite inspection
sqlite3 bookclubber.db ".tables"
sqlite3 bookclubber.db ".schema"
```

## Database Schema

**Core**: users (UUID PKs), sessions, books (with `local_cover_path`), cycles, suggestions, votes, reading_chunks, meetings

**Feature**: blocked_authors, themes, rankings (Phase 2)

**System**: audit_log, events

All tables use UUID primary keys. Foreign keys enforced. Soft deletes on books. Auto-update triggers on timestamps. Never modify existing migrations.

## Tech Stack

- **Framework**: Next.js 14 App Router + TypeScript
- **Database**: SQLite (WAL mode) + better-sqlite3 + @cytoplum/numtwo migrations
- **Auth**: Session-based with HTTP-only cookies + bcrypt
- **Styling**: Tailwind CSS

## Environment Variables

```env
DATABASE_PATH="./bookclubber.db"
SESSION_SECRET="your-secret-here"
DATA_DIR="./data"              # Optional, defaults to ./data
NODE_ENV="development"
```

## Default Admin

After `npm run db:init`:
- Email: `admin@bookclub.com`
- Password: `admin123`
