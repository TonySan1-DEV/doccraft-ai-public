# Contributing to Emotional Arc Modeling Module

> **Guidelines for contributing to the AI-powered emotional analysis system**

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://www.contributor-covenant.org/)
[![Code of Conduct](https://img.shields.io/badge/Code%20of%20Conduct-Enforced-green)](https://github.com/your-org/doccraft-ai/blob/main/CODE_OF_CONDUCT.md)

## 🤝 Welcome Contributors!

We're excited that you're interested in contributing to the Emotional Arc Modeling module! This document provides everything you need to get started with development, testing, and contributing to the project.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Development Setup](#-development-setup)
- [Code Standards](#-code-standards)
- [Testing Guidelines](#-testing-guidelines)
- [Accessibility Requirements](#-accessibility-requirements)
- [MCP Compliance](#-mcp-compliance)
- [Branching Strategy](#-branching-strategy)
- [Pull Request Process](#-pull-request-process)
- [Release Process](#-release-process)
- [Troubleshooting](#-troubleshooting)

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 16 or 18 (LTS recommended)
- **npm**: Version 8 or higher
- **Git**: Latest version
- **Code Editor**: VS Code with recommended extensions

### One-Command Setup

```bash
# Clone and setup in one command
git clone https://github.com/your-org/doccraft-ai.git && \
cd doccraft-ai && \
npm install && \
npm run dev
```

## 🛠️ Development Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-org/doccraft-ai.git
cd doccraft-ai

# Install dependencies
npm install

# Verify installation
npm run verify-setup
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Development Settings
NODE_ENV=development
VITE_DEBUG_MODE=true
VITE_ENABLE_EMOTION_ARC=true

# Testing Configuration
VITE_TEST_MODE=true
VITE_MOCK_API=true
```

### 3. IDE Setup

#### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-jest"
  ]
}
```

#### VS Code Settings

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "jest.autoRun": {
    "watch": false,
    "onSave": "test-file"
  }
}
```

## 📝 Code Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Proper typing and interfaces
interface EmotionalBeat {
  sceneId: string;
  characterId: string;
  emotion: string;
  intensity: number;
  narrativePosition: number;
}

// ✅ Good: Type-safe function signatures
function analyzeEmotion(text: string): Promise<EmotionalBeat> {
  // Implementation
}

// ❌ Avoid: Any types
function badFunction(data: any): any {
  // Implementation
}
```

### React Component Standards

```typescript
// ✅ Good: Proper component structure
interface EmotionTimelineChartProps {
  emotionalBeats: EmotionalBeat[];
  selectedCharacter: string;
  onBeatClick: (beat: EmotionalBeat) => void;
  isLoading?: boolean;
  error?: string | null;
  'aria-label'?: string;
}

export default function EmotionTimelineChart({
  emotionalBeats,
  selectedCharacter,
  onBeatClick,
  isLoading = false,
  error = null,
  'aria-label': ariaLabel = 'Emotional timeline chart'
}: EmotionTimelineChartProps) {
  // Component implementation
}
```

### File Organization

```
modules/emotionArc/
├── components/           # React components
│   ├── __tests__/       # Component tests
│   ├── __stories__/     # Storybook stories
│   └── index.ts         # Component exports
├── services/            # Business logic
│   ├── emotionAnalyzer.ts
│   ├── arcSimulator.ts
│   └── suggestionEngine.ts
├── types/               # TypeScript definitions
│   └── emotionTypes.ts
├── utils/               # Utility functions
│   └── validation.ts
├── constants/           # Constants and config
│   └── emotions.ts
└── docs/               # Documentation
    ├── README.md
    ├── CONTRIBUTING.md
    └── CHANGELOG.md
```

### Naming Conventions

- **Files**: `camelCase.tsx` for components, `camelCase.ts` for utilities
- **Components**: `PascalCase` (e.g., `EmotionTimelineChart`)
- **Functions**: `camelCase` (e.g., `analyzeEmotion`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `EMOTION_CATEGORIES`)
- **Interfaces**: `PascalCase` (e.g., `EmotionalBeat`)

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run emotion arc tests only
npm test -- --testPathPattern=modules/emotionArc

# Run specific component tests
npm test -- --testPathPattern=EmotionTimelineChart

# Run with coverage
npm test -- --coverage --testPathPattern=modules/emotionArc

# Run accessibility tests
npm test -- --testPathPattern=accessibility

# Run tests in watch mode
npm test -- --watch --testPathPattern=modules/emotionArc
```

### Writing Tests

```typescript
// ✅ Good: Comprehensive test structure
describe('EmotionTimelineChart', () => {
  const defaultProps = {
    emotionalBeats: mockEmotionalBeats,
    selectedCharacter: 'all',
    onBeatClick: jest.fn(),
    'aria-label': 'Test chart'
  };

  it('renders without crashing', () => {
    render(<EmotionTimelineChart {...defaultProps} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(<EmotionTimelineChart {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<EmotionTimelineChart {...defaultProps} />);
    const chart = screen.getByRole('region');
    expect(chart).toHaveAttribute('aria-label', 'Test chart');
  });
});
```

### Test Coverage Requirements

- **Minimum Coverage**: 80% for all new code
- **Critical Paths**: 100% coverage for core services
- **Accessibility**: 100% coverage for ARIA compliance
- **Error States**: All error scenarios must be tested

### Testing Best Practices

1. **Use descriptive test names** that explain the behavior
2. **Test one thing per test** for clarity
3. **Use proper mocking** for external dependencies
4. **Test accessibility** with screen reader simulation
5. **Test error states** and edge cases
6. **Use data-testid sparingly** - prefer semantic queries

## ♿ Accessibility Requirements

### WCAG 2.1 AA Compliance

All components must meet WCAG 2.1 AA standards:

```typescript
// ✅ Good: Accessible component
export default function EmotionTimelineChart({ emotionalBeats, ...props }) {
  return (
    <div
      role="region"
      aria-label="Emotional timeline chart"
      aria-live="polite"
    >
      {/* Chart content */}
    </div>
  );
}

// ✅ Good: Keyboard navigation support
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onBeatClick(beat);
  }
};
```

### Accessibility Checklist

- [ ] **Keyboard Navigation**: All interactive elements accessible via keyboard
- [ ] **Screen Reader Support**: Proper ARIA labels and roles
- [ ] **Color Contrast**: Sufficient contrast ratios (4.5:1 minimum)
- [ ] **Focus Management**: Clear focus indicators and logical tab order
- [ ] **Error Handling**: Accessible error messages and recovery
- [ ] **Loading States**: Screen reader announcements for async operations

### Accessibility Testing

```bash
# Run accessibility tests
npm test -- --testPathPattern=accessibility

# Run axe-core tests
npm run test:accessibility

# Manual testing checklist
npm run accessibility:checklist
```

## 🔐 MCP Compliance

### MCP Context Block Requirements

Every file must include a proper MCP Context Block:

```typescript
// MCP Context Block
/*
{
  file: "EmotionTimelineChart.tsx",
  role: "frontend-developer",
  allowedActions: ["scaffold", "visualize", "simulate", "accessibility"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "emotional_modeling"
}
*/

import React from 'react';
// Component implementation...
```

### MCP Registry Updates

When adding new files, update `src/mcpRegistry.ts`:

```typescript
// Add new file entry
"NewComponent.tsx": {
  role: "frontend-developer",
  allowedActions: ['analyze', 'simulate', 'visualize', 'suggest'],
  theme: "emotional_modeling",
  contentSensitivity: "medium",
  tier: "Pro",
  roleMeta: roleMeta.admin
}
```

### MCP Validation

```bash
# Check MCP compliance
npm run mcp:validate

# Update MCP registry
npm run mcp:update
```

## 🌿 Branching Strategy

### Branch Naming Convention

```
feature/emotion-arc-timeline
feature/accessibility-improvements
bugfix/tension-curve-crash
hotfix/security-vulnerability
docs/readme-updates
```

### Branch Types

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: New features and enhancements
- **`bugfix/*`**: Bug fixes and patches
- **`hotfix/*`**: Critical production fixes
- **`docs/*`**: Documentation updates

### Workflow

```bash
# Create feature branch
git checkout -b feature/new-emotion-feature

# Make changes and commit
git add .
git commit -m "feat: add new emotion analysis feature"

# Push and create PR
git push origin feature/new-emotion-feature
```

## 🔄 Pull Request Process

### PR Checklist

- [ ] **Tests Pass**: All tests pass locally and in CI
- [ ] **Code Coverage**: Maintains or improves coverage
- [ ] **Accessibility**: WCAG 2.1 AA compliance verified
- [ ] **MCP Compliance**: Context blocks and registry updated
- [ ] **Documentation**: Updated README and inline docs
- [ ] **TypeScript**: No type errors or `any` types
- [ ] **Linting**: ESLint passes with no warnings
- [ ] **Performance**: No performance regressions

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
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Accessibility tests pass
- [ ] Manual testing completed

## Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Screen reader testing completed
- [ ] Keyboard navigation tested

## MCP Compliance
- [ ] Context blocks added/updated
- [ ] Registry entries updated
- [ ] Role and tier appropriate

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs all tests
2. **Code Review**: At least one maintainer approval required
3. **Accessibility Review**: Accessibility expert review for UI changes
4. **Security Review**: Security review for new dependencies
5. **Final Approval**: Maintainer approval for merge

## 🚀 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Release Steps

```bash
# 1. Update version
npm version patch|minor|major

# 2. Update changelog
npm run changelog:update

# 3. Create release branch
git checkout -b release/v1.2.0

# 4. Final testing
npm test
npm run build
npm run accessibility:test

# 5. Merge to main
git checkout main
git merge release/v1.2.0

# 6. Tag release
git tag v1.2.0
git push origin main --tags

# 7. Create GitHub release
npm run release:create
```

### Release Checklist

- [ ] **Version Updated**: Package.json and changelog
- [ ] **Tests Pass**: All tests pass in CI
- [ ] **Build Successful**: Production build works
- [ ] **Documentation Updated**: README and API docs
- [ ] **Accessibility Verified**: WCAG compliance confirmed
- [ ] **Security Scan**: No vulnerabilities detected
- [ ] **Performance Check**: No regressions detected

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Check linting errors
npm run lint
```

#### Test Failures

```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific failing test
npm test -- --testNamePattern="specific test name"

# Debug test
npm test -- --verbose --no-coverage
```

#### Accessibility Issues

```bash
# Run axe-core tests
npm run test:accessibility

# Check color contrast
npm run accessibility:contrast

# Validate ARIA attributes
npm run accessibility:aria
```

#### MCP Compliance Issues

```bash
# Validate MCP context blocks
npm run mcp:validate

# Update MCP registry
npm run mcp:update

# Check for missing context blocks
npm run mcp:check
```

### Getting Help

1. **Check Documentation**: Review README and this guide
2. **Search Issues**: Look for similar problems
3. **Ask in Discussions**: Use GitHub Discussions for questions
4. **Create Issue**: If no solution found, create detailed issue

## 📞 Contact & Support

### Communication Channels

- **GitHub Issues**: [Bug reports and feature requests](https://github.com/your-org/doccraft-ai/issues)
- **GitHub Discussions**: [Questions and discussions](https://github.com/your-org/doccraft-ai/discussions)
- **Email**: [support@doccraft-ai.com](mailto:support@doccraft-ai.com)
- **Slack**: [Community channel](https://doccraft-ai.slack.com)

### Maintainers

- **Lead Developer**: [@maintainer1](https://github.com/maintainer1)
- **Accessibility Lead**: [@a11y-lead](https://github.com/a11y-lead)
- **QA Lead**: [@qa-lead](https://github.com/qa-lead)

### Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Please read it before contributing.

---

**Thank you for contributing to the Emotional Arc Modeling module! 🎭✨**

*Last updated: January 2024*
*Version: 1.0.0* 