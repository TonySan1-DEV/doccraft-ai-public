# Changelog – Narrative Calibration Dashboard

## [v1.0.0] – 2024-06-10

### ✨ Features
- Initial implementation of NarrativeCalibrationDashboard shell with tabbed layout (Plot, Emotion, Character, Optimization)
- Integrated AI suggestion systems for scene and global narrative analysis
- Emotional and structural overlay support in Plot and Emotion views
- Export functionality: Markdown, JSON, and PDF (mock) reports
- Scene Inspector Panel with severity, impact, and actionable suggestions
- Narrative Score Summary for health metrics
- Overlay selector for toggling emotion, beat, and POV overlays

### 🧪 Tests
- Playwright visual regression suite for all tabs and breakpoints
- Storybook stories for all dashboard tabs with a11y checks and mock data

### ♻️ Refactors
- Modularized tab components and shared state context
- Reusable mock data and test hooks for consistent previews

### 🛠 Fixes
- Accessibility improvements: ARIA roles, keyboard navigation, live regions
- Type safety and MCP compliance across all files

### 📦 Build/CI
- GitHub Actions workflow for type check, lint, test, Storybook build, and visual regression
- CI snapshot update documentation in `emotionArc.prompt.md`

---

For earlier changes, see project root `CHANGELOG.md` or [project_specs.md](../../project_specs.md). 