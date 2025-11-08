# Book Club Platform

A web-based platform for managing a small book club (8 users max) with automated
book suggestions, voting, reading schedules, and member management. Built to
reduce administrative burden while enhancing the member experience.

## 📖 Product Vision

This platform automates the repetitive administrative tasks of running a book
club while preserving the social aspects that make book clubs great. It
eliminates manual Google Forms, spreadsheet tracking, and Discord channel setup,
reducing admin time from 45+ minutes per book cycle to under 5 minutes.

See [book-club-product-spec.md](book-club-product-spec.md) for complete product
requirements and roadmap.

## ✨ Feature Status

### Phase 1: MVP Features (In Progress)

#### ✅ Completed

- **Database Schema**: Complete schema with UUID-based tables for users, books,
  cycles, suggestions, votes, reading chunks, meetings, and more
- **Authentication Foundation**: Session-based auth infrastructure with bcrypt
  password hashing
- **Type Definitions**: Comprehensive TypeScript types for all entities and API
  requests

#### 🚧 In Development

- **Book Suggestion System**
  - [x] Max 3 suggestions per person per cycle
  - [x] Open Library API integration for metadata
  - [ ] Series detection and warnings
  - [ ] Author blocklist validation
  - [ ] Release date validation
  - [x] Optional theme mode

- **Voting Module**
  - [ ] 3 votes per member allocation
  - [ ] Hidden ballot system
  - [ ] Automatic winner declaration
  - [ ] Vote countdown timer

- **Reading Schedule Generator**
  - [ ] Intelligent chapter division algorithm
  - [ ] Admin manual adjustment interface
  - [ ] Drag-and-drop schedule editing
  - [ ] Discord export formatting

- **Meeting Scheduler**
  - [ ] Default Wednesday recurring meetings
  - [ ] Automatic skip week after selection
  - [ ] Flexible rescheduling
  - [ ] Tentative meeting marking

- **Current Reading Dashboard**
  - [ ] Current book display
  - [ ] Weekly reading assignment
  - [ ] Next meeting countdown
  - [ ] Progress tracking

### Phase 2: Enhancement Features (Planned)

- **Hall of Fame / Tier List System**: S/A/B/C/D/F rankings with livestream
  party support
- **Book History & Analytics**: Reading patterns, suggester statistics, genre
  distribution
- **Notification System**: Discord webhooks, email notifications, in-app alerts

### Phase 3: Scaling Features (Future)

- **Multi-Tenancy Support**: Allow other book clubs to use the platform
- **Data Export**: JSON, CSV, PDF exports of club history
- **Advanced Integrations**: Library systems, Goodreads, calendar apps

## 🛠 Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: SQLite with WAL mode
- **Database Layer**: Raw SQLite with custom service layer (better-sqlite3)
- **Migrations**: @cytoplum/numtwo
- **Authentication**: Custom session-based auth with HTTP-only cookies
- **Password Hashing**: bcrypt
- **Styling**: Tailwind CSS
- **API Integration**: Open Library API (planned), Google Books API (planned)
- **State Management**: React Context + SWR (planned)
- **Deployment**: Docker & Docker Compose ready

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Docker and Docker Compose (for containerized deployment)

## 🚀 Quick Start

### Local Development

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd bookclubber
   npm install
   ```

2. **Initialize Database**
   ```bash
   npm run db:init
   ```
   This creates the SQLite database with complete schema and default admin user:
   - Email: `admin@bookclub.com`
   - Password: `admin123`
   - ⚠️ **Important**: Change the default password after first login!

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

4. **Available Scripts**
   ```bash
   npm run dev                # Start development server
   npm run build              # Build for production
   npm run start              # Start production server
   npm run lint               # Run ESLint
   npm run type-check         # Run TypeScript checks
   npm run db:init            # Initialize/migrate database
   npm run db:migrate:status  # Check migration status
   ```

### Docker Deployment

1. **Build and Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Production Environment Variables** Update `docker-compose.yml` with secure
   values:
   ```yaml
   environment:
     - NODE_ENV=production
     - SESSION_SECRET=your-secure-session-secret-here
     - DATABASE_PATH=/app/data/bookclub.db
   ```

## 📁 Project Structure

```
bookclubber/
├── app/                          # Next.js App Router pages
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── books/              # Book management (planned)
│   │   ├── cycles/             # Cycle management (planned)
│   │   ├── votes/              # Voting system (planned)
│   │   └── meetings/           # Meeting scheduler (planned)
│   ├── (auth)/                 # Auth pages (login, register)
│   ├── dashboard/              # Protected dashboard pages
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # Reusable React components
│   └── ui/                     # UI components
├── lib/                        # Utility libraries
│   ├── db/                     # Database configuration
│   │   ├── connection.ts       # Database connection & service
│   │   ├── init.ts            # Database initialization
│   ├── services/              # Business logic services
│   │   └── authService.ts     # Authentication service
│   └── types.ts               # TypeScript type definitions
├── data/                       # SQLite database storage
├── migrations.yaml            # Database migration definitions
├── public/                    # Static assets
├── Dockerfile                 # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
├── book-club-product-spec.md # Product specification
├── book-club-technical-spec.md # Technical specification
├── CLAUDE.md                 # Development notes
└── package.json              # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
DATABASE_PATH=./bookclubber.db
SESSION_SECRET=your-local-session-secret
NODE_ENV=development
```

### Database Schema

The application uses SQLite with a comprehensive schema including:

**Core Tables:**

- `users` - User accounts with UUID primary keys
- `sessions` - User authentication sessions
- `books` - Book metadata with series tracking and status
- `cycles` - Suggestion/voting period management
- `suggestions` - Book suggestions per cycle (max 3 per user)
- `votes` - Voting records per cycle (max 3 per user)
- `reading_chunks` - Weekly reading schedule breakdown
- `meetings` - Meeting scheduling with flexibility

**Feature Tables:**

- `blocked_authors` - Author blocklist for ethical exclusions
- `themes` - Theme wheel options for suggestion rounds

**Phase 2 Tables:**

- `rankings` - Tier list rankings (S/A/B/C/D/F)

**System Tables:**

- `audit_log` - Audit trail for admin actions
- `events` - Event queue for future notifications

## 👥 User Roles & Permissions

### Member

- Submit up to 3 book suggestions per cycle
- Cast up to 3 votes during voting periods
- View all public club information
- Participate in tier rankings (Phase 2)

### Admin

- All member permissions
- Add/remove club members
- Edit book metadata and covers
- Adjust reading schedules
- Manage author blocklist
- Configure theme options
- Override series warnings
- Open/close suggestion and voting periods

## 🔒 Security Features

- Session-based authentication with HTTP-only cookies
- Password hashing with bcrypt (10 salt rounds)
- SQL injection protection with prepared statements
- Foreign key constraints enforced
- Soft deletes for data recovery
- Audit logging for admin actions
- Non-root user in Docker container

## 📚 API Endpoints

### Authentication (Implemented)

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Books (Planned)

- `GET /api/books` - List all books (with filters)
- `GET /api/books/current` - Get current reading book
- `GET /api/books/[id]` - Get single book
- `POST /api/books` - Create book with validation
- `PUT /api/books/[id]` - Update book metadata
- `DELETE /api/books/[id]` - Soft delete book
- `POST /api/books/suggest` - Submit book suggestion
- `GET /api/books/suggestions` - Get current suggestions
- `GET /api/books/metadata?isbn=` - Fetch from Open Library

### Cycles (Planned)

- `GET /api/cycles/current` - Get active cycle
- `POST /api/cycles` - Start new cycle (admin)
- `PUT /api/cycles/[id]/end` - End cycle (admin)

### Voting (Planned)

- `POST /api/votes` - Cast votes (max 3)
- `GET /api/votes/results` - Get results (when ended)
- `GET /api/votes/my-votes` - Get user's votes

### Schedule (Planned)

- `GET /api/schedule/current` - Current reading schedule
- `POST /api/schedule` - Generate schedule (admin)
- `PUT /api/schedule/[id]` - Update schedule chunk (admin)
- `GET /api/schedule/export` - Discord-formatted export

### Meetings (Planned)

- `GET /api/meetings` - List meetings
- `GET /api/meetings/next` - Get next meeting
- `POST /api/meetings` - Create meeting (admin)
- `PUT /api/meetings/[id]` - Update meeting (admin)

### Admin (Planned)

- `GET /api/admin/members` - List members
- `POST /api/admin/members` - Add member
- `PUT /api/admin/members/[id]` - Update member role
- `DELETE /api/admin/members/[id]` - Remove member
- `GET /api/admin/blocklist` - Get blocked authors
- `POST /api/admin/blocklist` - Add blocked author
- `DELETE /api/admin/blocklist/[id]` - Remove blocked author

## 🐛 Troubleshooting

### Common Issues

1. **Database not initializing**
   ```bash
   # Check if database directory exists
   mkdir -p data
   # Re-run initialization
   npm run db:init
   ```

2. **Migration errors**
   ```bash
   # Check migration status
   npm run db:migrate:status
   # Start fresh (DESTRUCTIVE - deletes all data)
   rm -f bookclubber.db bookclubber.db-shm bookclubber.db-wal
   npm run db:init
   ```

3. **TypeScript errors**
   ```bash
   # Run type checking
   npm run type-check
   ```

4. **Build issues**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Development Tips

- Use `npm run dev` for development with hot reload
- Database file is stored at `./bookclubber.db` (or path in DATABASE_PATH env
  var)
- Check browser dev tools for API errors
- Use SQLite browser extensions to inspect database
- See [CLAUDE.md](CLAUDE.md) for development notes and common commands

## 🚢 Deployment

### Railway (Recommended)

1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard:
   - `DATABASE_PATH=/app/data/bookclub.db`
   - `SESSION_SECRET=<secure-random-string>`
   - `NODE_ENV=production`
3. Railway auto-deploys on git push

### Docker

```bash
# Build image
docker build -t bookclub-platform .

# Run container
docker run -p 3000:3000 \
  -e SESSION_SECRET=your-secret \
  -e DATABASE_PATH=/app/data/bookclub.db \
  -v $(pwd)/data:/app/data \
  bookclub-platform
```

## 📊 Success Metrics

### Time Savings (Target)

- Suggestion form creation: 30 seconds vs 10+ minutes manually
- Voting form creation: Automatic vs 15+ minutes manually
- Reading schedule creation: 2 minutes vs 10+ minutes manually
- **Total admin time per book cycle**: <5 minutes vs 45+ minutes manually

## 🎯 Design Principles

- **Mobile-Responsive**: Full functionality on all devices
- **Minimal Clicks**: Core actions in 3 clicks or less
- **Clear Visual Hierarchy**: Important info prominently displayed
- **Forgiving**: All actions reversible by admins
- **Fast**: Page loads under 2 seconds
- **Progressive Enhancement**: Works without JavaScript where possible

## 🚫 Out of Scope

**Explicitly Not Included:**

- Discussion forums (Discord serves this purpose)
- Reading progress tracking per member
- Book purchase/acquisition coordination
- Member attendance tracking
- Detailed book reviews or ratings
- Social features like comments or likes
- Mobile native applications

**Preserved External Processes:**

- All book discussions remain on Discord
- Meeting facilitation stays offline/video
- Book acquisition is individual responsibility

## 📖 Documentation

- [book-club-product-spec.md](book-club-product-spec.md) - Complete product
  requirements and feature roadmap
- [book-club-technical-spec.md](book-club-technical-spec.md) - Technical
  architecture and implementation details
- [CLAUDE.md](CLAUDE.md) - Development notes and common commands

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Run type checking: `npm run type-check`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review the database schema and API documentation
3. See [CLAUDE.md](CLAUDE.md) for development notes
4. Create an issue in the repository

---

Built with ❤️ for book lovers everywhere!
