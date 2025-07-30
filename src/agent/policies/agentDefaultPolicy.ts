// MCP Context Block
/*
{
  file: "agentDefaultPolicy.ts",
  role: "admin",
  allowedActions: ["configure", "policy", "defaults"],
  tier: "Pro",
  contentSensitivity: "low",
  theme: "policy_management"
}
*/

import { AgentPrefs } from '../../types/agentPreferences';

// Policy interface - same as AgentPrefs since lockedFields is already included
export interface AgentPolicy extends AgentPrefs {
  // All fields from AgentPrefs are inherited, including lockedFields
}

// Policy map for different user roles
const policyMap: Record<string, AgentPolicy> = {
  // Basic user - limited features
  user: {
    tone: 'friendly' as const,
    language: 'en' as const,
    copilotEnabled: false,
    memoryEnabled: false,
    defaultCommandView: 'list' as const,
    lockedFields: ['copilotEnabled', 'memoryEnabled']
  },

  // Pro user - enhanced features
  pro: {
    tone: 'friendly' as const,
    language: 'en' as const,
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: 'list' as const,
    lockedFields: []
  },

  // Admin user - full access with some locked fields
  admin: {
    tone: 'formal' as const,
    language: 'en' as const,
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: 'list' as const,
    lockedFields: ['memoryEnabled', 'copilotEnabled'] // Admins can't disable core features
  },

  // Enterprise user - premium features
  enterprise: {
    tone: 'formal' as const,
    language: 'en' as const,
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: 'grid' as const,
    lockedFields: []
  },

  // Developer role - testing configuration
  developer: {
    tone: 'concise' as const,
    language: 'en' as const,
    copilotEnabled: true,
    memoryEnabled: true,
    defaultCommandView: 'list' as const,
    lockedFields: []
  }
};

// Fallback policy for unrecognized roles
const fallbackPolicy: AgentPolicy = {
  tone: 'friendly' as const,
  language: 'en' as const,
  copilotEnabled: false,
  memoryEnabled: false,
  defaultCommandView: 'list' as const,
  lockedFields: ['copilotEnabled', 'memoryEnabled']
};

/**
 * Gets the default policy for a specific role
 */
export function getDefaultPolicy(role: string): AgentPolicy {
  // Normalize role to lowercase for case-insensitive matching
  const normalizedRole = role.toLowerCase();
  
  // Check if role exists in policy map
  if (policyMap[normalizedRole]) {
    return { ...policyMap[normalizedRole] };
  }

  // Fallback to base user policy for unrecognized roles
  console.warn(`[AgentDefaultPolicy] Unrecognized role: ${role}, using fallback policy`);
  return { ...fallbackPolicy };
}

/**
 * Gets the default policy for a specific tier
 */
export function getDefaultPolicyByTier(tier: string): AgentPolicy {
  const tierMap: Record<string, string> = {
    'Basic': 'user',
    'Pro': 'pro',
    'Enterprise': 'enterprise',
    'Admin': 'admin',
    'Developer': 'developer'
  };

  const role = tierMap[tier] || 'user';
  return getDefaultPolicy(role);
}

/**
 * Gets all available roles
 */
export function getAvailableRoles(): string[] {
  return Object.keys(policyMap);
}

/**
 * Gets all available tiers
 */
export function getAvailableTiers(): string[] {
  return ['Basic', 'Pro', 'Enterprise', 'Admin', 'Developer'];
}

/**
 * Checks if a field is locked for a specific role
 */
export function isFieldLockedForRole(field: keyof AgentPrefs, role: string): boolean {
  const policy = getDefaultPolicy(role);
  return policy.lockedFields?.includes(field as string) || false;
}

/**
 * Gets locked fields for a specific role
 */
export function getLockedFieldsForRole(role: string): string[] {
  const policy = getDefaultPolicy(role);
  return policy.lockedFields || [];
}

/**
 * Merges user preferences with role-based defaults
 */
export function mergeWithRoleDefaults(
  userPrefs: Partial<AgentPrefs>, 
  role: string
): AgentPrefs {
  const roleDefaults = getDefaultPolicy(role);
  const lockedFields = roleDefaults.lockedFields || [];

  // Start with role defaults
  const merged: AgentPrefs = { ...roleDefaults };

  // Apply user preferences, respecting locked fields
  Object.entries(userPrefs).forEach(([key, value]) => {
    if (!lockedFields.includes(key)) {
      (merged as any)[key] = value;
    } else {
      console.warn(`[AgentDefaultPolicy] Field ${key} is locked for role ${role}`);
    }
  });

  return merged;
}

/**
 * Validates if user preferences comply with role restrictions
 */
export function validatePreferencesForRole(
  prefs: AgentPrefs, 
  role: string
): { valid: boolean; violations: string[] } {
  const lockedFields = getLockedFieldsForRole(role);
  const roleDefaults = getDefaultPolicy(role);
  const violations: string[] = [];

  // Check if any locked fields have been modified
  lockedFields.forEach(field => {
    const userValue = (prefs as any)[field];
    const defaultValue = (roleDefaults as any)[field];
    
    if (userValue !== defaultValue) {
      violations.push(`Field '${field}' is locked for role '${role}'`);
    }
  });

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Gets a summary of role capabilities
 */
export function getRoleCapabilities(role: string): {
  canUseCopilot: boolean;
  canUseMemory: boolean;
  canChangeTone: boolean;
  canChangeLanguage: boolean;
  canChangeCommandView: boolean;
} {
  const policy = getDefaultPolicy(role);
  const lockedFields = policy.lockedFields || [];

  return {
    canUseCopilot: policy.copilotEnabled && !lockedFields.includes('copilotEnabled'),
    canUseMemory: policy.memoryEnabled && !lockedFields.includes('memoryEnabled'),
    canChangeTone: !lockedFields.includes('tone'),
    canChangeLanguage: !lockedFields.includes('language'),
    canChangeCommandView: !lockedFields.includes('defaultCommandView')
  };
}

/**
 * Creates a custom policy for testing or special cases
 */
export function createCustomPolicy(
  baseRole: string,
  overrides: Partial<AgentPolicy>
): AgentPolicy {
  const basePolicy = getDefaultPolicy(baseRole);
  return { ...basePolicy, ...overrides };
}

/**
 * Exports the complete policy map for external use
 */
export function getPolicyMap(): Record<string, AgentPolicy> {
  return { ...policyMap };
}

/**
 * Updates the policy map (admin function)
 */
export function updatePolicyMap(
  role: string, 
  policy: AgentPolicy
): void {
  if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
    (window as any).logTelemetryEvent('policy_map_updated', {
      role,
      policy: Object.keys(policy)
    });
  }
  
  policyMap[role.toLowerCase()] = { ...policy };
}

// Export the policy map for reference
export { policyMap }; 