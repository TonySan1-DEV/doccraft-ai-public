# Theme Engine Module

**Version:** v1.4.0

## Overview
The Theme Engine provides thematic analysis, drift/conflict detection, and editorial reasoning for narrative scenes. It supports genre-aware diagnostics, visual cues, and export formats for both authors and editors.

<!-- MCP-DOC:genre-tone-aware -->

## 🧠 Genre-Aware Reasoning

The `generateConflictReason()` function now adapts its editorial tone and phrasing based on the input genre. This enables more authentic, context-sensitive feedback for different narrative styles.

**Example Table:**

| Genre        | Conflict Type             | Generated Reason |
|--------------|--------------------------|------------------|
| Noir         | Loyalty vs Betrayal       | “Trust fractures under cynical pressure, hinting the protagonist was never clean.” |
| YA           | Identity vs Conformity    | “Betrayal at the midpoint clouds emerging loyalty, confusing peer dynamics.” |
| Literary     | Hope vs Disillusionment   | “Allegiances dissolve in emotional abstraction, authenticity erodes in performance.” |
| Thriller     | Loyalty vs Betrayal       | “Unreliable loyalty destabilizes trust just as stakes begin to escalate.” |
| Romance      | Betrayal vs Attraction    | “Emotional betrayal disrupts romantic alignment and softens chemistry trajectory.” |
| Historical   | Duty vs Rebellion         | “Tradition is upended by a spark of defiance, echoing through generations.” |
| Speculative  | Order vs Chaos            | “The boundaries of reality blur as chaos undermines the fragile order of this world.” |
| Satire       | Authority vs Subversion   | “Authority is lampooned, its seriousness undercut by biting subversion.” |
| Adventure    | Safety vs Risk            | “The call to adventure drowns out caution, propelling the hero into the unknown.” |
| Horror       | Hope vs Despair           | “A glimmer of hope is quickly suffocated by encroaching dread.” |

- If genre is undefined, a neutral editorial fallback is used.

## 🎨 Visual Cues in UI

- **Genre Badges:**
  - `<ThemeMatrixPanel />` and `<ThemeSummarySidebar />` display genre badges (emoji + color) before each conflict reason.
  - Badges are color-coded and ARIA-annotated for accessibility.

**Legend:**
| Emoji | Genre        | Color   |
|-------|--------------|---------|
| 🎭    | Noir         | Gray    |
| 💔    | YA           | Purple  |
| 📘    | Literary     | Gold    |
| ⚠     | Thriller     | Red     |
| 💗    | Romance      | Pink    |
| 🏺    | Historical   | Brown   |
| 👁️    | Speculative  | Blue    |
| 🦇    | Horror       | Black   |
| 🃏    | Satire       | Green   |
| 🧭    | Adventure    | Teal    |

- **ARIA Guidance:**
  - Badges use `role="presentation"` and include a screen-reader-only span describing the tone influence.
  - Tooltips have `aria-label` describing the genre tone.

## 📦 Export Formats

- **Markdown:** Genre is prepended with emoji (e.g., `> 🎭 *Noir Tone:* ...`)
- **HTML:** Colored badges with accessibility annotations (e.g., `<span class="genre-label genre-noir">🎭 Noir Tone:</span>`)
- **JSON:** Genre included under `meta.genre` in each `conflictReason` object.
- **YAML:** Human-readable, includes genre, theme, conflict, and reason. Example:
  ```yaml
  - scene: 09
    genre: horror
    conflict: hope vs despair
    reason: A glimmer of hope is quickly suffocated by encroaching dread.
  ```
- **XLSX:** (Excel) For editorial review. Includes all columns from YAML/JSON. (Requires ExcelJS or similar.)

## 🛠️ Genre Customization & Extensibility
- To add a new genre, extend the tone map in `themeConflictAnalyzer.ts` and update badge maps in UI/export files.
- Editorial teams can define custom genre tones and badges.

## 🌍 Internationalization (i18n)
- All genre badges and conflict reasons can be localized.
- Example translation keys:
  - `genre.noir = "Noir"`
  - `genre.ya = "Juvenil"`
  - `badge.noir = "🎭 Tono Noir:"`
  - `reason.ya = "La traición oscurece la lealtad emergente…"`

## 🔗 API Integration
- JSON/YAML exports can be consumed by external tools, pipelines, or static site generators.
- Webhook and REST endpoint examples available in the API docs.

## ♿ Accessibility & Compliance
- All visual cues are tested for color contrast (WCAG AA+).
- Tooltips and badges are ARIA-annotated and keyboard accessible.

## 🧪 Snapshot & Regression Testing
- Visual and text-based snapshots for all export types and genres.
- See `themeConflict.visual.spec.ts` and `themeConflict.spec.ts` for baseline rules.

## Links
- [Module Index](../README.md)
- [Prompt Library](../../promptTemplates/themeEngine.prompt.md) 