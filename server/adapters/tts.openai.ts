import type { Readable } from 'stream';
import { Readable as NodeReadable } from 'stream';

export type TTSInput = {
  text: string;
  voice: 'narrator_m' | 'narrator_f' | 'warm_f' | 'bright_m' | 'neutral_f';
  format: 'mp3' | 'wav' | 'ogg' | 'm4a';
  speed?: number; // 0.5..2.0
  sampleRate?: number; // 22050 / 24000 / 44100
  language?: string; // e.g., "en"
};

export type TTSResult = {
  stream: Readable;
  contentType: string;
  ext: string; // "mp3" | ...
};

const VOICE_MAP: Record<TTSInput['voice'], string> = {
  narrator_m: 'alloy',
  narrator_f: 'verse',
  warm_f: 'aria',
  bright_m: 'orion',
  neutral_f: 'sol',
};

const FORMAT_MAP: Record<TTSInput['format'], { mime: string; ext: string }> = {
  mp3: { mime: 'audio/mpeg', ext: 'mp3' },
  wav: { mime: 'audio/wav', ext: 'wav' },
  ogg: { mime: 'audio/ogg', ext: 'ogg' },
  m4a: { mime: 'audio/mp4', ext: 'm4a' },
};

// Minimal REST call (no SDK) to keep deps light.
export async function openAITts(input: TTSInput): Promise<TTSResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');

  // Size guard: cap text length to prevent abuse
  if (input.text.length > 20_000) {
    throw new Error('Text too long (max 20,000 characters)');
  }

  const voice = VOICE_MAP[input.voice] ?? 'alloy';
  const fmt = FORMAT_MAP[input.format] ?? FORMAT_MAP.mp3;

  // Clamp speed to prevent extreme values
  const clampedSpeed = Math.min(2.0, Math.max(0.5, input.speed ?? 1.0));

  // Add timeout to prevent hung sockets
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 30000); // 30s timeout

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: input.text.slice(0, 20_000), // Double-check slice
        voice,
        format: input.format,
        speed: clampedSpeed,
        sample_rate: input.sampleRate ?? 24000,
        language: input.language ?? 'en',
      }),
      signal: ctl.signal,
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => '');
      throw new Error(`OpenAI TTS failed: ${res.status} ${errTxt}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = NodeReadable.from(buffer);

    return { stream, contentType: fmt.mime, ext: fmt.ext };
  } finally {
    clearTimeout(t);
  }
}
