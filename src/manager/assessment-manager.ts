/**
 * Assessment Manager
 *
 * Component responsible for managing assessment definitions,
 * metadata, and configurations.
 */

import { Assessment } from '../engine/assessment-engine';

export interface AssessmentFilter {
  type?: 'coding' | 'multiple-choice' | 'project' | 'practical';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  search?: string;
}

export interface AssessmentConfig {
  id: string;
  name: string;
  value: any;
}

export class AssessmentManager {
  private assessments: Map<string, Assessment> = new Map();
  private configs: Map<string, AssessmentConfig> = new Map();

  constructor() {
    // Initialize with some sample assessments
    this.initializeSampleAssessments();
  }

  /**
   * Gets all assessments with optional filtering
   */
  public async getAllAssessments(filter?: AssessmentFilter): Promise<Assessment[]> {
    let assessments = Array.from(this.assessments.values());

    if (filter) {
      if (filter.type) {
        assessments = assessments.filter(a => a.type === filter.type);
      }

      if (filter.difficulty) {
        assessments = assessments.filter(a => a.difficulty === filter.difficulty);
      }

      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        assessments = assessments.filter(a =>
          a.title.toLowerCase().includes(searchTerm) ||
          a.description.toLowerCase().includes(searchTerm)
        );
      }
    }

    return assessments;
  }

  /**
   * Gets a specific assessment by ID
   */
  public async getAssessmentById(id: string): Promise<Assessment | null> {
    return this.assessments.get(id) || null;
  }

  /**
   * Creates a new assessment
   */
  public async createAssessment(assessment: Assessment): Promise<Assessment> {
    if (this.assessments.has(assessment.id)) {
      throw new Error(`Assessment with ID ${assessment.id} already exists`);
    }

    this.assessments.set(assessment.id, assessment);
    return assessment;
  }

  /**
   * Updates an existing assessment
   */
  public async updateAssessment(id: string, assessment: Assessment): Promise<Assessment> {
    if (!this.assessments.has(id)) {
      throw new Error(`Assessment with ID ${id} does not exist`);
    }

    this.assessments.set(id, assessment);
    return assessment;
  }

  /**
   * Deletes an assessment
   */
  public async deleteAssessment(id: string): Promise<boolean> {
    return this.assessments.delete(id);
  }

  /**
   * Gets configuration by ID
   */
  public async getConfig(id: string): Promise<AssessmentConfig | null> {
    return this.configs.get(id) || null;
  }

  /**
   * Sets configuration
   */
  public async setConfig(config: AssessmentConfig): Promise<AssessmentConfig> {
    this.configs.set(config.id, config);
    return config;
  }

  /**
   * Gets all configurations
   */
  public async getAllConfigs(): Promise<AssessmentConfig[]> {
    return Array.from(this.configs.values());
  }

  /**
   * Initializes sample assessments for demonstration
   */
  private initializeSampleAssessments(): void {
    // Sample JavaScript assessment
    const jsAssessment: Assessment = {
      id: 'js-fundamentals-001',
      title: 'JavaScript Fundamentals',
      description: 'Basic concepts of JavaScript including variables, functions, and objects',
      type: 'coding',
      difficulty: 'beginner',
      timeLimit: 45,
      questions: [
        {
          id: 'q1',
          type: 'single-choice',
          questionText: 'Which keyword is used to declare a constant variable in JavaScript?',
          options: ['var', 'let', 'const', 'define'],
          correctAnswer: 'const',
          points: 10
        },
        {
          id: 'q2',
          type: 'multiple-choice',
          questionText: 'Which of the following are primitive data types in JavaScript?',
          options: ['String', 'Object', 'Number', 'Boolean', 'Array', 'Undefined'],
          correctAnswer: ['String', 'Number', 'Boolean', 'Undefined'],
          points: 15
        },
        {
          id: 'q3',
          type: 'code',
          questionText: 'Write a function that takes an array of numbers and returns the sum',
          points: 25
        }
      ],
      scoringCriteria: [
        { criterion: 'Correctness', weight: 0.6, maxPoints: 30 },
        { criterion: 'Code quality', weight: 0.3, maxPoints: 15 },
        { criterion: 'Efficiency', weight: 0.1, maxPoints: 5 }
      ]
    };

    // Sample Python assessment
    const pythonAssessment: Assessment = {
      id: 'python-basics-002',
      title: 'Python Basics',
      description: 'Fundamental concepts of Python programming',
      type: 'coding',
      difficulty: 'beginner',
      timeLimit: 50,
      questions: [
        {
          id: 'q1',
          type: 'single-choice',
          questionText: 'Which symbol is used for comments in Python?',
          options: ['//', '/* */', '#', '--'],
          correctAnswer: '#',
          points: 10
        },
        {
          id: 'q2',
          type: 'code',
          questionText: 'Write a Python function that calculates factorial of a number',
          points: 30
        }
      ],
      scoringCriteria: [
        { criterion: 'Correctness', weight: 0.7, maxPoints: 28 },
        { criterion: 'Code quality', weight: 0.3, maxPoints: 12 }
      ]
    };

    // Sample Web Development assessment
    const webDevAssessment: Assessment = {
      id: 'web-dev-003',
      title: 'Web Development Concepts',
      description: 'HTML, CSS, and basic web technologies',
      type: 'multiple-choice',
      difficulty: 'intermediate',
      timeLimit: 30,
      questions: [
        {
          id: 'q1',
          type: 'single-choice',
          questionText: 'Which HTML tag is used to define an internal style sheet?',
          options: ['<css>', '<script>', '<style>', '<link>'],
          correctAnswer: '<style>',
          points: 10
        },
        {
          id: 'q2',
          type: 'multiple-choice',
          questionText: 'Which CSS properties are used for Flexbox layout?',
          options: ['display: flex', 'flex-direction', 'justify-content', 'float', 'position'],
          correctAnswer: ['display: flex', 'flex-direction', 'justify-content'],
          points: 15
        },
        {
          id: 'q3',
          type: 'text',
          questionText: 'Explain the difference between inline, block, and inline-block display properties.',
          points: 20
        }
      ],
      scoringCriteria: [
        { criterion: 'Accuracy', weight: 0.8, maxPoints: 36 },
        { criterion: 'Clarity of explanation', weight: 0.2, maxPoints: 9 }
      ]
    };

    // Add sample assessments to the map
    this.assessments.set(jsAssessment.id, jsAssessment);
    this.assessments.set(pythonAssessment.id, pythonAssessment);
    this.assessments.set(webDevAssessment.id, webDevAssessment);

    // Add some sample configurations
    this.configs.set('difficulty-thresholds', {
      id: 'difficulty-thresholds',
      name: 'Passing Thresholds by Difficulty',
      value: {
        beginner: 0.65,
        intermediate: 0.70,
        advanced: 0.75
      }
    });

    this.configs.set('time-modifiers', {
      id: 'time-modifiers',
      name: 'Time Modifiers by Difficulty',
      value: {
        beginner: 1.2,
        intermediate: 1.0,
        advanced: 0.8
      }
    });
  }
}