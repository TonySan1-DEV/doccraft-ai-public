export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
  examples?: Record<string, any>[];
}

export interface OpenAIFormat {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AnthropicFormat {
  type: 'text';
  text: string;
}

export class PromptManager {
  private templates: Map<string, PromptTemplate> = new Map();

  registerTemplate(template: PromptTemplate): void {
    this.templates.set(template.name, template);
  }

  getTemplate(name: string): PromptTemplate | undefined {
    return this.templates.get(name);
  }

  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  renderTemplate(name: string, variables: Record<string, any>): string {
    const template = this.getTemplate(name);
    if (!template) {
      throw new Error(`Template '${name}' not found`);
    }

    let result = template.template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      if (result.includes(placeholder)) {
        result = result.replace(new RegExp(placeholder, 'g'), String(value));
      }
    }

    return result;
  }

  toOpenAIFormat(name: string, variables: Record<string, any>): OpenAIFormat[] {
    const content = this.renderTemplate(name, variables);
    return [
      { role: 'system', content: 'You are a helpful AI assistant.' },
      { role: 'user', content },
    ];
  }

  toAnthropicFormat(
    name: string,
    variables: Record<string, any>
  ): AnthropicFormat {
    const content = this.renderTemplate(name, variables);
    return { type: 'text', text: content };
  }
}

// Built-in templates
export const builtInTemplates: PromptTemplate[] = [
  {
    name: 'code_review',
    description: 'Template for code review requests',
    template:
      'Please review the following code:\n\n```{{language}}\n{{code}}\n```\n\nFocus on: {{focus_areas}}',
    variables: ['language', 'code', 'focus_areas'],
    examples: [
      {
        language: 'typescript',
        code: 'function example() { return true; }',
        focus_areas: 'readability, performance, security',
      },
    ],
  },
  {
    name: 'bug_report',
    description: 'Template for bug reports',
    template:
      '**Bug Description:** {{description}}\n\n**Steps to Reproduce:**\n{{steps}}\n\n**Expected vs Actual:**\nExpected: {{expected}}\nActual: {{actual}}',
    variables: ['description', 'steps', 'expected', 'actual'],
    examples: [
      {
        description: 'Button not responding to clicks',
        steps: '1. Navigate to page\n2. Click button\n3. Observe no action',
        expected: 'Button should perform action',
        actual: 'Nothing happens',
      },
    ],
  },
];

// Default prompt manager instance
export const defaultPromptManager = new PromptManager();

// Register built-in templates
builtInTemplates.forEach(template =>
  defaultPromptManager.registerTemplate(template)
);

// Export default instance
export default defaultPromptManager;
