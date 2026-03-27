interface StudentSubmission {
    assignmentId: string;
    studentId: string;
    content: string;
    language: 'javascript' | 'python' | 'java' | 'typescript' | 'html' | 'css';
}
interface RubricCriterion {
    name: string;
    points: number;
    description: string;
}
interface AssignmentRubric {
    criteria: RubricCriterion[];
    maxPoints: number;
}
interface StudentProfile {
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    pastPerformance: Array<{
        assignmentId: string;
        score: number;
    }>;
}
interface EvaluationResult {
    assignmentId: string;
    studentId: string;
    score: number;
    maxPoints: number;
    percentage: number;
    feedback: string;
    suggestions: string[];
    grade: string;
    evaluationDetails: {
        criterionScores: Array<{
            criterion: string;
            earnedPoints: number;
            maxPoints: number;
            feedback: string;
        }>;
    };
}
export declare class PersonalTutor {
    evaluateSubmission(studentSubmission: StudentSubmission, rubric: AssignmentRubric, studentProfile?: StudentProfile): Promise<EvaluationResult>;
    private checkSyntax;
    private evaluateAgainstRubric;
    private calculateGrade;
    private generatePersonalizedFeedback;
    private generateSuggestions;
    private saveEvaluationResult;
}
export default PersonalTutor;
//# sourceMappingURL=index.d.ts.map