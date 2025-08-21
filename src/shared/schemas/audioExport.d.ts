import { z } from 'zod';
export declare const TTSAudioFormat: z.ZodEnum<["mp3", "wav", "ogg", "m4a"]>;
export declare const TTSVoice: z.ZodEnum<["narrator_m", "narrator_f", "warm_f", "bright_m", "neutral_f"]>;
export declare const TTSProvider: z.ZodEnum<["openai", "dummy"]>;
export declare const AudioExportInputSchema: z.ZodEffects<z.ZodObject<{
    documentId: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
    voice: z.ZodDefault<z.ZodEnum<["narrator_m", "narrator_f", "warm_f", "bright_m", "neutral_f"]>>;
    format: z.ZodDefault<z.ZodEnum<["mp3", "wav", "ogg", "m4a"]>>;
    speed: z.ZodDefault<z.ZodNumber>;
    sampleRate: z.ZodDefault<z.ZodNumber>;
    language: z.ZodDefault<z.ZodString>;
    provider: z.ZodDefault<z.ZodEnum<["openai", "dummy"]>>;
}, "strip", z.ZodTypeAny, {
    format: "mp3" | "wav" | "ogg" | "m4a";
    voice: "narrator_m" | "narrator_f" | "warm_f" | "bright_m" | "neutral_f";
    speed: number;
    sampleRate: number;
    language: string;
    provider: "dummy" | "openai";
    text?: string | undefined;
    documentId?: string | undefined;
}, {
    text?: string | undefined;
    documentId?: string | undefined;
    format?: "mp3" | "wav" | "ogg" | "m4a" | undefined;
    voice?: "narrator_m" | "narrator_f" | "warm_f" | "bright_m" | "neutral_f" | undefined;
    speed?: number | undefined;
    sampleRate?: number | undefined;
    language?: string | undefined;
    provider?: "dummy" | "openai" | undefined;
}>, {
    format: "mp3" | "wav" | "ogg" | "m4a";
    voice: "narrator_m" | "narrator_f" | "warm_f" | "bright_m" | "neutral_f";
    speed: number;
    sampleRate: number;
    language: string;
    provider: "dummy" | "openai";
    text?: string | undefined;
    documentId?: string | undefined;
}, {
    text?: string | undefined;
    documentId?: string | undefined;
    format?: "mp3" | "wav" | "ogg" | "m4a" | undefined;
    voice?: "narrator_m" | "narrator_f" | "warm_f" | "bright_m" | "neutral_f" | undefined;
    speed?: number | undefined;
    sampleRate?: number | undefined;
    language?: string | undefined;
    provider?: "dummy" | "openai" | undefined;
}>;
export type AudioExportInput = z.infer<typeof AudioExportInputSchema>;
export declare const AudioExportResultSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    documentId: z.ZodOptional<z.ZodString>;
    objectKey: z.ZodString;
    signedUrl: z.ZodString;
    expiresAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    ok: true;
    objectKey: string;
    signedUrl: string;
    expiresAt: number;
    documentId?: string | undefined;
}, {
    ok: true;
    objectKey: string;
    signedUrl: string;
    expiresAt: number;
    documentId?: string | undefined;
}>;
export type AudioExportResult = z.infer<typeof AudioExportResultSchema>;
//# sourceMappingURL=audioExport.d.ts.map