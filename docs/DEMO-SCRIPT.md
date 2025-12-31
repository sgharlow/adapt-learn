# AdaptLearn Demo Script

**Duration:** 3 minutes
**Purpose:** Showcase voice-first adaptive AI learning for the AI Partner Catalyst Hackathon
**URL:** https://adapt-learn-rosy.vercel.app

---

## Pre-Demo Setup (2 minutes)

1. Open Chrome incognito window
2. Navigate to homepage: `https://adapt-learn-rosy.vercel.app`
3. Test audio: volume on, speakers working
4. Have script visible on second monitor

> **Note:** Audio files are pre-generated and served as static assets. No preloading step needed - lessons play instantly!

---

## Demo Flow

### Scene 1: Landing Page (0:00 - 0:25)

**URL:** `https://adapt-learn-rosy.vercel.app`

**Script:**
> "What if learning AI was as easy as listening to a podcast? Introducing AdaptLearn — a voice-first AI learning platform that adapts to YOU. Learn during your commute, at the gym, or cooking dinner. Powered by ElevenLabs and Google Gemini."

**Actions:**
1. Show landing page hero (pause 2 seconds)
2. Scroll down to "How It Works" section
3. Continue scrolling to reveal the 10 learning path cards

---

### Scene 2: Path Selection (0:25 - 0:40)

**Script:**
> "Ten learning paths from beginner to specialist. Let's explore the AI Explorer path. Five lessons, about an hour to complete."

**Actions:**
1. Click the **"AI Explorer"** path card (first card, whole card is clickable)
2. Show path page with lesson list
3. Point out the progress bar and lesson count

---

### Scene 3: Audio Lesson (0:40 - 1:20) - KEY FEATURE

**Script:**
> "Click into any lesson to start learning. Every lesson features high-quality audio narration powered by ElevenLabs."

**Actions:**
1. Click **"What is Machine Learning?"** (first lesson in list)
2. Wait for lesson page to load
3. Click the **PLAY button** (triangle icon in audio player)
4. Let audio play for **8-10 seconds**

**Script:**
> "Adjust playback speed for busy schedules. Learn completely hands-free."

**Actions:**
5. Click **"1x"** speed button to show options
6. Click **PAUSE**

---

### Scene 4: AI Tutor (1:20 - 2:10) - MOST IMPORTANT FEATURE

**Script:**
> "Have a question? Ask the AI tutor. Powered by Google Gemini, it understands the lesson context."

**Actions:**
1. Click **"Ask AI Tutor"** button (floating button at bottom right of screen)
2. Wait for chat panel to open
3. Click **"Give me a real-world example"** (quick action button)
4. Wait for response to appear (3-5 seconds)

**Script:**
> "And here's the magic — ElevenLabs reads the answer back to you."

**Actions:**
5. Let the audio response play for **5-8 seconds**
6. Close the chat panel (click X or outside)

**Script:**
> "A truly conversational learning experience. Like having a personal tutor 24/7."

---

### Scene 5: Quiz (2:10 - 2:35)

**Script:**
> "After each lesson, a quick quiz reinforces what you've learned. Four questions test your understanding with instant feedback."

**Actions:**
1. Scroll down to quiz section
2. Click **"Start Quiz"** button
3. Answer **2 questions** (click any answers quickly)
4. Show the feedback after each answer

**Script:**
> "The system tracks your scores and identifies knowledge gaps."

---

### Scene 6: Dashboard (2:35 - 2:50)

**Navigate to:** `https://adapt-learn-rosy.vercel.app/dashboard?demo=gaps`

**Script:**
> "Your dashboard brings it all together — progress, streaks, and AI-powered recommendations."

**Actions:**
1. Point at the **progress ring** (shows 63% mastery)
2. Point at **"Recommended Next"** card (shows review suggestion)
3. Scroll to **"Knowledge Map"** section
4. Point at topic bars showing mastery levels

**Script:**
> "The Knowledge Map shows exactly where you're strong and where you need practice. The AI recommends exactly what to study next."

---

### Scene 7: Closing (2:50 - 3:00)

**Script:**
> "AdaptLearn — learn AI like you listen to podcasts. Voice-first, adaptive, powered by ElevenLabs and Google Gemini. Try it free at adapt-learn-rosy.vercel.app. Thanks for watching!"

**Actions:**
1. Show the URL clearly OR navigate back to homepage

---

## Quick Reference - Exact UI Labels

| What You Need | Exact Label/Location |
|---------------|---------------------|
| Start path | Click entire path card (e.g., "AI Explorer") |
| First lesson | "What is Machine Learning?" |
| Play audio | Triangle play button in audio player |
| Speed control | "1x" button (shows 0.75x, 1x, 1.25x, 1.5x, 2x) |
| AI Tutor | **"Ask AI Tutor"** (floating button, bottom right) |
| Quick question | "Give me a real-world example" |
| Start quiz | **"Start Quiz"** button |
| Dashboard | "Dashboard" in nav OR direct URL |

---

## Demo Mode URLs

Use these to show different progress states:

| URL | What It Shows |
|-----|---------------|
| `/dashboard?demo=fresh` | Empty state - new user |
| `/dashboard?demo=progress` | 3 lessons done, 33% complete |
| `/dashboard?demo=gaps` | **Best for demo** - 6 lessons, mixed scores, review recommendations visible |
| `/dashboard?demo=complete` | Path completed state |

**Recommendation:** Use `?demo=gaps` for the dashboard section to show the adaptive/gap detection features clearly.

---

## Backup Plans

| Problem | Solution |
|---------|----------|
| Audio won't play | Refresh page, check browser volume |
| AI Tutor slow | Say "The AI is processing..." and wait |
| Wrong page | Use browser back button or type URL |
| Quiz wrong answer | Perfect! Shows the feedback feature working |
| Site loading slow | Pre-load pages in multiple tabs before recording |

---

## Must Mention (Hackathon Requirements)

1. **"ElevenLabs"** — at least 2x (lesson audio + AI response audio)
2. **"Google Gemini"** — at least 1x (powers the AI tutor)
3. **"Voice-first"** or **"like a podcast"** — core value proposition
4. **"Adaptive"** or **"knowledge gaps"** — the smart recommendation feature
5. **URL:** adapt-learn-rosy.vercel.app

---

## Timing Checkpoints

Keep yourself on track:

| Time | Where You Should Be |
|------|---------------------|
| 0:25 | Clicking AI Explorer path card |
| 0:40 | On lesson page, about to play audio |
| 1:20 | Opening AI Tutor |
| 2:10 | Starting quiz |
| 2:35 | On dashboard with demo=gaps |
| 3:00 | Done! |

---

## Technical Info (if judges ask)

- Built with Next.js 16 and TypeScript
- ElevenLabs Multilingual v2 for natural speech synthesis
- Google Gemini for contextual AI responses
- Client-side progress tracking (localStorage)
- Responsive design works on mobile
- 40+ curated AI lessons across 10 paths

---

*Print this script. Follow the timestamps. You've got this!*
