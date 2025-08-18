import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimpleThemeChanger } from '../SimpleThemeChanger';
import { SimpleThemeProvider } from '../../contexts/SimpleThemeContext';

// Mock the SimpleThemeContext
const mockSetTheme = jest.fn();
const mockCurrentTheme = {
  id: 'ocean-blue',
  name: 'Ocean Blue',
  primary: '#1e3a8a',
  secondary: '#3b82f6',
  accent: '#60a5fa',
};

// Mock the useSimpleTheme hook
jest.mock('../../contexts/SimpleThemeContext', () => ({
  ...jest.requireActual('../../contexts/SimpleThemeContext'),
  useSimpleTheme: () => ({
    currentTheme: mockCurrentTheme,
    setTheme: mockSetTheme,
    getCurrentTheme: () => mockCurrentTheme,
  }),
}));

describe('SimpleThemeChanger', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renders without errors', () => {
    render(
      <SimpleThemeProvider>
        <SimpleThemeChanger />
      </SimpleThemeProvider>
    );

    expect(screen.getByLabelText('Change theme')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows current theme color circle', () => {
    render(
      <SimpleThemeProvider>
        <SimpleThemeChanger />
      </SimpleThemeProvider>
    );

    const colorCircle = screen.getByTitle('Current theme: Ocean Blue');
    expect(colorCircle).toBeInTheDocument();
    expect(colorCircle).toHaveStyle({ backgroundColor: '#1e3a8a' });
  });

  it('opens dropdown when clicked', () => {
    render(
      <SimpleThemeProvider>
        <SimpleThemeChanger />
      </SimpleThemeProvider>
    );

    const button = screen.getByLabelText('Change theme');
    fireEvent.click(button);

    expect(screen.getByText('Ocean Blue')).toBeInTheDocument();
    expect(screen.getByText('Forest Green')).toBeInTheDocument();
    expect(screen.getByText('Royal Purple')).toBeInTheDocument();
    expect(screen.getByText('Ruby Red')).toBeInTheDocument();
    expect(screen.getByText('Sunset Orange')).toBeInTheDocument();
  });

  it('shows 5 clickable theme options', () => {
    render(
      <SimpleThemeProvider>
        <SimpleThemeChanger />
      </SimpleThemeProvider>
    );

    const button = screen.getByLabelText('Change theme');
    fireEvent.click(button);

    const themeOptions = screen.getAllByRole('option');
    expect(themeOptions).toHaveLength(5);
  });

  it('calls setTheme function when theme option is clicked', async () => {
    render(
      <SimpleThemeProvider>
        <SimpleThemeChanger />
      </SimpleThemeProvider>
    );

    const button = screen.getByLabelText('Change theme');
    fireEvent.click(button);

    const forestGreenOption = screen.getByText('Forest Green');
    fireEvent.click(forestGreenOption);

    await waitFor(() => {
      expect(mockSetTheme).toHaveBeenCalledWith('forest-green');
    });
  });

  it('closes dropdown after theme selection', async () => {
    render(
      <SimpleThemeProvider>
        <SimpleThemeChanger />
      </SimpleThemeProvider>
    );

    const button = screen.getByLabelText('Change theme');
    fireEvent.click(button);

    // Verify dropdown is open
    expect(screen.getByText('Forest Green')).toBeInTheDocument();

    // Click a theme option
    const forestGreenOption = screen.getByText('Forest Green');
    fireEvent.click(forestGreenOption);

    // Verify dropdown is closed
    await waitFor(() => {
      expect(screen.queryByText('Forest Green')).not.toBeInTheDocument();
    });
  });

  it('indicates current theme visually', () => {
    render(
      <SimpleThemeProvider>
        <SimpleThemeChanger />
      </SimpleThemeProvider>
    );

    const button = screen.getByLabelText('Change theme');
    fireEvent.click(button);

    // Current theme should have "Current" indicator
    expect(screen.getByText('Current')).toBeInTheDocument();

    // Current theme should have blue styling
    const currentThemeOption = screen.getByText('Ocean Blue').closest('button');
    expect(currentThemeOption).toHaveClass('bg-blue-50');
  });

  it('has proper accessibility attributes', () => {
    render(
      <SimpleThemeProvider>
        <SimpleThemeChanger />
      </SimpleThemeProvider>
    );

    const button = screen.getByLabelText('Change theme');
    expect(button).toHaveAttribute('aria-label', 'Change theme');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <SimpleThemeProvider>
        <div>
          <SimpleThemeChanger />
          <div data-testid="outside">Outside content</div>
        </div>
      </SimpleThemeProvider>
    );

    const button = screen.getByLabelText('Change theme');
    fireEvent.click(button);

    // Verify dropdown is open
    expect(screen.getByText('Forest Green')).toBeInTheDocument();

    // Click outside
    const outsideContent = screen.getByTestId('outside');
    fireEvent.click(outsideContent);

    // Verify dropdown is closed
    expect(screen.queryByText('Forest Green')).not.toBeInTheDocument();
  });
});
