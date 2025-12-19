/**
 * AdaptLearn Content QA Script
 *
 * Performs comprehensive quality assurance on all lesson content:
 * - Structural completeness (all required fields)
 * - Path alignment (lessons in paths exist)
 * - Content quality (length, sections, quiz)
 * - Consistency (topics, difficulty levels)
 * - Orphaned content detection
 *
 * Usage:
 *   npx tsx scripts/qa-content.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONTENT_DIR = path.join(process.cwd(), 'content', 'lessons');
const PATHS_FILE = path.join(process.cwd(), 'content', 'paths', 'index.json');

// Quality thresholds
const MIN_INTRODUCTION_LENGTH = 100;
const MIN_SECTIONS = 3;
const MIN_SECTION_CONTENT_LENGTH = 100;
const MIN_SUMMARY_LENGTH = 50;
const MIN_OBJECTIVES = 2;
const MIN_KEY_TAKEAWAYS = 2;
const MIN_QUIZ_QUESTIONS = 3;

// Types
interface LessonSection {
  title: string;
  content: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface Lesson {
  id: string;
  title: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  prerequisites: string[];
  objectives: string[];
  content: {
    introduction: string;
    sections: LessonSection[];
    summary: string;
    keyTakeaways: string[];
  };
  quiz: QuizQuestion[];
  audioUrls: {
    full: string | null;
    summary?: string | null;
    sections?: Record<string, string>;
  };
  metadata: {
    author: string;
    source?: string;
    lastUpdated: string;
    version: string;
  };
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  duration: string;
  lessonCount: number;
  difficulty: string;
  lessons: string[];
}

interface PathsIndex {
  paths: LearningPath[];
}

interface QAIssue {
  lessonId: string;
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

// Helper functions
function loadLesson(filename: string): Lesson | null {
  try {
    const filePath = path.join(CONTENT_DIR, filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as Lesson;
  } catch (error) {
    console.error(`Failed to load ${filename}:`, error);
    return null;
  }
}

function loadPaths(): PathsIndex | null {
  try {
    const data = fs.readFileSync(PATHS_FILE, 'utf-8');
    return JSON.parse(data) as PathsIndex;
  } catch (error) {
    console.error('Failed to load paths:', error);
    return null;
  }
}

function validateLesson(lesson: Lesson): QAIssue[] {
  const issues: QAIssue[] = [];

  // Required fields
  if (!lesson.id) {
    issues.push({ lessonId: lesson.id || 'unknown', field: 'id', severity: 'error', message: 'Missing lesson ID' });
  }
  if (!lesson.title) {
    issues.push({ lessonId: lesson.id, field: 'title', severity: 'error', message: 'Missing title' });
  }
  if (!lesson.topic) {
    issues.push({ lessonId: lesson.id, field: 'topic', severity: 'error', message: 'Missing topic' });
  }
  if (!lesson.difficulty) {
    issues.push({ lessonId: lesson.id, field: 'difficulty', severity: 'error', message: 'Missing difficulty' });
  } else if (!['beginner', 'intermediate', 'advanced'].includes(lesson.difficulty)) {
    issues.push({ lessonId: lesson.id, field: 'difficulty', severity: 'error', message: `Invalid difficulty: ${lesson.difficulty}` });
  }
  if (!lesson.duration || lesson.duration <= 0) {
    issues.push({ lessonId: lesson.id, field: 'duration', severity: 'error', message: 'Missing or invalid duration' });
  }

  // Objectives
  if (!lesson.objectives || lesson.objectives.length === 0) {
    issues.push({ lessonId: lesson.id, field: 'objectives', severity: 'error', message: 'Missing objectives' });
  } else if (lesson.objectives.length < MIN_OBJECTIVES) {
    issues.push({ lessonId: lesson.id, field: 'objectives', severity: 'warning', message: `Only ${lesson.objectives.length} objectives (minimum ${MIN_OBJECTIVES})` });
  }

  // Content structure
  if (!lesson.content) {
    issues.push({ lessonId: lesson.id, field: 'content', severity: 'error', message: 'Missing content object' });
  } else {
    // Introduction
    if (!lesson.content.introduction) {
      issues.push({ lessonId: lesson.id, field: 'content.introduction', severity: 'error', message: 'Missing introduction' });
    } else if (lesson.content.introduction.length < MIN_INTRODUCTION_LENGTH) {
      issues.push({ lessonId: lesson.id, field: 'content.introduction', severity: 'warning', message: `Introduction too short: ${lesson.content.introduction.length} chars (min ${MIN_INTRODUCTION_LENGTH})` });
    }

    // Sections
    if (!lesson.content.sections || lesson.content.sections.length === 0) {
      issues.push({ lessonId: lesson.id, field: 'content.sections', severity: 'error', message: 'No sections defined' });
    } else {
      if (lesson.content.sections.length < MIN_SECTIONS) {
        issues.push({ lessonId: lesson.id, field: 'content.sections', severity: 'warning', message: `Only ${lesson.content.sections.length} sections (minimum ${MIN_SECTIONS})` });
      }

      // Check each section
      lesson.content.sections.forEach((section, index) => {
        if (!section.title) {
          issues.push({ lessonId: lesson.id, field: `content.sections[${index}].title`, severity: 'error', message: `Section ${index + 1} missing title` });
        }
        if (!section.content) {
          issues.push({ lessonId: lesson.id, field: `content.sections[${index}].content`, severity: 'error', message: `Section ${index + 1} missing content` });
        } else if (section.content.length < MIN_SECTION_CONTENT_LENGTH) {
          issues.push({ lessonId: lesson.id, field: `content.sections[${index}].content`, severity: 'warning', message: `Section "${section.title}" content short: ${section.content.length} chars` });
        }
      });
    }

    // Summary
    if (!lesson.content.summary) {
      issues.push({ lessonId: lesson.id, field: 'content.summary', severity: 'error', message: 'Missing summary' });
    } else if (lesson.content.summary.length < MIN_SUMMARY_LENGTH) {
      issues.push({ lessonId: lesson.id, field: 'content.summary', severity: 'warning', message: `Summary too short: ${lesson.content.summary.length} chars (min ${MIN_SUMMARY_LENGTH})` });
    }

    // Key Takeaways
    if (!lesson.content.keyTakeaways || lesson.content.keyTakeaways.length === 0) {
      issues.push({ lessonId: lesson.id, field: 'content.keyTakeaways', severity: 'error', message: 'Missing key takeaways' });
    } else if (lesson.content.keyTakeaways.length < MIN_KEY_TAKEAWAYS) {
      issues.push({ lessonId: lesson.id, field: 'content.keyTakeaways', severity: 'warning', message: `Only ${lesson.content.keyTakeaways.length} key takeaways (minimum ${MIN_KEY_TAKEAWAYS})` });
    }
  }

  // Quiz
  if (!lesson.quiz || lesson.quiz.length === 0) {
    issues.push({ lessonId: lesson.id, field: 'quiz', severity: 'error', message: 'No quiz questions' });
  } else {
    if (lesson.quiz.length < MIN_QUIZ_QUESTIONS) {
      issues.push({ lessonId: lesson.id, field: 'quiz', severity: 'warning', message: `Only ${lesson.quiz.length} quiz questions (minimum ${MIN_QUIZ_QUESTIONS})` });
    }

    // Check each quiz question
    lesson.quiz.forEach((q, index) => {
      if (!q.question) {
        issues.push({ lessonId: lesson.id, field: `quiz[${index}].question`, severity: 'error', message: `Quiz question ${index + 1} missing question text` });
      }
      if (!q.options || q.options.length < 2) {
        issues.push({ lessonId: lesson.id, field: `quiz[${index}].options`, severity: 'error', message: `Quiz question ${index + 1} needs at least 2 options` });
      }
      if (!q.correct) {
        issues.push({ lessonId: lesson.id, field: `quiz[${index}].correct`, severity: 'error', message: `Quiz question ${index + 1} missing correct answer` });
      }
      if (!q.explanation) {
        issues.push({ lessonId: lesson.id, field: `quiz[${index}].explanation`, severity: 'warning', message: `Quiz question ${index + 1} missing explanation` });
      }
    });
  }

  // Metadata
  if (!lesson.metadata) {
    issues.push({ lessonId: lesson.id, field: 'metadata', severity: 'warning', message: 'Missing metadata' });
  } else {
    if (!lesson.metadata.lastUpdated) {
      issues.push({ lessonId: lesson.id, field: 'metadata.lastUpdated', severity: 'warning', message: 'Missing lastUpdated date' });
    }
  }

  return issues;
}

function getContentStats(lesson: Lesson): {
  totalChars: number;
  introChars: number;
  sectionCount: number;
  sectionChars: number;
  summaryChars: number;
  quizCount: number;
  estimatedAudioMinutes: number;
} {
  const introChars = lesson.content?.introduction?.length || 0;
  const sectionChars = lesson.content?.sections?.reduce((sum, s) => sum + (s.content?.length || 0), 0) || 0;
  const summaryChars = lesson.content?.summary?.length || 0;
  const totalChars = introChars + sectionChars + summaryChars;

  // Estimate audio duration: ~150 words per minute, ~5 chars per word
  const estimatedAudioMinutes = Math.round((totalChars / 5 / 150) * 10) / 10;

  return {
    totalChars,
    introChars,
    sectionCount: lesson.content?.sections?.length || 0,
    sectionChars,
    summaryChars,
    quizCount: lesson.quiz?.length || 0,
    estimatedAudioMinutes,
  };
}

async function main() {
  console.log('='.repeat(70));
  console.log('AdaptLearn Content QA Report');
  console.log('='.repeat(70));
  console.log();

  // Load paths
  const pathsIndex = loadPaths();
  if (!pathsIndex) {
    console.error('ERROR: Could not load learning paths');
    process.exit(1);
  }

  // Get all lessons referenced in paths
  const lessonsInPaths = new Set<string>();
  pathsIndex.paths.forEach(p => {
    p.lessons.forEach(lessonId => lessonsInPaths.add(lessonId));
  });

  // Get all lesson files
  const lessonFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));

  console.log(`Found ${lessonFiles.length} lesson files`);
  console.log(`Found ${pathsIndex.paths.length} learning paths`);
  console.log(`Lessons referenced in paths: ${lessonsInPaths.size}`);
  console.log();

  // Track issues and stats
  const allIssues: QAIssue[] = [];
  const lessonStats: Map<string, ReturnType<typeof getContentStats>> = new Map();
  const lessons: Map<string, Lesson> = new Map();
  const missingLessons: string[] = [];
  const orphanedLessons: string[] = [];

  // Load and validate all lessons
  console.log('-'.repeat(70));
  console.log('Validating Lessons');
  console.log('-'.repeat(70));

  for (const filename of lessonFiles) {
    const lesson = loadLesson(filename);
    if (!lesson) {
      allIssues.push({ lessonId: filename, field: 'file', severity: 'error', message: 'Failed to parse JSON' });
      continue;
    }

    lessons.set(lesson.id, lesson);

    // Validate lesson
    const issues = validateLesson(lesson);
    allIssues.push(...issues);

    // Get stats
    const stats = getContentStats(lesson);
    lessonStats.set(lesson.id, stats);

    // Check if orphaned
    if (!lessonsInPaths.has(lesson.id)) {
      orphanedLessons.push(lesson.id);
    }

    // Status output
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warnCount = issues.filter(i => i.severity === 'warning').length;
    const status = errorCount > 0 ? '❌' : warnCount > 0 ? '⚠️' : '✅';
    console.log(`${status} ${lesson.id.padEnd(25)} | ${stats.sectionCount} sections | ${stats.quizCount} quiz | ~${stats.estimatedAudioMinutes}min audio`);
  }

  // Check for missing lessons (in paths but no file)
  lessonsInPaths.forEach(lessonId => {
    if (!lessons.has(lessonId)) {
      missingLessons.push(lessonId);
      allIssues.push({ lessonId, field: 'file', severity: 'error', message: 'Lesson referenced in path but file not found' });
    }
  });

  // Path validation
  console.log();
  console.log('-'.repeat(70));
  console.log('Learning Path Validation');
  console.log('-'.repeat(70));

  pathsIndex.paths.forEach(p => {
    const pathLessons = p.lessons.filter(id => lessons.has(id)).map(id => lessons.get(id)!);
    const missingCount = p.lessons.filter(id => !lessons.has(id)).length;

    // Check lesson count matches
    if (p.lessonCount !== p.lessons.length) {
      allIssues.push({ lessonId: `path:${p.id}`, field: 'lessonCount', severity: 'warning', message: `lessonCount (${p.lessonCount}) doesn't match actual lessons (${p.lessons.length})` });
    }

    // Calculate total duration
    const totalDuration = pathLessons.reduce((sum, l) => sum + (l.duration || 0), 0);
    const estimatedAudio = pathLessons.reduce((sum, l) => sum + (lessonStats.get(l.id)?.estimatedAudioMinutes || 0), 0);

    const status = missingCount > 0 ? '❌' : '✅';
    console.log(`${status} ${p.name.padEnd(25)} | ${p.lessons.length} lessons | ~${totalDuration}min read | ~${Math.round(estimatedAudio)}min audio`);

    if (missingCount > 0) {
      console.log(`   Missing: ${p.lessons.filter(id => !lessons.has(id)).join(', ')}`);
    }
  });

  // Summary
  console.log();
  console.log('='.repeat(70));
  console.log('QA Summary');
  console.log('='.repeat(70));

  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');
  const infos = allIssues.filter(i => i.severity === 'info');

  console.log(`Total lessons: ${lessons.size}`);
  console.log(`Total errors: ${errors.length}`);
  console.log(`Total warnings: ${warnings.length}`);
  console.log();

  if (missingLessons.length > 0) {
    console.log(`❌ MISSING LESSONS (referenced in paths but no file):`);
    missingLessons.forEach(id => console.log(`   - ${id}`));
    console.log();
  }

  if (orphanedLessons.length > 0) {
    console.log(`⚠️ ORPHANED LESSONS (not in any learning path):`);
    orphanedLessons.forEach(id => console.log(`   - ${id}`));
    console.log();
  }

  // List all errors
  if (errors.length > 0) {
    console.log('❌ ERRORS (must fix before audio generation):');
    errors.forEach(e => {
      console.log(`   [${e.lessonId}] ${e.field}: ${e.message}`);
    });
    console.log();
  }

  // List all warnings
  if (warnings.length > 0) {
    console.log('⚠️ WARNINGS (should review):');
    warnings.forEach(w => {
      console.log(`   [${w.lessonId}] ${w.field}: ${w.message}`);
    });
    console.log();
  }

  // Content statistics
  console.log('-'.repeat(70));
  console.log('Content Statistics');
  console.log('-'.repeat(70));

  let totalChars = 0;
  let totalSections = 0;
  let totalQuizQuestions = 0;
  let totalAudioMinutes = 0;

  lessonStats.forEach((stats, id) => {
    totalChars += stats.totalChars;
    totalSections += stats.sectionCount;
    totalQuizQuestions += stats.quizCount;
    totalAudioMinutes += stats.estimatedAudioMinutes;
  });

  console.log(`Total content: ${(totalChars / 1000).toFixed(1)}K characters`);
  console.log(`Total sections: ${totalSections}`);
  console.log(`Total quiz questions: ${totalQuizQuestions}`);
  console.log(`Estimated total audio: ~${Math.round(totalAudioMinutes)} minutes`);
  console.log(`Average per lesson: ~${Math.round(totalAudioMinutes / lessons.size)} minutes`);
  console.log();

  // Topic distribution
  console.log('-'.repeat(70));
  console.log('Topic Distribution');
  console.log('-'.repeat(70));

  const topicCounts = new Map<string, number>();
  lessons.forEach(l => {
    topicCounts.set(l.topic, (topicCounts.get(l.topic) || 0) + 1);
  });

  Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([topic, count]) => {
      console.log(`   ${topic.padEnd(25)} ${count} lessons`);
    });
  console.log();

  // Difficulty distribution
  console.log('-'.repeat(70));
  console.log('Difficulty Distribution');
  console.log('-'.repeat(70));

  const difficultyCounts = { beginner: 0, intermediate: 0, advanced: 0 };
  lessons.forEach(l => {
    if (l.difficulty in difficultyCounts) {
      difficultyCounts[l.difficulty as keyof typeof difficultyCounts]++;
    }
  });

  console.log(`   Beginner:     ${difficultyCounts.beginner} lessons`);
  console.log(`   Intermediate: ${difficultyCounts.intermediate} lessons`);
  console.log(`   Advanced:     ${difficultyCounts.advanced} lessons`);
  console.log();

  // Final verdict
  console.log('='.repeat(70));
  if (errors.length === 0) {
    console.log('✅ PASS - Content is ready for audio generation');
  } else {
    console.log(`❌ FAIL - ${errors.length} error(s) must be fixed before audio generation`);
    process.exit(1);
  }
  console.log('='.repeat(70));
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
