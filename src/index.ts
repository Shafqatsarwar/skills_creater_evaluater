/**
 * Skills Evaluator - Main Entry Point
 * Modern AI-Era Skills Creation and Evaluation System
 */

import express from 'express';
import path from 'path';
import fs from 'fs';

import { EvaluationEngine, LearnerProfile } from './engine/evaluation-engine';
import { SkillCreator } from './cli/skill-creator';
import { Skill, EvaluationResult, SkillQuery, EvaluationQuery } from './types/skill-types';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Data file path
const DATA_FILE = path.join(__dirname, '..', 'data', 'skills-data.json');
const EVALS_FILE = path.join(__dirname, '..', 'data', 'evaluations.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize evaluation engine
const evaluationEngine = new EvaluationEngine({
  enableAIEvaluation: true,
  enablePlagiarismCheck: false,
  autoFeedback: true,
  detailedRubricScoring: true
});

// Load data from file
function loadData(): { skills: Skill[]; evaluations: EvaluationResult[] } {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error: any) {
    console.error('Error loading data:', error.message);
  }
  return { skills: [], evaluations: [] };
}

// Save data to file
function saveData(data: { skills: Skill[]; evaluations: EvaluationResult[] }): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error: any) {
    console.error('Error saving data:', error.message);
    return false;
  }
}

// Load evaluations
function loadEvaluations(): EvaluationResult[] {
  try {
    if (fs.existsSync(EVALS_FILE)) {
      const data = fs.readFileSync(EVALS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error: any) {
    console.error('Error loading evaluations:', error.message);
  }
  return [];
}

// Save evaluations
function saveEvaluations(evaluations: EvaluationResult[]): boolean {
  try {
    fs.writeFileSync(EVALS_FILE, JSON.stringify(evaluations, null, 2));
    return true;
  } catch (error: any) {
    console.error('Error saving evaluations:', error.message);
    return false;
  }
}

// ============ ROOT & HEALTH ============

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    mode: 'production',
    features: {
      aiEvaluation: true,
      skillCreation: true,
      rubricScoring: true,
      personalizedFeedback: true
    }
  });
});

// ============ SKILLS API ============

// Get all skills with filtering
app.get('/api/skills', (req, res) => {
  try {
    const data = loadData();
    const { category, level, search, status } = req.query;

    let skills = data.skills;

    // Filter by category
    if (category) {
      skills = skills.filter(s => s.category === category);
    }

    // Filter by level
    if (level) {
      skills = skills.filter(s => s.level === level);
    }

    // Filter by status
    if (status) {
      skills = skills.filter(s => s.status === status);
    }

    // Search by name or description
    if (search) {
      const searchLower = String(search).toLowerCase();
      skills = skills.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        s.tags.some(t => t.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      success: true,
      data: skills,
      count: skills.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting skills:', error);
    res.status(500).json({ error: 'Failed to retrieve skills', message: error.message });
  }
});

// Get skill by ID or slug
app.get('/api/skills/:identifier', (req, res) => {
  try {
    const data = loadData();
    const { identifier } = req.params;

    const skill = data.skills.find(
      s => s.id === identifier || s.slug === identifier
    );

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json({
      success: true,
      data: skill,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting skill:', error);
    res.status(500).json({ error: 'Failed to retrieve skill', message: error.message });
  }
});

// Create new skill
app.post('/api/skills', (req, res) => {
  try {
    const data = loadData();
    const newSkill: Skill = req.body;

    // Validate required fields
    const requiredFields = ['id', 'name', 'slug', 'version', 'description', 'category', 'level'];
    const missingFields = requiredFields.filter(field => !newSkill[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missingFields
      });
    }

    // Check if skill already exists
    const existingIndex = data.skills.findIndex(
      s => s.id === newSkill.id || s.slug === newSkill.slug
    );

    if (existingIndex >= 0) {
      return res.status(400).json({ error: 'Skill with this ID or slug already exists' });
    }

    // Set defaults
    newSkill.createdAt = new Date().toISOString();
    newSkill.updatedAt = new Date().toISOString();
    newSkill.status = newSkill.status || 'draft';
    newSkill.visibility = newSkill.visibility || 'private';
    newSkill.passingScore = newSkill.passingScore || 70;

    data.skills.push(newSkill);

    if (saveData(data)) {
      res.status(201).json({
        success: true,
        message: 'Skill created successfully',
        data: newSkill
      });
    } else {
      res.status(500).json({ error: 'Failed to save skill' });
    }
  } catch (error: any) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: 'Failed to create skill', message: error.message });
  }
});

// Update skill
app.put('/api/skills/:identifier', (req, res) => {
  try {
    const data = loadData();
    const { identifier } = req.params;
    const updates = req.body;

    const skillIndex = data.skills.findIndex(
      s => s.id === identifier || s.slug === identifier
    );

    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Update skill
    data.skills[skillIndex] = {
      ...data.skills[skillIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (saveData(data)) {
      res.json({
        success: true,
        message: 'Skill updated successfully',
        data: data.skills[skillIndex]
      });
    } else {
      res.status(500).json({ error: 'Failed to save skill' });
    }
  } catch (error: any) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Failed to update skill', message: error.message });
  }
});

// Delete skill
app.delete('/api/skills/:identifier', (req, res) => {
  try {
    const data = loadData();
    const { identifier } = req.params;

    const skillIndex = data.skills.findIndex(
      s => s.id === identifier || s.slug === identifier
    );

    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    data.skills.splice(skillIndex, 1);

    if (saveData(data)) {
      res.json({
        success: true,
        message: 'Skill deleted successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to delete skill' });
    }
  } catch (error: any) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Failed to delete skill', message: error.message });
  }
});

// Import skill from template
app.post('/api/skills/import/:template', (req, res) => {
  try {
    const { template } = req.params;
    const templatePath = path.join(__dirname, '../../skills-templates', `${template}.json`);

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const skill: Skill = JSON.parse(templateContent);

    // Update ID and timestamps
    skill.id = `${skill.slug}-${Date.now()}`;
    skill.createdAt = new Date().toISOString();
    skill.updatedAt = new Date().toISOString();
    skill.status = 'draft';

    const data = loadData();
    data.skills.push(skill);

    if (saveData(data)) {
      res.status(201).json({
        success: true,
        message: `Skill imported from template: ${template}`,
        data: skill
      });
    } else {
      res.status(500).json({ error: 'Failed to save skill' });
    }
  } catch (error: any) {
    console.error('Error importing skill:', error);
    res.status(500).json({ error: 'Failed to import skill', message: error.message });
  }
});

// ============ EVALUATIONS API ============

// Get all evaluations with filtering
app.get('/api/evaluations', (req, res) => {
  try {
    const evaluations = loadEvaluations();
    const { skillId, learnerId, status, passed } = req.query;

    let filtered = evaluations;

    if (skillId) {
      filtered = filtered.filter(e => e.skillId === skillId);
    }

    if (learnerId) {
      filtered = filtered.filter(e => e.learnerId === learnerId);
    }

    if (status) {
      filtered = filtered.filter(e => e.status === status);
    }

    if (passed !== undefined) {
      const passedBool = passed === 'true';
      filtered = filtered.filter(e => e.passed === passedBool);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting evaluations:', error);
    res.status(500).json({ error: 'Failed to retrieve evaluations', message: error.message });
  }
});

// Get evaluation by ID
app.get('/api/evaluations/:id', (req, res) => {
  try {
    const evaluations = loadEvaluations();
    const { id } = req.params;

    const evaluation = evaluations.find(e => e.id === id);

    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    res.json({
      success: true,
      data: evaluation,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting evaluation:', error);
    res.status(500).json({ error: 'Failed to retrieve evaluation', message: error.message });
  }
});

// Create evaluation (submit for evaluation)
app.post('/api/evaluations', async (req, res) => {
  try {
    const { skillId, submission, learnerProfile } = req.body;

    if (!skillId || !submission) {
      return res.status(400).json({
        error: 'Missing required fields: skillId and submission'
      });
    }

    // Load skill
    const data = loadData();
    const skill = data.skills.find(s => s.id === skillId || s.slug === skillId);

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Perform evaluation
    const result = await evaluationEngine.evaluate(
      skill,
      submission,
      learnerProfile as LearnerProfile | undefined
    );

    // Save evaluation
    const evaluations = loadEvaluations();
    evaluations.push(result);
    saveEvaluations(evaluations);

    res.status(201).json({
      success: true,
      message: 'Evaluation completed successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error creating evaluation:', error);
    res.status(500).json({ error: 'Failed to create evaluation', message: error.message });
  }
});

// Re-evaluate submission
app.post('/api/evaluations/:id/re-evaluate', async (req, res) => {
  try {
    const { id } = req.params;
    const evaluations = loadEvaluations();

    const existingEval = evaluations.find(e => e.id === id);
    if (!existingEval) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    // Load skill
    const data = loadData();
    const skill = data.skills.find(s => s.id === existingEval.skillId);

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Re-run evaluation
    const result = await evaluationEngine.evaluate(
      skill,
      { content: existingEval.criterionResults[0]?.evidence || '' },
      {
        id: existingEval.learnerId,
        name: existingEval.learnerName || '',
        level: 'intermediate',
        previousEvaluations: 1,
        averageScore: existingEval.percentage,
        weakAreas: [],
        strongAreas: []
      }
    );

    // Update evaluation
    result.id = id;
    const evalIndex = evaluations.findIndex(e => e.id === id);
    evaluations[evalIndex] = result;
    saveEvaluations(evaluations);

    res.json({
      success: true,
      message: 'Evaluation re-run successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error re-evaluating:', error);
    res.status(500).json({ error: 'Failed to re-evaluate', message: error.message });
  }
});

// ============ ANALYTICS API ============

// Get skill statistics
app.get('/api/skills/:identifier/stats', (req, res) => {
  try {
    const { identifier } = req.params;
    const data = loadData();
    const evaluations = loadEvaluations();

    const skill = data.skills.find(s => s.id === identifier || s.slug === identifier);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const skillEvals = evaluations.filter(e => e.skillId === skill.id);

    const stats = {
      skillId: skill.id,
      skillName: skill.name,
      totalEvaluations: skillEvals.length,
      averageScore: skillEvals.length > 0
        ? Math.round(skillEvals.reduce((sum, e) => sum + e.percentage, 0) / skillEvals.length)
        : 0,
      passRate: skillEvals.length > 0
        ? Math.round((skillEvals.filter(e => e.passed).length / skillEvals.length) * 100)
        : 0,
      gradeDistribution: {
        A: skillEvals.filter(e => e.grade.startsWith('A')).length,
        B: skillEvals.filter(e => e.grade.startsWith('B')).length,
        C: skillEvals.filter(e => e.grade.startsWith('C')).length,
        D: skillEvals.filter(e => e.grade.startsWith('D')).length,
        F: skillEvals.filter(e => e.grade.startsWith('F')).length
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics', message: error.message });
  }
});

// ============ SKILL CREATOR API ============

// Generate skill from prompt (AI-assisted)
app.post('/api/skills/generate', async (req, res) => {
  try {
    const { prompt, category, level } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // In production, this would call an LLM to generate the skill
    // For now, return a template-based response
    const skill: Partial<Skill> = {
      id: `generated-${Date.now()}`,
      name: prompt.substring(0, 50),
      slug: prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50),
      version: '1.0.0',
      description: `Auto-generated skill: ${prompt}`,
      category: category || 'web-development',
      level: level || 'intermediate',
      status: 'draft'
    };

    res.json({
      success: true,
      message: 'Skill draft generated. Please complete the details.',
      data: skill
    });
  } catch (error: any) {
    console.error('Error generating skill:', error);
    res.status(500).json({ error: 'Failed to generate skill', message: error.message });
  }
});

// Validate skill definition
app.post('/api/skills/validate', (req, res) => {
  try {
    const skill: Skill = req.body;
    const creator = new SkillCreator({ interactive: false });

    const validation = creator.validateSkill(skill);

    res.json({
      success: validation.valid,
      data: validation,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error validating skill:', error);
    res.status(500).json({ error: 'Failed to validate skill', message: error.message });
  }
});

// ============ BATCH OPERATIONS ============

// Export all skills
app.get('/api/export/skills', (req, res) => {
  try {
    const data = loadData();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="skills-export.json"');

    res.json({
      success: true,
      data: data.skills,
      exportedAt: new Date().toISOString(),
      count: data.skills.length
    });
  } catch (error: any) {
    console.error('Error exporting skills:', error);
    res.status(500).json({ error: 'Failed to export skills', message: error.message });
  }
});

// Import skills batch
app.post('/api/import/skills', (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills must be an array' });
    }

    const data = loadData();
    let imported = 0;
    let skipped = 0;

    for (const skill of skills) {
      // Check for duplicates
      const exists = data.skills.some(
        s => s.id === skill.id || s.slug === skill.slug
      );

      if (exists) {
        skipped++;
        continue;
      }

      skill.createdAt = skill.createdAt || new Date().toISOString();
      skill.updatedAt = skill.updatedAt || new Date().toISOString();
      skill.status = skill.status || 'draft';

      data.skills.push(skill);
      imported++;
    }

    if (saveData(data)) {
      res.json({
        success: true,
        message: `Imported ${imported} skills, skipped ${skipped} duplicates`,
        imported,
        skipped
      });
    } else {
      res.status(500).json({ error: 'Failed to save imported skills' });
    }
  } catch (error: any) {
    console.error('Error importing skills:', error);
    res.status(500).json({ error: 'Failed to import skills', message: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           Modern AI-Era Skills Evaluator                  ║
║                                                           ║
║   🚀 Server running at: http://localhost:${port}               ║
║   📊 API Docs: http://localhost:${port}/api/health             ║
║   💾 Data: ${DATA_FILE.padEnd(35)}║
║                                                           ║
║   Features:                                               ║
║   ✓ AI-powered evaluation                                 ║
║   ✓ Comprehensive rubrics                                 ║
║   ✓ Personalized feedback                                 ║
║   ✓ Skill templates                                       ║
║   ✓ Modern REST API                                       ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export { app, evaluationEngine, SkillCreator };
