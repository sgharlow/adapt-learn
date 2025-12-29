# AdaptLearn Demo Script

**Duration:** 3-4 minutes
**Purpose:** Showcase voice-first adaptive AI learning for the ElevenLabs Hackathon

---

## Pre-Demo Setup

1. Open browser to `http://localhost:3000` (or production URL)
2. **Pre-generate audio**: Navigate to `/demo-preload` and click "Preload All"
   - Wait for all 6 demo lessons to show green checkmarks
   - This ensures instant audio playback during the demo
3. Clear localStorage: `localStorage.clear()` in console (only clears progress, not audio cache)
4. Or use Demo Mode: Add `?demo=progress` to URL to load pre-configured state
5. Ensure audio is working and volume is appropriate
6. Have microphone ready for voice input demo

---

## Demo Flow

### Scene 1: Landing Page (30 seconds)

**Script:**
> "AdaptLearn is a voice-first adaptive learning platform for AI education. Think of it as Duolingo meets NotebookLM - personalized audio lessons that adapt to your knowledge gaps."

**Actions:**
1. Show landing page hero
2. Scroll to show learning paths section
3. Highlight the 10 learning paths
4. Click "Start Learning Free" or "Take Assessment"

---

### Scene 2: Assessment Quiz (45 seconds)

**Script:**
> "New learners take a quick 6-question assessment. Based on their coding experience, learning goals, and time commitment, we recommend a personalized learning path."

**Actions:**
1. Answer questions quickly (pre-planned answers for NLP Focus path):
   - Q1: "I code professionally"
   - Q2: "Work with text, chatbots, or language AI"
   - Q3: "3-5 hours"
   - Q4: "Followed some tutorials"
   - Q5: "I know the concept"
   - Q6: "Very interested - it's my main focus"
2. Show recommended path result
3. Click to start the NLP Focus path

---

### Scene 3: Path Overview (20 seconds)

**Script:**
> "Each learning path shows your progress and the lessons ahead. The system tracks which lessons you've completed and suggests what to learn next."

**Actions:**
1. Show path page with lesson list
2. Point out the milestone markers
3. Click on the first lesson

---

### Scene 4: Audio Lesson (60 seconds) - KEY FEATURE

**Script:**
> "Here's where the magic happens. Every lesson is available as an audio experience, powered by ElevenLabs. You can learn AI concepts while commuting, exercising, or doing chores."

**Actions:**
1. Show lesson page with content
2. Click Play on the audio player
3. Let audio play for 10-15 seconds
4. Show playback speed controls (1.25x, 1.5x)
5. Show the waveform visualization
6. Pause the audio

---

### Scene 5: Voice Q&A (45 seconds) - KEY FEATURE

**Script:**
> "Have a question? Just ask! Our AI tutor, powered by Google Gemini, answers in context. And yes - the response is spoken back to you using ElevenLabs."

**Actions:**
1. Click the floating AI chat button
2. Click the microphone button OR type a question
3. Ask: "What's the difference between supervised and unsupervised learning?"
4. Wait for response
5. Show audio auto-playing the answer
6. Point out the quick action buttons (Repeat, Simpler, Example)

---

### Scene 6: Quiz & Gap Detection (45 seconds)

**Script:**
> "After each lesson, a quick quiz tests your understanding. The system uses your results to detect knowledge gaps and adapt your learning path."

**Actions:**
1. Scroll down to quiz section
2. Click "Start Quiz"
3. Answer 2-3 questions quickly
4. Show quiz results with score
5. If score < 70%, show the "needs review" indicator

---

### Scene 7: Dashboard (30 seconds)

**Script:**
> "Your dashboard shows overall progress, recent activity, and personalized recommendations. The AI considers your quiz scores and knowledge gaps to suggest what to learn next."

**Actions:**
1. Navigate to Dashboard
2. Show progress ring and stats
3. Show the AI recommendation card
4. Point out the knowledge map/topic mastery
5. Show the learning streak

---

### Closing (15 seconds)

**Script:**
> "AdaptLearn - learn AI like you listen to podcasts. Voice-first, adaptive, and powered by ElevenLabs and Google Gemini. Thank you!"

**Actions:**
1. Return to landing page
2. Show the tech badges (ElevenLabs, Google Gemini)

---

## Demo Data Configuration

For a smooth demo, use these pre-configured states:

### Fresh Start (Assessment Flow)
- Clear all localStorage
- URL: `/?demo=fresh`

### Mid-Progress (Dashboard Demo)
- Completed: 3 lessons
- Quiz scores: 80%, 70%, 90%
- Current streak: 3 days
- URL: `/?demo=progress`

### Gap Detection Demo
- Completed: 5 lessons
- Mixed quiz scores (some below 70%)
- Shows knowledge gaps clearly
- URL: `/?demo=gaps`

---

## Backup Plans

### If Voice Input Fails:
- Type the question instead
- Say: "Voice input also works, but let me type for the demo"

### If Audio Generation is Slow:
- Use pre-generated audio (cached)
- Say: "Audio is pre-generated for a smooth experience"

### If API Errors:
- Show the graceful error handling
- Say: "The system handles errors gracefully with fallbacks"

---

## Key Talking Points

1. **Voice-First**: Learn during commute, exercise, chores
2. **Adaptive**: AI detects gaps and personalizes the path
3. **ElevenLabs Integration**: Natural, high-quality voice synthesis
4. **Google Gemini**: Contextual Q&A with lesson awareness
5. **Progress Tracking**: Streaks, mastery, recommendations

---

## Technical Highlights to Mention

- Built with Next.js 16 and TypeScript
- ElevenLabs Multilingual v2 model for natural speech
- Google Gemini for contextual AI responses
- Client-side progress tracking (localStorage)
- Responsive design for mobile learning
