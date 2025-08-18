# DocCraft-AI Developer Documentation

## 🎯 Overview

This directory contains the comprehensive developer documentation for DocCraft-AI, automatically maintained and updated through our documentation automation system.

## 📚 Documentation Structure

### Core Guides

- **[00-overview.md](./00-overview.md)** - Project overview and quick start
- **[01-architecture.md](./01-architecture.md)** - System architecture and design
- **[02-setup-and-env.md](./02-setup-and-env.md)** - Environment setup and configuration
- **[03-build-and-deploy.md](./03-build-and-deploy.md)** - Build process and deployment
- **[04-frontend.md](./04-frontend.md)** - Frontend architecture and components
- **[05-backend.md](./05-backend.md)** - Backend services and APIs
- **[06-database.md](./06-database.md)** - Database schemas and migrations
- **[07-integrations.md](./07-integrations.md)** - External service integrations
- **[08-testing-and-quality.md](./08-testing-and-quality.md)** - Testing strategy and quality gates
- **[09-conventions-and-standards.md](./09-conventions-and-standards.md)** - Coding standards and conventions
- **[10-operations-and-troubleshooting.md](./10-operations-and-troubleshooting.md)** - Operations and debugging

### Reference Materials

- **[refs/](./refs/)** - Auto-generated reference materials
  - `openapi.json` - OpenAPI specification
  - `prisma-pg.schema.md` - PostgreSQL schema documentation
  - `prisma-mongo.schema.md` - MongoDB schema documentation
  - `component-map.json` - React component index
  - `route-map.json` - Application routes
  - `dependency-graph.md` - Project dependency visualization

### Architecture Decision Records

- **[11-adr/](./11-adr/)** - Architecture Decision Records (ADRs)
  - One file per architectural decision
  - Tracks context, decision, alternatives, and consequences

## 🔄 Auto-Generated Content

This documentation is automatically maintained through:

- **Git Hooks**: Pre-commit and pre-push validation
- **CI Checks**: Automated documentation verification
- **Change Detection**: Smart regeneration based on code changes
- **Schema Updates**: Automatic database and API documentation

### Auto-Generation Markers

All auto-generated content is clearly marked with special comments:

```markdown
<!-- AUTO-GEN:BEGIN section=api-endpoints -->
...generated content...
<!-- AUTO-GEN:END section=api-endpoints -->
```

**⚠️ Important**: Never manually edit content between these markers. It will be overwritten on the next documentation generation.

## 🛠️ Maintenance Commands

### Generate All Documentation

```bash
npm run docs:all
```

### Generate Documentation for Changed Areas

```bash
npm run docs:changed
```

### Verify Documentation Consistency

```bash
npm run docs:verify
```

### Create/Update Architecture Decision Record

```bash
npm run docs:adr create "Title" "Description"
npm run docs:adr list
npm run docs:adr status <file> <status>
```

### Lint Markdown Files

```bash
npm run lint:md
```

## 🔧 How It Works

### 1. Change Detection

The system automatically detects changes in:
- **API**: `api/`, `server/`, `functions/`, `pages/api/`
- **Database**: `prisma/`, `database/`, `supabase/migrations/`
- **Frontend**: `src/`, `components/`, `pages/`, `modules/`
- **Build**: `package.json`, `vite.config.*`, `tsconfig.*`, `Dockerfile*`
- **Testing**: `tests/`, `e2e/`, `playwright`, `vitest`, `jest`
- **Configuration**: `config/`, `infra/`, `scripts/`

### 2. Smart Regeneration

Only affected documentation areas are regenerated:
- API changes → OpenAPI spec + backend docs
- Database changes → Schema docs + database guide
- Frontend changes → Component map + route map + frontend guide
- Build changes → Build and deploy guide
- Config changes → Setup and environment guide

### 3. Verification

Before commits and pushes:
- All required documentation files exist
- Auto-generated content is current
- No stale documentation sections
- Proper formatting and structure

## 📝 Contributing to Documentation

### Manual Updates

For content that cannot be auto-generated:

1. **Add to appropriate guide**: Update the relevant `.md` file
2. **Follow format**: Use consistent markdown formatting
3. **Add changelog**: Include commit hash and description
4. **Test locally**: Run `npm run docs:verify` before committing

### Adding New Auto-Generated Sections

1. **Create generator script**: Add to `scripts/docs/`
2. **Update change detection**: Add patterns to `run-for-changes.mjs`
3. **Add auto-gen markers**: Use `<!-- AUTO-GEN:BEGIN section=name -->`
4. **Test generation**: Run `npm run docs:changed`

### Documentation Standards

- **Clear headings**: Use descriptive, hierarchical headings
- **Code examples**: Include working, tested code snippets
- **Links**: Link to related documentation and external resources
- **Changelog**: Track all changes with commit hashes
- **Consistent formatting**: Follow established markdown patterns

## 🚨 Troubleshooting

### Documentation Verification Fails

```bash
# Check what's missing
npm run docs:verify

# Regenerate based on changes
npm run docs:changed

# Regenerate everything
npm run docs:all
```

### Auto-Generation Issues

```bash
# Check script permissions
chmod +x scripts/docs/*.mjs

# Verify Node.js version
node --version  # Should be 18.x or higher

# Check for syntax errors
node scripts/docs/verify-docs.mjs
```

### Git Hook Problems

```bash
# Reinstall Husky hooks
npm run prepare

# Check hook permissions
ls -la .husky/

# Test hooks manually
.husky/pre-commit
.husky/pre-push
```

## 📊 Documentation Health

### Metrics Tracked

- **Coverage**: Percentage of code areas documented
- **Freshness**: Time since last documentation update
- **Completeness**: Required sections present
- **Quality**: Linting and formatting compliance

### Monitoring

- **Pre-commit**: Automatic verification before commits
- **Pre-push**: Comprehensive check before pushing
- **CI/CD**: Automated validation in pull requests
- **Reports**: Detailed verification reports generated

## 🔗 Related Resources

- **[Project README](../../README.md)** - Main project documentation
- **[API Documentation](../../docs/api/)** - External API documentation
- **[User Guides](../../docs/guides/)** - End-user documentation
- **[Contributing Guidelines](../../CONTRIBUTING.md)** - How to contribute

## 📞 Support

For documentation issues:

1. **Check troubleshooting section** above
2. **Run verification commands** to identify problems
3. **Review CI/CD logs** for detailed error messages
4. **Create issue** with specific error details
5. **Contact development team** for complex problems

---

**Last Updated**: ${new Date().toISOString().split('T')[0]}  
**Maintained By**: DocCraft-AI Development Team  
**Automation Version**: 1.0.0
