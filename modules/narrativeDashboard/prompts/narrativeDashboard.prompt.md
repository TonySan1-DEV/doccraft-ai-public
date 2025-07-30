# Narrative Calibration Dashboard – Prompt Template Library

_Last updated: 2024-06-10_

## Table of Contents
1. [Scaffold NarrativeCalibrationDashboard](#scaffold-narrativecalibrationdashboard)
2. [Plot View Tab – Scaffold & Connect](#plot-view-tab--scaffold--connect)
3. [Emotion View Tab – Scaffold & Connect](#emotion-view-tab--scaffold--connect)
4. [Scene Inspector – Connect Suggestions](#scene-inspector--connect-suggestions)
5. [Optimization Tab – Scaffold & Visualize Suggestions](#optimization-tab--scaffold--visualize-suggestions)
6. [ExportNarrativeInsights – MCP Scoped](#exportnarrativeinsights--mcp-scoped)
7. [ExportNarrativeInsights Integration – MCP Scoped](#exportnarrativeinsights-integration--mcp-scoped)
8. [Generate README – Narrative Dashboard – MCP Scoped](#generate-readme--narrative-dashboard--mcp-scoped)
9. [Generate Storybook Stories – Dashboard Tabs – MCP Scoped](#generate-storybook-stories--dashboard-tabs--mcp-scoped)
10. [Snapshot Test – NarrativeCalibrationDashboard – MCP Scoped](#snapshot-test--narrativecalibrationdashboard--mcp-scoped)
11. [Generate CHANGELOG – Narrative Dashboard – MCP Scoped](#generate-changelog--narrative-dashboard--mcp-scoped)

---

## 1. Scaffold NarrativeCalibrationDashboard
**File:** `modules/narrativeDashboard/NarrativeCalibrationDashboard.tsx`
**Role:** developer  
**Tier:** Pro  
**allowedActions:** ["scaffold", "visualize", "summarize"]  
**Timestamp:** 2024-06-09

```md
Scaffold the `NarrativeCalibrationDashboard`:
1. Tabbed layout:
   - Plot View
   - Emotion View
   - Character View
   - Optimization
2. Integrate shared state (`useNarrativeSync`)
3. Pull data from:
   - arcSimulator
   - plotFrameworkEngine
   - characterPersonaBuilder
   - suggestionEngine
4. Add `<SceneInspectorPanel />` and `<NarrativeScoreSummary />`

Ensure full accessibility, testability, and Pro-tier MCP compliance.
```

---

## 2. Plot View Tab – Scaffold & Connect
**File:** `modules/narrativeDashboard/tabs/PlotViewTab.tsx`
**Role:** frontend-developer  
**Tier:** Pro  
**allowedActions:** ["scaffold", "visualize", "connect"]  
**Timestamp:** 2024-06-09

```md
Scaffold `<PlotViewTab />` for the Narrative Calibration Dashboard:
1. Layout:
   - `<PlotFrameworkTimeline />` (top): visualizes plot beat progression using selected framework
   - `<StructureComparisonChart />` (middle): compares structural beats vs emotional tension overlays
   - `<NarrativeOverlaySelector />` (top-right overlay): toggles emotion/arc overlays
   - `<SceneInspectorPanel />` (side): syncs with current sceneId from `useNarrativeSync()`

2. Features:
   - Load selected framework from shared config (`frameworkConfigs.ts`)
   - Pull overlay data from `arcSimulator` and `structureSuggestionEngine`
   - Use `currentSceneId` to highlight active scene

3. Best Practices:
   - Lazy-load heavy components
   - Responsive grid using Tailwind
   - Accessibility: keyboard nav for beat timeline, ARIA live announcements
   - Performance: memoize beat overlays, Suspense for async loading

Ensure Pro-tier gating, full MCP context, and shared type compliance.
```

---

## 3. Emotion View Tab – Scaffold & Connect
**File:** `modules/narrativeDashboard/tabs/EmotionViewTab.tsx`
**Role:** frontend-developer  
**Tier:** Pro  
**allowedActions:** ["scaffold", "visualize", "connect"]  
**Timestamp:** 2024-06-09

```md
Scaffold `<EmotionViewTab />` for the Narrative Calibration Dashboard:
1. Layout:
   - `<EmotionTimelineChart />`: Displays emotional arc across scenes and characters
   - `<TensionCurveViewer />`: Visualizes reader engagement and tension curve
   - `<NarrativeOverlaySelector />`: Toggles emotional filters (intensity, type, arc)
   - `<SceneInspectorPanel />`: Displays sentiment metadata for current scene

2. Data Sources:
   - `arcSimulator.getArcSimulation()` for empathy/tension flow
   - `emotionAnalyzer.analyzeStoryEmotions()` for emotional beats
   - Shared state from `useNarrativeSync()` for sceneId, characterId

3. Best Practices:
   - Responsive layout with Tailwind grid
   - Async data loading with Suspense and error boundaries
   - Keyboard-accessible graph interactions
   - ARIA roles and region announcements

Ensure Pro-tier access, MCP headers, and shared type compliance.
```

---

## 4. Scene Inspector – Connect Suggestions
**File:** `modules/narrativeDashboard/components/SceneInspectorPanel.tsx`
**Role:** developer  
**Tier:** Pro  
**allowedActions:** ["connect", "suggest", "analyze"]  
**Timestamp:** 2024-06-09

```md
Connect `SceneInspectorPanel` to AI suggestion systems:
1. Use `suggestionEngine.generateSceneSuggestions(sceneId)` to fetch:
   - Structural alignment issues
   - Emotional imbalance or pacing concerns
   - Character arc mismatches

2. Display:
   - Suggestion message
   - Severity tag (Low, Medium, High)
   - Impact score bar
   - Suggested action

3. Features:
   - Show loading spinner during fetch
   - Handle empty/no suggestions state gracefully
   - Use live region (`aria-live`) to announce updates

Ensure MCP context, Pro-tier gating, and type safety with `OptimizationSuggestion` type.
```

---

## 5. Optimization Tab – Scaffold & Visualize Suggestions
**File:** `modules/narrativeDashboard/tabs/OptimizationTab.tsx`
**Role:** developer  
**Tier:** Pro  
**allowedActions:** ["scaffold", "summarize", "visualize"]  
**Timestamp:** 2024-06-09

```md
Scaffold `<OptimizationTab />` for the Narrative Calibration Dashboard:
1. Layout:
   - `<OptimizationSuggestions />`: AI-generated story improvement list
   - `<NarrativeScoreSummary />`: Narrative health metrics (structure, pacing, empathy, cohesion)
   - `<SceneInspectorPanel />`: Focused view for selected suggestion’s target scene
   - `<NarrativeOverlaySelector />`: Filter by suggestion type (structure, emotion, character)

2. Data:
   - `suggestionEngine.generateOptimizationSuggestions()` for global insights
   - Shared state (`useNarrativeSync`) to apply filters and selection
   - Use `currentSceneId` to sync context with `SceneInspectorPanel`

3. Features:
   - Sort suggestions by severity, impact, type
   - Allow “Apply” / “Dismiss” suggestion interaction
   - Render loading and empty states

Ensure MCP safety, accessibility (live updates), and responsiveness with Tailwind.
```

---

## 6. ExportNarrativeInsights – MCP Scoped
**File:** `modules/narrativeDashboard/components/ExportNarrativeInsights.tsx`
**Role:** developer  
**Tier:** Pro  
**allowedActions:** ["scaffold", "export", "summarize"]  
**Timestamp:** 2024-06-09

```md
Scaffold `<ExportNarrativeInsights />` to allow authors to export analysis data:
1. Export Options:
   - `.md`: Markdown summary of character arcs, emotional arc, plot structure, and suggestions
   - `.json`: Raw data export of full narrative state and analysis
   - `.pdf`: PDF visual report (optional, mock if not using Puppeteer)

2. Features:
   - Toggle export type with buttons
   - Display filename and size estimate before export
   - Show success/error toast (a11y-friendly)

3. Content:
   - Pull data from narrativeSync, arcSimulator, plotFrameworkEngine, suggestionEngine
   - Sanitize any sensitive content
   - Include export timestamp and system version

Ensure MCP context, accessibility support, and Pro-tier gating.
```

---

## 7. ExportNarrativeInsights Integration – MCP Scoped
**File:** `modules/narrativeDashboard/NarrativeCalibrationDashboard.tsx`
**Role:** developer  
**Tier:** Pro  
**allowedActions:** ["connect", "export", "enhance"]  
**Timestamp:** 2024-06-09

```md
Integrate `<ExportNarrativeInsights />` into the `NarrativeCalibrationDashboard`:
1. Place in footer or floating bottom-right action bar
2. Provide quick-access export for current dashboard state
3. Pass shared context data from `useNarrativeSync()`
4. Ensure exports respect selected tab (plot, emotion, character, optimization)
5. Announce export results with accessible toast/live region

Ensure:
- Responsive positioning
- Type safety with shared narrative types
- MCP-compliant export actions
- Keyboard focusable for screen reader use
```

---

## 8. Generate README – Narrative Dashboard – MCP Scoped
**File:** `modules/narrativeDashboard/README.md`
**Role:** project-manager  
**Tier:** Pro  
**allowedActions:** ["document", "summarize", "guide"]  
**Timestamp:** 2024-06-10

```md
Generate a comprehensive `README.md` for the Narrative Calibration Dashboard:
Sections:
1. Overview: Purpose of emotional/structural/character synchronization
2. Features: Tabbed views, overlays, AI suggestions, export
3. File Structure: Key components, tabs, services, shared state
4. Setup: Import instructions, state wrapper, test data hook
5. Usage: Dev guide, prop details, extension examples
6. Accessibility: ARIA roles, keyboard navigation, screen reader support
7. MCP Compliance: Tier, role, allowed actions per file
8. Contribution Guide: Where to add new views, how to register suggestions

Use Markdown with headers, code snippets, and links to shared types or config files.
```

---

## 9. Generate Storybook Stories – Dashboard Tabs – MCP Scoped
**File:** `modules/narrativeDashboard/__stories__/DashboardTabs.stories.tsx`
**Role:** frontend-developer  
**Tier:** Pro  
**allowedActions:** ["document", "visualize", "preview"]  
**Timestamp:** 2024-06-10

```md
Create Storybook stories for each Narrative Dashboard tab:
1. `<PlotViewTab />`: Use mock framework, arcOverlay, and beat suggestions
2. `<EmotionViewTab />`: Simulate emotion data, character arc, sceneId
3. `<OptimizationTab />`: Preload suggestion list and score summary
4. `<CharacterViewTab />` (if present): Preview protagonist arc mapping

Add:
- Story variants for loading, empty, and populated states
- Mock shared context using `useNarrativeSync()` test hook
- Documentation sections with prop types, data sources
- Interactive knobs (if enabled)

Ensure:
- Accessible preview controls
- Storybook-addon-a11y support
- Reusable mock data from shared types
- MCP-safe action scope for rendering in sandbox
```

---

## 10. Snapshot Test – NarrativeCalibrationDashboard – MCP Scoped
**File:** `modules/narrativeDashboard/__tests__/NarrativeCalibrationDashboard.visual.test.tsx`
**Role:** qa  
**Tier:** Pro  
**allowedActions:** ["test", "snapshot", "render"]  
**Timestamp:** 2024-06-10

```md
Create a snapshot test suite for the full `NarrativeCalibrationDashboard` shell:
1. Use Playwright or Storybook snapshots
2. Render:
   - All four tabs (Plot, Emotion, Optimization, Character)
   - Default tab view with populated data
   - Mobile and wide-screen layouts

3. Compare output with baseline image snapshots
4. Assert on:
   - Visual consistency (threshold < 2%)
   - Presence of accessible regions and tab focus state
   - Layout integrity across breakpoints

Ensure:
- Tests run in CI via GitHub Actions
- Use shared test data mocks for consistent rendering
- Document update process in `emotionArc.prompt.md`
```

---

## 11. Generate CHANGELOG – Narrative Dashboard – MCP Scoped
**File:** `modules/narrativeDashboard/CHANGELOG.md`
**Role:** project-manager  
**Tier:** Pro  
**allowedActions:** ["document", "log", "summarize"]  
**Timestamp:** 2024-06-10

```md
Generate `CHANGELOG.md` for the `narrativeDashboard` module:
1. Use semantic versioning (e.g., `v1.0.0`)
2. Include key milestones:
   - `v1.0.0`: Initial implementation of dashboard shell and all tabs
   - AI suggestions integration
   - Emotional + structural overlay support
   - Export functionality
   - Accessibility and visual regression support
3. Format entries by type:
   - ✨ Features
   - 🛠 Fixes
   - ♻️ Refactors
   - 🧪 Tests
   - 📦 Build/CI

Use markdown bullets and emoji for readability. Include latest date on top entry.
``` 