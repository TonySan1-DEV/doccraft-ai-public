// MCP Context Block
/*
{
  file: "modules/plotStructure/__tests__/plotFrameworkEngine.spec.ts",
  role: "qa",
  allowedActions: ["test", "validate", "mock"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "story_engineering"
}
*/

import { describe, it, expect } from '@jest/globals';
import { PlotFrameworkEngine } from '../plotFrameworkEngine';
import { FrameworkConfigs } from '../frameworkConfigs';
import type { CharacterPersona } from '@/types/CharacterPersona';

describe('PlotFrameworkEngine persona alignment', () => {
  const beats = FrameworkConfigs.HerosJourney;
  const engine = new PlotFrameworkEngine('HerosJourney');

  it('aligns a Redemptive arcType protagonist with Hero’s Journey', () => {
    const persona: CharacterPersona = {
      id: 'p1',
      user_id: 'u1',
      name: 'Alice',
      archetype: 'Hero',
      goals: 'Save the world',
      voiceStyle: 'Inspiring',
      worldview: 'Hopeful',
      personality: 'Courageous',
      knownConnections: [],
      traits: { arcType: 'Redemptive', desire: 'Redemption', flaw: 'Doubt' },
    };
    const overlay = engine.alignPersonaToFramework(persona, beats);
    expect(overlay.characterName).toBe('Alice');
    expect(overlay.arcType).toBe('Redemptive');
    expect(overlay.mismatches.length).toBe(0);
    expect(overlay.alignment.some(a => a.match)).toBe(true);
  });

  it('detects mismatches for Tragic arcType at return beat', () => {
    const persona: CharacterPersona = {
      id: 'p2',
      user_id: 'u2',
      name: 'Bob',
      archetype: 'Antihero',
      goals: 'Power',
      voiceStyle: 'Dark',
      worldview: 'Cynical',
      personality: 'Ambitious',
      knownConnections: [],
      traits: { arcType: 'Tragic', desire: 'Dominance', flaw: 'Hubris' },
    };
    const overlay = engine.alignPersonaToFramework(persona, beats);
    expect(overlay.characterName).toBe('Bob');
    expect(overlay.arcType).toBe('Tragic');
    expect(overlay.mismatches.length).toBeGreaterThan(0);
    expect(overlay.mismatches.some(m => m.beatId === 'return')).toBe(true);
  });
});
