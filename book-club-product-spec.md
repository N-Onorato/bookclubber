# Book Club Website Product Specification

## Product Vision
A web application designed to automate and streamline book club management, reducing administrative burden while enhancing the member experience. The primary goal is to eliminate manual work currently handled by club organizers, particularly around book suggestions, voting, and reading schedule creation.

## Target Users
- **Primary**: 8-member book club with established processes
- **Secondary**: Other small book clubs seeking management tools (future consideration)

## Core Product Principles
1. **Reduce Administrative Burden** - Automate repetitive tasks that currently require manual coordination
2. **Preserve Existing Workflows** - Enhance rather than replace successful existing processes (Discord discussions)
3. **Maintain Flexibility** - Support manual overrides for all automated decisions
4. **Enable Social Features** - Create opportunities for engagement beyond basic administration

---

## Phase 1: MVP Features

### 1. Book Suggestion System

#### Purpose
Replace manual Google Forms process for collecting book suggestions with automated metadata gathering and validation.

#### Core Functionality
- **Submission Limits**: Maximum 3 suggestions per person per round
- **Automatic Metadata Retrieval**:
  - Integration with Open Library API and Google Books API
  - Automatic population of: cover image, description, page count, publication date
  - Manual entry fallback for all fields when APIs fail
  
#### Validation Rules
- **Series Detection**: 
  - Warning system for books that appear to be part of a series
  - Detection patterns: "Book 2", "Volume", "Part", "#2", "Sequel", "Trilogy"
  - Warning message: "This appears to be part of a series. Has the club read the earlier books?"
  - Admin override available
  
- **Author Blocklist**:
  - Configurable list of authors blocked for ethical reasons
  - Rejection at submission with clear explanation
  - Private admin notes for why authors are blocked
  
- **Release Date Validation**:
  - Prevents submission of unreleased books
  - Checks publication date against current date

#### Theme Mode
- Optional theme requirement for suggestion rounds
- Theme displayed prominently at top of submission form
- Examples: "Books with 'cake' in the title", "Books by Asian authors"

### 2. Voting Module

#### Purpose
Automate the voting process while maintaining fairness through hidden ballots and vote limits.

#### Core Functionality
- **Vote Allocation**: Each member receives 3 votes to distribute
- **Hidden Ballot System**: 
  - No results visible during voting period
  - Automatic reveal when voting closes
  - Prevents bandwagon effects
  
#### User Experience
- Visual vote counter showing remaining votes
- Clear submission confirmation
- Countdown timer to voting deadline
- Automatic winner declaration

### 3. Reading Schedule Generator

#### Purpose
Automatically divide books into reasonable weekly reading chunks, eliminating manual chapter planning.

#### Core Functionality
- **Intelligent Chapter Division**:
  - Algorithm considers total page count and number of weeks
  - Respects chapter boundaries (no mid-chapter splits)
  - Targets consistent pages-per-week reading pace
  
- **Admin Controls**:
  - Manual adjustment of division points
  - Drag-and-drop interface for regrouping chapters
  - Page count display for each section
  
- **Discord Integration**:
  - Export format optimized for Discord channel creation
  - Copy-paste ready formatting

### 4. Meeting Scheduler

#### Purpose
Manage the regular Wednesday meeting schedule with flexibility for real-world scheduling conflicts.

#### Core Functionality
- **Default Schedule**: Wednesday recurring meetings
- **Automatic Skip Week**: Post-book selection week automatically skipped
- **Flexible Rescheduling**:
  - Individual meeting date/time changes
  - Holiday and conflict management
  - Tentative meeting marking for uncertain attendance

### 5. Current Reading Dashboard

#### Purpose
Provide members with an at-a-glance view of current reading status and upcoming commitments.

#### Key Information Display
- Current book cover and title
- This week's reading assignment (chapters and page range)
- Next meeting date and countdown
- Full reading schedule view
- Progress through current book

---

## Phase 2: Enhancement Features

### 6. Hall of Fame / Tier List System

#### Purpose
Create a living history of the club's reading journey with collaborative ranking system.

#### Core Functionality
- **Tier Rankings**: S, A, B, C, D, F tier system
- **Ranking Events**:
  - Designed for livestream ranking parties
  - Drag-and-drop interface for real-time adjustments
  - Individual and aggregate ranking views
  
- **Visualization**:
  - Exportable tier list images for sharing
  - Historical snapshots showing ranking evolution
  - Highlight sections for best/worst books

### 7. Book History & Analytics

#### Purpose
Preserve club history and surface interesting patterns in reading choices.

#### Data Captured
- All books read with completion dates
- Original suggester for each book
- Vote counts and voting participation
- Final tier rankings

#### Analytics Dashboard
- Most successful book suggester
- Genre distribution charts
- Reading pace trends (pages per week)
- Longest and shortest books completed
- Participation metrics

---

## Phase 3: Scaling Features

### 8. Notification System

#### Purpose
Keep members informed of important events without requiring constant website checking.

#### Notification Events
- Suggestion period opens/closes
- Voting period opens/closes
- New book selected
- Reading schedule published
- Meeting reminder (day before)

#### Delivery Channels
- Discord webhooks
- Email notifications
- In-app notification center
- User-configurable preferences

### 9. Multi-Tenancy Support

#### Purpose
Allow other book clubs to use the platform while maintaining data isolation.

#### Core Functionality
- Club creation and setup flow
- Isolated data per club
- Club-specific customization:
  - Meeting day preferences
  - Voting rules
  - Theme options
  - Author blocklists

### 10. Data Export

#### Purpose
Ensure clubs own their data and can migrate if needed.

#### Export Formats
- Complete history in JSON format
- CSV exports for spreadsheet analysis
- Formatted PDF summaries
- Tier list image exports

---

## User Roles & Permissions

### Member
- Submit up to 3 book suggestions per round
- Cast up to 3 votes during voting periods
- View all public club information
- Participate in tier rankings

### Admin (Alicia + 1 other)
- All member permissions
- Add/remove club members
- Edit book metadata and covers
- Adjust reading schedules
- Manage author blocklist
- Configure theme options
- Override series warnings
- Close/open suggestion and voting periods

---

## Integration Points

### Discord
- Primary discussion platform (maintained separately)
- Export formats optimized for Discord
- Optional webhook notifications
- Channel structure recommendations for each book

### External APIs
- Open Library API (primary book data source)
- Google Books API (fallback/supplementary data)
- Manual data entry always available as fallback

---

## Key User Flows

### New Book Cycle
1. **Theme Selection** (Optional)
   - Admin spins theme wheel or selects theme
   - Theme requirement activated for suggestions

2. **Suggestion Period**
   - Members submit up to 3 books each
   - System validates submissions against rules
   - APIs fetch metadata automatically
   - Admin reviews and adjusts metadata if needed

3. **Voting Period**
   - All valid suggestions presented with covers and descriptions
   - Members allocate their 3 votes
   - Results hidden until period closes

4. **Book Selection**
   - Winner automatically declared
   - Skip week activated
   - Admin creates reading schedule

5. **Reading Period**
   - Dashboard shows current assignment
   - Weekly meetings follow schedule
   - Discord channels used for discussion

6. **Completion**
   - Book marked complete
   - Added to history
   - Ready for tier ranking (Phase 2)
   - Cycle repeats

### Meeting Management Flow
1. Default Wednesday meeting appears on schedule
2. Admin can reschedule if conflicts arise
3. Members see updated meeting time on dashboard
4. Day-before reminder sent (Phase 3)
5. Meeting occurs (external to platform)

---

## Success Metrics

### Phase 1
- Time to create suggestion form: 30 seconds vs 10+ minutes currently
- Time to generate voting form: Automatic vs 15+ minutes currently
- Time to create reading schedule: 2 minutes vs 10+ minutes currently
- Admin time per book cycle: <5 minutes vs 45+ minutes currently

### Phase 2
- Member engagement with tier lists
- Frequency of history/stats page visits
- Ranking party participation rate

### Phase 3
- Number of clubs using platform
- Notification engagement rate
- Data export usage

---

## Design Principles

### User Experience
- **Mobile-Responsive**: Full functionality on all devices
- **Minimal Clicks**: Core actions achievable in 3 clicks or less
- **Clear Visual Hierarchy**: Most important information prominently displayed
- **Forgiving**: All actions reversible by admins
- **Fast**: Page loads under 2 seconds

### Data Integrity
- Soft deletes for all records (full recovery possible)
- Audit log for admin actions
- Regular automated backups
- Version history for edited content

### Technical Approach
- Event-driven architecture for future notification support
- Multi-tenant ready database schema from day one
- API-first design for potential mobile apps
- Progressive enhancement (works without JavaScript)

---

## Out of Scope

### Explicitly Not Included
- Discussion forums (Discord serves this purpose)
- Reading progress tracking per member
- Book purchase/acquisition coordination
- Member attendance tracking for meetings
- Book reviews or detailed ratings
- Social features like comments or likes
- Mobile native applications

### Preserved External Processes
- All book discussions remain on Discord
- Meeting facilitation stays offline/video call
- Book acquisition remains individual responsibility

---

## Future Considerations

### Potential Expansions
- Integration with library systems for availability
- Goodreads review aggregation (if API becomes available)
- Reading challenge gamification
- Annual reading summaries and awards
- Book recommendation engine based on tier rankings
- Integration with calendar applications
- ISBN barcode scanning for quick book entry

### Platform Evolution
- White-label options for book club organizations
- Paid tier for advanced features
- API access for third-party integrations
- Book club discovery and joining system
- Cross-club book recommendations based on tier lists