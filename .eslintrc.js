module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Disallow usage of 'any' type - use explicit types instead
    // Use eslint-disable-next-line for justified cases
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
