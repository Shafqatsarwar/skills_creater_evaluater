/**
 * Enhanced Skill Creator CLI
 * Advanced command-line tool for creating constitution-compliant modern AI-era skills
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

import {
  Skill,
  SkillCategory,
  SkillLevel,
  EvaluationCriterion,
  EvaluationCriterionCategory,
  RubricLevel,
  LearningObjective,
  AssessmentType,
  SkillModule,
  Resource,
  Project,
  AISupportConfig
} from '../types/skill-types';

export interface EnhancedSkillCreatorOptions {
  outputDir: string;
  interactive: boolean;
  template?: string;
  constitutionCompliance: boolean;
}

export interface ConstitutionCompliance {
  assessmentFirst: boolean;
  modularFramework: boolean;
  testDriven: boolean;
  skillsFirst: boolean;
  dualTrack: boolean;
  transparency: boolean;
  fairness: boolean;
}

export class EnhancedSkillCreator {
  private options: EnhancedSkillCreatorOptions;
  private rl: readline.Interface;

  constructor(options?: Partial<EnhancedSkillCreatorOptions>) {
    this.options = {
      outputDir: './skills',
      interactive: true,
      constitutionCompliance: true,
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
   * Main method to create a constitution-compliant skill interactively
   */
  async createConstitutionCompliantSkill(): Promise<Skill> {
    console.log('\n🏛️  Modern AI-Era Skill Creator - Constitution Compliant\n');
    console.log('Creating a skill that adheres to all constitution principles...\n');

    // Explain constitution principles
    this.explainConstitutionPrinciples();

    // Basic Information
    const basicInfo = await this.collectBasicInfo();

    // Learning Objectives (Assessment-First Approach)
    console.log('\n🎯 Learning Objectives - Part of Assessment-First Approach\n');
    const learningObjectives = await this.collectLearningObjectives();

    // Evaluation Criteria (Core Assessment-First Requirement)
    console.log('\n📊 Evaluation Criteria - Core Assessment-First Requirement\n');
    const evaluationCriteria = await this.collectEvaluationCriteria();

    // Assessment Types (Test-Driven Evaluation)
    console.log('\n📝 Assessment Types - Supporting Test-Driven Approach\n');
    const assessmentTypes = await this.collectAssessmentTypes();

    // Modules (Modular Framework)
    console.log('\n📚 Modules - Implementing Modular Framework\n');
    const modules = await this.collectModules();

    // Resources (Supporting transparency)
    console.log('\n🔗 Resources - Supporting Transparency\n');
    const resources = await this.collectResources();

    // Projects (Practical application)
    console.log('\n🏗️  Projects - Practical Application\n');
    const projects = await this.collectProjects();

    // AI Support Configuration (Skills-First with AI as enhancement)
    console.log('\n🤖 AI Support - AI as Enhancement, Not Core\n');
    const aiSupport = await this.collectAISupport();

    // Build the constitution-compliant skill
    const skill: Skill = this.buildConstitutionCompliantSkill(basicInfo, {
      learningObjectives,
      evaluationCriteria,
      assessmentTypes,
      modules,
      resources,
      projects,
      aiSupport
    });

    // Validate constitution compliance
    const validation = this.validateSkill(skill);
    this.reportConstitutionCompliance(validation.constitutionCompliance);

    // Save the skill
    await this.saveSkill(skill);

    console.log('\n✅ Constitution-compliant skill created successfully!');
    console.log(`📁 Saved to: ${this.options.outputDir}/${skill.slug}.json`);
    console.log(`📝 Skill ID: ${skill.id}`);
    console.log(`🏷️  Slug: ${skill.slug}\n`);

    return skill;
  }

  /**
   * Explain constitution principles
   */
  private explainConstitutionPrinciples(): void {
    console.log('📋 CONSTITUTION PRINCIPLES:');
    console.log('  1. Assessment-First Approach: Define evaluation criteria before implementation');
    console.log('  2. Modular Evaluation Framework: Independent, testable, reusable evaluators');
    console.log('  3. Test-Driven Evaluation: TDD for evaluation logic (Red-Green-Refactor)');
    console.log('  4. Skills-First Approach: AI as enhancement, not core');
    console.log('  5. Dual-Track Evaluation: Both AI and non-AI evaluation paths');
    console.log('  6. Transparency and Fairness: Clear criteria and standardized scoring');
    console.log('');
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
    const passingScore = parseInt(await this.question('Passing Score (%) [default 70]: ') || '70');

    const tags = await this.question('Tags (comma-separated, e.g., "react,javascript,frontend"): ');

    return {
      name,
      description,
      longDescription,
      category,
      level,
      estimatedHours,
      passingScore: Math.min(100, Math.max(0, passingScore)), // Ensure valid percentage
      tags: tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
    };
  }

  /**
   * Collect learning objectives with Bloom's taxonomy emphasis
   */
  private async collectLearningObjectives(): Promise<LearningObjective[]> {
    console.log('\n🎯 Learning Objectives - Part of Assessment-First Approach\n');
    console.log('Define what learners will be able to do after completing this skill.\n');

    const objectives: LearningObjective[] = [];
    const bloomLevels: Array<'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'> = [
      'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'
    ];

    const count = parseInt(await this.question('How many learning objectives? (3-6 recommended): ') || '4');

    for (let i = 0; i < count; i++) {
      console.log(`\nObjective ${i + 1}:`);
      const description = await this.question('  Description (start with action verb): ');

      console.log('  Bloom\'s Taxonomy Level (emphasizes measurable outcomes):');
      bloomLevels.forEach((lvl, idx) => console.log(`    ${idx + 1}. ${lvl}`));
      const bloomIndex = parseInt(await this.question('  Select Level (number): ') || '3') - 1;

      // Ask about measurability
      const measurable = (await this.question('  Is this objective measurable? (y/n): ') || 'y').toLowerCase() === 'y';

      // Assessment methods
      const assessmentMethods = await this.selectAssessmentMethods();

      objectives.push({
        id: `lo-${String(i + 1).padStart(3, '0')}`,
        description,
        bloomLevel: bloomLevels[bloomIndex] || 'apply',
        measurable,
        assessmentMethods
      });
    }

    return objectives;
  }

  /**
   * Select assessment methods for learning objectives
   */
  private async selectAssessmentMethods(): Promise<string[]> {
    const methods = [
      'quiz', 'practical-coding', 'project-based', 'ai-assisted',
      'peer-review', 'portfolio-review', 'simulation', 'case-study'
    ];

    console.log('  Assessment Methods:');
    methods.forEach((method, idx) => console.log(`    ${idx + 1}. ${method}`));

    const selection = await this.question('  Select methods (comma-separated numbers): ') || '1,2';
    const indices = selection.split(',').map((s: string) => parseInt(s.trim()) - 1);

    return indices
      .filter((i: number) => i >= 0 && i < methods.length)
      .map((i: number) => methods[i]);
  }

  /**
   * Collect evaluation criteria with emphasis on assessment-first approach
   */
  private async collectEvaluationCriteria(): Promise<EvaluationCriterion[]> {
    console.log('\n📊 Evaluation Criteria - CORE ASSESSMENT-FIRST REQUIREMENT\n');
    console.log('Define how learner work will be evaluated (CRITICAL for Assessment-First approach).\n');

    const criteria: EvaluationCriterion[] = [];
    const categories: EvaluationCriterionCategory[] = [
      'technical', 'conceptual', 'practical', 'creative', 'analytical', 'methodological'
    ];

    const count = parseInt(await this.question('How many evaluation criteria? (3-5 recommended): ') || '4');

    for (let i = 0; i < count; i++) {
      console.log(`\nCriterion ${i + 1}:`);
      const name = await this.question('  Name (e.g., "Code Quality", "Functionality"): ');
      const description = await this.question('  Description: ');

      console.log('  Category (consider methodological for constitution compliance):');
      categories.forEach((cat, idx) => console.log(`    ${idx + 1}. ${cat}`));
      const catIndex = parseInt(await this.question('  Select Category (number): ') || '1') - 1;

      const maxScore = parseInt(await this.question('  Maximum Score (e.g., 25): ') || '25');
      const weight = parseFloat(await this.question('  Weight (0-1, e.g., 0.25): ') || '0.25');

      // Auto-grading capability (for non-AI path)
      const autoGradingEnabled = (await this.question('  Enable auto-grading (non-AI path)? (y/n): ') || 'y').toLowerCase() === 'y';

      // Human review requirement (for fairness)
      const requiresHumanReview = (await this.question('  Require human review? (y/n): ') || 'n').toLowerCase() === 'y';

      // Create detailed rubric levels
      const rubric = await this.createDetailedRubric(name, maxScore);

      // AI prompt template (for AI enhancement)
      const aiPromptTemplate = `Evaluate ${name.toLowerCase()}: "{submission}". Apply rubric: "{rubric}". Score 0-${maxScore}.`;

      criteria.push({
        id: `ec-${String(i + 1).padStart(3, '0')}`,
        name,
        description,
        category: categories[catIndex] || 'technical',
        weight,
        maxScore,
        rubric,
        aiPromptTemplate,
        autoGradingEnabled,
        requiresHumanReview
      });
    }

    // Verify weights sum to approximately 1
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    console.log(`\nTotal weight: ${totalWeight.toFixed(2)} (should be close to 1.0)`);

    return criteria;
  }

  /**
   * Create detailed rubric levels for a criterion
   */
  private async createDetailedRubric(criterionName: string, maxScore: number): Promise<RubricLevel[]> {
    console.log(`  Creating detailed rubric for ${criterionName}...`);

    const levels = [
      { label: 'Novice', description: `Basic understanding of ${criterionName.toLowerCase()}`, percentage: 0.4 },
      { label: 'Developing', description: `Developing proficiency in ${criterionName.toLowerCase()}`, percentage: 0.6 },
      { label: 'Proficient', description: `Solid command of ${criterionName.toLowerCase()}`, percentage: 0.8 },
      { label: 'Exemplary', description: `Exceptional mastery of ${criterionName.toLowerCase()}`, percentage: 1.0 }
    ];

    const rubric: RubricLevel[] = [];

    for (let idx = 0; idx < levels.length; idx++) {
      const lvl = levels[idx];
      const minScore = idx === 0 ? 0 : Math.round(maxScore * levels[idx - 1].percentage) + 1;
      const maxScoreLevel = Math.round(maxScore * lvl.percentage);

      // Collect specific indicators for this level
      console.log(`    ${lvl.label} level indicators:`);
      const indicator1 = await this.question(`      Indicator 1: `) || `Demonstrates ${lvl.label.toLowerCase()} level ${criterionName.toLowerCase()}`;
      const indicator2 = await this.question(`      Indicator 2: `) || `Meets ${lvl.label.toLowerCase()} expectations for ${criterionName.toLowerCase()}`;
      const indicator3 = await this.question(`      Indicator 3: `) || `Shows ${lvl.label.toLowerCase()} understanding of ${criterionName.toLowerCase()}`;

      rubric.push({
        level: idx,
        label: lvl.label,
        description: lvl.description,
        minScore,
        maxScore: maxScoreLevel,
        indicators: [indicator1, indicator2, indicator3]
      });
    }

    return rubric;
  }

  /**
   * Collect assessment types with dual-track emphasis
   */
  private async collectAssessmentTypes(): Promise<AssessmentType[]> {
    console.log('\n📝 Assessment Types - Supporting Dual-Track Evaluation\n');
    console.log('Select assessment types that support both AI and non-AI evaluation paths:\n');

    const types: AssessmentType[] = [
      'practical-coding', 'project-based', 'ai-assisted', 'peer-review',
      'portfolio-review', 'simulation', 'case-study', 'multiple-choice'
    ];

    console.log('Available assessment types:');
    types.forEach((type, i) => console.log(`  ${i + 1}. ${type}`));

    console.log('\nNote: Select types that support both automated (non-AI) and AI-assisted evaluation.');
    const selection = await this.question('Select assessment types (comma-separated numbers): ') || '1,2,4';
    const indices = selection.split(',').map((s: string) => parseInt(s.trim()) - 1);

    return indices
      .filter((i: number) => i >= 0 && i < types.length)
      .map((i: number) => types[i]);
  }

  /**
   * Collect modules for modular framework
   */
  private async collectModules(): Promise<SkillModule[]> {
    console.log('\n📚 Learning Modules - Implementing Modular Framework\n');
    console.log('Create modules that are independent and reusable...\n');

    const modules: SkillModule[] = [];
    const count = parseInt(await this.question('How many modules? (2-5 recommended): ') || '3');

    for (let i = 0; i < count; i++) {
      console.log(`\nModule ${i + 1}:`);
      const title = await this.question('  Title: ');
      const description = await this.question('  Description: ');
      const hours = parseFloat(await this.question('  Estimated Hours: ') || '2');

      // Module order
      const orderInput = await this.question(`  Order (1-${count}): `);
      const order = parseInt(orderInput || (i + 1).toString());

      // Lessons in the module
      const lessonCount = parseInt(await this.question('  Number of lessons: ') || '3');
      const lessons = await this.collectLessons(lessonCount);

      // Module assessments
      const assessmentCount = parseInt(await this.question('  Number of assessments: ') || '1');
      const assessments = await this.collectModuleAssessments(assessmentCount);

      // Learning outcomes
      const outcomesCount = parseInt(await this.question('  Number of learning outcomes: ') || '2');
      const learningOutcomes: string[] = [];
      for (let j = 0; j < outcomesCount; j++) {
        const outcome = await this.question(`    Outcome ${j + 1}: `);
        learningOutcomes.push(outcome);
      }

      modules.push({
        id: `mod-${String(i + 1).padStart(3, '0')}`,
        title,
        description,
        order,
        lessons,
        assessments,
        estimatedHours: hours,
        learningOutcomes
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

      // Content type varies by lesson type
      let content: any = { text: `Content for ${title}` };
      if (types[typeIndex] === 'video') {
        const videoUrl = await this.question('    Video URL: ');
        content = { videoUrl };
      } else if (types[typeIndex] === 'interactive') {
        const interactiveUrl = await this.question('    Interactive URL: ');
        content = { interactiveUrl, text: `Interactive content for ${title}` };
      }

      lessons.push({
        id: `lesson-${String(lessons.length + 1).padStart(3, '0')}`,
        title,
        type: types[typeIndex] || 'text',
        content,
        duration,
        resources: []
      });
    }

    return lessons;
  }

  /**
   * Collect assessments for a module
   */
  private async collectModuleAssessments(count: number): Promise<any[]> {
    const assessments: any[] = [];
    const types: AssessmentType[] = [
      'practical-coding', 'project-based', 'ai-assisted', 'peer-review',
      'portfolio-review', 'simulation', 'case-study', 'multiple-choice'
    ];

    for (let i = 0; i < count; i++) {
      console.log(`\n  Assessment ${i + 1}:`);
      const title = await this.question('    Title: ');
      const description = await this.question('    Description: ');
      const instructions = await this.question('    Instructions: ');

      console.log('    Type:');
      types.forEach((type, idx) => console.log(`      ${idx + 1}. ${type}`));
      const typeIndex = parseInt(await this.question('    Select Type (number): ') || '1') - 1;

      const timeLimit = parseInt(await this.question('    Time Limit (minutes, 0 for none): ') || '0');
      const maxAttempts = parseInt(await this.question('    Max Attempts: ') || '3');

      assessments.push({
        id: `assess-${String(assessments.length + 1).padStart(3, '0')}`,
        title,
        type: types[typeIndex] || 'multiple-choice',
        description,
        instructions,
        criteria: [], // Will be linked to skill evaluation criteria
        submissionFormat: {
          type: 'text',
          requiredFields: ['answer']
        },
        timeLimit: timeLimit > 0 ? timeLimit : undefined,
          maxAttempts
      });
    }

    return assessments;
  }

  /**
   * Collect resources for transparency
   */
  private async collectResources(): Promise<Resource[]> {
    console.log('\n🔗 Resources - Supporting Transparency and Fairness\n');
    console.log('Add resources that learners can access to support their learning...\n');

    const resources: Resource[] = [];
    const count = parseInt(await this.question('How many resources? (0-5 recommended): ') || '2');

    if (count === 0) {
      return [];
    }

    const types = ['article', 'video', 'book', 'course', 'documentation', 'tool', 'dataset'];
    const levels: SkillLevel[] = ['foundational', 'intermediate', 'advanced', 'expert'];

    for (let i = 0; i < count; i++) {
      console.log(`\nResource ${i + 1}:`);
      const title = await this.question('  Title: ');
      const description = await this.question('  Description: ');

      console.log('  Type:');
      types.forEach((type, idx) => console.log(`    ${idx + 1}. ${type}`));
      const typeIndex = parseInt(await this.question('  Select Type (number): ') || '1') - 1;

      const url = await this.question('  URL (optional): ') || undefined;

      console.log('  Difficulty Level:');
      levels.forEach((level, idx) => console.log(`    ${idx + 1}. ${level}`));
      const levelIndex = parseInt(await this.question('  Select Level (number): ') || '2') - 1;

      const duration = parseInt(await this.question('  Duration (minutes, if applicable): ') || '0') || undefined;

      resources.push({
        id: `res-${String(i + 1).padStart(3, '0')}`,
        title,
        type: types[typeIndex] as any,
        url,
        description,
        difficulty: levels[levelIndex],
        duration
      });
    }

    return resources;
  }

  /**
   * Collect projects for practical application
   */
  private async collectProjects(): Promise<Project[]> {
    console.log('\n🏗️  Projects - Practical Application and Real-World Simulation\n');
    console.log('Add capstone projects that demonstrate practical application...\n');

    const projects: Project[] = [];
    const count = parseInt(await this.question('How many projects? (0-2 recommended): ') || '1');

    if (count === 0) {
      return [];
    }

    const categories = ['individual', 'group', 'capstone'];
    const levels: SkillLevel[] = ['foundational', 'intermediate', 'advanced', 'expert'];

    for (let i = 0; i < count; i++) {
      console.log(`\nProject ${i + 1}:`);
      const title = await this.question('  Title: ');
      const description = await this.question('  Description: ');

      console.log('  Category:');
      categories.forEach((cat, idx) => console.log(`    ${idx + 1}. ${cat}`));
      const catIndex = parseInt(await this.question('  Select Category (number): ') || '1') - 1;

      console.log('  Difficulty Level:');
      levels.forEach((level, idx) => console.log(`    ${idx + 1}. ${level}`));
      const levelIndex = parseInt(await this.question('  Select Level (number): ') || '2') - 1;

      const estimatedHours = parseFloat(await this.question('  Estimated Hours: ') || '10');

      // Requirements
      const reqCount = parseInt(await this.question('  Number of requirements: ') || '3');
      const requirements: string[] = [];
      for (let j = 0; j < reqCount; j++) {
        const req = await this.question(`    Requirement ${j + 1}: `);
        requirements.push(req);
      }

      // Deliverables
      const delivCount = parseInt(await this.question('  Number of deliverables: ') || '2');
      const deliverables: any[] = [];
      const delivTypes = ['code', 'documentation', 'presentation', 'demo', 'report'];

      for (let j = 0; j < delivCount; j++) {
        console.log(`    Deliverable ${j + 1}:`);
        const name = await this.question(`      Name: `);
        const delivDesc = await this.question(`      Description: `);

        console.log('      Type:');
        delivTypes.forEach((type, idx) => console.log(`        ${idx + 1}. ${type}`));
        const delivTypeIdx = parseInt(await this.question('      Select Type (number): ') || '1') - 1;

        const weight = parseFloat(await this.question('      Weight (0-1): ') || '0.5');

        deliverables.push({
          id: `deliv-${String(j + 1).padStart(3, '0')}`,
          name,
          description: delivDesc,
          type: delivTypes[delivTypeIdx],
          weight
        });
      }

      projects.push({
        id: `proj-${String(i + 1).padStart(3, '0')}`,
        title,
        description,
        category: categories[catIndex] as any,
        difficulty: levels[levelIndex],
        requirements,
        deliverables,
        evaluationCriteria: [], // Will link to skill evaluation criteria
        estimatedHours,
        resources: [] // Will link to resources
      });
    }

    return projects;
  }

  /**
   * Collect AI support configuration emphasizing skills-first approach
   */
  private async collectAISupport(): Promise<AISupportConfig> {
    console.log('\n🤖 AI Support Configuration - AI as Enhancement, Not Core\n');
    console.log('Configure AI features as enhancements to solid skill foundation...\n');

    const enabled = (await this.question('Enable AI-assisted evaluation? (y/n): ') || 'y').toLowerCase() === 'y';

    if (!enabled) {
      console.log('  Note: Non-AI evaluation paths are essential for skills-first approach.');
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

    console.log('\nSelect AI features (remember: AI should enhance, not replace, core evaluation):');
    console.log('  1. Personalized Feedback (enhancement)');
    console.log('  2. Adaptive Learning (enhancement)');
    console.log('  3. Automated Hints (enhancement)');
    console.log('  4. Progress Prediction (enhancement)');
    console.log('  5. Weakness Detection (enhancement)');
    console.log('  6. Content Generation (enhancement)');

    const featureSelection = await this.question('Your selection (comma-separated, or press Enter for all): ') || '1,2,3,4,5,6';
    const featureIndices = featureSelection.split(',').map((s: string) => parseInt(s.trim()) - 1);

    const features = {
      personalizedFeedback: featureIndices.includes(0),
      adaptiveLearning: featureIndices.includes(1),
      automatedHints: featureIndices.includes(2),
      progressPrediction: featureIndices.includes(3),
      weaknessDetection: featureIndices.includes(4),
      contentGeneration: featureIndices.includes(5)
    };

    console.log('\nLLM Provider (AI enhancement layer):');
    const providers: ('openai' | 'anthropic' | 'google' | 'azure' | 'local')[] = ['openai', 'anthropic', 'google', 'azure', 'local'];
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
        systemPrompt: 'You are an expert instructor focused on skill development. Provide constructive, specific feedback that enhances the solid evaluation framework already in place. Remember, AI is an enhancement tool, not the core of evaluation.'
      },
      evaluationPrompts: {
        codeReview: 'Review this submission for quality, correctness, and best practices. Focus on providing enhancement to the already solid evaluation criteria.',
        feedbackGeneration: 'Generate personalized feedback based on the evaluation results. Enhance the feedback provided by the standard evaluation.',
        hintGeneration: 'Provide a helpful hint without giving away the answer. Enhance the learning experience.',
        rubricScoring: 'Score this submission against the provided rubric criteria. Enhance the scoring with additional insights.'
      }
    };
  }

  /**
   * Build the constitution-compliant skill object
   */
  private buildConstitutionCompliantSkill(basicInfo: any, components: any): Skill {
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
      passingScore: basicInfo.passingScore,
      gradingScale: this.createDefaultGradingScale(),
      modules: components.modules,
      resources: components.resources,
      projects: components.projects,
      aiSupport: components.aiSupport,
      author: {
        name: 'Constitution-Compliant Skill Creator',
        email: 'creator@example.com',
        organization: 'Modern Skills Initiative',
        credentials: ['Constitution Compliance Expert'],
        bio: 'Created following all constitution principles for modern AI-era skills'
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
   * Create default grading scale with transparency
   */
  private createDefaultGradingScale(): any {
    return {
      type: 'letter',
      scale: [
        { grade: 'A+', minPercentage: 97, description: 'Outstanding mastery', gpa: 4.0 },
        { grade: 'A', minPercentage: 93, description: 'Excellent performance', gpa: 4.0 },
        { grade: 'A-', minPercentage: 90, description: 'Strong performance', gpa: 3.7 },
        { grade: 'B+', minPercentage: 87, description: 'Good performance', gpa: 3.3 },
        { grade: 'B', minPercentage: 83, description: 'Solid performance', gpa: 3.0 },
        { grade: 'B-', minPercentage: 80, description: 'Above average', gpa: 2.7 },
        { grade: 'C+', minPercentage: 77, description: 'Satisfactory', gpa: 2.3 },
        { grade: 'C', minPercentage: 73, description: 'Meets minimum requirements', gpa: 2.0 },
        { grade: 'C-', minPercentage: 70, description: 'Below average but passing', gpa: 1.7 },
        { grade: 'F', minPercentage: 0, description: 'Does not meet requirements', gpa: 0.0 }
      ]
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
   * Validate a skill definition against constitution principles
   */
  validateSkill(skill: Skill): { valid: boolean; errors: string[]; warnings: string[]; constitutionCompliance: ConstitutionCompliance } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const constitutionCompliance: ConstitutionCompliance = {
      assessmentFirst: false,
      modularFramework: false,
      testDriven: false,
      skillsFirst: false,
      dualTrack: false,
      transparency: false,
      fairness: false
    };

    // Required fields
    if (!skill.id) errors.push('Missing required field: id');
    if (!skill.name) errors.push('Missing required field: name');
    if (!skill.slug) errors.push('Missing required field: slug');
    if (!skill.version) errors.push('Missing required field: version');
    if (!skill.description) errors.push('Missing required field: description');
    if (!skill.category) errors.push('Missing required field: category');
    if (!skill.level) errors.push('Missing required field: level');

    // Learning objectives (part of assessment-first)
    if (!skill.learningObjectives || skill.learningObjectives.length === 0) {
      errors.push('At least one learning objective is required');
    }

    // Evaluation criteria - CORE ASSESSMENT-FIRST REQUIREMENT
    if (!skill.evaluationCriteria || skill.evaluationCriteria.length === 0) {
      errors.push('At least one evaluation criterion is required (Assessment-First Approach)');
    } else {
      // Check weights sum to approximately 1
      const totalWeight = skill.evaluationCriteria.reduce((sum, c) => sum + c.weight, 0);
      if (Math.abs(totalWeight - 1) > 0.1) {
        warnings.push(`Evaluation criteria weights sum to ${totalWeight}, should be close to 1`);
      }

      // Mark as compliant with assessment-first approach
      constitutionCompliance.assessmentFirst = true;
    }

    // Check for modular framework (defined modules)
    if (skill.modules && skill.modules.length > 0) {
      constitutionCompliance.modularFramework = true;
    } else {
      warnings.push('No modules defined. Consider adding learning modules for modular framework.');
    }

    // Check for test-driven approach (defined assessment types)
    if (skill.assessmentTypes && skill.assessmentTypes.length > 0) {
      constitutionCompliance.testDriven = true;
    } else {
      warnings.push('No assessment types defined. Consider defining assessment methods for test-driven approach.');
    }

    // Check for skills-first approach (non-AI evaluation path)
    if (skill.evaluationCriteria && skill.evaluationCriteria.some(ec => ec.autoGradingEnabled === true)) {
      constitutionCompliance.skillsFirst = true;
      constitutionCompliance.dualTrack = true;
    } else {
      warnings.push('No auto-grading evaluation criteria found. Ensure non-AI evaluation path is available.');
    }

    // Check for dual-track evaluation (both AI and non-AI paths)
    if (skill.aiSupport && skill.aiSupport.enabled) {
      // Even with AI enabled, ensure non-AI path is available
      if (skill.evaluationCriteria && skill.evaluationCriteria.some(ec => ec.autoGradingEnabled === true)) {
        constitutionCompliance.dualTrack = true;
      }
    } else {
      // If AI is disabled, ensure proper evaluation framework exists
      if (skill.evaluationCriteria && skill.evaluationCriteria.length > 0) {
        constitutionCompliance.dualTrack = true; // At least non-AI path exists
      }
    }

    // Check for transparency (grading scale defined)
    if (skill.gradingScale && skill.gradingScale.scale && skill.gradingScale.scale.length > 0) {
      constitutionCompliance.transparency = true;
    } else {
      errors.push('Grading scale must be defined for transparency and fairness.');
    }

    // Check for fairness (clear criteria and standardized scoring)
    if (skill.evaluationCriteria && skill.evaluationCriteria.every(ec => ec.rubric && ec.rubric.length > 0)) {
      constitutionCompliance.fairness = true;
    } else {
      warnings.push('Some evaluation criteria lack detailed rubrics. Add rubrics for fairness and standardization.');
    }

    // Additional constitution compliance checks
    if (!skill.passingScore || skill.passingScore < 0 || skill.passingScore > 100) {
      errors.push('Valid passing score (0-100) must be defined.');
    }

    // Check for rubric completeness in evaluation criteria
    if (skill.evaluationCriteria) {
      for (const criterion of skill.evaluationCriteria) {
        if (!criterion.rubric || criterion.rubric.length === 0) {
          errors.push(`Evaluation criterion "${criterion.name}" must have a defined rubric.`);
        }

        // Ensure rubric levels are complete
        if (criterion.rubric) {
          const hasAllLevels = [0, 1, 2, 3].every(level =>
            criterion.rubric.some(r => r.level === level)
          );

          if (!hasAllLevels) {
            warnings.push(`Criterion "${criterion.name}" should have complete rubric levels (0-3).`);
          }
        }
      }
    }

    // Check for proper learning objectives structure
    if (skill.learningObjectives) {
      for (const obj of skill.learningObjectives) {
        if (!obj.bloomLevel) {
          warnings.push(`Learning objective "${obj.description}" should specify bloom level.`);
        }
        if (!obj.measurable) {
          warnings.push(`Learning objective "${obj.description}" should be measurable.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      constitutionCompliance
    };
  }

  /**
   * Report constitution compliance status
   */
  private reportConstitutionCompliance(compliance: ConstitutionCompliance): void {
    console.log('\n🏛️  CONSTITUTION COMPLIANCE REPORT:');

    const complianceChecks = [
      { key: 'assessmentFirst', label: 'Assessment-First Approach', emoji: '🎯' },
      { key: 'modularFramework', label: 'Modular Framework', emoji: '🧩' },
      { key: 'testDriven', label: 'Test-Driven Evaluation', emoji: '🧪' },
      { key: 'skillsFirst', label: 'Skills-First Approach', emoji: '基石' }, // Rock symbol for foundation
      { key: 'dualTrack', label: 'Dual-Track Evaluation', emoji: '⚖️' },
      { key: 'transparency', label: 'Transparency', emoji: '🔍' },
      { key: 'fairness', label: 'Fairness', emoji: '⚖️' }
    ];

    let compliantCount = 0;
    for (const check of complianceChecks) {
      const isCompliant = compliance[check.key as keyof ConstitutionCompliance];
      console.log(`  ${isCompliant ? '✅' : '❌'} ${check.emoji} ${check.label}: ${isCompliant ? 'COMPLIANT' : 'NOT COMPLIANT'}`);
      if (isCompliant) compliantCount++;
    }

    console.log(`\n  Overall Compliance: ${compliantCount}/${complianceChecks.length} principles met`);

    if (compliantCount === complianceChecks.length) {
      console.log('  🎉 This skill is fully constitution-compliant!');
    } else {
      console.log('  ⚠️  Some principles need attention. Review warnings above.');
    }
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
}

// CLI entry point
if (require.main === module) {
  const creator = new EnhancedSkillCreator();

  creator.createConstitutionCompliantSkill()
    .then(() => {
      creator.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error creating constitution-compliant skill:', error);
      creator.close();
      process.exit(1);
    });
}