# Contributing to the Style Profile Engine

## Adding a New Genre Target
- Edit `configs/stylePresets.ts` and add a new entry to the `stylePresets` dictionary.
- Use the `StyleTargetProfile` type and provide tone, voice, pacingRange, and emotionDensityRange.
- Add a test case in `__tests__/styleDriftRevision.spec.ts` for the new genre.

## Extending UI Charts
- To add a new metric, update `METRICS` in `StyleCalibrationChart.tsx` and ensure it is supported in both radar and bar modes.
- For new chart types, add a new viewMode and update the component logic and Storybook stories.
- Ensure all new UI is accessible and ARIA-labeled.

## Adding Prompts or Tests
- Add new prompt documentation to `prompts/styleProfile.prompt.md` with MCP metadata.
- Add new test cases to `__tests__/styleDriftRevision.spec.ts` for edge cases or new features.

## MCP Context Blocks
- All new files must include an MCP context block at the top, specifying role, tier, allowedActions, and theme.

## Testing & Documentation
- Run all tests with `jest` and check Storybook for UI changes.
- Document all new features and changes in the README and CHANGELOG. 