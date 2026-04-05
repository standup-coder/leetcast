import { LeetCodeProblem } from '../types/leetcode';
export declare class LeetCodeService {
    private static mockProblems;
    private static getProblems;
    static getPopularProblems(): Promise<LeetCodeProblem[]>;
    static getProblemById(id: string): Promise<LeetCodeProblem | undefined>;
    static searchProblems(query: string): Promise<LeetCodeProblem[]>;
}
//# sourceMappingURL=leetcode.d.ts.map