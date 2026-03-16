/**
 * Test script for Skills Evaluator
 *
 * This script demonstrates the basic functionality of the skills evaluator system
 */

import { AssessmentEngine, Submission, Answer } from './engine/assessment-engine';
import { AssessmentManager } from './manager/assessment-manager';
import { ResultProcessor } from './processor/result-processor';

async function runDemo() {
  console.log('Starting Skills Evaluator Demo...\n');

  // Initialize components
  const assessmentEngine = new AssessmentEngine();
  const assessmentManager = new AssessmentManager();
  const resultProcessor = new ResultProcessor();

  // Get available assessments
  console.log('Fetching available assessments...');
  const assessments = await assessmentManager.getAllAssessments();
  console.log(`Found ${assessments.length} assessments\n`);

  // Show the first assessment
  if (assessments.length > 0) {
    console.log('Sample Assessment:');
    console.log(`- ID: ${assessments[0].id}`);
    console.log(`- Title: ${assessments[0].title}`);
    console.log(`- Type: ${assessments[0].type}`);
    console.log(`- Difficulty: ${assessments[0].difficulty}`);
    console.log(`- Questions: ${assessments[0].questions.length}\n`);

    // Create a sample submission
    console.log('Creating sample submission...');
    const sampleSubmission: Submission = {
      assessmentId: assessments[0].id,
      userId: 'user-123',
      timestamp: new Date(),
      answers: []
    };

    // Add answers based on the questions in the assessment
    for (const question of assessments[0].questions) {
      let answer: Answer;

      switch (question.type) {
        case 'single-choice':
          // Select the first option as the answer (might be incorrect)
          answer = {
            questionId: question.id,
            response: question.options ? question.options[0] : ''
          };
          break;

        case 'multiple-choice':
          // Select the first option as the answer (might be incorrect)
          answer = {
            questionId: question.id,
            response: question.options ? [question.options[0]] : []
          };
          break;

        case 'text':
        case 'code':
          // Provide a sample response
          answer = {
            questionId: question.id,
            response: 'Sample response for text/code question'
          };
          break;

        case 'upload':
          // Simulate a file upload
          answer = {
            questionId: question.id,
            response: { fileName: 'sample-file.txt', fileSize: 1024 }
          };
          break;

        default:
          answer = {
            questionId: question.id,
            response: 'Default response'
          };
      }

      sampleSubmission.answers.push(answer);
    }

    console.log('Evaluating submission...');
    try {
      const result = await assessmentEngine.evaluateSubmission(assessments[0].id, sampleSubmission);

      console.log('\nEvaluation Result:');
      console.log(`- Score: ${result.score}/${result.maxScore} (${result.percentage}%)`);
      console.log(`- Passed: ${result.passed}`);
      console.log(`- Feedback Items: ${result.feedback.length}`);

      // Process the result
      await resultProcessor.processResult(result);
      console.log('\nResult processed successfully!');

      // Get user progress
      console.log('\nFetching user progress...');
      const userProgress = await resultProcessor.getUserProgress('user-123');
      if (userProgress) {
        console.log(`- Total Assessments: ${userProgress.totalAssessments}`);
        console.log(`- Average Score: ${userProgress.averageScore}%`);
        console.log(`- Skills: ${userProgress.skills.length}`);
      }

    } catch (error) {
      console.error('Error during evaluation:', error);
    }
  }

  console.log('\nDemo completed successfully!');
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };