// Mock for imageFetcher to avoid import.meta issues in Jest
export const fetchImage = jest.fn(() => Promise.resolve({
  url: 'https://example.com/mock-image.jpg',
  alt: 'Mock image',
}));

export const imageFetcher = {
  fetchImage,
}; 