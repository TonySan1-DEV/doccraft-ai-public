// MCP Context Block
/*
{
  file: "agentDefaultPolicy.test.ts",
  role: "qa-engineer",
  allowedActions: ["test", "validate", "policy"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "policy_management"
}
*/

import { AgentPrefs } from '../../../types/agentPreferences';
import {
  getDefaultPolicy,
  getDefaultPolicyByTier,
  getAvailableRoles,
  getAvailableTiers,
  isFieldLockedForRole,
  getLockedFieldsForRole,
  mergeWithRoleDefaults,
  validatePreferencesForRole,
  getRoleCapabilities,
  createCustomPolicy,
  getPolicyMap,
  updatePolicyMap,
  policyMap
} from '../agentDefaultPolicy';

describe('agentDefaultPolicy', () => {
  describe('getDefaultPolicy', () => {
    it('should return user defaults for "user" role', () => {
      const policy = getDefaultPolicy('user');

      expect(policy).toEqual({
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'list' as const,
        lockedFields: ['copilotEnabled', 'memoryEnabled']
      });
    });

    it('should return pro defaults for "pro" role', () => {
      const policy = getDefaultPolicy('pro');

      expect(policy).toEqual({
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list' as const,
        lockedFields: []
      });
    });

    it('should return admin defaults with locked fields', () => {
      const policy = getDefaultPolicy('admin');

      expect(policy).toEqual({
        tone: 'formal' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list' as const,
        lockedFields: ['memoryEnabled', 'copilotEnabled']
      });
    });

    it('should return enterprise defaults for "enterprise" role', () => {
      const policy = getDefaultPolicy('enterprise');

      expect(policy).toEqual({
        tone: 'formal' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'grid' as const,
        lockedFields: []
      });
    });

    it('should return developer defaults for "developer" role', () => {
      const policy = getDefaultPolicy('developer');

      expect(policy).toEqual({
        tone: 'concise' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list' as const,
        lockedFields: []
      });
    });

    it('should fallback to user policy for unknown role', () => {
      const policy = getDefaultPolicy('unknown-role');

      expect(policy).toEqual({
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'list' as const,
        lockedFields: ['copilotEnabled', 'memoryEnabled']
      });
    });

    it('should handle case-insensitive role matching', () => {
      const policy1 = getDefaultPolicy('USER');
      const policy2 = getDefaultPolicy('User');
      const policy3 = getDefaultPolicy('user');

      expect(policy1).toEqual(policy2);
      expect(policy2).toEqual(policy3);
    });

    it('should return a new object instance each time', () => {
      const policy1 = getDefaultPolicy('user');
      const policy2 = getDefaultPolicy('user');

      expect(policy1).toEqual(policy2);
      expect(policy1).not.toBe(policy2); // Different object instances
    });
  });

  describe('getDefaultPolicyByTier', () => {
    it('should map Basic tier to user role', () => {
      const policy = getDefaultPolicyByTier('Basic');

      expect(policy).toEqual({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'list',
        lockedFields: ['copilotEnabled', 'memoryEnabled']
      });
    });

    it('should map Pro tier to pro role', () => {
      const policy = getDefaultPolicyByTier('Pro');

      expect(policy).toEqual({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: []
      });
    });

    it('should map Enterprise tier to enterprise role', () => {
      const policy = getDefaultPolicyByTier('Enterprise');

      expect(policy).toEqual({
        tone: 'formal',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'grid',
        lockedFields: []
      });
    });

    it('should map Admin tier to admin role', () => {
      const policy = getDefaultPolicyByTier('Admin');

      expect(policy).toEqual({
        tone: 'formal',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: ['memoryEnabled', 'copilotEnabled']
      });
    });

    it('should map Developer tier to developer role', () => {
      const policy = getDefaultPolicyByTier('Developer');

      expect(policy).toEqual({
        tone: 'concise',
        language: 'en',
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: []
      });
    });

    it('should fallback to user role for unknown tier', () => {
      const policy = getDefaultPolicyByTier('Unknown');

      expect(policy).toEqual({
        tone: 'friendly',
        language: 'en',
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'list',
        lockedFields: ['copilotEnabled', 'memoryEnabled']
      });
    });
  });

  describe('getAvailableRoles', () => {
    it('should return all available roles', () => {
      const roles = getAvailableRoles();

      expect(roles).toEqual(['user', 'pro', 'admin', 'enterprise', 'developer']);
    });

    it('should return a new array each time', () => {
      const roles1 = getAvailableRoles();
      const roles2 = getAvailableRoles();

      expect(roles1).toEqual(roles2);
      expect(roles1).not.toBe(roles2); // Different array instances
    });
  });

  describe('getAvailableTiers', () => {
    it('should return all available tiers', () => {
      const tiers = getAvailableTiers();

      expect(tiers).toEqual(['Basic', 'Pro', 'Enterprise', 'Admin', 'Developer']);
    });
  });

  describe('isFieldLockedForRole', () => {
    it('should return true for locked fields in user role', () => {
      expect(isFieldLockedForRole('copilotEnabled', 'user')).toBe(true);
      expect(isFieldLockedForRole('memoryEnabled', 'user')).toBe(true);
    });

    it('should return false for unlocked fields in user role', () => {
      expect(isFieldLockedForRole('tone', 'user')).toBe(false);
      expect(isFieldLockedForRole('language', 'user')).toBe(false);
      expect(isFieldLockedForRole('defaultCommandView', 'user')).toBe(false);
    });

    it('should return false for all fields in pro role', () => {
      expect(isFieldLockedForRole('copilotEnabled', 'pro')).toBe(false);
      expect(isFieldLockedForRole('memoryEnabled', 'pro')).toBe(false);
      expect(isFieldLockedForRole('tone', 'pro')).toBe(false);
    });

    it('should return true for locked fields in admin role', () => {
      expect(isFieldLockedForRole('memoryEnabled', 'admin')).toBe(true);
      expect(isFieldLockedForRole('copilotEnabled', 'admin')).toBe(true);
    });

    it('should return false for unlocked fields in admin role', () => {
      expect(isFieldLockedForRole('tone', 'admin')).toBe(false);
      expect(isFieldLockedForRole('language', 'admin')).toBe(false);
      expect(isFieldLockedForRole('defaultCommandView', 'admin')).toBe(false);
    });

    it('should handle unknown roles gracefully', () => {
      expect(isFieldLockedForRole('tone', 'unknown')).toBe(false);
    });
  });

  describe('getLockedFieldsForRole', () => {
    it('should return locked fields for user role', () => {
      const lockedFields = getLockedFieldsForRole('user');

      expect(lockedFields).toEqual(['copilotEnabled', 'memoryEnabled']);
    });

    it('should return empty array for pro role', () => {
      const lockedFields = getLockedFieldsForRole('pro');

      expect(lockedFields).toEqual([]);
    });

    it('should return locked fields for admin role', () => {
      const lockedFields = getLockedFieldsForRole('admin');

      expect(lockedFields).toEqual(['memoryEnabled', 'copilotEnabled']);
    });

    it('should return empty array for enterprise role', () => {
      const lockedFields = getLockedFieldsForRole('enterprise');

      expect(lockedFields).toEqual([]);
    });

    it('should return empty array for developer role', () => {
      const lockedFields = getLockedFieldsForRole('developer');

      expect(lockedFields).toEqual([]);
    });

    it('should handle unknown roles gracefully', () => {
      const lockedFields = getLockedFieldsForRole('unknown');

      expect(lockedFields).toEqual([]);
    });
  });

  describe('mergeWithRoleDefaults', () => {
    it('should merge user preferences with role defaults', () => {
      const userPrefs: Partial<AgentPrefs> = {
        tone: 'formal',
        language: 'es'
      };

      const merged = mergeWithRoleDefaults(userPrefs, 'user');

      expect(merged).toEqual({
        tone: 'formal', // From user prefs
        language: 'es', // From user prefs
        copilotEnabled: false, // From role defaults
        memoryEnabled: false, // From role defaults
        defaultCommandView: 'list', // From role defaults
        lockedFields: ['copilotEnabled', 'memoryEnabled'] // From role defaults
      });
    });

    it('should respect locked fields when merging', () => {
      const userPrefs: Partial<AgentPrefs> = {
        copilotEnabled: true, // Should be ignored (locked)
        memoryEnabled: true, // Should be ignored (locked)
        tone: 'concise' // Should be applied (unlocked)
      };

      const merged = mergeWithRoleDefaults(userPrefs, 'user');

      expect(merged).toEqual({
        tone: 'concise', // Applied from user prefs
        language: 'en', // From role defaults
        copilotEnabled: false, // Locked - ignored user pref
        memoryEnabled: false, // Locked - ignored user pref
        defaultCommandView: 'list', // From role defaults
        lockedFields: ['copilotEnabled', 'memoryEnabled'] // From role defaults
      });
    });

    it('should allow all changes for pro role', () => {
      const userPrefs: Partial<AgentPrefs> = {
        tone: 'concise',
        language: 'fr',
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'grid'
      };

      const merged = mergeWithRoleDefaults(userPrefs, 'pro');

      expect(merged).toEqual({
        tone: 'concise', // Applied
        language: 'fr', // Applied
        copilotEnabled: false, // Applied
        memoryEnabled: false, // Applied
        defaultCommandView: 'grid', // Applied
        lockedFields: [] // From role defaults
      });
    });

    it('should respect admin locked fields', () => {
      const userPrefs: Partial<AgentPrefs> = {
        copilotEnabled: false, // Should be ignored (locked)
        memoryEnabled: false, // Should be ignored (locked)
        tone: 'friendly' // Should be applied (unlocked)
      };

      const merged = mergeWithRoleDefaults(userPrefs, 'admin');

      expect(merged).toEqual({
        tone: 'friendly', // Applied from user prefs
        language: 'en', // From role defaults
        copilotEnabled: true, // Locked - ignored user pref
        memoryEnabled: true, // Locked - ignored user pref
        defaultCommandView: 'list', // From role defaults
        lockedFields: ['memoryEnabled', 'copilotEnabled'] // From role defaults
      });
    });
  });

  describe('validatePreferencesForRole', () => {
    it('should return valid for compliant preferences', () => {
      const prefs: AgentPrefs = {
        tone: 'friendly',
        language: 'en',
        copilotEnabled: false, // Matches user role default
        memoryEnabled: false, // Matches user role default
        defaultCommandView: 'list',
        lockedFields: ['copilotEnabled', 'memoryEnabled']
      };

      const result = validatePreferencesForRole(prefs, 'user');

      expect(result.valid).toBe(true);
      expect(result.violations).toEqual([]);
    });

    it('should return invalid for locked field violations', () => {
      const prefs: AgentPrefs = {
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true, // Violates user role lock
        memoryEnabled: false,
        defaultCommandView: 'list',
        lockedFields: ['copilotEnabled', 'memoryEnabled']
      };

      const result = validatePreferencesForRole(prefs, 'user');

      expect(result.valid).toBe(false);
      expect(result.violations).toContain("Field 'copilotEnabled' is locked for role 'user'");
    });

    it('should return invalid for multiple violations', () => {
      const prefs: AgentPrefs = {
        tone: 'friendly',
        language: 'en',
        copilotEnabled: true, // Violates user role lock
        memoryEnabled: true, // Violates user role lock
        defaultCommandView: 'list',
        lockedFields: ['copilotEnabled', 'memoryEnabled']
      };

      const result = validatePreferencesForRole(prefs, 'user');

      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(2);
      expect(result.violations).toContain("Field 'copilotEnabled' is locked for role 'user'");
      expect(result.violations).toContain("Field 'memoryEnabled' is locked for role 'user'");
    });

    it('should return valid for pro role with any settings', () => {
      const prefs: AgentPrefs = {
        tone: 'concise',
        language: 'fr',
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'grid',
        lockedFields: []
      };

      const result = validatePreferencesForRole(prefs, 'pro');

      expect(result.valid).toBe(true);
      expect(result.violations).toEqual([]);
    });

    it('should return invalid for admin role violations', () => {
      const prefs: AgentPrefs = {
        tone: 'formal',
        language: 'en',
        copilotEnabled: false, // Violates admin role lock
        memoryEnabled: true,
        defaultCommandView: 'list',
        lockedFields: ['memoryEnabled', 'copilotEnabled']
      };

      const result = validatePreferencesForRole(prefs, 'admin');

      expect(result.valid).toBe(false);
      expect(result.violations).toContain("Field 'copilotEnabled' is locked for role 'admin'");
    });
  });

  describe('getRoleCapabilities', () => {
    it('should return correct capabilities for user role', () => {
      const capabilities = getRoleCapabilities('user');

      expect(capabilities).toEqual({
        canUseCopilot: false, // Disabled and locked
        canUseMemory: false, // Disabled and locked
        canChangeTone: true, // Unlocked
        canChangeLanguage: true, // Unlocked
        canChangeCommandView: true // Unlocked
      });
    });

    it('should return correct capabilities for pro role', () => {
      const capabilities = getRoleCapabilities('pro');

      expect(capabilities).toEqual({
        canUseCopilot: true, // Enabled and unlocked
        canUseMemory: true, // Enabled and unlocked
        canChangeTone: true, // Unlocked
        canChangeLanguage: true, // Unlocked
        canChangeCommandView: true // Unlocked
      });
    });

    it('should return correct capabilities for admin role', () => {
      const capabilities = getRoleCapabilities('admin');

      expect(capabilities).toEqual({
        canUseCopilot: true, // Enabled but locked
        canUseMemory: true, // Enabled but locked
        canChangeTone: true, // Unlocked
        canChangeLanguage: true, // Unlocked
        canChangeCommandView: true // Unlocked
      });
    });

    it('should handle unknown roles gracefully', () => {
      const capabilities = getRoleCapabilities('unknown');

      expect(capabilities).toEqual({
        canUseCopilot: false, // Fallback to user role
        canUseMemory: false, // Fallback to user role
        canChangeTone: true, // Fallback to user role
        canChangeLanguage: true, // Fallback to user role
        canChangeCommandView: true // Fallback to user role
      });
    });
  });

  describe('createCustomPolicy', () => {
    it('should create custom policy with overrides', () => {
      const overrides = {
        tone: 'concise' as const,
        language: 'fr' as const,
        lockedFields: ['tone'] // Override locked fields
      };

      const customPolicy = createCustomPolicy('user', overrides);

      expect(customPolicy).toEqual({
        tone: 'concise', // From overrides
        language: 'fr', // From overrides
        copilotEnabled: false, // From base user policy
        memoryEnabled: false, // From base user policy
        defaultCommandView: 'list', // From base user policy
        lockedFields: ['tone'] // From overrides
      });
    });

    it('should preserve base policy for unspecified fields', () => {
      const overrides = {
        tone: 'formal' as const
      };

      const customPolicy = createCustomPolicy('pro', overrides);

      expect(customPolicy).toEqual({
        tone: 'formal', // From overrides
        language: 'en', // From base pro policy
        copilotEnabled: true, // From base pro policy
        memoryEnabled: true, // From base pro policy
        defaultCommandView: 'list', // From base pro policy
        lockedFields: [] // From base pro policy
      });
    });
  });

  describe('getPolicyMap', () => {
    it('should return a copy of the policy map', () => {
      const map = getPolicyMap();

      expect(map).toHaveProperty('user');
      expect(map).toHaveProperty('pro');
      expect(map).toHaveProperty('admin');
      expect(map).toHaveProperty('enterprise');
      expect(map).toHaveProperty('developer');

      // Should be a copy, not the original
      expect(map).not.toBe(policyMap);
    });
  });

  describe('updatePolicyMap', () => {
    it('should update policy map for existing role', () => {
      const newPolicy = {
        tone: 'concise' as const,
        language: 'fr' as const,
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'grid' as const,
        lockedFields: ['tone']
      };

      updatePolicyMap('user', newPolicy);

      const updatedPolicy = getDefaultPolicy('user');
      expect(updatedPolicy).toEqual(newPolicy);
    });

    it('should add new role to policy map', () => {
      const newRolePolicy = {
        tone: 'formal' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list' as const,
        lockedFields: []
      };

      updatePolicyMap('custom', newRolePolicy);

      const customPolicy = getDefaultPolicy('custom');
      expect(customPolicy).toEqual(newRolePolicy);
    });

    it('should log telemetry when available', () => {
      const mockLogTelemetryEvent = jest.fn();
      Object.defineProperty(window, 'logTelemetryEvent', {
        value: mockLogTelemetryEvent,
        writable: true
      });

      const newPolicy = {
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: true,
        memoryEnabled: true,
        defaultCommandView: 'list' as const,
        lockedFields: []
      };

      updatePolicyMap('test', newPolicy);

      expect(mockLogTelemetryEvent).toHaveBeenCalledWith('policy_map_updated', {
        role: 'test',
        policy: expect.arrayContaining(['tone', 'language', 'copilotEnabled', 'memoryEnabled', 'defaultCommandView', 'lockedFields'])
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty role string', () => {
      const policy = getDefaultPolicy('');

      expect(policy).toEqual({
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'list' as const,
        lockedFields: ['copilotEnabled', 'memoryEnabled']
      });
    });

    it('should handle null role string', () => {
      const policy = getDefaultPolicy(null as any);

      expect(policy).toEqual({
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'list' as const,
        lockedFields: ['copilotEnabled', 'memoryEnabled']
      });
    });

    it('should handle undefined role string', () => {
      const policy = getDefaultPolicy(undefined as any);

      expect(policy).toEqual({
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'list' as const,
        lockedFields: ['copilotEnabled', 'memoryEnabled']
      });
    });

    it('should handle special characters in role names', () => {
      const policy = getDefaultPolicy('user-role@123');

      expect(policy).toEqual({
        tone: 'friendly' as const,
        language: 'en' as const,
        copilotEnabled: false,
        memoryEnabled: false,
        defaultCommandView: 'list' as const,
        lockedFields: ['copilotEnabled', 'memoryEnabled']
      });
    });
  });
}); 