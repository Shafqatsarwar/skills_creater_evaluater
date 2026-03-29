/**
 * Skill Creator CLI
 * Interactive command-line tool for creating modern AI-era skills
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

import {
  Skill,
  SkillCategory,
  SkillLevel,
  EvaluationCriterion,
  RubricLevel,
  LearningObjective,
  AssessmentType,
  SkillModule,
  Resource,
  Project,
  AISupportConfig
} from '../types/skill-types';

export interface SkillCreatorOptions {
  outputDir: string;
  interactive: boolean;
  template?: string;
}

export class SkillCreator {
  private options: SkillCreatorOptions;
  private rl: readline.Interface;

  constructor(options?: Partial<SkillCreatorOptions>) {
    this.options = {
      outputDir: './skills',
      interactive: true,
      ...options
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Ensure output directory exists
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
    }
  }

  /**
   * Main method to create a skill interactively
   */
  async createSkillInteractively(): Promise<Skill> {
    console.log('\n🎯 Modern AI-Era Skill Creator\n');
    console.log('Answer the following questions to create your skill:\n');

    // Basic Information
    const basicInfo = await this.collectBasicInfo();

    // Learning Objectives
    const learningObjectives = await this.collectLearningObjectives();

    // Evaluation Criteria
    const evaluationCriteria = await this.collectEvaluationCriteria();

    // Assessment Types
    const assessmentTypes = await this.collectAssessmentTypes();

    // Modules
    const modules = await this.collectModules();

    // AI Support Configuration
    const aiSupport = await this.collectAISupport();

    // Build the skill
    const skill: Skill = this.buildSkill(basicInfo, {
      learningObjectives,
      evaluationCriteria,
      assessmentTypes,
      modules,
      aiSupport
    });

    // Save the skill
    await this.saveSkill(skill);

    console.log('\n✅ Skill created successfully!');
    console.log(`📁 Saved to: ${this.options.outputDir}/${skill.slug}.json`);
    console.log(`📝 Skill ID: ${skill.id}`);
    console.log(`🏷️  Slug: ${skill.slug}\n`);

    return skill;
  }

  /**
   * Collect basic skill information
   */
  private async collectBasicInfo(): Promise<any> {
    console.log('📋 Basic Information\n');

    const name = await this.question('Skill Name (e.g., "Advanced React Patterns"): ');
    const description = await this.question('Short Description (1-2 sentences): ');
    const longDescription = await this.question('Long Description (detailed overview): ');

    // Category
    console.log('\nAvailable Categories:');
    const categories: SkillCategory[] = [
      'ai-ml', 'web-development', 'mobile-development', 'data-science',
      'devops', 'cloud-computing', 'cybersecurity', 'blockchain',
      'prompt-engineering', 'ai-integration', 'soft-skills', 'design', 'business'
    ];
    categories.forEach((cat, i) => console.log(`  ${i + 1}. ${cat}`));
    const catIndex = parseInt(await this.question('\nSelect Category (number): ')) - 1;
    const category = categories[catIndex] || 'web-development';

    // Level
    console.log('\nDifficulty Level:');
    const levels: SkillLevel[] = ['foundational', 'intermediate', 'advanced', 'expert'];
    levels.forEach((level, i) => console.log(`  ${i + 1}. ${level}`));
    const levelIndex = parseInt(await this.question('Select Level (number): ')) - 1;
    const level = levels[levelIndex] || 'intermediate';

    const estimatedHours = parseFloat(await this.question('Estimated Hours to Complete: ') || '10');
    const tags = await this.question('Tags (comma-separated, e.g., "react,javascript,frontend"): ');

    return {
      name,
      description,
      longDescription,
      category,
      level,
      estimatedHours,
      tags: tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
    };
  }

  /**
   * Collect learning objectives
   */
  private async collectLearningObjectives(): Promise<LearningObjective[]> {
    console.log('\n🎯 Learning Objectives\n');
    console.log('Define what learners will be able to do after completing this skill.\n');

    const objectives: LearningObjective[] = [];
    const bloomLevels: Array<'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'> = [
      'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'
    ];

    const count = parseInt(await this.question('How many learning objectives? (3-6 recommended): ') || '4');

    for (let i = 0; i < count; i++) {
      console.log(`\nObjective ${i + 1}:`);
      const description = await this.question('  Description (start with action verb): ');

      console.log('  Bloom\'s Taxonomy Level:');
      bloomLevels.forEach((lvl, idx) => console.log(`    ${idx + 1}. ${lvl}`));
      const bloomIndex = parseInt(await this.question('  Select Level (number): ') || '3') - 1;

      objectives.push({
        id: `lo-${String(i + 1).padStart(3, '0')}`,
        description,
        bloomLevel: bloomLevels[bloomIndex] || 'apply',
        measurable: true,
        assessmentMethods: ['practical-coding', 'quiz']
      });
    }

    return objectives;
  }

  /**
   * Collect evaluation criteria
   */
  private async collectEvaluationCriteria(): Promise<EvaluationCriterion[]> {
    console.log('\n📊 Evaluation Criteria\n');
    console.log('Define how learner work will be evaluated.\n');

    const criteria: EvaluationCriterion[] = [];
    const categories: Array<'technical' | 'conceptual' | 'practical' | 'creative' | 'analytical'> = [
      'technical', 'conceptual', 'practical', 'creative', 'analytical'
    ];

    const count = parseInt(await this.question('How many evaluation criteria? (3-5 recommended): ') || '4');

    for (let i = 0; i < count; i++) {
      console.log(`\nCriterion ${i + 1}:`);
      const name = await this.question('  Name (e.g., "Code Quality", "Functionality"): ');
      const description = await this.question('  Description: ');

      console.log('  Category:');
      categories.forEach((cat, idx) => console.log(`    ${idx + 1}. ${cat}`));
      const catIndex = parseInt(await this.question('  Select Category (number): ') || '1') - 1;

      const maxScore = parseInt(await this.question('  Maximum Score (e.g., 25): ') || '25');
      const weight = parseFloat(await this.question('  Weight (0-1, e.g., 0.25): ') || '0.25');

      // Create rubric levels
      const rubric = this.createRubric(name, maxScore);

      criteria.push({
        id: `ec-${String(i + 1).padStart(3, '0')}`,
        name,
        description,
        category: categories[catIndex] || 'technical',
        weight,
        maxScore,
        rubric,
        aiPromptTemplate: `Evaluate ${name.toLowerCase()}: "{submission}". Score 0-${maxScore}.`,
        autoGradingEnabled: true,
        requiresHumanReview: false
      });
    }

    return criteria;
  }

  /**
   * Create rubric levels for a criterion
   */
  private createRubric(criterionName: string, maxScore: number): RubricLevel[] {
    const levels = [
      { label: 'Novice', description: `Basic understanding of ${criterionName.toLowerCase()}`, percentage: 0.4 },
      { label: 'Developing', description: `Developing proficiency in ${criterionName.toLowerCase()}`, percentage: 0.6 },
      { label: 'Proficient', description: `Solid command of ${criterionName.toLowerCase()}`, percentage: 0.8 },
      { label: 'Exemplary', description: `Exceptional mastery of ${criterionName.toLowerCase()}`, percentage: 1.0 }
    ];

    return levels.map((lvl, idx) => ({
      level: idx,
      label: lvl.label,
      description: lvl.description,
      minScore: idx === 0 ? 0 : Math.round(maxScore * levels[idx - 1].percentage) + 1,
      maxScore: Math.round(maxScore * lvl.percentage),
      indicators: [
        `Demonstrates ${lvl.label.toLowerCase()} level ${criterionName.toLowerCase()}`,
        `Meets ${lvl.label.toLowerCase()} expectations`,
        `Shows ${lvl.label.toLowerCase()} understanding`
      ]
    }));
  }

  /**
   * Collect assessment types
   */
  private async collectAssessmentTypes(): Promise<AssessmentType[]> {
    console.log('\n📝 Assessment Types\n');

    const types: AssessmentType[] = [
      'practical-coding', 'project-based', 'ai-assisted', 'peer-review',
      'portfolio-review', 'simulation', 'case-study', 'multiple-choice'
    ];

    console.log('Select assessment types (comma-separated numbers):');
    types.forEach((type, i) => console.log(`  ${i + 1}. ${type}`));

    const selection = await this.question('Your selection: ') || '1,2,3';
    const indices = selection.split(',').map((s: string) => parseInt(s.trim()) - 1);

    return indices
      .filter((i: number) => i >= 0 && i < types.length)
      .map((i: number) => types[i]);
  }

  /**
   * Collect modules
   */
  private async collectModules(): Promise<SkillModule[]> {
    console.log('\n📚 Learning Modules\n');

    const modules: SkillModule[] = [];
    const count = parseInt(await this.question('How many modules? (2-5 recommended): ') || '3');

    for (let i = 0; i < count; i++) {
      console.log(`\nModule ${i + 1}:`);
      const title = await this.question('  Title: ');
      const description = await this.question('  Description: ');
      const hours = parseFloat(await this.question('  Estimated Hours: ') || '2');

      const lessonCount = parseInt(await this.question('  Number of lessons: ') || '3');
      const lessons = await this.collectLessons(lessonCount);

      modules.push({
        id: `mod-${String(i + 1).padStart(3, '0')}`,
        title,
        description,
        order: i + 1,
        lessons,
        assessments: [],
        estimatedHours: hours,
        learningOutcomes: [`Complete ${title.toLowerCase()}`]
      });
    }

    return modules;
  }

  /**
   * Collect lessons for a module
   */
  private async collectLessons(count: number): Promise<any[]> {
    const lessons: any[] = [];
    const types = ['video', 'text', 'interactive', 'quiz', 'lab', 'project'];

    for (let i = 0; i < count; i++) {
      console.log(`\n  Lesson ${i + 1}:`);
      const title = await this.question('    Title: ');

      console.log('    Type:');
      types.forEach((type, idx) => console.log(`      ${idx + 1}. ${type}`));
      const typeIndex = parseInt(await this.question('    Select Type (number): ') || '2') - 1;

      const duration = parseInt(await this.question('    Duration (minutes): ') || '15');

      lessons.push({
        id: `lesson-${String(lessons.length + 1).padStart(3, '0')}`,
        title,
        type: types[typeIndex] || 'text',
        content: { text: `Content for ${title}` },
        duration,
        resources: []
      });
    }

    return lessons;
  }

  /**
   * Collect AI support configuration
   */
  private async collectAISupport(): Promise<AISupportConfig> {
    console.log('\n🤖 AI Support Configuration\n');

    const enabled = (await this.question('Enable AI-assisted evaluation? (y/n): ') || 'y').toLowerCase() === 'y';

    if (!enabled) {
      return {
        enabled: false,
        features: {
          personalizedFeedback: false,
          adaptiveLearning: false,
          automatedHints: false,
          progressPrediction: false,
          weaknessDetection: false,
          contentGeneration: false
        },
        evaluationPrompts: {
          codeReview: '',
          feedbackGeneration: '',
          hintGeneration: '',
          rubricScoring: ''
        }
      };
    }

    console.log('\nSelect AI features (comma-separated, or press Enter for all):');
    console.log('  1. Personalized Feedback');
    console.log('  2. Adaptive Learning');
    console.log('  3. Automated Hints');
    console.log('  4. Progress Prediction');
    console.log('  5. Weakness Detection');
    console.log('  6. Content Generation');

    const featureSelection = await this.question('Your selection: ') || '1,2,3,4,5,6';
    const featureIndices = featureSelection.split(',').map((s: string) => parseInt(s.trim()) - 1);

    const features = {
      personalizedFeedback: featureIndices.includes(0),
      adaptiveLearning: featureIndices.includes(1),
      automatedHints: featureIndices.includes(2),
      progressPrediction: featureIndices.includes(3),
      weaknessDetection: featureIndices.includes(4),
      contentGeneration: featureIndices.includes(5)
    };

    console.log('\nLLM Provider:');
    const providers = ['openai', 'anthropic', 'google', 'azure', 'local'];
    providers.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
    const providerIndex = parseInt(await this.question('Select Provider (number): ') || '1') - 1;

    const model = await this.question('Model (e.g., gpt-4): ') || 'gpt-4';

    return {
      enabled: true,
      features,
      llmConfig: {
        provider: providers[providerIndex] || 'openai',
        model,
        temperature: 0.7,
        maxTokens: 2048,
        systemPrompt: 'You are an expert evaluator. Provide constructive, specific feedback.'
      },
      evaluationPrompts: {
        codeReview: 'Review this code for quality, correctness, and best practices.',
        feedbackGeneration: 'Generate personalized feedback based on the evaluation results.',
        hintGeneration: 'Provide a helpful hint without giving away the answer.',
        rubricScoring: 'Score this submission against the provided rubric criteria.'
      }
    };
  }

  /**
   * Build the skill object
   */
  private buildSkill(basicInfo: any, components: any): Skill {
    const slug = basicInfo.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const now = new Date().toISOString();

    return {
      id: `${slug}-${Date.now()}`,
      name: basicInfo.name,
      slug,
      version: '1.0.0',
      description: basicInfo.description,
      longDescription: basicInfo.longDescription,
      category: basicInfo.category,
      level: basicInfo.level,
      learningObjectives: components.learningObjectives,
      prerequisites: [],
      relatedSkills: [],
      evaluationCriteria: components.evaluationCriteria,
      assessmentTypes: components.assessmentTypes,
      passingScore: 70,
      gradingScale: {
        type: 'letter',
        scale: [
          { grade: 'A', minPercentage: 90, description: 'Excellent', gpa: 4.0 },
          { grade: 'B', minPercentage: 80, description: 'Good', gpa: 3.0 },
          { grade: 'C', minPercentage: 70, description: 'Satisfactory', gpa: 2.0 },
          { grade: 'D', minPercentage: 60, description: 'Needs Improvement', gpa: 1.0 },
          { grade: 'F', minPercentage: 0, description: 'Fail', gpa: 0.0 }
        ]
      },
      modules: components.modules,
      resources: [],
      projects: [],
      aiSupport: components.aiSupport,
      author: {
        name: 'Skill Creator',
        email: 'creator@example.com',
        organization: 'Modern Skills Initiative'
      },
      tags: basicInfo.tags,
      estimatedHours: basicInfo.estimatedHours,
      credits: Math.ceil(basicInfo.estimatedHours / 10),
      status: 'draft',
      visibility: 'private',
      license: 'CC-BY-4.0',
      createdAt: now,
      updatedAt: now,
      publishedAt: undefined,
      statistics: undefined
    };
  }

  /**
   * Save skill to file
   */
  private async saveSkill(skill: Skill): Promise<void> {
    const filePath = path.join(this.options.outputDir, `${skill.slug}.json`);
    const jsonContent = JSON.stringify(skill, null, 2);

    fs.writeFileSync(filePath, jsonContent, 'utf8');
  }

  /**
   * Helper method to ask questions
   */
  private question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Close the readline interface
   */
  close(): void {
    this.rl.close();
  }

  /**
   * Create skill from template
   */
  async createFromTemplate(templateName: string, outputName?: string): Promise<Skill> {
    const templatePath = path.join(__dirname, '../../skills-templates', `${templateName}.json`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const skill: Skill = JSON.parse(templateContent);

    // Customize if outputName provided
    if (outputName) {
      skill.name = outputName;
      skill.slug = outputName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      skill.id = `${skill.slug}-${Date.now()}`;
    }

    // Save to output directory
    await this.saveSkill(skill);

    console.log(`\n✅ Skill created from template: ${templateName}`);
    console.log(`📁 Saved to: ${this.options.outputDir}/${skill.slug}.json\n`);

    return skill;
  }

  /**
   * Validate a skill definition
   */
  validateSkill(skill: Skill): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!skill.id) errors.push('Missing required field: id');
    if (!skill.name) errors.push('Missing required field: name');
    if (!skill.slug) errors.push('Missing required field: slug');
    if (!skill.version) errors.push('Missing required field: version');
    if (!skill.description) errors.push('Missing required field: description');
    if (!skill.category) errors.push('Missing required field: category');
    if (!skill.level) errors.push('Missing required field: level');

    // Learning objectives
    if (!skill.learningObjectives || skill.learningObjectives.length === 0) {
      errors.push('At least one learning objective is required');
    }

    // Evaluation criteria
    if (!skill.evaluationCriteria || skill.evaluationCriteria.length === 0) {
      errors.push('At least one evaluation criterion is required');
    } else {
      // Check weights sum to approximately 1
      const totalWeight = skill.evaluationCriteria.reduce((sum, c) => sum + c.weight, 0);
      if (Math.abs(totalWeight - 1) > 0.1) {
        warnings.push(`Evaluation criteria weights sum to ${totalWeight}, should be close to 1`);
      }
    }

    // Modules
    if (!skill.modules || skill.modules.length === 0) {
      warnings.push('No modules defined. Consider adding learning modules.');
    }

    // Tags
    if (!skill.tags || skill.tags.length < 3) {
      warnings.push('At least 3 tags are recommended for better discoverability');
    }

    // AI Support
    if (skill.aiSupport?.enabled && !skill.aiSupport.evaluationPrompts) {
      warnings.push('AI support enabled but no evaluation prompts defined');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// CLI entry point
if (require.main === module) {
  const creator = new SkillCreator();

  creator.createSkillInteractively()
    .then(() => {
      creator.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error creating skill:', error);
      creator.close();
      process.exit(1);
    });
}
