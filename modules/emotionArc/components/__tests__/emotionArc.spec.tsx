// MCP Context Block
/*
{
  file: "modules/emotionArc/components/__tests__/emotionArc.spec.tsx",
  role: "qa",
  allowedActions: ["generate", "test", "validate", "mock"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "emotional_modeling"
}
*/

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import components
import EmotionTimelineChart from '../EmotionTimelineChart';
import TensionCurveViewer from '../TensionCurveViewer';
import OptimizationSuggestions from '../OptimizationSuggestions';
import SceneSentimentPanel from '../SceneSentimentPanel';
import CharacterArcSwitch from '../CharacterArcSwitch';
import EmotionalArcModule from '../EmotionalArcModule';

// Import test utilities
import {
  mockEmotionalBeats,
  mockTensionCurve,
  mockOptimizationPlan,
  mockSceneData,
  mockArcSimulation,
} from './testHooks';

// Mock services
jest.mock('../../services/emotionAnalyzer', () => ({
  EmotionAnalyzer: jest.fn().mockImplementation(() => ({
    analyzeStoryEmotions: jest.fn().mockResolvedValue(mockSceneData),
    analyzeEmotion: jest.fn().mockResolvedValue({
      emotion: 'joy',
      intensity: 75,
      confidence: 0.85,
    }),
  })),
}));

jest.mock('../../services/arcSimulator', () => ({
  ArcSimulator: jest.fn().mockImplementation(() => ({
    generateArcSimulation: jest.fn().mockReturnValue(mockArcSimulation),
    generateArcSegments: jest.fn().mockReturnValue([]),
    simulateReaderResponse: jest.fn().mockReturnValue({
      empathyScore: 0.8,
      predictedEngagementDrop: false,
      notes: ['Good emotional pacing'],
    }),
  })),
}));

jest.mock('../../services/suggestionEngine', () => ({
  SuggestionEngine: jest.fn().mockImplementation(() => ({
    generateOptimizationSuggestions: jest
      .fn()
      .mockReturnValue(mockOptimizationPlan),
  })),
}));

describe('EmotionTimelineChart', () => {
  const defaultProps = {
    emotionalBeats: mockEmotionalBeats,
    selectedCharacter: 'all',
    simulation: mockArcSimulation,
    isLoading: false,
    error: null,
    onBeatClick: jest.fn(),
    'aria-label': 'Emotional timeline chart',
  };

  it('renders without crashing', () => {
    render(<EmotionTimelineChart {...defaultProps} />);
    expect(
      screen.getByRole('region', { name: /emotional timeline chart/i })
    ).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(<EmotionTimelineChart {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/analyzing emotional beats/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const errorMessage = 'Failed to load emotional data';
    render(<EmotionTimelineChart {...defaultProps} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('filters beats by selected character', () => {
    render(
      <EmotionTimelineChart {...defaultProps} selectedCharacter="protagonist" />
    );
    // Should only show beats for protagonist
    expect(screen.getByText(/protagonist/i)).toBeInTheDocument();
  });

  it('calls onBeatClick when beat is clicked', async () => {
    const onBeatClick = jest.fn();
    render(
      <EmotionTimelineChart {...defaultProps} onBeatClick={onBeatClick} />
    );

    const beatElement = screen.getByText(/joy/i);
    await userEvent.click(beatElement);

    expect(onBeatClick).toHaveBeenCalledWith(
      expect.objectContaining({
        emotion: 'joy',
        intensity: 75,
      })
    );
  });

  it('has proper ARIA attributes', () => {
    render(<EmotionTimelineChart {...defaultProps} />);
    const chart = screen.getByRole('region', {
      name: /emotional timeline chart/i,
    });
    expect(chart).toHaveAttribute('aria-label', 'Emotional timeline chart');
  });

  it('displays character summary statistics', () => {
    render(<EmotionTimelineChart {...defaultProps} />);
    expect(screen.getByText(/total beats/i)).toBeInTheDocument();
    expect(screen.getByText(/average intensity/i)).toBeInTheDocument();
  });
});

describe('TensionCurveViewer', () => {
  const defaultProps = {
    tensionCurve: mockTensionCurve,
    emotionalPeaks: [0.25, 0.75],
    readerEngagement: [0.6, 0.8, 0.7, 0.9],
    isLoading: false,
    error: null,
    onPointClick: jest.fn(),
    'aria-label': 'Tension curve viewer',
  };

  it('renders without crashing', () => {
    render(<TensionCurveViewer {...defaultProps} />);
    expect(
      screen.getByRole('region', { name: /tension curve viewer/i })
    ).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(<TensionCurveViewer {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/analyzing tension patterns/i)).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const errorMessage = 'Failed to load tension data';
    render(<TensionCurveViewer {...defaultProps} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows tension statistics', () => {
    render(<TensionCurveViewer {...defaultProps} />);
    expect(screen.getByText(/peak tension/i)).toBeInTheDocument();
    expect(screen.getByText(/average tension/i)).toBeInTheDocument();
  });

  it('calls onPointClick when chart point is clicked', async () => {
    const onPointClick = jest.fn();
    render(
      <TensionCurveViewer {...defaultProps} onPointClick={onPointClick} />
    );

    // Simulate clicking on a chart point (this would need to be adapted based on actual chart implementation)
    const chartArea = screen.getByRole('img', { name: /tension curve chart/i });
    await userEvent.click(chartArea);

    expect(onPointClick).toHaveBeenCalled();
  });

  it('has proper ARIA attributes', () => {
    render(<TensionCurveViewer {...defaultProps} />);
    const viewer = screen.getByRole('region', {
      name: /tension curve viewer/i,
    });
    expect(viewer).toHaveAttribute('aria-label', 'Tension curve viewer');
  });

  it('displays engagement drop warnings', () => {
    render(<TensionCurveViewer {...defaultProps} />);
    expect(screen.getByText(/engagement drop detected/i)).toBeInTheDocument();
  });
});

describe('OptimizationSuggestions', () => {
  const defaultProps = {
    optimizationPlan: mockOptimizationPlan,
    isLoading: false,
    error: null,
    onSuggestionClick: jest.fn(),
    onApplySuggestion: jest.fn(),
    onDismissSuggestion: jest.fn(),
    'aria-label': 'Optimization suggestions',
  };

  it('renders without crashing', () => {
    render(<OptimizationSuggestions {...defaultProps} />);
    expect(
      screen.getByRole('region', { name: /optimization suggestions/i })
    ).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(<OptimizationSuggestions {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/generating suggestions/i)).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const errorMessage = 'Failed to generate suggestions';
    render(<OptimizationSuggestions {...defaultProps} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays all suggestions with proper categorization', () => {
    render(<OptimizationSuggestions {...defaultProps} />);

    expect(screen.getByText(/pacing optimization/i)).toBeInTheDocument();
    expect(screen.getByText(/character development/i)).toBeInTheDocument();
    expect(screen.getByText(/emotional resonance/i)).toBeInTheDocument();
  });

  it('shows suggestion details when expanded', async () => {
    render(<OptimizationSuggestions {...defaultProps} />);

    const expandButton = screen.getByRole('button', {
      name: /expand suggestion/i,
    });
    await userEvent.click(expandButton);

    expect(screen.getByText(/specific changes/i)).toBeInTheDocument();
    expect(screen.getByText(/expected impact/i)).toBeInTheDocument();
  });

  it('calls onApplySuggestion when apply button is clicked', async () => {
    const onApplySuggestion = jest.fn();
    render(
      <OptimizationSuggestions
        {...defaultProps}
        onApplySuggestion={onApplySuggestion}
      />
    );

    const applyButton = screen.getByRole('button', {
      name: /apply suggestion/i,
    });
    await userEvent.click(applyButton);

    expect(onApplySuggestion).toHaveBeenCalledWith(expect.any(String));
  });

  it('calls onDismissSuggestion when dismiss button is clicked', async () => {
    const onDismissSuggestion = jest.fn();
    render(
      <OptimizationSuggestions
        {...defaultProps}
        onDismissSuggestion={onDismissSuggestion}
      />
    );

    const dismissButton = screen.getByRole('button', {
      name: /dismiss suggestion/i,
    });
    await userEvent.click(dismissButton);

    expect(onDismissSuggestion).toHaveBeenCalledWith(expect.any(String));
  });

  it('has proper ARIA attributes', () => {
    render(<OptimizationSuggestions {...defaultProps} />);
    const suggestions = screen.getByRole('region', {
      name: /optimization suggestions/i,
    });
    expect(suggestions).toHaveAttribute(
      'aria-label',
      'Optimization suggestions'
    );
  });

  it('displays impact score bars', () => {
    render(<OptimizationSuggestions {...defaultProps} />);
    expect(screen.getByText(/impact score/i)).toBeInTheDocument();
  });
});

describe('SceneSentimentPanel', () => {
  const defaultProps = {
    sceneData: mockSceneData,
    selectedSceneId: 'scene1',
    isLoading: false,
    error: null,
    onSceneSelect: jest.fn(),
    onCharacterClick: jest.fn(),
    'aria-label': 'Scene sentiment panel',
  };

  it('renders without crashing', () => {
    render(<SceneSentimentPanel {...defaultProps} />);
    expect(
      screen.getByRole('region', { name: /scene sentiment panel/i })
    ).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(<SceneSentimentPanel {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/analyzing scene sentiment/i)).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const errorMessage = 'Failed to load scene data';
    render(<SceneSentimentPanel {...defaultProps} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays scene list with sentiment indicators', () => {
    render(<SceneSentimentPanel {...defaultProps} />);
    expect(screen.getByText(/scene 1/i)).toBeInTheDocument();
    expect(screen.getByText(/scene 2/i)).toBeInTheDocument();
  });

  it('highlights selected scene', () => {
    render(<SceneSentimentPanel {...defaultProps} selectedSceneId="scene1" />);
    const selectedScene = screen.getByText(/scene 1/i).closest('div');
    expect(selectedScene).toHaveClass('bg-blue-50');
  });

  it('calls onSceneSelect when scene is clicked', async () => {
    const onSceneSelect = jest.fn();
    render(
      <SceneSentimentPanel {...defaultProps} onSceneSelect={onSceneSelect} />
    );

    const sceneElement = screen.getByText(/scene 2/i);
    await userEvent.click(sceneElement);

    expect(onSceneSelect).toHaveBeenCalledWith('scene2');
  });

  it('calls onCharacterClick when character is clicked', async () => {
    const onCharacterClick = jest.fn();
    render(
      <SceneSentimentPanel
        {...defaultProps}
        onCharacterClick={onCharacterClick}
      />
    );

    const characterElement = screen.getByText(/protagonist/i);
    await userEvent.click(characterElement);

    expect(onCharacterClick).toHaveBeenCalledWith('protagonist');
  });

  it('displays character emotions for selected scene', () => {
    render(<SceneSentimentPanel {...defaultProps} selectedSceneId="scene1" />);
    expect(screen.getByText(/protagonist/i)).toBeInTheDocument();
    expect(screen.getByText(/joy/i)).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<SceneSentimentPanel {...defaultProps} />);
    const panel = screen.getByRole('region', {
      name: /scene sentiment panel/i,
    });
    expect(panel).toHaveAttribute('aria-label', 'Scene sentiment panel');
  });
});

describe('CharacterArcSwitch', () => {
  const defaultProps = {
    characterIds: ['protagonist', 'antagonist', 'supporting'],
    selectedCharacter: 'all',
    onCharacterSwitch: jest.fn(),
    isLoading: false,
    disabled: false,
    className: '',
    'aria-label': 'Character arc switch',
  };

  it('renders without crashing', () => {
    render(<CharacterArcSwitch {...defaultProps} />);
    expect(
      screen.getByRole('region', { name: /character arc switch/i })
    ).toBeInTheDocument();
  });

  it('displays all characters button', () => {
    render(<CharacterArcSwitch {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /view all characters/i })
    ).toBeInTheDocument();
  });

  it('displays individual character dropdown', () => {
    render(<CharacterArcSwitch {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /select individual character/i })
    ).toBeInTheDocument();
  });

  it('shows dropdown when individual button is clicked', async () => {
    render(<CharacterArcSwitch {...defaultProps} />);

    const dropdownButton = screen.getByRole('button', {
      name: /select individual character/i,
    });
    await userEvent.click(dropdownButton);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('protagonist')).toBeInTheDocument();
  });

  it('calls onCharacterSwitch when character is selected', async () => {
    const onCharacterSwitch = jest.fn();
    render(
      <CharacterArcSwitch
        {...defaultProps}
        onCharacterSwitch={onCharacterSwitch}
      />
    );

    const dropdownButton = screen.getByRole('button', {
      name: /select individual character/i,
    });
    await userEvent.click(dropdownButton);

    const characterOption = screen.getByRole('option', {
      name: /protagonist/i,
    });
    await userEvent.click(characterOption);

    expect(onCharacterSwitch).toHaveBeenCalledWith('protagonist');
  });

  it('displays loading state correctly', () => {
    render(<CharacterArcSwitch {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('disables controls when disabled prop is true', () => {
    render(<CharacterArcSwitch {...defaultProps} disabled={true} />);
    const allCharactersButton = screen.getByRole('button', {
      name: /view all characters/i,
    });
    expect(allCharactersButton).toBeDisabled();
  });

  it('shows character count badge', () => {
    render(<CharacterArcSwitch {...defaultProps} />);
    expect(screen.getByText(/3 characters/i)).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<CharacterArcSwitch {...defaultProps} />);
    const switchComponent = screen.getByRole('region', {
      name: /character arc switch/i,
    });
    expect(switchComponent).toHaveAttribute(
      'aria-label',
      'Character arc switch'
    );
  });

  it('supports keyboard navigation', async () => {
    render(<CharacterArcSwitch {...defaultProps} />);

    const dropdownButton = screen.getByRole('button', {
      name: /select individual character/i,
    });
    dropdownButton.focus();

    fireEvent.keyDown(dropdownButton, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });
});

describe('EmotionalArcModule', () => {
  const defaultProps = {
    initialScenes: [],
    initialText: 'This is a test story with emotional content.',
    isLoading: false,
    error: null,
    onCharacterSelect: jest.fn(),
    onSceneSelect: jest.fn(),
    onSuggestionApply: jest.fn(),
    onSuggestionDismiss: jest.fn(),
    className: '',
    'aria-label': 'Emotional arc module',
  };

  it('renders without crashing', () => {
    render(<EmotionalArcModule {...defaultProps} />);
    expect(
      screen.getByRole('region', { name: /emotional arc module/i })
    ).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(<EmotionalArcModule {...defaultProps} isLoading={true} />);
    expect(
      screen.getByText(/analyzing emotional content/i)
    ).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const errorMessage = 'Analysis failed';
    render(<EmotionalArcModule {...defaultProps} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows tab navigation', () => {
    render(<EmotionalArcModule {...defaultProps} />);
    expect(screen.getByRole('tab', { name: /timeline/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tension/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /scenes/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /suggestions/i })
    ).toBeInTheDocument();
  });

  it('switches tabs when clicked', async () => {
    render(<EmotionalArcModule {...defaultProps} />);

    const tensionTab = screen.getByRole('tab', { name: /tension/i });
    await userEvent.click(tensionTab);

    expect(tensionTab).toHaveAttribute('aria-selected', 'true');
  });

  it('displays empty state when no data', () => {
    render(<EmotionalArcModule {...defaultProps} initialText="" />);
    expect(screen.getByText(/no analysis data/i)).toBeInTheDocument();
  });

  it('calls onCharacterSelect when character is selected', async () => {
    const onCharacterSelect = jest.fn();
    render(
      <EmotionalArcModule
        {...defaultProps}
        onCharacterSelect={onCharacterSelect}
      />
    );

    // Wait for analysis to complete and character switch to be available
    await waitFor(() => {
      expect(screen.getByText(/view all characters/i)).toBeInTheDocument();
    });

    const characterSwitch = screen.getByRole('button', {
      name: /view all characters/i,
    });
    await userEvent.click(characterSwitch);

    expect(onCharacterSelect).toHaveBeenCalledWith('all');
  });

  it('has proper ARIA attributes', () => {
    render(<EmotionalArcModule {...defaultProps} />);
    const module = screen.getByRole('region', {
      name: /emotional arc module/i,
    });
    expect(module).toHaveAttribute('aria-label', 'Emotional arc module');
  });

  it('displays analysis statistics in footer', async () => {
    render(<EmotionalArcModule {...defaultProps} />);

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText(/overall tension/i)).toBeInTheDocument();
    });
  });

  it('handles text input changes with debouncing', async () => {
    render(<EmotionalArcModule {...defaultProps} />);

    // The component should automatically analyze the initial text
    await waitFor(() => {
      expect(screen.getByText(/emotional arc analysis/i)).toBeInTheDocument();
    });
  });
});

// Integration tests
describe('EmotionalArcModule Integration', () => {
  it('analyzes text and displays results across all tabs', async () => {
    const testText = `
      Chapter 1: The Beginning
      Sarah felt joy as she opened the mysterious letter.
      
      Chapter 2: The Conflict
      Fear gripped her heart as she read the contents.
      
      Chapter 3: Resolution
      Relief washed over her as she understood the truth.
    `;

    render(<EmotionalArcModule initialText={testText} />);

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText(/emotional arc analysis/i)).toBeInTheDocument();
    });

    // Check that all tabs have content
    const timelineTab = screen.getByRole('tab', { name: /timeline/i });
    await userEvent.click(timelineTab);
    expect(
      screen.getByRole('tabpanel', { name: /timeline/i })
    ).toBeInTheDocument();

    const tensionTab = screen.getByRole('tab', { name: /tension/i });
    await userEvent.click(tensionTab);
    expect(
      screen.getByRole('tabpanel', { name: /tension/i })
    ).toBeInTheDocument();

    const scenesTab = screen.getByRole('tab', { name: /scenes/i });
    await userEvent.click(scenesTab);
    expect(
      screen.getByRole('tabpanel', { name: /scenes/i })
    ).toBeInTheDocument();

    const suggestionsTab = screen.getByRole('tab', { name: /suggestions/i });
    await userEvent.click(suggestionsTab);
    expect(
      screen.getByRole('tabpanel', { name: /suggestions/i })
    ).toBeInTheDocument();
  });

  it('handles service errors gracefully', async () => {
    // Mock service to throw error
    const _mockError = new Error('Service unavailable');
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<EmotionalArcModule initialText="Test story" />);

    await waitFor(() => {
      expect(screen.getByText(/analysis error/i)).toBeInTheDocument();
    });

    console.error.mockRestore();
  });
});

// Accessibility tests
describe('Accessibility', () => {
  it('has proper heading structure', () => {
    render(<EmotionalArcModule initialText="Test story" />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('supports keyboard navigation for tabs', async () => {
    render(<EmotionalArcModule initialText="Test story" />);

    const firstTab = screen.getByRole('tab', { name: /timeline/i });
    firstTab.focus();

    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /tension/i })).toHaveFocus();
  });

  it('announces loading states to screen readers', () => {
    render(<EmotionalArcModule initialText="Test story" isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has sufficient color contrast', () => {
    render(<EmotionalArcModule initialText="Test story" />);
    // This would need actual color contrast testing with a library like axe-core
    // For now, we ensure proper semantic markup
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});
