# Vite & esbuild Upgrade Guide

This guide provides a secure, automated process for upgrading Vite and esbuild with rollback capabilities.

## 🎯 Goals

1. **Auto-snapshot** current Vite & esbuild versions
2. **Upgrade** to Vite >=7.0.6 and latest esbuild (security patch)
3. **Patch** vite.config.ts, jest.config.cjs, and workflows for compatibility
4. **Validate** lint, type-check, test, and build locally
5. **Update** CI/CD workflows for stability
6. **Provide** one-command rollback if upgrade fails
7. **Commit** changes in feature branch `chore/upgrade-vite`

## 🛠 Available Scripts

### Pre-Upgrade Snapshot
```bash
npm run pre-upgrade
```
Creates `upgrade-snapshot.json` with current versions for rollback safety.

### Secure Upgrade
```bash
npm run upgrade:vite
```
Automated upgrade process with validation and rollback capability.

### Rollback (If Needed)
```bash
npm run rollback
```
Restores previous versions from snapshot if upgrade fails.

## 📋 Upgrade Process

### Step 1: Pre-Upgrade Snapshot
```bash
npm run pre-upgrade
```
✅ Saves current versions into `upgrade-snapshot.json`

### Step 2: Secure Upgrade
```bash
npm run upgrade:vite
```
This script:
- Creates pre-upgrade snapshot
- Upgrades Vite and esbuild to latest versions
- Validates with type-check, lint, build, and tests
- Automatically rolls back if any step fails

### Step 3: Manual Validation (Optional)
```bash
npm run type-check
npm run lint
npm test -- --passWithNoTests
npm run build
```

### Step 4: Commit Changes
```bash
git checkout -b chore/upgrade-vite
git add .
git commit -m "chore: upgrade Vite & esbuild with auto-snapshot rollback"
git push origin chore/upgrade-vite
```

## 🔄 Rollback Process

If the upgrade causes issues:

### Automatic Rollback
The upgrade script automatically rolls back if validation fails.

### Manual Rollback
```bash
npm run rollback
```

### Force Rollback
If the rollback script fails:
```bash
# Check snapshot
cat upgrade-snapshot.json

# Manual rollback
npm install vite@<previous-version> esbuild@<previous-version>
```

## 🚀 CI/CD Integration

The following workflows now include pre-upgrade snapshots:
- `.github/workflows/test.yml`
- `.github/workflows/coverage.yml`

### Pre-Upgrade Snapshot Step
```yaml
- name: Pre-upgrade snapshot (for audit safety)
  run: npm run pre-upgrade
```

## 📊 Current Versions

### Before Upgrade
- Vite: 5.4.19
- esbuild: 0.21.5

### After Upgrade
- Vite: 7.0.6
- esbuild: 0.25.8

## 🔧 Configuration Updates

### Vite Configuration
The `vite.config.ts` remains compatible with Vite 7:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
})
```

### Jest Configuration
The `jest.config.cjs` supports Vite 7 + ESM:
```javascript
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  // ... other config
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { useESM: true }],
  },
  globals: {
    'ts-jest': { useESM: true },
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
}
```

## 🛡️ Security Benefits

### Vite 7.0.6
- Latest security patches
- Improved performance
- Better ESM support
- Enhanced build optimizations

### esbuild 0.25.8
- Critical security fixes
- Performance improvements
- Better TypeScript support
- Enhanced bundling capabilities

## 📝 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check for deprecated Vite options
   - Update plugin configurations
   - Verify ESM compatibility

2. **Test Failures**
   - Ensure `NODE_OPTIONS=--experimental-vm-modules` is set
   - Check Jest configuration for ESM support
   - Verify test environment setup

3. **Type Errors**
   - Run `npm run type-check` to identify issues
   - Update type definitions if needed
   - Check for breaking changes in dependencies

### Rollback Scenarios

1. **Immediate Rollback**
   ```bash
   npm run rollback
   ```

2. **Manual Rollback**
   ```bash
   # Check snapshot
   cat upgrade-snapshot.json
   
   # Install previous versions
   npm install vite@5.4.19 esbuild@0.21.5
   ```

3. **Git Rollback**
   ```bash
   git reset --hard HEAD~1
   npm install
   ```

## 🎉 Success Criteria

- ✅ Type check passes
- ✅ Build completes successfully
- ✅ Tests run without critical failures
- ✅ CI/CD workflows include pre-upgrade snapshots
- ✅ Rollback capability verified
- ✅ Feature branch created and committed

## 📚 Additional Resources

- [Vite Migration Guide](https://vitejs.dev/guide/migration)
- [esbuild Changelog](https://github.com/evanw/esbuild/blob/main/CHANGELOG.md)
- [Jest ESM Support](https://jestjs.io/docs/ecmascript-modules) 