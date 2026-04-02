"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PodcastEngine = void 0;
const openai_1 = __importDefault(require("openai"));
const elevenlabs_1 = require("elevenlabs");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class PodcastEngine {
    openai = new openai_1.default({
        apiKey: process.env.OPENAI_API_KEY,
    });
    elevenlabs = new elevenlabs_1.ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY,
    });
    hostVoiceId = process.env.HOST_VOICE_ID || 'pNInz6obpg8n9YZpUI0j';
    engineerVoiceId = process.env.ENGINEER_VOICE_ID || 'onwK4e9ZLuTAKqW03Ge0';
    tempDir = path_1.default.join(process.cwd(), '.tmp', 'podcast-engine');
    assetsDir = path_1.default.join(process.cwd(), 'assets');
    async generatePodcast(problem) {
        await fs_extra_1.default.ensureDir(this.tempDir);
        await fs_extra_1.default.ensureDir(this.assetsDir);
        // 1. Generate dialogue script
        const script = await this.generateDialogueScript(problem);
        const lines = this.parseDialogue(script);
        // 2. Generate intro/outro if not cached
        const introPath = await this.ensureIntroOutro('intro');
        const outroPath = await this.ensureIntroOutro('outro');
        // 3. Generate audio for each dialogue line
        const segmentPaths = [];
        if (introPath)
            segmentPaths.push(introPath);
        let currentTime = introPath ? await this.getAudioDuration(introPath) : 0;
        const chapters = [];
        chapters.push({ time: 0, title: '开场' });
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const segmentPath = path_1.default.join(this.tempDir, `segment-${problem.id}-${i}.mp3`);
            await this.synthesizeSpeech(line.text, line.speaker === 'HOST' ? this.hostVoiceId : this.engineerVoiceId, segmentPath);
            segmentPaths.push(segmentPath);
            // Add chapter for problem introduction
            if (line.text.includes('今天我们要聊的是') || line.text.includes('Today we')) {
                chapters.push({ time: Math.floor(currentTime), title: '题目介绍' });
            }
            if (line.text.includes('思路') || line.text.includes('approach') || line.text.includes('怎么解')) {
                chapters.push({ time: Math.floor(currentTime), title: '解题思路' });
            }
            if (line.text.includes('复杂度') || line.text.includes('complexity')) {
                chapters.push({ time: Math.floor(currentTime), title: '复杂度分析' });
            }
            const duration = await this.getAudioDuration(segmentPath);
            currentTime += duration;
        }
        if (outroPath) {
            segmentPaths.push(outroPath);
            chapters.push({ time: Math.floor(currentTime), title: '结束语' });
        }
        // 4. Mix all segments with FFmpeg
        const outputPath = path_1.default.join(this.tempDir, `podcast-${problem.id}.mp3`);
        await this.mixSegments(segmentPaths, outputPath);
        // 5. Add BGM if available
        const bgmPath = await this.ensureBGM(problem.difficulty);
        const finalPath = bgmPath ? await this.mixWithBGM(outputPath, bgmPath, problem.id) : outputPath;
        const duration = await this.getAudioDuration(finalPath);
        return {
            title: `LeetCast 每日一题 | ${problem.id}. ${problem.title}`,
            transcript: lines.map((l) => `${l.speaker === 'HOST' ? '主持人' : '工程师'}：${l.text}`).join('\n\n'),
            duration: Math.ceil(duration),
            audioPath: finalPath,
            chapters: this.dedupChapters(chapters),
        };
    }
    async generateDialogueScript(problem) {
        const prompt = `
你是一位顶级技术播客制作人。请为 LeetCode 题目 "${problem.title}" 创作一段 5-8 分钟的双人对话播客脚本。

题目信息：
- 难度：${problem.difficulty}
- 标签：${problem.topics.join(', ')}
- 题目描述：${problem.description}

角色设定：
- HOST（主持人）：热情、善于引导、会用通俗语言总结。声音用 [HOST] 标记。
- ENGINEER（资深工程师）：技术深厚、讲解清晰、偶尔会分享实战经验和踩坑。声音用 [ENGINEER] 标记。

脚本要求：
1. 开场 [HOST] 欢迎听众，介绍今天题目。
2. [HOST] 用 1-2 句话概括题目要解决的问题。
3. [ENGINEER] 讲解核心思路，包括为什么这样想、关键步骤、边界条件。
4. [HOST] 适时提问，推动对话深入（如"时间复杂度怎么样？""有没有更优解？"）。
5. [ENGINEER] 给出代码 walkthrough 的文字版（不要贴代码块，而是用自然语言描述关键几行在做什么）。
6. [ENGINEER] 分析时间和空间复杂度。
7. [HOST] 总结今日要点，鼓励听众坚持打卡。

格式要求：
- 每一行必须以 [HOST] 或 [ENGINEER] 开头。
- 只输出对话台词，不要任何场景描述、括号提示、markdown 格式。
- 每段台词不要太长，适合口语表达，自然有停顿感。
- 总字数控制在 800-1200 字之间。
`;
        const response = await this.openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
        });
        return response.choices[0]?.message?.content || '';
    }
    parseDialogue(script) {
        const lines = [];
        const rawLines = script.split('\n').filter((l) => l.trim().length > 0);
        for (const line of rawLines) {
            const hostMatch = line.match(/^\[HOST\]\s*:?\s*(.+)$/i);
            const engineerMatch = line.match(/^\[ENGINEER\]\s*:?\s*(.+)$/i);
            if (hostMatch) {
                lines.push({ speaker: 'HOST', text: hostMatch[1].trim() });
            }
            else if (engineerMatch) {
                lines.push({ speaker: 'ENGINEER', text: engineerMatch[1].trim() });
            }
        }
        return lines;
    }
    async synthesizeSpeech(text, voiceId, outputPath) {
        if (await fs_extra_1.default.pathExists(outputPath))
            return;
        const audioStream = await this.elevenlabs.generate({
            voice: voiceId,
            text,
            model_id: 'eleven_multilingual_v2',
        });
        if (Buffer.isBuffer(audioStream)) {
            await fs_extra_1.default.writeFile(outputPath, audioStream);
        }
        else if (audioStream && typeof audioStream.pipe === 'function') {
            const fileStream = fs_extra_1.default.createWriteStream(outputPath);
            await new Promise((resolve, reject) => {
                audioStream.pipe(fileStream);
                fileStream.on('finish', resolve);
                fileStream.on('error', reject);
            });
        }
        else if (audioStream &&
            typeof audioStream[Symbol.asyncIterator] === 'function') {
            const chunks = [];
            for await (const chunk of audioStream) {
                chunks.push(chunk);
            }
            await fs_extra_1.default.writeFile(outputPath, Buffer.concat(chunks));
        }
        else {
            throw new Error('Unexpected audio stream type from ElevenLabs');
        }
    }
    async ensureIntroOutro(type) {
        if (!process.env.ELEVENLABS_API_KEY)
            return undefined;
        const filePath = path_1.default.join(this.assetsDir, `${type}.mp3`);
        if (await fs_extra_1.default.pathExists(filePath))
            return filePath;
        const text = type === 'intro'
            ? '欢迎收听 LeetCast 每日一题，这里是主持人小播。每天五分钟，带你听懂一道 LeetCode。准备好了吗？我们开始吧！'
            : '好了，以上就是今天的全部内容。记得打开 LeetCast 完成今日打卡，我们明天见！';
        await this.synthesizeSpeech(text, this.hostVoiceId, filePath);
        return filePath;
    }
    async ensureBGM(difficulty) {
        // For MVP, we generate simple ambient pads with ffmpeg if no BGM file exists.
        // In production, replace with real royalty-free music files.
        const filePath = path_1.default.join(this.assetsDir, `bgm-${difficulty.toLowerCase()}.mp3`);
        if (await fs_extra_1.default.pathExists(filePath))
            return filePath;
        // Generate a 30-second ambient pad using ffmpeg sine waves
        // Easy: calm major feel, Medium: neutral, Hard: darker minor feel
        const freq = difficulty === 'Easy' ? '392,523.25' : difficulty === 'Medium' ? '440,554.37' : '329.63,392';
        const tempo = difficulty === 'Easy' ? '0.8' : difficulty === 'Medium' ? '1.0' : '1.2';
        try {
            await execAsync(`ffmpeg -f lavfi -i "sine=frequency=${freq.split(',')[0]}:duration=30" -f lavfi -i "sine=frequency=${freq.split(',')[1]}:duration=30" -filter_complex "[0:a][1:a]amix=inputs=2:duration=longest,volume=0.05,afade=t=out:st=25:d=5" -t 30 -y "${filePath}"`);
            return filePath;
        }
        catch {
            return undefined;
        }
    }
    async getAudioDuration(filePath) {
        try {
            const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
            return parseFloat(stdout.trim()) || 0;
        }
        catch {
            return 0;
        }
    }
    async mixSegments(segmentPaths, outputPath) {
        const listFile = path_1.default.join(this.tempDir, `concat-${Date.now()}.txt`);
        const listContent = segmentPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
        await fs_extra_1.default.writeFile(listFile, listContent);
        await execAsync(`ffmpeg -f concat -safe 0 -i "${listFile}" -acodec libmp3lame -q:a 2 -y "${outputPath}"`);
        await fs_extra_1.default.remove(listFile);
    }
    async mixWithBGM(voicePath, bgmPath, problemId) {
        const outputPath = path_1.default.join(this.tempDir, `podcast-${problemId}-final.mp3`);
        const voiceDuration = await this.getAudioDuration(voicePath);
        // Loop and fade BGM to match voice duration, keep BGM at low volume (-25dB)
        await execAsync(`ffmpeg -i "${voicePath}" -i "${bgmPath}" -filter_complex "[1:a]aloop=loop=-1:size=2e+09,afade=t=out:st=${Math.max(0, voiceDuration - 3)}:d=3,volume=-25dB[bgm];[0:a][bgm]amix=inputs=2:duration=first" -ac 2 -y "${outputPath}"`);
        return outputPath;
    }
    dedupChapters(chapters) {
        const seen = new Set();
        return chapters.filter((c) => {
            const key = `${c.time}-${c.title}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
}
exports.PodcastEngine = PodcastEngine;
//# sourceMappingURL=podcast-engine.js.map