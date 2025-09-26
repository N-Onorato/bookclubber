# Book Club Platform

A lightweight web-based platform for managing a small book club (8 users max) with book suggestions, reading schedules, and member management.

## 🚀 Features

- **Book Management**: Search and suggest books by name, author, or ISBN using the Open Library API
- **User Authentication**: Simple registration and login system
- **Book Suggestions**: Members can suggest books with voting functionality
- **Reading Sessions**: Flexible session breakdowns with dates and notes
- **Member Management**: Admin controls for managing book club members
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## 🛠 Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: SQLite with WAL mode
- **Styling**: Tailwind CSS
- **Authentication**: Session-based auth with cookies
- **API Integration**: Open Library for book data
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
   This creates the SQLite database and default admin user:
   - Email: `admin@bookclub.com`
   - Password: `admin123`

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

4. **Available Scripts**
   ```bash
   npm run dev          # Start development server
   npm run build        # Build for production
   npm run start        # Start production server
   npm run lint         # Run ESLint
   npm run type-check   # Run TypeScript checks
   npm run db:init      # Initialize database
   ```

### Docker Deployment

1. **Build and Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Production Environment Variables**
   Update `docker-compose.yml` with secure values:
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
│   │   ├── books/              # Book-related endpoints
│   │   ├── suggestions/        # Book suggestions API
│   │   ├── selections/         # Book selections API
│   │   └── members/            # Member management API
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
│   │   └── schema.sql         # Database schema
│   ├── services/              # Business logic services
│   │   └── authService.ts     # Authentication service
│   └── types.ts               # TypeScript type definitions
├── data/                       # SQLite database storage (volume mount)
├── public/                     # Static assets
├── Dockerfile                  # Docker configuration
├── docker-compose.yml         # Docker Compose configuration
└── package.json               # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
DATABASE_PATH=./data/bookclub.db
SESSION_SECRET=your-local-session-secret
NODE_ENV=development
```

### Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts and roles
- `books` - Cached book information from Open Library
- `book_suggestions` - Book suggestions from members
- `book_selections` - Approved books for reading
- `reading_sessions` - Session breakdowns for books
- `votes` - Voting on book suggestions

## 👥 Default Users

After running `npm run db:init`, a default admin user is created:
- **Email**: admin@bookclub.com  
- **Password**: admin123
- **Role**: admin

⚠️ **Important**: Change the default admin password after first login!

## 🔒 Security Notes

- Session-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- SQL injection protection with prepared statements
- CORS and security headers configured
- Non-root user in Docker container

## 🐛 Troubleshooting

### Common Issues

1. **Database not initializing**
   ```bash
   # Check if data directory exists
   mkdir -p data
   # Re-run initialization
   npm run db:init
   ```

2. **TypeScript errors**
   ```bash
   # Run type checking
   npm run type-check
   ```

3. **Build issues**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Development Tips

- Use `npm run dev` for development with hot reload
- Database file is stored in `./data/bookclub.db`
- Check browser dev tools for API errors
- Use SQLite browser extensions to inspect database

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout

### Books (Coming Soon)
- `GET /api/books/search?q=query` - Search books
- `GET /api/books/:id` - Get book details

### Suggestions (Coming Soon)
- `GET /api/suggestions` - List suggestions
- `POST /api/suggestions` - Create suggestion
- `POST /api/suggestions/:id/vote` - Vote on suggestion

## 🚢 Deployment

### Railway (Recommended)

1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the database schema and API documentation
3. Create an issue in the repository

---

Built with ❤️ for book lovers everywhere!