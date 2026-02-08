export interface LeetCodeProblem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topics: string[];
    description: string;
    acceptanceRate: string;
}
export declare class LeetCodeService {
    private static problems;
    static getPopularProblems(): Promise<LeetCodeProblem[]>;
    static getProblemById(id: string): Promise<LeetCodeProblem | undefined>;
    static searchProblems(query: string): Promise<LeetCodeProblem[]>;
}
