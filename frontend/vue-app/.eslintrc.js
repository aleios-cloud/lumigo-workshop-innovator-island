module.exports = {
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  settings: {
    vue: { version: 'detect' },
    'import/resolver': {
      typescript: {
        project: __dirname,
      },
    },
  },
  parserOptions: {
    parser: 'babel-eslint',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
};
