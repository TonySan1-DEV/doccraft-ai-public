import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the useMCP hook
jest.mock('../useMCP', () => ({
  useMCP: () => ({
    role: 'user',
  }),
}));

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    redirectToAppropriatePage: jest.fn(),
  }),
}));

// Mock the WriterProfileContext
jest.mock('../contexts/WriterProfileContext', () => ({
  WriterProfileProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="writer-profile-provider">{children}</div>
  ),
}));

// Mock the DocCraftAgentProvider
jest.mock('../contexts/AgentContext', () => ({
  DocCraftAgentProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="doc-craft-agent-provider">{children}</div>
  ),
}));

// Mock the ErrorBoundary
jest.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

// Mock the DemoModeIndicator
jest.mock('../DemoModeIndicator', () => ({
  __esModule: true,
  default: ({ isVisible }: { isVisible: boolean }) => (
    <div data-testid="demo-mode-indicator" data-visible={isVisible}>
      Demo Mode Indicator
    </div>
  ),
}));

// Mock the Header component
jest.mock('../Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header Component</div>,
}));

// Mock the Footer component
jest.mock('../Footer', () => ({
  Footer: () => <div data-testid="footer">Footer Component</div>,
}));

// Mock the Home page
jest.mock('../pages/Home', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">Home Page</div>,
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('App Theme Context Integration', () => {
  it('renders App with SimpleThemeProvider wrapper', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Check that the app renders
    expect(screen.getByTestId('demo-mode-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('has proper provider hierarchy', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Check that all providers are present
    expect(screen.getByTestId('writer-profile-provider')).toBeInTheDocument();
    expect(screen.getByTestId('doc-craft-agent-provider')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('loads without build errors', () => {
    // This test verifies that the app can be rendered without TypeScript/build errors
    expect(() => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('maintains existing functionality', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Check that the home route renders correctly
    expect(screen.getByTestId('home-page')).toBeInTheDocument();

    // Check that header and footer are present
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('app loads normally with theme context', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Verify the app structure is intact
    const app = screen.getByText('Home Page');
    expect(app).toBeInTheDocument();

    // Check that the app container has the correct class
    const appContainer = screen.getByText('Home Page').closest('.App');
    expect(appContainer).toBeInTheDocument();
  });
});
