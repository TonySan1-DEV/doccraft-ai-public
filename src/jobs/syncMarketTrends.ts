import { fetchPublishingTrends } from '../services/fetchPublishingTrends';
import { transformPublishingToMarketTrend } from '../utils/transformTrendData';
import { supabase } from '../lib/supabase';
import { MarketTrend } from '../types/MarketTrend';
import { PublishingTrend } from '../types/PublishingTrend';

export async function syncMarketTrends(): Promise<void> {
  const publishingTrends: PublishingTrend[] = await fetchPublishingTrends();
  let added = 0,
    updated = 0,
    skipped = 0,
    invalid = 0;
  const upsertPayload: MarketTrend[] = [];

  for (const trend of publishingTrends) {
    const marketTrend = transformPublishingToMarketTrend(trend);
    if (!marketTrend) {
      invalid++;
      continue;
    }
    upsertPayload.push(marketTrend);
  }

  if (upsertPayload.length === 0) {
    console.warn('No valid market trends to upsert.');
    return;
  }

  // Upsert to Supabase (by [genre, trend_type, label])
  const { data, error } = await supabase
    .from('market_trends')
    .upsert(upsertPayload, {
      onConflict: 'genre,trend_type,label',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error('Supabase upsert error:', error);
    throw error;
  }

  // Count added/updated/skipped
  if (data && Array.isArray(data)) {
    for (const row of data as any[]) {
      // If updated_at is very recent, treat as updated; else as added
      const updatedAt = new Date(row.updated_at).getTime();
      const now = Date.now();
      if (now - updatedAt < 1000 * 60 * 2) {
        updated++;
      } else {
        added++;
      }
    }
  } else {
    // If no data returned, assume all were added
    added = upsertPayload.length;
  }

  skipped = publishingTrends.length - upsertPayload.length;
}

// If run directly (node src/jobs/syncMarketTrends.ts), execute the job
if (require.main === module) {
  syncMarketTrends().catch(err => {
    console.error('Market trends sync failed:', err);
    process.exit(1);
  });
}
