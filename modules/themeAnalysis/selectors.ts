export const mcpContext = {
  file: 'modules/themeAnalysis/selectors.ts',
  role: 'developer',
  allowedActions: ['create', 'harden', 'test'],
  contentSensitivity: 'low',
  theme: 'doccraft-ai',
};

import type {
  ThemeAnalysisResult,
  ThemeComplexityMetrics,
} from './services/themeAnalysisEngine';
import { clamp100 } from '../emotionArc/utils/scaling';

export interface ThemeAnalysisSnapshot {
  id: string;
  timestamp: number;
  result: ThemeAnalysisResult;
  metrics: ThemeComplexityMetrics;
}

export interface ThemeState {
  readonly snapshots: ReadonlyArray<ThemeAnalysisSnapshot>;
}

export function selectSnapshots(
  state: ThemeState | null | undefined
): ReadonlyArray<ThemeAnalysisSnapshot> {
  if (!state || !Array.isArray(state.snapshots)) {
    return [];
  }
  return state.snapshots;
}

export function selectSnapshotById(
  state: ThemeState | null | undefined,
  id: string
): ThemeAnalysisSnapshot | null {
  const snapshots = selectSnapshots(state);
  return snapshots.find(snapshot => snapshot.id === id) || null;
}

export function selectMetricPercents(
  snapshot: ThemeAnalysisSnapshot | null | undefined
): { balance: string; vibrancy: string; accessibility: string } {
  if (!snapshot) {
    return { balance: '0%', vibrancy: '0%', accessibility: '0%' };
  }

  const percent100 = (n: number): string => `${Math.round(clamp100(n))}%`;

  return {
    balance: percent100(snapshot.metrics.balance),
    vibrancy: percent100(snapshot.metrics.variety),
    accessibility: percent100(snapshot.metrics.density),
  };
}
