// Mock for CopilotEngine to avoid missing module issues in Jest
export const copilotEngine = {
  enable: jest.fn(),
  disable: jest.fn(),
  isEnabled: false,
  status: 'disabled',
}; 