import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceSelector } from '@/components/VoiceSelector';

// Mock useUserTier to simulate Pro user (so upsell doesn't render)
jest.mock('@/hooks/useUserTier', () => ({
  useUserTier: () => ({ tier: 'Pro', isProUser: true, isAdmin: false }),
}));

// Mock AudioPreviewPlayer so we don't rely on actual audio
jest.mock('@/modules/agent/components/AudioPreviewPlayer', () => ({
  AudioPreviewPlayer: ({ src, label }: { src: string; label?: string }) => (
    <div data-testid="audio-preview">{label || src}</div>
  ),
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
    jest.resetModules();
    jest.doMock('@/hooks/useUserTier', () => ({
      useUserTier: () => ({ tier: 'Free', isProUser: false, isAdmin: false }),
    }));
    const { VoiceSelector: VS2 } = require('@/components/VoiceSelector');
    const {
      render: render2,
      screen: screen2,
    } = require('@testing-library/react');

    render2(<VS2 selectedVoice="emma" onChange={() => {}} />);
    expect(screen2.getByRole('alert')).toBeInTheDocument();
  });
});
