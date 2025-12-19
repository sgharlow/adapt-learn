# AdaptLearn Audio Architecture v2

**Created:** December 18, 2024
**Status:** Implementation Ready
**Priority:** CRITICAL - Blocking hackathon demo quality

---

## Problem Statement

### Current Issues

| Issue | Impact | Cost |
|-------|--------|------|
| 30+ second delay for audio playback | Unacceptable UX, demo killer | High |
| ElevenLabs API called per-user, per-play | Repeated charges for same content | $$$$ |
| Client-side localStorage caching | Limited to ~1-2 lessons, single user | Inefficient |
| No server-side persistence | Audio regenerated every session | Wasteful |

### Root Cause
Audio is generated **on-demand** for every playback request instead of being **pre-generated once** and served as static files.

---

## New Architecture

### Core Principle
> **Generate audio ONCE at build time. Serve as static files. Pay once, play forever.**

### Architecture Diagram

```
BUILD TIME (One-time cost)
┌─────────────────────────────────────────────────────────────┐
│  npm run generate:audio                                      │
│                                                              │
│  scripts/generate-audio.ts                                   │
│    ├─ Read all 42 lessons from /content/lessons/            │
│    ├─ For each lesson:                                       │
│    │   ├─ Extract text (intro + sections + summary)         │
│    │   ├─ Call ElevenLabs API (ONE time)                    │
│    │   ├─ Save MP3 to /public/audio/lessons/{id}.mp3        │
│    │   └─ Update lesson JSON with audioUrl                  │
│    └─ Total: ~42 API calls = ~$2-5 one-time cost            │
└─────────────────────────────────────────────────────────────┘
                              ↓
DEPLOYMENT (Static hosting - FREE)
┌─────────────────────────────────────────────────────────────┐
│  Vercel CDN                                                  │
│                                                              │
│  /public/audio/                                              │
│    └─ lessons/                                               │
│        ├─ ai-tools-01.mp3      (4.2 MB)                     │
│        ├─ ai-tools-02.mp3      (3.8 MB)                     │
│        ├─ deep-learning-01.mp3 (5.1 MB)                     │
│        └─ ... 42 total files (~150-200 MB total)            │
│                                                              │
│  Served via CDN edge locations worldwide                     │
│  - Instant playback (no generation delay)                    │
│  - Zero per-play API costs                                   │
│  - Cached at edge (fast globally)                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
RUNTIME (User experience)
┌─────────────────────────────────────────────────────────────┐
│  User clicks "Play" on lesson                                │
│    ↓                                                         │
│  AudioPlayer loads /audio/lessons/{id}.mp3                   │
│    ↓                                                         │
│  Audio plays INSTANTLY (streamed from CDN)                   │
│    ↓                                                         │
│  No API calls, no delays, no costs                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Audio Generation Script

**File:** `scripts/generate-audio.ts`

```typescript
// Pseudocode
async function generateAllLessonAudio() {
  const lessons = getAllLessons();

  for (const lesson of lessons) {
    // Check if already generated (skip if exists)
    if (audioFileExists(lesson.id)) {
      console.log(`Skipping ${lesson.id} - already generated`);
      continue;
    }

    // Build lesson text
    const text = buildLessonText(lesson);

    // Generate audio via ElevenLabs
    const audioBuffer = await generateAudio(text);

    // Save to /public/audio/lessons/{id}.mp3
    await saveAudioFile(lesson.id, audioBuffer);

    // Update lesson JSON with audioUrl
    lesson.audioUrls.full = `/audio/lessons/${lesson.id}.mp3`;
    await updateLessonFile(lesson);

    // Rate limiting - 2 second delay between calls
    await sleep(2000);
  }
}
```

**Features:**
- Incremental generation (skip existing files)
- Rate limiting to avoid API throttling
- Progress logging
- Error recovery (continues on failure)
- Content hash tracking (regenerate if content changes)

### Phase 2: Update Lesson Player

**Current code (AudioPlayer.tsx):**
```typescript
// OLD - generates audio on-demand
const handlePlay = async () => {
  const response = await fetch('/api/audio/generate', {
    body: JSON.stringify({ text: lessonText })
  });
  const { audioUrl } = await response.json();
  setAudioUrl(audioUrl);
};
```

**New code:**
```typescript
// NEW - uses pre-generated static file
const audioUrl = `/audio/lessons/${lessonId}.mp3`;
// No API call needed - just play the file
```

### Phase 3: Q&A Caching (Dynamic Content)

For truly dynamic content (AI Q&A responses), we implement server-side caching:

```typescript
// /api/audio/generate/route.ts (for Q&A only)
async function generateWithCache(text: string, context: string) {
  const cacheKey = hash(text + context);

  // Check file-based cache
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  // Generate new audio
  const audio = await elevenLabsGenerate(text);

  // Cache for future requests
  await saveToCache(cacheKey, audio);

  return audio;
}
```

---

## File Structure Changes

### Before
```
adapt-learn/
├─ content/
│  └─ lessons/
│     └─ *.json (audioUrls: { full: null })
├─ public/
│  └─ (no audio files)
└─ src/
   └─ app/
      └─ api/
         └─ audio/
            └─ generate/route.ts (called every play)
```

### After
```
adapt-learn/
├─ content/
│  └─ lessons/
│     └─ *.json (audioUrls: { full: "/audio/lessons/{id}.mp3" })
├─ public/
│  └─ audio/
│     └─ lessons/
│        ├─ ai-tools-01.mp3
│        ├─ ai-tools-02.mp3
│        └─ ... (42 files)
├─ scripts/
│  └─ generate-audio.ts (build-time script)
└─ src/
   └─ app/
      └─ api/
         └─ audio/
            └─ generate/route.ts (Q&A only, with caching)
```

---

## Cost Analysis

### Before (Current Architecture)

| Scenario | API Calls | Cost (at $0.30/1M chars) |
|----------|-----------|--------------------------|
| 1 demo (42 lessons) | 42 | ~$0.50 |
| 10 users demo | 420 | ~$5.00 |
| 100 users testing | 4,200 | ~$50.00 |
| Hackathon judges (3) | 126 | ~$1.50 |

**Problem:** Costs scale linearly with users × plays.

### After (New Architecture)

| Scenario | API Calls | Cost |
|----------|-----------|------|
| Initial generation | 42 | ~$2-5 (ONE TIME) |
| 10 users demo | 0 | $0.00 |
| 100 users testing | 0 | $0.00 |
| Hackathon judges | 0 | $0.00 |
| Q&A responses | ~10/user | ~$0.01/user |

**Savings:** 95%+ cost reduction at scale.

---

## Performance Comparison

### Before
```
User clicks Play
    ↓ (0ms)
Request sent to /api/audio/generate
    ↓ (100ms network)
Server calls ElevenLabs API
    ↓ (5,000-30,000ms generation)
Audio returned as base64
    ↓ (500ms transfer)
Browser decodes and plays
    ↓
TOTAL: 5-30 seconds latency
```

### After
```
User clicks Play
    ↓ (0ms)
Browser requests /audio/lessons/{id}.mp3
    ↓ (50-200ms CDN)
Audio streams immediately
    ↓
TOTAL: <500ms latency
```

**Improvement:** 10-60x faster playback start.

---

## Implementation Checklist

### Pre-Generation Script
- [ ] Create `scripts/generate-audio.ts`
- [ ] Add npm script: `"generate:audio": "npx tsx scripts/generate-audio.ts"`
- [ ] Handle rate limiting (2s delay between calls)
- [ ] Add progress logging
- [ ] Add error recovery (skip on failure, continue)
- [ ] Add content hash tracking (regenerate if changed)
- [ ] Create `/public/audio/lessons/` directory
- [ ] Run script to generate all 42 lesson audio files
- [ ] Verify all files generated correctly

### Update Lesson JSON Files
- [ ] Update all 42 lesson files with `audioUrls.full` paths
- [ ] Or: Auto-update during generation script

### Update Lesson Player Component
- [ ] Modify `AudioPlayer.tsx` to use static URLs
- [ ] Remove on-demand generation for lessons
- [ ] Keep loading state for initial audio load
- [ ] Test playback on all lessons

### Q&A Caching (Phase 2)
- [ ] Add file-based cache for Q&A responses
- [ ] Update `/api/audio/generate` to check cache first
- [ ] Add cache directory `/public/audio/cache/`
- [ ] Add cache expiration (7 days)

### Testing & Deployment
- [ ] Test locally with pre-generated audio
- [ ] Verify audio quality
- [ ] Deploy to Vercel
- [ ] Test production playback
- [ ] Monitor for issues

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Large repo size (200MB audio) | Use `.gitattributes` for LFS, or external storage |
| Build time increases | Audio generation is manual script, not part of build |
| ElevenLabs API rate limits | 2-second delay between calls, retry logic |
| Content changes need regeneration | Track content hash, regenerate only changed lessons |
| Vercel deployment size limits | Pro plan allows 100MB functions, static is unlimited |

---

## Decision: Git LFS vs External Storage

### Option A: Store in `/public/` (Recommended for Hackathon)
- **Pros:** Simple, works with Vercel, no external dependencies
- **Cons:** Repo size increases, slower git operations
- **Size:** ~200MB for 42 lessons

### Option B: External Storage (S3/R2/Vercel Blob)
- **Pros:** Keeps repo small, CDN delivery
- **Cons:** More complex, needs environment config
- **When:** Post-hackathon, if scaling

**Recommendation:** Use Option A for hackathon simplicity. The 200MB is manageable.

---

## Estimated Time

| Task | Time |
|------|------|
| Create generation script | 1-2 hours |
| Generate all audio (42 lessons) | 30-60 mins (rate limited) |
| Update lesson player | 30 mins |
| Testing | 30 mins |
| **Total** | **3-4 hours** |

---

## Next Steps

1. **Create the generation script** (`scripts/generate-audio.ts`)
2. **Run it locally** to generate all 42 lesson audio files
3. **Update the lesson player** to use static URLs
4. **Commit and deploy** (audio files in repo for simplicity)
5. **Test on production** to verify instant playback
