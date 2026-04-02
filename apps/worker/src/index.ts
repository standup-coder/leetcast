import 'dotenv/config';
import './lib/queue';
import { podcastQueue } from './lib/queue';

async function main() {
  console.log('[Worker] LeetCast worker started');
  console.log('[Worker] Listening for podcast generation jobs...');

  // Keep alive
  await new Promise(() => {});
}

main().catch(console.error);
