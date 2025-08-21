import { z } from 'zod';
export declare const Locale: z.ZodEnum<["en", "es", "fr"]>;
export declare const TranslationItemSchema: z.ZodObject<{
    key: z.ZodString;
    fallback: z.ZodString;
}, "strip", z.ZodTypeAny, {
    key: string;
    fallback: string;
}, {
    key: string;
    fallback: string;
}>;
export declare const TranslationRequestSchema: z.ZodObject<{
    target: z.ZodEnum<["en", "es", "fr"]>;
    items: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        fallback: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        key: string;
        fallback: string;
    }, {
        key: string;
        fallback: string;
    }>, "many">;
    domain: z.ZodOptional<z.ZodString>;
    tone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    target: "en" | "es" | "fr";
    items: {
        key: string;
        fallback: string;
    }[];
    domain?: string | undefined;
    tone?: string | undefined;
}, {
    target: "en" | "es" | "fr";
    items: {
        key: string;
        fallback: string;
    }[];
    domain?: string | undefined;
    tone?: string | undefined;
}>;
export declare const TranslationResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    locale: z.ZodEnum<["en", "es", "fr"]>;
    items: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        key: string;
        text: string;
    }, {
        key: string;
        text: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ok: true;
    items: {
        key: string;
        text: string;
    }[];
    locale: "en" | "es" | "fr";
}, {
    ok: true;
    items: {
        key: string;
        text: string;
    }[];
    locale: "en" | "es" | "fr";
}>;
export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;
export type TranslationResponse = z.infer<typeof TranslationResponseSchema>;
export type SupportedLocale = z.infer<typeof Locale>;
//# sourceMappingURL=i18n.d.ts.map