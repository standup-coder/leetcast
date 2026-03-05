import { LeetCodeProblem } from '../types/leetcode';
export interface PodcastEpisode {
    problemId: string;
    title: string;
    audioUrl: string;
    duration: string;
    transcript: string;
}
export declare class MCPService {
    private static openai;
    private static elevenlabs;
    static generatePodcast(problem: LeetCodeProblem): Promise<PodcastEpisode>;
    private static generateScript;
    private static generateAudio;
    private static estimateDuration;
    private static generateMockPodcast;
}
//# sourceMappingURL=mcp.d.ts.map