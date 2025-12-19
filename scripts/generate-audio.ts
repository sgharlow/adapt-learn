/**
 * AdaptLearn Audio Pre-Generation Script
 *
 * This script generates audio for all lessons using ElevenLabs API.
 * Audio files are saved to /public/audio/lessons/ for static serving.
 *
 * Usage:
 *   npm run generate:audio
 *   npm run generate:audio -- --lesson ai-tools-01  # Single lesson
 *   npm run generate:audio -- --force              # Regenerate all
 *
 * Environment:
 *   ELEVENLABS_API_KEY - Required
 *   ELEVENLABS_VOICE_ID - Optional (defaults to Sarah)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Sarah

const CONTENT_DIR = path.join(process.cwd(), 'content', 'lessons');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'audio', 'lessons');
const CACHE_FILE = path.join(process.cwd(), 'public', 'audio', 'audio-manifest.json');

// Rate limiting: 2 seconds between API calls
const DELAY_BETWEEN_CALLS = 2000;

// ElevenLabs character limit per request (with buffer)
const MAX_CHARS_PER_REQUEST = 9500;

// Voice settings optimized for educational content
const VOICE_SETTINGS = {
  stability: 0.65,
  similarity_boost: 0.75,
  style: 0.35,
  use_speaker_boost: true,
};

// Types
interface LessonSection {
  title: string;
  content: string;
}

interface LessonContent {
  introduction: string;
  sections: LessonSection[];
  summary: string;
  keyTakeaways: string[];
}

interface Lesson {
  id: string;
  title: string;
  topic: string;
  content: LessonContent;
  audioUrls?: {
    full: string | null;
  };
}

interface AudioManifest {
  generatedAt: string;
  lessons: {
    [lessonId: string]: {
      audioFile: string;
      contentHash: string;
      generatedAt: string;
      duration?: number;
      fileSize?: number;
    };
  };
}

// Helper functions
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateContentHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 12);
}

/**
 * Split text into chunks that fit within the ElevenLabs character limit.
 * Splits at paragraph boundaries to maintain natural speech flow.
 */
function splitTextIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHARS_PER_REQUEST) {
    return [text];
  }

  const chunks: string[] = [];
  const paragraphs = text.split('\n\n');
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // If a single paragraph exceeds the limit, split by sentences
    if (paragraph.length > MAX_CHARS_PER_REQUEST) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      // Split long paragraph by sentences
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if ((currentChunk + ' ' + sentence).length > MAX_CHARS_PER_REQUEST) {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = sentence;
        } else {
          currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
        }
      }
    } else if ((currentChunk + '\n\n' + paragraph).length > MAX_CHARS_PER_REQUEST) {
      // Current chunk would exceed limit, start new chunk
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      // Add paragraph to current chunk
      currentChunk = currentChunk ? currentChunk + '\n\n' + paragraph : paragraph;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

function buildLessonText(lesson: Lesson): string {
  const parts: string[] = [];

  // Title and introduction
  parts.push(`Lesson: ${lesson.title}.`);
  parts.push(lesson.content.introduction);

  // All sections
  for (const section of lesson.content.sections) {
    parts.push(`${section.title}.`);
    parts.push(section.content);
  }

  // Summary
  parts.push(`Summary: ${lesson.content.summary}`);

  // Key takeaways
  if (lesson.content.keyTakeaways && lesson.content.keyTakeaways.length > 0) {
    parts.push(`Key takeaways: ${lesson.content.keyTakeaways.join('. ')}.`);
  }

  return parts.join('\n\n');
}

/**
 * Generate audio for a single chunk of text (must be under MAX_CHARS_PER_REQUEST)
 */
async function generateAudioChunk(text: string): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY environment variable is not set');
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: VOICE_SETTINGS,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate audio for text of any length by chunking and concatenating
 */
async function generateAudio(text: string, onProgress?: (chunk: number, total: number) => void): Promise<Buffer> {
  const chunks = splitTextIntoChunks(text);

  if (chunks.length === 1) {
    return generateAudioChunk(chunks[0]);
  }

  // Generate audio for each chunk with delays between API calls
  const audioBuffers: Buffer[] = [];

  for (let i = 0; i < chunks.length; i++) {
    if (onProgress) {
      onProgress(i + 1, chunks.length);
    }

    const buffer = await generateAudioChunk(chunks[i]);
    audioBuffers.push(buffer);

    // Rate limit between chunks (except for last chunk)
    if (i < chunks.length - 1) {
      await sleep(DELAY_BETWEEN_CALLS);
    }
  }

  // Concatenate all audio buffers
  return Buffer.concat(audioBuffers);
}

function loadManifest(): AudioManifest {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Could not load manifest, starting fresh');
  }
  return { generatedAt: new Date().toISOString(), lessons: {} };
}

function saveManifest(manifest: AudioManifest): void {
  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(manifest, null, 2));
}

function getAllLessons(): Lesson[] {
  const lessons: Lesson[] = [];
  const files = fs.readdirSync(CONTENT_DIR);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(CONTENT_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lesson = JSON.parse(content) as Lesson;
      lessons.push(lesson);
    }
  }

  return lessons.sort((a, b) => a.id.localeCompare(b.id));
}

function updateLessonFile(lesson: Lesson, audioUrl: string): void {
  const filePath = path.join(CONTENT_DIR, `${lesson.id}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lessonData = JSON.parse(content);

  // Update audioUrls
  lessonData.audioUrls = {
    ...lessonData.audioUrls,
    full: audioUrl,
  };

  fs.writeFileSync(filePath, JSON.stringify(lessonData, null, 2));
}

async function main() {
  console.log('='.repeat(60));
  console.log('AdaptLearn Audio Pre-Generation Script');
  console.log('='.repeat(60));
  console.log();

  // Check API key
  if (!ELEVENLABS_API_KEY) {
    console.error('ERROR: ELEVENLABS_API_KEY environment variable is not set');
    console.error('Set it with: export ELEVENLABS_API_KEY=your_key_here');
    process.exit(1);
  }

  // Parse arguments
  const args = process.argv.slice(2);
  const forceRegenerate = args.includes('--force');
  const singleLessonIndex = args.indexOf('--lesson');
  const singleLesson = singleLessonIndex >= 0 ? args[singleLessonIndex + 1] : null;

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }

  // Load manifest
  const manifest = loadManifest();

  // Get all lessons
  const allLessons = getAllLessons();
  const lessons = singleLesson
    ? allLessons.filter((l) => l.id === singleLesson)
    : allLessons;

  if (lessons.length === 0) {
    console.error(`No lessons found${singleLesson ? ` matching '${singleLesson}'` : ''}`);
    process.exit(1);
  }

  console.log(`Found ${lessons.length} lesson(s) to process`);
  console.log(`Force regenerate: ${forceRegenerate}`);
  console.log(`Voice ID: ${ELEVENLABS_VOICE_ID}`);
  console.log();

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const progress = `[${i + 1}/${lessons.length}]`;

    console.log(`${progress} Processing: ${lesson.id} - "${lesson.title}"`);

    try {
      // Build lesson text
      const text = buildLessonText(lesson);
      const contentHash = generateContentHash(text);
      const audioFile = `${lesson.id}.mp3`;
      const audioPath = path.join(OUTPUT_DIR, audioFile);

      // Check if we need to regenerate
      const existingEntry = manifest.lessons[lesson.id];
      const fileExists = fs.existsSync(audioPath);

      if (fileExists && existingEntry && existingEntry.contentHash === contentHash && !forceRegenerate) {
        console.log(`  SKIP: Audio already exists and content unchanged`);
        skipped++;
        continue;
      }

      if (existingEntry && existingEntry.contentHash !== contentHash) {
        console.log(`  Content changed, regenerating...`);
      }

      // Generate audio
      const chunks = splitTextIntoChunks(text);
      const needsChunking = chunks.length > 1;
      console.log(`  Generating audio (${text.length} characters${needsChunking ? `, ${chunks.length} chunks` : ''})...`);
      const startTime = Date.now();
      const audioBuffer = await generateAudio(text, needsChunking ? (chunk, total) => {
        process.stdout.write(`\r  Generating chunk ${chunk}/${total}...`);
      } : undefined);
      if (needsChunking) {
        process.stdout.write('\n');
      }
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

      // Save audio file
      fs.writeFileSync(audioPath, audioBuffer);
      const fileSize = audioBuffer.length;
      console.log(`  Saved: ${audioFile} (${(fileSize / 1024 / 1024).toFixed(2)} MB, ${elapsedTime}s)`);

      // Update manifest
      manifest.lessons[lesson.id] = {
        audioFile: `/audio/lessons/${audioFile}`,
        contentHash,
        generatedAt: new Date().toISOString(),
        fileSize,
      };

      // Update lesson JSON file
      const audioUrl = `/audio/lessons/${audioFile}`;
      updateLessonFile(lesson, audioUrl);
      console.log(`  Updated lesson JSON with audioUrl: ${audioUrl}`);

      generated++;

      // Save manifest after each successful generation (in case of failure)
      saveManifest(manifest);

      // Rate limiting - wait before next API call
      if (i < lessons.length - 1) {
        console.log(`  Waiting ${DELAY_BETWEEN_CALLS / 1000}s before next call...`);
        await sleep(DELAY_BETWEEN_CALLS);
      }
    } catch (error) {
      console.error(`  ERROR: ${error instanceof Error ? error.message : error}`);
      failed++;

      // Continue with next lesson
      if (i < lessons.length - 1) {
        console.log(`  Continuing with next lesson...`);
        await sleep(DELAY_BETWEEN_CALLS);
      }
    }

    console.log();
  }

  // Final summary
  console.log('='.repeat(60));
  console.log('Generation Complete');
  console.log('='.repeat(60));
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`  Total:     ${lessons.length}`);
  console.log();

  // Calculate total audio size
  let totalSize = 0;
  for (const entry of Object.values(manifest.lessons)) {
    if (entry.fileSize) {
      totalSize += entry.fileSize;
    }
  }
  console.log(`  Total audio size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Manifest saved to: ${CACHE_FILE}`);

  if (failed > 0) {
    console.log();
    console.warn(`WARNING: ${failed} lesson(s) failed to generate. Run again to retry.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
