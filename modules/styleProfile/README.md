# Style Profile Engine – Module README

## Overview
The Style Profile Engine provides AI-powered analysis, visualization, and revision of narrative style, voice, and tone. It enables authors and editors to align story style with genre, audience, and character, detect drift, and receive actionable feedback.

---

## Key Features
- **NLP-based style extraction**: Analyze pacing, tone, voice, emotion density, and more
- **Genre/target comparison**: Aligns scenes with genre presets or user-defined style targets
- **Drift detection**: Flags segments that diverge from target style
- **Revision integration**: Injects style feedback into AI revision flows
- **UI dashboard**: Visualizes style metrics, drift, and recommendations
- **Storybook/test coverage**: Ensures robust, accessible, and testable UI
- **User presets**: Supports custom style targets and import/export

---

## File & Component Index

### Services & Logic
- `services/styleProfiler.ts`: Extracts and compares narrative style profiles
- `configs/stylePresets.ts`: Defines reusable genre-based style targets
- `state/userStyleConfig.ts`: Manages user-defined style targets (localStorage)

### UI Components
- `components/StyleProfilePanel.tsx`: Main dashboard panel for style insights
- `components/StyleCalibrationChart.tsx`: Radar/bar chart for profile vs target
- `components/StyleProfilePanel.stories.tsx`: Storybook stories for all UI states

### Dashboard Integration
- `tabs/StyleViewTab.tsx`: Narrative dashboard tab for style analysis
- `components/ExportNarrativeInsights.tsx`: Export with style analysis in .json/.md
- `components/SmartRevisionEngine.tsx`: Integrates style feedback into revision logic

### Prompts & Tests
- `prompts/styleProfile.prompt.md`: Catalog of all prompts and MCP blocks
- `__tests__/styleDriftRevision.spec.ts`: Automated tests for drift, revision, and UI

---

## Data Flow
1. **Scene text** → `analyzeNarrativeStyle()` → `NarrativeStyleProfile`
2. **Profile + target** → `compareToTargetStyle()` → `StyleAlignmentReport`
3. **UI**: `<StyleProfilePanel />` and `<StyleCalibrationChart />` visualize metrics and drift
4. **Revision**: `<SmartRevisionEngine />` merges style feedback into AI edit prompt
5. **Export**: `.json`/`.md` includes style analysis per scene
6. **User config**: Custom targets managed via `userStyleConfig.ts`

---

## MCP Compliance & Module Metadata
```json
{
  "module": "styleProfile",
  "role": ["developer", "qa", "prompt-engineer"],
  "tier": "Pro",
  "actions": ["analyze", "compare", "visualize", "suggest", "export"],
  "theme": "style_dashboard"
}
```

---

## Queue: Thematic Consistency Analyzer
**Next module:** `themeAnalysis`
- Detects recurring motifs, narrative values, and philosophical throughlines
- Flags scene/theme misalignment (e.g., betrayal in a loyalty-centered arc)
- Suggests theme reinforcement or scene realignment

**Planned entrypoint:** `modules/themeAnalysis/initThemeEngine.ts`

**Queue logic:** This README and the MCP registry block note the next module to be started. See `initThemeEngine.ts` for the kickoff scaffold and planning outline.

---

## For Contributors
- See `CONTRIBUTING.md` for extension guidelines (genre targets, UI charts, etc.)
- All code and prompts must include MCP context blocks
- Test and document all new features 