import { Router } from 'express';
import {
  TranslationRequestSchema,
  TranslationResponseSchema,
} from '@/shared/schemas/i18n';
import { makeDummyTranslate, makeOpenAITranslate } from '../adapters/translate';
import { performTranslation } from '../services/i18nService';
import { apiLimiter } from '../middleware/ratelimit';

export function makeI18nRouter(deps?: { provider?: 'dummy' | 'openai' }) {
  const router = Router();
  const FLAGS = { I18N: process.env.FEATURE_I18N === 'true' };

  router.post('/api/i18n/translate', apiLimiter, async (req, res, next) => {
    try {
      if (!FLAGS.I18N)
        return res.status(404).json({ ok: false, error: 'Not found' });

      const parsed = TranslationRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        const msg = parsed.error.errors
          .map(e => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        return res.status(400).json({ ok: false, error: msg });
      }

      // choose adapter (start with dummy)
      const adapter =
        deps?.provider === 'openai' || req.body.provider === 'openai'
          ? makeOpenAITranslate()
          : makeDummyTranslate();
      const items = await performTranslation(adapter, parsed.data);

      const payload = TranslationResponseSchema.parse({
        ok: true,
        locale: parsed.data.target,
        items,
      });
      res.json(payload);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export default makeI18nRouter();
