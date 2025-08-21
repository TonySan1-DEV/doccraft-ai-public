# DocCraft-AI v3 MCP Rules & AI Behavior Guidelines

## 🎯 **Core Principles**

### **Context-Aware Development**

- **ALWAYS** reference `@mcpRegistry.ts` when generating code
- **NEVER** modify files without checking their role and allowed actions
- **ALWAYS** respect file complexity levels (low/medium/high)
- **USE** `useMCP("filename")` to inject file-specific context

### **Role-Based Permissions**

- Each file has a specific role and allowed actions
- Check permissions before suggesting modifications
- Follow the file's intended purpose and architecture
- Respect dependencies and related file relationships

## 🚫 **Forbidden Actions**

### **High-Risk Operations**

- Modifying core architecture files without understanding dependencies
- Changing database schemas without migration planning
- Altering CI/CD pipelines without testing
- Modifying authentication/security components without review

### **Context Violations**

- Ignoring file roles and permissions
- Modifying files outside their intended scope
- Breaking established patterns and conventions
- Disregarding related file relationships

## ✅ **Required Actions**

### **Before Any Code Generation**

1. **Identify the target file** and its role
2. **Check allowed actions** using MCP registry
3. **Review dependencies** and related files
4. **Understand complexity level** and adjust approach
5. **Follow AI guidance** specific to the file

### **Code Generation Standards**

- Use TypeScript strict mode
- Maintain existing code patterns
- Include proper error handling
- Add comprehensive tests
- Follow project naming conventions

## 🔧 **MCP Integration Patterns**

### **Using MCP Registry**

```typescript
// ✅ CORRECT: Use MCP context
const mcp = useMCP('src/pages/Home.tsx');
if (mcp.canPerformAction('src/pages/Home.tsx', 'add-features')) {
  // Safe to add features
}

// ❌ INCORRECT: Ignore MCP context
// Directly modify files without checking permissions
```

### **File-Specific Context**

```typescript
// ✅ CORRECT: Get file-specific guidance
const mcp = useFileMCP('src/modules/ai/ContextualPrompting.ts');
const guidance = mcp.currentGuidance;
const actions = mcp.currentActions;

// ❌ INCORRECT: Generic modifications
// Apply same pattern to all files regardless of role
```

## 📋 **File Role Examples**

### **Application Root (src/App.tsx)**

- **Role**: Main application container
- **Allowed**: Layout modifications, route additions
- **Forbidden**: Business logic, component implementations
- **AI Guidance**: "This is the main entry point. Modify routing and layout structure here."

### **Document Editor (src/pages/DocumentEditor.tsx)**

- **Role**: Core editing interface
- **Allowed**: Editor enhancements, AI feature integration
- **Forbidden**: Core architecture changes, unrelated features
- **AI Guidance**: "Core editing interface. Integrate new AI features and improve UX here."

### **AI Module (src/modules/ai/index.ts)**

- **Role**: AI services entry point
- **Allowed**: New AI services, prompt strategies
- **Forbidden**: UI components, database schemas
- **AI Guidance**: "AI module entry point. Add new AI services and prompt strategies here."

## 🎨 **Code Generation Templates**

### **Component Creation**

```typescript
// ✅ Use MCP context for component creation
const mcp = useMCP("src/components/NewFeature.tsx");
const projectContext = mcp.getProjectContext();

// Follow project guidelines
const NewFeature: React.FC = () => {
  // Implementation following project patterns
  return (
    <div className="new-feature">
      {/* Content following project conventions */}
    </div>
  );
};

export default NewFeature;
```

### **Service Integration**

```typescript
// ✅ Use MCP context for service integration
const mcp = useMCP('src/modules/ai/NewAIService.ts');
const allowedActions = mcp.getAllowedActions('src/modules/ai/NewAIService.ts');

if (mcp.canPerformAction('src/modules/ai/NewAIService.ts', 'add-ai-services')) {
  // Safe to implement new AI service
}
```

## 🔍 **Context Validation**

### **Action Validation**

```typescript
// ✅ Validate actions before execution
const mcp = useMCP();
const validation = mcp.validateAction('src/pages/Home.tsx', 'add-features');

if (validation.allowed) {
  // Proceed with action
} else {
  console.warn(`Action not allowed: ${validation.reason}`);
  console.log(`Suggested actions: ${validation.suggestions?.join(', ')}`);
}
```

### **File Relationship Analysis**

```typescript
// ✅ Analyze file relationships
const mcp = useMCP('src/pages/Home.tsx');
const relatedFiles = mcp.getRelatedFiles('src/pages/Home.tsx');
const dependencies = mcp.getFileDependencies('src/pages/Home.tsx');

// Consider impact on related files before modifications
```

## 📚 **Best Practices**

### **Development Workflow**

1. **Start with MCP context**: Understand file role and permissions
2. **Plan modifications**: Consider dependencies and relationships
3. **Follow patterns**: Use existing code structure and conventions
4. **Test thoroughly**: Ensure changes don't break related functionality
5. **Document changes**: Update relevant documentation and comments

### **AI Assistance**

1. **Ask for context**: Request MCP information before making changes
2. **Follow guidance**: Use file-specific AI guidance for direction
3. **Respect complexity**: Adjust approach based on file complexity level
4. **Maintain consistency**: Follow established patterns and conventions

## 🚨 **Error Handling**

### **MCP Context Errors**

```typescript
// ✅ Handle missing MCP context gracefully
const mcp = useMCP('unknown/file.ts');
const context = mcp.getFileContext('unknown/file.ts');

if (!context) {
  console.warn('File not found in MCP registry. Proceed with caution.');
  // Use default behavior or request clarification
}
```

### **Permission Violations**

```typescript
// ✅ Handle permission violations
const mcp = useMCP();
if (!mcp.canPerformAction('src/App.tsx', 'modify-core')) {
  throw new Error('Insufficient permissions to modify core application file');
}
```

## 📖 **Documentation Requirements**

### **Code Comments**

- Include MCP context references in complex functions
- Document file role and purpose
- Explain relationships with other files
- Note complexity level and considerations

### **Change Documentation**

- Document MCP context used for modifications
- Explain permission validation
- Note impact on related files
- Include testing considerations

## 🔄 **Continuous Improvement**

### **MCP Registry Updates**

- Keep file contexts current with codebase changes
- Update roles and permissions as architecture evolves
- Add new files to registry with appropriate contexts
- Refine AI guidance based on usage patterns

### **Rule Evolution**

- Update rules based on development experience
- Refine permission structures for better security
- Enhance AI guidance for improved assistance
- Optimize context relationships for efficiency

---

## 🎯 **Quick Reference Commands**

### **For AI Assistants**

- `@mcpRegistry.ts` - Reference MCP registry
- `useMCP("filename")` - Get file-specific context
- `canPerformAction(file, action)` - Check permissions
- `getAIGuidance(file)` - Get file-specific guidance

### **For Developers**

- Always check MCP context before modifications
- Follow file roles and permissions
- Use established patterns and conventions
- Test changes thoroughly
- Document modifications with context

---

_This document ensures AI tools like ChatGPT work effectively with the DocCraft-AI codebase while maintaining security, consistency, and architectural integrity._
