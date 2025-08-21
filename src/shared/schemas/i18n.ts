import { z } from 'zod';

export const Locale = z.enum(['en', 'es', 'fr']);

export const TranslationItemSchema = z.object({
  key: z.string().min(1), // e.g., "nav.home" or "builder.generate"
  fallback: z.string().min(1), // default English string or existing copy
});

export const TranslationRequestSchema = z.object({
  target: Locale, // desired output locale
  items: z.array(TranslationItemSchema).min(1).max(500),
  // optional hinting fields for agentics later
  domain: z.string().max(64).optional(), // "ui" | "builder" | "errors" ...
  tone: z.string().max(64).optional(), // "neutral", "friendly"
});

export const TranslationResponseSchema = z.object({
  ok: z.literal(true),
  locale: Locale,
  items: z.array(
    z.object({
      key: z.string(),
      text: z.string(), // translated text
    })
  ),
});

export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;
export type TranslationResponse = z.infer<typeof TranslationResponseSchema>;
export type SupportedLocale = z.infer<typeof Locale>;
