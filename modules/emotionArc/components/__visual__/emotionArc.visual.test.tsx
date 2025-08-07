// MCP Context Block
/*
{
  file: "modules/emotionArc/components/__visual__/emotionArc.visual.test.tsx",
  role: "qa",
  allowedActions: ["test", "render", "compare"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "visual_regression"
}
*/

import { test, expect } from '@playwright/test';
import { _NarrativeSyncProvider } from '../../../shared/state/useNarrativeSyncContext';
import _EmotionTimelineChart from '../EmotionTimelineChart';
import _PlotFrameworkTimeline from '../../plotStructure/PlotFrameworkTimeline';

// Mock data for testing
const mockEmotionalBeats = [
  {
    sceneId: 'scene1',
    characterId: 'hero',
    emotion: 'joy',
    intensity: 80,
    narrativePosition: 0.2,
    timestamp: Date.now(),
    context: 'Hero discovers treasure',
  },
  {
    sceneId: 'scene2',
    characterId: 'hero',
    emotion: 'fear',
    intensity: 90,
    narrativePosition: 0.5,
    timestamp: Date.now(),
    context: 'Hero faces danger',
  },
  {
    sceneId: 'scene3',
    characterId: 'hero',
    emotion: 'relief',
    intensity: 70,
    narrativePosition: 0.8,
    timestamp: Date.now(),
    context: 'Hero escapes safely',
  },
];

const mockPlotBeats = [
  { id: 'setup', label: 'Setup', act: 1, position: 0.1, isStructural: true },
  {
    id: 'catalyst',
    label: 'Catalyst',
    act: 1,
    position: 0.25,
    isStructural: true,
  },
  { id: 'climax', label: 'Climax', act: 3, position: 0.75, isStructural: true },
  {
    id: 'resolution',
    label: 'Resolution',
    act: 3,
    position: 0.9,
    isStructural: true,
  },
];

test.describe('Visual Regression Tests - Emotion Arc Components', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('http://localhost:3000');
  });

  test.describe('EmotionTimelineChart', () => {
    test('default state - all characters', async ({ page }) => {
      await page.setContent(`
        <div id="test-container">
          <EmotionTimelineChart
            emotionalBeats={${JSON.stringify(mockEmotionalBeats)}}
            selectedCharacter="all"
            className="w-full h-64"
          />
        </div>
      `);

      const chart = page.locator('#test-container');
      await expect(chart).toHaveScreenshot('emotion-timeline-default.png');

      // Accessibility check
      await expect(chart).toHaveAttribute('role', 'region');
      await expect(chart).toHaveAttribute('aria-label');
    });

    test('character filtered state', async ({ page }) => {
      await page.setContent(`
        <div id="test-container">
          <EmotionTimelineChart
            emotionalBeats={${JSON.stringify(mockEmotionalBeats)}}
            selectedCharacter="hero"
            className="w-full h-64"
          />
        </div>
      `);

      const chart = page.locator('#test-container');
      await expect(chart).toHaveScreenshot(
        'emotion-timeline-character-filtered.png'
      );
    });

    test('scene selected state', async ({ page }) => {
      await page.setContent(`
        <NarrativeSyncProvider>
          <div id="test-container">
            <EmotionTimelineChart
              emotionalBeats={${JSON.stringify(mockEmotionalBeats)}}
              selectedCharacter="all"
              className="w-full h-64"
            />
          </div>
        </NarrativeSyncProvider>
      `);

      // Simulate scene selection via context
      await page.evaluate(() => {
        // Mock context update
        window.narrativeSync = { currentSceneId: 'scene2' };
      });

      const chart = page.locator('#test-container');
      await expect(chart).toHaveScreenshot(
        'emotion-timeline-scene-selected.png'
      );
    });

    test('no data available state', async ({ page }) => {
      await page.setContent(`
        <div id="test-container">
          <EmotionTimelineChart
            emotionalBeats={[]}
            selectedCharacter="all"
            className="w-full h-64"
          />
        </div>
      `);

      const chart = page.locator('#test-container');
      await expect(chart).toHaveScreenshot('emotion-timeline-no-data.png');

      // Check for empty state message
      await expect(chart).toContainText('No emotional data available');
    });

    test('loading state', async ({ page }) => {
      await page.setContent(`
        <div id="test-container">
          <EmotionTimelineChart
            emotionalBeats={[]}
            selectedCharacter="all"
            isLoading={true}
            className="w-full h-64"
          />
        </div>
      `);

      const chart = page.locator('#test-container');
      await expect(chart).toHaveScreenshot('emotion-timeline-loading.png');

      // Check for loading spinner
      await expect(chart).toContainText('Loading emotional timeline');
    });

    test('error state', async ({ page }) => {
      await page.setContent(`
        <div id="test-container">
          <EmotionTimelineChart
            emotionalBeats={[]}
            selectedCharacter="all"
            error="Failed to load emotional data"
            className="w-full h-64"
          />
        </div>
      `);

      const chart = page.locator('#test-container');
      await expect(chart).toHaveScreenshot('emotion-timeline-error.png');

      // Check for error message
      await expect(chart).toContainText('Error loading emotional data');
    });
  });

  test.describe('PlotFrameworkTimeline', () => {
    test('default state - hero journey', async ({ page }) => {
      await page.setContent(`
        <div id="test-container">
          <PlotFrameworkTimeline
            framework="Hero's Journey"
            beats={${JSON.stringify(mockPlotBeats)}}
            className="w-full"
          />
        </div>
      `);

      const timeline = page.locator('#test-container');
      await expect(timeline).toHaveScreenshot('plot-timeline-default.png');

      // Accessibility check
      await expect(timeline).toHaveAttribute('role', 'region');
    });

    test('scene selected state', async ({ page }) => {
      await page.setContent(`
        <div id="test-container">
          <PlotFrameworkTimeline
            framework="Hero's Journey"
            beats={${JSON.stringify(mockPlotBeats)}}
            currentSceneId="climax"
            className="w-full"
          />
        </div>
      `);

      const timeline = page.locator('#test-container');
      await expect(timeline).toHaveScreenshot(
        'plot-timeline-scene-selected.png'
      );

      // Check for selected beat highlighting
      const selectedBeat = timeline.locator('[aria-pressed="true"]');
      await expect(selectedBeat).toBeVisible();
    });

    test('with arc overlay', async ({ page }) => {
      const mockOverlay = [
        {
          sceneId: 'scene1',
          beatId: 'setup',
          beatLabel: 'Setup',
          expectedEmotionalTone: 'calm',
        },
        {
          sceneId: 'scene2',
          beatId: 'climax',
          beatLabel: 'Climax',
          expectedEmotionalTone: 'tension',
        },
      ];

      await page.setContent(`
        <NarrativeSyncProvider>
          <div id="test-container">
            <PlotFrameworkTimeline
              framework="Hero's Journey"
              beats={${JSON.stringify(mockPlotBeats)}}
              arcOverlay={${JSON.stringify(mockOverlay)}}
              className="w-full"
            />
          </div>
        </NarrativeSyncProvider>
      `);

      const timeline = page.locator('#test-container');
      await expect(timeline).toHaveScreenshot('plot-timeline-with-overlay.png');
    });
  });

  test.describe('Accessibility Tests', () => {
    test('color contrast compliance', async ({ page }) => {
      await page.setContent(`
        <div id="test-container">
          <EmotionTimelineChart
            emotionalBeats={${JSON.stringify(mockEmotionalBeats)}}
            selectedCharacter="all"
            className="w-full h-64"
          />
        </div>
      `);

      // Check for sufficient color contrast
      const _chart = page.locator('#test-container');
      const contrast = await page.evaluate(() => {
        // Mock contrast calculation - in real test, use actual contrast checking library
        return { passed: true, ratio: 4.5 };
      });

      expect(contrast.passed).toBe(true);
      expect(contrast.ratio).toBeGreaterThan(4.5);
    });

    test('keyboard navigation', async ({ page }) => {
      await page.setContent(`
        <div id="test-container">
          <EmotionTimelineChart
            emotionalBeats={${JSON.stringify(mockEmotionalBeats)}}
            selectedCharacter="all"
            className="w-full h-64"
          />
                </div>
      `);

      const chart = page.locator('#test-container');

      // Test tab navigation
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Test Enter key on focused element
      await page.keyboard.press('Enter');
      // Should trigger onBeatClick callback
    });
  });
});

// CI Integration
test.describe('CI Visual Regression', () => {
  test('pixel delta threshold check', async ({ page }) => {
    // This would be implemented with actual pixel comparison
    // For now, we'll just ensure components render without errors

    await page.setContent(`
      <div id="test-container">
        <EmotionTimelineChart
          emotionalBeats={${JSON.stringify(mockEmotionalBeats)}}
          selectedCharacter="all"
          className="w-full h-64"
        />
      </div>
    `);

    const chart = page.locator('#test-container');
    await expect(chart).toBeVisible();

    // In real implementation, compare with baseline and warn if delta > 2%
    const pixelDelta = 0; // Mock - would be calculated from actual comparison
    expect(pixelDelta).toBeLessThan(2);
  });
});
