"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalTutor = void 0;
class PersonalTutor {
    async evaluateSubmission(studentSubmission, rubric, studentProfile = {
        experienceLevel: 'beginner',
        pastPerformance: []
    }) {
        console.log(`Evaluating submission for student ${studentSubmission.studentId} on assignment ${studentSubmission.assignmentId}`);
        const syntaxIssues = this.checkSyntax(studentSubmission.content, studentSubmission.language);
        const criterionScores = await this.evaluateAgainstRubric(studentSubmission, rubric, syntaxIssues);
        const totalEarnedPoints = criterionScores.reduce((sum, item) => sum + item.earnedPoints, 0);
        const totalPossiblePoints = rubric.maxPoints;
        const percentage = Math.round((totalEarnedPoints / totalPossiblePoints) * 100);
        const grade = this.calculateGrade(percentage);
        const feedback = this.generatePersonalizedFeedback(studentSubmission, criterionScores, studentProfile, percentage);
        const suggestions = this.generateSuggestions(criterionScores, syntaxIssues, studentProfile);
        const result = {
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
        await this.saveEvaluationResult(result);
        return result;
    }
    checkSyntax(content, language) {
        const issues = [];
        switch (language) {
            case 'javascript':
            case 'typescript':
                if (/(var|let|const)\s+[A-Z]/.test(content)) {
                    issues.push("Variable names should typically start with lowercase letters");
                }
                if (content.includes('==') && !content.includes('===') && !content.includes('!==')) {
                    issues.push("Use strict equality (===) instead of loose equality (==)");
                }
                break;
            case 'python':
                if (/^ + +/gm.test(content)) {
                    issues.push("Inconsistent indentation detected");
                }
                break;
            case 'java':
                if (!content.trim().endsWith('}')) {
                    issues.push("Missing closing brace at end of class/file");
                }
                break;
            case 'html':
                if (content.includes('<') && !content.includes('>')) {
                    issues.push("Unclosed HTML tags detected");
                }
                break;
            case 'css':
                if (content.includes('{') && !content.includes('}')) {
                    issues.push("Unclosed CSS blocks detected");
                }
                break;
        }
        return issues;
    }
    async evaluateAgainstRubric(submission, rubric, syntaxIssues) {
        const results = [];
        for (const criterion of rubric.criteria) {
            let earnedPoints = criterion.points;
            let feedback = `Met the requirements for ${criterion.name}`;
            switch (criterion.name.toLowerCase()) {
                case 'correctness':
                case 'functionality':
                    if (syntaxIssues.length > 0) {
                        earnedPoints = Math.max(0, criterion.points - (syntaxIssues.length * 0.5));
                        feedback = `Has syntax issues but meets basic functionality: ${syntaxIssues.join(', ')}`;
                    }
                    break;
                case 'code style':
                case 'style':
                    if (syntaxIssues.length > 0) {
                        earnedPoints = Math.max(0, criterion.points - (syntaxIssues.length * 0.3));
                        feedback = `Could improve style based on syntax issues: ${syntaxIssues.join(', ')}`;
                    }
                    break;
                case 'efficiency':
                case 'performance':
                    feedback = `Basic efficiency check completed`;
                    break;
                case 'documentation':
                case 'comments':
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
                earnedPoints: Math.round(earnedPoints * 100) / 100,
                maxPoints: criterion.points,
                feedback
            });
        }
        return results;
    }
    calculateGrade(percentage) {
        if (percentage >= 90)
            return 'A';
        if (percentage >= 80)
            return 'B';
        if (percentage >= 70)
            return 'C';
        if (percentage >= 60)
            return 'D';
        return 'F';
    }
    generatePersonalizedFeedback(submission, criterionScores, studentProfile, percentage) {
        let feedback = `Your submission for assignment ${submission.assignmentId} has been evaluated. `;
        if (percentage >= 90) {
            feedback += "Excellent work! Your solution demonstrates strong understanding.";
        }
        else if (percentage >= 80) {
            feedback += "Good job! Your solution meets most requirements.";
        }
        else if (percentage >= 70) {
            feedback += "Satisfactory work. You've met the basic requirements.";
        }
        else {
            feedback += "Needs improvement. Review the feedback below.";
        }
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
        if (studentProfile.experienceLevel === 'beginner') {
            feedback += " As a beginner, focus on understanding the fundamental concepts.";
        }
        else if (studentProfile.experienceLevel === 'intermediate') {
            feedback += " As an intermediate learner, try incorporating more advanced patterns.";
        }
        else {
            feedback += " As an advanced learner, consider optimizing for performance and maintainability.";
        }
        return feedback;
    }
    generateSuggestions(criterionScores, syntaxIssues, studentProfile) {
        const suggestions = [];
        if (syntaxIssues.length > 0) {
            suggestions.push(`Fix the following syntax issues: ${syntaxIssues.join(', ')}`);
        }
        for (const item of criterionScores) {
            if (item.earnedPoints < item.maxPoints * 0.7) {
                suggestions.push(`Improve in ${item.criterion}: ${item.feedback}`);
            }
        }
        if (studentProfile.experienceLevel === 'beginner') {
            suggestions.push("Review fundamental concepts related to this assignment");
            suggestions.push("Practice with simpler examples before attempting complex problems");
        }
        else if (studentProfile.experienceLevel === 'intermediate') {
            suggestions.push("Consider more efficient algorithms or design patterns");
            suggestions.push("Review best practices for code organization");
        }
        else {
            suggestions.push("Focus on optimization and edge case handling");
            suggestions.push("Consider performance implications of your implementation");
        }
        return suggestions;
    }
    async saveEvaluationResult(result) {
        console.log(`Saving evaluation result to evals.json for student ${result.studentId}`);
        const fs = require('fs').promises;
        let evalsData = { evaluations: [], skills: [] };
        try {
            const existingData = await fs.readFile('./evals.json', 'utf8');
            evalsData = JSON.parse(existingData);
        }
        catch (error) {
            console.log('evals.json not found, starting with empty structure');
        }
        if (!evalsData.evaluations) {
            evalsData.evaluations = [];
        }
        evalsData.evaluations.push({
            id: `eval-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...result
        });
        if (!evalsData.skills) {
            evalsData.skills = [];
        }
        if (!evalsData.skills.some((skill) => skill.name === 'personal-tutor')) {
            evalsData.skills.push({
                name: 'personal-tutor',
                version: '1.0.0',
                description: 'Personal Tutor skill that evaluates student submissions and provides personalized feedback',
                author: 'Panaverse',
                createdDate: new Date().toISOString()
            });
        }
        await fs.writeFile('./evals.json', JSON.stringify(evalsData, null, 2));
        console.log('Evaluation result saved to evals.json');
    }
}
exports.PersonalTutor = PersonalTutor;
exports.default = PersonalTutor;
//# sourceMappingURL=index.js.map