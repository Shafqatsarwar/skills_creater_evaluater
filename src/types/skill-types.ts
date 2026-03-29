/**
 * Modern AI-Era Skills System - Type Definitions
 * Comprehensive type definitions for skills creation and evaluation
 */

/**
 * Skill categories for AI-era skills
 */
export type SkillCategory =
  | 'ai-ml'
  | 'web-development'
  | 'mobile-development'
  | 'data-science'
  | 'devops'
  | 'cloud-computing'
  | 'cybersecurity'
  | 'blockchain'
  | 'prompt-engineering'
  | 'ai-integration'
  | 'soft-skills'
  | 'design'
  | 'business';

/**
 * Skill difficulty levels
 */
export type SkillLevel = 'foundational' | 'intermediate' | 'advanced' | 'expert';

/**
 * Assessment types for modern evaluation
 */
export type AssessmentType =
  | 'practical-coding'
  | 'project-based'
  | 'ai-assisted'
  | 'peer-review'
  | 'portfolio-review'
  | 'simulation'
  | 'case-study'
  | 'multiple-choice'
  | 'essay'
  | 'oral-exam';

/**
 * Evaluation criteria with AI support
 */
export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'conceptual' | 'practical' | 'creative' | 'analytical';
  weight: number; // 0-1, must sum to 1 within category
  maxScore: number;
  rubric: RubricLevel[];
  aiPromptTemplate?: string; // Template for AI-assisted evaluation
  autoGradingEnabled?: boolean;
  requiresHumanReview?: boolean;
}

/**
 * Rubric level for detailed scoring
 */
export interface RubricLevel {
  level: number; // 0-4 or 0-5 scale
  label: string; // e.g., "Novice", "Developing", "Proficient", "Exemplary"
  description: string;
  minScore: number;
  maxScore: number;
  indicators: string[]; // Observable indicators for this level
}

/**
 * Learning objectives based on Bloom's Taxonomy
 */
export interface LearningObjective {
  id: string;
  description: string;
  bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  measurable: boolean;
  assessmentMethods: string[];
}

/**
 * Skill metadata - comprehensive structure
 */
export interface Skill {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  longDescription?: string;
  category: SkillCategory;
  subcategory?: string;
  level: SkillLevel;
  
  // Learning outcomes
  learningObjectives: LearningObjective[];
  prerequisites: string[]; // IDs of prerequisite skills
  relatedSkills: string[]; // IDs of related skills
  
  // Evaluation framework
  evaluationCriteria: EvaluationCriterion[];
  assessmentTypes: AssessmentType[];
  passingScore: number; // Percentage required to pass
  gradingScale: GradingScale;
  
  // Content and resources
  modules: SkillModule[];
  resources: Resource[];
  projects: Project[];
  
  // AI Integration
  aiSupport?: AISupportConfig;
  
  // Metadata
  author: Author;
  tags: string[];
  estimatedHours: number;
  credits?: number;
  
  // Status and tracking
  status: 'draft' | 'review' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  license: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  
  // Statistics
  statistics?: SkillStatistics;
}

/**
 * AI Support Configuration for AI-assisted learning and evaluation
 */
export interface AISupportConfig {
  enabled: boolean;
  features: {
    personalizedFeedback: boolean;
    adaptiveLearning: boolean;
    automatedHints: boolean;
    progressPrediction: boolean;
    weaknessDetection: boolean;
    contentGeneration: boolean;
  };
  llmConfig?: {
    provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'local';
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
  evaluationPrompts: {
    codeReview: string;
    feedbackGeneration: string;
    hintGeneration: string;
    rubricScoring: string;
  };
}

/**
 * Skill module/section
 */
export interface SkillModule {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  assessments: ModuleAssessment[];
  estimatedHours: number;
  learningOutcomes: string[];
}

/**
 * Individual lesson within a module
 */
export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'interactive' | 'quiz' | 'lab' | 'project';
  content: LessonContent;
  duration: number; // minutes
  resources: string[]; // Resource IDs
}

/**
 * Lesson content - flexible structure
 */
export interface LessonContent {
  text?: string;
  videoUrl?: string;
  interactiveUrl?: string;
  codeExample?: CodeExample;
  quiz?: Quiz;
  labInstructions?: string;
  slides?: string[];
}

/**
 * Code example for technical skills
 */
export interface CodeExample {
  language: string;
  title: string;
  description: string;
  code: string;
  explanation?: string;
  expectedOutput?: string;
  runnable?: boolean;
}

/**
 * Quiz structure
 */
export interface Quiz {
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // minutes
  allowRetakes: boolean;
  showCorrectAnswers: boolean;
}

/**
 * Quiz question with multiple types
 */
export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'fill-blank' | 'short-answer' | 'code';
  question: string;
  options?: string[];
  correctAnswer: string | string[] | number;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

/**
 * Module assessment
 */
export interface ModuleAssessment {
  id: string;
  title: string;
  type: AssessmentType;
  description: string;
  instructions: string;
  criteria: EvaluationCriterion[];
  submissionFormat: SubmissionFormat;
  timeLimit?: number;
  maxAttempts: number;
}

/**
 * Submission format specification
 */
export interface SubmissionFormat {
  type: 'code' | 'file' | 'text' | 'url' | 'video' | 'portfolio';
  acceptedFormats?: string[];
  maxSize?: number; // bytes
  requiredFields: string[];
  template?: string;
}

/**
 * Project for skill demonstration
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'individual' | 'group' | 'capstone';
  difficulty: SkillLevel;
  requirements: string[];
  deliverables: Deliverable[];
  evaluationCriteria: EvaluationCriterion[];
  estimatedHours: number;
  resources: string[];
  exampleSolution?: string;
}

/**
 * Project deliverable
 */
export interface Deliverable {
  id: string;
  name: string;
  description: string;
  type: 'code' | 'documentation' | 'presentation' | 'demo' | 'report';
  weight: number;
  dueDate?: string;
}

/**
 * Resource types
 */
export interface Resource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'book' | 'course' | 'documentation' | 'tool' | 'dataset';
  url?: string;
  description: string;
  author?: string;
  publishedDate?: string;
  difficulty?: SkillLevel;
  duration?: number;
  tags?: string[];
}

/**
 * Author information
 */
export interface Author {
  name: string;
  email?: string;
  organization?: string;
  credentials?: string[];
  bio?: string;
}

/**
 * Grading scale definition
 */
export interface GradingScale {
  type: 'percentage' | 'letter' | 'points' | 'competency';
  scale: GradingLevel[];
}

/**
 * Individual grading level
 */
export interface GradingLevel {
  grade: string; // e.g., "A", "B+", "Pass", "Exemplary"
  minPercentage: number;
  maxPercentage?: number;
  description: string;
  gpa?: number;
}

/**
 * Skill statistics
 */
export interface SkillStatistics {
  enrollments: number;
  completions: number;
  averageScore: number;
  averageTimeToComplete: number; // hours
  satisfactionRating: number; // 1-5
  difficultyRating: number; // 1-5
  passRate: number; // percentage
  lastUpdated: string;
}

/**
 * Evaluation result structure
 */
export interface EvaluationResult {
  id: string;
  skillId: string;
  skillName: string;
  learnerId: string;
  learnerName?: string;
  
  // Assessment details
  assessmentId: string;
  assessmentType: AssessmentType;
  submittedAt: string;
  evaluatedAt: string;
  
  // Scoring
  overallScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  passed: boolean;
  
  // Detailed results
  criterionResults: CriterionResult[];
  feedback: Feedback;
  
  // AI-assisted components
  aiAnalysis?: AIAnalysis;
  
  // Review status
  status: 'pending' | 'auto-graded' | 'peer-reviewed' | 'instructor-graded' | 'finalized';
  reviewedBy?: string;
  reviewNotes?: string;
  
  // Metadata
  attempt: number;
  timeSpent: number; // minutes
  plagiarismCheck?: PlagiarismResult;
}

/**
 * Criterion-level result
 */
export interface CriterionResult {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: number;
  feedback: string;
  evidence?: string;
}

/**
 * Comprehensive feedback structure
 */
export interface Feedback {
  overall: string;
  strengths: string[];
  areasForImprovement: string[];
  specificRecommendations: string[];
  resourcesForImprovement: Resource[];
  nextSteps: string[];
}

/**
 * AI Analysis for AI-assisted evaluations
 */
export interface AIAnalysis {
  model: string;
  confidence: number;
  summary: string;
  codeQuality?: {
    readability: number;
    maintainability: number;
    efficiency: number;
    bestPractices: number;
  };
  sentiment?: {
    tone: 'positive' | 'neutral' | 'negative';
    confidence: number;
  };
  suggestions: string[];
  rawResponse?: string;
  processingTime: number; // ms
}

/**
 * Plagiarism check result
 */
export interface PlagiarismResult {
  checked: boolean;
  similarityScore: number; // percentage
  sources?: Array<{
    url: string;
    similarity: number;
    matchedContent: string;
  }>;
  status: 'clean' | 'suspicious' | 'high-similarity';
}

/**
 * Skill enrollment and progress tracking
 */
export interface LearnerProgress {
  learnerId: string;
  skillId: string;
  enrolledAt: string;
  status: 'enrolled' | 'in-progress' | 'completed' | 'dropped';
  
  // Progress tracking
  modulesCompleted: number;
  totalModules: number;
  assessmentsCompleted: number;
  totalAssessments: number;
  overallProgress: number; // percentage
  
  // Time tracking
  timeSpent: number; // minutes
  lastActiveAt: string;
  estimatedCompletionDate?: string;
  
  // Performance
  currentGrade: string;
  averageScore: number;
  evaluations: EvaluationResult[];
  
  // Personalization
  learningPath: string[]; // Module IDs in recommended order
  weakAreas: string[];
  strongAreas: string[];
  personalizedRecommendations: string[];
}

/**
 * Badge/Certification for skill completion
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  skillId: string;
  criteria: {
    minimumScore: number;
    requiredAssessments: string[];
    additionalRequirements?: string[];
  };
  image?: string;
  digitalCredential?: {
    issuer: string;
    verificationUrl: string;
    blockchain?: boolean;
  };
}

/**
 * API Response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  pagination?: PaginationInfo;
  timestamp: string;
}

/**
 * API Error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

/**
 * Pagination info for list responses
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Query parameters for filtering skills
 */
export interface SkillQuery {
  category?: SkillCategory;
  level?: SkillLevel;
  search?: string;
  tags?: string[];
  author?: string;
  status?: Skill['status'];
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'popularity' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Evaluation query parameters
 */
export interface EvaluationQuery {
  skillId?: string;
  learnerId?: string;
  status?: EvaluationResult['status'];
  passed?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'submittedAt' | 'score' | 'percentage';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
