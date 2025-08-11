import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceSelector } from '../VoiceSelector';

// Mock useUserTier to simulate Pro user (so upsell doesn't render)
jest.mock('@/hooks/useUserTier', () => ({
  useUserTier: jest.fn(() => ({
    tier: 'Pro',
    isProUser: true,
    isAdmin: false,
  })),
}));

// Mock AudioPreviewPlayer so we don't rely on actual audio
jest.mock('../../modules/agent/components/AudioPreviewPlayer', () => ({
  __esModule: true,
  default: ({
    audioUrl,
    voiceName,
  }: {
    audioUrl: string;
    voiceName?: string;
  }) => <div data-testid="audio-preview">{voiceName || audioUrl}</div>,
}));

// Mock ProUpsell component
jest.mock('@/components/ProUpsell', () => ({
  ProUpsell: ({ message }: { message: string }) => (
    <div role="alert" data-testid="pro-upsell">
      {message}
    </div>
  ),
}));

describe('VoiceSelector', () => {
  const mockVoices = [
    {
      id: 'emma',
      name: 'Emma',
      accent: 'British',
      language: 'en-GB',
      dialect: 'british',
      gender: 'female',
      age: 'adult',
      quality: 9,
    },
    {
      id: 'liam',
      name: 'Liam',
      accent: 'American',
      language: 'en-US',
      dialect: 'american',
      gender: 'male',
      age: 'adult',
      quality: 8,
    },
    {
      id: 'sofia',
      name: 'Sofia',
      accent: 'Spanish',
      language: 'es',
      dialect: 'castilian',
      gender: 'female',
      age: 'young',
      quality: 7,
    },
  ];

  beforeEach(() => {
    // Reset the mock to default Pro user for each test
    const { useUserTier } = require('@/hooks/useUserTier');
    (useUserTier as jest.Mock).mockReturnValue({
      tier: 'Pro',
      isProUser: true,
      isAdmin: false,
    });
  });

  it('renders and allows selecting a voice', () => {
    const handleChange = jest.fn();
    render(
      <VoiceSelector
        voices={mockVoices}
        selectedVoice="emma"
        onChange={handleChange}
        showPreviews={true}
      />
    );

    // Should show the voices by label from the component defaults
    const emma = screen.getByText('Emma (British)', {
      selector: 'span.font-semibold',
    });
    const liam = screen.getByText('Liam (American)', {
      selector: 'span.font-semibold',
    });
    const sofia = screen.getByText('Sofia (Spanish)', {
      selector: 'span.font-semibold',
    });

    expect(emma).toBeInTheDocument();
    expect(liam).toBeInTheDocument();
    expect(sofia).toBeInTheDocument();

    // Should show audio previews
    expect(screen.getAllByTestId('audio-preview')).toHaveLength(3);

    // Should show selected state for Emma
    expect(screen.getByText('Selected')).toBeInTheDocument();

    // Click on Liam to select it
    const liamCard = liam.closest('[role="gridcell"]');
    expect(liamCard).toBeInTheDocument();
    fireEvent.click(liamCard!);

    expect(handleChange).toHaveBeenCalledWith('liam');
  });

  it('shows ProUpsell for non-pro users', () => {
    // Override the mock for this test to simulate non-pro user
    const { useUserTier } = require('@/hooks/useUserTier');
    (useUserTier as jest.Mock).mockReturnValue({
      tier: 'Free',
      isProUser: false,
      isAdmin: false,
    });

    render(
      <VoiceSelector
        voices={mockVoices}
        selectedVoice="emma"
        onChange={() => {}}
        showPreviews={true}
      />
    );

    expect(screen.getByTestId('pro-upsell')).toBeInTheDocument();
    expect(
      screen.getByText('Voice selection is a Pro feature.')
    ).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    const handleChange = jest.fn();
    render(
      <VoiceSelector
        voices={mockVoices}
        selectedVoice="emma"
        onChange={handleChange}
        showPreviews={true}
      />
    );

    const liamCard = screen
      .getByText('Liam (American)', { selector: 'span.font-semibold' })
      .closest('[role="gridcell"]');
    expect(liamCard).toBeInTheDocument();

    // Focus and select Liam with Enter
    fireEvent.focus(liamCard!);
    fireEvent.keyDown(liamCard!, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith('liam');
  });

  it('applies custom className', () => {
    render(
      <VoiceSelector
        voices={mockVoices}
        selectedVoice="emma"
        onChange={() => {}}
        className="custom-class"
      />
    );

    // The className should be applied to the root container
    const container = screen.getByRole('grid').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('respects size prop', () => {
    render(
      <VoiceSelector
        voices={mockVoices}
        selectedVoice="emma"
        onChange={() => {}}
        size="lg"
      />
    );

    const grid = screen.getByRole('grid');
    // Check for the actual classes that should be applied based on size="lg"
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-4');
  });

  it('shows audio previews when showPreviews is true', () => {
    render(
      <VoiceSelector
        voices={mockVoices}
        selectedVoice="emma"
        onChange={() => {}}
        showPreviews={true}
      />
    );

    expect(screen.getAllByTestId('audio-preview')).toHaveLength(3);
  });

  it('hides audio previews when showPreviews is false', () => {
    render(
      <VoiceSelector
        voices={mockVoices}
        selectedVoice="emma"
        onChange={() => {}}
        showPreviews={false}
      />
    );

    expect(screen.queryByTestId('audio-preview')).not.toBeInTheDocument();
  });

  it('shows selected voice indicator', () => {
    render(
      <VoiceSelector
        voices={mockVoices}
        selectedVoice="emma"
        onChange={() => {}}
        showPreviews={true}
      />
    );

    // Should show selected indicator
    const selectedIndicator = screen.getByText('Selected');
    expect(selectedIndicator).toBeInTheDocument();

    // Should be associated with Emma's card
    const emmaCard = selectedIndicator.closest('[role="gridcell"]');
    expect(emmaCard).toHaveTextContent('Emma (British)');
  });
});
