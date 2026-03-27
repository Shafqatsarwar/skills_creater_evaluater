/**
 * Skills Evaluator - Main Entry Point
 *
 * This system provides an independent framework for evaluating various
 * technical and professional skills through automated assessments.
 */

import express from 'express';
import path from 'path';
import { AssessmentEngine } from './engine/assessment-engine';
import { AssessmentManager } from './manager/assessment-manager';
import { ResultProcessor } from './processor/result-processor';

// Initialize the application
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

// Initialize core components
const assessmentEngine = new AssessmentEngine();
const assessmentManager = new AssessmentManager();
const resultProcessor = new ResultProcessor();

// Root route - serve the UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'skills-ui-modern.html'));
});

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/assessments', async (req, res) => {
  try {
    const assessments = await assessmentManager.getAllAssessments();
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve assessments' });
  }
});

app.post('/api/assessments/:id/evaluate', async (req, res) => {
  try {
    const { id } = req.params;
    const submission = req.body;

    const result = await assessmentEngine.evaluateSubmission(id, submission);
    await resultProcessor.processResult(result);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Evaluation failed' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Skills Evaluator Server running at http://localhost:${port}`);
});

export { app };