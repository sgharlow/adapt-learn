# AdaptLearn - DevPost Submission (READY TO SUBMIT)

**Deadline:** December 31, 2025 @ 2:00pm PST (8 days remaining)
**Last Updated:** December 23, 2025 (final review pass, all assets verified)

---

## SUBMISSION URLS

| Field           | URL                                              |
| --------------- | ------------------------------------------------ |
| **Live Demo**   | https://adapt-learn-rosy.vercel.app              |
| **GitHub Repo** | https://github.com/sgharlow/adapt-learn          |
| **Demo Video**  | [PENDING - upload demo-recording.mp4 to YouTube] |

---

## FORM FIELD: Project Name

```
AdaptLearn: Voice-First Adaptive AI Learning Platform
```

---

## FORM FIELD: Tagline (140 characters max)

```
Learn AI like you listen to podcasts — adaptive audio lessons that find your gaps.
```

---

## FORM FIELD: About (Description) - COPY THIS ENTIRE SECTION

### The Problem

Learning AI and machine learning is challenging. Traditional resources are text-heavy, require dedicated screen time, and follow a one-size-fits-all approach. Busy professionals, commuters, and multitaskers are left behind.

The online education landscape just consolidated dramatically — Coursera is acquiring Udemy in a $2.5 billion merger, creating a 270-million-learner giant focused on enterprise workforce training. But this consolidation leaves critical gaps:

- **Discovery overwhelm:** Tens of thousands of courses with no personalized guidance
- **Enterprise focus:** Platforms optimizing for corporate L&D, not individual learners
- **Screen-bound content:** Traditional video lectures that don't fit modern lifestyles
- **One-size-fits-all:** No true adaptive learning at scale

Meanwhile, podcast listeners have proven that audio learning is powerful — but there's no "Duolingo for AI" that combines audio-first learning with adaptive personalization.

### Why Now?

As education giants consolidate around enterprise sales and video content, a massive opportunity emerges for accessible, personalized learning experiences. We're building what the giants can't: voice-first education that adapts to YOU, not your employer's training budget.

### Our Solution

**AdaptLearn** reimagines AI education as a voice-first experience. Think Duolingo meets NotebookLM — every lesson is available as natural, engaging audio powered by ElevenLabs, while Google Gemini provides intelligent Q&A and adaptive recommendations.

While platforms consolidate around enterprise, we pioneer accessible voice-first learning for individuals.

### Key Features

**1. Voice-First Learning**
Every lesson is synthesized into natural, professional audio using ElevenLabs' Multilingual v2 model. Learn about neural networks while commuting, understand transformers during your workout, or explore NLP concepts while cooking dinner.

**2. Adaptive Knowledge Tracking**
Our gap detection system monitors your quiz performance across topics. Score below 70%? The system identifies your weak areas and recommends targeted review lessons. No more guessing what to study next.

**3. AI-Powered Q&A**
Confused about a concept? Just ask! Our AI tutor, powered by Google Gemini, provides context-aware explanations. And yes — the response is spoken back to you using ElevenLabs, maintaining the audio-first experience.

**4. Ten Curated Learning Paths**

- **AI Explorer:** Perfect for beginners — understand AI without coding
- **AI Practitioner:** For developers ready to build ML applications
- **AI Specialist:** Deep dive into transformers, LLMs, and advanced topics
- **NLP Focus:** Specialize in language AI, chatbots, and text processing
- **Generative AI:** Learn how AI creates text, images, audio, and video
- **Prompt Engineering:** Master the art of communicating with AI
- **Computer Vision:** Understand how AI sees and processes images
- **AI Ethics:** Explore bias, fairness, safety, and privacy in AI
- **AI Tools & APIs:** Build applications with language models and voice AI
- **AI for Business:** Strategy, use cases, and managing AI projects

**5. Progress Dashboard**
Track your learning journey with visual progress indicators, topic mastery heatmaps, streak tracking, and personalized next-step recommendations.

### Why Voice-First?

- **Accessibility:** Learn during activities where screens aren't practical
- **Retention:** Audio learning engages different cognitive pathways
- **Flexibility:** Podcast-style learning fits modern lifestyles
- **Engagement:** Natural voices (ElevenLabs) are more engaging than robotic TTS

---

## FORM FIELD: How We Built It

### Technology Stack

| Layer           | Technology                    | Purpose                         |
| --------------- | ----------------------------- | ------------------------------- |
| Frontend        | Next.js 16, React, TypeScript | Modern web application          |
| Styling         | Tailwind CSS                  | Responsive, polished UI         |
| Voice Synthesis | ElevenLabs API                | Natural text-to-speech          |
| AI/LLM          | Google Gemini (Vertex AI)     | Contextual Q&A, quiz evaluation |
| State           | React Context + localStorage  | Client-side progress tracking   |
| Hosting         | Vercel                        | Serverless deployment           |

### ElevenLabs Integration

We use ElevenLabs' **Multilingual v2** model for all audio generation with optimized voice settings for educational content:

- Text-to-speech for lesson narration
- Conversational audio for Q&A responses
- Audio caching for instant playback
- Speed control (0.75x to 2x)

### Google Gemini Integration

Gemini powers our intelligent features:

1. **Contextual Q&A:** Questions are answered with lesson context for relevant explanations
2. **Quiz Evaluation:** Gemini provides personalized feedback on quiz answers
3. **Adaptive Recommendations:** AI considers gaps, prerequisites, and learning history

---

## FORM FIELD: Challenges We Faced

1. **Audio Generation Latency** - Generating audio on-demand caused noticeable delays. We implemented aggressive caching with localStorage and pre-generation for demo lessons.

2. **Voice Naturalness** - Educational content can sound robotic with default TTS settings. We tuned ElevenLabs voice settings specifically for instructional content.

3. **Context-Aware Q&A** - Generic AI responses weren't helpful for lesson-specific questions. We inject full lesson context into Gemini prompts for accurate, relevant answers.

4. **Adaptive Complexity** - Building a full knowledge graph was too complex for the hackathon timeline. We simplified to topic-based mastery scores with quiz-driven gap detection.

---

## FORM FIELD: Accomplishments We're Proud Of

- **Seamless ElevenLabs + Gemini Integration:** Voice synthesis and AI reasoning work together naturally
- **True Audio-First Experience:** Not just an afterthought — voice is the primary interface
- **Professional UI/UX:** Polished, responsive design that doesn't feel like a hackathon project
- **42 Lessons, 10 Paths, ~12 Hours of Content:** Comprehensive coverage of ML, deep learning, NLP, generative AI, ethics, and more
- **Production-Ready:** Deployed live at adapt-learn-rosy.vercel.app with real API integrations
- **Working Adaptive System:** Gap detection and recommendations actually work in practice

---

## FORM FIELD: What We Learned

1. **ElevenLabs is Production-Ready:** The Multilingual v2 model produces genuinely natural speech that enhances learning
2. **Audio Caching is Critical:** Real-time generation works, but cached audio dramatically improves UX
3. **Simplicity Wins:** Our streamlined adaptive logic is more effective than a complex knowledge graph
4. **Voice Settings Matter:** Small tweaks to stability and style make a big difference in educational content

---

## FORM FIELD: What's Next

### Short-Term

- User authentication and cloud persistence
- Spaced repetition for review scheduling
- Mobile app (React Native)
- Additional lessons in emerging AI topics

### Business Model

- **Freemium for individuals** — Core learning paths free, premium content unlocked
- **Team plans** — For bootcamps, study groups, and corporate training
- **Content creator partnerships** — Revenue share with AI educators

### Long-Term Vision

As education giants consolidate around enterprise B2B, we see a future where individual learners deserve better:

- **Multi-voice podcast-style discussions** — AI experts debating concepts in your ears
- **Community-contributed content** — Democratizing AI education creation
- **Cross-platform integration** — Learn from the best content regardless of source
- **Expanded subjects** — Data science, cloud computing, cybersecurity
- **Accessibility-first** — Serving learners underserved by screen-based platforms

The $2.5B Coursera-Udemy merger validates the AI education market. We're building the personalized, accessible alternative that individuals deserve.

---

## FORM FIELD: Built With (comma separated)

```
elevenlabs, google-gemini, vertex-ai, nextjs, react, typescript, tailwindcss, vercel
```

---

## FORM FIELD: Challenges

```
ElevenLabs Challenge
```

---

## SCREENSHOTS (VERIFIED - all 7 files present in /screenshots folder)

| #   | File                               | Description           |
| --- | ---------------------------------- | --------------------- |
| 1   | adapt-learn-01-landing-hero.png    | Landing page hero     |
| 2   | adapt-learn-02-learning-paths.png  | Learning paths grid   |
| 3   | adapt-learn-03-lesson-player.png   | Audio lesson player   |
| 4   | adapt-learn-04-ai-chat.png         | Voice Q&A chat        |
| 5   | adapt-learn-05-quiz.png            | Quiz with feedback    |
| 6   | adapt-learn-06-dashboard.png       | Progress dashboard    |
| 7   | adapt-learn-thumbnail-1280x720.png | Thumbnail for gallery |

---

Google Generative AI (Gemini API)

- Model: gemini-2.0-flash
- Used for:
  - AI-powered Q&A conversational responses (/api/chat/respond)
  - Intelligent quiz evaluation and personalized feedback (/api/quiz/evaluate)
  - Adaptive learning recommendations based on knowledge gaps
- API Endpoint: generativelanguage.googleapis.com

---

AI/Voice Services:

- ElevenLabs API - Text-to-speech for audio lessons (voice: Sarah, model: eleven_multilingual_v2)
  Frontend Framework:

- Next.js 16.0.10 - React framework with SSR and API routes

- React 18 - UI components and state management

- TypeScript 5 - Type-safe development

- Tailwind CSS 3.4.1 - Styling
  Browser APIs:

- Web Speech API - Voice input/recognition

- Web Audio API - Audio playback

- localStorage - Client-side progress persistence
  Deployment & Hosting:

- Vercel - Serverless deployment platform
  Development Tools:

- Node.js - Runtime for scripts

- ESLint - Code linting

- Playwright 1.57.0 - Browser automation/testing

- PostCSS - CSS processing
  Content Management:

- JSON-based lesson and learning path storage (42 lessons, 10 learning paths)
  
  ---
  
  

## REMAINING TASKS BEFORE SUBMISSION

- [x] Make GitHub repository PUBLIC ✅ DONE
- [x] Record demo video (demo-recording.mp4, 1.4 MB) ✅ DONE
- [x] Capture 7 screenshots (all verified present)
- [ ] **Upload video to YouTube (unlisted)** <- USER ACTION REQUIRED
- [ ] Fill out DevPost form and submit

---

## PROJECT STATISTICS

| Metric           | Count |
| ---------------- | ----- |
| Lessons          | 42    |
| Learning Paths   | 10    |
| Screenshots      | 7     |
| React Components | 15+   |
| API Routes       | 6     |

---

*Ready to submit as of December 23, 2025 — pending YouTube upload*
