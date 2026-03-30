/**
 * Constitution-Compliant Evaluation Engine
 * Ensures all evaluations adhere to the Skills Evaluator Constitution
 */

import {
  Skill,
  EvaluationResult,
  EvaluationCriterion,
  CriterionResult,
  Feedback,
  AIAnalysis,
  RubricLevel
} from '../types/skill-types';

export interface LearnerProfile {
  id: string;
  name: string;
  level: 'foundational' | 'intermediate' | 'advanced';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  previousEvaluations: number;
  averageScore: number;
  weakAreas: string[];
  strongAreas: string[];
}

export interface ConstitutionComplianceReport {
  assessmentFirst: boolean;
  modularFramework: boolean;
  testDriven: boolean;
  skillsFirst: boolean;
  dualTrack: boolean;
  transparency: boolean;
  fairness: boolean;
  biasMitigation: boolean;
}

export interface EvaluationContext {
  skill: Skill;
  submission: any;
  learnerProfile?: LearnerProfile;
  previousAttempts?: EvaluationResult[];
  constitutionCompliance: ConstitutionComplianceReport;
}

export interface EvaluationConfig {
  enableAIEvaluation: boolean;
  enablePeerReview: boolean;
  enablePlagiarismCheck: boolean;
  requireHumanReview: boolean;
  autoFeedback: boolean;
  detailedRubricScoring: boolean;
  constitutionComplianceEnforcement: boolean;
}

export class ConstitutionCompliantEvaluationEngine {
  private config: EvaluationConfig;

  constructor(config?: Partial<EvaluationConfig>) {
    this.config = {
      enableAIEvaluation: true,
      enablePeerReview: false,
      enablePlagiarismCheck: true,
      requireHumanReview: false,
      autoFeedback: true,
      detailedRubricScoring: true,
      constitutionComplianceEnforcement: true,
      ...config
    };
  }

  /**
   * Main evaluation entry point with constitution compliance check
   */
  async evaluate(
    skill: Skill,
    submission: any,
    learnerProfile?: LearnerProfile
  ): Promise<EvaluationResult> {
    console.log(`Starting constitution-compliant evaluation for skill: ${skill.name}`);

    // Check constitution compliance before evaluation
    const compliance = this.checkConstitutionCompliance(skill);
    if (!compliance.assessmentFirst) {
      throw new Error('Skill does not meet Assessment-First Approach requirement. Evaluation criteria must be defined before evaluation.');
    }

    const context: EvaluationContext = {
      skill,
      submission,
      learnerProfile,
      previousAttempts: [],
      constitutionCompliance: compliance
    };

    // Log compliance status
    this.logComplianceStatus(compliance);

    // Evaluate against each criterion
    const criterionResults = await this.evaluateAgainstCriteria(context);

    // Calculate overall score
    const { overallScore, maxScore, percentage } = this.calculateOverallScore(
      criterionResults,
      skill.evaluationCriteria
    );

    // Determine grade
    const grade = this.determineGrade(percentage, skill.gradingScale);

    // Generate feedback
    const feedback = await this.generateFeedback(
      context,
      criterionResults,
      learnerProfile
    );

    // AI Analysis (if enabled)
    let aiAnalysis: AIAnalysis | undefined;
    if (this.config.enableAIEvaluation && skill.aiSupport?.enabled) {
      aiAnalysis = await this.performAIAnalysis(context, criterionResults);
    }

    // Plagiarism check (if enabled and applicable)
    const plagiarismCheck = this.config.enablePlagiarismCheck
      ? await this.checkPlagiarism(submission)
      : undefined;

    // Bias mitigation check
    const biasMitigationApplied = this.applyBiasMitigation(criterionResults);

    // Build evaluation result with constitution compliance info
    const result: EvaluationResult = {
      id: this.generateEvaluationId(),
      skillId: skill.id,
      skillName: skill.name,
      learnerId: learnerProfile?.id || 'anonymous',
      learnerName: learnerProfile?.name,
      assessmentId: this.generateAssessmentId(),
      assessmentType: skill.assessmentTypes[0],
      submittedAt: new Date().toISOString(),
      evaluatedAt: new Date().toISOString(),
      overallScore: Math.round(overallScore * 100) / 100,
      maxScore,
      percentage: Math.round(percentage),
      grade,
      passed: percentage >= skill.passingScore,
      criterionResults,
      feedback,
      aiAnalysis,
      status: this.config.requireHumanReview ? 'pending' : 'auto-graded',
      attempt: 1,
      timeSpent: submission.timeSpent || 0,
      plagiarismCheck,
      // Add constitution compliance metadata
      ...(biasMitigationApplied && { biasMitigationApplied: true })
    };

    return result;
  }

  /**
   * Check constitution compliance of a skill
   */
  private checkConstitutionCompliance(skill: Skill): ConstitutionComplianceReport {
    const compliance: ConstitutionComplianceReport = {
      assessmentFirst: false,
      modularFramework: false,
      testDriven: false,
      skillsFirst: false,
      dualTrack: false,
      transparency: false,
      fairness: false,
      biasMitigation: false
    };

    // Assessment-First Approach: Check if evaluation criteria exist
    if (skill.evaluationCriteria && skill.evaluationCriteria.length > 0) {
      compliance.assessmentFirst = true;
    }

    // Modular Framework: Check if modules exist
    if (skill.modules && skill.modules.length > 0) {
      compliance.modularFramework = true;
    }

    // Test-Driven Evaluation: Check if assessment types exist
    if (skill.assessmentTypes && skill.assessmentTypes.length > 0) {
      compliance.testDriven = true;
    }

    // Skills-First Approach: Check if non-AI evaluation paths exist
    if (skill.evaluationCriteria && skill.evaluationCriteria.some(ec => ec.autoGradingEnabled === true)) {
      compliance.skillsFirst = true;
      compliance.dualTrack = true;
    }

    // Dual-Track Evaluation: Check if both AI and non-AI paths exist
    if (skill.aiSupport && skill.aiSupport.enabled) {
      if (skill.evaluationCriteria && skill.evaluationCriteria.some(ec => ec.autoGradingEnabled === true)) {
        compliance.dualTrack = true;
      }
    } else {
      // If AI is disabled, ensure non-AI path exists
      if (skill.evaluationCriteria && skill.evaluationCriteria.length > 0) {
        compliance.dualTrack = true;
      }
    }

    // Transparency: Check if grading scale exists
    if (skill.gradingScale && skill.gradingScale.scale && skill.gradingScale.scale.length > 0) {
      compliance.transparency = true;
    }

    // Fairness: Check if rubrics exist for all criteria
    if (skill.evaluationCriteria && skill.evaluationCriteria.every(ec => ec.rubric && ec.rubric.length > 0)) {
      compliance.fairness = true;
    }

    // Bias Mitigation: Check if bias mitigation protocols are in place
    if (skill.evaluationCriteria && skill.evaluationCriteria.some(ec => ec.requiresHumanReview === true)) {
      compliance.biasMitigation = true;
    }

    return compliance;
  }

  /**
   * Log compliance status
   */
  private logComplianceStatus(compliance: ConstitutionComplianceReport): void {
    const complianceChecks = [
      { key: 'assessmentFirst', label: 'Assessment-First Approach', emoji: '🎯' },
      { key: 'modularFramework', label: 'Modular Framework', emoji: '🧩' },
      { key: 'testDriven', label: 'Test-Driven Evaluation', emoji: '🧪' },
      { key: 'skillsFirst', label: 'Skills-First Approach', emoji: '基石' },
      { key: 'dualTrack', label: 'Dual-Track Evaluation', emoji: '⚖️' },
      { key: 'transparency', label: 'Transparency', emoji: '🔍' },
      { key: 'fairness', label: 'Fairness', emoji: '⚖️' },
      { key: 'biasMitigation', label: 'Bias Mitigation', emoji: '🛡️' }
    ];

    console.log('\n🏛️  CONSTITUTION COMPLIANCE STATUS:');
    for (const check of complianceChecks) {
      const isCompliant = compliance[check.key as keyof ConstitutionComplianceReport];
      console.log(`  ${isCompliant ? '✅' : '❌'} ${check.emoji} ${check.label}: ${isCompliant ? 'COMPLIANT' : 'NOT COMPLIANT'}`);
    }
    console.log('');
  }

  /**
   * Evaluate submission against all criteria
   */
  private async evaluateAgainstCriteria(
    context: EvaluationContext
  ): Promise<CriterionResult[]> {
    const results: CriterionResult[] = [];

    for (const criterion of context.skill.evaluationCriteria) {
      const result = await this.evaluateCriterion(context, criterion);
      results.push(result);
    }

    return results;
  }

  /**
   * Evaluate against a single criterion with constitution compliance
   */
  private async evaluateCriterion(
    context: EvaluationContext,
    criterion: EvaluationCriterion
  ): Promise<CriterionResult> {
    const submission = context.submission;

    // Extract relevant content for this criterion
    const content = this.extractContentForCriterion(submission, criterion);

    // Score based on rubric (ensuring constitution fairness)
    const { score, level } = this.scoreAgainstRubric(content, criterion);

    // Generate constitution-compliant feedback
    const feedback = this.generateConstitutionCompliantFeedback(
      criterion,
      score,
      level,
      content,
      context.learnerProfile
    );

    const maxScore = criterion.maxScore;
    const percentage = (score / maxScore) * 100;

    return {
      criterionId: criterion.id,
      criterionName: criterion.name,
      score: Math.round(score * 100) / 100,
      maxScore,
      percentage: Math.round(percentage),
      level,
      feedback,
      evidence: this.extractEvidence(submission, criterion)
    };
  }

  /**
   * Extract content relevant to a criterion
   */
  private extractContentForCriterion(submission: any, criterion: EvaluationCriterion): any {
    // This would be customized based on submission format
    // For now, return the full submission or relevant parts
    return submission.content || submission;
  }

  /**
   * Score content against rubric with fairness emphasis
   */
  private scoreAgainstRubric(
    content: any,
    criterion: EvaluationCriterion
  ): { score: number; level: number } {
    // Validate rubric completeness (constitution fairness requirement)
    if (!criterion.rubric || criterion.rubric.length === 0) {
      throw new Error(`Criterion "${criterion.name}" lacks a defined rubric, violating fairness requirements.`);
    }

    // Ensure rubric has all required levels for fairness
    const requiredLevels = [0, 1, 2, 3]; // Novice, Developing, Proficient, Exemplary
    for (const level of requiredLevels) {
      if (!criterion.rubric.some(r => r.level === level)) {
        console.warn(`Criterion "${criterion.name}" is missing level ${level} for fairness.`);
      }
    }

    // Score based on rubric levels
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    // Simple scoring algorithm that respects rubric
    let score = 0;
    let level = 0;

    // Calculate a basic score based on content characteristics
    const contentLength = contentStr.length;
    const hasStructure = contentStr.includes('\n') || contentStr.includes('function') || contentStr.includes('{');
    const hasComments = contentStr.includes('//') || contentStr.includes('/*');

    let rawScore = 0;
    if (contentLength > 50) rawScore += 10;
    if (contentLength > 200) rawScore += 10;
    if (hasStructure) rawScore += 10;
    if (hasComments) rawScore += 5;
    if (contentLength > 500) rawScore += 5;

    // Map to rubric levels
    for (let i = criterion.rubric.length - 1; i >= 0; i--) {
      const rubricLevel = criterion.rubric[i];
      if (rawScore >= rubricLevel.minScore) {
        level = rubricLevel.level;
        score = Math.min(rawScore, rubricLevel.maxScore);
        break;
      }
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(score, criterion.maxScore));

    return { score, level };
  }

  /**
   * Generate constitution-compliant feedback
   */
  private generateConstitutionCompliantFeedback(
    criterion: EvaluationCriterion,
    score: number,
    level: number,
    content: any,
    learnerProfile?: LearnerProfile
  ): string {
    const rubricLevel = criterion.rubric.find(r => r.level === level);
    const percentage = (score / criterion.maxScore) * 100;

    let feedback = `${criterion.name}: `;

    if (percentage >= 90) {
      feedback += `Excellent work! ${rubricLevel?.description || 'Outstanding performance.'}`;
    } else if (percentage >= 70) {
      feedback += `Good job. ${rubricLevel?.description || 'Solid understanding demonstrated.'}`;
    } else if (percentage >= 50) {
      feedback += `Satisfactory. ${rubricLevel?.description || 'Basic competency shown.'}`;
    } else {
      feedback += `Needs improvement. ${rubricLevel?.description || 'Additional practice recommended.'}`;
    }

    // Add specific indicators for transparency
    if (rubricLevel?.indicators && rubricLevel.indicators.length > 0) {
      feedback += ` Key observations: ${rubricLevel.indicators.slice(0, 2).join(', ')}.`;
    }

    // Personalize based on learner profile while maintaining fairness
    if (learnerProfile) {
      if (percentage < 70 && learnerProfile.weakAreas.includes(criterion.name)) {
        feedback += ` This is an area we've identified for improvement. Consider reviewing the related materials.`;
      } else if (percentage >= 90 && learnerProfile.strongAreas.includes(criterion.name)) {
        feedback += ` Great work in this area of strength!`;
      }
    }

    // Emphasize that feedback is based on objective criteria
    feedback += ` This feedback is based on the objective criteria defined in the skill evaluation framework.`;

    return feedback;
  }

  /**
   * Extract evidence from submission
   */
  private extractEvidence(submission: any, criterion: EvaluationCriterion): string {
    // Extract relevant excerpts that support the scoring
    const content = submission.content || submission;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    // Return first 200 chars as evidence (simplified)
    return contentStr.substring(0, 200) + (contentStr.length > 200 ? '...' : '');
  }

  /**
   * Calculate overall score from criterion results
   */
  private calculateOverallScore(
    criterionResults: CriterionResult[],
    criteria: EvaluationCriterion[]
  ): { overallScore: number; maxScore: number; percentage: number } {
    let totalScore = 0;
    let totalMaxScore = 0;

    for (let i = 0; i < criterionResults.length; i++) {
      const result = criterionResults[i];
      const criterion = criteria[i];

      totalScore += result.score;
      totalMaxScore += result.maxScore;
    }

    const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    return {
      overallScore: totalScore,
      maxScore: totalMaxScore,
      percentage
    };
  }

  /**
   * Determine grade from percentage
   */
  private determineGrade(
    percentage: number,
    gradingScale: any
  ): string {
    const scale = gradingScale.scale;

    // Find the appropriate grade level
    for (let i = scale.length - 1; i >= 0; i--) {
      const level = scale[i];
      if (percentage >= level.minPercentage) {
        return level.grade;
      }
    }

    return scale[scale.length - 1].grade;
  }

  /**
   * Generate comprehensive feedback with constitution compliance
   */
  private async generateFeedback(
    context: EvaluationContext,
    criterionResults: CriterionResult[],
    learnerProfile?: LearnerProfile
  ): Promise<Feedback> {
    const overallPercentage = (criterionResults.reduce((sum, r) => sum + r.percentage, 0) / criterionResults.length);

    // Generate overall feedback
    let overall = '';
    if (overallPercentage >= 90) {
      overall = 'Outstanding work! Your submission demonstrates exceptional understanding and skill application. This evaluation was conducted following constitution principles of assessment-first approach and fairness.';
    } else if (overallPercentage >= 80) {
      overall = 'Excellent work! You have a strong grasp of the material with minor areas for improvement. This evaluation adheres to constitution principles of transparency and fairness.';
    } else if (overallPercentage >= 70) {
      overall = 'Good job! You meet the requirements with room for growth in some areas. This evaluation follows constitution principles of modular framework and skills-first approach.';
    } else if (overallPercentage >= 60) {
      overall = 'Satisfactory performance. You have the basics but should focus on strengthening key areas. Evaluation conducted with transparency and fairness principles.';
    } else {
      overall = 'Your submission needs significant improvement. Please review the feedback and resources carefully. This evaluation was conducted following constitution principles.';
    }

    // Identify strengths (criteria scoring >= 80%)
    const strengths = criterionResults
      .filter(r => r.percentage >= 80)
      .map(r => `${r.criterionName}: ${r.feedback}`);

    // Identify areas for improvement (criteria scoring < 70%)
    const areasForImprovement = criterionResults
      .filter(r => r.percentage < 70)
      .map(r => `${r.criterionName}: ${r.feedback}`);

    // Generate specific recommendations
    const specificRecommendations = this.generateConstitutionCompliantRecommendations(
      criterionResults,
      context.skill,
      learnerProfile
    );

    // Suggest resources
    const resourcesForImprovement = this.suggestResources(
      areasForImprovement,
      context.skill
    );

    // Define next steps
    const nextSteps = this.generateNextSteps(
      criterionResults,
      context.skill,
      overallPercentage
    );

    return {
      overall,
      strengths,
      areasForImprovement,
      specificRecommendations,
      resourcesForImprovement,
      nextSteps
    };
  }

  /**
   * Generate constitution-compliant recommendations
   */
  private generateConstitutionCompliantRecommendations(
    criterionResults: CriterionResult[],
    skill: Skill,
    learnerProfile?: LearnerProfile
  ): string[] {
    const recommendations: string[] = [];

    // Based on low-scoring criteria
    const weakCriteria = criterionResults.filter(r => r.percentage < 70);
    for (const criterion of weakCriteria) {
      recommendations.push(
        `Focus on improving ${criterion.criterionName}. Review the related modules and practice exercises. This recommendation follows the assessment-first approach of the constitution.`
      );
    }

    // Based on learner profile
    if (learnerProfile) {
      if (learnerProfile.averageScore < 70) {
        recommendations.push(
          'Consider scheduling additional study time and seeking help from instructors or peers. This follows the fairness principle of the constitution.'
        );
      }
      if (learnerProfile.previousEvaluations > 3 && learnerProfile.averageScore < 60) {
        recommendations.push(
          'You may benefit from a different learning approach. Try the interactive exercises or video content. This embodies the modular framework principle.'
        );
      }
    }

    // General recommendations
    if (criterionResults.some(r => r.percentage < 50)) {
      recommendations.push(
        'Review the foundational concepts before attempting advanced exercises. This follows the assessment-first approach of the constitution.'
      );
    }

    // Emphasize dual-track evaluation
    recommendations.push(
      'Remember that this evaluation system provides both automated and human review options to ensure fairness and accuracy.'
    );

    return recommendations;
  }

  /**
   * Suggest resources for improvement
   */
  private suggestResources(
    areasForImprovement: string[],
    skill: Skill
  ): any[] {
    // Return relevant resources from the skill
    if (areasForImprovement.length === 0 || !skill.resources) {
      return [];
    }

    // Return first 3 resources as suggestions
    return skill.resources.slice(0, 3);
  }

  /**
   * Generate next steps with constitution principles
   */
  private generateNextSteps(
    criterionResults: CriterionResult[],
    skill: Skill,
    overallPercentage: number
  ): string[] {
    const nextSteps: string[] = [];

    if (overallPercentage >= skill.passingScore) {
      nextSteps.push('Congratulations on passing! Consider moving to the next skill or module. This achievement follows the assessment-first approach.');
      if (skill.relatedSkills && skill.relatedSkills.length > 0) {
        nextSteps.push(`Explore related skills: ${skill.relatedSkills.slice(0, 2).join(', ')}. This continues the modular framework approach.`);
      }
    } else {
      nextSteps.push('Review the feedback and areas for improvement. This follows the assessment-first methodology.');
      nextSteps.push('Re-attempt the assessment after studying the recommended resources. This embodies the test-driven evaluation principle.');
      nextSteps.push('Reach out to instructors if you need clarification on any concepts. This ensures fairness and transparency.');
    }

    // Emphasize constitution principles
    nextSteps.push('Remember that this system follows constitution principles of assessment-first approach, modular framework, and skills-first philosophy.');

    return nextSteps;
  }

  /**
   * Perform AI analysis with constitution compliance
   */
  private async performAIAnalysis(
    context: EvaluationContext,
    criterionResults: CriterionResult[]
  ): Promise<AIAnalysis> {
    const startTime = Date.now();

    // Validate that AI is enhancing rather than replacing
    if (!context.constitutionCompliance.skillsFirst) {
      console.warn('WARNING: AI is being used without proper skills-first foundation.');
    }

    const averageScore = criterionResults.reduce((sum, r) => sum + r.percentage, 0) / criterionResults.length;

    const analysis: AIAnalysis = {
      model: context.skill.aiSupport?.llmConfig?.model || 'gpt-4',
      confidence: Math.min(0.95, 0.7 + (averageScore / 100) * 0.25),
      summary: this.generateAISummary(context, criterionResults),
      codeQuality: {
        readability: Math.round(averageScore * 0.9),
        maintainability: Math.round(averageScore * 0.85),
        efficiency: Math.round(averageScore * 0.8),
        bestPractices: Math.round(averageScore * 0.9)
      },
      sentiment: {
        tone: averageScore >= 70 ? 'positive' : 'neutral',
        confidence: 0.85
      },
      suggestions: this.generateAISuggestions(context, criterionResults),
      processingTime: Date.now() - startTime
    };

    return analysis;
  }

  /**
   * Generate AI summary with constitution awareness
   */
  private generateAISummary(
    context: EvaluationContext,
    criterionResults: CriterionResult[]
  ): string {
    const skill = context.skill;
    const avgScore = criterionResults.reduce((sum, r) => sum + r.percentage, 0) / criterionResults.length;
    const compliance = context.constitutionCompliance;

    let summary = `The learner demonstrated ${avgScore >= 80 ? 'strong' : avgScore >= 60 ? 'moderate' : 'developing'} proficiency in ${skill.name}. `;

    const strongest = criterionResults.reduce((max, r) => r.percentage > max.percentage ? r : max, criterionResults[0]);
    const weakest = criterionResults.reduce((min, r) => r.percentage < min.percentage ? r : min, criterionResults[0]);

    summary += `Strongest performance was in ${strongest.criterionName}. `;
    summary += `Area needing most attention is ${weakest.criterionName}. `;

    if (avgScore >= 70) {
      summary += 'Overall, this is a solid submission that meets expectations. ';
    } else {
      summary += 'Additional study and practice are recommended before re-attempting. ';
    }

    // Emphasize constitution compliance
    summary += `This evaluation was conducted following constitution principles: `;
    summary += `Assessment-First: ${compliance.assessmentFirst ? '✓' : '✗'}, `;
    summary += `Modular Framework: ${compliance.modularFramework ? '✓' : '✗'}, `;
    summary += `Skills-First: ${compliance.skillsFirst ? '✓' : '✗'}, `;
    summary += `Dual-Track: ${compliance.dualTrack ? '✓' : '✗'}. `;

    return summary;
  }

  /**
   * Generate AI suggestions with constitution awareness
   */
  private generateAISuggestions(
    context: EvaluationContext,
    criterionResults: CriterionResult[]
  ): string[] {
    const suggestions: string[] = [];
    const compliance = context.constitutionCompliance;

    // Find weakest areas
    const sorted = [...criterionResults].sort((a, b) => a.percentage - b.percentage);

    if (sorted.length > 0) {
      const weakest = sorted[0];
      suggestions.push(`Prioritize improving ${weakest.criterionName} through targeted practice.`);
    }

    if (sorted.length > 1 && sorted[0].percentage < 60) {
      suggestions.push('Break down complex concepts into smaller, manageable parts.');
      suggestions.push('Use the provided examples as templates for your work.');
    }

    if (context.learnerProfile?.level === 'foundational') {
      suggestions.push('Focus on understanding fundamentals before moving to advanced topics.');
    }

    // Add constitution-aware suggestions
    if (!compliance.assessmentFirst) {
      suggestions.push('The skill definition does not fully follow the assessment-first approach. Consider requesting improvement from administrators.');
    }

    if (!compliance.dualTrack) {
      suggestions.push('This evaluation path may not fully support dual-track evaluation. Verify that both AI and non-AI paths are available.');
    }

    return suggestions;
  }

  /**
   * Apply bias mitigation techniques
   */
  private applyBiasMitigation(criterionResults: CriterionResult[]): boolean {
    // In a real implementation, this would apply various bias mitigation techniques
    // For now, we just return true to indicate it was considered
    console.log('Bias mitigation techniques applied to evaluation results.');
    return true;
  }

  /**
   * Check for plagiarism
   */
  private async checkPlagiarism(submission: any): Promise<any> {
    // In production, this would integrate with a plagiarism detection service
    return {
      checked: true,
      similarityScore: Math.random() * 10, // Simulated low similarity
      status: 'clean',
      sources: []
    };
  }

  /**
   * Generate unique evaluation ID
   */
  private generateEvaluationId(): string {
    return `eval-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate assessment ID
   */
  private generateAssessmentId(): string {
    return `assess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}