# Visual Regression Testing - Emotion Arc Components

## Overview
This directory contains visual regression tests for `EmotionTimelineChart` and `PlotFrameworkTimeline` components using Playwright snapshot testing.

## Test Structure

### EmotionTimelineChart States
- **Default**: All characters, no filtering
- **Character Filtered**: Single character focus
- **Scene Selected**: Current scene highlighted via context
- **No Data**: Empty state with placeholder
- **Loading**: Spinner and loading message
- **Error**: Error state with message

### PlotFrameworkTimeline States
- **Default**: Hero's Journey framework
- **Scene Selected**: Beat highlighting
- **With Overlay**: Arc overlay integration

## Baseline Snapshots

### EmotionTimelineChart
- `emotion-timeline-default.png`
- `emotion-timeline-character-filtered.png`
- `emotion-timeline-scene-selected.png`
- `emotion-timeline-no-data.png`
- `emotion-timeline-loading.png`
- `emotion-timeline-error.png`

### PlotFrameworkTimeline
- `plot-timeline-default.png`
- `plot-timeline-scene-selected.png`
- `plot-timeline-with-overlay.png`

## Update Procedures

### When to Update Snapshots
1. **Intentional UI Changes**: Design updates, new features
2. **Component Refactoring**: Major structural changes
3. **Accessibility Improvements**: ARIA attributes, focus management

### How to Update
```bash
# Run tests with snapshot update
npx playwright test --update-snapshots

# Update specific test
npx playwright test emotionArc.visual.test.tsx --update-snapshots
```

### CI Integration
- GitHub Actions runs visual regression tests
- Fails if pixel delta > 2%
- Saves baseline snapshots for comparison

## Accessibility Checks
- Color contrast compliance (4.5:1 minimum)
- Keyboard navigation
- ARIA attributes
- Focus management
- Screen reader compatibility

## Mock Data
Test data is defined in `emotionArc.visual.test.tsx`:
- `mockEmotionalBeats`: Sample emotional beat data
- `mockPlotBeats`: Sample plot framework beats
- `mockOverlay`: Sample arc overlay data

## Future Enhancements
- Add more component states
- Include responsive breakpoint tests
- Add animation state testing
- Integrate with design system tokens 