-- users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- books (cached from Open Library)
CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    open_library_id TEXT UNIQUE,
    isbn TEXT,
    title TEXT NOT NULL,
    authors TEXT, -- JSON string for simplicity
    publish_year INTEGER,
    page_count INTEGER,
    cover_url TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- book_suggestions
CREATE TABLE book_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER REFERENCES books(id),
    suggested_by INTEGER REFERENCES users(id),
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- book_selections (approved books for reading)
CREATE TABLE book_selections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER REFERENCES books(id),
    selected_by INTEGER REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'current', 'completed')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- reading_sessions (flexible breakdowns)
CREATE TABLE reading_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_selection_id INTEGER REFERENCES book_selections(id),
    session_number INTEGER NOT NULL,
    title TEXT NOT NULL, -- "Chapters 1-3", "Pages 1-50", etc.
    description TEXT,
    start_page INTEGER,
    end_page INTEGER,
    start_chapter TEXT,
    end_chapter TEXT,
    session_date DATE NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Simple voting (one vote per user per suggestion)
CREATE TABLE votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    suggestion_id INTEGER REFERENCES book_suggestions(id),
    user_id INTEGER REFERENCES users(id),
    vote_type TEXT CHECK (vote_type IN ('up', 'down')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(suggestion_id, user_id)
);

-- Basic indexes
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_suggestions_status ON book_suggestions(status);
CREATE INDEX idx_selections_status ON book_selections(status);