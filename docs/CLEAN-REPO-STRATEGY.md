# Clean Repo Strategy for Hackathon Submission

**Created:** December 22, 2025
**Submission Date:** December 31, 2025
**Deadline:** 2:00 PM PST

---

## Overview

Create a fresh, clean public repository for the hackathon submission that:
- Contains only production-ready code
- Has no sensitive data or API keys in history
- Presents professionally to judges
- Includes clear documentation

---

## Pre-Submission Checklist (Dec 30-31)

### 1. Files to EXCLUDE from Clean Repo

```
# Development files
node_modules/
.next/
.env
.env.local
.env.*.local

# Recordings and drafts
demo-recording.mp4
recordings/
record-demo.js

# IDE and OS files
.vscode/
.idea/
.DS_Store
Thumbs.db

# Build artifacts
*.log
npm-debug.log*

# Test files (optional - may include)
__tests__/
*.test.ts
*.spec.ts

# Local audio cache
public/audio/lessons/*.mp3
```

### 2. Files to INCLUDE

```
# Core application
src/
app/
components/
lib/
public/ (except cached audio)
content/

# Configuration
package.json
package-lock.json
next.config.js
tailwind.config.js
tsconfig.json
postcss.config.js

# Documentation
README.md
LICENSE
docs/DEVPOST-SUBMISSION.md
docs/DEPLOYMENT-GUIDE.md

# Screenshots
screenshots/

# Environment template
.env.example
```

---

## Step-by-Step Process

### Step 1: Create New Repository (Dec 31 Morning)

```bash
# On GitHub
1. Go to github.com/sgharlow
2. Click "New repository"
3. Name: adapt-learn-hackathon (or adapt-learn if you want to replace)
4. Description: Voice-first adaptive AI learning platform - ElevenLabs Hackathon
5. Public: YES
6. Initialize: NO (we'll push existing code)
```

### Step 2: Prepare Clean Copy Locally

```bash
# Create clean directory
mkdir ~/Desktop/adapt-learn-clean
cd ~/Desktop/adapt-learn-clean

# Copy only needed files (PowerShell)
$source = "C:\Users\sghar\CascadeProjects\adapt-learn"
$dest = "C:\Users\sghar\Desktop\adapt-learn-clean"

# Copy core directories
Copy-Item -Path "$source\src" -Destination $dest -Recurse
Copy-Item -Path "$source\app" -Destination $dest -Recurse -ErrorAction SilentlyContinue
Copy-Item -Path "$source\components" -Destination $dest -Recurse -ErrorAction SilentlyContinue
Copy-Item -Path "$source\lib" -Destination $dest -Recurse -ErrorAction SilentlyContinue
Copy-Item -Path "$source\content" -Destination $dest -Recurse
Copy-Item -Path "$source\public" -Destination $dest -Recurse
Copy-Item -Path "$source\docs" -Destination $dest -Recurse
Copy-Item -Path "$source\screenshots" -Destination $dest -Recurse

# Copy config files
Copy-Item "$source\package.json" $dest
Copy-Item "$source\package-lock.json" $dest
Copy-Item "$source\next.config.js" $dest -ErrorAction SilentlyContinue
Copy-Item "$source\next.config.mjs" $dest -ErrorAction SilentlyContinue
Copy-Item "$source\tailwind.config.js" $dest -ErrorAction SilentlyContinue
Copy-Item "$source\tailwind.config.ts" $dest -ErrorAction SilentlyContinue
Copy-Item "$source\tsconfig.json" $dest
Copy-Item "$source\postcss.config.js" $dest -ErrorAction SilentlyContinue
Copy-Item "$source\postcss.config.mjs" $dest -ErrorAction SilentlyContinue
Copy-Item "$source\README.md" $dest
Copy-Item "$source\LICENSE" $dest
Copy-Item "$source\.env.example" $dest -ErrorAction SilentlyContinue
Copy-Item "$source\.env.local.example" $dest -ErrorAction SilentlyContinue
```

### Step 3: Clean Up Audio Cache

```bash
# Remove cached audio files (they're generated on-demand)
cd adapt-learn-clean
rm -rf public/audio/lessons/*.mp3
# Keep the directory structure but not the files
```

### Step 4: Create/Update .env.example

```bash
# Ensure .env.example exists with placeholder values
cat > .env.example << 'EOF'
# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# Google Gemini / Vertex AI
GOOGLE_API_KEY=your_google_api_key_here

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

### Step 5: Verify No Secrets in Code

```bash
# Search for potential secrets (run from clean directory)
grep -r "sk-" . --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "api_key" . --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "ELEVENLABS" . --include="*.ts" --include="*.tsx" --include="*.js" | grep -v "process.env"
grep -r "GOOGLE" . --include="*.ts" --include="*.tsx" --include="*.js" | grep -v "process.env"

# All matches should be process.env.VARIABLE_NAME, not actual values
```

### Step 6: Initialize Clean Git Repo

```bash
cd adapt-learn-clean

# Initialize new repo
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AdaptLearn hackathon submission

Voice-first adaptive AI learning platform for the ElevenLabs AI Hackathon.

Features:
- 42 audio lessons powered by ElevenLabs
- 10 curated learning paths
- AI-powered Q&A with Google Gemini
- Adaptive knowledge gap detection
- TEMPO-based prioritization

Built with Next.js, ElevenLabs, and Google Gemini."

# Add remote
git remote add origin https://github.com/sgharlow/adapt-learn-hackathon.git

# Push
git push -u origin main
```

### Step 7: Final Verification

```bash
# Clone fresh to verify
cd ~/Desktop
git clone https://github.com/sgharlow/adapt-learn-hackathon.git test-clone
cd test-clone

# Install dependencies
npm install

# Create .env.local with real keys
cp .env.example .env.local
# Edit .env.local with actual API keys

# Test build
npm run build

# Test run
npm run dev
# Visit http://localhost:3000 and verify everything works
```

---

## README.md Template for Clean Repo

```markdown
# AdaptLearn: Voice-First Adaptive AI Learning Platform

> Learn AI like you listen to podcasts — personalized audio lessons that adapt to your knowledge gaps.

![AdaptLearn Screenshot](screenshots/adapt-learn-01-landing-hero.png)

## 🎯 What is AdaptLearn?

AdaptLearn reimagines AI education as a voice-first experience. Every lesson is synthesized into natural, engaging audio using **ElevenLabs**, while **Google Gemini** provides intelligent Q&A and adaptive recommendations.

**Built for the AI Partner Catalyst Hackathon — ElevenLabs Track**

## ✨ Features

- **Voice-First Learning** — Natural audio lessons powered by ElevenLabs Multilingual v2
- **10 Learning Paths** — From AI Explorer to AI Specialist
- **42 Curated Lessons** — ML, deep learning, NLP, generative AI, ethics, and more
- **AI-Powered Q&A** — Context-aware answers via Google Gemini
- **Adaptive Knowledge Tracking** — Detects gaps and adjusts recommendations
- **Progress Dashboard** — Streaks, mastery, and personalized next steps

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React, TypeScript |
| Styling | Tailwind CSS |
| Voice | ElevenLabs API |
| AI/LLM | Google Gemini (Vertex AI) |
| Hosting | Vercel |

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/sgharlow/adapt-learn-hackathon.git
cd adapt-learn-hackathon

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
# ELEVENLABS_API_KEY=...
# GOOGLE_API_KEY=...

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📸 Screenshots

| Landing | Learning Paths | Lesson Player |
|---------|----------------|---------------|
| ![Landing](screenshots/adapt-learn-01-landing-hero.png) | ![Paths](screenshots/adapt-learn-02-learning-paths.png) | ![Player](screenshots/adapt-learn-03-lesson-player.png) |

## 🔗 Links

- **Live Demo:** [https://adapt-learn-rosy.vercel.app](https://adapt-learn-rosy.vercel.app)
- **DevPost:** [Link to submission]

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

Built with ❤️ for the ElevenLabs AI Hackathon
```

---

## Submission Day Timeline (Dec 31)

| Time (PST) | Task |
|------------|------|
| 8:00 AM | Create new GitHub repo |
| 8:15 AM | Copy clean files locally |
| 8:30 AM | Verify no secrets, update .env.example |
| 8:45 AM | Push to new repo |
| 9:00 AM | Clone fresh and test build |
| 9:30 AM | Test on Vercel (redeploy if needed) |
| 10:00 AM | Final DevPost submission review |
| 11:00 AM | Submit to DevPost |
| 12:00 PM | Buffer time for issues |
| **2:00 PM** | **DEADLINE** |

---

## Alternative: Clean Current Repo History

If you prefer to keep the same repo URL, you can rewrite history:

```bash
# WARNING: This rewrites git history
# Only do this if you haven't shared the repo widely

# Create orphan branch (no history)
git checkout --orphan clean-main

# Add all current files
git add .

# Commit
git commit -m "Initial commit: AdaptLearn hackathon submission"

# Delete old main
git branch -D main

# Rename to main
git branch -m main

# Force push (DANGEROUS - overwrites remote history)
git push -f origin main
```

**Recommendation:** Create new repo instead. Safer and cleaner.

---

## Files Ready for Submission

| Asset | Location | Status |
|-------|----------|--------|
| Screenshots (7) | screenshots/*.png | READY |
| DevPost copy | docs/DEVPOST-READY-TO-SUBMIT.md | READY |
| README template | (above) | READY |
| .env.example | (above) | READY |

---

*Estimated time on Dec 31: 2-3 hours buffer before deadline*
