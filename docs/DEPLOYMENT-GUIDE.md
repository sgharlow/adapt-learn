# AdaptLearn Deployment Guide

This guide covers deploying AdaptLearn to Vercel for the hackathon submission.

---

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Repository** — Code pushed to GitHub
2. **Vercel Account** — Free at [vercel.com](https://vercel.com)
3. **API Keys:**
   - ElevenLabs API key
   - Google Cloud API key (Gemini enabled)

---

## Quick Deployment (Vercel)

### Step 1: Push to GitHub

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Prepare for deployment"

# Push to GitHub
git push origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `adapt-learn` repository
4. Click "Import"

### Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key | Yes |
| `ELEVENLABS_VOICE_ID` | `EXAVITQu4vr4xnSDxMaL` (Sarah) | Optional |
| `GOOGLE_API_KEY` | Your Google Cloud API key | Yes |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Optional |

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Your site is live at `your-project.vercel.app`

---

## Custom Domain (Optional)

To use a custom domain:

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

## Environment Variables Reference

### ElevenLabs

```env
# Required - Get from https://elevenlabs.io/app/settings/api-keys
ELEVENLABS_API_KEY=your_key_here

# Optional - Voice ID (defaults to Sarah)
# Find IDs at https://elevenlabs.io/voice-library
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
```

### Google Cloud / Gemini

```env
# Required - Get from https://console.cloud.google.com
# Enable "Generative Language API" in your project
GOOGLE_API_KEY=your_key_here

# Optional - Model selection (defaults to gemini-1.5-flash)
GEMINI_MODEL=gemini-1.5-flash
```

---

## Post-Deployment Checklist

After deployment, verify these features work:

- [ ] Landing page loads correctly
- [ ] Assessment quiz works
- [ ] Learning paths display
- [ ] Lesson pages load
- [ ] Audio generation works (ElevenLabs)
- [ ] Voice Q&A responds (Gemini)
- [ ] Quiz evaluation works
- [ ] Dashboard shows progress
- [ ] Demo mode URLs work (`?demo=progress`)

---

## Troubleshooting

### Build Fails

**Check the build logs in Vercel:**

1. Go to Deployments
2. Click the failed deployment
3. View "Build Logs"

**Common issues:**

- Missing environment variables → Add them in Settings
- TypeScript errors → Run `npm run build` locally first
- Missing dependencies → Check `package.json`

### API Errors

**ElevenLabs 401:**
- Invalid API key
- Check key in Vercel environment variables

**ElevenLabs 429:**
- Rate limit exceeded
- Wait a moment and retry
- Consider upgrading ElevenLabs plan

**Gemini Errors:**
- Check API key is valid
- Ensure Generative Language API is enabled
- Check quota limits in Google Cloud Console

### Audio Not Playing

1. Check browser console for errors
2. Verify ElevenLabs API key is set
3. Test audio generation: `/api/audio/generate`

### Chat Not Responding

1. Check Gemini API key is set
2. Verify API is enabled in Google Cloud
3. Test chat endpoint: `/api/chat/respond`

---

## Performance Optimization

### For Best Demo Performance

1. **Pre-cache audio:**
   - Visit `/demo-preload` before demo
   - Click "Preload All"
   - Wait for all lessons to cache

2. **Use demo mode:**
   - Start with `/?demo=progress`
   - Data is pre-populated
   - No need to complete lessons

3. **Warm up the APIs:**
   - Make a test request to each API
   - First requests are slower (cold start)

---

## Vercel Settings

### Recommended Configuration

**Build & Development Settings:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: (leave default)
- Install Command: `npm install`

**Node.js Version:**
- Use 18.x or later

**Functions:**
- Default region is fine for demo
- For production, choose nearest to users

---

## Monitoring

### Vercel Analytics (Optional)

Enable in Project Settings → Analytics for:
- Page views
- Web vitals
- Real-time visitors

### Logs

View function logs in:
- Vercel Dashboard → Project → Logs
- Filter by status, endpoint, etc.

---

## Production Checklist

Before final submission:

- [ ] All environment variables set
- [ ] Build succeeds without errors
- [ ] All features tested on production URL
- [ ] Demo mode works (`?demo=progress`)
- [ ] Audio preloader works (`/demo-preload`)
- [ ] No console errors in browser
- [ ] Mobile responsive
- [ ] Copy production URL for Devpost

---

## Quick Commands

```bash
# Test build locally
npm run build

# Run production locally
npm run build && npm run start

# Check for issues
npm run lint

# Deploy (if using Vercel CLI)
vercel --prod
```

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review browser console
3. Test API endpoints individually
4. Verify environment variables

---

*Good luck with your deployment!*
