// MCP Context Block
/*
role: qa-engineer,
tier: Pro,
file: "modules/agent/__tests__/agentEndToEnd.spec.ts",
allowedActions: ["test", "report", "summarize"],
theme: "agent_qa"
*/

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DocCraftAgentProvider } from '../contexts/DocCraftAgentProvider';
import { AppShellAgentIntegration } from '../ui/AppShellAgentIntegration';
import { DocCraftAgentChat } from '../components/DocCraftAgentChat';

// Mock the agent services
jest.mock('../services/agentChatRouter', () => ({
  agentChatRouter: jest.fn()
}));

jest.mock('../services/useLLMFallback', () => ({
  queryLLMFallback: jest.fn()
}));

jest.mock('../services/agentTelemetry', () => ({
  trackSuggestion: jest.fn(),
  trackTipShown: jest.fn(),
  trackTipDismissed: jest.fn(),
  trackLLMFallbackUsage: jest.fn()
}));

import { agentChatRouter } from '../services/agentChatRouter';
import { queryLLMFallback } from '../services/useLLMFallback';
import { trackSuggestion, trackTipShown, trackTipDismissed, trackLLMFallbackUsage } from '../services/agentTelemetry';

const mockAgentChatRouter = agentChatRouter as jest.MockedFunction<typeof agentChatRouter>;
const mockQueryLLMFallback = queryLLMFallback as jest.MockedFunction<typeof queryLLMFallback>;
const mockTrackSuggestion = trackSuggestion as jest.MockedFunction<typeof trackSuggestion>;
const mockTrackTipShown = trackTipShown as jest.MockedFunction<typeof trackTipShown>;
const mockTrackTipDismissed = trackTipDismissed as jest.MockedFunction<typeof trackTipDismissed>;
const mockTrackLLMFallbackUsage = trackLLMFallbackUsage as jest.MockedFunction<typeof trackLLMFallbackUsage>;

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; userRole?: string; tier?: string }> = ({ 
  children, 
  userRole = 'frontend-developer', 
  tier = 'Pro' 
}) => (
  <BrowserRouter>
    <DocCraftAgentProvider userRole={userRole} tier={tier}>
      <AppShellAgentIntegration currentUser={{ role: userRole, tier }}>
        {children}
      </AppShellAgentIntegration>
    </DocCraftAgentProvider>
  </BrowserRouter>
);

describe('DocCraft Agent End-to-End Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful agent responses
    mockAgentChatRouter.mockResolvedValue({
      type: 'agent',
      content: 'Test response',
      suggestedActions: [{ label: 'Show Me', action: 'showOnboarding' }]
    });
  });

  describe('Agent Visibility Toggle', () => {
    it('should show/hide agent chat panel when toggle button is clicked', async () => {
      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Agent should be hidden initially
      expect(screen.queryByText('DocCraft Agent')).not.toBeInTheDocument();

      // Find and click the agent toggle button
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      expect(toggleButton).toBeInTheDocument();

      // Click to show agent
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });

      // Click to hide agent
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.queryByText('DocCraft Agent')).not.toBeInTheDocument();
      });
    });

    it('should handle keyboard shortcuts for agent toggle', async () => {
      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Simulate Cmd+Shift+A (Mac) or Ctrl+Shift+A (Windows)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? 'metaKey' : 'ctrlKey';
      
      fireEvent.keyDown(document, {
        key: 'a',
        [modifierKey]: true,
        shiftKey: true
      });

      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });
    });

    it('should close agent with ESC key when visible', async () => {
      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Show agent first
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });

      // Press ESC to close
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('DocCraft Agent')).not.toBeInTheDocument();
      });
    });
  });

  describe('Onboarding Flow Launch', () => {
    it('should launch onboarding flow when /onboarding command is used', async () => {
      mockAgentChatRouter.mockResolvedValueOnce({
        type: 'agent',
        content: 'Onboarding for onboarding-theme started.',
        relatedStepId: 'theme-step-1',
        suggestedActions: [{ label: 'Resume Onboarding', action: 'resumeOnboarding' }]
      });

      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Show agent
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });

      // Find input and send onboarding command
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: '/onboarding theme' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Onboarding for onboarding-theme started.')).toBeInTheDocument();
        expect(screen.getByText('Resume Onboarding')).toBeInTheDocument();
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith('/onboarding theme', 'frontend-developer', 'Pro');
    });
  });

  describe('KB Query Routing', () => {
    it('should route KB queries and return correct responses', async () => {
      mockAgentChatRouter.mockResolvedValueOnce({
        type: 'agent',
        content: 'To check for emotional drift, use the Emotion Timeline Chart in the dashboard.',
        kbRef: 'kb-emotion-drift',
        suggestedActions: [
          { label: 'Show Me', action: 'showOnboarding', targetStepId: 'kb-emotion-drift' },
          { label: 'Open Docs', action: 'openDocs' }
        ],
        mcp: { role: 'frontend-developer', tier: 'Pro', theme: 'emotion_analysis' }
      });

      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Show agent
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });

      // Send KB query
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'How do I check for emotional drift?' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('To check for emotional drift, use the Emotion Timeline Chart in the dashboard.')).toBeInTheDocument();
        expect(screen.getByText('Show Me')).toBeInTheDocument();
        expect(screen.getByText('Open Docs')).toBeInTheDocument();
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith(
        'How do I check for emotional drift?',
        'frontend-developer',
        'Pro'
      );
    });
  });

  describe('LLM Fallback Path', () => {
    it('should use LLM fallback for unknown queries', async () => {
      // First call returns no KB match, second call uses LLM fallback
      mockAgentChatRouter
        .mockResolvedValueOnce({
          type: 'agent',
          content: 'I can help you with that! Based on your Pro tier access...',
          suggestedActions: [{ label: 'Export Data', action: 'export' }],
          llmFallback: true,
          modelUsed: 'gpt-4'
        });

      mockQueryLLMFallback.mockResolvedValueOnce({
        content: 'I can help you with that! Based on your Pro tier access...',
        suggestedActions: [{ label: 'Export Data', action: 'export' }],
        modelUsed: 'gpt-4'
      });

      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Show agent
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });

      // Send unknown query
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'What is quantum physics?' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/I can help you with that!/)).toBeInTheDocument();
        expect(screen.getByText('Export Data')).toBeInTheDocument();
      });

      expect(mockQueryLLMFallback).toHaveBeenCalledWith(
        'What is quantum physics?',
        expect.objectContaining({
          userRole: 'frontend-developer',
          tier: 'Pro'
        })
      );

      expect(mockTrackLLMFallbackUsage).toHaveBeenCalledWith(
        'What is quantum physics?',
        'gpt-4'
      );
    });
  });

  describe('Proactive Tip Triggers', () => {
    it('should trigger proactive tips based on navigation events', async () => {
      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Simulate navigation to dashboard (first time)
      fireEvent.click(screen.getByTestId('main-content'));
      
      // Wait for proactive tip to appear
      await waitFor(() => {
        expect(mockTrackTipShown).toHaveBeenCalledWith(
          'first-dashboard-visit',
          expect.objectContaining({ module: 'dashboard' })
        );
      }, { timeout: 5000 });
    });

    it('should track suggestion clicks and dismissals', async () => {
      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Show agent
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });

      // Send a query that returns suggestions
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'How do I export data?' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Show Me')).toBeInTheDocument();
      });

      // Click a suggestion
      const suggestionButton = screen.getByText('Show Me');
      fireEvent.click(suggestionButton);

      expect(mockTrackSuggestion).toHaveBeenCalledWith('Show Me', 'agentChat', true);
    });
  });

  describe('MCP Access Control', () => {
    it('should block Free tier users from accessing agent', () => {
      render(
        <TestWrapper userRole="frontend-developer" tier="Free">
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Should show upgrade button instead of agent toggle
      const upgradeButton = screen.getByLabelText('Upgrade to Pro to access the DocCraft Assistant');
      expect(upgradeButton).toBeInTheDocument();

      // Should not show agent toggle
      expect(screen.queryByLabelText(/Open DocCraft Assistant/)).not.toBeInTheDocument();
    });

    it('should allow Pro tier users to access all features', async () => {
      render(
        <TestWrapper userRole="frontend-developer" tier="Pro">
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Should show agent toggle
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      expect(toggleButton).toBeInTheDocument();

      // Should be able to open agent
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle agent service failures gracefully', async () => {
      mockAgentChatRouter.mockRejectedValueOnce(new Error('Service unavailable'));

      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Show agent
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });

      // Send query that will fail
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Test query' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/I'm having trouble processing/)).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('should handle LLM fallback failures gracefully', async () => {
      mockQueryLLMFallback.mockRejectedValueOnce(new Error('LLM service down'));

      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Show agent
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });

      // Send unknown query that will trigger fallback
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: 'Unknown query' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/I'm having trouble processing/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should support screen reader navigation', async () => {
      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Show agent
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });

      // Check for ARIA attributes
      const agentPanel = screen.getByRole('dialog');
      expect(agentPanel).toBeInTheDocument();
      expect(agentPanel).toHaveAttribute('aria-modal', 'true');

      // Check for live regions
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should announce proactive tips to screen readers', async () => {
      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Simulate proactive tip
      const { addProactiveMessage } = require('../contexts/DocCraftAgentProvider');
      addProactiveMessage({
        type: 'agent',
        content: '💡 Pro Tip: Export your analysis results',
        isProactive: true
      });

      // Check for ARIA live region
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
}); 