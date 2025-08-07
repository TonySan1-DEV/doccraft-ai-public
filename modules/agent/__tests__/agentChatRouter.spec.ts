// MCP Context Block
/*
role: qa-engineer,
tier: Pro,
file: "modules/agent/__tests__/agentChatRouter.spec.ts",
allowedActions: ["test", "mock", "validate"],
theme: "agent_chat"
*/

import { agentChatRouter } from '../services/agentChatRouter';
import { OnboardingEngine } from '../onboarding/onboardingEngine';

// Mock dependencies
jest.mock('../services/seedAgentKnowledgeBase', () => ({
  getKBEntry: jest.fn()
}));

jest.mock('../onboarding/onboardingEngine', () => ({
  OnboardingEngine: {
    startFlow: jest.fn(),
    getCurrentStep: jest.fn()
  }
}));

jest.mock('../onboarding/onboardingSteps', () => ({
  onboardingFlows: [
    {
      id: 'onboarding-theme',
      title: 'Theme Analysis Onboarding',
      steps: [
        {
          id: 'theme-step-1',
          title: 'Check for emotional drift',
          description: 'Learn how to detect emotional inconsistencies',
          targetSelector: '[data-testid="emotion-panel"]',
          highlightType: 'tooltip'
        },
        {
          id: 'theme-step-2',
          title: 'Analyze theme conflicts',
          description: 'Identify conflicting themes in your narrative',
          targetSelector: '[data-testid="theme-matrix"]',
          highlightType: 'modal'
        }
      ]
    },
    {
      id: 'onboarding-style',
      title: 'Style Profile Onboarding',
      steps: [
        {
          id: 'style-step-1',
          title: 'Check style drift',
          description: 'Monitor your writing style consistency',
          targetSelector: '[data-testid="style-panel"]',
          highlightType: 'tooltip',
          mcp: { role: 'frontend-developer', tier: 'Pro' }
        }
      ]
    }
  ]
}));

import { getKBEntry } from '../services/seedAgentKnowledgeBase';
// Note: onboardingFlows is imported but not used in this test file
// import { onboardingFlows } from '../onboarding/onboardingSteps';

const mockGetKBEntry = getKBEntry as jest.MockedFunction<typeof getKBEntry>;
const mockStartFlow = OnboardingEngine.startFlow as jest.MockedFunction<typeof OnboardingEngine.startFlow>;

describe('agentChatRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn(); // Mock console.warn for MCP blocks
  });

  describe('Knowledge Base Lookup', () => {
    it('should return KB response with metadata when query matches', async () => {
      const mockKBEntry = {
        id: 'kb-emotion-drift',
        content: 'To check for emotional drift, use the Emotion Timeline Chart in the dashboard.',
        mcp: { role: 'frontend-developer', tier: 'Pro', theme: 'emotion_analysis' }
      };
      mockGetKBEntry.mockReturnValue([mockKBEntry]);

      const result = await agentChatRouter('How do I check for emotional drift?', 'frontend-developer', 'Pro');

      expect(result).toEqual({
        type: 'agent',
        content: mockKBEntry.content,
        kbRef: mockKBEntry.id,
        suggestedActions: [
          { label: 'Show Me', action: 'showOnboarding', targetStepId: mockKBEntry.id },
          { label: 'Open Docs', action: 'openDocs' }
        ],
        mcp: mockKBEntry.mcp
      });
      expect(mockGetKBEntry).toHaveBeenCalledWith('How do I check for emotional drift?', 'frontend-developer', 'Pro');
    });

    it('should return fallback when no KB match found', async () => {
      mockGetKBEntry.mockReturnValue([]);

      const result = await agentChatRouter('What is quantum physics?', 'frontend-developer', 'Pro');

      expect(result.type).toBe('agent');
      expect(result.content).toContain("I'm not sure");
      expect(result.suggestedActions).toEqual([
        { label: 'Suggest Next Step', action: 'suggestNextStep' }
      ]);
    });

    it('should handle multiple KB results and return top match', async () => {
      const mockEntries = [
        { id: 'kb-1', content: 'First match', mcp: { role: 'frontend-developer', tier: 'Pro' } },
        { id: 'kb-2', content: 'Second match', mcp: { role: 'frontend-developer', tier: 'Pro' } }
      ];
      mockGetKBEntry.mockReturnValue(mockEntries);

      const result = await agentChatRouter('test query', 'frontend-developer', 'Pro');

      expect(result.kbRef).toBe('kb-1');
      expect(result.content).toBe('First match');
    });
  });

  describe('Onboarding Step Triggers', () => {
    it('should trigger onboarding step when query matches step title', async () => {
      const result = await agentChatRouter('How do I check for emotional drift?', 'frontend-developer', 'Pro');

      expect(mockStartFlow).toHaveBeenCalledWith('theme-step-1');
      expect(result.relatedStepId).toBe('theme-step-1');
      expect(result.content).toContain('Check for emotional drift');
      expect(result.suggestedActions).toContainEqual(
        { label: 'Start Walkthrough', action: 'resumeOnboarding' }
      );
    });

    it('should handle case-insensitive step matching', async () => {
      const result = await agentChatRouter('ANALYZE THEME CONFLICTS', 'frontend-developer', 'Pro');

      expect(result.relatedStepId).toBe('theme-step-2');
      expect(result.content).toContain('Analyze theme conflicts');
    });

    it('should not trigger onboarding for non-matching queries', async () => {
      mockGetKBEntry.mockReturnValue([]);

      const result = await agentChatRouter('Random query that does not match', 'frontend-developer', 'Pro');

      expect(mockStartFlow).not.toHaveBeenCalled();
      expect(result.relatedStepId).toBeUndefined();
    });
  });

  describe('Command Routing', () => {
    it('should handle /onboarding command with flow ID', async () => {
      const result = await agentChatRouter('/onboarding theme', 'frontend-developer', 'Pro');

      expect(mockStartFlow).toHaveBeenCalledWith('onboarding-theme');
      expect(result.type).toBe('agent');
      expect(result.content).toContain('Onboarding for onboarding-theme started');
      expect(result.relatedStepId).toBe('theme-step-1');
      expect(result.suggestedActions).toContainEqual(
        { label: 'Resume Onboarding', action: 'resumeOnboarding' }
      );
    });

    it('should handle /help command', async () => {
      const result = await agentChatRouter('/help', 'frontend-developer', 'Pro');

      expect(result.type).toBe('agent');
      expect(result.content).toContain('How can I help?');
      expect(result.suggestedActions).toContainEqual(
        { label: 'Show Docs', action: 'openDocs' }
      );
    });

    it('should handle unknown commands gracefully', async () => {
      const result = await agentChatRouter('/unknown', 'frontend-developer', 'Pro');

      expect(result.type).toBe('agent');
      expect(result.content).toContain("I'm not sure");
    });

    it('should handle /onboarding without flow ID', async () => {
      const result = await agentChatRouter('/onboarding', 'frontend-developer', 'Pro');

      expect(result.type).toBe('agent');
      expect(result.content).toContain('Onboarding for undefined started');
    });
  });

  describe('MCP Gating and Security', () => {
    it('should block Pro-tier features for Free users', async () => {
      const mockKBEntry = {
        id: 'kb-pro-feature',
        content: 'Pro feature content',
        mcp: { role: 'frontend-developer', tier: 'Pro', theme: 'advanced_analysis' }
      };
      mockGetKBEntry.mockReturnValue([mockKBEntry]);

      const result = await agentChatRouter('How do I use advanced features?', 'frontend-developer', 'Free');

      expect(result.type).toBe('agent');
      expect(result.content).toContain('upgrade');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('MCP block: Free tier cannot access Pro features')
      );
    });

    it('should allow Pro-tier features for Pro users', async () => {
      const mockKBEntry = {
        id: 'kb-pro-feature',
        content: 'Pro feature content',
        mcp: { role: 'frontend-developer', tier: 'Pro', theme: 'advanced_analysis' }
      };
      mockGetKBEntry.mockReturnValue([mockKBEntry]);

      const result = await agentChatRouter('How do I use advanced features?', 'frontend-developer', 'Pro');

      expect(result.content).toBe('Pro feature content');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should block Admin features for Pro users', async () => {
      const mockKBEntry = {
        id: 'kb-admin-feature',
        content: 'Admin feature content',
        mcp: { role: 'admin', tier: 'Admin', theme: 'system_management' }
      };
      mockGetKBEntry.mockReturnValue([mockKBEntry]);

      const result = await agentChatRouter('How do I manage system settings?', 'frontend-developer', 'Pro');

      expect(result.content).toContain('admin');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('MCP block: Pro tier cannot access Admin features')
      );
    });

    it('should validate role-based access', async () => {
      const mockKBEntry = {
        id: 'kb-admin-feature',
        content: 'Admin feature content',
        mcp: { role: 'admin', tier: 'Admin', theme: 'system_management' }
      };
      mockGetKBEntry.mockReturnValue([mockKBEntry]);

      const result = await agentChatRouter('System management query', 'frontend-developer', 'Admin');

      expect(result.content).toContain('role');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('MCP block: frontend-developer role cannot access admin features')
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty input gracefully', async () => {
      const result = await agentChatRouter('', 'frontend-developer', 'Pro');

      expect(result.type).toBe('agent');
      expect(result.content).toContain("I'm not sure");
    });

    it('should handle very long queries', async () => {
      const longQuery = 'a'.repeat(1000);
      mockGetKBEntry.mockReturnValue([]);

      const result = await agentChatRouter(longQuery, 'frontend-developer', 'Pro');

      expect(result.type).toBe('agent');
      expect(result.content).toContain("I'm not sure");
    });

    it('should handle special characters in queries', async () => {
      const specialQuery = 'How do I use @#$%^&*() features?';
      mockGetKBEntry.mockReturnValue([]);

      const result = await agentChatRouter(specialQuery, 'frontend-developer', 'Pro');

      expect(result.type).toBe('agent');
      expect(mockGetKBEntry).toHaveBeenCalledWith(specialQuery, 'frontend-developer', 'Pro');
    });

    it('should handle concurrent requests without interference', async () => {
      const promises = [
        agentChatRouter('query 1', 'frontend-developer', 'Pro'),
        agentChatRouter('query 2', 'frontend-developer', 'Pro'),
        agentChatRouter('query 3', 'frontend-developer', 'Pro')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.type).toBe('agent');
      });
    });
  });

  describe('Response Structure Validation', () => {
    it('should always return valid AgentMessage structure', async () => {
      const result = await agentChatRouter('test query', 'frontend-developer', 'Pro');

      expect(result).toMatchObject({
        type: expect.stringMatching(/^(user|agent|system)$/),
        content: expect.any(String),
        suggestedActions: expect.any(Array)
      });

      if (result.relatedStepId) {
        expect(result.relatedStepId).toBeDefined();
      }

      if (result.kbRef) {
        expect(result.kbRef).toBeDefined();
      }

      if (result.mcp) {
        expect(result.mcp).toMatchObject({
          role: expect.any(String),
          tier: expect.any(String)
        });
      }
    });

    it('should validate suggestedActions structure', async () => {
      const result = await agentChatRouter('How do I check for emotional drift?', 'frontend-developer', 'Pro');

      result.suggestedActions?.forEach(action => {
        expect(action).toMatchObject({
          label: expect.any(String),
          action: expect.any(String)
        });
      });
    });
  });
}); 