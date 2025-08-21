export interface TranslateAdapter {
  translate(
    items: Array<{ key: string; fallback: string }>,
    target: 'en' | 'es' | 'fr',
    opts?: {
      domain?: string;
      tone?: string;
    }
  ): Promise<Array<{ key: string; text: string }>>;
}

export function makeDummyTranslate(): TranslateAdapter {
  return {
    async translate(items, target) {
      // naive demo: append locale suffix (keeps tests simple)
      return items.map(i => ({
        key: i.key,
        text: `${i.fallback} [${target}]`,
      }));
    },
  };
}

export function makeOpenAITranslate(/* inject your OpenAI client here */): TranslateAdapter {
  return {
    async translate(items, target, opts) {
      // IMPLEMENT YOUR REAL CALL HERE (batched prompt)
      // Return array of { key, text }
      throw new Error('OpenAI translate not wired yet.');
    },
  };
}
