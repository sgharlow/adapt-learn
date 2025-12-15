# AdaptLearn - Devpost Submission

**Hackathon:** AI Partner Catalyst Hackathon
**Track:** ElevenLabs Challenge
**Deadline:** December 31, 2025 @ 2:00pm PST

---

## Project Title

**AdaptLearn: Voice-First Adaptive AI Learning Platform**

---

## Tagline

*Learn AI like you listen to podcasts — personalized audio lessons that adapt to your knowledge gaps.*

---

## Project Description

### The Problem

Learning AI and machine learning is challenging. Traditional resources are text-heavy, require dedicated screen time, and follow a one-size-fits-all approach. Busy professionals, commuters, and multitaskers are left behind. Meanwhile, podcast listeners have proven that audio learning is powerful — but there's no "Duolingo for AI" that combines audio-first learning with adaptive personalization.

### Our Solution

**AdaptLearn** reimagines AI education as a voice-first experience. Think Duolingo meets NotebookLM — every lesson is available as natural, engaging audio powered by ElevenLabs, while Google Gemini provides intelligent Q&A and adaptive recommendations.

### Key Features

**1. Voice-First Learning**
Every lesson is synthesized into natural, professional audio using ElevenLabs' Multilingual v2 model. Learn about neural networks while commuting, understand transformers during your workout, or explore NLP concepts while cooking dinner.

**2. Adaptive Knowledge Tracking**
Our gap detection system monitors your quiz performance across topics. Score below 70%? The system identifies your weak areas and recommends targeted review lessons. No more guessing what to study next.

**3. AI-Powered Q&A**
Confused about a concept? Just ask! Our AI tutor, powered by Google Gemini, provides context-aware explanations. And yes — the response is spoken back to you using ElevenLabs, maintaining the audio-first experience.

**4. Four Curated Learning Paths**
- **AI Explorer:** Perfect for beginners — understand AI without coding
- **AI Practitioner:** For developers ready to build ML applications
- **AI Specialist:** Deep dive into transformers, LLMs, and advanced topics
- **NLP Focus:** Specialize in language AI, chatbots, and text processing

**5. Progress Dashboard**
Track your learning journey with visual progress indicators, topic mastery heatmaps, streak tracking, and personalized next-step recommendations.

### Why Voice-First?

- **Accessibility:** Learn during activities where screens aren't practical
- **Retention:** Audio learning engages different cognitive pathways
- **Flexibility:** Podcast-style learning fits modern lifestyles
- **Engagement:** Natural voices (ElevenLabs) are more engaging than robotic TTS

---

## How We Built It

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16, React, TypeScript | Modern web application |
| Styling | Tailwind CSS | Responsive, polished UI |
| Voice Synthesis | ElevenLabs API | Natural text-to-speech |
| AI/LLM | Google Gemini (Vertex AI) | Contextual Q&A, quiz evaluation |
| State | React Context + localStorage | Client-side progress tracking |
| Hosting | Vercel | Serverless deployment |

### ElevenLabs Integration

We use ElevenLabs' **Multilingual v2** model for all audio generation:

```typescript
// Optimized voice settings for educational content
const VOICE_SETTINGS = {
  stability: 0.65,          // Clear pronunciation
  similarity_boost: 0.75,   // Voice consistency
  style: 0.35,              // Moderate expressiveness
  use_speaker_boost: true,  // Enhanced clarity
};
```

**Features leveraged:**
- Text-to-speech for lesson narration
- Conversational audio for Q&A responses
- Audio caching for instant playback
- Speed control (0.75x to 2x)

### Google Gemini Integration

Gemini powers our intelligent features:

1. **Contextual Q&A:** Questions are answered with lesson context for relevant explanations
2. **Quiz Evaluation:** Gemini provides personalized feedback on quiz answers
3. **Adaptive Recommendations:** AI considers gaps, prerequisites, and learning history

### Adaptive Learning Algorithm

```
Topic Mastery = (Quiz Score × 0.7) + (Completion × 0.3)

If Mastery < 70%:
  → Flag as knowledge gap
  → Recommend review lessons
  → Adjust learning path
```

---

## How It Works

### 1. Take the Assessment
New users answer 6 quick questions about their coding experience, goals, and interests. Based on their responses, AdaptLearn recommends the most suitable learning path.

### 2. Start Learning with Audio
Each lesson is available as an audio experience. Click play and listen to natural, engaging explanations of AI concepts — perfect for learning on the go.

### 3. Ask Questions Anytime
Don't understand something? Open the AI tutor chat and ask. Questions are answered with full lesson context, and responses are spoken back to you.

### 4. Test Your Knowledge
After each lesson, a quick quiz tests your understanding. Get instant feedback with explanations for each answer.

### 5. Discover Your Gaps
The system tracks your performance across topics. Areas where you score below 70% are flagged as knowledge gaps, with recommendations for review.

### 6. Follow Your Personalized Path
The dashboard shows your progress, celebrates milestones, and provides AI-powered recommendations for what to learn next.

---

## Challenges We Faced

### 1. Audio Generation Latency
**Challenge:** Generating audio on-demand caused noticeable delays.
**Solution:** Implemented aggressive caching with localStorage and pre-generation for demo lessons.

### 2. Voice Naturalness
**Challenge:** Educational content can sound robotic with default TTS settings.
**Solution:** Tuned ElevenLabs voice settings specifically for instructional content — higher stability for clarity, moderate style for engagement.

### 3. Context-Aware Q&A
**Challenge:** Generic AI responses weren't helpful for lesson-specific questions.
**Solution:** Inject full lesson context into Gemini prompts, enabling accurate, relevant answers.

### 4. Adaptive Complexity
**Challenge:** Building a full knowledge graph was too complex for the hackathon timeline.
**Solution:** Simplified to topic-based mastery scores with quiz-driven gap detection — effective and achievable.

---

## Accomplishments We're Proud Of

- **Seamless ElevenLabs + Gemini Integration:** Voice synthesis and AI reasoning work together naturally
- **True Audio-First Experience:** Not just an afterthought — voice is the primary interface
- **Professional UI/UX:** Polished, responsive design that doesn't feel like a hackathon project
- **19 Curated Lessons:** Quality content across ML fundamentals, deep learning, NLP, and practical AI
- **Working Adaptive System:** Gap detection and recommendations actually work in practice

---

## What We Learned

1. **ElevenLabs is Production-Ready:** The Multilingual v2 model produces genuinely natural speech that enhances learning
2. **Audio Caching is Critical:** Real-time generation works, but cached audio dramatically improves UX
3. **Simplicity Wins:** Our streamlined adaptive logic is more effective than a complex knowledge graph
4. **Voice Settings Matter:** Small tweaks to stability and style make a big difference in educational content

---

## What's Next for AdaptLearn

### Short-Term
- User authentication and cloud persistence
- More lessons (target: 50+)
- Spaced repetition for review scheduling
- Mobile app (React Native)

### Long-Term
- Multi-voice podcast-style discussions
- Community-contributed content
- Enterprise training integration
- Additional subject areas (data science, cloud, etc.)

---

## Try It Out

- **Live Demo:** [Vercel URL]
- **GitHub:** [Repository URL]
- **Demo Video:** [YouTube URL]

---

## Built With

- elevenlabs
- google-gemini
- vertex-ai
- nextjs
- react
- typescript
- tailwindcss
- vercel

---

## Team

[Your name/team info here]

---

*Built for the AI Partner Catalyst Hackathon — ElevenLabs Track*
