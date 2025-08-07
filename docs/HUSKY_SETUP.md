# Husky Automatic Setup

## Overview

DocCraft-AI v3 automatically sets up Husky pre-commit hooks when developers run `npm install` for the first time.

## How It Works

### 1. Prepare Script

The `package.json` includes a `prepare` script that runs automatically after `npm install`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

### 2. Automatic Installation

When a developer runs `npm install`:

1. Dependencies are installed
2. The `prepare` script runs automatically
3. Husky hooks are installed
4. Pre-commit hooks are ready to use

### 3. Pre-commit Hook

The `.husky/pre-commit` hook runs lint-staged before every commit:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running lint-staged before commit..."
npx lint-staged
```

## Benefits

- **Zero Configuration**: New developers don't need to manually set up Husky
- **Consistent Environment**: All developers get the same pre-commit hooks
- **Automatic Enforcement**: Linting errors are caught before commits
- **Team Alignment**: Ensures code quality standards across the team

## Verification

To verify Husky is working:

```bash
# Check if hooks are installed
ls -la .husky/

# Test the pre-commit hook
git add .
git commit -m "test commit"
```

## Troubleshooting

If Husky isn't working:

1. **Reinstall hooks**: `npm run prepare`
2. **Check permissions**: Ensure `.husky/pre-commit` is executable
3. **Verify installation**: `npx husky --version`

## Manual Setup (if needed)

If automatic setup fails:

```bash
# Install Husky manually
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

## Configuration

The lint-staged configuration in `package.json`:

```json
{
  "lint-staged": {
    "*.{js,ts,tsx,json,css,md}": ["prettier --write", "eslint --fix"]
  }
}
```

This ensures all staged files are formatted and linted before commits.
