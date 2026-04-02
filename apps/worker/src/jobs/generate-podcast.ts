import { Job } from 'bullmq';
import { PodcastEngine, LeetCodeProblem, StorageService } from '@leetcast/core';
import { prisma } from '@leetcast/database';
import fs from 'fs-extra';

export interface GeneratePodcastJobData {
  problemId: string;
  isDaily?: boolean;
  dailyDate?: string;
}

const engine = new PodcastEngine();

export async function generatePodcastJob(job: Job<GeneratePodcastJobData>) {
  const { problemId, isDaily, dailyDate } = job.data;

  await job.updateProgress(10);

  // 1. Fetch problem from DB
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) {
    throw new Error(`Problem ${problemId} not found`);
  }

  await job.updateProgress(20);

  // 2. Generate podcast
  const result = await engine.generatePodcast(problem as LeetCodeProblem);

  await job.updateProgress(70);

  // 3. Upload to storage
  const storageKey = `podcasts/${problemId}/${Date.now()}.mp3`;
  const audioUrl = await StorageService.uploadFile(result.audioPath, storageKey, 'audio/mpeg');

  await job.updateProgress(90);

  // 4. Save to DB
  // If this is daily, clear previous daily flag
  if (isDaily) {
    await prisma.podcast.updateMany({
      where: { isDaily: true },
      data: { isDaily: false },
    });
  }

  const podcast = await prisma.podcast.create({
    data: {
      problemId,
      title: result.title,
      audioUrl,
      duration: result.duration,
      transcript: result.transcript,
      chapters: result.chapters as any,
      isDaily: isDaily || false,
      dailyDate: dailyDate ? new Date(dailyDate) : null,
      status: 'ready',
    },
  });

  // 5. Cleanup temp files
  await fs.remove(result.audioPath).catch(() => {});

  await job.updateProgress(100);

  return { podcastId: podcast.id, audioUrl };
}
