# 🎬 Doc-to-Video Pipeline

## Overview

The **Doc-to-Video Pipeline** is a comprehensive AI-powered system that transforms documents into professional video presentations with synchronized narration. Built with modular architecture and MCP compliance, it provides both automated and manual control options.

## 🏗️ Architecture

### Core Services

```
modules/agent/services/
├── docToVideoRouter.ts      # Main orchestration router
├── slideGenerator.ts        # Document → Slide conversion
├── scriptGenerator.ts       # Slide → Narration script
├── ttsSyncEngine.ts        # Script → Audio with timing
└── README_DOC_TO_VIDEO.md  # This documentation
```

### UI Components

```
modules/agent/components/
└── DocToVideoControls.tsx  # Pipeline control interface
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { docToVideoRouter } from './docToVideoRouter';

// Execute full pipeline
const result = await docToVideoRouter.executeCommand(
  '/doc2video auto',
  documentContent
);

// Generate slides only
const slidesOnly = await docToVideoRouter.executeCommand(
  '/doc2video slidesOnly',
  documentContent
);

// Generate script only
const scriptOnly = await docToVideoRouter.executeCommand(
  '/doc2video scriptOnly',
  documentContent
);

// Generate voiceover only
const voiceoverOnly = await docToVideoRouter.executeCommand(
  '/doc2video voiceoverOnly',
  documentContent
);
```

### Command Options

| Command                    | Description                    | Output                      |
| -------------------------- | ------------------------------ | --------------------------- |
| `/doc2video auto`          | Full pipeline execution        | Slides + Script + Narration |
| `/doc2video scriptOnly`    | Generate narration script only | Script with timing          |
| `/doc2video slidesOnly`    | Generate slides only           | Slide structure             |
| `/doc2video voiceoverOnly` | Generate audio narration only  | Audio timeline              |

### Advanced Options

```typescript
// With custom options
const result = await docToVideoRouter.executeCommand(
  '/doc2video auto professional 10 slides images voice:en-US-JennyNeural',
  documentContent
);
```

## 📋 Service Details

### 1. DocToVideoRouter

**Role**: Pipeline Orchestrator  
**Tier**: Premium  
**Theme**: Content Transformation

**Key Features**:

- Command parsing and validation
- Pipeline orchestration
- Error handling and fallbacks
- Metadata generation

**Methods**:

- `executeCommand(command, documentContent)` - Main entry point
- `parseCommand(command)` - Parse user input
- `validateCommand(command)` - Validate options
- `executePipeline(command, documentContent)` - Route to appropriate pipeline

### 2. SlideGenerator

**Role**: Slide Content Architect  
**Tier**: Premium  
**Theme**: Presentation Design

**Key Features**:

- Document structure analysis
- Intelligent slide creation
- AI image prompt generation
- Mock slide generation for testing

**Methods**:

- `generateSlides(documentContent, options)` - Main slide generation
- `analyzeDocument(content)` - Extract document structure
- `createSlideStructure(analysis, options)` - Build slide outline
- `generateImagePrompt(slide, options)` - Create AI image prompts

### 3. ScriptGenerator

**Role**: Narration Script Writer  
**Tier**: Premium  
**Theme**: Audio Content Creation

**Key Features**:

- Intelligent narration generation
- Multiple style templates (professional, casual, educational)
- Timing calculation and optimization
- Speaker notes generation

**Methods**:

- `generateScript(slides, options)` - Main script generation
- `generateSlideNarration(slide, options)` - Per-slide narration
- `calculateDuration(wordCount, pace)` - Timing calculation
- `generateSpeakerNotes(script)` - PowerPoint speaker notes

### 4. TTSSyncEngine

**Role**: Text-to-Speech Audio Producer  
**Tier**: Premium  
**Theme**: Audio Production

**Key Features**:

- Audio segment generation
- Timeline synchronization
- Multiple TTS voice support
- Audio export capabilities

**Methods**:

- `generateNarration(script, options)` - Main audio generation
- `generateAudioSegments(script, options)` - Create audio segments
- `createTimeline(segments)` - Build synchronization timeline
- `getAvailableVoices()` - List supported voices

## 🎛️ UI Controls

### DocToVideoControls Component

**Features**:

- Mode selection (Auto/Hybrid/Manual)
- Component generation toggles
- Advanced settings panel
- Progress tracking
- Quick command buttons

**Props**:

```typescript
interface DocToVideoControlsProps {
  onExecute: (command: string, options: DocToVideoOptions) => void;
  onPreview?: (type: 'script' | 'slides' | 'narration') => void;
  onDownload?: (type: 'ppt' | 'audio' | 'timeline') => void;
  isProcessing?: boolean;
  currentProgress?: number;
}
```

## 🔧 Integration Points

### Agent Chat Router

The pipeline integrates with the existing agent chat system:

```typescript
// In agentChatRouter.ts
if (input.startsWith('/doc2video')) {
  const result = await docToVideoRouter.executeCommand(input, documentContent);
  // Return enriched response with suggested actions
}
```

### MCP Compliance

Each service includes MCP Context Blocks:

```typescript
/**
 * MCP Context Block:
 * - role: "Service Role"
 * - tier: "Premium"
 * - file: "path/to/service.ts"
 * - allowedActions: ["action1", "action2"]
 * - theme: "Service Theme"
 */
```

## 🚧 Future Integrations

### Planned Enhancements

1. **LLM Integration**
   - [ ] OpenAI GPT-4 for intelligent document analysis
   - [ ] Claude for advanced content structuring
   - [ ] Local LLM support for privacy

2. **Image Generation**
   - [ ] DALL·E 3 integration for slide images
   - [ ] Midjourney API for high-quality visuals
   - [ ] Stable Diffusion for custom styling

3. **TTS Services**
   - [ ] Azure Cognitive Services
   - [ ] Google Cloud Text-to-Speech
   - [ ] Amazon Polly
   - [ ] ElevenLabs for natural voices

4. **Video Production**
   - [ ] FFmpeg integration for video compilation
   - [ ] After Effects scripting
   - [ ] Premiere Pro automation

5. **Export Formats**
   - [ ] PowerPoint (.pptx) with speaker notes
   - [ ] Video files (MP4, WebM)
   - [ ] Audio files (MP3, WAV)
   - [ ] Timeline data (JSON, XML)

### Database Integration

```sql
-- Future Supabase tables for pipeline data
CREATE TABLE doc_to_video_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  document_content TEXT,
  pipeline_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES doc_to_video_projects(id),
  command TEXT NOT NULL,
  options JSONB,
  result JSONB,
  processing_time INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧪 Testing

### Mock Data Generation

Each service includes mock data generation for testing:

```typescript
// Generate mock slides
const mockSlides = slideGenerator.generateMockSlides();

// Generate mock script
const mockScript = scriptGenerator.generateMockScript();

// Generate mock narration
const mockNarration = ttsSyncEngine.generateMockNarration();
```

### Test Commands

```bash
# Test full pipeline
/doc2video auto

# Test slides only
/doc2video slidesOnly

# Test with custom options
/doc2video auto professional 5 slides images voice:en-US-GuyNeural
```

## 🔒 Security & Governance

### Input Validation

- Document content sanitization
- Command parameter validation
- TTS option validation
- Slide count limits (1-50)

### Error Handling

- Graceful fallbacks for service failures
- Detailed error messages
- Processing timeout protection
- Resource cleanup

### MCP Compliance

- Role-based access control
- Tier-based feature access
- Action-based permissions
- Theme-based context

## 📊 Performance

### Optimization Strategies

1. **Lazy Loading**: Services load on-demand
2. **Caching**: Mock data and results cached
3. **Async Processing**: Non-blocking operations
4. **Resource Management**: Memory-efficient processing

### Monitoring

```typescript
// Performance metrics
const metrics = {
  processingTime: Date.now() - startTime,
  slideCount: result.slides?.length || 0,
  wordCount: result.script?.wordCount || 0,
  audioDuration:
    result.narration?.timeline?.reduce(
      (sum, item) => sum + (item.endTime - item.startTime),
      0
    ) || 0,
};
```

## 🤝 Contributing

### Development Standards

1. **MCP Compliance**: Every new service must include MCP Context Block
2. **TypeScript**: Strict typing and interfaces
3. **Error Handling**: Comprehensive error management
4. **Documentation**: Inline comments and JSDoc
5. **Testing**: Mock implementations for all services

### Adding New Services

1. Create service file with MCP Context Block
2. Implement singleton pattern
3. Add TypeScript interfaces
4. Include mock data generation
5. Update router integration
6. Add UI controls if needed

## 📝 License

This pipeline is part of the DocCraft-AI platform and follows the same licensing terms.

---

**🎬 Ready to transform your documents into engaging video presentations!**
