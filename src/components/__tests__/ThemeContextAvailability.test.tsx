import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useSimpleTheme } from '../../contexts/SimpleThemeContext';
import { SimpleThemeProvider } from '../../contexts/SimpleThemeContext';

// Test component that uses the theme context
const TestThemeComponent: React.FC = () => {
  const { currentTheme, setTheme } = useSimpleTheme();

  return (
    <div>
      <h2>Theme Test Component</h2>
      <p>Current Theme: {currentTheme.name}</p>
      <p>Primary Color: {currentTheme.primary}</p>
      <button onClick={() => setTheme('forest-green')}>
        Switch to Forest Green
      </button>
      <button onClick={() => setTheme('royal-purple')}>
        Switch to Royal Purple
      </button>
    </div>
  );
};

// Test wrapper with theme provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <SimpleThemeProvider>{children}</SimpleThemeProvider>
  </BrowserRouter>
);

describe('Theme Context Availability', () => {
  it('provides theme context to components', () => {
    render(
      <TestWrapper>
        <TestThemeComponent />
      </TestWrapper>
    );

    // Check that the component can access theme context
    expect(screen.getByText('Current Theme: Ocean Blue')).toBeInTheDocument();
    expect(screen.getByText('Primary Color: #1e3a8a')).toBeInTheDocument();
  });

  it('allows theme switching', () => {
    render(
      <TestWrapper>
        <TestThemeComponent />
      </TestWrapper>
    );

    // Initially should show Ocean Blue
    expect(screen.getByText('Current Theme: Ocean Blue')).toBeInTheDocument();

    // Click to switch to Forest Green
    const forestGreenButton = screen.getByText('Switch to Forest Green');
    fireEvent.click(forestGreenButton);

    // Should now show Forest Green
    expect(screen.getByText('Current Theme: Forest Green')).toBeInTheDocument();
    expect(screen.getByText('Primary Color: #166534')).toBeInTheDocument();
  });

  it('maintains theme state across component updates', () => {
    render(
      <TestWrapper>
        <TestThemeComponent />
      </TestWrapper>
    );

    // Switch to Royal Purple
    const royalPurpleButton = screen.getByText('Switch to Royal Purple');
    fireEvent.click(royalPurpleButton);

    // Should show Royal Purple
    expect(screen.getByText('Current Theme: Royal Purple')).toBeInTheDocument();
    expect(screen.getByText('Primary Color: #581c87')).toBeInTheDocument();

    // Switch back to Forest Green
    const forestGreenButton = screen.getByText('Switch to Forest Green');
    fireEvent.click(forestGreenButton);

    // Should show Forest Green
    expect(screen.getByText('Current Theme: Forest Green')).toBeInTheDocument();
    expect(screen.getByText('Primary Color: #166534')).toBeInTheDocument();
  });

  it('provides all theme properties', () => {
    render(
      <TestWrapper>
        <TestThemeComponent />
      </TestWrapper>
    );

    // Check that the theme object has all required properties
    const themeName = screen.getByText(/Current Theme:/);
    const primaryColor = screen.getByText(/Primary Color:/);

    expect(themeName).toBeInTheDocument();
    expect(primaryColor).toBeInTheDocument();

    // Verify the theme switching buttons are present
    expect(screen.getByText('Switch to Forest Green')).toBeInTheDocument();
    expect(screen.getByText('Switch to Royal Purple')).toBeInTheDocument();
  });
});
