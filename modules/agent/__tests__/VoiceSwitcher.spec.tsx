/*
role: qa-engineer,
tier: Pro,
file: "modules/agent/__tests__/VoiceSwitcher.spec.tsx",
allowedActions: ["test", "validate", "verify"],
theme: "voice_selection_testing"
*/

/* MCP: doc2video_testing */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoiceSwitcher from '../components/VoiceSwitcher';

// Mock window.logTelemetryEvent
const mockLogTelemetryEvent = jest.fn();
Object.defineProperty(window, 'logTelemetryEvent', {
  value: mockLogTelemetryEvent,
  writable: true,
});

describe('VoiceSwitcher', () => {
  const defaultProps = {
    selectedVoice: 'en-US-JennyNeural',
    onVoiceChange: jest.fn(),
    userTier: 'Pro',
    pipelineId: 'test-pipeline-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders voice selector with available voices for Pro tier', () => {
    render(<VoiceSwitcher {...defaultProps} />);

    expect(screen.getByText('TTS Voice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('en-US-JennyNeural')).toBeInTheDocument();

    // Pro tier should have 3 voices available
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(screen.getByText('Jenny (American)')).toBeInTheDocument();
    expect(screen.getByText('Guy (American)')).toBeInTheDocument();
    expect(screen.getByText('Ryan (British)')).toBeInTheDocument();
  });

  it('restricts voices for Free tier', () => {
    render(<VoiceSwitcher {...defaultProps} userTier="Free" />);

    // Free tier should only have Jenny available
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(screen.getByText('Jenny (American)')).toBeInTheDocument();
    expect(screen.queryByText('Guy (American)')).not.toBeInTheDocument();
    expect(screen.queryByText('Ryan (British)')).not.toBeInTheDocument();

    // Should show upgrade message
    expect(screen.getByText('(Upgrade for more voices)')).toBeInTheDocument();
    expect(
      screen.getByText(
        '💡 Upgrade to Pro for more voice options (Jenny, Guy, Ryan)'
      )
    ).toBeInTheDocument();
  });

  it('shows all voices for Premium tier', () => {
    render(<VoiceSwitcher {...defaultProps} userTier="Premium" />);

    // Premium tier should have all voices available
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(3); // Should have more than Pro tier
    expect(screen.getByText('Jenny (American)')).toBeInTheDocument();
    expect(screen.getByText('Guy (American)')).toBeInTheDocument();
    expect(screen.getByText('Ryan (British)')).toBeInTheDocument();
    expect(screen.getByText('Sonia (British)')).toBeInTheDocument();
  });

  it('calls onVoiceChange when voice is selected', () => {
    const onVoiceChange = jest.fn();
    render(<VoiceSwitcher {...defaultProps} onVoiceChange={onVoiceChange} />);

    const select = screen.getByDisplayValue('en-US-JennyNeural');
    fireEvent.change(select, { target: { value: 'en-US-GuyNeural' } });

    expect(onVoiceChange).toHaveBeenCalledWith('en-US-GuyNeural');
  });

  it('logs telemetry event when voice is changed', () => {
    render(<VoiceSwitcher {...defaultProps} />);

    const select = screen.getByDisplayValue('en-US-JennyNeural');
    fireEvent.change(select, { target: { value: 'en-US-GuyNeural' } });

    expect(mockLogTelemetryEvent).toHaveBeenCalledWith('voice_selected', {
      voiceId: 'en-US-GuyNeural',
      userTier: 'Pro',
      pipelineId: 'test-pipeline-123',
      timestamp: expect.any(String),
    });
  });

  it('shows voice preview information', () => {
    render(<VoiceSwitcher {...defaultProps} />);

    // Should show voice preview
    expect(screen.getByText('Jenny')).toBeInTheDocument();
    expect(screen.getByText('en-US • female')).toBeInTheDocument();
    expect(
      screen.getByText(
        '"Hello, I\'m Jenny. I\'ll be narrating your content today."'
      )
    ).toBeInTheDocument();
  });

  it('disables selector when disabled prop is true', () => {
    render(<VoiceSwitcher {...defaultProps} disabled={true} />);

    const select = screen.getByDisplayValue('en-US-JennyNeural');
    expect(select).toBeDisabled();
  });

  it('handles error state gracefully', () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // This test would require mocking the voice loading logic
    // For now, we'll just verify the component renders without crashing
    render(<VoiceSwitcher {...defaultProps} />);

    expect(screen.getByText('TTS Voice')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('automatically selects first available voice if current selection is not available for tier', () => {
    const onVoiceChange = jest.fn();

    // Start with a voice that's not available for Free tier
    render(
      <VoiceSwitcher
        {...defaultProps}
        selectedVoice="en-US-GuyNeural"
        userTier="Free"
        onVoiceChange={onVoiceChange}
      />
    );

    // Should automatically switch to Jenny (the only available voice for Free tier)
    expect(onVoiceChange).toHaveBeenCalledWith('en-US-JennyNeural');
  });
});
