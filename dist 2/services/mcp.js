"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPService = void 0;
const openai_1 = __importDefault(require("openai"));
const elevenlabs_1 = require("elevenlabs");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class MCPService {
    static openai = new openai_1.default({
        apiKey: process.env.OPENAI_API_KEY,
    });
    static elevenlabs = new elevenlabs_1.ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY,
    });
    static async generatePodcast(problem) {
        console.log(`[MCP] Requesting real podcast generation for: ${problem.title}...`);
        const apiKey = process.env.OPENAI_API_KEY;
        const elApiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey || !elApiKey) {
            console.warn('[MCP] Missing API keys, falling back to mock implementation.');
            return this.generateMockPodcast(problem);
        }
        try {
            const script = await this.generateScript(problem);
            const audioPath = await this.generateAudio(script, problem.id);
            return {
                problemId: problem.id,
                title: `LeetCast Episode ${problem.id}: ${problem.title}`,
                audioUrl: audioPath,
                duration: this.estimateDuration(script),
                transcript: script,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[MCP] Error in real generation: ${errorMessage}`);
            throw new Error(`Failed to generate podcast via MCP: ${errorMessage}`);
        }
    }
    static async generateScript(problem) {
        const prompt = `
    You are an expert technical podcast host. Create a 2-3 minute engaging podcast script explaining the LeetCode problem: "${problem.title}".
    
    Problem Description:
    ${problem.description}
    
    Difficulty: ${problem.difficulty}
    Topics: ${problem.topics.join(', ')}
    
    The script should:
    1. Start with a catchy intro: "Welcome to LeetCast! Today we're diving into..."
    2. Explain the problem clearly in plain English.
    3. Discuss the core intuition or a common approach (like ${problem.topics[0]}).
    4. Mention the time and space complexity.
    5. End with an encouraging outro.
    
    Format: Return ONLY the spoken text. No stage directions, no [Music], no host names. Just the words to be spoken.
    `;
        const response = await this.openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
        });
        const content = response.choices[0]?.message?.content;
        return content || '';
    }
    static async generateAudio(text, problemId) {
        const downloadDir = path_1.default.join(process.cwd(), 'downloads');
        await fs_extra_1.default.ensureDir(downloadDir);
        const fileName = `lc-${problemId}.mp3`;
        const filePath = path_1.default.join(downloadDir, fileName);
        if (await fs_extra_1.default.pathExists(filePath)) {
            return filePath;
        }
        const audioStream = await this.elevenlabs.generate({
            voice: process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpg8n9YZpUI0j',
            text: text,
            model_id: 'eleven_multilingual_v2',
        });
        if (Buffer.isBuffer(audioStream)) {
            await fs_extra_1.default.writeFile(filePath, audioStream);
        }
        else if (audioStream && typeof audioStream.pipe === 'function') {
            const fileStream = fs_extra_1.default.createWriteStream(filePath);
            await new Promise((resolve, reject) => {
                audioStream.pipe(fileStream);
                fileStream.on('finish', () => resolve());
                fileStream.on('error', reject);
            });
        }
        else {
            const response = audioStream;
            if (Buffer.isBuffer(response)) {
                await fs_extra_1.default.writeFile(filePath, response);
            }
            else if (response &&
                typeof response[Symbol.asyncIterator] === 'function') {
                const chunks = [];
                for await (const chunk of response) {
                    chunks.push(chunk);
                }
                await fs_extra_1.default.writeFile(filePath, Buffer.concat(chunks));
            }
        }
        return filePath;
    }
    static estimateDuration(text) {
        // Roughly 150 words per minute
        const words = text.split(/\s+/).length;
        const minutes = Math.floor(words / 150);
        const seconds = Math.floor((words % 150) / (150 / 60));
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    static generateMockPodcast(problem) {
        return {
            problemId: problem.id,
            title: `LeetCast Episode ${problem.id}: ${problem.title} (Mock)`,
            audioUrl: `https://example.com/audio/lc-${problem.id}.mp3`,
            duration: '1:30',
            transcript: `[MOCK] Welcome to LeetCast. Today we are discussing ${problem.title}. ${problem.description}...`,
        };
    }
}
exports.MCPService = MCPService;
//# sourceMappingURL=mcp.js.map