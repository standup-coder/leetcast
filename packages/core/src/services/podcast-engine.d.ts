import { LeetCodeProblem } from '../types/leetcode';
export interface DialogueLine {
    speaker: 'HOST' | 'ENGINEER';
    text: string;
}
export interface PodcastGenerationResult {
    title: string;
    transcript: string;
    duration: number;
    audioPath: string;
    chapters: Array<{
        time: number;
        title: string;
    }>;
}
export declare class PodcastEngine {
    private openai;
    private elevenlabs;
    private hostVoiceId;
    private engineerVoiceId;
    private tempDir;
    private assetsDir;
    generatePodcast(problem: LeetCodeProblem): Promise<PodcastGenerationResult>;
    private generateDialogueScript;
    private parseDialogue;
    private synthesizeSpeech;
    private ensureIntroOutro;
    private ensureBGM;
    private getAudioDuration;
    private mixSegments;
    private mixWithBGM;
    private dedupChapters;
}
//# sourceMappingURL=podcast-engine.d.ts.map