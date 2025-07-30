# Style Profile Engine – Prompt Catalog

**Version:** v0.9.0  
**Date:** 2024-06-XX

---

## Table of Contents
1. [styleProfiler.ts – Style Analysis Prompt](#styleprofiler)
2. [stylePresets.ts – Genre Preset Prompt](#stylepresets)
3. [StyleProfilePanel.tsx – UI Prompt](#styleprofilepanel)
4. [StyleViewTab.tsx – Dashboard Tab Prompt](#styleviewtab)
5. [ExportNarrativeInsights – Style Export Prompt](#exportnarrativeinsights)
6. [SmartRevisionEngine – Style Feedback Prompt](#smartrevisionengine)
7. [userStyleConfig.ts – User Style Config Prompt](#userstyleconfig)
8. [StyleCalibrationChart.tsx – Chart Prompt](#stylecalibrationchart)
9. [Tests – Drift & Revision Prompt](#tests)

---

## 1. styleProfiler.ts – Style Analysis Prompt
**File:** modules/styleProfile/services/styleProfiler.ts  
**MCP:** role: developer, tier: Pro, allowedActions: ["scaffold", "analyze", "compare"], theme: style_analysis

```
Scaffold styleProfiler.ts to extract and compare writing style from narrative text.

Core Functions:
1. analyzeNarrativeStyle(input: string): Promise<NarrativeStyleProfile>
   - Analyzes pacing, tone, voice, vocabulary, sentence rhythm, and emotion density
   - Returns normalized metrics (0–1) + linguistic features

2. compareToTargetStyle(profile: NarrativeStyleProfile, target: StyleTargetProfile): StyleAlignmentReport
   - Compares extracted profile to genre presets or author-defined targets
   - Flags drift and generates adjustment suggestions
```

---

## 2. stylePresets.ts – Genre Preset Prompt
**File:** modules/styleProfile/configs/stylePresets.ts  
**MCP:** role: developer, tier: Pro, allowedActions: ["generate", "model", "define"], theme: style_presets

```
Create stylePresets.ts to define reusable genre-based style targets for narrative voice alignment.

Presets to include:
1. Noir: tone: "dark", voice: "intimate", pacingRange: [0.3, 0.6], emotionDensityRange: [0.2, 0.4]
2. YA (Young Adult): tone: "warm", voice: "casual", pacingRange: [0.5, 0.8], emotionDensityRange: [0.4, 0.7]
3. Literary Fiction: tone: "neutral", voice: "omniscient", pacingRange: [0.2, 0.5], emotionDensityRange: [0.3, 0.6]
4. Thriller: tone: "tense", voice: "intimate", pacingRange: [0.7, 1.0], emotionDensityRange: [0.2, 0.5]
```

---

## 3. StyleProfilePanel.tsx – UI Prompt
**File:** modules/styleProfile/components/StyleProfilePanel.tsx  
**MCP:** role: frontend-developer, tier: Pro, allowedActions: ["scaffold", "visualize", "compare"], theme: style_dashboard

```
Scaffold <StyleProfilePanel /> to visualize and evaluate narrative writing style:
1. Inputs: sceneId: string, Optional target: StyleTargetProfile
2. Fetch: Style metrics via styleProfiler.analyzeNarrativeStyle(sceneText), Comparison results from styleProfiler.compareToTargetStyle()
3. Display: Radar chart or stacked bars of style metrics, Flags or chips for drift warnings, Recommendations list, Toggle for switching presets
4. Features: Responsive layout, ARIA labels for metric charts and suggestions, Context sync via useNarrativeSync()
```

---

## 4. StyleViewTab.tsx – Dashboard Tab Prompt
**File:** modules/narrativeDashboard/tabs/StyleViewTab.tsx  
**MCP:** role: frontend-developer, tier: Pro, allowedActions: ["scaffold", "visualize", "compare"], theme: style_dashboard

```
Scaffold <StyleViewTab /> for the Narrative Calibration Dashboard:
1. Layout: <StyleProfilePanel />, <NarrativeOverlaySelector />, <SceneInspectorPanel />
2. Data Flow: Pull sceneId and characterFocusId from useNarrativeSync(), Fetch style analysis from styleProfiler.analyzeNarrativeStyle(), Use stylePresets for comparison targets
3. Features: Keyboard navigation across metric groups, Dev-mode debug info for raw style scores, Accessible warnings (drift chips with aria-live region)
```

---

## 5. ExportNarrativeInsights – Style Export Prompt
**File:** modules/narrativeDashboard/components/ExportNarrativeInsights.tsx  
**MCP:** role: developer, tier: Pro, allowedActions: ["extend", "export", "document"], theme: reporting

```
Extend <ExportNarrativeInsights /> to include style alignment results:
1. For .json export: Include StyleAlignmentReport for each analyzed scene under styleAnalysis key per sceneId
2. For .md export: Render readable markdown summary: Scene ID, Detected tone, voice, pacing score, Drift flags, Recommendations
3. Data Source: Use styleProfiler.analyzeNarrativeStyle() and .compareToTargetStyle() results, Pull sceneId from useNarrativeSync()
4. Ensure: Type-safe export schema, Accessible .md layout, Export toggle to include/exclude style section
```

---

## 6. SmartRevisionEngine – Style Feedback Prompt
**File:** modules/narrativeDashboard/components/SmartRevisionEngine.tsx  
**MCP:** role: developer, tier: Pro, allowedActions: ["enhance", "suggest", "revise"], theme: revision_ai

```
Enhance <SmartRevisionEngine /> to include style feedback in AI revision logic:
1. Input: Fetch StyleAlignmentReport for sceneId, Extract driftFlags and recommendations
2. Merge: Include top drift recommendations into revisionEngine.proposeEdit() prompt, Tag revised text with style improvement metadata
3. UI: Highlight style-driven edits, Show style impact summary below revised text, Undo labels with source: style, emotion, or structure
4. Ensure: Accessibility for change summaries, MCP-safe logic, Test coverage for hybrid suggestions
```

---

## 7. userStyleConfig.ts – User Style Config Prompt
**File:** modules/styleProfile/state/userStyleConfig.ts  
**MCP:** role: developer, tier: Pro, allowedActions: ["scaffold", "define", "persist"], theme: style_presets

```
Create userStyleConfig.ts to allow custom style targets:
1. Define: createUserStyleProfile(profile: StyleTargetProfile): string, getUserStyleProfiles(): StyleTargetProfile[], deleteUserStyleProfile(id: string): void
2. Store: Persist user-defined presets in localStorage or local state, Optional: Export/import .json config
3. Use: Allow <StyleProfilePanel /> to switch between genre presets and user-defined targets, Provide live editing UI
4. Ensure: Type safety, Devtool logging, MCP context block
```

---

## 8. StyleCalibrationChart.tsx – Chart Prompt
**File:** modules/styleProfile/components/StyleCalibrationChart.tsx  
**MCP:** role: frontend-developer, tier: Pro, allowedActions: ["scaffold", "visualize", "toggle"], theme: style_dashboard

```
Scaffold <StyleCalibrationChart /> to visualize NarrativeStyleProfile vs StyleTargetProfile:
1. Features: Toggle radar/bar chart, Plot pacing/emotion/complexity/variance, Style indicators as annotations/legends
2. Inputs: profile, target, viewMode
3. Features: Highlight deviations in red, Annotate adjustment zones, Accessible keyboard toggle + ARIA, Responsive layout
```

---

## 9. Tests – Drift & Revision Prompt
**File:** modules/styleProfile/__tests__/styleDriftRevision.spec.ts  
**MCP:** role: qa, tier: Pro, allowedActions: ["test", "mock", "validate"], theme: style_testing

```
Create automated test suite to validate:
1. Style drift detection: analyzeNarrativeStyle returns expected profile, compareToTargetStyle produces accurate driftFlags and suggestions
2. Style-driven revision: Pass drift recommendations into revisionEngine.proposeEdit(), Validate revised text addresses suggestions
3. UI integration: <StyleProfilePanel /> renders correct metrics, <SmartRevisionEngine /> highlights style changes with correct source tag
4. Use: Mock style profiles, Snapshot diff, Assert visual + semantic correctness
5. Ensure: CI compatibility, MCP role control, full edge case coverage
``` 