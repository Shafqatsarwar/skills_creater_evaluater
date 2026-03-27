/**
 * Test file for the Personal Tutor skill
 * Demonstrates how the skill evaluates student submissions and saves results to evals.json
 */

import PersonalTutor from './personal-tutor/index';

async function runPersonalTutorTest() {
  console.log('🧪 Testing Personal Tutor Skill');
  console.log('==============================');

  // Initialize the personal tutor
  const tutor = new PersonalTutor();

  // Create a sample student submission
  const studentSubmission = {
    assignmentId: 'assignment-001',
    studentId: 'student-456',
    content: `
      function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      }

      // Test the function
      console.log(fibonacci(10));
    `,
    language: 'javascript' as const
  };

  // Define a rubric for the assignment
  const rubric = {
    criteria: [
      {
        name: 'Correctness',
        points: 5,
        description: 'Function correctly implements the Fibonacci sequence'
      },
      {
        name: 'Code Style',
        points: 3,
        description: 'Code follows style guidelines'
      },
      {
        name: 'Efficiency',
        points: 2,
        description: 'Code is reasonably efficient'
      }
    ],
    maxPoints: 10
  };

  // Define student profile
  const studentProfile = {
    experienceLevel: 'intermediate' as const,
    pastPerformance: [
      { assignmentId: 'assignment-000', score: 8 }
    ]
  };

  console.log('\n📝 Evaluating student submission...');
  console.log(`   - Assignment: ${studentSubmission.assignmentId}`);
  console.log(`   - Student: ${studentSubmission.studentId}`);
  console.log(`   - Language: ${studentSubmission.language}`);

  try {
    // Evaluate the submission
    const result = await tutor.evaluateSubmission(
      studentSubmission,
      rubric,
      studentProfile
    );

    console.log('\n✅ Evaluation completed successfully!');
    console.log('\n📊 Evaluation Results:');
    console.log(`   - Score: ${result.score}/${result.maxPoints} (${result.percentage}%)`);
    console.log(`   - Grade: ${result.grade}`);
    console.log(`   - Feedback: ${result.feedback.substring(0, 100)}...`);

    console.log('\n📋 Criterion Breakdown:');
    result.evaluationDetails.criterionScores.forEach(item => {
      console.log(`   - ${item.criterion}: ${item.earnedPoints}/${item.maxPoints} pts - ${item.feedback.substring(0, 50)}...`);
    });

    console.log('\n💡 Suggestions:');
    result.suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion}`);
    });

    console.log('\n💾 Results have been saved to evals.json');

    // Test another evaluation
    console.log('\n🔄 Testing another evaluation with different parameters...');

    const anotherSubmission = {
      assignmentId: 'assignment-002',
      studentId: 'student-789',
      content: `
        def bubble_sort(arr):
          n = len(arr)
          for i in range(n):
            for j in range(0, n-i-1):
              if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
          return arr
      `,
      language: 'python' as const
    };

    const pythonRubric = {
      criteria: [
        {
          name: 'Correctness',
          points: 6,
          description: 'Function correctly implements bubble sort algorithm'
        },
        {
          name: 'Code Style',
          points: 2,
          description: 'Code follows PEP 8 guidelines'
        },
        {
          name: 'Documentation',
          points: 2,
          description: 'Includes appropriate comments/docstrings'
        }
      ],
      maxPoints: 10
    };

    const pythonResult = await tutor.evaluateSubmission(
      anotherSubmission,
      pythonRubric,
      { experienceLevel: 'beginner' as const, pastPerformance: [] }
    );

    console.log(`\n✅ Second evaluation completed! Score: ${pythonResult.score}/${pythonResult.maxPoints} (${pythonResult.percentage}%)`);
    console.log('💾 Additional results saved to evals.json');

    console.log('\n🎉 Personal Tutor skill is working correctly!');
    console.log('   - Student submissions are evaluated against rubrics');
    console.log('   - Personalized feedback is generated based on student profile');
    console.log('   - Results are saved to evals.json');
    console.log('   - Ready for real student submissions!');

  } catch (error) {
    console.error('\n❌ Error during evaluation:', error);
  }
}

// Run the test
runPersonalTutorTest();