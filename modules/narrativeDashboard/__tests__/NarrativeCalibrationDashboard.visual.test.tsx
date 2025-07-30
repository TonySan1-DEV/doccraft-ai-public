// MCP Context Block
/*
role: qa,
tier: Pro,
file: "modules/narrativeDashboard/__tests__/NarrativeCalibrationDashboard.visual.test.tsx",
allowedActions: ["test", "snapshot", "render"],
theme: "visual_regression"
*/

import { test, expect } from '@playwright/experimental-ct-react';
import { NarrativeCalibrationDashboard } from '../NarrativeCalibrationDashboard';
import { NarrativeSyncProvider } from '../../shared/state/useNarrativeSyncContext';

// Shared test data mock
const mockNarrativeSync = {
  currentSceneId: 'scene1',
  characterFocusId: 'char1',
  activePlotFramework: 'heros_journey',
  arcOverlay: [],
  setScene: () => {},
  setCharacter: () => {},
  setFramework: () => {},
  updateOverlay: () => {},
};

const renderDashboard = (props = {}) => (
  <NarrativeSyncProvider value={mockNarrativeSync}>
    <NarrativeCalibrationDashboard {...props} />
  </NarrativeSyncProvider>
);

test.describe('NarrativeCalibrationDashboard Visual Regression', () => {
  test('renders default (Plot) tab with populated data', async ({ mount, page }) => {
    const component = await mount(renderDashboard());
    await expect(component).toHaveScreenshot('dashboard-plot-default.png', { threshold: 0.02 });
    await expect(component.getByRole('tab', { name: /plot/i })).toBeFocused();
    await expect(component.getByLabel('Narrative Calibration Dashboard')).toBeVisible();
  });

  for (const tab of ['Plot', 'Emotion', 'Optimization', 'Character']) {
    test(`renders ${tab} tab and matches snapshot`, async ({ mount, page }) => {
      const component = await mount(renderDashboard());
      await component.getByRole('tab', { name: new RegExp(tab, 'i') }).click();
      await expect(component).toHaveScreenshot(`dashboard-${tab.toLowerCase()}-tab.png`, { threshold: 0.02 });
      await expect(component.getByRole('tabpanel')).toBeVisible();
    });
  }

  test('renders mobile layout', async ({ mount, page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const component = await mount(renderDashboard());
    await expect(component).toHaveScreenshot('dashboard-mobile.png', { threshold: 0.02 });
  });

  test('renders wide-screen layout', async ({ mount, page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const component = await mount(renderDashboard());
    await expect(component).toHaveScreenshot('dashboard-wide.png', { threshold: 0.02 });
  });
});

/**
 * To update baseline snapshots:
 * 1. Run `npx playwright test --update-snapshots` locally.
 * 2. Review and commit updated images.
 * 3. CI will verify visual consistency on PRs.
 *
 * See emotionArc.prompt.md for further details.
 */ 