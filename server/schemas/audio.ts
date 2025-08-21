import { z } from 'zod';

export const AUDIO_MAX_TEXT = 20_000 as const;

export const AudioExportSchema = z.object({
  provider: z.literal('openai').default('openai'), // keep others behind dev if you have them
  text: z.string().min(1, 'Text cannot be empty'),
  voice: z
    .enum(['narrator_m', 'narrator_f', 'warm_f', 'bright_m', 'neutral_f'])
    .default('narrator_f'),
  format: z.enum(['mp3', 'wav', 'ogg', 'm4a']).default('mp3'),
  speed: z
    .number()
    .min(0.5, 'Speed must be at least 0.5x')
    .max(2.0, 'Speed cannot exceed 2.0x')
    .optional(),
  sampleRate: z.enum(['22050', '24000', '44100']).transform(Number).optional(),
  language: z
    .string()
    .min(2, 'Language code must be at least 2 characters')
    .max(10, 'Language code cannot exceed 10 characters')
    .optional(),
});

export type AudioExportInput = z.infer<typeof AudioExportSchema>;
