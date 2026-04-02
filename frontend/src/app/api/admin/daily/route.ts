import { NextRequest, NextResponse } from 'next/server';
import { StrategyEngine, StrategyType } from '@leetcast/database';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const podcastQueue = new Queue('podcast-generation', { connection: redis });

export async function POST(req: NextRequest) {
  // Simple admin token check
  const token = req.headers.get('x-admin-token');
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { strategy = 'progressive', userId, problemId } = body;

  const selectedProblemId =
    problemId || (await StrategyEngine.selectDailyProblem(strategy as StrategyType, userId));

  if (!selectedProblemId) {
    return NextResponse.json({ error: 'No problem found' }, { status: 404 });
  }

  const today = new Date().toISOString().split('T')[0];

  const job = await podcastQueue.add('generate-daily-podcast', {
    problemId: selectedProblemId,
    isDaily: true,
    dailyDate: today,
  });

  return NextResponse.json({ jobId: job.id, problemId: selectedProblemId });
}
