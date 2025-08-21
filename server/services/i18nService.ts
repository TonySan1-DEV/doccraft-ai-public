import type { TranslateAdapter } from '../adapters/translate';
import type { TranslationRequest } from '@/shared/schemas/i18n';

export async function performTranslation(
  adapter: TranslateAdapter,
  req: TranslationRequest
) {
  const result = await adapter.translate(req.items, req.target, {
    domain: req.domain,
    tone: req.tone,
  });
  return result;
}
