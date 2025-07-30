# SmartRevisionEngine – AI Scene Revision Suite

## Overview
SmartRevisionEngine is an AI-powered scene editing module for DocCraft AI. It enables real-time, accessible, and revision-tracked editing of narrative scenes using LLMs. Authors and editors can preview, accept, edit, or undo AI-generated scene revisions, with full semantic diff highlighting and audit history.

## Key Components
- **SmartRevisionEngine.tsx**: Main UI component for previewing and applying AI revisions.
- **revisionEngine.ts**: Service for generating revised scene versions from suggestions using LLMs.
- **diffHighlighter.ts**: Utility for semantic diffing and highlighting between original and revised text.
- **RevisionHistoryPanel.tsx**: Panel for tracking, undoing, and reviewing revision history.

## Data Flow
1. **Suggestion**: User or system provides an OptimizationSuggestion (e.g., pacing fix).
2. **Propose Edit**: revisionEngine.proposeEdit(sceneId, suggestion) generates an AI revision.
3. **Preview**: SmartRevisionEngine renders original vs. revised text with semantic highlights.
4. **Apply**: User accepts, edits, or dismisses the revision. Accepted edits update the scene and revision history.
5. **History**: All applied revisions are tracked and can be undone via RevisionHistoryPanel.

## Usage
```tsx
<SmartRevisionEngine sceneId="scene42" suggestion={mySuggestion} />
```
- `sceneId`: The unique ID of the scene to revise.
- `suggestion`: An OptimizationSuggestion object (see emotionArc/types/emotionTypes.ts).

## Dev Instructions
- **Mocking**: Use the provided test suite and mock services for local development.
- **Testing**: Run `jest` or your CI to validate all scenarios (see __tests__/SmartRevisionEngine.test.tsx).
- **Adding Edit Types**: Extend OptimizationSuggestion and revisionEngine logic for new revision types (e.g., style, structure).

## Accessibility
- All diffs and actions are ARIA-labeled and keyboard-navigable.
- Live regions announce revision changes.
- Diff highlights use color and semantic tags for screen readers.

## MCP Notes
- All files include MCP context blocks specifying allowed roles, actions, and Pro-tier scope.
- Only Pro users with the correct role can access revision features. 