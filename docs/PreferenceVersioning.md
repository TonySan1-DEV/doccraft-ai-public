# Preference Versioning System

## Overview

The Preference Versioning System provides versioned user preference profiles with rollback functionality for the DocCraft-AI application. This system allows authors to maintain a history of their preference configurations and restore previous versions when needed.

## Features

- **Version History**: Automatic versioning of preference changes
- **Rollback Functionality**: Restore previous preference configurations
- **Version Labeling**: Optional labels for better organization
- **Maximum Version Limit**: Automatic cleanup of old versions (keeps last 10)
- **Security**: User-specific access control via RLS policies
- **Validation**: Comprehensive preference data validation

## Database Schema

### preference_versions Table

```sql
CREATE TABLE preference_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  label TEXT, -- Optional label for version
  version_number INTEGER NOT NULL, -- Auto-incrementing version number per user
  is_current BOOLEAN DEFAULT FALSE, -- Flag to mark current active version
  metadata JSONB DEFAULT '{}'::jsonb -- Additional metadata
);
```

### Indexes

```sql
CREATE INDEX idx_preference_versions_user_id ON preference_versions(user_id);
CREATE INDEX idx_preference_versions_created_at ON preference_versions(created_at DESC);
CREATE INDEX idx_preference_versions_version_number ON preference_versions(user_id, version_number DESC);
CREATE INDEX idx_preference_versions_current ON preference_versions(user_id, is_current) WHERE is_current = TRUE;
```

### Row Level Security (RLS)

```sql
ALTER TABLE preference_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preference versions" ON preference_versions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preference versions" ON preference_versions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preference versions" ON preference_versions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preference versions" ON preference_versions
  FOR DELETE USING (auth.uid() = user_id);
```

## Database Functions

### create_preference_version

Creates a new preference version and manages version numbering.

```sql
CREATE OR REPLACE FUNCTION create_preference_version(
  user_uuid UUID,
  preference_data JSONB,
  version_label TEXT DEFAULT NULL,
  version_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
```

**Parameters:**
- `user_uuid`: User ID
- `preference_data`: JSON object containing preference settings
- `version_label`: Optional label for the version
- `version_metadata`: Additional metadata

**Returns:** UUID of the created version

### restore_preference_version

Restores a specific version by creating a new version with the restored preferences.

```sql
CREATE OR REPLACE FUNCTION restore_preference_version(
  user_uuid UUID,
  version_id UUID
)
RETURNS JSONB
```

**Parameters:**
- `user_uuid`: User ID
- `version_id`: ID of the version to restore

**Returns:** JSONB containing the restored preferences

### get_current_preference_version

Retrieves the current active version for a user.

```sql
CREATE OR REPLACE FUNCTION get_current_preference_version(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  preferences JSONB,
  label TEXT,
  version_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
```

### get_preference_version_history

Retrieves version history for a user.

```sql
CREATE OR REPLACE FUNCTION get_preference_version_history(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  preferences JSONB,
  label TEXT,
  version_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  is_current BOOLEAN,
  metadata JSONB
)
```

## Frontend Integration

### AgentPreferencesContext

The context has been extended to include version management functionality:

```typescript
interface AgentPreferencesContextType {
  // ... existing properties
  
  // Version management
  createVersion: (options?: CreateVersionOptions) => Promise<PreferenceVersion | null>;
  getCurrentVersion: () => Promise<PreferenceVersion | null>;
  getVersionHistory: () => Promise<PreferenceVersion[]>;
  restoreVersion: (versionId: string, options?: CreateVersionOptions) => Promise<boolean>;
  deleteVersion: (versionId: string) => Promise<boolean>;
  updateVersionLabel: (versionId: string, label: string) => Promise<boolean>;
  
  // Version state
  versionHistory: PreferenceVersion[];
  isLoadingVersions: boolean;
  currentVersion: PreferenceVersion | null;
}
```

### Usage Example

```typescript
import { useAgentPreferences } from '../contexts/AgentPreferencesContext';

function MyComponent() {
  const { 
    versionHistory, 
    createVersion, 
    restoreVersion,
    isLoadingVersions 
  } = useAgentPreferences();

  const handleSaveVersion = async () => {
    await createVersion({
      label: 'Fast Draft 1',
      reason: 'Optimized for quick writing'
    });
  };

  const handleRestoreVersion = async (versionId: string) => {
    await restoreVersion(versionId, {
      label: 'Restored from version history'
    });
  };

  return (
    <div>
      {isLoadingVersions ? (
        <div>Loading versions...</div>
      ) : (
        <div>
          {versionHistory.map(version => (
            <div key={version.id}>
              Version {version.version_number}: {version.label}
              <button onClick={() => handleRestoreVersion(version.id)}>
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## UI Components

### PreferenceVersionHistory

A React component for displaying and managing version history:

```typescript
import { PreferenceVersionHistory } from '../components/PreferenceVersionHistory';

function PreferencesPanel() {
  return (
    <div>
      <PreferenceVersionHistory 
        onVersionRestored={(version) => {
          console.log(`Restored version ${version.version_number}`);
        }}
      />
    </div>
  );
}
```

**Features:**
- List all versions with timestamps and labels
- Preview version contents in modal
- Restore versions with confirmation
- Edit version labels
- Delete versions (except current)
- Loading states and error handling

### AgentPreferencesPanel Integration

The main preferences panel now includes a tab interface:

```typescript
// Tab navigation
<div className="mb-6 border-b border-gray-200">
  <nav className="flex space-x-8">
    <button onClick={() => setActiveTab('preferences')}>
      Preferences
    </button>
    <button onClick={() => setActiveTab('versions')}>
      Version History
    </button>
  </nav>
</div>

// Tab content
{activeTab === 'preferences' ? (
  <PreferencesForm />
) : (
  <PreferenceVersionHistory />
)}
```

## Backend Service

### PreferenceVersionService

A singleton service class for managing preference versions:

```typescript
import { preferenceVersionService } from '../services/preferenceVersionService';

// Create a new version
const version = await preferenceVersionService.createVersion(preferences, {
  label: 'My Version',
  reason: 'Testing new settings'
});

// Get current version
const current = await preferenceVersionService.getCurrentVersion();

// Get version history
const history = await preferenceVersionService.getVersionHistory({ limit: 10 });

// Restore a version
const restored = await preferenceVersionService.restoreVersion('version-id');

// Delete a version
const deleted = await preferenceVersionService.deleteVersion('version-id');

// Update version label
const updated = await preferenceVersionService.updateVersionLabel('version-id', 'New Label');
```

## Validation

The system includes comprehensive validation for preference data:

### Required Fields
- `tone`: Must be one of `['friendly', 'formal', 'concise']`
- `language`: Must be one of supported languages
- `copilotEnabled`: Must be boolean
- `memoryEnabled`: Must be boolean

### Validation Rules
- Preferences object must be valid JSON
- All required fields must be present
- Field values must match expected types
- No unknown fields are allowed

## Security Considerations

### Authentication
- All operations require user authentication
- User ID is automatically extracted from Supabase auth

### Authorization
- RLS policies ensure users can only access their own versions
- No cross-user version access is possible

### Data Validation
- Input validation prevents malicious data injection
- JSON schema validation ensures data integrity

### Rate Limiting
- Consider implementing rate limiting for version creation
- Maximum version limit prevents storage abuse

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Efficient version numbering per user
- Automatic cleanup of old versions

### Caching
- Version history can be cached client-side
- Current version can be cached for quick access

### Pagination
- Version history supports limit parameter
- Consider implementing cursor-based pagination for large histories

## Error Handling

### Common Error Scenarios
- **Authentication Required**: User not logged in
- **Version Not Found**: Attempting to restore non-existent version
- **Validation Failed**: Invalid preference data
- **Permission Denied**: Attempting to access another user's versions

### Error Recovery
- Graceful fallback to default preferences
- User-friendly error messages
- Automatic retry for transient failures

## Testing

### Unit Tests
```bash
npm test src/__tests__/preferenceVersioning.test.ts
```

### Integration Tests
- Test database functions directly
- Test service layer with mocked Supabase
- Test UI components with mocked context

### Manual Testing
1. Create multiple preference versions
2. Test version restoration
3. Verify version history display
4. Test error scenarios
5. Verify security restrictions

## Migration Guide

### For Existing Users
1. Run database migration to create `preference_versions` table
2. Existing preferences will be automatically migrated
3. No data loss during migration

### Database Migration
```sql
-- Run the preference_versions.sql file
\i database/preference_versions.sql

-- Verify installation
SELECT * FROM preference_versions LIMIT 1;
```

## Future Enhancements

### Planned Features
- **Version Comparison**: Side-by-side diff view
- **Bulk Operations**: Delete multiple versions
- **Export/Import**: Backup and restore version history
- **Version Tags**: Categorize versions with tags
- **Auto-versioning**: Automatic version creation on significant changes

### Performance Improvements
- **Lazy Loading**: Load version history on demand
- **Virtual Scrolling**: Handle large version histories
- **Background Sync**: Sync versions in background

### Analytics
- **Usage Tracking**: Monitor version creation patterns
- **Popular Configurations**: Identify commonly used settings
- **User Insights**: Understand preference evolution

## Troubleshooting

### Common Issues

**Version Creation Fails**
- Check user authentication
- Verify preference data validation
- Check database permissions

**Version History Not Loading**
- Verify RLS policies are enabled
- Check user ID in queries
- Ensure database functions exist

**Restore Operation Fails**
- Verify version ID exists
- Check user ownership of version
- Ensure preference validation passes

### Debug Steps
1. Check browser console for errors
2. Verify Supabase connection
3. Test database functions directly
4. Check RLS policy logs
5. Validate preference data format

## API Reference

### Types

```typescript
interface PreferenceVersion {
  id: string;
  user_id: string;
  created_at: string;
  preferences: AgentPrefs;
  label?: string;
  version_number: number;
  is_current: boolean;
  metadata?: Record<string, any>;
}

interface CreateVersionOptions {
  label?: string;
  metadata?: Record<string, any>;
  reason?: string;
}

interface VersionHistoryOptions {
  limit?: number;
  includeCurrent?: boolean;
}
```

### Service Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `createVersion(preferences, options)` | Create new version | `Promise<PreferenceVersion \| null>` |
| `getCurrentVersion()` | Get current version | `Promise<PreferenceVersion \| null>` |
| `getVersionHistory(options)` | Get version history | `Promise<PreferenceVersion[]>` |
| `restoreVersion(versionId, options)` | Restore version | `Promise<AgentPrefs \| null>` |
| `deleteVersion(versionId)` | Delete version | `Promise<boolean>` |
| `updateVersionLabel(versionId, label)` | Update version label | `Promise<boolean>` |
| `getVersionStats()` | Get version statistics | `Promise<VersionStats>` | 