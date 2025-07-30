# eBook Analyzer Service Documentation

## 📘 Overview

The `ebookAnalyzer.ts` module is a specialized service that extracts meaningful metadata from eBook text sections using OpenAI GPT-4. It serves as a core component in the DocCraft AI enhancement pipeline, providing intelligent analysis capabilities for document processing and content optimization.

### Purpose
- **Content Analysis**: Analyzes text sections to extract structured metadata
- **Metadata Extraction**: Generates titles, summaries, topics, keywords, sentiment, and reading levels
- **Enhancement Pipeline**: Contributes to the document enhancement workflow by providing AI-powered insights

### eBook Metadata Extracted
- **Title Suggestions**: Clear, descriptive titles (3-8 words)
- **Content Summaries**: Concise 1-2 sentence summaries
- **Topic Tags**: 3-5 broad themes or subjects
- **Keywords**: 3-5 specific terms for search/discovery
- **Sentiment Analysis**: Positive, neutral, or negative classification
- **Reading Level**: Beginner, intermediate, or advanced assessment

### DocCraft AI Integration
The analyzer integrates seamlessly with the DocCraft AI enhancement pipeline by:
- Providing structured metadata for document sections
- Enabling intelligent content tagging and categorization
- Supporting automated title generation and content summarization
- Contributing to the overall document enhancement quality

## 🔐 MCP Access Control

### Role: `analyzer`
The service operates under the `analyzer` role, which grants it specialized permissions for content analysis and metadata extraction. This role is designed for services that process and analyze document content.

### Tier: `Pro`
Access to the eBook analyzer is restricted to Pro tier users, ensuring that advanced content analysis features are available to premium subscribers while maintaining system performance and API cost management.

### Allowed Actions

#### `summarize` – Summarize Section Text
- Generates concise summaries of text sections
- Captures main points and purpose
- Provides 1-2 sentence overviews for quick content understanding

#### `tag` – Extract Relevant Topics
- Identifies 3-5 broad themes or subjects
- Categorizes content for better organization
- Enables content discovery and navigation

#### `label` – Determine Sentiment and Reading Level
- Analyzes overall tone (positive/neutral/negative)
- Assesses vocabulary complexity and text structure
- Provides reading level classification (beginner/intermediate/advanced)

## 🧱 Security Context

### contentSensitivity: `medium`
The medium sensitivity level is appropriate for this service because:
- **User-Generated Input**: Processes user-provided text content
- **Content Analysis**: Performs AI-powered analysis on potentially sensitive material
- **Metadata Generation**: Creates structured data that may contain personal or business information
- **API Integration**: Interfaces with external OpenAI services

### theme: `enhancement`
The enhancement theme reflects the service's role in:
- **Content Improvement**: Enhancing document quality through analysis
- **Metadata Enrichment**: Adding structured information to content
- **Intelligent Processing**: Using AI to improve content understanding

## 🧠 Prompt Use Cases

### Content Analysis Requests
```
"Summarize this section and extract keywords"
```
- **Action**: `summarize` + `tag`
- **Output**: Summary + keyword list
- **Use Case**: Quick content overview for editors

### Enhancement Workflows
```
"Enhance titles and label reading level for each paragraph"
```
- **Action**: `summarize` + `label`
- **Output**: Improved titles + reading level assessment
- **Use Case**: Document preparation and audience targeting

### Metadata Extraction
```
"Analyze this chapter and provide topic tags with sentiment"
```
- **Action**: `tag` + `label`
- **Output**: Topic list + sentiment analysis
- **Use Case**: Content categorization and tone analysis

### Batch Processing
```
"Process all sections in this document for comprehensive analysis"
```
- **Action**: `summarize` + `tag` + `label`
- **Output**: Complete metadata suite for each section
- **Use Case**: Full document enhancement pipeline

## 🧪 Dev Notes

### Linked Test File: `testEbookAnalyzer.ts`
- **Location**: `tests/testEbookAnalyzer.ts`
- **Purpose**: Validates service functionality with sample text
- **Usage**: Run with `npx ts-node tests/testEbookAnalyzer.ts`
- **Features**: CLI output, error handling, API key validation

### Fallback Behavior
When the OpenAI API key is missing:
- **Graceful Degradation**: Returns intelligent fallback analysis
- **Basic Sentiment**: Uses positive/negative word detection
- **Reading Level**: Estimated from text length and complexity
- **Topic Extraction**: Based on common subject keywords
- **Keyword Generation**: Derived from word frequency analysis

### Recommended Integration Points
- **DocumentEditor**: For real-time content analysis during editing
- **EbookEnhancer**: For batch processing of complete documents
- **ContentManager**: For metadata management and organization
- **SearchIndex**: For content discovery and tagging

### API Key Configuration
```bash
# Required environment variable
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## ✏️ Example MCP Block

```ts
{
  file: "ebookAnalyzer.ts",
  role: "analyzer",
  tier: "Pro",
  allowedActions: ["summarize", "tag", "label"],
  contentSensitivity: "medium",
  theme: "enhancement"
}
```

### MCP Context Usage
```ts
import { useMCP } from '../useMCP';
import { analyzeSection } from './ebookAnalyzer';

function ContentAnalyzer() {
  const ctx = useMCP('ebookAnalyzer.ts');
  
  // Check permissions before analysis
  if (!ctx.allowedActions.includes('summarize')) {
    return <div>Analysis not available for your tier</div>;
  }
  
  const handleAnalysis = async (text: string) => {
    const result = await analyzeSection(text);
    return result;
  };
  
  return (
    <div>
      {/* Analysis UI components */}
    </div>
  );
}
```

## 🔗 Related Services
- `imageSuggester.ts` - Image query generation for content
- `imageFetcher.ts` - Image retrieval and management
- `imagePlacer.ts` - Image placement optimization
- `documentService.ts` - Document processing and management

## 🎯 Best Practices

### Performance Considerations
- **Text Truncation**: Automatically truncates text over 4000 characters
- **Batch Processing**: Use `analyzeSections()` for multiple sections
- **Error Recovery**: Graceful fallbacks for all failure scenarios
- **API Limits**: Respects OpenAI token and rate limits

### Security Guidelines
- **Input Validation**: Validates and sanitizes all text inputs
- **API Key Management**: Secure handling of OpenAI credentials
- **Content Privacy**: Processes user content with appropriate sensitivity
- **Error Logging**: Comprehensive error tracking without exposing sensitive data

### Integration Patterns
- **Async/Await**: All functions return promises for proper async handling
- **Type Safety**: Full TypeScript support with strict typing
- **Error Boundaries**: Proper error handling and recovery
- **MCP Compliance**: Respects context-aware permissions and actions 