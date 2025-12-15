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

- **Live Demo:** [Coming Soon]
- **Demo Video:** [YouTube Link]

### Quick Demo URLs

```
/?demo=fresh      # Fresh start - new user experience
/?demo=progress   # Mid-progress - shows dashboard features
/?demo=gaps       # Gap detection - shows knowledge gaps
/?demo=complete   # Completed path - celebration state
/demo-preload     # Pre-cache audio for smooth demo
/brand            # Screenshot for thumbnail
```

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
- **Curated content** — 19 lessons across ML, deep learning, NLP, and practical AI

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Audio Lessons** | Natural voice synthesis via ElevenLabs Multilingual v2 |
| **Voice Q&A** | Ask questions, get context-aware audio responses |
| **Adaptive Learning** | Gap detection and personalized recommendations |
| **Progress Tracking** | Dashboard with streaks, mastery, and milestones |
| **4 Learning Paths** | Explorer, Practitioner, Specialist, NLP Focus |
| **19 Curated Lessons** | ML fundamentals, deep learning, NLP, practical AI |

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
git clone https://github.com/[your-username]/adapt-learn.git
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
│   ├── lessons/            # 19 lesson JSON files
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

---

## Demo Mode

For demonstrations and testing, use URL parameters:

```
/?demo=fresh      # New user, no progress
/?demo=progress   # 3 lessons completed, active streak
/?demo=gaps       # Shows knowledge gaps
/?demo=complete   # Path completed, celebration
```

Pre-cache audio at `/demo-preload` before recording demos.

---

## Screenshots

[Add screenshots here after capture]

1. Landing Page Hero
2. Learning Paths Selection
3. Audio Lesson Player
4. Voice Q&A Chat
5. Quiz with Feedback
6. Progress Dashboard

---

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

Built by [Your Name] for the AI Partner Catalyst Hackathon 2025.

---

*Learn AI like you listen to podcasts.*
