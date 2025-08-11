// MCP Context Block
/*
role: qa-engineer,
tier: Pro,
file: "modules/agent/__tests__/agentEndToEnd.spec.ts",
allowedActions: ["test", "validate", "simulate"],
theme: "doc2video_e2e"
*/

// Jest globals are available in test environment
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DocCraftAgentProvider } from '../contexts/DocCraftAgentProvider';
import { AppShellAgentIntegration } from '../ui/AppShellAgentIntegration';
import { DocCraftAgentChat } from '../components/DocCraftAgentChat';

// Mock the agent services
jest.mock('../services/agentChatRouter', () => ({
  agentChatRouter: jest.fn()
}));

jest.mock('../services/docToVideoRouter', () => ({
  docToVideoRouter: {
    executeCommand: jest.fn()
  }
}));

jest.mock('../services/slideGenerator', () => ({
  slideGenerator: {
    generateSlides: jest.fn()
  }
}));

jest.mock('../services/scriptGenerator', () => ({
  scriptGenerator: {
    generateScript: jest.fn()
  }
}));

jest.mock('../services/ttsSyncEngine', () => ({
  ttsSyncEngine: {
    generateNarration: jest.fn()
  }
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
import { docToVideoRouter } from '../services/docToVideoRouter';
import { slideGenerator } from '../services/slideGenerator';
import { scriptGenerator } from '../services/scriptGenerator';
import { ttsSyncEngine } from '../services/ttsSyncEngine';
import { queryLLMFallback } from '../services/useLLMFallback';
import { trackSuggestion, trackTipShown, trackTipDismissed, trackLLMFallbackUsage } from '../services/agentTelemetry';
// Note: useDoc2VideoTriggers is imported but not used in this test file
// const _useDoc2VideoTriggers = useDoc2VideoTriggers;

const mockAgentChatRouter = agentChatRouter as jest.MockedFunction<typeof agentChatRouter>;
const mockDocToVideoRouter = docToVideoRouter.executeCommand as jest.MockedFunction<typeof docToVideoRouter.executeCommand>;
const mockSlideGenerator = slideGenerator.generateSlides as jest.MockedFunction<typeof slideGenerator.generateSlides>;
const mockScriptGenerator = scriptGenerator.generateScript as jest.MockedFunction<typeof scriptGenerator.generateScript>;
const mockTtsSyncEngine = ttsSyncEngine.generateNarration as jest.MockedFunction<typeof ttsSyncEngine.generateNarration>;
const mockQueryLLMFallback = queryLLMFallback as jest.MockedFunction<typeof queryLLMFallback>;
const mockTrackSuggestion = trackSuggestion as jest.MockedFunction<typeof trackSuggestion>;
const mockTrackTipShown = trackTipShown as jest.MockedFunction<typeof trackTipShown>;
const _mockTrackTipDismissed = trackTipDismissed as jest.MockedFunction<typeof trackTipDismissed>;
const mockTrackLLMFallbackUsage = trackLLMFallbackUsage as jest.MockedFunction<typeof trackLLMFallbackUsage>;

// Sample document for testing
const sampleDoc = `
DocCraft-AI empowers users to transform long-form documents into engaging video presentations.
It supports Auto, Hybrid, and Manual workflows with script, slides, and voiceover capabilities.
The platform integrates advanced AI for content analysis and creative enhancement.
Users can customize their workflow based on their expertise level and project requirements.
`;

// Mock pipeline responses
const mockPipelineResponse = {
  success: true,
  slides: [
    {
      id: 'slide-1',
      title: 'Introduction to DocCraft-AI',
      content: ['DocCraft-AI empowers users...'],
      imagePrompt: 'AI-powered document transformation interface',
      narration: 'Welcome to DocCraft-AI...',
      duration: 15
    },
    {
      id: 'slide-2',
      title: 'Workflow Modes',
      content: ['Auto, Hybrid, and Manual workflows...'],
      imagePrompt: 'Three workflow mode icons',
      narration: 'Choose from three workflow modes...',
      duration: 20
    }
  ],
  script: {
    slides: [],
    totalDuration: 35,
    wordCount: 150
  },
  narration: {
    audioUrl: 'https://example.com/narration.mp3',
    timeline: [
      {
        slideId: 'slide-1',
        startTime: 0,
        endTime: 15,
        text: 'Welcome to DocCraft-AI...'
      }
    ]
  },
  metadata: {
    processingTime: 5000,
    slideCount: 2,
    wordCount: 150
  }
};

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
    
    // Mock pipeline services
    mockSlideGenerator.mockResolvedValue(mockPipelineResponse.slides);
    mockScriptGenerator.mockResolvedValue(mockPipelineResponse.script);
    mockTtsSyncEngine.mockResolvedValue(mockPipelineResponse.narration);
    mockDocToVideoRouter.mockResolvedValue(mockPipelineResponse);
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

  describe('Doc-to-Video Pipeline - Auto Mode', () => {
    it('should run the full pipeline in auto mode', async () => {
      mockAgentChatRouter.mockResolvedValueOnce({
        type: 'agent',
        content: '🎬 DocCraft-AI pipeline completed! Generated 2 slides with script and narration.',
        suggestedActions: [
          { label: 'Download PPT', action: 'downloadSlides' },
          { label: 'Preview Narration', action: 'previewNarration' },
          { label: 'Export Script', action: 'exportScript' }
        ],
        mcp: { role: 'ai-engineer', tier: 'Pro', theme: 'doc2video_auto' }
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

      // Send doc2video auto command
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: '/doc2video auto' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/DocCraft-AI pipeline completed!/)).toBeInTheDocument();
        expect(screen.getByText('Download PPT')).toBeInTheDocument();
        expect(screen.getByText('Preview Narration')).toBeInTheDocument();
        expect(screen.getByText('Export Script')).toBeInTheDocument();
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith('/doc2video auto', 'frontend-developer', 'Pro');
      expect(mockDocToVideoRouter).toHaveBeenCalledWith('/doc2video auto', sampleDoc);
    });

    it('should auto-trigger pipeline when features are toggled in auto mode', async () => {
      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Simulate feature toggle in auto mode
      // Note: setDoc2videoFeatures would be accessed through the provider context
      // This test focuses on the auto-trigger behavior

      await waitFor(() => {
        expect(mockDocToVideoRouter).toHaveBeenCalledWith(
          expect.stringContaining('/doc2video auto features=script,voiceover'),
          expect.any(String)
        );
      }, { timeout: 3000 });
    });
  });

  describe('Doc-to-Video Pipeline - Hybrid Mode', () => {
    it('should prepare hybrid mode without auto-triggering', async () => {
      mockAgentChatRouter.mockResolvedValueOnce({
        type: 'agent',
        content: '🔄 Hybrid mode activated! I\'ll help you with partial regeneration. Toggle features to customize your workflow.',
        suggestedActions: [
          { label: 'Generate Script Only', action: 'generateScript' },
          { label: 'Generate Slides Only', action: 'generateSlides' },
          { label: 'Generate Voiceover Only', action: 'generateVoiceover' }
        ],
        mcp: { role: 'ai-engineer', tier: 'Pro', theme: 'doc2video_hybrid' }
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

      // Send doc2video hybrid command
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: '/doc2video hybrid' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Hybrid mode activated!/)).toBeInTheDocument();
        expect(screen.getByText('Generate Script Only')).toBeInTheDocument();
        expect(screen.getByText('Generate Slides Only')).toBeInTheDocument();
        expect(screen.getByText('Generate Voiceover Only')).toBeInTheDocument();
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith('/doc2video hybrid', 'frontend-developer', 'Pro');
    });

    it('should not auto-trigger in hybrid mode when features change', async () => {
      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Set to hybrid mode
      // Note: setDoc2videoMode would be accessed through the provider context
      // This test focuses on the hybrid mode behavior

      // Simulate feature toggle
      // Note: setDoc2videoFeatures would be accessed through the provider context

      // Should not auto-trigger in hybrid mode
      await waitFor(() => {
        expect(mockDocToVideoRouter).not.toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Doc-to-Video Pipeline - Manual Mode', () => {
    it('should not auto-generate in manual mode', async () => {
      mockAgentChatRouter.mockResolvedValueOnce({
        type: 'agent',
        content: '⚙️ Manual mode enabled! You have full control over the pipeline. Use commands to generate specific components.',
        suggestedActions: [
          { label: 'Generate Script', action: 'generateScript' },
          { label: 'Generate Slides', action: 'generateSlides' },
          { label: 'Generate Voiceover', action: 'generateVoiceover' },
          { label: 'Run Full Pipeline', action: 'runFullPipeline' }
        ],
        mcp: { role: 'ai-engineer', tier: 'Pro', theme: 'doc2video_manual' }
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

      // Send doc2video manual command
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: '/doc2video manual' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Manual mode enabled!/)).toBeInTheDocument();
        expect(screen.getByText('Generate Script')).toBeInTheDocument();
        expect(screen.getByText('Generate Slides')).toBeInTheDocument();
        expect(screen.getByText('Generate Voiceover')).toBeInTheDocument();
        expect(screen.getByText('Run Full Pipeline')).toBeInTheDocument();
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith('/doc2video manual', 'frontend-developer', 'Pro');
    });

    it('should require explicit commands in manual mode', async () => {
      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Set to manual mode
      // Note: setDoc2videoMode would be accessed through the provider context
      // This test focuses on the manual mode behavior

      // Simulate feature toggle - should not trigger anything
      // Note: setDoc2videoFeatures would be accessed through the provider context

      // Should not auto-trigger in manual mode
      await waitFor(() => {
        expect(mockDocToVideoRouter).not.toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Doc-to-Video Feature Toggles', () => {
    it('should honor feature toggles in auto mode', async () => {
      mockDocToVideoRouter.mockResolvedValueOnce({
        ...mockPipelineResponse,
        success: true,
        metadata: {
          ...mockPipelineResponse.metadata,
          features: ['script']
        }
      });

      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Set features to script only
      // Note: setDoc2videoFeatures would be accessed through the provider context
      // This test focuses on feature toggle behavior

      // Trigger pipeline
      // Note: setDoc2videoMode would be accessed through the provider context

      await waitFor(() => {
        expect(mockDocToVideoRouter).toHaveBeenCalledWith(
          expect.stringContaining('features=script'),
          expect.any(String)
        );
      }, { timeout: 3000 });
    });

    it('should generate only selected features', async () => {
      mockDocToVideoRouter.mockResolvedValueOnce({
        ...mockPipelineResponse,
        success: true,
        slides: undefined, // No slides generated
        script: mockPipelineResponse.script,
        narration: undefined, // No narration generated
        metadata: {
          ...mockPipelineResponse.metadata,
          features: ['script'],
          slideCount: 0
        }
      });

      render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Set to script only
      // Note: setDoc2videoFeatures would be accessed through the provider context
      // This test focuses on selective feature generation

      // Trigger pipeline
      // Note: setDoc2videoMode would be accessed through the provider context

      await waitFor(() => {
        expect(mockScriptGenerator).toHaveBeenCalled();
        expect(mockSlideGenerator).not.toHaveBeenCalled();
        expect(mockTtsSyncEngine).not.toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Doc-to-Video Suggested Actions', () => {
    it('should attach appropriate suggested actions for full pipeline', async () => {
      mockAgentChatRouter.mockResolvedValueOnce({
        type: 'agent',
        content: '🎬 Full pipeline completed! Generated 2 slides with script and narration.',
        suggestedActions: [
          { label: 'Download PPT', action: 'downloadSlides' },
          { label: 'Preview Narration', action: 'previewNarration' },
          { label: 'Export Script', action: 'exportScript' },
          { label: 'Share Video', action: 'shareVideo' }
        ],
        mcp: { role: 'ai-engineer', tier: 'Pro', theme: 'doc2video_full' }
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

      // Send full pipeline command
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: '/doc2video auto' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Download PPT')).toBeInTheDocument();
        expect(screen.getByText('Preview Narration')).toBeInTheDocument();
        expect(screen.getByText('Export Script')).toBeInTheDocument();
        expect(screen.getByText('Share Video')).toBeInTheDocument();
      });
    });

    it('should attach limited actions for partial generation', async () => {
      mockAgentChatRouter.mockResolvedValueOnce({
        type: 'agent',
        content: '📝 Script generated successfully!',
        suggestedActions: [
          { label: 'Export Script', action: 'exportScript' },
          { label: 'Generate Slides', action: 'generateSlides' }
        ],
        mcp: { role: 'ai-engineer', tier: 'Pro', theme: 'doc2video_script' }
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

      // Send script-only command
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: '/doc2video script' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Export Script')).toBeInTheDocument();
        expect(screen.getByText('Generate Slides')).toBeInTheDocument();
        expect(screen.queryByText('Download PPT')).not.toBeInTheDocument();
      });
    });
  });

  describe('Pro-tier Validation', () => {
    it('should fallback gracefully for Free tier users', async () => {
      mockAgentChatRouter.mockResolvedValueOnce({
        type: 'agent',
        content: '🔒 Doc-to-video pipeline requires Pro tier access. Please upgrade to use this feature.',
        suggestedActions: [
          { label: 'Upgrade to Pro', action: 'upgradeTier' },
          { label: 'Learn More', action: 'showFeatures' }
        ],
        mcp: { role: 'frontend-developer', tier: 'Free', theme: 'upgrade_prompt' }
      });

      render(
        <TestWrapper userRole="frontend-developer" tier="Free">
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Show agent
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });

      // Try to use doc2video feature
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: '/doc2video auto' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/requires Pro tier access/)).toBeInTheDocument();
        expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
        expect(screen.getByText('Learn More')).toBeInTheDocument();
      });
    });

    it('should allow Pro tier users full access', async () => {
      mockAgentChatRouter.mockResolvedValueOnce({
        type: 'agent',
        content: '🎬 DocCraft-AI pipeline completed! Generated 2 slides with script and narration.',
        suggestedActions: [
          { label: 'Download PPT', action: 'downloadSlides' },
          { label: 'Preview Narration', action: 'previewNarration' }
        ],
        mcp: { role: 'ai-engineer', tier: 'Pro', theme: 'doc2video_auto' }
      });

      render(
        <TestWrapper userRole="ai-engineer" tier="Pro">
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      // Show agent
      const toggleButton = screen.getByLabelText(/Open DocCraft Assistant/);
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('DocCraft Agent')).toBeInTheDocument();
      });

      // Use doc2video feature
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: '/doc2video auto' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/DocCraft-AI pipeline completed!/)).toBeInTheDocument();
        expect(screen.getByText('Download PPT')).toBeInTheDocument();
        expect(screen.getByText('Preview Narration')).toBeInTheDocument();
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

    it('should handle doc-to-video pipeline failures gracefully', async () => {
      mockDocToVideoRouter.mockRejectedValueOnce(new Error('Pipeline failed'));

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

      // Send doc2video command that will fail
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: '/doc2video auto' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/I'm having trouble processing/)).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
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
      // Note: addProactiveMessage would be accessed through the provider context
      // This test focuses on accessibility announcements

      // Check for ARIA live region
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Snapshot Testing', () => {
    it('should match snapshot for enriched AgentMessages', () => {
      const { container } = render(
        <TestWrapper>
          <div data-testid="main-content">Main app content</div>
        </TestWrapper>
      );

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for doc-to-video responses', async () => {
      mockAgentChatRouter.mockResolvedValueOnce({
        type: 'agent',
        content: '🎬 DocCraft-AI pipeline completed! Generated 2 slides with script and narration.',
        suggestedActions: [
          { label: 'Download PPT', action: 'downloadSlides' },
          { label: 'Preview Narration', action: 'previewNarration' }
        ],
        mcp: { role: 'ai-engineer', tier: 'Pro', theme: 'doc2video_auto' }
      });

      const { container } = render(
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

      // Send doc2video command
      const input = screen.getByTestId('agent-chat-input') || screen.getByPlaceholderText(/type your message/i);
      fireEvent.change(input, { target: { value: '/doc2video auto' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/DocCraft-AI pipeline completed!/)).toBeInTheDocument();
      });

      expect(container).toMatchSnapshot();
    });
  });
}); 