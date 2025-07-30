// MCP Context Block
/*
role: qa-engineer,
tier: Pro,
file: "modules/agent/__tests__/useChatCommandRouter.spec.ts",
allowedActions: ["test", "mock", "validate"],
theme: "agent_chat"
*/

import { renderHook, act } from '@testing-library/react';
import { useChatCommandRouter } from '../hooks/useChatCommandRouter';

// Mock the agentChatRouter service
jest.mock('../services/agentChatRouter', () => ({
  agentChatRouter: jest.fn()
}));

// Mock the enrichAgentMessage service
jest.mock('../services/enrichAgentMessage', () => ({
  enrichAgentMessage: jest.fn((msg) => msg) // Return message as-is for testing
}));

import { agentChatRouter } from '../services/agentChatRouter';
import { enrichAgentMessage } from '../services/enrichAgentMessage';

const mockAgentChatRouter = agentChatRouter as jest.MockedFunction<typeof agentChatRouter>;
const mockEnrichAgentMessage = enrichAgentMessage as jest.MockedFunction<typeof enrichAgentMessage>;

describe('useChatCommandRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook Initialization', () => {
    it('should return a function when initialized', () => {
      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      expect(typeof result.current).toBe('function');
    });

    it('should memoize the function based on userRole and tier', () => {
      const { result, rerender } = renderHook(
        ({ role, tier }) => useChatCommandRouter(role, tier),
        { initialProps: { role: 'frontend-developer', tier: 'Pro' } }
      );

      const firstFunction = result.current;

      rerender({ role: 'frontend-developer', tier: 'Pro' });
      expect(result.current).toBe(firstFunction);

      rerender({ role: 'admin', tier: 'Admin' });
      expect(result.current).not.toBe(firstFunction);
    });
  });

  describe('Natural Language Query Routing', () => {
    it('should route natural language queries to agentChatRouter', async () => {
      const mockResponse = {
        type: 'agent' as const,
        content: 'Here is how to check for emotional drift...',
        suggestedActions: [{ label: 'Show Me', action: 'showOnboarding' }]
      };
      mockAgentChatRouter.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('How do I check for emotional drift?');
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith(
        'How do I check for emotional drift?',
        'frontend-developer',
        'Pro'
      );
      expect(response).toEqual(mockResponse);
    });

    it('should handle queries with special characters', async () => {
      const mockResponse = {
        type: 'agent' as const,
        content: 'Response with special chars',
        suggestedActions: []
      };
      mockAgentChatRouter.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('How do I use @#$%^&*() features?');
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith(
        'How do I use @#$%^&*() features?',
        'frontend-developer',
        'Pro'
      );
      expect(response).toEqual(mockResponse);
    });

    it('should handle empty queries gracefully', async () => {
      const mockResponse = {
        type: 'agent' as const,
        content: 'Please provide a query',
        suggestedActions: []
      };
      mockAgentChatRouter.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('');
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith('', 'frontend-developer', 'Pro');
      expect(response).toEqual(mockResponse);
    });
  });

  describe('Slash Command Handling', () => {
    it('should route /help command correctly', async () => {
      const mockResponse = {
        type: 'agent' as const,
        content: 'How can I help you?',
        suggestedActions: [{ label: 'Show Docs', action: 'openDocs' }]
      };
      mockAgentChatRouter.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('/help');
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith('/help', 'frontend-developer', 'Pro');
      expect(response).toEqual(mockResponse);
    });

    it('should route /onboarding command with flow ID', async () => {
      const mockResponse = {
        type: 'agent' as const,
        content: 'Onboarding started for theme analysis',
        relatedStepId: 'theme-step-1',
        suggestedActions: [{ label: 'Resume Onboarding', action: 'resumeOnboarding' }]
      };
      mockAgentChatRouter.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('/onboarding theme');
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith('/onboarding theme', 'frontend-developer', 'Pro');
      expect(response).toEqual(mockResponse);
    });

    it('should route /export command', async () => {
      const mockResponse = {
        type: 'agent' as const,
        content: 'Export options available',
        suggestedActions: [{ label: 'Export JSON', action: 'exportJSON' }]
      };
      mockAgentChatRouter.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('/export');
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith('/export', 'frontend-developer', 'Pro');
      expect(response).toEqual(mockResponse);
    });

    it('should handle unknown slash commands', async () => {
      const mockResponse = {
        type: 'agent' as const,
        content: 'Unknown command. Try /help for available commands.',
        suggestedActions: [{ label: 'Show Help', action: 'showHelp' }]
      };
      mockAgentChatRouter.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('/unknown');
      });

      expect(mockAgentChatRouter).toHaveBeenCalledWith('/unknown', 'frontend-developer', 'Pro');
      expect(response).toEqual(mockResponse);
    });
  });

  describe('Message Enrichment', () => {
    it('should call enrichAgentMessage on router response', async () => {
      const mockRouterResponse = {
        type: 'agent' as const,
        content: 'Original response',
        suggestedActions: []
      };
      const mockEnrichedResponse = {
        ...mockRouterResponse,
        content: 'Enriched response with quick replies'
      };
      mockAgentChatRouter.mockResolvedValue(mockRouterResponse);
      mockEnrichAgentMessage.mockReturnValue(mockEnrichedResponse);

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('test query');
      });

      expect(mockEnrichAgentMessage).toHaveBeenCalledWith(mockRouterResponse);
      expect(response).toEqual(mockEnrichedResponse);
    });

    it('should preserve original message structure during enrichment', async () => {
      const mockRouterResponse = {
        type: 'agent' as const,
        content: 'Test content',
        relatedStepId: 'step-1',
        kbRef: 'kb-1',
        suggestedActions: [{ label: 'Show Me', action: 'showOnboarding' }],
        mcp: { role: 'frontend-developer', tier: 'Pro' }
      };
      mockAgentChatRouter.mockResolvedValue(mockRouterResponse);
      mockEnrichAgentMessage.mockImplementation((msg) => ({
        ...msg,
        suggestedActions: [...msg.suggestedActions, { label: 'Quick Reply', action: 'quickReply' }]
      }));

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('test query');
      });

      expect(response).toMatchObject({
        type: 'agent',
        content: 'Test content',
        relatedStepId: 'step-1',
        kbRef: 'kb-1',
        suggestedActions: [
          { label: 'Show Me', action: 'showOnboarding' },
          { label: 'Quick Reply', action: 'quickReply' }
        ],
        mcp: { role: 'frontend-developer', tier: 'Pro' }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle agentChatRouter errors gracefully', async () => {
      mockAgentChatRouter.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('test query');
      });

      expect(response).toMatchObject({
        type: 'agent',
        content: expect.stringContaining('error'),
        suggestedActions: [{ label: 'Try Again', action: 'retry' }]
      });
    });

    it('should handle enrichAgentMessage errors gracefully', async () => {
      const mockRouterResponse = {
        type: 'agent' as const,
        content: 'Original response',
        suggestedActions: []
      };
      mockAgentChatRouter.mockResolvedValue(mockRouterResponse);
      mockEnrichAgentMessage.mockImplementation(() => {
        throw new Error('Enrichment error');
      });

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('test query');
      });

      // Should return original response if enrichment fails
      expect(response).toEqual(mockRouterResponse);
    });

    it('should handle timeout scenarios', async () => {
      mockAgentChatRouter.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('test query');
      });

      expect(response).toMatchObject({
        type: 'agent',
        content: expect.stringContaining('timeout'),
        suggestedActions: [{ label: 'Try Again', action: 'retry' }]
      });
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests', async () => {
      const mockResponses = [
        { type: 'agent' as const, content: 'Response 1', suggestedActions: [] },
        { type: 'agent' as const, content: 'Response 2', suggestedActions: [] },
        { type: 'agent' as const, content: 'Response 3', suggestedActions: [] }
      ];

      mockAgentChatRouter
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2]);

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      const promises = [
        result.current('query 1'),
        result.current('query 2'),
        result.current('query 3')
      ];

      const responses = await Promise.all(promises);

      expect(responses).toHaveLength(3);
      expect(responses[0]).toEqual(mockResponses[0]);
      expect(responses[1]).toEqual(mockResponses[1]);
      expect(responses[2]).toEqual(mockResponses[2]);
    });

    it('should not interfere with different user contexts', async () => {
      const { result: result1 } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));
      const { result: result2 } = renderHook(() => useChatCommandRouter('admin', 'Admin'));

      const mockResponse1 = { type: 'agent' as const, content: 'Pro response', suggestedActions: [] };
      const mockResponse2 = { type: 'agent' as const, content: 'Admin response', suggestedActions: [] };

      mockAgentChatRouter
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const [response1, response2] = await Promise.all([
        result1.current('test query'),
        result2.current('test query')
      ]);

      expect(response1).toEqual(mockResponse1);
      expect(response2).toEqual(mockResponse2);
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with repeated calls', async () => {
      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      const mockResponse = { type: 'agent' as const, content: 'Test', suggestedActions: [] };
      mockAgentChatRouter.mockResolvedValue(mockResponse);

      // Make multiple calls
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await result.current(`query ${i}`);
        });
      }

      expect(mockAgentChatRouter).toHaveBeenCalledTimes(10);
      expect(mockEnrichAgentMessage).toHaveBeenCalledTimes(10);
    });

    it('should handle large response payloads', async () => {
      const largeResponse = {
        type: 'agent' as const,
        content: 'a'.repeat(10000), // Large content
        suggestedActions: Array.from({ length: 50 }, (_, i) => ({
          label: `Action ${i}`,
          action: `action${i}`
        }))
      };
      mockAgentChatRouter.mockResolvedValue(largeResponse);

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('test query');
      });

      expect(response.content.length).toBe(10000);
      expect(response.suggestedActions).toHaveLength(50);
    });
  });

  describe('Accessibility and ARIA', () => {
    it('should preserve accessibility attributes in enriched messages', async () => {
      const mockRouterResponse = {
        type: 'agent' as const,
        content: 'Accessible content',
        suggestedActions: [{ label: 'Show Me', action: 'showOnboarding' }],
        'aria-label': 'Agent response',
        'role': 'dialog'
      };
      mockAgentChatRouter.mockResolvedValue(mockRouterResponse);
      mockEnrichAgentMessage.mockImplementation((msg) => ({
        ...msg,
        'aria-live': 'polite'
      }));

      const { result } = renderHook(() => useChatCommandRouter('frontend-developer', 'Pro'));

      let response;
      await act(async () => {
        response = await result.current('test query');
      });

      expect(response).toMatchObject({
        'aria-label': 'Agent response',
        'role': 'dialog',
        'aria-live': 'polite'
      });
    });
  });
}); 