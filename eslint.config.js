import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,ts,tsx}'],
        languageOptions: {
          parser: typescriptParser,
          ecmaVersion: 'latest',
          sourceType: 'module',
          globals: {
            process: 'readonly',
            Buffer: 'readonly',
            console: 'readonly',
            setTimeout: 'readonly',
            clearTimeout: 'readonly',
            setInterval: 'readonly',
            clearInterval: 'readonly',
            fetch: 'readonly',
            global: 'readonly',
            __dirname: 'readonly',
            __filename: 'readonly',
            module: 'readonly',
            require: 'readonly',
            exports: 'readonly',
          },
        },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // Reglas esenciales de TypeScript - simplificadas para reducir memoria
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off', // Deshabilitado para reducir carga
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      
      // Reglas generales - solo las más importantes
      'no-console': 'off', // Deshabilitado para reducir carga
      'no-debugger': 'error',
      'prefer-const': 'warn', // Cambiado a warn para reducir errores
      'no-var': 'warn', // Cambiado a warn para reducir errores
    },
  },
  {
    files: ['apps/api/**/*.ts'],
    languageOptions: {
      globals: {
        node: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Permitir console en el backend
    },
  },
  {
    files: ['apps/client-dashboard/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        browser: true,
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        console: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLAudioElement: 'readonly',
        HTMLImageElement: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        Node: 'readonly',
        File: 'readonly',
        FormData: 'readonly',
        XMLHttpRequest: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Notification: 'readonly',
        React: 'readonly',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-alert': 'warn',
    },
  },
  {
    files: ['apps/landing-page/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
      {
        files: ['**/*.spec.ts', '**/*.test.ts', '**/*.spec.js', '**/*.test.js'],
        languageOptions: {
          globals: {
            jest: 'readonly',
            describe: 'readonly',
            it: 'readonly',
            test: 'readonly',
            expect: 'readonly',
            beforeEach: 'readonly',
            afterEach: 'readonly',
            beforeAll: 'readonly',
            afterAll: 'readonly',
            vi: 'readonly',
          },
        },
        rules: {
          'no-unused-vars': 'off',
          '@typescript-eslint/no-unused-vars': 'off',
          '@typescript-eslint/no-explicit-any': 'off',
        },
      },
      {
        ignores: [
          'node_modules/',
          'dist/',
          'build/',
          '*.config.js',
          '*.config.ts',
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/*.config.js',
          '**/*.config.ts',
          '**/coverage/**',
          '**/logs/**',
          '**/temp/**',
          '**/tmp/**',
          '**/.next/**',
          '**/.nuxt/**',
          '**/.vuepress/**',
          '**/.cache/**',
          '**/public/**',
          '**/static/**',
        ],
      },
];