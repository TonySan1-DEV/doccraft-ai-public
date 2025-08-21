import { Router } from 'express';
import { isAudiobookEnabled } from '../util/featureFlags';
import { rlAudio } from '../middleware/ratelimit';
import { AudioExportSchema, AUDIO_MAX_TEXT } from '../schemas/audio';
// Use mock version for testing to avoid storage dependencies
import { exportAudioWithOpenAI } from '../services/audioExport.mock';
import { safeObjectKey, clamp } from '../util/sanitize';

const router = Router();

router.post('/audio', rlAudio, async (req, res) => {
  if (!isAudiobookEnabled()) return res.sendStatus(404);

  try {
    const userId =
      (req as unknown as { user?: { id?: string } }).user?.id ??
      req.header('x-user-id');
    if (!userId) return res.status(401).json({ error: 'missing user' });

    const parsed = AudioExportSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: 'invalid payload', issues: parsed.error.flatten() });
    }

    const { text, voice, format, provider, speed, sampleRate, language } =
      parsed.data;

    // guardrails
    if (text.length > AUDIO_MAX_TEXT)
      return res.status(413).json({ error: 'text too large' });

    // normalize file key prefix
    const objectPrefix = safeObjectKey('audiobook', userId);

    if (provider !== 'openai') {
      // keep your existing dummy path here if you want:
      // return res.json(await exportAudioWithDummy({ ...parsed.data, userId, objectPrefix }));
      return res.status(400).json({ error: 'unsupported provider' });
    }

    const result = await exportAudioWithOpenAI({
      text,
      voice,
      format,
      speed: speed ? clamp(speed, 0.5, 2.0) : undefined,
      sampleRate,
      language,
      userId,
      objectPrefix,
    });

    return res.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'internal';
    return res.status(500).json({ error: msg });
  }
});

export default router;
