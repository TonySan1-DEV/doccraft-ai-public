import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { syncMarketTrends } from '../src/jobs/syncMarketTrends';
import {
  fetchPublishingTrends,
  loadMockPublishingTrends,
} from '../src/services/fetchPublishingTrends';
import { transformPublishingToMarketTrend } from '../src/utils/transformTrendData';
import { supabase } from '../src/lib/supabase';
import { MarketTrend } from '../src/types/MarketTrend';

jest.mock('../src/services/fetchPublishingTrends');
jest.mock('../src/utils/transformTrendData');
jest.mock('../src/lib/supabase');

const mockTrends = [
  {
    genre: 'Romance',
    trend_type: 'tone',
    label: 'Slow Burn',
    popularityScore: 0.84,
    exampleTitles: ['Love in the Time of Code', 'Letters Across Time'],
  },
  {
    genre: 'Mystery',
    trend_type: 'topic',
    label: 'Small Town Secrets',
    popularityScore: 0.91,
    exampleTitles: ['The Quiet Village', 'Hidden Truths'],
  },
  {
    genre: 'InvalidGenre',
    trend_type: 'tone',
    label: 'Invalid',
    popularityScore: 0.5,
    exampleTitles: ['Bad Book'],
  },
];

const validMarketTrends: MarketTrend[] = [
  {
    genre: 'Romance',
    trend_type: 'tone',
    label: 'Slow Burn',
    score: 0.84,
    examples: ['Love in the Time of Code', 'Letters Across Time'],
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    genre: 'Mystery',
    trend_type: 'topic',
    label: 'Small Town Secrets',
    score: 0.91,
    examples: ['The Quiet Village', 'Hidden Truths'],
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('syncMarketTrends job', () => {
  let upsertMock: any;
  let logSpy: any;
  let errorSpy: any;

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchPublishingTrends as any).mockResolvedValue(mockTrends);
    (transformPublishingToMarketTrend as any).mockImplementation(
      (trend: any) => {
        if (trend.genre === 'InvalidGenre') return null;
        return validMarketTrends.find(mt => mt.label === trend.label) || null;
      }
    );
    upsertMock = jest
      .fn()
      .mockResolvedValue({ data: validMarketTrends, error: null });
    (supabase.from as any) = jest.fn(() => ({ upsert: upsertMock }));
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should fetch, transform, and upsert valid market trends', async () => {
    await syncMarketTrends();
    expect(fetchPublishingTrends).toHaveBeenCalled();
    expect(transformPublishingToMarketTrend).toHaveBeenCalledTimes(
      mockTrends.length
    );
    expect(upsertMock).toHaveBeenCalledWith(
      validMarketTrends,
      expect.objectContaining({ onConflict: ['genre', 'trend_type', 'label'] })
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Market trends sync complete')
    );
  });

  it('should skip invalid entries and log warnings', async () => {
    await syncMarketTrends();
    expect(transformPublishingToMarketTrend).toHaveBeenCalledWith(
      expect.objectContaining({ genre: 'InvalidGenre' })
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Market trends sync complete')
    );
  });

  it('should log and throw on upsert error', async () => {
    upsertMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'Upsert failed' },
    });
    (supabase.from as any) = jest.fn(() => ({ upsert: upsertMock }));
    await expect(syncMarketTrends()).rejects.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(
      'Supabase upsert error:',
      expect.anything()
    );
  });

  it('should log and exit if no valid market trends', async () => {
    (transformPublishingToMarketTrend as any).mockReturnValue(null);
    await syncMarketTrends();
    expect(logSpy).toHaveBeenCalledWith('No valid market trends to upsert.');
  });

  it('should handle empty fetch result', async () => {
    (fetchPublishingTrends as any).mockResolvedValue([]);
    await syncMarketTrends();
    expect(logSpy).toHaveBeenCalledWith('No valid market trends to upsert.');
  });

  it('should handle and log fetch errors', async () => {
    (fetchPublishingTrends as any).mockRejectedValueOnce(
      new Error('API failure')
    );
    await expect(syncMarketTrends()).rejects.toThrow('API failure');
  });

  it('should handle and log transform errors', async () => {
    (transformPublishingToMarketTrend as any).mockImplementation(() => {
      throw new Error('Transform error');
    });
    await expect(syncMarketTrends()).rejects.toThrow('Transform error');
  });
});
