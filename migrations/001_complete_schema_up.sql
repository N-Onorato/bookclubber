-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users & Authentication
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  approved BOOLEAN DEFAULT FALSE,
  approved_at DATETIME,
  approved_by_user_id TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cycles (top-level entity)
CREATE TABLE cycles (
  id TEXT PRIMARY KEY,
  name TEXT,
  theme TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  winner_book_id TEXT REFERENCES books(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Phases (linked to cycles)
CREATE TABLE phases (
  id TEXT PRIMARY KEY,
  cycle_id TEXT REFERENCES cycles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('suggestion', 'voting', 'reading')),
  theme TEXT,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  winner_book_id TEXT REFERENCES books(id),
  max_suggestions_per_user INTEGER DEFAULT 3,
  max_votes_per_user INTEGER DEFAULT 3,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Books
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  isbn_10 TEXT,
  isbn_13 TEXT,
  cover_url TEXT,
  local_cover_path TEXT,
  original_cover_url TEXT,
  description TEXT,
  page_count INTEGER,
  publication_date DATE,
  publisher TEXT,
  language TEXT,
  categories TEXT,
  google_books_id TEXT,

  -- Metadata
  is_series BOOLEAN DEFAULT FALSE,
  series_name TEXT,
  series_position INTEGER,

  -- Tracking
  suggested_by_user_id TEXT REFERENCES users(id),
  suggestion_phase_id TEXT REFERENCES phases(id),

  -- Status
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'voting', 'reading', 'completed')),
  completed_at DATETIME,

  -- External source tracking
  source TEXT,
  source_id TEXT,

  -- System
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

-- Book Suggestions
CREATE TABLE suggestions (
  id TEXT PRIMARY KEY,
  phase_id TEXT NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(phase_id, user_id, book_id)
);

-- Votes
CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  phase_id TEXT NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(phase_id, user_id, book_id)
);

-- Reading Schedule
CREATE TABLE reading_chunks (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chunk_number INTEGER NOT NULL,
  start_chapter TEXT,
  end_chapter TEXT,
  start_page INTEGER,
  end_page INTEGER,
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Meetings
CREATE TABLE meetings (
  id TEXT PRIMARY KEY,
  reading_chunk_id TEXT REFERENCES reading_chunks(id) ON DELETE SET NULL,
  scheduled_at DATETIME NOT NULL,
  is_tentative BOOLEAN DEFAULT FALSE,
  is_skipped BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reading Sections & Notes
CREATE TABLE reading_sections (
  id TEXT PRIMARY KEY,
  cycle_id TEXT NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reading_section_notes (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES reading_sections(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Author Blocklist
CREATE TABLE blocked_authors (
  id TEXT PRIMARY KEY,
  author_name TEXT UNIQUE NOT NULL,
  reason TEXT,
  blocked_by_user_id TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Themes for wheel
CREATE TABLE themes (
  id TEXT PRIMARY KEY,
  theme_text TEXT UNIQUE NOT NULL,
  used_count INTEGER DEFAULT 0,
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rankings
CREATE TABLE rankings (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('S', 'A', 'B', 'C', 'D', 'F')),
  ranking_session_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(book_id, user_id, ranking_session_id)
);

-- ============================================================================
-- SYSTEM TABLES
-- ============================================================================

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  changes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data TEXT,
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users & Sessions
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_approved ON users(approved);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Books
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_suggested_by ON books(suggested_by_user_id);
CREATE INDEX idx_books_deleted ON books(deleted_at);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_source ON books(source, source_id);
CREATE INDEX idx_books_google_books_id ON books(google_books_id);

-- Cycles & Phases
CREATE INDEX idx_cycles_status ON cycles(status);
CREATE INDEX idx_phases_cycle ON phases(cycle_id);
CREATE INDEX idx_phases_type ON phases(type);
CREATE INDEX idx_phases_active ON phases(is_active);
CREATE INDEX idx_phases_dates ON phases(starts_at, ends_at);

-- Suggestions & Votes
CREATE INDEX idx_suggestions_phase_user ON suggestions(phase_id, user_id);
CREATE INDEX idx_suggestions_book ON suggestions(book_id);
CREATE INDEX idx_votes_phase_user ON votes(phase_id, user_id);
CREATE INDEX idx_votes_phase_book ON votes(phase_id, book_id);

-- Reading Chunks & Meetings
CREATE INDEX idx_chunks_book ON reading_chunks(book_id);
CREATE INDEX idx_chunks_due_date ON reading_chunks(due_date);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);
CREATE INDEX idx_meetings_chunk ON meetings(reading_chunk_id);

-- Reading Sections
CREATE INDEX idx_reading_sections_cycle ON reading_sections(cycle_id);
CREATE INDEX idx_reading_sections_order ON reading_sections(cycle_id, display_order);
CREATE INDEX idx_reading_section_notes_section ON reading_section_notes(section_id);
CREATE INDEX idx_reading_section_notes_user ON reading_section_notes(user_id);

-- Rankings
CREATE INDEX idx_rankings_book ON rankings(book_id);
CREATE INDEX idx_rankings_user ON rankings(user_id);

-- System
CREATE INDEX idx_events_unprocessed ON events(processed_at) WHERE processed_at IS NULL;
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_users_updated_at
  AFTER UPDATE ON users
  FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_cycles_updated_at
  AFTER UPDATE ON cycles
  FOR EACH ROW
BEGIN
  UPDATE cycles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_books_updated_at
  AFTER UPDATE ON books
  FOR EACH ROW
BEGIN
  UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_suggestions_updated_at
  AFTER UPDATE ON suggestions
  FOR EACH ROW
BEGIN
  UPDATE suggestions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_meetings_updated_at
  AFTER UPDATE ON meetings
  FOR EACH ROW
BEGIN
  UPDATE meetings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_reading_sections_updated_at
  AFTER UPDATE ON reading_sections
  FOR EACH ROW
BEGIN
  UPDATE reading_sections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_reading_section_notes_updated_at
  AFTER UPDATE ON reading_section_notes
  FOR EACH ROW
BEGIN
  UPDATE reading_section_notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_rankings_updated_at
  AFTER UPDATE ON rankings
  FOR EACH ROW
BEGIN
  UPDATE rankings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
