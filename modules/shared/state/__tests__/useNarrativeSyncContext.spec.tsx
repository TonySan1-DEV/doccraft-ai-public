// MCP Context Block
/*
{
  file: "modules/shared/state/__tests__/useNarrativeSyncContext.spec.tsx",
  role: "qa",
  allowedActions: ["test", "validate", "mock"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "state_validation"
}
*/

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NarrativeSyncProvider, useNarrativeSync, WithNarrativeSync } from '../useNarrativeSyncContext';

// Mock PlotBeatAlignment type
const mockOverlay = [{ sceneId: 'scene1', beatId: 'beat1', beatLabel: 'Climax', expectedEmotionalTone: 'tension' }];

function TestConsumer() {
  const { state, setScene, setCharacter, updateOverlay } = useNarrativeSync();
  return (
    <div>
      <div data-testid="scene">{state.currentSceneId}</div>
      <div data-testid="character">{state.characterFocusId}</div>
      <div data-testid="overlay">{state.arcOverlay.length}</div>
      <button onClick={() => setScene('scene42')}>Set Scene</button>
      <button onClick={() => setCharacter('charX')}>Set Character</button>
      <button onClick={() => updateOverlay(mockOverlay)}>Set Overlay</button>
    </div>
  );
}

describe('useNarrativeSyncContext', () => {
  it('throws error if used outside provider', () => {
    // Suppress error output for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    spy.mockRestore();
  });

  it('provides and updates shared state', () => {
    render(
      <NarrativeSyncProvider>
        <TestConsumer />
      </NarrativeSyncProvider>
    );
    // Initial state
    expect(screen.getByTestId('scene')).toHaveTextContent('');
    expect(screen.getByTestId('character')).toHaveTextContent('');
    expect(screen.getByTestId('overlay')).toHaveTextContent('0');
    // Update scene
    fireEvent.click(screen.getByText('Set Scene'));
    expect(screen.getByTestId('scene')).toHaveTextContent('scene42');
    // Update character
    fireEvent.click(screen.getByText('Set Character'));
    expect(screen.getByTestId('character')).toHaveTextContent('charX');
    // Update overlay
    fireEvent.click(screen.getByText('Set Overlay'));
    expect(screen.getByTestId('overlay')).toHaveTextContent('1');
  });

  it('propagates updates across multiple consumers', () => {
    function SecondConsumer() {
      const { state } = useNarrativeSync();
      return <div data-testid="second-scene">{state.currentSceneId}</div>;
    }
    render(
      <NarrativeSyncProvider>
        <TestConsumer />
        <SecondConsumer />
      </NarrativeSyncProvider>
    );
    fireEvent.click(screen.getByText('Set Scene'));
    expect(screen.getByTestId('second-scene')).toHaveTextContent('scene42');
  });

  it('works with WithNarrativeSync wrapper', () => {
    render(
      <WithNarrativeSync>
        <TestConsumer />
      </WithNarrativeSync>
    );
    fireEvent.click(screen.getByText('Set Scene'));
    expect(screen.getByTestId('scene')).toHaveTextContent('scene42');
  });

  it('logs state transitions in dev mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(
      <NarrativeSyncProvider>
        <TestConsumer />
      </NarrativeSyncProvider>
    );
    fireEvent.click(screen.getByText('Set Scene'));
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[NarrativeSync] Action:'),
      expect.objectContaining({ type: 'setScene', sceneId: 'scene42' }),
      expect.anything()
    );
    logSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  // Accessibility: check for role/aria if visual indicator is present
  it('has accessible visual indicators if present', () => {
    render(
      <NarrativeSyncProvider>
        <TestConsumer />
      </NarrativeSyncProvider>
    );
    // No visual indicator in this mock, but check for testid presence
    expect(screen.getByTestId('scene')).toBeInTheDocument();
    expect(screen.getByTestId('character')).toBeInTheDocument();
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
  });
}); 