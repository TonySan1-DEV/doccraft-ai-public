import type { TTSEngine } from '../adapters/tts';
import type { StorageAdapter } from '../adapters/storage';
import type { AudioExportInput } from '../../src/shared/schemas/audioExport';

// Inject your own document fetcher; we keep it typed and isolated for tests
export interface DocumentLoader {
  loadDocumentText(documentId: string): Promise<{ text: string }>;
}

export interface AudioExportDeps {
  tts: TTSEngine;
  storage: StorageAdapter;
  docs: DocumentLoader;
  bucket: string;
  signedTtlSeconds: number;
}

export async function exportAudio(
  deps: AudioExportDeps,
  input: AudioExportInput
) {
  const text =
    input.text ?? (await deps.docs.loadDocumentText(input.documentId!)).text;

  const audioBytes = await deps.tts.synthesize(text, {
    voice: input.voice,
    format: input.format,
    speed: input.speed,
    sampleRate: input.sampleRate,
    language: input.language,
  });

  const objectKey = makeObjectKey({
    documentId: input.documentId,
    format: input.format,
  });

  const stored = await deps.storage.putAndSign({
    bucket: deps.bucket,
    objectKey,
    data: audioBytes,
    contentType: deps.tts.contentType(input.format),
    ttlSeconds: deps.signedTtlSeconds,
  });

  return {
    ok: true as const,
    documentId: input.documentId,
    objectKey: stored.objectKey,
    signedUrl: stored.signedUrl,
    expiresAt: stored.expiresAt,
  };
}

function makeObjectKey({
  documentId,
  format,
}: {
  documentId?: string;
  format: string;
}) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const id = documentId ?? 'adhoc';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${y}/${m}/${d}/${id}/${rand}.${format}`;
}
