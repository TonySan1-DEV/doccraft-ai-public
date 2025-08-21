"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationResponseSchema = exports.TranslationRequestSchema = exports.TranslationItemSchema = exports.Locale = void 0;
const zod_1 = require("zod");
exports.Locale = zod_1.z.enum(['en', 'es', 'fr']);
exports.TranslationItemSchema = zod_1.z.object({
    key: zod_1.z.string().min(1), // e.g., "nav.home" or "builder.generate"
    fallback: zod_1.z.string().min(1), // default English string or existing copy
});
exports.TranslationRequestSchema = zod_1.z.object({
    target: exports.Locale, // desired output locale
    items: zod_1.z.array(exports.TranslationItemSchema).min(1).max(500),
    // optional hinting fields for agentics later
    domain: zod_1.z.string().max(64).optional(), // "ui" | "builder" | "errors" ...
    tone: zod_1.z.string().max(64).optional(), // "neutral", "friendly"
});
exports.TranslationResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    locale: exports.Locale,
    items: zod_1.z.array(zod_1.z.object({
        key: zod_1.z.string(),
        text: zod_1.z.string(), // translated text
    })),
});
//# sourceMappingURL=i18n.js.map