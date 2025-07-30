# GitHub Actions Workflows

This directory contains the modular CI/CD workflows for DocCraft-AI v3.

## Workflow Structure

### Orchestrator
- **`ci.yml`** - Main orchestrator that calls all modular workflows

### Core Modular Workflows
- **`lint.yml`** - ESLint code linting
- **`typecheck.yml`** - TypeScript type checking
- **`test.yml`** - Unit tests execution
- **`coverage.yml`** - Code coverage analysis
- **`emotionArc.yml`** - Emotion Arc module specific tests

### Audit Workflows
- **`export-audit-logs.yml`** - Export audit logs to S3/BigQuery
- **`reingest-audit-logs.yml`** - Reingest audit logs from S3/BigQuery

## Workflow Call Pattern

All modular workflows follow the same structure:

```yaml
name: Workflow Name

on:
  workflow_call:
    # Optional secrets for audit workflows
    secrets:
      SECRET_NAME:
        required: true/false
  # Direct triggers for standalone execution
  push:
    branches: [main, develop]
    paths: ['relevant/paths/**']
  pull_request:
    branches: [main, develop]
    paths: ['relevant/paths/**']

env:
  NODE_VERSION: '18'

jobs:
  job-name:
    name: Job Description
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Cache node_modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
            
      - name: Install dependencies
        run: npm ci
        
      - name: Run specific task
        run: npm run task
        id: task-name
        
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: task-results
          path: results/
          retention-days: 30
```

## Usage

### Running the Full CI Pipeline
The main CI pipeline is triggered by:
- Push to `main` or `next` branches
- Pull requests to `main` or `next` branches

### Running Individual Workflows
Each modular workflow can be run independently by:
- Direct push/PR triggers (if configured)
- Manual workflow dispatch (if configured)

### Audit Workflows
Audit workflows can be triggered:
- Automatically via cron schedules
- Manually via workflow dispatch
- As part of the main CI pipeline

## Secrets Required

### Core Workflows
- No additional secrets required

### Audit Workflows
- `NEXT_PUBLIC_SUPABASE_URL` (required)
- `SUPABASE_SERVICE_ROLE_KEY` (required)
- `AWS_ACCESS_KEY_ID` (optional, for S3 export)
- `AWS_SECRET_ACCESS_KEY` (optional, for S3 export)
- `AWS_REGION` (optional, for S3 export)
- `AWS_S3_BUCKET` (optional, for S3 export)
- `GOOGLE_CLOUD_CREDENTIALS` (optional, for BigQuery export)
- `GOOGLE_CLOUD_PROJECT_ID` (optional, for BigQuery export)
- `BIGQUERY_DATASET_ID` (optional, for BigQuery export)
- `BIGQUERY_TABLE_ID` (optional, for BigQuery export)
- `EXPORT_BATCH_SIZE` (optional)
- `EXPORT_RETRY_ATTEMPTS` (optional)
- `REINGEST_BATCH_SIZE` (optional)
- `REINGEST_RETRY_ATTEMPTS` (optional)

## Benefits

1. **Modularity**: Each workflow has a single responsibility
2. **Reusability**: Workflows can be called by the orchestrator or run independently
3. **Maintainability**: Changes to one workflow don't affect others
4. **Parallelization**: Workflows can run in parallel when called by the orchestrator
5. **Flexibility**: Individual workflows can be triggered independently
6. **Consistency**: All workflows follow the same structure and patterns 