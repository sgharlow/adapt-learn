# AdaptLearn Submission Assets Guide

**Purpose:** Prepare all visual assets for Devpost hackathon submission
**Deadline:** December 31, 2025 @ 2:00pm PST

---

## Required Assets

| Asset | Quantity | Format | Status |
|-------|----------|--------|--------|
| Demo Video | 1 | YouTube (unlisted) | [ ] |
| Screenshots | 6 | PNG/JPG, 1280x720+ | [ ] |
| Thumbnail | 1 | PNG/JPG, 1280x720 | [ ] |
| Logo (optional) | 1 | PNG, transparent | [ ] |

---

## Screenshot Specifications

### Technical Requirements

```
Resolution: 1280x720 minimum (1920x1080 preferred)
Format: PNG (lossless) or JPG (high quality)
Aspect Ratio: 16:9
File Size: Under 5MB each
```

### Browser Setup for Screenshots

1. Set browser window to 1920x1080
2. Hide bookmarks bar
3. Use Chrome/Edge for best rendering
4. Set zoom to 100%
5. Clear any notifications

### Screenshot Tool Options

- **Windows:** Win+Shift+S (Snipping Tool) or ShareX
- **Mac:** Cmd+Shift+4 or CleanShot X
- **Browser:** Full Page Screen Capture extension

---

## 6 Required Screenshots

### Screenshot 1: Landing Page Hero

**URL:** `http://localhost:3000/`

**What to Capture:**
- Full hero section with tagline
- "Learn AI like you listen to podcasts"
- Start Learning button visible
- Clean, professional first impression

**Caption:**
> "AdaptLearn's landing page introduces voice-first AI learning with a clear value proposition and easy onboarding."

**Tips:**
- Capture above the fold
- Ensure gradient background renders well
- Logo and navigation visible

---

### Screenshot 2: Learning Paths

**URL:** `http://localhost:3000/` (scroll down)

**What to Capture:**
- All 4 learning path cards visible
- AI Explorer, AI Practitioner, AI Specialist, NLP Focus
- Path descriptions and difficulty levels
- Visual icons/colors

**Caption:**
> "Four curated learning paths cater to different skill levels, from curious beginners to advanced specialists."

**Tips:**
- Center all 4 cards in frame
- Hover effect on one card (optional)
- Show the variety of options

---

### Screenshot 3: Audio Lesson Player

**URL:** `http://localhost:3000/lesson/ml-fundamentals-01`

**What to Capture:**
- Audio player in prominent position
- Waveform visualization (if playing)
- Lesson title visible
- Play/pause, speed controls
- Learning objectives section

**Caption:**
> "Every lesson is available as an audio experience powered by ElevenLabs, perfect for learning on the go."

**Tips:**
- Show audio player in "playing" state if possible
- Ensure lesson content is visible below
- Highlight the voice-first nature

---

### Screenshot 4: Voice Q&A Chat

**URL:** `http://localhost:3000/lesson/ml-fundamentals-01` (open chat)

**What to Capture:**
- Chat panel open on right side
- A question and AI response visible
- Audio response indicator
- Quick action buttons

**Caption:**
> "Ask questions anytime - our AI tutor powered by Google Gemini responds with context-aware audio answers."

**Tips:**
- Have a real Q&A exchange shown
- Example: "What is supervised learning?"
- Show the integration of ElevenLabs + Gemini

---

### Screenshot 5: Quiz with Feedback

**URL:** `http://localhost:3000/lesson/ml-fundamentals-01` (during quiz)

**What to Capture:**
- Quiz question displayed
- Answer options visible
- Feedback after answering (correct or incorrect)
- Score/progress indicator

**Caption:**
> "Interactive quizzes after each lesson test understanding and identify knowledge gaps for personalized recommendations."

**Tips:**
- Show feedback state (green for correct, explanation visible)
- Quiz UI should look polished
- Progress indicator visible

---

### Screenshot 6: Dashboard with Progress

**URL:** `http://localhost:3000/dashboard?demo=progress` or `?demo=gaps`

**What to Capture:**
- Progress ring/stats
- Topic mastery heatmap
- AI recommendation card
- Recent activity or streak
- Overall dashboard layout

**Caption:**
> "The personalized dashboard tracks progress, visualizes topic mastery, and provides AI-powered next-step recommendations."

**Tips:**
- Use `?demo=progress` for populated data
- Show multiple dashboard sections
- Highlight the adaptive recommendations

---

## Screenshot Captions Summary

Copy these for Devpost submission:

```
1. Landing Page Hero
"AdaptLearn's landing page introduces voice-first AI learning with a clear value proposition and easy onboarding."

2. Learning Paths
"Four curated learning paths cater to different skill levels, from curious beginners to advanced specialists."

3. Audio Lesson Player
"Every lesson is available as an audio experience powered by ElevenLabs, perfect for learning on the go."

4. Voice Q&A Chat
"Ask questions anytime - our AI tutor powered by Google Gemini responds with context-aware audio answers."

5. Quiz with Feedback
"Interactive quizzes after each lesson test understanding and identify knowledge gaps for personalized recommendations."

6. Dashboard with Progress
"The personalized dashboard tracks progress, visualizes topic mastery, and provides AI-powered next-step recommendations."
```

---

## Thumbnail Design Guide

### Specifications

```
Size: 1280x720 pixels (16:9)
Format: PNG or JPG
File Size: Under 2MB
```

### Design Elements to Include

1. **App Name:** "AdaptLearn" in bold
2. **Tagline:** "Voice-First AI Learning"
3. **Visual Elements:**
   - Audio waveform graphic
   - AI/brain icon
   - Gradient background (blue/purple)
4. **Tech Badges (optional):**
   - ElevenLabs logo
   - Google Cloud/Gemini logo
5. **Call to Action:** "Learn AI Like Podcasts"

### Color Palette

```css
Primary Blue:    #3B82F6
Primary Purple:  #8B5CF6
Accent Green:    #10B981
Accent Pink:     #EC4899
Dark Background: #0F172A
```

### Design Tool Options

- **Canva:** https://canva.com (free, easy)
- **Figma:** https://figma.com (free, professional)
- **Adobe Express:** https://express.adobe.com

### Thumbnail Layout Suggestion

```
┌──────────────────────────────────────┐
│                                      │
│    🎧 AdaptLearn                     │
│                                      │
│    Voice-First Adaptive              │
│    AI Learning Platform              │
│                                      │
│    ~~~~~~~~ (waveform)               │
│                                      │
│    [ElevenLabs] [Google Gemini]      │
│                                      │
└──────────────────────────────────────┘
```

---

## Demo Video Checklist

### Before Upload

- [ ] Video is 3-5 minutes long
- [ ] Audio is clear and balanced
- [ ] All key features are demonstrated
- [ ] Intro/outro cards added
- [ ] No sensitive information visible
- [ ] Video exported in 1080p

### YouTube Upload Settings

```
Title: AdaptLearn: Voice-First Adaptive AI Learning Platform Demo
Visibility: Unlisted
Description:
Demo video for the AI Partner Catalyst Hackathon (ElevenLabs Track).
AdaptLearn is a voice-first adaptive learning platform for AI education.

Built with:
- ElevenLabs (Text-to-Speech)
- Google Gemini (AI responses)
- Next.js 16

Tags: AI, education, ElevenLabs, voice, learning, hackathon
```

### After Upload

- [ ] Copy YouTube URL
- [ ] Test that link works (unlisted = only those with link)
- [ ] Verify video plays correctly
- [ ] Add to Devpost submission

---

## File Organization

Create a folder for submission assets:

```
submission-assets/
├── screenshots/
│   ├── 01-landing-hero.png
│   ├── 02-learning-paths.png
│   ├── 03-audio-player.png
│   ├── 04-voice-chat.png
│   ├── 05-quiz-feedback.png
│   └── 06-dashboard.png
├── thumbnail/
│   └── adaptlearn-thumbnail.png
├── video/
│   └── demo-video-final.mp4
└── captions.txt
```

---

## Quick Capture URLs

| Screenshot | URL |
|------------|-----|
| Landing Hero | `http://localhost:3000/` |
| Learning Paths | `http://localhost:3000/` (scroll) |
| Audio Player | `http://localhost:3000/lesson/ml-fundamentals-01` |
| Voice Chat | `http://localhost:3000/lesson/ml-fundamentals-01` (open chat) |
| Quiz | `http://localhost:3000/lesson/ml-fundamentals-01` (start quiz) |
| Dashboard | `http://localhost:3000/dashboard?demo=progress` |
| **Thumbnail** | `http://localhost:3000/brand` |

---

## Thumbnail Generation (Easy Method)

Navigate to `/brand` and take a screenshot of the entire page:

1. Open `http://localhost:3000/brand`
2. Set browser window to exactly 1280x720 pixels
3. Take a full-page screenshot
4. Use directly as your Devpost thumbnail

This page is pre-designed with:
- Proper 1280x720 dimensions
- Gradient background
- App branding and tagline
- Tech badges (ElevenLabs, Google Gemini, Next.js)
- Audio waveform visual elements

---

## Pre-Capture Checklist

- [ ] App running locally (`npm run dev`)
- [ ] Audio plays instantly (pre-generated static files)
- [ ] Demo data loaded (`?demo=progress`)
- [ ] Browser window sized correctly
- [ ] Bookmarks bar hidden
- [ ] No notifications showing
- [ ] Screenshot tool ready

---

## Submission Deadline Reminder

**December 31, 2025 @ 2:00pm PST**

Plan to have all assets ready by December 30 to allow buffer time for any issues.

---

*Good luck with your submission!*
