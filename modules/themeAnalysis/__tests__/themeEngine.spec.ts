// MCP Context Block
/*
role: qa,
tier: Pro,
file: "modules/themeAnalysis/__tests__/themeEngine.spec.ts",
allowedActions: ["test", "mock", "validate"],
theme: "theme_analysis"
*/

/// <reference types="jest" />
import { analyzeThemeConsistency, SceneMeta } from '../initThemeEngine';
import type { ThemeAlignmentReport, ThematicSignal } from '../themeTypes';

describe('Theme Engine – Thematic Accuracy', () => {
  // 1. Theme Detection
  it('detects top ThematicSignal[] accurately from sceneText', async () => {
    const scene: SceneMeta = {
      sceneId: 's1',
      text: 'Loyalty and betrayal shaped the night. Trust was broken, but hope remained.'
    };
    const report: ThemeAlignmentReport = await analyzeThemeConsistency(scene.text, [scene]);
    const detectedThemes = report.misalignedScenes.length ? report.misalignedScenes[0].themes : [];
    const themeNames = detectedThemes.map(t => t.theme);
    expect(themeNames).toEqual(expect.arrayContaining(['loyalty', 'betrayal', 'trust', 'hope']));
    detectedThemes.forEach(sig => {
      expect(typeof sig.strength).toBe('number');
      expect(sig.strength).toBeGreaterThanOrEqual(0);
      expect(sig.strength).toBeLessThanOrEqual(1);
    });
  });

  // 2. Drift Detection
  it('flags misalignment and generates suggestions for missing/inverted themes', async () => {
    // Coming of Age: identity, belonging, rebellion, growth
    const comingOfAgeThemes = ['identity', 'belonging', 'rebellion', 'growth'];
    const scene: SceneMeta = {
      sceneId: 's2',
      text: 'Conformity was enforced. No one dared rebel. The group demanded obedience.'
    };
    // Simulate a story scope with a single scene
    const report: ThemeAlignmentReport = await analyzeThemeConsistency(scene.text, [scene]);
    // Should detect lack of rebellion/growth
    expect(report.primaryThemes.length).toBeGreaterThan(0);
    // If none of the comingOfAgeThemes are present, scene should be misaligned
    const present = report.misalignedScenes.some(s => s.sceneId === scene.sceneId);
    expect(present).toBe(true);
    // Suggestions should mention missing themes
    const suggestionText = report.suggestions.join(' ');
    expect(suggestionText).toMatch(/Add cues|Reinforce/);
  });

  // 3. Coverage Metrics
  it('computes correct coverageScore for scene:theme match', async () => {
    const scenes: SceneMeta[] = [
      { sceneId: 's1', text: 'Love and sacrifice defined their journey.' },
      { sceneId: 's2', text: 'Power and betrayal haunted the city.' },
      { sceneId: 's3', text: 'No theme keywords here.' }
    ];
    const report: ThemeAlignmentReport = await analyzeThemeConsistency('', scenes);
    // At least one scene should be misaligned
    expect(report.misalignedScenes.length).toBeGreaterThan(0);
    // Coverage score should be < 100
    expect(report.coverageScore).toBeLessThan(100);
    // Edge case: ambiguous scene
    const ambiguous: SceneMeta = { sceneId: 's4', text: 'The tone was ironic, nothing was as it seemed.' };
    const report2: ThemeAlignmentReport = await analyzeThemeConsistency(ambiguous.text, [ambiguous]);
    // Should handle ambiguous/satire gracefully
    expect(report2.coverageScore).toBeGreaterThanOrEqual(0);
    expect(report2.coverageScore).toBeLessThanOrEqual(100);
  });

  // 4. Genre Theme Set (Romance, Noir, Thriller)
  it('handles predefined genre theme sets for drift detection', async () => {
    const romanceScene: SceneMeta = {
      sceneId: 'r1',
      text: 'Love and forgiveness triumphed over jealousy.'
    };
    const noirScene: SceneMeta = {
      sceneId: 'n1',
      text: 'Betrayal and justice danced in the shadows.'
    };
    const thrillerScene: SceneMeta = {
      sceneId: 't1',
      text: 'Paranoia and survival instincts kicked in.'
    };
    const romanceReport = await analyzeThemeConsistency(romanceScene.text, [romanceScene]);
    expect(romanceReport.primaryThemes).toEqual(expect.arrayContaining(['love', 'forgiveness', 'jealousy']));
    const noirReport = await analyzeThemeConsistency(noirScene.text, [noirScene]);
    expect(noirReport.primaryThemes).toEqual(expect.arrayContaining(['betrayal', 'justice']));
    const thrillerReport = await analyzeThemeConsistency(thrillerScene.text, [thrillerScene]);
    expect(thrillerReport.primaryThemes).toEqual(expect.arrayContaining(['paranoia']));
  });
}); 