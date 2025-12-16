# AdaptLearn Authentication & Data Persistence Plan

**Created:** December 15, 2024
**Status:** Planning
**Priority:** Required before public launch

---

## Executive Summary

AdaptLearn currently stores all user data in browser localStorage, meaning:
- Data is lost if browser cache is cleared
- No cross-device access
- No way to identify individual users
- No analytics or usage tracking
- Anyone can access the site

This plan outlines the architecture for proper user authentication and data persistence.

---

## Current State

| Component | Current | Problem |
|-----------|---------|---------|
| User Identity | None | Can't distinguish users |
| Data Storage | localStorage | Lost on cache clear, single device |
| Authentication | None | No access control |
| Progress Tracking | Client-side only | Can't analyze user behavior |
| Settings | localStorage | Not portable |

---

## Requirements

### Must Have (MVP)
- [ ] User registration (email/password)
- [ ] User login/logout
- [ ] Persistent progress storage (survives cache clear)
- [ ] Cross-device access (login anywhere, see your progress)
- [ ] Protected routes (must be logged in to use app)
- [ ] Individual user data isolation

### Should Have (Post-MVP)
- [ ] Social login (Google, GitHub)
- [ ] Password reset via email
- [ ] Email verification
- [ ] User profile/settings page
- [ ] Usage analytics dashboard
- [ ] Admin panel for user management

### Nice to Have (Future)
- [ ] Teams/organizations
- [ ] Role-based access (student, instructor, admin)
- [ ] SSO for enterprise
- [ ] API access tokens

---

## Recommended Architecture

### Technology Stack

| Layer | Recommendation | Why |
|-------|----------------|-----|
| **Auth Provider** | Supabase Auth | Free tier, built-in UI, JWT tokens |
| **Database** | Supabase PostgreSQL | Same platform as auth, real-time, free tier |
| **ORM** | Prisma | Type-safe, works great with Next.js |
| **Session** | Supabase + cookies | Automatic session management |

### Why Supabase?

1. **Single Platform** - Auth + Database + Storage in one
2. **Free Tier** - 500MB database, 50K monthly active users
3. **Next.js Integration** - Official `@supabase/ssr` package
4. **Row Level Security** - Database-level user isolation
5. **Real-time** - Built-in subscriptions if needed later
6. **No Vendor Lock-in** - Standard PostgreSQL, can migrate

### Alternative Considered

| Option | Pros | Cons |
|--------|------|------|
| NextAuth + PlanetScale | Popular, flexible | Two services to manage |
| Clerk | Beautiful UI, fast setup | More expensive at scale |
| Auth0 + Vercel Postgres | Enterprise-grade | Complex, expensive |
| Firebase | Real-time, Google ecosystem | NoSQL less flexible |

---

## Database Schema

### Users Table (managed by Supabase Auth)
```sql
-- Supabase handles this automatically
auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  encrypted_password TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  ...
)
```

### User Profiles Table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

### User Progress Table
```sql
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_path TEXT,
  completed_lessons TEXT[], -- Array of lesson IDs
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);
```

### Quiz Results Table
```sql
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB, -- Store individual answers
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_quiz_results_user_lesson ON quiz_results(user_id, lesson_id);

-- Row Level Security
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own quiz results" ON quiz_results
  FOR ALL USING (auth.uid() = user_id);
```

### Topic Mastery Table
```sql
CREATE TABLE public.topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  score DECIMAL(5,2) DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  lessons_total INTEGER DEFAULT 0,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- Row Level Security
ALTER TABLE topic_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own mastery" ON topic_mastery
  FOR ALL USING (auth.uid() = user_id);
```

### Activity Log Table
```sql
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'lesson_complete', 'quiz_submit', 'path_start', etc.
  entity_id TEXT, -- lesson_id, path_id, etc.
  metadata JSONB, -- Additional context
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for time-based queries
CREATE INDEX idx_activity_log_user_time ON activity_log(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own activity" ON activity_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### User Settings Table
```sql
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_voice TEXT DEFAULT 'EXAVITQu4vr4xnSDxMaL',
  audio_speed DECIMAL(2,1) DEFAULT 1.0,
  auto_play_audio BOOLEAN DEFAULT true,
  show_transcripts BOOLEAN DEFAULT true,
  daily_goal_minutes INTEGER DEFAULT 15,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own settings" ON user_settings
  FOR ALL USING (auth.uid() = id);
```

---

## API Routes (New/Modified)

### Authentication Routes
```
POST /api/auth/signup        - Create new account
POST /api/auth/login         - Login with email/password
POST /api/auth/logout        - Clear session
POST /api/auth/reset-password - Send reset email
GET  /api/auth/session       - Get current session
```

### Progress Routes (Protected)
```
GET  /api/progress           - Get user's full progress
POST /api/progress/sync      - Sync localStorage to server
PUT  /api/progress/path      - Update current path
POST /api/progress/lesson    - Mark lesson complete
```

### Quiz Routes (Protected)
```
POST /api/quiz/submit        - Submit quiz and save result
GET  /api/quiz/history       - Get quiz history for user
GET  /api/quiz/stats         - Get aggregate quiz stats
```

### Settings Routes (Protected)
```
GET  /api/settings           - Get user settings
PUT  /api/settings           - Update user settings
```

---

## Implementation Phases

### Phase 1: Foundation (Day 1-2)
**Goal:** Basic auth working, database connected

- [ ] Create Supabase project
- [ ] Configure Supabase Auth settings
- [ ] Install dependencies (`@supabase/supabase-js`, `@supabase/ssr`)
- [ ] Create Supabase client utilities
- [ ] Set up environment variables
- [ ] Create database tables and RLS policies
- [ ] Add Prisma schema (optional, for type safety)

**Files to create:**
```
src/lib/supabase/
├── client.ts          - Browser client
├── server.ts          - Server client
└── middleware.ts      - Auth middleware

prisma/
└── schema.prisma      - Database schema (optional)
```

### Phase 2: Auth UI (Day 2-3)
**Goal:** Users can register and login

- [ ] Create login page (`/login`)
- [ ] Create signup page (`/signup`)
- [ ] Add auth context provider
- [ ] Implement protected route wrapper
- [ ] Add logout functionality
- [ ] Handle auth errors gracefully
- [ ] Add loading states

**Files to create:**
```
src/app/(auth)/
├── login/page.tsx
├── signup/page.tsx
└── layout.tsx

src/components/auth/
├── LoginForm.tsx
├── SignupForm.tsx
├── AuthProvider.tsx
└── ProtectedRoute.tsx
```

### Phase 3: Data Migration (Day 3-4)
**Goal:** Progress saves to database

- [ ] Create progress sync API route
- [ ] Modify progressManager to sync with server
- [ ] Add offline support (queue changes, sync when online)
- [ ] Migrate existing localStorage data on first login
- [ ] Update dashboard to load from server
- [ ] Update lesson completion to save to server

**Files to modify:**
```
src/lib/progressManager.ts    - Add server sync
src/app/dashboard/page.tsx    - Load from server
src/app/lesson/[id]/page.tsx  - Save to server
```

### Phase 4: Polish (Day 4-5)
**Goal:** Production-ready auth experience

- [ ] Add "Remember me" functionality
- [ ] Implement password reset flow
- [ ] Add email verification (optional)
- [ ] Create user profile page
- [ ] Add settings page
- [ ] Handle edge cases (expired sessions, network errors)
- [ ] Add loading skeletons
- [ ] Test all flows end-to-end

---

## File Structure (After Implementation)

```
src/
├── app/
│   ├── (auth)/              # Auth pages (no header)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (protected)/         # Protected pages (requires auth)
│   │   ├── dashboard/page.tsx
│   │   ├── lesson/[id]/page.tsx
│   │   ├── path/[id]/page.tsx
│   │   ├── profile/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/route.ts
│   │   ├── progress/
│   │   │   ├── route.ts
│   │   │   └── sync/route.ts
│   │   ├── quiz/
│   │   │   └── submit/route.ts
│   │   └── settings/route.ts
│   └── page.tsx             # Landing (public)
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   └── ...
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── progressManager.ts   # Modified for server sync
│   └── ...
└── middleware.ts            # Route protection
```

---

## Environment Variables (New)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Keep existing
ELEVENLABS_API_KEY=...
GOOGLE_API_KEY=...
```

---

## Security Considerations

### Authentication
- [x] Use secure, httpOnly cookies for sessions
- [x] Implement CSRF protection (built into Supabase)
- [x] Rate limit auth endpoints
- [x] Validate email format
- [x] Enforce password strength (min 8 chars)

### Data Access
- [x] Row Level Security on all tables
- [x] Users can only access their own data
- [x] Validate user_id matches session on all writes
- [x] Sanitize all user inputs

### API Security
- [x] Validate JWT on all protected routes
- [x] Return 401 for unauthenticated requests
- [x] Return 403 for unauthorized access attempts
- [x] Log security events

---

## Migration Strategy

### For Existing localStorage Data

When a user logs in for the first time:

1. Check if localStorage has existing progress
2. If yes, prompt: "We found existing progress. Import it to your account?"
3. If user confirms, POST to `/api/progress/sync` with localStorage data
4. Server creates records in database
5. Clear localStorage (or keep as offline cache)

```typescript
// Migration flow
async function migrateLocalStorageToServer(userId: string) {
  const localProgress = localStorage.getItem('adaptlearn-progress');
  if (!localProgress) return;

  const progress = JSON.parse(localProgress);

  await fetch('/api/progress/sync', {
    method: 'POST',
    body: JSON.stringify({ progress }),
  });

  // Keep localStorage as offline cache, mark as synced
  localStorage.setItem('adaptlearn-synced', 'true');
}
```

---

## Offline Support Strategy

### Approach: Offline-First with Background Sync

1. **Read:** Always try server first, fall back to localStorage
2. **Write:** Write to localStorage immediately, queue for server sync
3. **Sync:** Background sync when online, resolve conflicts

```typescript
// Hybrid progress manager
class HybridProgressManager {
  async getProgress(): Promise<UserProgress> {
    // Try server first
    const serverProgress = await this.fetchFromServer();
    if (serverProgress) {
      this.cacheLocally(serverProgress);
      return serverProgress;
    }

    // Fall back to localStorage
    return this.getFromLocalStorage();
  }

  async saveProgress(progress: UserProgress): Promise<void> {
    // Save locally immediately (optimistic)
    this.saveToLocalStorage(progress);

    // Queue server sync
    this.queueSync(progress);
  }

  private async queueSync(progress: UserProgress): Promise<void> {
    if (navigator.onLine) {
      await this.syncToServer(progress);
    } else {
      // Queue for later
      this.addToSyncQueue(progress);
    }
  }
}
```

---

## Testing Checklist

### Authentication
- [ ] User can register with email/password
- [ ] User can login with correct credentials
- [ ] User gets error with wrong credentials
- [ ] User can logout
- [ ] Session persists across page refreshes
- [ ] Session expires after timeout
- [ ] Protected routes redirect to login

### Data Persistence
- [ ] Progress saves to database on lesson complete
- [ ] Progress loads from database on login
- [ ] Quiz results save to database
- [ ] Settings save and load correctly
- [ ] Activity log records events

### Edge Cases
- [ ] Offline mode works (localStorage fallback)
- [ ] Sync works when coming back online
- [ ] Multiple tabs don't conflict
- [ ] Old localStorage data migrates correctly

---

## Cost Estimate

### Supabase Free Tier Includes:
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- Unlimited API requests
- 2 GB bandwidth

### When to Upgrade:
- \>500 MB data → Pro plan ($25/month)
- \>50K users → Pro plan
- Need custom domains → Pro plan

**For hackathon:** Free tier is more than sufficient.

---

## Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Foundation | 1-2 days | Database + Supabase connected |
| Phase 2: Auth UI | 1-2 days | Login/signup working |
| Phase 3: Data Migration | 1-2 days | Progress saves to server |
| Phase 4: Polish | 1-2 days | Production-ready |
| **Total** | **4-8 days** | Full auth system |

---

## Next Steps

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Save URL and keys

2. **Run Database Migrations**
   - Execute SQL from this doc in Supabase SQL Editor
   - Verify RLS policies

3. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

4. **Begin Phase 1 Implementation**

---

## Questions to Resolve

1. **Social Login:** Add Google/GitHub login now or later?
2. **Email Verification:** Require email verification before access?
3. **Password Requirements:** What password strength to enforce?
4. **Session Duration:** How long before requiring re-login?
5. **Data Retention:** How long to keep activity logs?

---

*Plan created: December 15, 2024*
*Ready for implementation review*
