/**
 * Skills Evaluator - Main Entry Point
 * Full backend API for production use with file-based storage
 */

import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

// Data file path
const DATA_FILE = path.join(__dirname, '..', 'skills-data.json');

// Load data from file
function loadData() {
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
function saveData(data: { skills: any[]; evaluations: any[] }): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error: any) {
    console.error('Error saving data:', error.message);
    return false;
  }
}

// Root route - serve the UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'skills-ui-modern.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mode: 'production'
  });
});

// ============ SKILLS API ============

// Get all skills
app.get('/api/skills', (req, res) => {
  try {
    const data = loadData();
    res.json(data.skills || []);
  } catch (error: any) {
    console.error('Error getting skills:', error);
    res.status(500).json({ error: 'Failed to retrieve skills' });
  }
});

// Create new skill
app.post('/api/skills', (req, res) => {
  try {
    const data = loadData();
    const newSkill = req.body;

    // Check if skill already exists
    const existingIndex = data.skills.findIndex((s: any) => s.name === newSkill.name);
    if (existingIndex >= 0) {
      return res.status(400).json({ error: 'Skill with this name already exists' });
    }

    newSkill.createdAt = new Date().toISOString();
    newSkill.version = newSkill.version || '1.0.0';
    newSkill.status = newSkill.status || 'active';
    newSkill.evaluations = 0;

    data.skills.push(newSkill);

    if (saveData(data)) {
      res.status(201).json({ 
        message: 'Skill created successfully', 
        skill: newSkill,
        mode: 'production'
      });
    } else {
      res.status(500).json({ error: 'Failed to save skill' });
    }
  } catch (error: any) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

// Update skill
app.put('/api/skills/:name', (req, res) => {
  try {
    const data = loadData();
    const { name } = req.params;
    const updates = req.body;

    const skillIndex = data.skills.findIndex((s: any) => s.name === name);
    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    data.skills[skillIndex] = {
      ...data.skills[skillIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (saveData(data)) {
      res.json({ 
        message: 'Skill updated successfully', 
        skill: data.skills[skillIndex] 
      });
    } else {
      res.status(500).json({ error: 'Failed to save skill' });
    }
  } catch (error: any) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// Delete skill
app.delete('/api/skills/:name', (req, res) => {
  try {
    const data = loadData();
    const { name } = req.params;

    const skillIndex = data.skills.findIndex((s: any) => s.name === name);
    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    data.skills.splice(skillIndex, 1);

    if (saveData(data)) {
      res.json({ message: 'Skill deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete skill' });
    }
  } catch (error: any) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// ============ EVALUATIONS API ============

// Get all evaluations
app.get('/api/evaluations', (req, res) => {
  try {
    const data = loadData();
    res.json(data.evaluations || []);
  } catch (error: any) {
    console.error('Error getting evaluations:', error);
    res.status(500).json({ error: 'Failed to retrieve evaluations' });
  }
});

// Create evaluation
app.post('/api/evaluations', (req, res) => {
  try {
    const data = loadData();
    const evaluation = req.body;

    evaluation.timestamp = new Date().toISOString();
    data.evaluations = data.evaluations || [];
    data.evaluations.push(evaluation);

    // Update skill evaluation count
    const skillIndex = data.skills.findIndex((s: any) => s.name === evaluation.skillName);
    if (skillIndex >= 0) {
      data.skills[skillIndex].evaluations = (data.skills[skillIndex].evaluations || 0) + 1;
    }

    if (saveData(data)) {
      res.status(201).json({ 
        message: 'Evaluation saved successfully', 
        evaluation 
      });
    } else {
      res.status(500).json({ error: 'Failed to save evaluation' });
    }
  } catch (error: any) {
    console.error('Error saving evaluation:', error);
    res.status(500).json({ error: 'Failed to save evaluation' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`\n===========================================`);
  console.log(`  Skills Evaluator Server`);
  console.log(`  Running at: http://localhost:${port}`);
  console.log(`  Mode: Production (File-based storage)`);
  console.log(`  Data: ${DATA_FILE}`);
  console.log(`===========================================\n`);
});

export { app };
