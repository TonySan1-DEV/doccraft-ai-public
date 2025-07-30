# Feedback System Documentation

## Overview

The Feedback System provides a comprehensive user feedback loop to evaluate the quality of AI-generated suggestions and use the data for continuous improvement. It captures user feedback on AI outputs, stores it securely, and provides analytics for system optimization.

## Features

- **Thumbs Up/Down Feedback**: Simple 👍/👎 buttons for quick feedback
- **Secure Data Storage**: Sanitized and encrypted feedback storage in Supabase
- **Rate Limiting**: Prevents spam and accidental double submissions
- **Analytics Dashboard**: Pattern performance and user feedback statistics
- **Privacy Protection**: Automatic sanitization of sensitive content
- **Real-time Feedback**: Immediate user feedback capture and processing

## Database Schema

### feedback_events Table

```sql
CREATE TABLE feedback_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
  source_prompt TEXT NOT NULL,
  pattern_used TEXT NOT NULL,
  copilot_enabled BOOLEAN NOT NULL,
  memory_enabled BOOLEAN NOT NULL,
  session_id TEXT,
  prompt_hash TEXT,
  content_type TEXT,
  context_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Fields

- **feedback_type**: 'positive' or 'negative'
- **source_prompt**: The AI prompt that generated the suggestion
- **pattern_used**: Genre + arc + tone combination
- **content_type**: Type of AI output (suggestion, rewrite, preview, etc.)
- **context_data**: Additional metadata (user preferences, suggestion details)

## UI Components

### FeedbackButtons

Simple thumbs up/down buttons for capturing user feedback:

```tsx
import { FeedbackButtons } from '../components/FeedbackButtons';

<FeedbackButtons
  sourcePrompt="AI-generated suggestion text"
  patternUsed="writing_friendly_general"
  contentType="suggestion"
  contextData={{
    suggestionId: 'suggestion-123',
    suggestionType: 'style',
    suggestionSeverity: 'warning'
  }}
  size="md"
  showLabels={false}
  onFeedbackSubmitted={(type, success) => {
    console.log(`Feedback ${type} submitted: ${success}`);
  }}
/>
```

### FeedbackWrapper

Wrapper component for AI-generated content with built-in feedback:

```tsx
import { FeedbackWrapper } from '../components/FeedbackWrapper';

<FeedbackWrapper
  sourcePrompt="AI prompt that generated this content"
  patternUsed="writing_friendly_general"
  contentType="suggestion"
  feedbackPosition="bottom"
>
  <div>AI-generated suggestion content</div>
</FeedbackWrapper>
```

### FeedbackAnalytics

Analytics dashboard for viewing feedback statistics:

```tsx
import { FeedbackAnalytics } from '../components/FeedbackAnalytics';

<FeedbackAnalytics
  showPatternAnalytics={true}
  showUserStats={true}
  timeRange="30 days"
/>
```

## Service API

### FeedbackService

```typescript
import { feedbackService } from '../services/feedbackService';

// Submit feedback
const result = await feedbackService.submitFeedback(
  'positive', // or 'negative'
  sourcePrompt,
  patternUsed,
  {
    contentType: 'suggestion',
    contextData: { suggestionId: '123' },
    sessionId: 'session-123'
  }
);

// Get feedback statistics
const stats = await feedbackService.getFeedbackStats(
  userId, // optional
  patternUsed, // optional
  '30 days' // timeRange
);

// Get pattern analytics
const analytics = await feedbackService.getPatternAnalytics('30 days');

// Get user's recent feedback
const recentFeedback = await feedbackService.getUserRecentFeedback(10);
```

## Integration Examples

### Suggestion Panel Integration

```tsx
// In SuggestionPanel.tsx
{suggestions.map((suggestion) => (
  <div key={suggestion.id}>
    {/* Suggestion content */}
    <div className="suggestion-content">
      {suggestion.comment}
    </div>
    
    {/* Action buttons */}
    <div className="suggestion-actions">
      <button onClick={() => applySuggestion(suggestion)}>Apply</button>
      <button onClick={() => rejectSuggestion(suggestion.id)}>Reject</button>
    </div>
    
    {/* Feedback buttons */}
    <FeedbackButtons
      sourcePrompt={`Suggestion: ${suggestion.comment} | Type: ${suggestion.type}`}
      patternUsed={suggestion.basedOnPatterns.join(', ')}
      contentType="suggestion"
      contextData={{
        suggestionId: suggestion.id,
        suggestionType: suggestion.type,
        suggestionSeverity: suggestion.severity,
        suggestionConfidence: suggestion.confidence
      }}
      size="sm"
    />
  </div>
))}
```

### Live Suggestions Integration

```tsx
// In any component with AI suggestions
<FeedbackWrapper
  sourcePrompt={currentPrompt}
  patternUsed={`${genre}_${arc}_${tone}`}
  contentType="suggestion"
  contextData={{
    documentType: 'blog-post',
    wordCount: text.length,
    userPreferences: preferences
  }}
>
  <div className="ai-suggestion">
    {aiSuggestion}
  </div>
</FeedbackWrapper>
```

### Analytics Dashboard

```tsx
// In Analytics page
<div className="analytics-dashboard">
  <h2>Feedback Analytics</h2>
  
  <FeedbackAnalytics
    showPatternAnalytics={true}
    showUserStats={true}
    timeRange="30 days"
  />
  
  <div className="pattern-performance">
    <h3>Pattern Performance</h3>
    {/* Pattern performance charts */}
  </div>
  
  <div className="user-feedback">
    <h3>Your Recent Feedback</h3>
    {/* User feedback history */}
  </div>
</div>
```

## Security Features

### Input Sanitization

The system automatically sanitizes sensitive content:

```typescript
// Sensitive content is automatically removed
const sanitizedPrompt = sanitizePromptText(`
  password=secret123
  api_key=abc123
  token=xyz789
  This is a normal prompt
`);

// Result: "This is a normal prompt"
```

### Rate Limiting

Prevents spam and accidental submissions:

- **Window**: 1 minute
- **Max submissions**: 10 per window
- **Duplicate prevention**: Per prompt hash per session

### Privacy Protection

- **User isolation**: Users can only see their own feedback
- **Data encryption**: Sensitive data is encrypted in transit
- **RLS policies**: Row-level security on database
- **Session tracking**: Optional session-based deduplication

## Analytics & Insights

### Pattern Performance

Track how different prompt patterns perform:

```typescript
const analytics = await feedbackService.getPatternAnalytics();

// Example output:
[
  {
    pattern_used: 'writing_friendly_general',
    total_usage: 100,
    positive_rate: 85.2,
    confidence_interval: 3.1,
    trend_direction: 'improving'
  }
]
```

### Feedback Statistics

Get detailed feedback statistics:

```typescript
const stats = await feedbackService.getFeedbackStats();

// Example output:
[
  {
    pattern_used: 'writing_friendly_general',
    total_feedback: 100,
    positive_feedback: 85,
    negative_feedback: 15,
    positive_rate: 85.0,
    avg_rating: 4.25
  }
]
```

## Database Functions

### create_feedback_event

Creates a new feedback event with sanitization:

```sql
SELECT create_feedback_event(
  p_user_id := 'user-uuid',
  p_feedback_type := 'positive',
  p_source_prompt := 'AI prompt text',
  p_pattern_used := 'writing_friendly_general',
  p_copilot_enabled := true,
  p_memory_enabled := true,
  p_session_id := 'session-123',
  p_content_type := 'suggestion',
  p_context_data := '{"suggestionId": "123"}'
);
```

### get_feedback_stats

Retrieves feedback statistics:

```sql
SELECT * FROM get_feedback_stats(
  p_user_id := 'user-uuid', -- optional
  p_pattern_used := 'writing_friendly_general', -- optional
  p_time_range := '30 days'
);
```

### get_pattern_analytics

Gets pattern performance analytics:

```sql
SELECT * FROM get_pattern_analytics(
  p_time_range := '30 days'
);
```

## Usage Patterns

### 1. Quick Feedback Capture

For simple thumbs up/down feedback:

```tsx
<FeedbackButtons
  sourcePrompt={aiPrompt}
  patternUsed={currentPattern}
  contentType="suggestion"
/>
```

### 2. Rich Context Feedback

For detailed feedback with context:

```tsx
<FeedbackButtons
  sourcePrompt={aiPrompt}
  patternUsed={currentPattern}
  contentType="suggestion"
  contextData={{
    documentType: 'blog-post',
    wordCount: text.length,
    userExperience: 'first-time',
    suggestionQuality: 'high'
  }}
  sessionId={sessionId}
/>
```

### 3. Wrapped Content

For AI-generated content with built-in feedback:

```tsx
<FeedbackWrapper
  sourcePrompt={aiPrompt}
  patternUsed={currentPattern}
  contentType="rewrite"
  feedbackPosition="bottom"
>
  <div className="ai-rewrite">
    {aiRewrittenText}
  </div>
</FeedbackWrapper>
```

### 4. Analytics Integration

For viewing feedback insights:

```tsx
<FeedbackAnalytics
  showPatternAnalytics={true}
  showUserStats={true}
  timeRange="30 days"
/>
```

## Best Practices

### 1. Prompt Context

Always include relevant context in feedback:

```typescript
const contextData = {
  documentType: 'blog-post',
  targetAudience: 'professionals',
  contentLength: 'medium',
  userExperience: 'expert',
  suggestionQuality: 'high'
};
```

### 2. Pattern Tracking

Use consistent pattern naming:

```typescript
const patternUsed = `${genre}_${arc}_${tone}`;
// Example: 'writing_friendly_general'
```

### 3. Rate Limiting

Respect rate limits and provide user feedback:

```typescript
const result = await feedbackService.submitFeedback(type, prompt, pattern);
if (!result.success) {
  showToast(result.error, 'error');
}
```

### 4. Privacy Protection

Never log sensitive user data:

```typescript
// Good - sanitized
const sanitizedPrompt = sanitizePromptText(userPrompt);

// Bad - raw data
console.log(userPrompt); // Don't do this
```

## Future Enhancements

### Planned Features

- **Freeform Feedback**: Optional text input for detailed feedback
- **Feedback Categories**: Categorize feedback by type (accuracy, relevance, etc.)
- **A/B Testing**: Test different prompt patterns
- **Real-time Analytics**: Live feedback dashboards
- **Export Capabilities**: Export feedback data for analysis

### Analytics Improvements

- **Trend Analysis**: Long-term pattern performance trends
- **User Segmentation**: Feedback analysis by user type
- **Content Correlation**: Link feedback to content characteristics
- **Predictive Analytics**: Predict suggestion quality

### Integration Opportunities

- **Machine Learning**: Use feedback to train better models
- **Automated Optimization**: Auto-adjust prompts based on feedback
- **Personalization**: Customize suggestions based on user feedback history
- **Collaborative Filtering**: Suggest improvements based on similar users

## Troubleshooting

### Common Issues

**Feedback not submitting**
- Check user authentication
- Verify rate limits
- Ensure all required fields are provided

**Analytics not loading**
- Check database permissions
- Verify RLS policies
- Ensure time range is valid

**Duplicate feedback**
- Check prompt hash generation
- Verify session tracking
- Review deduplication logic

### Debug Steps

1. **Check Console**: Look for error messages
2. **Verify Authentication**: Ensure user is logged in
3. **Test Rate Limits**: Check submission frequency
4. **Validate Data**: Ensure all required fields are present
5. **Check Network**: Verify Supabase connection

## Performance Considerations

### Database Optimization

- **Indexes**: Proper indexing on frequently queried fields
- **Partitioning**: Consider partitioning by date for large datasets
- **Caching**: Cache analytics results for better performance

### Client-Side Optimization

- **Debouncing**: Debounce feedback submissions
- **Caching**: Cache feedback state locally
- **Lazy Loading**: Load analytics on demand

### Rate Limiting

- **Client-side**: Prevent rapid submissions
- **Server-side**: Enforce rate limits at database level
- **User Experience**: Provide clear feedback on limits 