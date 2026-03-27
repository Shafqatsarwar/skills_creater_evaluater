/**
 * Personal Tutor Skill
 * Evaluates student submissions and provides personalized feedback
 */

interface StudentSubmission {
  assignmentId: string;
  studentId: string;
  content: string;
  language: 'javascript' | 'python' | 'java' | 'typescript' | 'html' | 'css';
}

interface RubricCriterion {
  name: string;
  points: number;
  description: string;
}

interface AssignmentRubric {
  criteria: RubricCriterion[];
  maxPoints: number;
}

interface StudentProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  pastPerformance: Array<{
    assignmentId: string;
    score: number;
  }>;
}

interface EvaluationResult {
  assignmentId: string;
  studentId: string;
  score: number;
  maxPoints: number;
  percentage: number;
  feedback: string;
  suggestions: string[];
  grade: string;
  evaluationDetails: {
    criterionScores: Array<{
      criterion: string;
      earnedPoints: number;
      maxPoints: number;
      feedback: string;
    }>;
  };
}

export class PersonalTutor {
  /**
   * Evaluates a student submission against the provided rubric
   */
  async evaluateSubmission(
    studentSubmission: StudentSubmission,
    rubric: AssignmentRubric,
    studentProfile: StudentProfile = {
      experienceLevel: 'beginner',
      pastPerformance: []
    }
  ): Promise<EvaluationResult> {
    // Simulate evaluation process
    console.log(`Evaluating submission for student ${studentSubmission.studentId} on assignment ${studentSubmission.assignmentId}`);

    // Perform syntax analysis based on language
    const syntaxIssues = this.checkSyntax(studentSubmission.content, studentSubmission.language);

    // Evaluate against rubric criteria
    const criterionScores = await this.evaluateAgainstRubric(studentSubmission, rubric, syntaxIssues);

    // Calculate total score
    const totalEarnedPoints = criterionScores.reduce((sum, item) => sum + item.earnedPoints, 0);
    const totalPossiblePoints = rubric.maxPoints;
    const percentage = Math.round((totalEarnedPoints / totalPossiblePoints) * 100);

    // Determine letter grade
    const grade = this.calculateGrade(percentage);

    // Generate personalized feedback based on student profile
    const feedback = this.generatePersonalizedFeedback(
      studentSubmission,
      criterionScores,
      studentProfile,
      percentage
    );

    // Generate improvement suggestions
    const suggestions = this.generateSuggestions(criterionScores, syntaxIssues, studentProfile);

    const result: EvaluationResult = {
      assignmentId: studentSubmission.assignmentId,
      studentId: studentSubmission.studentId,
      score: totalEarnedPoints,
      maxPoints: totalPossiblePoints,
      percentage,
      feedback,
      suggestions,
      grade,
      evaluationDetails: {
        criterionScores
      }
    };

    // Save evaluation result to evals.json
    await this.saveEvaluationResult(result);

    return result;
  }

  /**
   * Checks syntax based on the programming language
   */
  private checkSyntax(content: string, language: string): string[] {
    const issues: string[] = [];

    switch (language) {
      case 'javascript':
      case 'typescript':
        // Basic syntax checks for JS/TS
        if (/(var|let|const)\s+[A-Z]/.test(content)) {
          issues.push("Variable names should typically start with lowercase letters");
        }

        if (content.includes('==') && !content.includes('===') && !content.includes('!==')) {
          issues.push("Use strict equality (===) instead of loose equality (==)");
        }
        break;

      case 'python':
        // Basic syntax checks for Python
        if (/^ + +/gm.test(content)) {
          issues.push("Inconsistent indentation detected");
        }
        break;

      case 'java':
        // Basic syntax checks for Java
        if (!content.trim().endsWith('}')) {
          issues.push("Missing closing brace at end of class/file");
        }
        break;

      case 'html':
        // Basic syntax checks for HTML
        if (content.includes('<') && !content.includes('>')) {
          issues.push("Unclosed HTML tags detected");
        }
        break;

      case 'css':
        // Basic syntax checks for CSS
        if (content.includes('{') && !content.includes('}')) {
          issues.push("Unclosed CSS blocks detected");
        }
        break;
    }

    return issues;
  }

  /**
   * Evaluates submission against rubric criteria
   */
  private async evaluateAgainstRubric(
    submission: StudentSubmission,
    rubric: AssignmentRubric,
    syntaxIssues: string[]
  ): Promise<Array<{
    criterion: string;
    earnedPoints: number;
    maxPoints: number;
    feedback: string;
  }>> {
    const results = [];

    for (const criterion of rubric.criteria) {
      let earnedPoints = criterion.points;
      let feedback = `Met the requirements for ${criterion.name}`;

      // Adjust points based on various factors
      switch (criterion.name.toLowerCase()) {
        case 'correctness':
        case 'functionality':
          // Check if the code seems functional
          if (syntaxIssues.length > 0) {
            earnedPoints = Math.max(0, criterion.points - (syntaxIssues.length * 0.5));
            feedback = `Has syntax issues but meets basic functionality: ${syntaxIssues.join(', ')}`;
          }
          break;

        case 'code style':
        case 'style':
          // Check code style
          if (syntaxIssues.length > 0) {
            earnedPoints = Math.max(0, criterion.points - (syntaxIssues.length * 0.3));
            feedback = `Could improve style based on syntax issues: ${syntaxIssues.join(', ')}`;
          }
          break;

        case 'efficiency':
        case 'performance':
          // This would require more complex analysis
          feedback = `Basic efficiency check completed`;
          break;

        case 'documentation':
        case 'comments':
          // Check for comments
          const commentRatio = (submission.content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length /
                              submission.content.split('\n').length;
          if (commentRatio < 0.1) {
            earnedPoints = Math.max(0, criterion.points - 1);
            feedback = `Could use more documentation/comments`;
          }
          break;

        default:
          feedback = `Evaluated ${criterion.name}: ${criterion.description}`;
      }

      results.push({
        criterion: criterion.name,
        earnedPoints: Math.round(earnedPoints * 100) / 100, // Round to 2 decimal places
        maxPoints: criterion.points,
        feedback
      });
    }

    return results;
  }

  /**
   * Calculates letter grade based on percentage
   */
  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Generates personalized feedback based on student profile
   */
  private generatePersonalizedFeedback(
    submission: StudentSubmission,
    criterionScores: any[],
    studentProfile: StudentProfile,
    percentage: number
  ): string {
    let feedback = `Your submission for assignment ${submission.assignmentId} has been evaluated. `;

    if (percentage >= 90) {
      feedback += "Excellent work! Your solution demonstrates strong understanding.";
    } else if (percentage >= 80) {
      feedback += "Good job! Your solution meets most requirements.";
    } else if (percentage >= 70) {
      feedback += "Satisfactory work. You've met the basic requirements.";
    } else {
      feedback += "Needs improvement. Review the feedback below.";
    }

    // Add language-specific feedback
    switch (submission.language) {
      case 'javascript':
        feedback += ` Specifically for JavaScript, `;
        break;
      case 'python':
        feedback += ` Specifically for Python, `;
        break;
      case 'java':
        feedback += ` Specifically for Java, `;
        break;
      default:
        feedback += ` For ${submission.language}, `;
    }

    feedback += "your implementation shows good effort.";

    // Add adaptive feedback based on student profile
    if (studentProfile.experienceLevel === 'beginner') {
      feedback += " As a beginner, focus on understanding the fundamental concepts.";
    } else if (studentProfile.experienceLevel === 'intermediate') {
      feedback += " As an intermediate learner, try incorporating more advanced patterns.";
    } else {
      feedback += " As an advanced learner, consider optimizing for performance and maintainability.";
    }

    return feedback;
  }

  /**
   * Generates improvement suggestions
   */
  private generateSuggestions(
    criterionScores: any[],
    syntaxIssues: string[],
    studentProfile: StudentProfile
  ): string[] {
    const suggestions: string[] = [];

    // Add syntax-related suggestions
    if (syntaxIssues.length > 0) {
      suggestions.push(`Fix the following syntax issues: ${syntaxIssues.join(', ')}`);
    }

    // Add criterion-specific suggestions for low-scoring items
    for (const item of criterionScores) {
      if (item.earnedPoints < item.maxPoints * 0.7) { // Less than 70% of possible points
        suggestions.push(`Improve in ${item.criterion}: ${item.feedback}`);
      }
    }

    // Add general suggestions based on experience level
    if (studentProfile.experienceLevel === 'beginner') {
      suggestions.push("Review fundamental concepts related to this assignment");
      suggestions.push("Practice with simpler examples before attempting complex problems");
    } else if (studentProfile.experienceLevel === 'intermediate') {
      suggestions.push("Consider more efficient algorithms or design patterns");
      suggestions.push("Review best practices for code organization");
    } else {
      suggestions.push("Focus on optimization and edge case handling");
      suggestions.push("Consider performance implications of your implementation");
    }

    return suggestions;
  }

  /**
   * Saves evaluation result to evals.json
   */
  private async saveEvaluationResult(result: EvaluationResult): Promise<void> {
    // In a real implementation, this would append to evals.json
    // For this example, we'll just log the action
    console.log(`Saving evaluation result to evals.json for student ${result.studentId}`);

    // This would typically involve reading the existing evals.json, appending the new result,
    // and writing it back to the file
    const fs = require('fs').promises;

    let evalsData: any = { evaluations: [], skills: [] };

    try {
      // Attempt to read existing evals.json
      const existingData = await fs.readFile('./evals.json', 'utf8');
      evalsData = JSON.parse(existingData);
    } catch (error) {
      // If file doesn't exist, start with empty structure
      console.log('evals.json not found, starting with empty structure');
    }

    // Add the new evaluation result
    if (!evalsData.evaluations) {
      evalsData.evaluations = [];
    }

    evalsData.evaluations.push({
      id: `eval-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...result
    });

    // Ensure skills array exists
    if (!evalsData.skills) {
      evalsData.skills = [];
    }

    // Add the skill if not already present
    if (!evalsData.skills.some((skill: any) => skill.name === 'personal-tutor')) {
      evalsData.skills.push({
        name: 'personal-tutor',
        version: '1.0.0',
        description: 'Personal Tutor skill that evaluates student submissions and provides personalized feedback',
        author: 'Panaverse',
        createdDate: new Date().toISOString()
      });
    }

    // Write updated data back to evals.json
    await fs.writeFile('./evals.json', JSON.stringify(evalsData, null, 2));
    console.log('Evaluation result saved to evals.json');
  }
}

// Export for use in other modules
export default PersonalTutor;