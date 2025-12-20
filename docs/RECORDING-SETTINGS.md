# Demo Video Recording Settings

## Playwright Browser Recording (Recommended)

Use Playwright's built-in video recording to capture the browser UI directly.

### Setup
```bash
npm install playwright
npx playwright install chromium
```

### Recording Script Template
```javascript
const { chromium } = require('playwright');

const browser = await chromium.launch({
  headless: false,  // Show browser window
  slowMo: 50        // Slow down for visibility
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: {
    dir: './recordings/',
    size: { width: 1280, height: 800 }
  }
});

const page = await context.newPage();
// ... run demo actions ...

await context.close();  // This finalizes the video
await browser.close();
```

### Convert WebM to MP4
```bash
ffmpeg -i recordings/[filename].webm -c:v libx264 -preset fast -crf 22 -y demo-recording.mp4
```

### Output Specs
- Resolution: 1280x800
- Format: MP4 (H.264)
- Quality: CRF 22 (good balance of quality/size)

## Alternative: FFmpeg Desktop Recording

If you need to record the full desktop (not recommended for browser demos):

```bash
# Fragmented MP4 (survives abrupt termination)
ffmpeg -f gdigrab -framerate 30 -video_size 1920x1080 -i desktop \
  -c:v libx264 -preset ultrafast -crf 23 \
  -movflags frag_keyframe+empty_moov+default_base_moof \
  -y output.mp4
```

**Note:** FFmpeg gdigrab records the desktop, not a specific window. The Playwright method is preferred for browser-specific recordings.
