// Mock for yjsProvider to avoid import.meta issues in Jest
export const createYjsProvider = jest.fn(() => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  isConnected: false,
}));

export const yjsProvider = {
  createYjsProvider,
}; 