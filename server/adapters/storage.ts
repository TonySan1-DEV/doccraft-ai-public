import { createClient } from '@supabase/supabase-js';

export interface StoredObject {
  objectKey: string;
  signedUrl: string;
  expiresAt: number;
}

export interface StorageAdapter {
  putAndSign(params: {
    bucket: string;
    objectKey: string;
    data: ArrayBuffer | Buffer | Uint8Array;
    contentType: string;
    ttlSeconds: number;
  }): Promise<StoredObject>;
}

export function makeSupabaseStorage(): StorageAdapter {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const client = createClient(url, key);

  return {
    async putAndSign({ bucket, objectKey, data, contentType, ttlSeconds }) {
      // Ensure bucket exists (idempotent upsert)
      try {
        await client.storage.createBucket(bucket, { public: false });
      } catch {
        /* bucket may already exist */
      }

      const upload = await client.storage.from(bucket).upload(objectKey, data, {
        upsert: true,
        contentType,
      });
      if (upload.error) throw upload.error;

      const signed = await client.storage
        .from(bucket)
        .createSignedUrl(objectKey, ttlSeconds);
      if (signed.error) throw signed.error;

      return {
        objectKey,
        signedUrl: signed.data.signedUrl,
        expiresAt: Math.floor(Date.now() / 1000) + ttlSeconds,
      };
    },
  };
}
