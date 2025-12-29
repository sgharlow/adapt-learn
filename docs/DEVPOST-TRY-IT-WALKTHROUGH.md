# AdaptLearn — Try It Walkthrough

**For DevPost Judges**
**Live Demo:** https://adapt-learn-rosy.vercel.app
**Time to Complete:** 5-7 minutes

---

## Quick Start (2 minutes)

### Step 1: Landing Page
1. Go to https://adapt-learn-rosy.vercel.app
2. Notice the tagline: "Learn AI like you listen to podcasts"
3. Click **"Start Learning"** or **"Explore Paths"**

### Step 2: Choose a Learning Path
1. Browse the 10 learning paths
2. **Recommended for demo:** Click **"AI Explorer"** (beginner-friendly)
3. See the path overview with lesson count and topics

### Step 3: Start a Lesson
1. Click any lesson (try **"What is AI?"** or **"Neural Networks Explained"**)
2. The lesson page loads with content

---

## Core Features to Try (3-4 minutes)

### Feature 1: Voice-First Learning (ElevenLabs)
1. On any lesson page, click the **Play** button
2. Listen to the lesson narrated in natural speech
3. Try the **speed controls** (0.75x to 2x)
4. Notice the audio quality — this is ElevenLabs Multilingual v2

**What to notice:** The voice sounds natural, not robotic. This is the core differentiator.

### Feature 2: AI-Powered Q&A (ElevenLabs + Gemini)
1. While on a lesson, find the **"Ask a Question"** section
2. Type a question about the lesson content (e.g., "What's the difference between AI and ML?")
3. Get a response from Google Gemini
4. Click **Play** to hear the answer spoken via ElevenLabs

**What to notice:** The answer is context-aware (knows the lesson content) and can be heard as audio.

### Feature 3: Quiz & Gap Detection
1. After a lesson, click **"Take Quiz"**
2. Answer the questions
3. See your score and personalized feedback (powered by Gemini)
4. If you score below 70%, the system identifies this as a "gap"

**What to notice:** The feedback is specific to your answers, not generic.

### Feature 4: Progress Dashboard
1. Click **"Dashboard"** in the navigation
2. See your learning progress across paths
3. View topic mastery levels
4. Check recommended next lessons based on your gaps

**What to notice:** The recommendations adapt based on quiz performance.

---

## What Makes This Different

| Traditional Learning | AdaptLearn |
|---------------------|------------|
| Video lectures (screen required) | Audio-first (listen anywhere) |
| Generic course order | Adaptive path based on your gaps |
| Text-based Q&A | Voice Q&A with spoken answers |
| One-size-fits-all | Personalized recommendations |

---

## Technical Integration Highlights

### ElevenLabs
- **Text-to-Speech:** Every lesson available as natural audio
- **Voice Q&A:** Answers are spoken back to users
- **Model:** Multilingual v2 with optimized voice settings for education

### Google Gemini
- **Contextual Q&A:** Questions answered with lesson context injected
- **Quiz Evaluation:** Personalized feedback on answers
- **Adaptive Recommendations:** Suggests next lessons based on performance

---

## Content Scope

- **42 lessons** across AI/ML topics
- **10 learning paths** from beginner to specialist
- **~12 hours** of potential audio content
- Topics: Neural networks, NLP, computer vision, prompt engineering, AI ethics, and more

---

## Known Limitations (Hackathon Scope)

- No user authentication (progress stored in localStorage)
- Audio generated on-demand (slight delay on first play)
- Quiz database is pre-defined (not dynamically generated)

These are intentional MVP tradeoffs to focus on the core voice-first experience.

---

## Summary for Judges

**The pitch:** "Duolingo meets NotebookLM for AI skills"

**Key innovation:** Voice-first adaptive learning that works during commutes, workouts, or any screen-free time.

**ElevenLabs integration:** Core to the experience — every piece of content can be heard, not just read.

**Gemini integration:** Powers the intelligence — Q&A, quiz evaluation, and adaptive recommendations.

---

*Thank you for reviewing AdaptLearn!*
