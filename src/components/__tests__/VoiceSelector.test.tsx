import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceSelector } from '../VoiceSelector';

// Mock useUserTier to simulate Pro user (so upsell doesn't render)
jest.mock('@/hooks/useUserTier', () => ({
  useUserTier: () => ({ tier: 'Pro', isProUser: true, isAdmin: false }),
}));

// Mock AudioPreviewPlayer so we don't rely on actual audio
jest.mock('@/modules/agent/components/AudioPreviewPlayer', () => ({
  __esModule: true,
  default: ({
    audioUrl,
    voiceName,
  }: {
    audioUrl: string;
    voiceName?: string;
  }) => <div data-testid="audio-preview">{voiceName || audioUrl}</div>,
}));

describe('VoiceSelector', () => {
  it('renders and allows selecting a voice', () => {
    const onChange = jest.fn();
    render(<VoiceSelector selectedVoice="emma" onChange={onChange} />);

    // Should show the voices by label from the component defaults
    const emma = screen.getByText(/Emma \(British\)/i);
    const liam = screen.getByText(/Liam \(American\)/i);

    expect(emma).toBeInTheDocument();
    expect(liam).toBeInTheDocument();

    // Click Liam to change
    fireEvent.click(liam);
    expect(onChange).toHaveBeenCalledWith('liam');
  });

  it('shows ProUpsell for non-pro users', () => {
    // Mock useUserTier to return Free user
    const mockUseUserTier = jest.fn(() => ({
      tier: 'Free',
      isProUser: false,
      isAdmin: false,
    }));

    jest.doMock('@/hooks/useUserTier', () => ({
      useUserTier: mockUseUserTier,
    }));

    // Re-import the component with the new mock
    const {
      VoiceSelector: VoiceSelectorWithFreeUser,
    } = require('../VoiceSelector');

    render(
      <VoiceSelectorWithFreeUser selectedVoice="emma" onChange={() => {}} />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    const onChange = jest.fn();
    render(<VoiceSelector selectedVoice="emma" onChange={onChange} />);

    const liamCard = screen
      .getByText(/Liam \(American\)/i)
      .closest('[role="button"]');
    expect(liamCard).toBeInTheDocument();

    // Simulate Enter key press
    fireEvent.keyDown(liamCard!, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('liam');
  });

  it('applies custom className', () => {
    const onChange = jest.fn();
    const { container } = render(
      <VoiceSelector
        selectedVoice="emma"
        onChange={onChange}
        className="custom-class"
      />
    );

    const gridElement = container.querySelector('.custom-class');
    expect(gridElement).toBeInTheDocument();
  });

  it('respects size prop', () => {
    const onChange = jest.fn();
    const { container } = render(
      <VoiceSelector selectedVoice="emma" onChange={onChange} size="lg" />
    );

    // Should have lg grid classes
    const gridElement = container.querySelector('.grid');
    expect(gridElement?.className).toContain('md:grid-cols-4');
  });
});
