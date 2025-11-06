# Auto-Documentation Note

**For Claude:** When making significant changes, update this file with critical
patterns and gotchas. Keep it under 300 lines.

## Learned Patterns (from recent work)

### Migration System ⚠️
- **Location**: [migrations.yaml](migrations.yaml) - YAML-based migration definitions
- **Tool**: `@cytoplum/numtwo` migration runner
- **Pattern**: Never modify existing migrations, always add new versions
- **CRITICAL**: ALWAYS run and verify new migrations with `npm run db:migrate` before considering the work complete
  - Check the migration actually ran (look for version number in output)
  - Verify schema changes with `sqlite3 bookclubber.db ".schema users"` (or relevant table)
  - Test that existing functionality still works (especially auth for user-related changes)
- **SQLite Gotchas**:
  - Booleans stored as INTEGER (0/1), type as `boolean` in TypeScript
  - No `DROP COLUMN`, must recreate table in `down` migrations
  - Foreign key `ON DELETE CASCADE` works but check existing constraints
  - WHERE clause in UPDATE might not match if DEFAULT hasn't been applied yet - use unconditional UPDATE for backfill

### Admin Panel Architecture
- **Location**: [app/dashboard/admin/](app/dashboard/admin/)
- **Pattern**: Component-based with separate files in `components/` directory
- **Protection**: All admin routes use `requireAdmin()` from [lib/auth.ts](lib/auth.ts)
- **API Routes**: Admin APIs live under `/api/admin/*` namespace

### Styling Patterns
- **Base palette**: Zinc colors (`#18181B`, `#27272A`, `#3F3F46`, `#52525B`)
- **Accents**: Purple (`#4F46E5`, `#A78BFA`, `#C4B5FD`) for primary actions
- **Gold**: `#D4AF37` for decorative elements
- **Pattern**: Glassmorphism with `backdrop-blur-lg` and semi-transparent backgrounds

## Critical Patterns & Gotchas

### Database Connection Pattern ⚠️

**ALWAYS** use `getDatabase()` from
[lib/db/connection.ts](lib/db/connection.ts):

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

### Authentication & User Approval ⚠️

- Session-based auth with HTTP-only cookies
- bcrypt password hashing (10 rounds)
- 30-day session expiration
- **Admin approval required**: New users must be approved by admins before login
  - Admins are auto-approved on creation
  - Members default to `approved = FALSE`
  - Login blocked for unapproved users (redirects to pending approval page)
  - `requireAuth()` checks both authentication AND approval status
- **Service**: [lib/services/authService.ts](lib/services/authService.ts)
  - `createUser()` - Sets `approved` based on role
  - `approveUser()` - Approves a pending user
  - `rejectUser()` - Deletes a pending user
  - `getPendingUsers()` - Gets unapproved users
- **Helpers**: [lib/auth.ts](lib/auth.ts) - `getCurrentUser()`, `requireAuth()`,
  `requireAdmin()`
- **Admin UI**: [app/dashboard/admin/components/UserManagement.tsx](app/dashboard/admin/components/UserManagement.tsx)
- **APIs**: `/api/admin/users/pending`, `/api/admin/users/[userId]/approve`, `/api/admin/users/[userId]/reject`

## Key Files

- [lib/db/connection.ts](lib/db/connection.ts) - Database connection (use
  `getDatabase()`)
- [lib/db/schema.sql](lib/db/schema.sql) - Schema reference
- [lib/types.ts](lib/types.ts) - TypeScript definitions
- [migrations.yaml](migrations.yaml) - Migration definitions
- [lib/services/*](lib/services/) - Business logic layer

### Documentation

- [book-club-product-spec.md](book-club-product-spec.md) - The product vision
- [book-club-style-spec.md](book-club-style-spec.md) - The brand and style
  philosophy
- [book-club-technical-spec.md](book-club-technical-spec.md) - Technical details
  for the product.

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

### Cycles & Phases Architecture ⚠️

**IMPORTANT**: The system uses a two-level hierarchy:

- **Cycles**: Top-level entities representing a complete book selection process (e.g., "Spring 2024 Cycle")
- **Phases**: Stages within a cycle (e.g., suggestion phase, then voting phase)

**Tables**:
- `cycles` - Top-level (has `name`, `theme`, `winner_book_id`, `status`)
- `phases` - Linked to cycles via `cycle_id` (has `type`, `starts_at`, `ends_at`, `max_suggestions_per_user`, `max_votes_per_user`)
- `suggestions` - Linked to phases via `phase_id`
- `votes` - Linked to phases via `phase_id`

**Cycle Status** (`active` | `completed` | `archived`):
- Only ONE cycle can be `active` at a time
- Creating a new cycle fails if another cycle is `active` (must mark as `completed` or `archived` first)
- `archived` cycles are hidden from default listings (dates remain in DB)
- Use `getAllCycles(true)` to include archived cycles
- **IMPORTANT**: Marking a cycle as `completed` or `archived` automatically deactivates ALL its phases
- Phase queries (`getActiveSuggestionPhase`, etc.) check BOTH date range AND parent cycle status = 'active'

**Services**:
- [lib/services/cycleService.ts](lib/services/cycleServiceNew.ts) - Manage cycles
- [lib/services/phaseService.ts](lib/services/phaseService.ts) - Manage phases
- Use `PhaseService.getSuggestionPhaseForVoting()` to link voting phase to its suggestions

**Core Tables**: users (UUID PKs), sessions, books (with `local_cover_path`), cycles, phases,
suggestions, votes, reading_chunks, meetings

**Feature**: blocked_authors, themes, rankings (Phase 2)

**System**: audit_log, events

All tables use UUID primary keys. Foreign keys enforced. Soft deletes on books.
Auto-update triggers on timestamps. Never modify existing migrations.

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
