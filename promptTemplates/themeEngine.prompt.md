# Theme Engine Prompt Library

---

## Prompt: Scaffold genre-aware tone map for conflict reason generation

**Prompt String:**
“Enhance `generateConflictReason()` to produce genre-aware conflict explanations. Add a genre parameter and use a tone map for Noir, YA, Literary, Thriller, Romance, Historical, Speculative, Satire, Adventure, and Horror. Output should match genre tone and fallback to neutral if undefined.”

**Role:** narrative-engineer
**Tier:** Pro
**Theme:** theme_diagnostics
**Files:** themeConflictAnalyzer.ts

**Output Preview:**
```md
> 🎭 *Noir Tone:* Trust fractures under cynical pressure…
> 💔 *YA Tone:* Betrayal clouds emerging loyalty…
> 🏺 *Historical Tone:* Tradition is upended by a spark of defiance…
> 👁️ *Speculative Tone:* The boundaries of reality blur…
> 🦇 *Horror Tone:* Hope is suffocated by dread…
```
<!-- MCP: genre-tone-extended, v1.4.0 -->

---

## Prompt: Integrate genre label into HTML/Markdown export rendering

**Prompt String:**
“Update export logic to prepend genre badge or label before each conflictReason. Use emoji and color cues for genre. In HTML, use <span class=\"genre-label genre-ya\">YA Tone:</span> before the reason, with a tooltip. Fallback to neutral if genre is undefined.”

**Role:** ui-integrator
**Tier:** Pro
**Theme:** theme_reporting
**Files:** ThematicReportExporter.ts

**Output Preview:**
```html
<span class="genre-label genre-ya">💔 YA Tone:</span> Betrayal clouds emerging loyalty…
```
<!-- MCP: genre-label-export, v1.3.0 -->

---

## Prompt: Generate snapshot tests for genre tone previews in dashboard tooltips

**Prompt String:**
“Create Playwright and Jest snapshot tests to validate genre badge and tone rendering in dashboard tooltips and sidebars. Test for color, ARIA, and MCP gating.”

**Role:** qa-engineer
**Tier:** Pro
**Theme:** theme_reporting
**Files:** themeConflict.visual.spec.ts, themeConflict.spec.ts

**Output Preview:**
- Markdown: `> 💔 *YA Tone:* Betrayal clouds emerging loyalty…`
- Tooltip: `<span class="genre-badge bg-purple-600">💔 YA</span> Betrayal clouds emerging loyalty…`
<!-- MCP: genre-tone-snapshots, v1.3.0 -->

---

## Prompt: Enable YAML and XLSX export for theme conflict reports

**Prompt String:**
“Add YAML and Excel (XLSX) export options for theme conflict reports. YAML should be human-readable and suitable for pipelines; XLSX should support editorial review.”

**Role:** ui-integrator
**Tier:** Pro
**Theme:** theme_reporting
**Files:** ThematicReportExporter.ts

**Output Preview:**
- YAML:
  ```yaml
  - scene: 09
    genre: horror
    conflict: hope vs despair
    reason: A glimmer of hope is quickly suffocated by encroaching dread.
  ```
- XLSX: (see spreadsheet preview in UI)
<!-- MCP: export-yaml-xlsx, v1.4.0 -->

---

## Prompt: Document i18n and localization for genre badges and conflict reasons

**Prompt String:**
“Describe how to localize genre badges and conflict reasons for international audiences. Provide translation keys and example output.”

**Role:** doc-engineer
**Tier:** Pro
**Theme:** theme_reporting
**Files:** README.md, ThematicReportExporter.ts

**Output Preview:**
```md
> 💔 *Tono Juvenil:* La traición oscurece la lealtad emergente…
```
<!-- MCP: i18n-genre, v1.4.0 -->

---

## Legend (for all outputs)
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