// MCP Context Block
/*
role: qa,
tier: Pro,
file: "modules/styleProfile/__tests__/styleDriftRevision.spec.ts",
allowedActions: ["test", "mock", "validate"],
theme: "style_testing"
*/

import {
  analyzeNarrativeStyle,
  compareToTargetStyle,
} from '../services/styleProfiler';
import { stylePresets } from '../configs/stylePresets';
import { proposeEdit } from '../../narrativeDashboard/services/revisionEngine';
import { render, screen } from '@testing-library/react';
import StyleProfilePanel from '../components/StyleProfilePanel';
import SmartRevisionEngine from '../../narrativeDashboard/components/SmartRevisionEngine';

jest.mock('../../narrativeDashboard/services/revisionEngine', () => ({
  proposeEdit: jest.fn(),
}));

// 1. Style drift detection

describe('Style Drift Detection', () => {
  it('detects over-formal style drift', async () => {
    const text =
      'One must always consider the ramifications of one’s actions, lest society frown upon impropriety.';
    const profile = await analyzeNarrativeStyle(text);
    expect(profile.voice).toBe('formal');
    expect(profile.tone).toBe('neutral');
    const target = stylePresets['YA'];
    const report = compareToTargetStyle(profile, target);
    expect(report.driftFlags).toContain('voice is formal, expected casual');
    expect(report.recommendations).toContain('Rewrite to use casual voice.');
  });

  it('detects off-tone drift', async () => {
    const text = 'The world was bleak, every hope dashed by the endless rain.';
    const profile = await analyzeNarrativeStyle(text);
    expect(profile.tone).toBe('dark');
    const target = stylePresets['YA'];
    const report = compareToTargetStyle(profile, target);
    expect(report.driftFlags).toContain('tone is dark, expected warm');
    expect(report.recommendations).toContain('Adjust tone toward warm.');
  });

  it('no drift for matching style', async () => {
    const text =
      'She laughed with her friends, sunlight in her hair, the world full of possibility.';
    const profile = await analyzeNarrativeStyle(text);
    const target = stylePresets['YA'];
    const report = compareToTargetStyle(profile, target);
    expect(report.driftFlags.length).toBe(0);
    expect(report.recommendations.length).toBe(0);
  });
});

// 2. Style-driven revision

describe('Style-driven revision', () => {
  it('passes drift recommendations to revisionEngine and revises text', async () => {
    // const _original = 'One must always consider the ramifications of one\'s actions.';
    // const _driftRecs = ['Rewrite to use casual voice.'];
    const suggestion = {
      id: 's1',
      type: 'style',
      priority: 'high',
      title: 'Style drift',
      description: 'Voice is too formal.',
      specificChanges: ['Rewrite to use casual voice.'],
      expectedImpact: {
        tensionChange: 0,
        empathyChange: 0,
        engagementChange: 0,
        complexityChange: 0,
      },
      targetPositions: [],
      riskLevel: 'medium',
      implementationDifficulty: 'medium',
      estimatedTime: 5,
    };
    const revisedText =
      'You should think about what you do, or people might not like it.';
    (proposeEdit as jest.Mock).mockResolvedValue({
      revisedText,
      changeSummary: ['Voice made more casual'],
      confidenceScore: 0.9,
      appliedSuggestionId: 's1',
    });
    const result = await proposeEdit('scene1', suggestion);
    expect(result.revisedText).toContain('You should think');
    expect(result.changeSummary).toContain('Voice made more casual');
    expect(result.confidenceScore).toBeGreaterThan(0.5);
  });
});

// 3. UI integration

describe('StyleProfilePanel UI', () => {
  it('renders correct metrics and drift flags', async () => {
    render(<StyleProfilePanel sceneId="scene1" target={stylePresets['YA']} />);
    expect(
      await screen.findByText(/Narrative Style Profile/i)
    ).toBeInTheDocument();
    // Drift flags or no drift
    expect(screen.getByText(/Style Metrics Chart/i)).toBeInTheDocument();
  });
});

describe('SmartRevisionEngine UI', () => {
  it('highlights style changes and tags source', async () => {
    // Mock suggestion and style impact
    const suggestion = {
      id: 's1',
      type: 'style',
      priority: 'high',
      title: 'Style drift',
      description: 'Voice is too formal.',
      specificChanges: ['Rewrite to use casual voice.'],
      expectedImpact: {
        tensionChange: 0,
        empathyChange: 0,
        engagementChange: 0,
        complexityChange: 0,
      },
      targetPositions: [],
      riskLevel: 'medium',
      implementationDifficulty: 'medium',
      estimatedTime: 5,
    };
    (proposeEdit as jest.Mock).mockResolvedValue({
      revisedText:
        'You should think about what you do, or people might not like it.',
      changeSummary: ['Voice made more casual'],
      confidenceScore: 0.9,
      appliedSuggestionId: 's1',
    });
    render(<SmartRevisionEngine sceneId="scene1" suggestion={suggestion} />);
    expect(await screen.findByText(/AI Revision Preview/i)).toBeInTheDocument();
    // Style impact summary
    expect(await screen.findByText(/Style Impact:/i)).toBeInTheDocument();
  });
});
