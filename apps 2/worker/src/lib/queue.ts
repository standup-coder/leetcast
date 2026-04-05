import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { generatePodcastJob } from '../jobs/generate-podcast';

const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const podcastQueue = new Queue('podcast-generation', { connection: redis });

export const podcastWorker = new Worker(
  'podcast-generation',
  async (job) => {
    return generatePodcastJob(job);
  },
  { connection: redis }
);

podcastWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`, job.returnvalue);
});

podcastWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed`, err);
});
