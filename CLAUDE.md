# AdaptLearn - AI Assistant Context

## Project Overview

AdaptLearn is a voice-first adaptive AI learning platform being built for the AI Partner Catalyst Hackathon (ElevenLabs Track). Deadline: December 31, 2025.

## Core Concept

"Duolingo meets NotebookLM for AI skills" — users learn AI through personalized audio lessons that adapt based on their knowledge gaps.

## Key Documentation

- `docs/HACKATHON-REQUIREMENTS.md` — MVP scope, functional requirements, tech specs
- `docs/FULL-PROJECT-VISION.md` — Long-term vision, post-hackathon roadmap
- `docs/IMPLEMENTATION-PLAN.md` — Day-by-day build plan

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Voice:** ElevenLabs API (TTS, Conversational AI)
- **AI/LLM:** Google Vertex AI / Gemini
- **State:** React Context + localStorage (no database for MVP)
- **Hosting:** Vercel

## Required Hackathon Technologies

1. **ElevenLabs** — Must use for voice synthesis
2. **Google Cloud (Vertex AI / Gemini)** — Must use for AI logic
3. Integration between both is required

## MVP Features (Must Complete)

1. 30-50 curated AI lessons
2. 3 learning paths (Explorer, Practitioner, Specialist)
3. Audio lesson generation via ElevenLabs
4. Voice Q&A (ask questions, get audio answers)
5. Quiz assessment after lessons
6. Gap detection (topic mastery tracking)
7. Adaptive routing (recommend next lesson based on gaps)
8. Progress dashboard

## Reusable Assets from Other Projects

- **AI-matcher** (`../AI-matcher-AWS-hackathon/`) — Semantic scoring algorithm (74.9% accuracy)
- **learningai365** (`../learningai/`) — Course database, learning path taxonomy
- **Claude Code Recipes** (`../premium-claude-code-recipes/`) — Potential audio content

## Content Sources (Open Source)

- fast.ai course materials
- Hugging Face tutorials
- PyTorch documentation
- TensorFlow guides
- Kaggle Learn courses

## Key Architecture Decisions

1. **No database** — Use localStorage for session state (simplicity for hackathon)
2. **Pre-curated content** — No real-time content aggregation
3. **Pre-generated audio** — Cache where possible, generate on-demand for Q&A
4. **Simple gap model** — Completion + quiz scores, not knowledge graph

## API Routes Needed

| Route | Purpose |
|-------|---------|
| `/api/audio/generate` | Text → ElevenLabs → Audio |
| `/api/chat/respond` | Question → Gemini → Response |
| `/api/quiz/evaluate` | Answer → Gemini → Feedback |
| `/api/adapt/recommend` | User state → Next lesson |

## Demo Flow (for video)

1. User arrives → selects learning path
2. Starts first lesson → audio plays
3. Asks a question via voice → gets audio answer
4. Takes quiz → gets feedback
5. System detects gap → recommends review
6. Dashboard shows progress and gaps

## Coding Guidelines

- Use TypeScript strict mode
- Components in `src/components/`
- API routes in `src/app/api/`
- Content in `content/` folder (JSON/MDX)
- Keep it simple — MVP over perfection
- Test the demo flow frequently

## Timeline Pressure

- 18 days total
- Days 1-9: Core features
- Days 10-13: Polish
- Days 14-18: Demo video and submission
- Buffer built into Days 14-16

## What NOT to Build

- User authentication
- Database persistence
- Multi-voice podcast discussions
- Mobile app
- Real-time content aggregation
- Spaced repetition system

## Success Metrics

- Demo video works flawlessly
- All 7 core features functional
- UI is polished, not rough
- Judges can understand the value immediately
