const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const redis = new IORedis('redis://localhost:6379', { maxRetriesPerRequest: null });
const podcastQueue = new Queue('podcast-generation', { connection: redis });

async function main() {
  const today = new Date().toISOString().split('T')[0];
  const job = await podcastQueue.add('generate-daily-podcast', {
    problemId: '1',
    isDaily: true,
    dailyDate: today,
  });
  console.log('Job published:', job.id);
  await redis.quit();
  process.exit(0);
}

main().catch(console.error);
