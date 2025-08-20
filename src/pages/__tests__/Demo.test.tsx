import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Demo from '../Demo';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('../../contexts/AuthContext');
jest.mock('../../services/agenticAI', () => ({
  ResearchAgent: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      findings: [{ id: '1', content: 'Test finding' }],
      insights: [{ insight: 'Test insight' }],
    }),
  })),
  StructureAgent: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      outline: { sections: [{ title: 'Test section' }] },
      writingGuidance: ['Test guidance'],
    }),
  })),
  WritingAgent: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      content: 'Test content',
    }),
  })),
  CharacterAgent: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      characterProfiles: [{ personality: 'INTJ' }],
      consistencyChecks: { overallConsistency: 0.87 },
    }),
  })),
  EmotionAgent: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      tensionCurves: { overallTension: 0.85 },
      optimizationSuggestions: ['Test suggestion'],
    }),
  })),
  StyleAgent: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      consistencyScore: { overallConsistency: 0.94 },
      improvementSuggestions: ['Test improvement'],
    }),
  })),
}));

// Mock AuthContext
const mockUseAuth = {
  user: { id: '1', email: 'test@example.com', tier: 'Pro' },
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  redirectToAppropriatePage: jest.fn(),
};

jest.mocked(require('../../contexts/AuthContext')).useAuth.mockReturnValue(mockUseAuth);

// Mock toast
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
};

jest.mocked(toast).success = mockToast.success;
jest.mocked(toast).error = mockToast.error;

// Helper function to render Demo with router
const renderDemo = () => {
  return render(
    <BrowserRouter>
      <Demo />
    </BrowserRouter>
  );
};

describe('Demo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Render', () => {
    it('renders the demo page with correct title and description', () => {
      renderDemo();
      
      expect(screen.getByText('DocCraft-AI v3')).toBeInTheDocument();
      expect(screen.getByText('Multi-Agent Writing Platform')).toBeInTheDocument();
      expect(screen.getByText(/Experience the power of collaborative AI agents/)).toBeInTheDocument();
    });

    it('shows the start demo button initially', () => {
      renderDemo();
      
      expect(screen.getByRole('button', { name: /Start Interactive Demo/i })).toBeInTheDocument();
    });

    it('displays all three collaboration modes', () => {
      renderDemo();
      
      expect(screen.getByText('Manual')).toBeInTheDocument();
      expect(screen.getByText('Hybrid')).toBeInTheDocument();
      expect(screen.getByText('Full Auto')).toBeInTheDocument();
    });

    it('shows all six AI agent panels', () => {
      renderDemo();
      
      expect(screen.getByText('Research Agent')).toBeInTheDocument();
      expect(screen.getByText('Structure Agent')).toBeInTheDocument();
      expect(screen.getByText('Writing Agent')).toBeInTheDocument();
      expect(screen.getByText('Character Agent')).toBeInTheDocument();
      expect(screen.getByText('Emotion Agent')).toBeInTheDocument();
      expect(screen.getByText('Style Agent')).toBeInTheDocument();
    });
  });

  describe('Demo Workflow', () => {
    it('starts demo when start button is clicked', async () => {
      renderDemo();
      
      const startButton = screen.getByRole('button', { name: /Start Interactive Demo/i });
      fireEvent.click(startButton);
      
      // Should show loading state
      expect(screen.getByText('Starting Demo...')).toBeInTheDocument();
      
      // Wait for demo to start
      await waitFor(() => {
        expect(screen.getByText(/Demo: Starting with Hybrid mode/)).toBeInTheDocument();
      });
    });

    it('progresses through demo steps correctly', async () => {
      renderDemo();
      
      const startButton = screen.getByRole('button', { name: /Start Interactive Demo/i });
      fireEvent.click(startButton);
      
      // Step 1: Hybrid mode
      await waitFor(() => {
        expect(screen.getByText(/Demo: Starting with Hybrid mode/)).toBeInTheDocument();
      });
      
      // Step 2: Switching to Full Auto
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Demo: Switching to Full Auto/)).toBeInTheDocument();
      });
      
      // Step 3: Complete
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Demo: Complete! All agents have contributed/)).toBeInTheDocument();
      });
    });

    it('activates correct agents for each mode', async () => {
      renderDemo();
      
      const startButton = screen.getByRole('button', { name: /Start Interactive Demo/i });
      fireEvent.click(startButton);
      
      // Hybrid mode should activate research and outline agents
      await waitFor(() => {
        const researchAgent = screen.getByText('Research Agent').closest('div');
        const structureAgent = screen.getByText('Structure Agent').closest('div');
        
        expect(researchAgent).toHaveClass('border-blue-300', 'bg-blue-50');
        expect(structureAgent).toHaveClass('border-green-300', 'bg-green-50');
      });
      
      // Full Auto mode should activate all agents
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        const allAgents = screen.getAllByText(/Agent$/);
        allAgents.forEach(agent => {
          const agentDiv = agent.closest('div');
          expect(agentDiv).toHaveClass(/border-.*-300/, /bg-.*-50/);
        });
      });
    });
  });

  describe('Agent Functionality', () => {
    it('executes agents in manual mode when run analysis button is clicked', async () => {
      renderDemo();
      
      // Switch to manual mode
      const manualButton = screen.getByText('Manual');
      fireEvent.click(manualButton);
      
      // Click run analysis on research agent
      const researchAgent = screen.getByText('Research Agent').closest('div');
      const runButton = within(researchAgent!).getByRole('button', { name: /Run Analysis/i });
      fireEvent.click(runButton);
      
      // Should show processing state
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Analysis Complete')).toBeInTheDocument();
      });
    });

    it('executes agents automatically in full auto mode', async () => {
      renderDemo();
      
      // Switch to full auto mode
      const fullAutoButton = screen.getByText('Full Auto');
      fireEvent.click(fullAutoButton);
      
      // All agents should be active and processing
      await waitFor(() => {
        const allAgents = screen.getAllByText(/Agent$/);
        allAgents.forEach(agent => {
          const agentDiv = agent.closest('div');
          expect(agentDiv).toHaveClass(/border-.*-300/, /bg-.*-50/);
        });
      });
    });

    it('handles agent execution errors gracefully', async () => {
      // Mock an agent to throw an error
      const { ResearchAgent } = require('../../services/agenticAI');
      ResearchAgent.mockImplementationOnce(() => ({
        execute: jest.fn().mockRejectedValue(new Error('Agent execution failed')),
      }));
      
      renderDemo();
      
      // Switch to manual mode and try to execute research agent
      const manualButton = screen.getByText('Manual');
      fireEvent.click(manualButton);
      
      const researchAgent = screen.getByText('Research Agent').closest('div');
      const runButton = within(researchAgent!).getByRole('button', { name: /Run Analysis/i });
      fireEvent.click(runButton);
      
      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
        expect(screen.getByText('Agent execution failed')).toBeInTheDocument();
      });
    });
  });

  describe('Mode Switching', () => {
    it('allows manual mode switching after demo completion', async () => {
      renderDemo();
      
      // Complete the demo first
      const startButton = screen.getByRole('button', { name: /Start Interactive Demo/i });
      fireEvent.click(startButton);
      
      // Wait for completion
      act(() => {
        jest.advanceTimersByTime(8000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Demo: Complete!/)).toBeInTheDocument();
      });
      
      // Now should be able to click mode buttons for explanations
      const manualButton = screen.getByText('Manual');
      fireEvent.click(manualButton);
      
      // Should show explanation mode
      await waitFor(() => {
        expect(screen.getByText('Feature Explanation')).toBeInTheDocument();
      });
    });

    it('updates active agents when mode changes', () => {
      renderDemo();
      
      // Start in manual mode (no active agents)
      expect(screen.getAllByText(/Standby/)).toHaveLength(6);
      
      // Switch to hybrid mode
      const hybridButton = screen.getByText('Hybrid');
      fireEvent.click(hybridButton);
      
      // Should have 2 active agents
      expect(screen.getAllByText(/Active/)).toHaveLength(2);
      expect(screen.getAllByText(/Standby/)).toHaveLength(4);
      
      // Switch to full auto mode
      const fullAutoButton = screen.getByText('Full Auto');
      fireEvent.click(fullAutoButton);
      
      // Should have all agents active
      expect(screen.getAllByText(/Active/)).toHaveLength(6);
    });
  });

  describe('AI Assistant Integration', () => {
    it('shows AI assistant after 7 seconds', async () => {
      renderDemo();
      
      // Initially no assistant
      expect(screen.queryByText('AI Demo Assistant')).not.toBeInTheDocument();
      
      // Advance time to show assistant
      act(() => {
        jest.advanceTimersByTime(7000);
      });
      
      await waitFor(() => {
        expect(screen.getByText('AI Demo Assistant')).toBeInTheDocument();
      });
    });

    it('provides guidance based on demo step', async () => {
      renderDemo();
      
      // Start demo
      const startButton = screen.getByRole('button', { name: /Start Interactive Demo/i });
      fireEvent.click(startButton);
      
      // Wait for assistant to appear and provide guidance
      act(() => {
        jest.advanceTimersByTime(7000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Excellent! You've started the demo in Hybrid mode/)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('maintains layout on different screen sizes', () => {
      // Test with different viewport sizes
      const { rerender } = renderDemo();
      
      // Mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      rerender(
        <BrowserRouter>
          <Demo />
        </BrowserRouter>
      );
      
      // Should still show all content
      expect(screen.getByText('DocCraft-AI v3')).toBeInTheDocument();
      expect(screen.getAllByText(/Agent$/)).toHaveLength(6);
    });
  });

  describe('Error Handling', () => {
    it('shows error message when demo fails to start', async () => {
      // Mock a failure in the demo start process
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderDemo();
      
      const startButton = screen.getByRole('button', { name: /Start Interactive Demo/i });
      fireEvent.click(startButton);
      
      // Simulate an error
      act(() => {
        // Trigger an error condition
        throw new Error('Demo start failed');
      });
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Demo error:/)).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    it('handles agent service failures gracefully', async () => {
      // Mock all agents to fail
      const { ResearchAgent, StructureAgent, WritingAgent, CharacterAgent, EmotionAgent, StyleAgent } = require('../../services/agenticAI');
      
      [ResearchAgent, StructureAgent, WritingAgent, CharacterAgent, EmotionAgent, StyleAgent].forEach(Agent => {
        Agent.mockImplementation(() => ({
          execute: jest.fn().mockRejectedValue(new Error('Service unavailable')),
        }));
      });
      
      renderDemo();
      
      // Switch to full auto mode to trigger all agents
      const fullAutoButton = screen.getByText('Full Auto');
      fireEvent.click(fullAutoButton);
      
      // Should handle errors gracefully
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalled();
      });
    });
  });

  describe('Integration Tests', () => {
    it('completes full demo workflow successfully', async () => {
      renderDemo();
      
      // Start demo
      const startButton = screen.getByRole('button', { name: /Start Interactive Demo/i });
      fireEvent.click(startButton);
      
      // Wait for completion
      act(() => {
        jest.advanceTimersByTime(8000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Demo: Complete!/)).toBeInTheDocument();
        expect(mockToast.success).toHaveBeenCalledWith('Demo completed successfully! All agents have contributed to your story.');
      });
      
      // Verify all agents have responses
      const responseElements = screen.getAllByText(/Analysis Complete/);
      expect(responseElements.length).toBeGreaterThan(0);
    });

    it('maintains state consistency throughout demo', async () => {
      renderDemo();
      
      // Start demo
      const startButton = screen.getByRole('button', { name: /Start Interactive Demo/i });
      fireEvent.click(startButton);
      
      // Verify step progression
      await waitFor(() => {
        expect(screen.getByText(/Demo: Starting with Hybrid mode/)).toBeInTheDocument();
      });
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Demo: Switching to Full Auto/)).toBeInTheDocument();
      });
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Demo: Complete!/)).toBeInTheDocument();
      });
      
      // Verify final state
      expect(screen.getAllByText(/Active/)).toHaveLength(6);
    });
  });
});
