/**
 * Assessment Engine
 *
 * Core component responsible for executing skill assessments,
 * validating submissions, calculating scores, and generating feedback.
 */

export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'multiple-choice' | 'project' | 'practical';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number; // in minutes
  questions: Question[];
  scoringCriteria: ScoringCriteria[];
}

export interface Question {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'text' | 'code' | 'upload';
  questionText: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
}

export interface ScoringCriteria {
  criterion: string;
  weight: number; // 0-1
  maxPoints: number;
}

export interface Submission {
  assessmentId: string;
  userId: string;
  answers: Answer[];
  timestamp: Date;
}

export interface Answer {
  questionId: string;
  response: string | string[] | object;
  timeSpent?: number; // in seconds
}

export interface EvaluationResult {
  id: string;
  assessmentId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback: FeedbackItem[];
  timestamp: Date;
  passed: boolean;
}

export interface FeedbackItem {
  questionId: string;
  correctness: 'correct' | 'incorrect' | 'partial';
  explanation: string;
  suggestions?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class AssessmentEngine {
  /**
   * Evaluates a submission against an assessment
   */
  public async evaluateSubmission(
    assessmentId: string,
    submission: Submission
  ): Promise<EvaluationResult> {
    // In a real implementation, we would fetch the assessment definition
    // For now, we'll create a mock assessment
    const assessment = this.getMockAssessment(assessmentId);

    if (!assessment) {
      throw new Error(`Assessment with ID ${assessmentId} not found`);
    }

    // Validate submission
    const validationResult = this.validateSubmission(submission, assessment);
    if (!validationResult.isValid) {
      throw new Error(`Invalid submission: ${validationResult.errors.join(', ')}`);
    }

    // Calculate score
    const { score, maxScore } = this.calculateScore(submission, assessment);

    // Generate feedback
    const feedback = this.generateFeedback(submission, assessment);

    // Create result
    const result: EvaluationResult = {
      id: this.generateId(),
      assessmentId: assessment.id,
      userId: submission.userId,
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      feedback,
      timestamp: new Date(),
      passed: score / maxScore >= 0.7 // 70% threshold for passing
    };

    return result;
  }

  /**
   * Validates a submission against assessment requirements
   */
  private validateSubmission(
    submission: Submission,
    assessment: Assessment
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check that all required questions are answered
    for (const question of assessment.questions) {
      const answer = submission.answers.find(a => a.questionId === question.id);

      if (!answer) {
        errors.push(`Missing answer for question: ${question.questionText}`);
      }
    }

    // Check for extra answers not in the assessment
    for (const answer of submission.answers) {
      const questionExists = assessment.questions.some(q => q.id === answer.questionId);
      if (!questionExists) {
        warnings.push(`Unexpected answer for question ID: ${answer.questionId}`);
      }
    }

    // Check submission time constraints if applicable
    if (assessment.timeLimit) {
      // This would require checking the actual time spent
      // For now, we'll just acknowledge the constraint exists
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculates the score for a submission
   */
  private calculateScore(submission: Submission, assessment: Assessment): { score: number; maxScore: number } {
    let score = 0;
    let maxScore = 0;

    for (const question of assessment.questions) {
      maxScore += question.points;

      const answer = submission.answers.find(a => a.questionId === question.id);
      if (answer) {
        const questionScore = this.scoreQuestion(answer, question);
        score += questionScore;
      }
    }

    return { score, maxScore };
  }

  /**
   * Scores an individual question
   */
  private scoreQuestion(answer: Answer, question: Question): number {
    // For simplicity, we'll implement basic scoring
    // In a real system, this would vary by question type

    switch (question.type) {
      case 'single-choice':
      case 'multiple-choice':
        if (Array.isArray(question.correctAnswer)) {
          // Multiple choice - check if all correct answers were selected
          const userAnswers = Array.isArray(answer.response) ? answer.response : [answer.response];
          const correctCount = question.correctAnswer.filter(ca => userAnswers.includes(ca)).length;
          const totalCount = question.correctAnswer.length;

          if (correctCount === totalCount && userAnswers.length === totalCount) {
            return question.points;
          } else if (correctCount > 0) {
            // Partial credit for partially correct answers
            return (correctCount / totalCount) * question.points;
          }
        } else {
          // Single choice
          if (answer.response === question.correctAnswer) {
            return question.points;
          }
        }
        return 0;

      case 'text':
      case 'code':
        // For text/code questions, we'd typically need more sophisticated evaluation
        // For now, we'll give full points if there's a response
        if (answer.response && String(answer.response).trim().length > 0) {
          return question.points;
        }
        return 0;

      case 'upload':
        // For upload questions, we'd check if a file was submitted
        if (answer.response) {
          return question.points;
        }
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Generates feedback for a submission
   */
  private generateFeedback(submission: Submission, assessment: Assessment): FeedbackItem[] {
    const feedback: FeedbackItem[] = [];

    for (const question of assessment.questions) {
      const answer = submission.answers.find(a => a.questionId === question.id);

      if (!answer) {
        feedback.push({
          questionId: question.id,
          correctness: 'incorrect',
          explanation: 'No answer provided for this question.',
          suggestions: ['Please provide an answer for all questions']
        });
        continue;
      }

      let correctness: 'correct' | 'incorrect' | 'partial' = 'incorrect';
      let explanation = '';
      let suggestions: string[] = [];

      // Determine correctness based on question type
      switch (question.type) {
        case 'single-choice':
        case 'multiple-choice':
          if (Array.isArray(question.correctAnswer)) {
            const userAnswers = Array.isArray(answer.response) ? answer.response : [answer.response];
            const correctCount = question.correctAnswer.filter(ca => userAnswers.includes(ca)).length;
            const totalCount = question.correctAnswer.length;

            if (correctCount === totalCount && userAnswers.length === totalCount) {
              correctness = 'correct';
              explanation = 'Correct answer!';
            } else if (correctCount > 0) {
              correctness = 'partial';
              explanation = `Partially correct. You got ${correctCount} out of ${totalCount} correct answers.`;
              suggestions = [`Review the material to understand why ${question.correctAnswer.filter(ca => !userAnswers.includes(ca)).join(', ')} are also correct.`];
            } else {
              correctness = 'incorrect';
              explanation = 'Incorrect answer.';
              suggestions = [`The correct answer(s): ${question.correctAnswer.join(', ')}`];
            }
          } else {
            if (answer.response === question.correctAnswer) {
              correctness = 'correct';
              explanation = 'Correct answer!';
            } else {
              correctness = 'incorrect';
              explanation = 'Incorrect answer.';
              suggestions = [`The correct answer: ${question.correctAnswer}`];
            }
          }
          break;

        case 'text':
        case 'code':
          // For text/code, we'll just acknowledge the response
          if (answer.response && String(answer.response).trim().length > 0) {
            correctness = 'correct'; // We'll treat any response as correct for now
            explanation = 'Response received. In a full implementation, this would be evaluated by an expert.';
            suggestions = ['Consider reviewing your response against best practices or model answers.'];
          } else {
            correctness = 'incorrect';
            explanation = 'No response provided.';
            suggestions = ['Please provide a detailed response for this question.'];
          }
          break;

        case 'upload':
          if (answer.response) {
            correctness = 'correct';
            explanation = 'File uploaded successfully.';
            suggestions = ['Your submission will be reviewed by an evaluator.'];
          } else {
            correctness = 'incorrect';
            explanation = 'No file was uploaded.';
            suggestions = ['Please upload the required file.'];
          }
          break;

        default:
          correctness = 'correct';
          explanation = 'Question processed.';
      }

      feedback.push({
        questionId: question.id,
        correctness,
        explanation,
        suggestions
      });
    }

    return feedback;
  }

  /**
   * Generates a unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Mock method to get an assessment (in real implementation, this would fetch from DB)
   */
  private getMockAssessment(assessmentId: string): Assessment | null {
    // This is a simplified mock - in a real system, this would come from a database
    return {
      id: assessmentId,
      title: 'JavaScript Fundamentals Assessment',
      description: 'Test your knowledge of JavaScript fundamentals',
      type: 'coding',
      difficulty: 'intermediate',
      timeLimit: 60,
      questions: [
        {
          id: 'q1',
          type: 'single-choice',
          questionText: 'What is the result of typeof null in JavaScript?',
          options: ['"null"', '"object"', '"undefined"', '"boolean"'],
          correctAnswer: '"object"',
          points: 10
        },
        {
          id: 'q2',
          type: 'code',
          questionText: 'Write a function that reverses a string',
          points: 20
        }
      ],
      scoringCriteria: [
        { criterion: 'Correctness', weight: 0.6, maxPoints: 60 },
        { criterion: 'Efficiency', weight: 0.3, maxPoints: 30 },
        { criterion: 'Code quality', weight: 0.1, maxPoints: 10 }
      ]
    };
  }
}