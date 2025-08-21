# Audio Export (Audiobook/TTS) — Flag Gated

## Overview

The Audio Export feature provides text-to-speech (TTS) capabilities for generating audiobooks from documents or raw text. The feature is completely flag-gated and non-breaking - when disabled, the API endpoint returns 404 and no UI changes occur.

## Flags

- **Frontend**: `VITE_FEATURE_AUDIOBOOK`
- **Server**: `FEATURE_AUDIOBOOK`

## Environment Variables

### Frontend (.env.local)

```bash
VITE_FEATURE_AUDIOBOOK=false
```

### Server (.env / .env.development)

```bash
FEATURE_AUDIOBOOK=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUDIO_BUCKET_NAME=audio-exports
AUDIO_SIGNED_URL_TTL_SEC=21600  # 6 hours
```

## API Endpoint

### `POST /api/export/audio`

**Request Body**

```json
{
  "documentId": "uuid | optional if text provided",
  "text": "string | optional if documentId provided",
  "voice": "narrator_f|narrator_m|warm_f|bright_m|neutral_f",
  "format": "mp3|wav|ogg|m4a",
  "speed": 1.0,
  "sampleRate": 44100,
  "language": "en",
  "provider": "openai|dummy"
}
```

**Response**

```json
{
  "ok": true,
  "documentId": "uuid|optional",
  "objectKey": "yyyy/mm/dd/id/random.ext",
  "signedUrl": "https://... (time-limited)",
  "expiresAt": 1724159999
}
```

## Architecture

### Components

1. **Shared Schemas** (`src/shared/schemas/audioExport.ts`)
   - Zod validation for request/response
   - Type-safe interfaces

2. **Storage Adapter** (`server/adapters/storage.ts`)
   - Supabase storage integration
   - Private bucket management
   - Signed URL generation

3. **TTS Adapter** (`server/adapters/tts.ts`)
   - Engine-agnostic interface
   - OpenAI implementation (to be wired)
   - Dummy implementation for testing

4. **Audio Export Service** (`server/services/audioExportService.ts`)
   - Orchestrates TTS and storage
   - Document text loading
   - Object key generation

5. **API Route** (`server/routes/export.audio.ts`)
   - Flag-gated endpoint
   - Request validation
   - Error handling

## Storage

- **Bucket**: `audio-exports` (private)
- **Access**: Signed URLs with configurable TTL
- **Structure**: `yyyy/mm/dd/documentId/random.ext`

## Voice Mapping

| Internal Voice | OpenAI Voice ID |
| -------------- | --------------- |
| narrator_f     | alloy           |
| narrator_m     | echo            |
| warm_f         | nova            |
| bright_m       | onyx            |
| neutral_f      | shimmer         |

## Usage Examples

### Basic Text-to-Speech

```bash
curl -X POST http://localhost:8000/api/export/audio \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello from DocCraft AI",
    "provider": "dummy",
    "format": "mp3",
    "voice": "narrator_f"
  }'
```

### Document-based Export

```bash
curl -X POST http://localhost:8000/api/export/audio \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "123e4567-e89b-12d3-a456-426614174000",
    "provider": "openai",
    "format": "wav",
    "voice": "narrator_m",
    "speed": 1.2
  }'
```

## Testing

### Run Tests

```bash
npm test -- tests/audio/
```

### Test Coverage

- Flag behavior (404 when disabled)
- Happy path with dummy provider
- Input validation
- Error handling

## Development

### Adding New TTS Providers

1. Extend `TTSProvider` enum in schemas
2. Implement new engine in `server/adapters/tts.ts`
3. Add provider selection logic in the route

### Customizing Voice Mapping

Update the voice mapping function in `makeOpenAITTSEngine()` to match your OpenAI voice IDs.

### Document Loader Integration

Replace the placeholder `docsLoader` in the route with your actual document retrieval service.

## Security

- **Private Storage**: Audio files are not publicly accessible
- **Signed URLs**: Time-limited access via Supabase signed URLs
- **Service Role Key**: Server-side only, never exposed to client

## Performance

- **Lazy Loading**: TTS engines are instantiated on-demand
- **Efficient Storage**: Files organized by date for easy cleanup
- **Configurable TTL**: Adjust signed URL expiration as needed

## Monitoring

The feature integrates with existing monitoring infrastructure. Failed TTS requests and storage operations are logged and can be tracked through the monitoring dashboard.

## Future Enhancements

- **Batch Processing**: Multiple documents in single request
- **Audio Post-processing**: Effects, normalization, compression
- **Streaming**: Real-time audio generation
- **Multi-language**: Enhanced language support
- **Voice Cloning**: Custom voice training
