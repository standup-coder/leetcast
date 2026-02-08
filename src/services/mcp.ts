import axios from 'axios';
import { LeetCodeProblem } from './leetcode';
import OpenAI from 'openai';
import { ElevenLabsClient } from 'elevenlabs';
import fs from 'fs-extra';
import path from 'path';

export interface PodcastEpisode {
  problemId: string;
  title: string;
  audioUrl: string;
  duration: string;
  transcript: string;
}

export class MCPService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private static elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  static async generatePodcast(problem: LeetCodeProblem): Promise<PodcastEpisode> {
    console.log(`[MCP] Requesting real podcast generation for: ${problem.title}...`);

    const apiKey = process.env.OPENAI_API_KEY;
    const elApiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey || !elApiKey) {
      console.warn('[MCP] Missing API keys, falling back to mock implementation.');
      return this.generateMockPodcast(problem);
    }

    try {
      // 1. Generate Script using OpenAI
      const script = await this.generateScript(problem);

      // 2. Generate Audio using ElevenLabs
      const audioPath = await this.generateAudio(script, problem.id);

      return {
        problemId: problem.id,
        title: `LeetCast Episode ${problem.id}: ${problem.title}`,
        audioUrl: audioPath, // Return local path
        duration: this.estimateDuration(script),
        transcript: script
      };
    } catch (error) {
      console.error(`[MCP] Error in real generation: ${error}`);
      throw new Error(`Failed to generate podcast via MCP: ${error}`);
    }
  }

  private static async generateScript(problem: LeetCodeProblem): Promise<string> {
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
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content || "";
  }

  private static async generateAudio(text: string, problemId: string): Promise<string> {
    const downloadDir = path.join(process.cwd(), 'downloads');
    await fs.ensureDir(downloadDir);
    const fileName = `lc-${problemId}.mp3`;
    const filePath = path.join(downloadDir, fileName);

    // If already exists, skip generation (cache)
    if (await fs.pathExists(filePath)) {
      return filePath;
    }

    const audioStream = await this.elevenlabs.generate({
      voice: process.env.ELEVENLABS_VOICE_ID || "pNInz6obpg8n9YZpUI0j",
      text: text,
      model_id: "eleven_multilingual_v2",
    });

    // Handle different return types from ElevenLabs SDK
    if (Buffer.isBuffer(audioStream)) {
      await fs.writeFile(filePath, audioStream);
    } else if (typeof (audioStream as any).pipe === 'function') {
      const fileStream = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        (audioStream as any).pipe(fileStream);
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });
    } else {
      // It might be a web ReadableStream or something else
      const response = await (audioStream as any);
      if (response instanceof Buffer) {
        await fs.writeFile(filePath, response);
      } else {
        // Fallback for newer SDK versions that might return a stream/blob
        const chunks = [];
        for await (const chunk of audioStream as any) {
          chunks.push(chunk);
        }
        await fs.writeFile(filePath, Buffer.concat(chunks));
      }
    }

    return filePath;
  }

  private static estimateDuration(text: string): string {
    // Roughly 150 words per minute
    const words = text.split(/\s+/).length;
    const minutes = Math.floor(words / 150);
    const seconds = Math.floor((words % 150) / (150 / 60));
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private static generateMockPodcast(problem: LeetCodeProblem): PodcastEpisode {
    return {
      problemId: problem.id,
      title: `LeetCast Episode ${problem.id}: ${problem.title} (Mock)`,
      audioUrl: `https://example.com/audio/lc-${problem.id}.mp3`,
      duration: "1:30",
      transcript: `[MOCK] Welcome to LeetCast. Today we are discussing ${problem.title}. ${problem.description}...`
    };
  }
}
