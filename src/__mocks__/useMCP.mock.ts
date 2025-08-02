// Mock for useMCP to avoid import.meta issues in Jest
export const useMCP = jest.fn(() => ({
  isEnabled: false,
  role: 'guest',
  permissions: [],
  context: {},
  updateContext: jest.fn(),
  clearContext: jest.fn(),
})); 