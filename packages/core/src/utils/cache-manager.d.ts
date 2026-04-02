import { LeetCodeProblem } from '../types/leetcode';
export declare class CacheManager {
    private static readonly CACHE_DIR;
    private static readonly CACHE_FILE;
    static loadCache(): Promise<LeetCodeProblem[]>;
    static saveCache(problems: LeetCodeProblem[]): Promise<void>;
    static clearCache(): Promise<void>;
    static getCachePath(): string;
}
//# sourceMappingURL=cache-manager.d.ts.map