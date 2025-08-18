import { writeFileIfChanged, logStep } from './_utils.mjs';

const OUT = 'docs/dev/refs/openapi.json';

(async () => {
  const payload = {
    openapi: '3.1.0',
    info: {
      title: 'DocCraft-AI API (skeleton)',
      version: new Date().toISOString(),
      description:
        'Placeholder OpenAPI spec. Will be replaced with real route extraction.',
    },
    servers: [],
    paths: {}, // TODO: populate from real routes in a later step
    components: {}, // TODO: add schemas from Zod/Valibot later
  };

  const content = JSON.stringify(payload, null, 2) + '\n';
  const { changed } = await writeFileIfChanged(OUT, content);
  logStep(changed ? `Updated ${OUT}` : `No changes to ${OUT}`);
})();
