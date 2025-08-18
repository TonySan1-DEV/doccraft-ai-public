# Contributing to DocCraft-AI

## 🎯 Welcome Contributors!

Thank you for your interest in contributing to DocCraft-AI! This document provides guidelines and information for contributors.

## 📚 Documentation Update Policy

### Automatic Documentation Maintenance

DocCraft-AI uses an automated documentation system that keeps developer guides up-to-date. **You don't need to manually update most documentation** - the system handles it automatically!

### What Happens Automatically

- **API Changes**: OpenAPI specs and endpoint documentation
- **Database Changes**: Schema documentation and model updates
- **Frontend Changes**: Component maps and route documentation
- **Build Changes**: Build and deployment guide updates
- **Configuration Changes**: Environment and setup documentation

### When You Need to Update Documentation

Only update documentation manually for:

1. **Architecture decisions** - Use `npm run docs:adr create "Title" "Description"`
2. **User-facing features** - Update user guides and tutorials
3. **Complex business logic** - Add explanations that can't be auto-generated
4. **Custom workflows** - Document team-specific processes

### Documentation Commands

```bash
# Check documentation health
npm run docs:verify

# Generate docs for your changes
npm run docs:changed

# Regenerate all documentation
npm run docs:all

# Create architecture decision record
npm run docs:adr create "Use Vite for Build Tool" "Decision to migrate from webpack to Vite"
```

## 🚀 Quick Start

### 1. Setup Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd doccraft-ai-v3

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### 2. Development Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit code ...

# Run tests
npm run test:unit
npm run test:e2e

# Check documentation
npm run docs:verify

# Commit changes
git add .
git commit -m "feat: add new feature description"

# Push and create PR
git push origin feature/your-feature-name
```

## 📝 Code Standards

### TypeScript

- Use TypeScript for all new code
- Follow strict type checking
- Prefer interfaces over types for objects
- Use proper JSDoc comments for complex functions

### React Components

- Use functional components with hooks
- Follow naming convention: `PascalCase` for components
- Use TypeScript interfaces for props
- Implement proper error boundaries

### Testing

- Write unit tests for all new functions
- Add integration tests for API endpoints
- Include E2E tests for user workflows
- Maintain test coverage above 80%

### Git Commits

Use conventional commit format:

```
type(scope): description

feat(auth): add OAuth2 authentication
fix(api): resolve user creation bug
docs(readme): update installation instructions
refactor(components): simplify button component
test(api): add user endpoint tests
```

## 🔧 Development Tools

### Pre-commit Hooks

Husky automatically runs:
- Code linting and formatting
- Type checking
- Unit tests
- Documentation verification

### Code Quality

- **ESLint**: Code style and best practices
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Husky**: Git hooks automation

### Testing Framework

- **Vitest**: Unit and integration testing
- **Playwright**: End-to-end testing
- **Jest**: Legacy test compatibility

## 🐛 Bug Reports

### Before Reporting

1. **Check existing issues** - Search for similar problems
2. **Reproduce the issue** - Ensure it's reproducible
3. **Check documentation** - Verify it's not documented behavior
4. **Test in latest version** - Ensure it's not already fixed

### Bug Report Template

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10, macOS 12]
- Node.js: [e.g., 18.17.0]
- Browser: [e.g., Chrome 120]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Before Requesting

1. **Check roadmap** - See if it's already planned
2. **Search issues** - Look for similar requests
3. **Consider impact** - Think about implementation complexity
4. **Provide context** - Explain why it's needed

### Feature Request Template

```markdown
## Feature Description
Clear description of the requested feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How should the feature work?

## Alternatives Considered
What other approaches were considered?

## Additional Context
Any other relevant information
```

## 🔄 Pull Request Process

### Before Submitting

1. **Run tests**: Ensure all tests pass
2. **Check documentation**: Verify docs are up-to-date
3. **Code review**: Self-review your changes
4. **Update changelog**: Add entry if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Documentation
- [ ] Code is documented
- [ ] User-facing docs updated
- [ ] API docs updated (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] No console.log statements
- [ ] No commented-out code
```

## 📚 Learning Resources

### Project Documentation

- **[Developer Guide](../docs/dev/)** - Comprehensive development documentation
- **[API Documentation](../docs/api/)** - API reference and examples
- **[Architecture Guide](../docs/dev/01-architecture.md)** - System design overview

### External Resources

- **React**: [Official Documentation](https://react.dev/)
- **TypeScript**: [Handbook](https://www.typescriptlang.org/docs/)
- **Vite**: [Guide](https://vitejs.dev/guide/)
- **Testing**: [Vitest Guide](https://vitest.dev/guide/)

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** - Treat others with kindness
- **Be inclusive** - Welcome diverse perspectives
- **Be constructive** - Provide helpful feedback
- **Be patient** - Learning takes time

### Communication

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Pull Requests**: For code contributions
- **Documentation**: For improvements and clarifications

## 🏆 Recognition

### Contributors

All contributors are recognized in:
- Project README
- Release notes
- Contributor hall of fame
- GitHub contributors page

### Contribution Levels

- **Bronze**: 1-5 contributions
- **Silver**: 6-20 contributions
- **Gold**: 21+ contributions
- **Platinum**: Major feature contributions

## 📞 Getting Help

### Support Channels

1. **Documentation**: Check the [developer guide](../docs/dev/)
2. **Issues**: Search existing GitHub issues
3. **Discussions**: Ask questions in GitHub discussions
4. **Team**: Contact core development team

### Quick Help Commands

```bash
# Check project health
npm run test:comprehensive

# Verify documentation
npm run docs:verify

# Check code quality
npm run lint:strict

# Build verification
npm run build:complete
```

---

**Thank you for contributing to DocCraft-AI!** 🎉

Your contributions help make this project better for everyone in the community.
