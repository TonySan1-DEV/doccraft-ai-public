import type { TTSInput, TTSResult } from '../adapters/tts.openai';
import { openAITts } from '../adapters/tts.openai';
import { safeObjectKey, clamp } from '../util/sanitize';

type ExportArgs = TTSInput & {
  userId: string;
  objectPrefix?: string;
};

export async function exportAudioWithOpenAI(
  args: ExportArgs
): Promise<{ url: string }> {
  if (process.env.FEATURE_AUDIOBOOK !== 'true') {
    throw new Error('Audiobook feature disabled');
  }

  // Numeric clamp reuse - ensure parameters stay within OpenAI's valid ranges
  const speed = clamp(args.speed ?? 1.0, 0.5, 2.0);
  const sampleRate = clamp(args.sampleRate ?? 24000, 8_000, 48_000);

  const start = Date.now();
  const tts: TTSResult = await openAITts({ ...args, speed, sampleRate });

  // Mock storage for testing - just return a mock URL
  const key = safeObjectKey(
    args.objectPrefix ?? 'audiobook',
    `${Date.now()}_${Math.random().toString(36).slice(2)}.${tts.ext}`
  );

  // Observability breadcrumbs
  console.info('[tts.openai.mock] upload_ok', {
    key,
    ms: Date.now() - start,
    fmt: args.format,
    voice: args.voice,
    bytes: tts.stream.readableLength || 'unknown',
  });

  // Return mock URL for testing
  return { url: `https://mock-storage.example.com/${key}` };
}
