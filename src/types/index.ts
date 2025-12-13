// Learning Path Types
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  duration: string;
  lessonCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  color: string;
  icon: string;
  lessons: string[];
  milestones: Milestone[];
}

export interface Milestone {
  afterLesson: number;
  title: string;
  message: string;
}

// Lesson Types
export interface Lesson {
  id: string;
  title: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  prerequisites: string[];
  objectives: string[];
  content: LessonContent;
  quiz: QuizQuestion[];
  audioUrls: AudioUrls;
  metadata: LessonMetadata;
}

export interface LessonContent {
  introduction: string;
  sections: LessonSection[];
  summary: string;
  keyTakeaways: string[];
}

export interface LessonSection {
  title: string;
  content: string;
}

export interface AudioUrls {
  full: string | null;
  summary: string | null;
  sections: Record<string, string>;
}

export interface LessonMetadata {
  author: string;
  source: string;
  lastUpdated: string;
  version: string;
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false';
  options: string[];
  correct: string;
  explanation: string;
}

export interface QuizResult {
  lessonId: string;
  score: number;
  totalQuestions: number;
  answers?: QuizAnswer[];
  percentage?: number;
  timeSpent?: number;
  completedAt: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

// Activity Log Types
export interface ActivityLogEntry {
  id: string;
  type: 'lesson_started' | 'lesson_completed' | 'quiz_completed' | 'path_started' | 'milestone_reached';
  lessonId?: string;
  lessonTitle?: string;
  pathId?: string;
  pathName?: string;
  score?: number;
  totalQuestions?: number;
  milestoneTitle?: string;
  timestamp: string;
}

// Learning Streak Types
export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalDaysActive: number;
}

// User Progress Types
export interface UserProgress {
  currentPath: string | null;
  completedLessons: string[];
  quizResults: Record<string, QuizResult>;
  topicMastery: Record<string, TopicMastery>;
  lastActivity: string | null;
  activityLog?: ActivityLogEntry[];
  streak?: LearningStreak;
}

export interface TopicMastery {
  topic: string;
  score: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastUpdated: string;
}

// Assessment Quiz Types
export interface AssessmentQuestion {
  id: string;
  question: string;
  options: AssessmentOption[];
}

export interface AssessmentOption {
  value: string;
  label: string;
  points: Record<string, number>;
}

export interface AssessmentResult {
  recommendedPath: string;
  scores: Record<string, number>;
  completedAt: string;
}

// API Types
export interface AudioGenerateRequest {
  text: string;
  voice?: string;
}

export interface AudioGenerateResponse {
  audioUrl: string;
  duration?: number;
}

export interface ChatRequest {
  message: string;
  lessonContext?: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  audioUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface QuizEvaluateRequest {
  lessonId: string;
  questionId: string;
  answer: string;
}

export interface QuizEvaluateResponse {
  isCorrect: boolean;
  explanation: string;
  audioUrl?: string;
}

export interface RecommendationRequest {
  userProgress: UserProgress;
  currentPath: string;
}

export interface RecommendationResponse {
  nextLesson: string;
  reasoning: string;
  alternativeLessons?: string[];
}

// Paths Data Type (for the index.json)
export interface PathsData {
  paths: LearningPath[];
  assessmentQuiz: {
    questions: AssessmentQuestion[];
  };
}
