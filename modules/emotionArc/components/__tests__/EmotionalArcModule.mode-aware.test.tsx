/**
 * @fileoverview Comprehensive tests for EmotionalArcModule with mode awareness
 * Tests all three modes: MANUAL, HYBRID, and FULLY_AUTO
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EmotionalArcModule from '../EmotionalArcModule';
import { useAgentPreferences } from '../../../../src/contexts/AgentPreferencesContext';
import { useNarrativeSync } from '../../../shared/state/useNarrativeSyncContext';

// Mock dependencies
vi.mock('../../../../src/contexts/AgentPreferencesContext');
vi.mock('../../../../src/services/modeAwareAIService');
vi.mock('../../../../src/services/moduleCoordinator');
vi.mock('../../../../src/components/ModeErrorBoundary', () => ({
  ModeErrorBoundary: ({ children, onError, onRecovery }: any) => {
    // Simulate error boundary behavior
    if (onError) {
      // Simulate an error for testing
      setTimeout(() => onError(new Error('Test error'), {}), 100);
    }
    return <div data-testid="mode-error-boundary">{children}</div>;
  },
}));

vi.mock('../../../shared/state/useNarrativeSyncContext');
vi.mock('../EmotionTimelineChart', () => ({
  default: ({ emotionalBeats, onBeatClick }: any) => (
    <div data-testid="emotion-timeline-chart">
      <div data-testid="beats-count">{emotionalBeats?.length || 0}</div>
      <button onClick={() => onBeatClick?.({ sceneId: 'scene1' })}>
        Beat Click
      </button>
    </div>
  ),
}));

vi.mock('../TensionCurveViewer', () => ({
  default: ({ tensionCurve, onPointClick }: any) => (
    <div data-testid="tension-curve-viewer">
      <div data-testid="curve-points">{tensionCurve?.length || 0}</div>
      <button onClick={() => onPointClick?.(0.5, {})}>Point Click</button>
    </div>
  ),
}));

vi.mock('../OptimizationSuggestions', () => ({
  default: ({
    optimizationPlan,
    onApplySuggestion,
    onDismissSuggestion,
  }: any) => (
    <div data-testid="optimization-suggestions">
      <div data-testid="suggestions-count">
        {optimizationPlan?.suggestions?.length || 0}
      </div>
      <button onClick={() => onApplySuggestion?.('suggestion1')}>
        Apply Suggestion
      </button>
      <button onClick={() => onDismissSuggestion?.('suggestion1')}>
        Dismiss Suggestion
      </button>
    </div>
  ),
}));

vi.mock('../SceneSentimentPanel', () => ({
  default: ({ sceneData, onSceneSelect, onCharacterClick }: any) => (
    <div data-testid="scene-sentiment-panel">
      <div data-testid="scenes-count">{sceneData?.length || 0}</div>
      <button onClick={() => onSceneSelect?.('scene1')}>Select Scene</button>
      <button onClick={() => onCharacterClick?.('character1')}>
        Select Character
      </button>
    </div>
  ),
}));

vi.mock('../CharacterArcSwitch', () => ({
  default: ({ characterIds, selectedCharacter, onCharacterSwitch }: any) => (
    <div data-testid="character-arc-switch">
      <div data-testid="characters-count">{characterIds?.length || 0}</div>
      <div data-testid="selected-character">{selectedCharacter}</div>
      <button onClick={() => onCharacterSwitch?.('character1')}>
        Switch Character
      </button>
    </div>
  ),
}));

// Mock services
vi.mock('../../services/emotionAnalyzer', () => ({
  EmotionAnalyzer: vi.fn().mockImplementation(() => ({
    analyzeStoryEmotions: vi.fn().mockResolvedValue([
      {
        sceneId: 'scene1',
        emotionalBeats: [
          {
            id: 'beat1',
            characterId: 'character1',
            emotion: 'joy',
            intensity: 0.8,
          },
          {
            id: 'beat2',
            characterId: 'character2',
            emotion: 'sadness',
            intensity: 0.6,
          },
        ],
        analysis: { dominantEmotion: 'joy', intensity: 0.7 },
      },
    ]),
  })),
}));

vi.mock('../../services/arcSimulator', () => ({
  ArcSimulator: vi.fn().mockImplementation(() => ({
    generateArcSimulation: vi.fn().mockReturnValue({
      curve: [{ tension: 0.5, emotionalComplexity: 0.6 }],
      emotionalPeaks: [],
      readerEngagement: { overall: 0.7 },
      pacingAnalysis: { pacingScore: 0.75 },
    }),
    generateArcSegments: vi.fn().mockReturnValue([]),
    simulateReaderResponse: vi.fn().mockReturnValue({
      emotionalEngagement: 0.8,
      tensionResponse: 0.7,
    }),
  })),
}));

vi.mock('../../services/suggestionEngine', () => ({
  SuggestionEngine: vi.fn().mockImplementation(() => ({
    generateOptimizationSuggestions: vi.fn().mockReturnValue({
      suggestions: [
        { id: 'suggestion1', type: 'emotional_consistency', confidence: 0.9 },
        { id: 'suggestion2', type: 'pacing_improvement', confidence: 0.8 },
      ],
    }),
  })),
}));

describe('EmotionalArcModule - Mode Awareness', () => {
  const mockUseAgentPreferences = useAgentPreferences as vi.MockedFunction<
    typeof useAgentPreferences
  >;
  const mockUseNarrativeSync = useNarrativeSync as vi.MockedFunction<
    typeof useNarrativeSync
  >;

  const defaultProps = {
    initialScenes: [
      {
        id: 'scene1',
        text: 'Test scene content',
        characters: ['character1'],
        context: 'Test context',
      },
    ],
    initialText: 'Test story text',
  };

  const defaultNarrativeSync = {
    state: {
      characterFocusId: 'all',
      currentSceneId: 'scene1',
    },
    setScene: vi.fn(),
    setCharacter: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNarrativeSync.mockReturnValue(defaultNarrativeSync);
  });

  describe('MANUAL Mode', () => {
    beforeEach(() => {
      mockUseAgentPreferences.mockReturnValue({
        preferences: {
          systemMode: 'MANUAL',
          modeConfiguration: {},
        },
        updatePreferences: vi.fn(),
      });
    });

    it('renders manual mode interface with analyze button', () => {
      render(<EmotionalArcModule {...defaultProps} />);

      expect(screen.getByText('Manual Mode')).toBeInTheDocument();
      expect(screen.getByText('Full user control')).toBeInTheDocument();
      expect(screen.getByText('Analyze Emotional Arc')).toBeInTheDocument();
    });

    it('shows manual mode indicator in header', () => {
      render(<EmotionalArcModule {...defaultProps} />);

      expect(screen.getByText('Mode:')).toBeInTheDocument();
      expect(screen.getByText('MANUAL')).toBeInTheDocument();
    });

    it('only analyzes when analyze button is clicked', async () => {
      render(<EmotionalArcModule {...defaultProps} />);

      const analyzeButton = screen.getByText('Analyze Emotional Arc');
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(
          screen.getByText('Analyzing emotional content...')
        ).toBeInTheDocument();
      });
    });

    it('shows appropriate empty state message for manual mode', () => {
      render(<EmotionalArcModule {...defaultProps} />);

      expect(
        screen.getByText('Click "Analyze Emotional Arc" to begin analysis.')
      ).toBeInTheDocument();
    });
  });

  describe('HYBRID Mode', () => {
    beforeEach(() => {
      mockUseAgentPreferences.mockReturnValue({
        preferences: {
          systemMode: 'HYBRID',
          modeConfiguration: {},
        },
        updatePreferences: vi.fn(),
      });
    });

    it('renders hybrid mode interface with collaborative messaging', () => {
      render(<EmotionalArcModule {...defaultProps} />);

      expect(screen.getByText('Hybrid Mode')).toBeInTheDocument();
      expect(screen.getByText('Collaborative assistance')).toBeInTheDocument();
    });

    it('shows hybrid mode indicator in header', () => {
      render(<EmotionalArcModule {...defaultProps} />);

      expect(screen.getByText('HYBRID')).toBeInTheDocument();
    });

    it('automatically analyzes content and shows suggestions', async () => {
      render(<EmotionalArcModule {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText('AI Suggestions Available')
        ).toBeInTheDocument();
        expect(screen.getByText('2 suggestions available')).toBeInTheDocument();
      });
    });

    it('shows contextual suggestions with user choice', async () => {
      render(<EmotionalArcModule {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('emotional_consistency')).toBeInTheDocument();
        expect(screen.getByText('pacing_improvement')).toBeInTheDocument();
      });
    });
  });

  describe('FULLY_AUTO Mode', () => {
    beforeEach(() => {
      mockUseAgentPreferences.mockReturnValue({
        preferences: {
          systemMode: 'FULLY_AUTO',
          modeConfiguration: {},
        },
        updatePreferences: vi.fn(),
      });
    });

    it('renders auto mode interface with proactive messaging', () => {
      render(<EmotionalArcModule {...defaultProps} />);

      expect(screen.getByText('Auto Mode')).toBeInTheDocument();
      expect(screen.getByText('Proactive assistance')).toBeInTheDocument();
    });

    it('shows auto mode indicator in header', () => {
      render(<EmotionalArcModule {...defaultProps} />);

      expect(screen.getByText('FULLY_AUTO')).toBeInTheDocument();
    });

    it('continuously analyzes and shows auto-applied enhancements', async () => {
      render(<EmotionalArcModule {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText('Auto-Applied Enhancements')
        ).toBeInTheDocument();
        expect(
          screen.getByText('AI is continuously improving your emotional arc')
        ).toBeInTheDocument();
      });
    });

    it('shows high-confidence auto-applied suggestions', async () => {
      render(<EmotionalArcModule {...defaultProps} />);

      await waitFor(() => {
        const autoSuggestions = screen.getAllByText(
          /emotional_consistency|pacing_improvement/
        );
        expect(autoSuggestions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Mode Transitions', () => {
    it('adapts interface when mode changes', async () => {
      const { rerender } = render(<EmotionalArcModule {...defaultProps} />);

      // Start with MANUAL mode
      expect(screen.getByText('Manual Mode')).toBeInTheDocument();

      // Switch to HYBRID mode
      mockUseAgentPreferences.mockReturnValue({
        preferences: {
          systemMode: 'HYBRID',
          modeConfiguration: {},
        },
        updatePreferences: vi.fn(),
      });

      rerender(<EmotionalArcModule {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Hybrid Mode')).toBeInTheDocument();
      });
    });

    it('maintains state during mode transitions', async () => {
      const { rerender } = render(<EmotionalArcModule {...defaultProps} />);

      // Start with HYBRID mode to generate data
      mockUseAgentPreferences.mockReturnValue({
        preferences: {
          systemMode: 'HYBRID',
          modeConfiguration: {},
        },
        updatePreferences: vi.fn(),
      });

      rerender(<EmotionalArcModule {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText('AI Suggestions Available')
        ).toBeInTheDocument();
      });

      // Switch to MANUAL mode
      mockUseAgentPreferences.mockReturnValue({
        preferences: {
          systemMode: 'MANUAL',
          modeConfiguration: {},
        },
        updatePreferences: vi.fn(),
      });

      rerender(<EmotionalArcModule {...defaultProps} />);

      // Should still show the data
      expect(screen.getByText('Manual Mode')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('wraps component in ModeErrorBoundary', () => {
      render(<EmotionalArcModule {...defaultProps} />);

      expect(screen.getByTestId('mode-error-boundary')).toBeInTheDocument();
    });

    it('handles analysis errors gracefully', async () => {
      // Mock service to throw error
      const mockEmotionAnalyzer = vi.mocked(
        await import('../../services/emotionAnalyzer')
      );
      mockEmotionAnalyzer.EmotionAnalyzer.mockImplementation(() => ({
        analyzeStoryEmotions: vi
          .fn()
          .mockRejectedValue(new Error('Analysis failed')),
      }));

      render(<EmotionalArcModule {...defaultProps} />);

      // Switch to HYBRID mode to trigger analysis
      mockUseAgentPreferences.mockReturnValue({
        preferences: {
          systemMode: 'HYBRID',
          modeConfiguration: {},
        },
        updatePreferences: vi.fn(),
      });

      await waitFor(() => {
        expect(screen.getByText('Analysis Error')).toBeInTheDocument();
        expect(screen.getByText('Analysis failed')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('maintains proper ARIA labels and roles', () => {
      render(
        <EmotionalArcModule {...defaultProps} aria-label="Custom Label" />
      );

      expect(screen.getByRole('region')).toHaveAttribute(
        'aria-label',
        'Custom Label'
      );
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('provides proper tab navigation', () => {
      render(<EmotionalArcModule {...defaultProps} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4); // timeline, tension, scenes, suggestions

      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
        expect(tab).toHaveAttribute('aria-controls');
      });
    });
  });

  describe('Integration Features', () => {
    it('registers with module coordinator', () => {
      const mockModuleCoordinator = vi.mocked(
        await import('../../../../src/services/moduleCoordinator')
      );
      render(<EmotionalArcModule {...defaultProps} />);

      expect(
        mockModuleCoordinator.moduleCoordinator.registerModule
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          moduleId: 'emotionArc',
          getCoordinationCapabilities: expect.any(Function),
        })
      );
    });

    it('integrates with narrative sync context', () => {
      render(<EmotionalArcModule {...defaultProps} />);

      expect(mockUseNarrativeSync).toHaveBeenCalled();
    });

    it('handles character and scene selection', async () => {
      render(<EmotionalArcModule {...defaultProps} />);

      const characterButton = screen.getByText('Switch Character');
      fireEvent.click(characterButton);

      expect(defaultNarrativeSync.setCharacter).toHaveBeenCalledWith(
        'character1'
      );

      const sceneButton = screen.getByText('Select Scene');
      fireEvent.click(sceneButton);

      expect(defaultNarrativeSync.setScene).toHaveBeenCalledWith('scene1');
    });
  });
});
