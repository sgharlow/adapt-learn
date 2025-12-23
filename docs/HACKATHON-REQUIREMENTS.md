# AdaptLearn: Hackathon MVP Requirements

**AI Partner Catalyst Hackathon - ElevenLabs Track**

**Submission Deadline:** December 31, 2025 @ 2:00pm PST

**Build Window:** 18 days (December 13-31, 2025)

---

## Executive Summary

AdaptLearn is an adaptive AI learning platform that generates personalized audio lessons, identifies knowledge gaps through voice interaction, and dynamically adjusts learning paths. Think "Duolingo meets NotebookLM for AI skills."

### The Pitch (30 seconds)

> "Learning AI shouldn't require sitting at a desk. AdaptLearn generates personalized audio lessons from open-source AI content, quizzes you through natural conversation, identifies your knowledge gaps, and dynamically adjusts your learning path — all through voice. Learn AI during your commute, at the gym, or while cooking dinner."

---

## Hackathon Requirements

### Required Technologies

| Technology | Role | Status |
|------------|------|--------|
| **ElevenLabs** | Voice synthesis, conversational AI agent | Required |
| **Google Cloud Vertex AI / Gemini** | Content understanding, adaptive logic, embeddings | Required |
| **Google Cloud Platform** | Hosting, serverless functions | Required |

### Judging Criteria (from hackathon)

| Criterion | Weight | Our Strategy |
|-----------|--------|--------------|
| **Technological Implementation** | 25% | Semantic matching + adaptive routing + audio generation |
| **Design & User Experience** | 25% | Voice-first, progress visualization, seamless flow |
| **Potential Impact** | 25% | Democratize AI education, accessibility, busy professionals |
| **Quality of the Idea** | 25% | NotebookLM + Duolingo + proven AI-matcher = novel combination |

---

## MVP Scope Definition

### In Scope (Must Have)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Content Library** | 30-50 curated AI lessons from open sources | P0 |
| **3 Learning Paths** | Beginner, Practitioner, Specialist tracks | P0 |
| **Audio Lesson Generation** | ElevenLabs TTS for lesson content | P0 |
| **Voice Q&A** | Ask questions, get audio explanations | P0 |
| **Quiz Assessment** | Voice or text-based knowledge checks | P0 |
| **Gap Detection** | Track completion + quiz scores per topic | P0 |
| **Adaptive Routing** | Recommend next lesson based on gaps | P0 |
| **Progress Dashboard** | Visual path progress, gap highlights | P0 |
| **Demo Video** | 3-5 minute walkthrough | P0 |

### Out of Scope (Post-Hackathon)

| Feature | Reason |
|---------|--------|
| Multi-voice podcast discussions | Time constraint |
| Sophisticated knowledge graph | Complexity |
| Mobile app | Web-first for hackathon |
| Real-time content aggregation | Pre-curate for demo |
| User accounts / persistence | Use session storage |
| Spaced repetition | Nice-to-have |
| Social features | Not core value |

---

## Functional Requirements

### FR-1: Content Library

**FR-1.1** System shall store 30-50 curated lessons covering AI fundamentals

**FR-1.2** Each lesson shall contain:
- Unique ID
- Title
- Topic category (e.g., "Neural Networks", "NLP", "Computer Vision")
- Difficulty level (Beginner/Intermediate/Advanced)
- Text content (500-1000 words)
- Key concepts list
- Quiz questions (3-5 per lesson)
- Prerequisite lesson IDs
- Estimated duration (5-15 minutes)

**FR-1.3** Content sources shall include:
- fast.ai course materials (with attribution)
- Hugging Face tutorials
- PyTorch documentation
- TensorFlow guides
- Claude Code recipe excerpts (for practical application)

**FR-1.4** Content shall be organized into topic clusters:
- ML Fundamentals (10 lessons)
- Deep Learning (10 lessons)
- NLP & Transformers (10 lessons)
- Computer Vision (5 lessons)
- Practical AI Tools (10 lessons)
- AI Productivity with Claude Code (5 lessons)

### FR-2: Learning Paths

**FR-2.1** System shall provide 3 predefined learning paths:

| Path | Target Audience | Lessons | Duration |
|------|-----------------|---------|----------|
| **AI Explorer** | Complete beginners, curious professionals | 15 | ~3 hours |
| **AI Practitioner** | Developers learning ML basics | 25 | ~6 hours |
| **AI Specialist** | Engineers going deep on specific topics | 35 | ~10 hours |

**FR-2.2** Each path shall define:
- Ordered sequence of lessons
- Required vs optional lessons
- Milestone checkpoints
- Completion criteria

**FR-2.3** System shall recommend a path based on initial assessment quiz

### FR-3: Audio Generation

**FR-3.1** System shall generate audio for:
- Lesson explanations (full lesson content)
- Concept summaries (30-60 second overviews)
- Quiz question narration
- Feedback on quiz answers
- Adaptive recommendations

**FR-3.2** Audio generation shall use ElevenLabs API with:
- Consistent voice persona ("AI Tutor" voice)
- Natural pacing and intonation
- Support for technical terminology

**FR-3.3** Audio shall be generated:
- On-demand for Q&A responses
- Pre-generated for lesson content (cached)

**FR-3.4** Audio player shall support:
- Play/pause
- Speed adjustment (0.75x, 1x, 1.25x, 1.5x)
- Skip forward/back 10 seconds
- Progress indicator

### FR-4: Voice Q&A

**FR-4.1** System shall accept voice input for questions using ElevenLabs conversational AI

**FR-4.2** System shall understand questions about:
- Current lesson content
- Clarification of concepts
- "What should I learn next?"
- "What are my weak areas?"
- "Explain [concept] in simpler terms"

**FR-4.3** System shall respond with contextual audio answers using:
- Gemini for understanding and response generation
- ElevenLabs for audio synthesis

**FR-4.4** Conversation context shall persist within a session

### FR-5: Quiz Assessment

**FR-5.1** Each lesson shall have 3-5 quiz questions

**FR-5.2** Question types supported:
- Multiple choice (voice: "Is it A, B, C, or D?")
- True/False
- Short explanation prompts

**FR-5.3** System shall evaluate answers using Gemini for:
- Exact match (multiple choice)
- Semantic understanding (explanations)

**FR-5.4** System shall provide immediate feedback:
- Correct: Audio confirmation + brief reinforcement
- Incorrect: Audio explanation of correct answer + concept review

**FR-5.5** Quiz scores shall be stored per lesson per session

### FR-6: Gap Detection

**FR-6.1** System shall track for each topic:
- Lessons completed
- Quiz scores (percentage)
- Time spent
- Questions asked

**FR-6.2** Gap detection algorithm:
```
Topic Mastery Score = (
  (Lessons Completed / Total Lessons) * 0.4 +
  (Average Quiz Score) * 0.5 +
  (Engagement Score) * 0.1
)

Gap Threshold: Score < 70% = Gap Identified
```

**FR-6.3** System shall identify:
- Topics with low mastery scores
- Prerequisite gaps (failed advanced topic, missing basics)
- Stale topics (completed long ago, may need refresh)

### FR-7: Adaptive Routing

**FR-7.1** After each lesson/quiz, system shall recommend next action:
- Continue to next lesson in path
- Review prerequisite (if gap detected)
- Take a different path branch
- Celebrate milestone achievement

**FR-7.2** Recommendations shall be:
- Announced via audio
- Displayed in UI
- Explained with reasoning ("You scored 50% on backpropagation - let's review the fundamentals first")

**FR-7.3** User can accept recommendation or choose manually

### FR-8: Progress Dashboard

**FR-8.1** Dashboard shall display:
- Current path progress (visual progress bar)
- Topic mastery heatmap (green/yellow/red)
- Recent activity timeline
- Recommended next steps
- Total time invested

**FR-8.2** Path visualization shall show:
- Completed lessons (checkmark)
- Current lesson (highlighted)
- Upcoming lessons (dimmed)
- Gap indicators (warning icon)

**FR-8.3** Dashboard shall be accessible via voice command: "Show my progress"

---

## Non-Functional Requirements

### NFR-1: Performance

- Audio generation latency: < 3 seconds for responses
- Page load time: < 2 seconds
- Voice recognition response: < 1 second

### NFR-2: Reliability

- System shall handle API failures gracefully
- Fallback to text if audio fails
- Session data persisted to localStorage

### NFR-3: Accessibility

- All audio content shall have text transcripts
- UI shall be keyboard navigable
- Color contrast shall meet WCAG AA

### NFR-4: Security

- No user authentication required (session-based)
- API keys secured server-side
- No PII collected

---

## Technical Architecture

### Stack Decision

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 | Familiar, fast, good DX |
| **Styling** | Tailwind CSS | Rapid UI development |
| **Audio** | ElevenLabs SDK | Hackathon requirement |
| **AI/LLM** | Google Vertex AI / Gemini | Hackathon requirement |
| **State** | React Context + localStorage | Simple, no backend needed |
| **Hosting** | Vercel | Fast deployment, edge functions |
| **Content** | Static JSON/MDX | Pre-curated, fast loading |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Lesson    │  │   Voice     │  │     Dashboard       │  │
│  │   Player    │  │   Q&A       │  │     & Progress      │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                   │
│                    ┌─────▼─────┐                             │
│                    │  Adaptive │                             │
│                    │  Engine   │                             │
│                    └─────┬─────┘                             │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
     ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
     │ ElevenLabs│   │  Gemini   │   │  Content  │
     │    API    │   │    API    │   │   Store   │
     │  (Voice)  │   │ (AI Logic)│   │  (Static) │
     └───────────┘   └───────────┘   └───────────┘
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/audio/generate` | POST | Generate audio from text |
| `/api/chat/respond` | POST | Get AI response to question |
| `/api/quiz/evaluate` | POST | Evaluate quiz answer |
| `/api/adapt/recommend` | POST | Get next lesson recommendation |

---

## Content Requirements

### Lesson Template

```json
{
  "id": "ml-fundamentals-01",
  "title": "What is Machine Learning?",
  "path": ["explorer", "practitioner", "specialist"],
  "topic": "ML Fundamentals",
  "difficulty": "beginner",
  "duration": 8,
  "prerequisites": [],
  "content": {
    "introduction": "Machine learning is...",
    "mainContent": "### Key Concepts\n\n...",
    "summary": "In this lesson, you learned...",
    "keyTakeaways": ["ML learns from data", "..."]
  },
  "quiz": [
    {
      "question": "What distinguishes ML from traditional programming?",
      "type": "multiple_choice",
      "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
      "correct": "B",
      "explanation": "The correct answer is B because..."
    }
  ],
  "audioUrls": {
    "full": null,
    "summary": null
  }
}
```

### Content Curation Plan

| Topic | Lessons | Primary Source | Backup Source |
|-------|---------|----------------|---------------|
| ML Fundamentals | 10 | fast.ai Chapter 1 | Google ML Crash Course |
| Deep Learning | 10 | fast.ai Chapters 2-4 | PyTorch Tutorials |
| NLP & Transformers | 10 | Hugging Face Course | fast.ai NLP |
| Computer Vision | 5 | PyTorch Vision | fast.ai Vision |
| Practical AI | 10 | Claude Code Recipes | n8n Tutorials |
| AI Tools | 5 | Original Content | Kaggle Learn |

---

## Demo Script (3-5 minutes)

### Scene 1: The Problem (30 sec)
"Busy professionals want to learn AI but can't dedicate hours to video courses. What if you could learn AI like you listen to podcasts?"

### Scene 2: Path Selection (45 sec)
- Show landing page
- Take quick assessment quiz (voice-driven)
- System recommends "AI Explorer" path
- Display personalized learning path

### Scene 3: Audio Lesson (60 sec)
- Play a lesson on "What is Machine Learning?"
- Show audio player with speed controls
- Demonstrate transcript toggle
- Highlight key concepts appearing on screen

### Scene 4: Voice Q&A (60 sec)
- Ask: "Can you explain supervised learning in simpler terms?"
- System generates contextual audio response
- Ask: "What's an example from real life?"
- Show conversational flow

### Scene 5: Quiz & Adaptation (60 sec)
- Take voice quiz after lesson
- Get one wrong intentionally
- Show gap detection: "Looks like supervised vs unsupervised is still fuzzy"
- System recommends review lesson
- Show dashboard with gap highlighted

### Scene 6: Impact (30 sec)
"AdaptLearn makes AI education accessible to anyone — during your commute, at the gym, or while cooking. Personalized learning paths, adaptive to your gaps, all through natural voice conversation."

---

## Success Metrics

### Hackathon Success

| Metric | Target |
|--------|--------|
| Demo video quality | Professional, clear, engaging |
| All required features working | 100% |
| No critical bugs in demo flow | 0 |
| Submission completeness | All fields filled |

### Technical Demonstration

| Metric | Target |
|--------|--------|
| Audio generation working | Yes |
| Voice Q&A working | Yes |
| Adaptive recommendation working | Yes |
| Gap detection working | Yes |
| UI polish level | High |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ElevenLabs API issues | Medium | High | Pre-generate key audio, have fallback text |
| Gemini rate limits | Medium | Medium | Cache responses, batch requests |
| Content curation takes too long | High | High | Start with 20 lessons, add more if time |
| Audio quality issues | Medium | Medium | Test voices early, select best |
| Adaptive logic bugs | Medium | High | Keep algorithm simple, test extensively |
| Scope creep | High | High | Strict MVP focus, parking lot for ideas |

---

## Definition of Done

A feature is complete when:
1. Functionality works as specified
2. UI is polished (not placeholder)
3. Error states handled gracefully
4. Audio/voice interactions tested
5. Works in demo flow

---

## Appendix: Hackathon Submission Checklist

- [ ] Project title and tagline
- [ ] Detailed description
- [ ] Demo video (3-5 min, unlisted YouTube)
- [ ] Screenshots (4-6)
- [ ] Technologies used
- [ ] Link to live demo
- [ ] Link to source code (GitHub)
- [ ] Team information
- [ ] Acknowledgments / attributions

---

*Document Version: 1.0*
*Created: December 13, 2025*
*Author: Steve Harlow*
