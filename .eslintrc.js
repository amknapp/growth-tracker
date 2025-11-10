module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // TypeScript-specific rules
    '@typescript-eslint/no-explicit-any': 'error', // Disallow 'any' type
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_', // Allow unused vars that start with _
      varsIgnorePattern: '^_',
    }],

    // General code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Warn on console.log, allow warn/error
    'no-debugger': 'error', // Disallow debugger statements
    'no-alert': 'error', // Disallow alert/confirm/prompt (use Alert from RN)
    'prefer-const': 'error', // Prefer const over let when not reassigned
    'no-var': 'error', // Disallow var, use let/const
    'eqeqeq': ['error', 'always'], // Require === and !== (no == or !=)
    'curly': ['error', 'all'], // Require curly braces for all control statements
    'no-duplicate-imports': 'error', // Disallow duplicate imports

    // React/React Native specific
    'react-hooks/rules-of-hooks': 'error', // Enforce hooks rules
    'react-hooks/exhaustive-deps': 'warn', // Warn about missing dependencies
    'react/jsx-no-bind': 'off', // Allow inline functions (React Native performance is different)
    'react/no-unstable-nested-components': ['warn', { allowAsProps: true }], // Warn about nested components
    'react/self-closing-comp': 'warn', // Require self-closing for components without children

    // Import organization
    'sort-imports': ['warn', {
      ignoreCase: true,
      ignoreDeclarationSort: true, // Don't sort import declarations
      ignoreMemberSort: false, // Sort named imports alphabetically
    }],
  },
};
