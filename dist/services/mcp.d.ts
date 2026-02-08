import { LeetCodeProblem } from './leetcode';
export interface PodcastEpisode {
    problemId: string;
    title: string;
    audioUrl: string;
    duration: string;
    transcript: string;
}
export declare class MCPService {
    private static MCP_ENDPOINT;
    static generatePodcast(problem: LeetCodeProblem): Promise<PodcastEpisode>;
}
