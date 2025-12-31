# AdaptLearn

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Powered-blue)](https://elevenlabs.io/)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI-green?logo=google)](https://cloud.google.com/vertex-ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Voice-First Adaptive AI Learning Platform**

*Learn AI like you listen to podcasts — personalized audio lessons that adapt to your knowledge gaps.*

Built for the **AI Partner Catalyst Hackathon — ElevenLabs Track**

---

## Demo

- **Live Demo:** [https://adapt-learn-rosy.vercel.app](https://adapt-learn-rosy.vercel.app)
- **Demo Video:** [https://youtu.be/GtZp6YBSQZU](https://youtu.be/GtZp6YBSQZU)

### Quick Demo URLs

```
/?demo=fresh      # Fresh start - new user experience
/?demo=progress   # Mid-progress - shows dashboard features
/?demo=gaps       # Gap detection - shows knowledge gaps
/?demo=complete   # Completed path - celebration state
/brand            # Screenshot for thumbnail
```

> **Note:** Audio files are pre-generated at build time. No preloading needed!

---

## What is AdaptLearn?

AdaptLearn reimagines AI education as a **voice-first experience**. Every lesson is synthesized into natural, engaging audio using ElevenLabs, while Google Gemini provides intelligent Q&A and adaptive recommendations.

**Think: Duolingo meets NotebookLM for AI skills.**

### The Problem

- AI skills gap is massive — demand far exceeds supply
- Traditional courses require dedicated screen time
- Busy professionals learn during commutes, workouts, chores
- One-size-fits-all education doesn't address individual gaps

### The Solution

- **Learn anywhere** — Voice-first means learning on the go
- **Adaptive paths** — System detects gaps and adjusts recommendations
- **Conversational** — Ask questions, get audio answers like a personal tutor
- **Curated content** — 42 lessons across ML, deep learning, NLP, generative AI, and more

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Audio Lessons** | Natural voice synthesis via ElevenLabs Multilingual v2 |
| **Voice Q&A** | Ask questions, get context-aware audio responses |
| **Adaptive Learning** | Gap detection and personalized recommendations |
| **Progress Tracking** | Dashboard with streaks, mastery, and milestones |
| **10 Learning Paths** | From beginner to specialist across multiple AI domains |
| **42 Curated Lessons** | ML, deep learning, NLP, generative AI, ethics, and more |

### Voice Experience

- Play/pause with keyboard shortcuts
- Adjustable speed (0.75x - 2x)
- Waveform visualization
- Audio caching for instant playback

### Adaptive System

- Topic mastery scoring from quiz results
- Knowledge gap detection (< 70% threshold)
- AI-powered next-lesson recommendations
- Prerequisite-aware path navigation

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16, React 19, TypeScript | Modern web application |
| Styling | Tailwind CSS | Responsive, polished UI |
| Voice | ElevenLabs API | Natural text-to-speech |
| AI/LLM | Google Gemini (Vertex AI) | Q&A, quiz evaluation, recommendations |
| State | React Context + localStorage | Client-side progress tracking |
| Hosting | Vercel | Serverless deployment |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- ElevenLabs API key
- Google Cloud API key (Gemini)

### Installation

```bash
# Clone the repository
git clone https://github.com/sgharlow/adapt-learn.git
cd adapt-learn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` with:

```env
# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL  # Sarah voice (default)

# Google Cloud / Gemini
GOOGLE_API_KEY=your_google_api_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

---

## Project Structure

```
adapt-learn/
├── content/                 # Lesson and path content
│   ├── lessons/            # 42 lesson JSON files
│   └── paths/              # Learning path definitions
├── docs/                   # Documentation
│   ├── DEMO-SCRIPT.md      # Demo flow guide
│   ├── VIDEO-RECORDING-GUIDE.md
│   ├── SUBMISSION-ASSETS-GUIDE.md
│   └── DEVPOST-SUBMISSION.md
├── src/
│   ├── app/                # Next.js app router pages
│   │   ├── api/            # API routes
│   │   ├── assessment/     # Path assessment quiz
│   │   ├── dashboard/      # Progress dashboard
│   │   ├── lesson/[id]/    # Lesson player
│   │   └── path/[id]/      # Path overview
│   ├── components/         # React components
│   │   ├── AudioPlayer.tsx
│   │   ├── VoiceChat.tsx
│   │   ├── Quiz.tsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities
│   │   ├── audioCache.ts   # Audio caching
│   │   ├── gapDetection.ts # Adaptive logic
│   │   └── progressManager.ts
│   └── types/              # TypeScript definitions
└── public/                 # Static assets
```

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/audio/generate` | POST | Text → ElevenLabs → Audio |
| `/api/chat/respond` | POST | Question → Gemini → Response |
| `/api/quiz/evaluate` | POST | Answer → Gemini → Feedback |
| `/api/adapt/recommend` | POST | User state → Next lesson |
| `/api/lessons/[id]` | GET | Fetch lesson content |
| `/api/paths` | GET | Fetch all learning paths |

---

## ElevenLabs Integration

### Voice Settings

```typescript
// Optimized for educational content
const VOICE_SETTINGS = {
  stability: 0.65,          // Clear pronunciation
  similarity_boost: 0.75,   // Voice consistency
  style: 0.35,              // Moderate expressiveness
  use_speaker_boost: true,  // Enhanced clarity
};
```

### Features Used

- **Text-to-Speech API** — Lesson narration
- **Multilingual v2 Model** — Natural, engaging voice
- **Voice Customization** — Tuned for instructional content

---

## Google Gemini Integration

### Use Cases

1. **Contextual Q&A** — Answer questions with lesson context
2. **Quiz Evaluation** — Provide personalized feedback
3. **Recommendations** — Suggest next lessons based on gaps

### Prompt Engineering

Questions include full lesson context for relevant, accurate responses.

---

## Learning Paths

| Path | Lessons | Audience | Duration |
|------|---------|----------|----------|
| AI Explorer | 5 | Beginners, business professionals | ~1 hour |
| AI Practitioner | 8 | Developers, technical professionals | ~2 hours |
| AI Specialist | 15 | ML engineers, researchers | ~4 hours |
| NLP Focus | 9 | Chatbot/language AI developers | ~2.5 hours |
| Generative AI | 5 | Content creators, artists, writers | ~1 hour |
| Prompt Engineering | 4 | Anyone using AI tools | ~45 min |
| Computer Vision | 3 | Visual AI developers | ~45 min |
| AI Ethics | 4 | Builders, policymakers | ~50 min |
| AI Tools & APIs | 4 | Developers building AI apps | ~50 min |
| AI for Business | 3 | Business leaders, managers | ~35 min |

---

## Demo Mode

For demonstrations and testing, use URL parameters:

```
/?demo=fresh      # New user, no progress
/?demo=progress   # 3 lessons completed, active streak
/?demo=gaps       # Shows knowledge gaps
/?demo=complete   # Path completed, celebration
```

Audio files are pre-generated and served statically. No preloading needed!

---

## Screenshots

### Landing Page
![Landing Page Hero](public/screenshots/adapt-learn-01-landing-hero.png)
*Voice-first AI learning — learn like you listen to podcasts*

### Learning Paths
![Learning Paths Selection](public/screenshots/adapt-learn-02-learning-paths.png)
*10 curated paths from beginner to specialist*

### Audio Lesson Player
![Lesson Player](public/screenshots/adapt-learn-03-lesson-player.png)
*Natural voice synthesis via ElevenLabs with playback controls*

### Voice Q&A
![AI Chat](public/screenshots/adapt-learn-04-ai-chat.png)
*Ask questions, get context-aware audio responses powered by Gemini*

### Quiz Assessment
![Quiz](public/screenshots/adapt-learn-05-quiz.png)
*Personalized feedback and gap detection*

### Progress Dashboard
![Dashboard](public/screenshots/adapt-learn-06-dashboard.png)
*Track streaks, mastery, and learning milestones*

---

## Deployment

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Set these in your Vercel dashboard:
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`
- `GOOGLE_API_KEY`

---

## Contributing

This project was built for a hackathon. Contributions welcome after submission!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## Hackathon Submission

**Hackathon:** AI Partner Catalyst Hackathon
**Track:** ElevenLabs Challenge
**Deadline:** December 31, 2025 @ 2:00pm PST

### Technologies Used

- ElevenLabs (Voice synthesis)
- Google Cloud Vertex AI / Gemini (LLM)
- Next.js 16 (Framework)
- Vercel (Hosting)

### Judging Criteria

- Technological Implementation
- Design & User Experience
- Potential Impact
- Quality of the Idea

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- Voice synthesis by [ElevenLabs](https://elevenlabs.io)
- AI powered by [Google Gemini](https://cloud.google.com/vertex-ai)
- Content inspired by [fast.ai](https://fast.ai), [Hugging Face](https://huggingface.co), [PyTorch](https://pytorch.org)
- Built with [Next.js](https://nextjs.org) and [Tailwind CSS](https://tailwindcss.com)

---

## Author

Built by Steve Harlow for the AI Partner Catalyst Hackathon 2025.

---

*Learn AI like you listen to podcasts.*
