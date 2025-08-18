import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SimpleThemeProvider, useSimpleTheme } from '../SimpleThemeContext';
import { simpleThemes } from '../../configs/simpleThemes';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component to use the context
function TestComponent() {
  const { currentTheme, setTheme, getCurrentTheme } = useSimpleTheme();

  return (
    <div>
      <div data-testid="theme-name">{currentTheme.name}</div>
      <div data-testid="theme-primary">{currentTheme.primary}</div>
      <button onClick={() => setTheme('forest-green')}>
        Switch to Forest Green
      </button>
      <button onClick={() => setTheme('royal-purple')}>
        Switch to Royal Purple
      </button>
    </div>
  );
}

describe('SimpleThemeContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset CSS variables
    document.documentElement.style.removeProperty('--theme-primary');
    document.documentElement.style.removeProperty('--theme-secondary');
    document.documentElement.style.removeProperty('--theme-accent');
  });

  it('should provide default theme (Ocean Blue)', () => {
    render(
      <SimpleThemeProvider>
        <TestComponent />
      </SimpleThemeProvider>
    );

    expect(screen.getByTestId('theme-name')).toHaveTextContent('Ocean Blue');
    expect(screen.getByTestId('theme-primary')).toHaveTextContent('#1e3a8a');
  });

  it('should set CSS variables on theme change', () => {
    render(
      <SimpleThemeProvider>
        <TestComponent />
      </SimpleThemeProvider>
    );

    const root = document.documentElement;

    // Check that default theme CSS variables are set
    expect(root.style.getPropertyValue('--theme-primary')).toBe('#1e3a8a');
    expect(root.style.getPropertyValue('--theme-secondary')).toBe('#3b82f6');
    expect(root.style.getPropertyValue('--theme-accent')).toBe('#60a5fa');
  });

  it('should change theme when setTheme is called', () => {
    render(
      <SimpleThemeProvider>
        <TestComponent />
      </SimpleThemeProvider>
    );

    const forestGreenButton = screen.getByText('Switch to Forest Green');

    act(() => {
      forestGreenButton.click();
    });

    expect(screen.getByTestId('theme-name')).toHaveTextContent('Forest Green');
    expect(screen.getByTestId('theme-primary')).toHaveTextContent('#166534');

    // Check that CSS variables are updated
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--theme-primary')).toBe('#166534');
    expect(root.style.getPropertyValue('--theme-secondary')).toBe('#16a34a');
    expect(root.style.getPropertyValue('--theme-accent')).toBe('#22c55e');
  });

  it('should save theme to localStorage', () => {
    render(
      <SimpleThemeProvider>
        <TestComponent />
      </SimpleThemeProvider>
    );

    const royalPurpleButton = screen.getByText('Switch to Royal Purple');

    act(() => {
      royalPurpleButton.click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'simple-theme-id',
      'royal-purple'
    );
  });

  it('should load theme from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('ruby-red');

    render(
      <SimpleThemeProvider>
        <TestComponent />
      </SimpleThemeProvider>
    );

    expect(screen.getByTestId('theme-name')).toHaveTextContent('Ruby Red');
    expect(screen.getByTestId('theme-primary')).toHaveTextContent('#991b1b');
  });

  it('should handle invalid theme ID gracefully', () => {
    render(
      <SimpleThemeProvider>
        <TestComponent />
      </SimpleThemeProvider>
    );

    const { setTheme } = useSimpleTheme();

    act(() => {
      setTheme('invalid-theme-id');
    });

    // Should remain on current theme (not crash)
    expect(screen.getByTestId('theme-name')).toHaveTextContent('Ocean Blue');
  });
});
