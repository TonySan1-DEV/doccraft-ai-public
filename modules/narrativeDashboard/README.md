# Narrative Calibration Dashboard

## 1. Overview
The **Narrative Calibration Dashboard** unifies emotional arcs, plot structure, and character development into a single, interactive workspace for authors. It provides real-time feedback on structural alignment, emotional resonance, character consistency, and optimization readiness, helping writers craft engaging, well-structured stories.

## 2. Features
- **Tabbed Views:**
  - Plot View: Visualize plot beats and structure overlays
  - Emotion View: Track emotional arcs and tension curves
  - Character View: Analyze character arcs and POV paths
  - Optimization: AI-powered improvement suggestions
- **Overlays:** Toggle emotional, structural, and character overlays
- **AI Suggestions:** Contextual, actionable feedback for scenes and global narrative
- **Export:** Export analysis as `.md`, `.json`, or `.pdf` (mocked)
- **Scene Inspector:** Drill down into scene-level metadata and suggestions
- **Narrative Score:** Summarized health metrics (structure, pacing, empathy, cohesion)

## 3. File Structure
```
modules/narrativeDashboard/
  ├── components/
  │   ├── ExportNarrativeInsights.tsx
  │   └── SceneInspectorPanel.tsx
  ├── tabs/
  │   ├── PlotViewTab.tsx
  │   ├── EmotionViewTab.tsx
  │   ├── CharacterViewTab.tsx
  │   └── OptimizationTab.tsx
  ├── NarrativeCalibrationDashboard.tsx
  ├── NarrativeOverlaySelector.tsx
  └── README.md
```
- **Shared State:** [`useNarrativeSyncContext.tsx`](../shared/state/useNarrativeSyncContext.tsx)
- **Config:** [`frameworkConfigs.ts`](../plotStructure/configs/frameworkConfigs.ts)

## 4. Setup
**Import the dashboard and wrap with shared state:**
```tsx
import { NarrativeCalibrationDashboard } from 'modules/narrativeDashboard/NarrativeCalibrationDashboard';
import { NarrativeSyncProvider } from 'modules/shared/state/useNarrativeSyncContext';

<NarrativeSyncProvider>
  <NarrativeCalibrationDashboard />
</NarrativeSyncProvider>
```
**Test Data Hook:**
- Use mock data or connect to real services (see comments in each component for stubbing).

## 5. Usage
- **Props:** Most dashboard components accept a `narrativeSync` prop for shared state.
- **Extending Tabs:** Add new tabs in `tabs/` and register in `TAB_CONFIG` in `NarrativeCalibrationDashboard.tsx`.
- **Adding Suggestions:** Implement new suggestion sources in `suggestionEngine` and connect via `SceneInspectorPanel` or `OptimizationTab`.
- **Export:** Use `<ExportNarrativeInsights />` for quick exports; extend to support new formats as needed.

## 6. Accessibility
- **ARIA Roles:** All interactive regions and tab panels use appropriate ARIA roles and labels.
- **Keyboard Navigation:**
  - Tabs: Arrow keys, Home/End, Enter/Space
  - Overlays and export: Tab/Shift+Tab focusable
- **Screen Reader Support:**
  - Live regions (`aria-live`) for updates and toasts
  - All buttons and controls have descriptive labels

## 7. MCP Compliance
- **Tier:** Pro
- **Roles:** developer, frontend-developer, project-manager
- **Allowed Actions:** scaffold, visualize, connect, export, summarize, enhance, document, guide
- **Per-file MCP Blocks:**
  - Each file includes an MCP context block specifying role, tier, allowed actions, and theme.

## 8. Contribution Guide
- **Adding New Views:**
  - Create a new tab in `tabs/` and add to `TAB_CONFIG`.
  - Register new overlays in `NarrativeOverlaySelector`.
- **Registering Suggestions:**
  - Extend `suggestionEngine` with new suggestion logic.
  - Connect to `SceneInspectorPanel` or `OptimizationTab`.
- **Documentation:**
  - Update this README and add usage notes to new components.
- **Type Safety:**
  - Use shared types from [`plotEmotionTypes.ts`](../shared/plotEmotionTypes.ts) and config files.

---

For more details, see inline comments in each component and the [project_specs.md](../../project_specs.md). 