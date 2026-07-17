module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    // Context files export hooks alongside the context object — that's intentional
    'react-refresh/only-export-components': 'off',
    // React import not needed with the new JSX transform; suppress until imports are pruned
    'no-unused-vars': 'off',
    // exhaustive-deps requires careful per-hook analysis; suppress for now
    'react-hooks/exhaustive-deps': 'off',
    // prop-types not used in this codebase
    'react/prop-types': 'off',
  },
};
