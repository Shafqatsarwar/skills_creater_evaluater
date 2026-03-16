/**
 * Result Processor
 *
 * Component responsible for processing, storing, and analyzing
 * assessment results, as well as generating reports.
 */

import { EvaluationResult } from '../engine/assessment-engine';

export interface UserProgress {
  userId: string;
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  skills: SkillSummary[];
  lastActivity: Date;
}

export interface SkillSummary {
  skillName: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  assessmentCount: number;
  averageScore: number;
  lastAssessed: Date;
}

export interface AssessmentAnalytics {
  assessmentId: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  difficultyDistribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  completionRate: number;
}

export interface ReportData {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  reportType: 'individual' | 'group' | 'summary';
  generatedBy: string;
}

export class ResultProcessor {
  private results: EvaluationResult[] = [];
  private reports: ReportData[] = [];

  /**
   * Processes an evaluation result
   */
  public async processResult(result: EvaluationResult): Promise<void> {
    // Store the result
    this.results.push(result);

    // Generate any necessary reports or analytics
    await this.generateReportsForResult(result);

    console.log(`Processed result for user ${result.userId} on assessment ${result.assessmentId}`);
  }

  /**
   * Gets user progress by user ID
   */
  public async getUserProgress(userId: string): Promise<UserProgress | null> {
    const userResults = this.results.filter(r => r.userId === userId);

    if (userResults.length === 0) {
      return null;
    }

    // Calculate basic metrics
    const totalAssessments = userResults.length;
    const completedAssessments = userResults.filter(r => r.timestamp).length;
    const averageScore = userResults.reduce((sum, r) => sum + r.percentage, 0) / totalAssessments;

    // Calculate skill summaries
    const skills = await this.calculateSkillSummaries(userId);

    const progress: UserProgress = {
      userId,
      totalAssessments,
      completedAssessments,
      averageScore,
      skills,
      lastActivity: new Date(Math.max(...userResults.map(r => r.timestamp.getTime())))
    };

    return progress;
  }

  /**
   * Gets analytics for a specific assessment
   */
  public async getAssessmentAnalytics(assessmentId: string): Promise<AssessmentAnalytics | null> {
    const assessmentResults = this.results.filter(r => r.assessmentId === assessmentId);

    if (assessmentResults.length === 0) {
      return null;
    }

    const totalAttempts = assessmentResults.length;
    const averageScore = assessmentResults.reduce((sum, r) => sum + r.percentage, 0) / totalAttempts;
    const passRate = (assessmentResults.filter(r => r.passed).length / totalAttempts) * 100;
    const completionRate = 100; // Assuming all results are completed assessments

    // This would be more complex in a real system
    const difficultyDistribution = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };

    // For now, we'll assume equal distribution
    const perGroup = Math.floor(totalAttempts / 3);
    difficultyDistribution.beginner = perGroup;
    difficultyDistribution.intermediate = perGroup;
    difficultyDistribution.advanced = totalAttempts - (perGroup * 2);

    const analytics: AssessmentAnalytics = {
      assessmentId,
      totalAttempts,
      averageScore,
      passRate,
      difficultyDistribution,
      completionRate
    };

    return analytics;
  }

  /**
   * Generates a report for a specific user
   */
  public async generateIndividualReport(userId: string, title: string): Promise<ReportData> {
    const userProgress = await this.getUserProgress(userId);

    if (!userProgress) {
      throw new Error(`No progress data found for user: ${userId}`);
    }

    const content = this.formatIndividualReport(userProgress);

    const report: ReportData = {
      id: this.generateId(),
      userId,
      title,
      content,
      createdAt: new Date(),
      reportType: 'individual',
      generatedBy: 'System'
    };

    this.reports.push(report);
    return report;
  }

  /**
   * Generates a group summary report
   */
  public async generateGroupReport(userIds: string[], title: string): Promise<ReportData> {
    const userProgressList = await Promise.all(
      userIds.map(async userId => await this.getUserProgress(userId))
    );

    const validProgress = userProgressList.filter(progress => progress !== null) as UserProgress[];

    if (validProgress.length === 0) {
      throw new Error('No valid user progress data found for the specified users');
    }

    const content = this.formatGroupReport(validProgress);

    const report: ReportData = {
      id: this.generateId(),
      userId: 'group-report',
      title,
      content,
      createdAt: new Date(),
      reportType: 'group',
      generatedBy: 'System'
    };

    this.reports.push(report);
    return report;
  }

  /**
   * Gets all reports for a user
   */
  public async getUserReports(userId: string): Promise<ReportData[]> {
    return this.reports.filter(r => r.userId === userId);
  }

  /**
   * Gets all results for a user
   */
  public async getUserResults(userId: string): Promise<EvaluationResult[]> {
    return this.results.filter(r => r.userId === userId);
  }

  /**
   * Gets all results for an assessment
   */
  public async getAssessmentResults(assessmentId: string): Promise<EvaluationResult[]> {
    return this.results.filter(r => r.assessmentId === assessmentId);
  }

  /**
   * Generates reports based on a single result
   */
  private async generateReportsForResult(result: EvaluationResult): Promise<void> {
    // In a real system, we might trigger report generation based on certain conditions
    // For example, if it's a milestone assessment or if the user reached a certain threshold

    // For now, we'll just log that a result was processed
    console.log(`Generated analytics for assessment result: ${result.id}`);
  }

  /**
   * Calculates skill summaries for a user
   */
  private async calculateSkillSummaries(userId: string): Promise<SkillSummary[]> {
    // In a real system, we would map assessment IDs to skill areas
    // For now, we'll create mock skill summaries based on assessment types

    const userResults = this.results.filter(r => r.userId === userId);

    // Group results by a pseudo-skill (in reality, assessments would be tagged with skills)
    const skillGroups: { [key: string]: EvaluationResult[] } = {};

    for (const result of userResults) {
      // Mock skill classification based on assessment titles
      let skillName = 'General';
      if (result.assessmentId.includes('js')) {
        skillName = 'JavaScript';
      } else if (result.assessmentId.includes('python')) {
        skillName = 'Python';
      } else if (result.assessmentId.includes('web')) {
        skillName = 'Web Development';
      }

      if (!skillGroups[skillName]) {
        skillGroups[skillName] = [];
      }
      skillGroups[skillName].push(result);
    }

    const skillSummaries: SkillSummary[] = [];

    for (const [skillName, results] of Object.entries(skillGroups)) {
      const averageScore = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
      let proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

      if (averageScore >= 80) {
        proficiencyLevel = 'advanced';
      } else if (averageScore >= 65) {
        proficiencyLevel = 'intermediate';
      }

      skillSummaries.push({
        skillName,
        proficiencyLevel,
        assessmentCount: results.length,
        averageScore,
        lastAssessed: new Date(Math.max(...results.map(r => r.timestamp.getTime())))
      });
    }

    return skillSummaries;
  }

  /**
   * Formats an individual report
   */
  private formatIndividualReport(progress: UserProgress): string {
    let report = `# Individual Progress Report\n\n`;
    report += `**User ID**: ${progress.userId}\n`;
    report += `**Generated**: ${new Date().toISOString()}\n\n`;

    report += `## Overall Statistics\n`;
    report += `- Total Assessments: ${progress.totalAssessments}\n`;
    report += `- Completed Assessments: ${progress.completedAssessments}\n`;
    report += `- Average Score: ${progress.averageScore.toFixed(2)}%\n\n`;

    report += `## Skills Summary\n`;
    if (progress.skills.length > 0) {
      for (const skill of progress.skills) {
        report += `- **${skill.skillName}**: ${skill.proficiencyLevel} (Avg: ${skill.averageScore.toFixed(2)}%, ${skill.assessmentCount} assessments)\n`;
      }
    } else {
      report += `No skill assessments completed yet.\n`;
    }

    report += `\n## Recommendations\n`;
    if (progress.averageScore < 70) {
      report += `- Focus on foundational concepts in weaker skill areas\n`;
      report += `- Consider retaking assessments with lower scores\n`;
    } else {
      report += `- Continue building on strong foundations\n`;
      report += `- Explore more advanced assessments in your strongest skill areas\n`;
    }

    return report;
  }

  /**
   * Formats a group report
   */
  private formatGroupReport(progressList: UserProgress[]): string {
    let report = `# Group Progress Report\n\n`;
    report += `**Generated**: ${new Date().toISOString()}\n`;
    report += `**Number of Users**: ${progressList.length}\n\n`;

    // Calculate group statistics
    const avgTotalAssessments = progressList.reduce((sum, p) => sum + p.totalAssessments, 0) / progressList.length;
    const avgCompletedAssessments = progressList.reduce((sum, p) => sum + p.completedAssessments, 0) / progressList.length;
    const avgScore = progressList.reduce((sum, p) => sum + p.averageScore, 0) / progressList.length;

    report += `## Group Statistics\n`;
    report += `- Average Total Assessments: ${avgTotalAssessments.toFixed(2)}\n`;
    report += `- Average Completed Assessments: ${avgCompletedAssessments.toFixed(2)}\n`;
    report += `- Average Score: ${avgScore.toFixed(2)}%\n\n`;

    report += `## Skill Distribution\n`;
    const allSkills: { [key: string]: { count: number; avgScore: number; users: number } } = {};

    for (const progress of progressList) {
      for (const skill of progress.skills) {
        if (!allSkills[skill.skillName]) {
          allSkills[skill.skillName] = { count: 0, avgScore: 0, users: 0 };
        }

        allSkills[skill.skillName].count += skill.assessmentCount;
        allSkills[skill.skillName].avgScore += skill.averageScore;
        allSkills[skill.skillName].users++;
      }
    }

    for (const [skillName, stats] of Object.entries(allSkills)) {
      report += `- **${skillName}**: ${stats.users} users, avg. ${stats.avgScore.toFixed(2)}%\n`;
    }

    report += `\n## Recommendations\n`;
    if (avgScore < 70) {
      report += `- Group would benefit from foundational training\n`;
      report += `- Consider organizing study groups for weaker skill areas\n`;
    } else {
      report += `- Strong overall performance\n`;
      report += `- Consider advanced workshops for continued growth\n`;
    }

    return report;
  }

  /**
   * Generates a unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}