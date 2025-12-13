# AdaptLearn

**Voice-First Adaptive AI Learning Platform**

*AI Partner Catalyst Hackathon - ElevenLabs Track*

---

## What is AdaptLearn?

AdaptLearn is an AI-powered learning platform that generates personalized audio lessons, identifies knowledge gaps through voice interaction, and dynamically adjusts your learning path.

**Think: Duolingo meets NotebookLM for AI skills.**

### The Problem

- AI skills gap is massive — demand far exceeds supply
- Traditional video courses have 5-15% completion rates
- Busy professionals have limited time for learning
- One-size-fits-all education doesn't work

### The Solution

- **Learn anywhere** — Voice-first means learning during commute, exercise, or chores
- **Adaptive paths** — System detects gaps and adjusts recommendations
- **Conversational** — Ask questions, get answers like a personal tutor
- **Proven matching** — Built on 74.9% accuracy semantic matching algorithm

---

## Features

- **30+ AI Lessons** — Curated from fast.ai, Hugging Face, PyTorch
- **3 Learning Paths** — Explorer, Practitioner, Specialist
- **Audio Generation** — High-quality voice lessons via ElevenLabs
- **Voice Q&A** — Ask questions, get audio explanations
- **Gap Detection** — Track mastery, identify weak areas
- **Adaptive Routing** — Smart recommendations based on your progress

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Voice | ElevenLabs API |
| AI/LLM | Google Vertex AI / Gemini |
| Hosting | Vercel |
| State | React Context + localStorage |

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/sgharlow/adapt-learn.git
cd adapt-learn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

```env
# ElevenLabs
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_VOICE_ID=your_voice_id

# Google Cloud
GOOGLE_CLOUD_PROJECT=your_project
GOOGLE_API_KEY=your_api_key
```

---

## Project Structure

```
adapt-learn/
├── docs/                    # Documentation
│   ├── HACKATHON-REQUIREMENTS.md
│   ├── FULL-PROJECT-VISION.md
│   └── IMPLEMENTATION-PLAN.md
├── content/                 # Lesson content
│   ├── lessons/            # Individual lessons
│   └── paths/              # Learning path definitions
├── src/
│   ├── app/                # Next.js app router
│   ├── components/         # React components
│   ├── lib/                # Utilities, API clients
│   └── types/              # TypeScript types
└── public/                 # Static assets
```

---

## Hackathon Submission

**Track:** ElevenLabs Challenge

**Technologies Used:**
- ElevenLabs (Voice synthesis, Conversational AI)
- Google Cloud Vertex AI / Gemini (LLM, Embeddings)
- Next.js 14 (Frontend framework)
- Vercel (Hosting)

**Judging Criteria:**
- Technological Implementation
- Design & User Experience
- Potential Impact
- Quality of the Idea

---

## Team

Built by [Steve Gharlow](https://github.com/sgharlow) for the AI Partner Catalyst Hackathon 2025.

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- Content adapted from [fast.ai](https://fast.ai), [Hugging Face](https://huggingface.co), [PyTorch](https://pytorch.org)
- Voice synthesis by [ElevenLabs](https://elevenlabs.io)
- AI powered by [Google Gemini](https://cloud.google.com/vertex-ai)
