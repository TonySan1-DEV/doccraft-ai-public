import { describe, it, expect, beforeEach } from 'vitest';
import { PromptManager, PromptTemplate, builtInTemplates } from '../src/index';

describe('PromptManager', () => {
  let manager: PromptManager;

  beforeEach(() => {
    manager = new PromptManager();
  });

  describe('Template Registration', () => {
    it('should register a template', () => {
      const template: PromptTemplate = {
        name: 'test',
        description: 'Test template',
        template: 'Hello {{name}}',
        variables: ['name'],
      };

      manager.registerTemplate(template);
      expect(manager.getTemplate('test')).toEqual(template);
    });

    it('should list registered templates', () => {
      const template1: PromptTemplate = {
        name: 'test1',
        description: 'Test template 1',
        template: 'Hello {{name}}',
        variables: ['name'],
      };

      const template2: PromptTemplate = {
        name: 'test2',
        description: 'Test template 2',
        template: 'Goodbye {{name}}',
        variables: ['name'],
      };

      manager.registerTemplate(template1);
      manager.registerTemplate(template2);

      const templates = manager.listTemplates();
      expect(templates).toContain('test1');
      expect(templates).toContain('test2');
      expect(templates).toHaveLength(2);
    });
  });

  describe('Template Rendering', () => {
    it('should render template with variables', () => {
      const template: PromptTemplate = {
        name: 'greeting',
        description: 'Greeting template',
        template: 'Hello {{name}}, welcome to {{place}}!',
        variables: ['name', 'place'],
      };

      manager.registerTemplate(template);
      const result = manager.renderTemplate('greeting', {
        name: 'Alice',
        place: 'DocCraft AI',
      });

      expect(result).toBe('Hello Alice, welcome to DocCraft AI!');
    });

    it('should handle missing template gracefully', () => {
      expect(() => {
        manager.renderTemplate('nonexistent', {});
      }).toThrow("Template 'nonexistent' not found");
    });

    it('should handle missing variables gracefully', () => {
      const template: PromptTemplate = {
        name: 'partial',
        description: 'Partial template',
        template: 'Hello {{name}}, you have {{count}} messages',
        variables: ['name', 'count'],
      };

      manager.registerTemplate(template);
      const result = manager.renderTemplate('partial', { name: 'Bob' });

      // Missing variables should remain as placeholders
      expect(result).toBe('Hello Bob, you have {{count}} messages');
    });
  });

  describe('OpenAI Format', () => {
    it('should convert to OpenAI format', () => {
      const template: PromptTemplate = {
        name: 'openai_test',
        description: 'OpenAI format test',
        template: 'Analyze this code: {{code}}',
        variables: ['code'],
      };

      manager.registerTemplate(template);
      const openaiFormat = manager.toOpenAIFormat('openai_test', {
        code: 'function test() { return true; }',
      });

      expect(openaiFormat).toHaveLength(2);
      expect(openaiFormat[0]).toEqual({
        role: 'system',
        content: 'You are a helpful AI assistant.',
      });
      expect(openaiFormat[1]).toEqual({
        role: 'user',
        content: 'Analyze this code: function test() { return true; }',
      });
    });
  });

  describe('Anthropic Format', () => {
    it('should convert to Anthropic format', () => {
      const template: PromptTemplate = {
        name: 'anthropic_test',
        description: 'Anthropic format test',
        template: 'Review this: {{content}}',
        variables: ['content'],
      };

      manager.registerTemplate(template);
      const anthropicFormat = manager.toAnthropicFormat('anthropic_test', {
        content: 'sample content',
      });

      expect(anthropicFormat).toEqual({
        type: 'text',
        text: 'Review this: sample content',
      });
    });
  });

  describe('Built-in Templates', () => {
    it('should have built-in templates', () => {
      expect(builtInTemplates).toHaveLength(2);

      const codeReview = builtInTemplates.find(t => t.name === 'code_review');
      expect(codeReview).toBeDefined();
      expect(codeReview?.variables).toContain('language');
      expect(codeReview?.variables).toContain('code');
      expect(codeReview?.variables).toContain('focus_areas');

      const bugReport = builtInTemplates.find(t => t.name === 'bug_report');
      expect(bugReport).toBeDefined();
      expect(bugReport?.variables).toContain('description');
      expect(bugReport?.variables).toContain('steps');
      expect(bugReport?.variables).toContain('expected');
      expect(bugReport?.variables).toContain('actual');
    });

    it('should have examples for built-in templates', () => {
      const codeReview = builtInTemplates.find(t => t.name === 'code_review');
      expect(codeReview?.examples).toBeDefined();
      expect(codeReview?.examples).toHaveLength(1);
      expect(codeReview?.examples?.[0].language).toBe('typescript');

      const bugReport = builtInTemplates.find(t => t.name === 'bug_report');
      expect(bugReport?.examples).toBeDefined();
      expect(bugReport?.examples).toHaveLength(1);
      expect(bugReport?.examples?.[0].description).toBe(
        'Button not responding to clicks'
      );
    });
  });
});
