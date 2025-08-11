import { describe, it, expect, beforeEach } from '@jest/globals';
import type { ThemeAnalysisSnapshot, ThemeState } from '../selectors';
import {
  selectSnapshots,
  selectSnapshotById,
  selectMetricPercents,
} from '../selectors';

describe('themeAnalysis selectors', () => {
  let mockSnapshot: ThemeAnalysisSnapshot;
  let mockState: ThemeState;

  beforeEach(() => {
    mockSnapshot = {
      id: 'id1',
      timestamp: 1700000000000, // Fixed timestamp for determinism
      result: {
        primaryThemes: ['love', 'sacrifice'],
        secondaryThemes: ['redemption'],
        themeVector: {},
        alignmentScore: 85,
        complexityScore: 72,
        coherenceScore: 78,
        suggestions: ['Develop secondary themes further'],
        warnings: [],
      },
      metrics: {
        balance: 75,
        variety: 66,
        density: 80,
      },
    };

    mockState = {
      snapshots: [mockSnapshot],
    };
  });

  describe('selectMetricPercents', () => {
    it('should return zero percentages for null snapshot', () => {
      const result = selectMetricPercents(null);
      expect(result).toEqual({
        balance: '0%',
        vibrancy: '0%',
        accessibility: '0%',
      });
    });

    it('should return zero percentages for undefined snapshot', () => {
      const result = selectMetricPercents(undefined);
      expect(result).toEqual({
        balance: '0%',
        vibrancy: '0%',
        accessibility: '0%',
      });
    });

    it('should format metrics as whole-number percentages', () => {
      const result = selectMetricPercents(mockSnapshot);
      expect(result).toEqual({
        balance: '75%',
        vibrancy: '66%',
        accessibility: '80%',
      });
    });

    it('should clamp values above 100 to 100%', () => {
      const highValueSnapshot: ThemeAnalysisSnapshot = {
        ...mockSnapshot,
        metrics: {
          balance: 150,
          variety: 200,
          density: 300,
        },
      };
      const result = selectMetricPercents(highValueSnapshot);
      expect(result).toEqual({
        balance: '100%',
        vibrancy: '100%',
        accessibility: '100%',
      });
    });

    it('should clamp values below 0 to 0%', () => {
      const lowValueSnapshot: ThemeAnalysisSnapshot = {
        ...mockSnapshot,
        metrics: {
          balance: -25,
          variety: -50,
          density: -100,
        },
      };
      const result = selectMetricPercents(lowValueSnapshot);
      expect(result).toEqual({
        balance: '0%',
        vibrancy: '0%',
        accessibility: '0%',
      });
    });

    it('should round decimal values to whole numbers', () => {
      const decimalSnapshot: ThemeAnalysisSnapshot = {
        ...mockSnapshot,
        metrics: {
          balance: 75.7,
          variety: 66.3,
          density: 80.9,
        },
      };
      const result = selectMetricPercents(decimalSnapshot);
      expect(result).toEqual({
        balance: '76%',
        vibrancy: '66%',
        accessibility: '81%',
      });
    });
  });

  describe('selectSnapshots', () => {
    it('should return empty array for null state', () => {
      const result = selectSnapshots(null);
      expect(result).toEqual([]);
    });

    it('should return empty array for undefined state', () => {
      const result = selectSnapshots(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array when snapshots is not an array', () => {
      const invalidState = { snapshots: 'not an array' } as any;
      const result = selectSnapshots(invalidState);
      expect(result).toEqual([]);
    });

    it('should return empty array when snapshots is null', () => {
      const invalidState = { snapshots: null } as any;
      const result = selectSnapshots(invalidState);
      expect(result).toEqual([]);
    });

    it('should return snapshots array for valid state', () => {
      const result = selectSnapshots(mockState);
      expect(result).toEqual([mockSnapshot]);
    });
  });

  describe('selectSnapshotById', () => {
    it('should return null for missing snapshot id', () => {
      const result = selectSnapshotById(mockState, 'missing');
      expect(result).toBeNull();
    });

    it('should return null for null state', () => {
      const result = selectSnapshotById(null, 'id1');
      expect(result).toBeNull();
    });

    it('should return null for undefined state', () => {
      const result = selectSnapshotById(undefined, 'id1');
      expect(result).toBeNull();
    });

    it('should return snapshot when id matches', () => {
      const result = selectSnapshotById(mockState, 'id1');
      expect(result).toBe(mockSnapshot);
    });

    it('should return null when state has no snapshots', () => {
      const emptyState: ThemeState = { snapshots: [] };
      const result = selectSnapshotById(emptyState, 'id1');
      expect(result).toBeNull();
    });
  });
});
