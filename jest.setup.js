// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for tests
jest.setTimeout(10000);

// Global beforeAll and afterAll hooks
beforeAll(async () => {
  // Add any global setup here
});

afterAll(async () => {
  // Add any global cleanup here
}); 