"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioExportResultSchema = exports.AudioExportInputSchema = exports.TTSProvider = exports.TTSVoice = exports.TTSAudioFormat = void 0;
const zod_1 = require("zod");
exports.TTSAudioFormat = zod_1.z.enum(['mp3', 'wav', 'ogg', 'm4a']);
exports.TTSVoice = zod_1.z.enum([
    // keep a compact, portable set; map to engine-specific ids in the adapter
    'narrator_m',
    'narrator_f',
    'warm_f',
    'bright_m',
    'neutral_f',
]);
exports.TTSProvider = zod_1.z.enum(['openai', 'dummy']); // extensible
exports.AudioExportInputSchema = zod_1.z
    .object({
    // Either documentId OR raw text must be provided.
    documentId: zod_1.z.string().uuid().optional(),
    text: zod_1.z.string().min(1).max(1000000).optional(),
    // Voice + rendering options
    voice: exports.TTSVoice.default('narrator_f'),
    format: exports.TTSAudioFormat.default('mp3'),
    speed: zod_1.z.number().min(0.5).max(2.0).default(1.0),
    sampleRate: zod_1.z.number().int().min(22050).max(48000).default(44100),
    // i18n hint (future use)
    language: zod_1.z.string().min(2).max(10).default('en'),
    // engine selection (optional)
    provider: exports.TTSProvider.default('openai'),
})
    .refine(v => !!v.documentId || !!v.text, {
    message: 'Provide either documentId or text',
    path: ['text'],
});
exports.AudioExportResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    documentId: zod_1.z.string().uuid().optional(),
    objectKey: zod_1.z.string(),
    signedUrl: zod_1.z.string(), // time-limited
    expiresAt: zod_1.z.number(), // epoch seconds
});
//# sourceMappingURL=audioExport.js.map