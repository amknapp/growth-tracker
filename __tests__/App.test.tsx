/**
 * @format
 */

import App from '../App';

test('App module exports correctly', () => {
  // Test that the App module exports without errors
  expect(App).toBeDefined();
  expect(typeof App).toBe('function');
});
