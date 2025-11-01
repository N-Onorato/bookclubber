# Book Club Website Technical Specification

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: SQLite with WAL mode
- **Database Layer**: Raw SQLite with custom service layer
- **Authentication**: Custom session-based auth with HTTP-only cookies
- **State Management**: React Context + SWR or TanStack Query
- **Styling**: Tailwind CSS

---

## Page Structure

### Public Pages
```
/                                 # Landing/login page
/login                           # Authentication page
```

### Authenticated Pages
```
/dashboard                       # Current reading view, next meeting, quick actions
/books/suggest                   # Submit book suggestions (max 3)
/books/vote                      # Active voting page
/books/current                   # Detailed current book view with full schedule
/books/history                   # All past books read
/books/[id]                      # Individual book detail page

/meetings                        # Meeting schedule and management
/meetings/[id]                   # Individual meeting details

/hall-of-fame                    # Tier list rankings (Phase 2)
/stats                          # Analytics dashboard (Phase 2)

/admin                          # Admin dashboard
/admin/books                    # Manage all books, metadata
/admin/books/schedule           # Reading schedule creator/editor
/admin/members                  # Member management
/admin/settings                 # Club settings, author blocklist, themes
/admin/cycles                   # Manage suggestion/voting cycles
```

---

## Core Components

### Layout Components
```typescript
// app/components/layout/
AppShell.tsx                    // Main layout wrapper with nav
Navigation.tsx                  // Top nav or sidebar
Footer.tsx                      // Footer if needed
MobileNav.tsx                   // Mobile-specific navigation
```

### Book Components
```typescript
// app/components/books/
BookCard.tsx                    // Reusable book display (cover, title, author)
BookGrid.tsx                    // Grid layout for multiple books
BookMetadataForm.tsx            // Form for manual metadata entry/editing
BookSuggestionForm.tsx          // Suggestion submission with validations
BookVoteCard.tsx                // Book card with voting UI
SeriesWarningModal.tsx          // Warning dialog for series books
AuthorBlockedAlert.tsx          // Alert when blocked author detected
```

### Voting Components
```typescript
// app/components/voting/
VoteBallot.tsx                  // Main voting interface
VoteCounter.tsx                 // Visual vote allocation (3 tokens/checkboxes)
VoteResults.tsx                 // Results display component
VoteTimer.tsx                   // Countdown to voting deadline
```

### Schedule Components
```typescript
// app/components/schedule/
ReadingSchedule.tsx             // Full reading schedule display
ScheduleBuilder.tsx             // Admin tool for creating schedules
ChapterChunk.tsx                // Individual reading chunk display
ChapterDragList.tsx            // Drag-drop interface for admin
WeeklyAssignment.tsx           // Current week's reading display
```

### Meeting Components
```typescript
// app/components/meetings/
MeetingCard.tsx                 // Individual meeting display
MeetingCalendar.tsx            // Calendar view of meetings
MeetingScheduler.tsx           // Admin meeting creator/editor
NextMeetingWidget.tsx          // Dashboard widget for next meeting
```

### Admin Components
```typescript
// app/components/admin/
CycleManager.tsx               // Start/stop suggestion and voting periods
BlocklistManager.tsx           // Author blocklist CRUD
ThemeWheel.tsx                 // Theme selector/spinner
MemberRow.tsx                  // Member management row
BulkMetadataEditor.tsx        // Edit multiple books at once
```

### Shared Components
```typescript
// app/components/shared/
LoadingSpinner.tsx             // Loading states
ErrorBoundary.tsx              // Error handling wrapper
ConfirmDialog.tsx              // Reusable confirmation modal
Toast.tsx                      // Success/error notifications
CountdownTimer.tsx             // Reusable countdown component
ImageUpload.tsx                // Cover image upload/URL input
Pagination.tsx                 // List pagination
```

---

## Database Schema

### Core Tables

```sql
-- Users & Authentication
users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member', -- member, admin
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- Books
books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  cover_url TEXT,
  description TEXT,
  page_count INTEGER,
  publication_date DATE,
  
  -- Metadata
  is_series BOOLEAN DEFAULT FALSE,
  series_name TEXT,
  series_position INTEGER,
  
  -- Tracking
  suggested_by_user_id TEXT REFERENCES users(id),
  suggestion_cycle_id TEXT REFERENCES cycles(id),
  
  -- Status
  status TEXT DEFAULT 'suggested', -- suggested, voting, reading, completed
  completed_at DATETIME,
  
  -- System
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME -- soft delete
)

-- Suggestion/Voting Cycles
cycles (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- suggestion, voting
  theme TEXT, -- optional theme requirement
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  winner_book_id TEXT REFERENCES books(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- Book Suggestions (tracks per-cycle limits)
suggestions (
  id TEXT PRIMARY KEY,
  cycle_id TEXT REFERENCES cycles(id),
  user_id TEXT REFERENCES users(id),
  book_id TEXT REFERENCES books(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cycle_id, user_id, book_id)
)

-- Votes
votes (
  id TEXT PRIMARY KEY,
  cycle_id TEXT REFERENCES cycles(id),
  user_id TEXT REFERENCES users(id),
  book_id TEXT REFERENCES books(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cycle_id, user_id, book_id)
)

-- Reading Schedule
reading_chunks (
  id TEXT PRIMARY KEY,
  book_id TEXT REFERENCES books(id),
  chunk_number INTEGER NOT NULL,
  start_chapter TEXT,
  end_chapter TEXT,
  start_page INTEGER,
  end_page INTEGER,
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- Meetings
meetings (
  id TEXT PRIMARY KEY,
  reading_chunk_id TEXT REFERENCES reading_chunks(id),
  scheduled_at DATETIME NOT NULL,
  is_tentative BOOLEAN DEFAULT FALSE,
  is_skipped BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- Author Blocklist
blocked_authors (
  id TEXT PRIMARY KEY,
  author_name TEXT UNIQUE NOT NULL,
  reason TEXT,
  blocked_by_user_id TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- Themes for wheel
themes (
  id TEXT PRIMARY KEY,
  theme_text TEXT UNIQUE NOT NULL,
  used_count INTEGER DEFAULT 0,
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- Phase 2: Rankings
rankings (
  id TEXT PRIMARY KEY,
  book_id TEXT REFERENCES books(id),
  user_id TEXT REFERENCES users(id),
  tier TEXT NOT NULL, -- S, A, B, C, D, F
  ranking_session_id TEXT, -- for group ranking events
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(book_id, user_id, ranking_session_id)
)

-- System: Audit Log
audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  changes JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- System: Events (for future notifications)
events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSON,
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Indexes
```sql
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_suggested_by ON books(suggested_by_user_id);
CREATE INDEX idx_cycles_active ON cycles(is_active);
CREATE INDEX idx_votes_cycle_user ON votes(cycle_id, user_id);
CREATE INDEX idx_suggestions_cycle_user ON suggestions(cycle_id, user_id);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);
CREATE INDEX idx_events_unprocessed ON events(processed_at) WHERE processed_at IS NULL;
```

---

## API Routes

### Book APIs
```typescript
// app/api/books/
GET    /api/books                    // List all books (with filters)
GET    /api/books/current            // Get current reading book
GET    /api/books/[id]               // Get single book
POST   /api/books                    // Create book (validate blocklist, series)
PUT    /api/books/[id]               // Update book metadata
DELETE /api/books/[id]               // Soft delete book

// Suggestions
POST   /api/books/suggest            // Submit suggestion (enforce limits)
GET    /api/books/suggestions        // Get current suggestions

// External APIs
GET    /api/books/metadata?isbn=     // Fetch from Open Library/Google
POST   /api/books/validate-author    // Check blocklist
```

### Voting APIs
```typescript
GET    /api/cycles/current           // Get active cycle
POST   /api/cycles                   // Start new cycle (admin)
PUT    /api/cycles/[id]/end         // End cycle (admin)

POST   /api/votes                    // Cast votes (validate 3 max)
GET    /api/votes/results            // Get results (if ended)
GET    /api/votes/my-votes           // Get user's current votes
```

### Schedule APIs
```typescript
GET    /api/schedule/current         // Current reading schedule
POST   /api/schedule                 // Generate schedule (admin)
PUT    /api/schedule/[id]           // Update schedule chunk (admin)

GET    /api/schedule/export          // Discord-formatted export
```

### Meeting APIs
```typescript
GET    /api/meetings                 // List meetings
GET    /api/meetings/next            // Get next meeting
POST   /api/meetings                 // Create meeting (admin)
PUT    /api/meetings/[id]           // Update meeting (admin)
```

### Admin APIs
```typescript
// Members
GET    /api/admin/members            // List members
POST   /api/admin/members            // Add member
PUT    /api/admin/members/[id]      // Update member role
DELETE /api/admin/members/[id]      // Remove member

// Settings
GET    /api/admin/settings           // Get all settings
PUT    /api/admin/settings           // Update settings

// Blocklist
GET    /api/admin/blocklist          // Get blocked authors
POST   /api/admin/blocklist          // Add author
DELETE /api/admin/blocklist/[id]     // Remove author

// Themes
GET    /api/admin/themes             // Get all themes
POST   /api/admin/themes             // Add theme
PUT    /api/admin/themes/spin        // Record theme use
```

### User APIs
```typescript
GET    /api/users/me                 // Current user profile
GET    /api/users/[id]/stats        // User statistics
```

---

## State Management

### Global State (Context/Zustand)
```typescript
interface AppState {
  // User
  currentUser: User | null;
  
  // Current Reading
  currentBook: Book | null;
  currentChunk: ReadingChunk | null;
  nextMeeting: Meeting | null;
  
  // Active Cycles
  activeSuggestionCycle: Cycle | null;
  activeVotingCycle: Cycle | null;
  
  // UI State
  isLoading: boolean;
  notifications: Notification[];
}
```

### Local State (Component Level)
- Form state (react-hook-form)
- Pagination state
- Filter/sort preferences
- Modal open/close states

### Server State (SWR/TanStack Query)
```typescript
// Cached queries with smart invalidation
useBooks()                     // All books
useCurrentBook()               // Current reading
useMyVotes()                   // User's votes
useSuggestions()              // Current suggestions
useSchedule()                 // Reading schedule
useMeetings()                 // Meeting list
```

---

## Key Utilities

### Validation Functions
```typescript
// utils/validation.ts
validateBookSuggestion(book)   // Check series, author, release
validateVoteCount(votes)        // Ensure ≤3 votes
validateISBN(isbn)             // ISBN format check
detectSeries(title)            // Series detection logic
```

### Book Metadata
```typescript
// utils/bookMetadata.ts
fetchOpenLibrary(isbn)         // Open Library API
fetchGoogleBooks(isbn)         // Google Books API
mergeMetadata(sources[])       // Combine multiple sources
sanitizeMetadata(data)         // Clean API responses
```

### Schedule Generation
```typescript
// utils/schedule.ts
generateReadingChunks(book, weeks)     // Auto-split algorithm
calculatePagesPerWeek(chunks)          // Reading pace calc
exportToDiscord(schedule)              // Format for Discord
```

### Date Helpers
```typescript
// utils/dates.ts
getNextWednesday()             // Default meeting day
skipWeek(date)                // Add skip week
formatMeetingDate(date)        // User-friendly format
calculateDaysUntil(date)       // Countdown helper
```

---

## Authentication Flow

### User Roles
```typescript
enum UserRole {
  MEMBER = 'member',    // Can suggest, vote, view
  ADMIN = 'admin'       // Full access + admin panel
}
```

### Protected Routes
```typescript
// middleware.ts
const protectedRoutes = ['/dashboard', '/books', '/meetings'];
const adminRoutes = ['/admin'];

// Check auth and role before allowing access
```

### Session Management
```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  expires: string;
}
```

---

## Data Fetching Patterns

### Server Components (App Router)
```typescript
// Use for initial page loads
async function BooksPage() {
  const books = await dbService.getBooks();
  return <BookGrid books={books} />;
}
```

### Client Components with SWR
```typescript
// Use for dynamic data that changes
function VotingBallot() {
  const { data: votes, mutate } = useSWR('/api/votes/my-votes');
  
  const castVote = async (bookId) => {
    await fetch('/api/votes', { method: 'POST', body: { bookId } });
    mutate(); // Revalidate
  };
}
```

### Server Actions
```typescript
// app/actions/books.ts
async function createBook(data: FormData) {
  'use server';
  // Validate and create book
  revalidatePath('/books');
}
```

---

## Error Handling

### API Error Responses
```typescript
interface APIError {
  error: string;
  message: string;
  details?: any;
}

// Consistent error format
return NextResponse.json(
  { error: 'VALIDATION_ERROR', message: 'Author is blocked' },
  { status: 400 }
);
```

### Client Error Boundaries
```typescript
// Wrap components that might fail
<ErrorBoundary fallback={<ErrorMessage />}>
  <BookMetadataForm />
</ErrorBoundary>
```

---

## Performance Considerations

### Database Optimization
- Use indexes for common queries
- Implement pagination for lists
- Cache expensive calculations
- Use soft deletes for recovery

### React Optimization
- Memo expensive components
- Virtual scrolling for long lists
- Lazy load images
- Code split admin routes

### API Optimization
- Rate limiting on external API calls
- Response caching where appropriate
- Batch database operations
- Use database transactions for multi-step operations

---

## Testing Strategy

### Unit Tests
- Validation functions
- Schedule generation algorithm
- Date calculations
- Metadata merging

### Integration Tests
- API endpoints
- Database operations
- Authentication flow
- Vote counting

### E2E Tests (Critical Paths)
- Complete suggestion → vote → selection flow
- Admin book management
- Schedule creation and editing
- Member registration

---

## Deployment Considerations

### Environment Variables
```env
DATABASE_PATH="./data/bookclub.db"
SESSION_SECRET="your-session-secret"
NODE_ENV="development"
```

### SQLite Considerations
- Use WAL mode for better concurrency
- Regular backups (daily)
- Consider migration to PostgreSQL if scaling
- Place database file outside of deployment directory

### File Storage
- Book covers: Consider CDN or cloud storage
- Database backups: Automated daily backups
- Export files: Temporary storage with cleanup