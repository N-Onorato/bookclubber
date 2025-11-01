# BookClubber Database

This directory contains the database infrastructure for BookClubber, powered by [@cytoplum/numtwo](https://www.npmjs.com/package/@cytoplum/numtwo) - a framework-agnostic database management package.

## Database Schema

The BookClubber database consists of the following tables:

### Users
- `id` (TEXT PRIMARY KEY) - Unique user identifier
- `username` (TEXT UNIQUE) - Username for login
- `password_hash` (TEXT) - Hashed password
- `salt` (TEXT) - Password salt
- `role` (TEXT) - User role: 'admin' or 'member'
- `created_at` (TEXT) - Creation timestamp
- `updated_at` (TEXT) - Last update timestamp

### Books
- `id` (TEXT PRIMARY KEY) - Unique book identifier
- `title` (TEXT) - Book title
- `author` (TEXT) - Book author
- `isbn` (TEXT) - ISBN number (optional)
- `description` (TEXT) - Book description
- `suggested_by` (TEXT) - User ID who suggested the book
- `created_at` (TEXT) - Creation timestamp

### Themes
- `id` (TEXT PRIMARY KEY) - Unique theme identifier
- `name` (TEXT UNIQUE) - Theme name
- `description` (TEXT) - Theme description
- `created_at` (TEXT) - Creation timestamp

### Book Sessions
- `id` (TEXT PRIMARY KEY) - Unique session identifier
- `book_id` (TEXT) - Reference to books table
- `theme_id` (TEXT) - Reference to themes table (optional)
- `session_date` (TEXT) - Date of the book club session
- `status` (TEXT) - Status: 'upcoming', 'active', or 'completed'
- `notes` (TEXT) - Session notes
- `created_at` (TEXT) - Creation timestamp
- `updated_at` (TEXT) - Last update timestamp

### Votes
- `id` (TEXT PRIMARY KEY) - Unique vote identifier
- `user_id` (TEXT) - Reference to users table
- `book_id` (TEXT) - Reference to books table
- `session_id` (TEXT) - Reference to book_sessions table (optional)
- `vote_value` (INTEGER) - Vote value (1-5)
- `voted_at` (TEXT) - Timestamp of the vote

## Usage

### Running Migrations

```bash
# Initialize database and run all migrations
npm run db:init

# Run migrations manually
npm run db:migrate

# Check migration status
npm run db:migrate:status
```

### Programmatic Usage

```typescript
import { initializeDatabase } from './src/db/database';

// Initialize database with migrations
const dbManager = await initializeDatabase();

// Use the database
const users = dbManager.database
  .prepare('SELECT * FROM users WHERE role = ?')
  .all('member');

// Use transactions
dbManager.transaction(() => {
  const stmt = dbManager.database.prepare(
    'INSERT INTO users (id, username, password_hash, salt, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  stmt.run(id, username, passwordHash, salt, 'member', now, now);
});

// Close when done
dbManager.close();
```

### Testing

For testing, use an in-memory database:

```typescript
import { createTestDb } from './src/db/database';

const testDb = await createTestDb();
// Test your database operations
testDb.close();
```

## Environment Variables

- `DATABASE_PATH` - Path to database file (default: `./bookclubber.db`)
- `MIGRATIONS_PATH` - Path to migrations YAML file (default: `./migrations.yaml`)
- `DATABASE_MIGRATION_TARGET` - Migration target: version number, 'latest', or 'skip' (default: 'latest')

## Adding New Migrations

To add a new migration, edit [migrations.yaml](../../migrations.yaml):

```yaml
migrations:
  - version: 2
    name: "Add user email field"
    description: "Add email field to users table"
    reversible: true
    up: |
      ALTER TABLE users ADD COLUMN email TEXT;
    down: |
      ALTER TABLE users DROP COLUMN email;
```

Then run:

```bash
npm run db:migrate
```

## Best Practices

1. **Date Storage**: Always store dates as TEXT strings (timestamps) to avoid SQLite integer overflow
   ```typescript
   const now = Date.now().toString();
   ```

2. **Transactions**: Wrap multi-statement operations in transactions
   ```typescript
   dbManager.transaction(() => {
     // Multiple database operations
   });
   ```

3. **Migrations**:
   - Keep migrations small and focused
   - Always provide rollback scripts (`down`) when possible
   - Never skip version numbers
   - Test migrations on a database copy before production

4. **IDs**: Use nanoid for generating unique IDs
   ```typescript
   import { nanoid } from 'nanoid';
   const id = nanoid();
   ```

## File Structure

```
src/db/
├── README.md              # This file
├── database.ts            # Database initialization and helpers
└── schema.sql             # SQL schema definition

migrations.yaml            # Migration definitions (project root)
bookclubber.db            # SQLite database file (project root)
```

The database manager and migration system are provided by the [@cytoplum/numtwo](https://www.npmjs.com/package/@cytoplum/numtwo) npm package.
