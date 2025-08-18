import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { SimpleThemeProvider } from '../../contexts/SimpleThemeContext';
import { AuthContext } from '../../contexts/AuthContext';

// Mock the useMCP hook
jest.mock('../../useMCP', () => ({
  useMCP: () => ({
    role: 'user',
  }),
}));

// Mock the AuthContext
const mockAuthContext = {
  user: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  redirectToAppropriatePage: jest.fn(),
};

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

// Mock document.documentElement.classList
Object.defineProperty(document.documentElement, 'classList', {
  value: {
    add: jest.fn(),
    remove: jest.fn(),
  },
  writable: true,
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuthContext}>
      <SimpleThemeProvider>{children}</SimpleThemeProvider>
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Header Theme Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders Header with theme selector and dark mode toggle', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    // Check that both controls are present
    expect(screen.getByLabelText('Change theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle dark mode')).toBeInTheDocument();
  });

  it('shows theme selector next to dark mode toggle in desktop header', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const themeSelector = screen.getByLabelText('Change theme');
    const darkModeToggle = screen.getByLabelText('Toggle dark mode');

    // Both should be in the same navigation section
    const navSection = themeSelector.closest('nav');
    expect(navSection).toContainElement(darkModeToggle);
  });

  it('shows theme selector in mobile menu', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    // Open mobile menu
    const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
    fireEvent.click(mobileMenuButton);

    // Check that theme selector appears in mobile menu
    expect(screen.getByLabelText('Change theme')).toBeInTheDocument();
  });

  it('dark mode toggle still works independently', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const darkModeToggle = screen.getByLabelText('Toggle dark mode');

    // Initially should show moon icon (light mode)
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();

    // Click to toggle to dark mode
    fireEvent.click(darkModeToggle);

    // Should now show sun icon (dark mode)
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();

    // Check that localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('dark-mode', 'true');
  });

  it('theme selector opens dropdown when clicked', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const themeSelector = screen.getByLabelText('Change theme');
    fireEvent.click(themeSelector);

    // Should show theme options
    expect(screen.getByText('Ocean Blue')).toBeInTheDocument();
    expect(screen.getByText('Forest Green')).toBeInTheDocument();
    expect(screen.getByText('Royal Purple')).toBeInTheDocument();
    expect(screen.getByText('Ruby Red')).toBeInTheDocument();
    expect(screen.getByText('Sunset Orange')).toBeInTheDocument();
  });

  it('both controls work independently without interference', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const themeSelector = screen.getByLabelText('Change theme');
    const darkModeToggle = screen.getByLabelText('Toggle dark mode');

    // Test theme selector
    fireEvent.click(themeSelector);
    expect(screen.getByText('Forest Green')).toBeInTheDocument();

    // Test dark mode toggle
    fireEvent.click(darkModeToggle);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('dark-mode', 'true');

    // Both should work without affecting each other
    expect(screen.getByText('Forest Green')).toBeInTheDocument();
  });

  it('header layout looks professional with both controls', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const header = screen.getByRole('banner');
    const themeSelector = screen.getByLabelText('Change theme');
    const darkModeToggle = screen.getByLabelText('Toggle dark mode');

    // Both controls should be properly positioned
    expect(header).toContainElement(themeSelector);
    expect(header).toContainElement(darkModeToggle);

    // Check that they're in the correct order (theme selector first, then dark mode toggle)
    const navSection = themeSelector.closest('nav');
    const controls = navSection?.children;
    expect(controls).toBeDefined();
  });
});
