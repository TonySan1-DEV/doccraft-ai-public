import { z } from 'zod';

export const TTSAudioFormat = z.enum(['mp3', 'wav', 'ogg', 'm4a']);
export const TTSVoice = z.enum([
  // keep a compact, portable set; map to engine-specific ids in the adapter
  'narrator_m',
  'narrator_f',
  'warm_f',
  'bright_m',
  'neutral_f',
]);

export const TTSProvider = z.enum(['openai', 'dummy']); // extensible

export const AudioExportInputSchema = z
  .object({
    // Either documentId OR raw text must be provided.
    documentId: z.string().uuid().optional(),
    text: z.string().min(1).max(1_000_000).optional(),

    // Voice + rendering options
    voice: TTSVoice.default('narrator_f'),
    format: TTSAudioFormat.default('mp3'),
    speed: z.number().min(0.5).max(2.0).default(1.0),
    sampleRate: z.number().int().min(22050).max(48000).default(44100),

    // i18n hint (future use)
    language: z.string().min(2).max(10).default('en'),

    // engine selection (optional)
    provider: TTSProvider.default('openai'),
  })
  .refine(v => !!v.documentId || !!v.text, {
    message: 'Provide either documentId or text',
    path: ['text'],
  });

export type AudioExportInput = z.infer<typeof AudioExportInputSchema>;

export const AudioExportResultSchema = z.object({
  ok: z.literal(true),
  documentId: z.string().uuid().optional(),
  objectKey: z.string(),
  signedUrl: z.string(), // time-limited
  expiresAt: z.number(), // epoch seconds
});

export type AudioExportResult = z.infer<typeof AudioExportResultSchema>;
