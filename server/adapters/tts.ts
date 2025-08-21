export interface TTSOptions {
  voice: 'narrator_m' | 'narrator_f' | 'warm_f' | 'bright_m' | 'neutral_f';
  format: 'mp3' | 'wav' | 'ogg' | 'm4a';
  speed: number;
  sampleRate: number;
  language: string;
}

export interface TTSEngine {
  synthesize(text: string, opts: TTSOptions): Promise<Uint8Array>; // audio bytes
  contentType(format: TTSOptions['format']): string; // e.g. audio/mpeg
}

/** OpenAI-backed implementation: swap the exact API call in your codebase as needed. */
export function makeOpenAITTSEngine(): TTSEngine {
  // Lazy import to keep cold paths light; implement with your existing OpenAI client
  const mapVoice = (v: TTSOptions['voice']) => {
    // map our abstract names to specific provider ids
    switch (v) {
      case 'narrator_f':
        return 'alloy'; // example id
      case 'narrator_m':
        return 'echo';
      case 'warm_f':
        return 'nova';
      case 'bright_m':
        return 'onyx';
      case 'neutral_f':
        return 'shimmer';
    }
  };

  return {
    async synthesize(text, opts) {
      // Replace this with the concrete call your codebase uses for OpenAI TTS.
      // Here we keep it abstract to avoid pinning to a moving API.
      // Expected: returns raw audio bytes in the requested format.
      const voiceId = mapVoice(opts.voice);
      // --- PSEUDO-IMPLEMENTATION (replace):
      // const result = await openai.audio.speech.create({
      //   model: "tts-1",
      //   voice: voiceId,
      //   input: text,
      //   response_format: opts.format,
      //   speed: opts.speed,
      // });
      // return new Uint8Array(await result.arrayBuffer());

      // For now, throw if not wired:
      throw new Error('OpenAI TTS not wired: replace adapter with real call.');
    },
    contentType(format) {
      switch (format) {
        case 'mp3':
          return 'audio/mpeg';
        case 'wav':
          return 'audio/wav';
        case 'ogg':
          return 'audio/ogg';
        case 'm4a':
          return 'audio/mp4';
      }
    },
  };
}

/** Dummy engine for tests/dev. */
export function makeDummyTTSEngine(): TTSEngine {
  return {
    async synthesize(text, _opts) {
      // tiny WAV header + silence to keep tests fast
      // This is a minimal valid WAV file with 1 second of silence at 44.1kHz
      const sampleRate = 44100;
      const duration = 1; // 1 second
      const numSamples = sampleRate * duration;
      const dataSize = numSamples * 2; // 16-bit samples
      const fileSize = 36 + dataSize;

      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);

      // WAV header
      view.setUint32(0, 0x52494646, false); // "RIFF"
      view.setUint32(4, fileSize, true); // File size
      view.setUint32(8, 0x57415645, false); // "WAVE"
      view.setUint32(12, 0x666d7420, false); // "fmt "
      view.setUint32(16, 16, true); // Chunk size
      view.setUint16(20, 1, true); // Audio format (PCM)
      view.setUint16(22, 1, true); // Channels
      view.setUint32(24, sampleRate, true); // Sample rate
      view.setUint32(28, sampleRate * 2, true); // Byte rate
      view.setUint16(32, 2, true); // Block align
      view.setUint16(34, 16, true); // Bits per sample
      view.setUint32(36, 0x64617461, false); // "data"
      view.setUint32(40, dataSize, true); // Data size

      // Fill with silence (zeros)
      for (let i = 44; i < buffer.byteLength; i++) {
        view.setUint8(i, 0);
      }

      return new Uint8Array(buffer);
    },
    contentType() {
      return 'audio/wav';
    },
  };
}
