import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
	// TypeScript + parser
	...tseslint.configs.recommended,

	// Next.js rules (recommended only – core-web-vitals adds rules the codebase wasn't built against)
	{
		plugins: { '@next/next': nextPlugin },
		rules: nextPlugin.configs.recommended.rules,
	},

	// React hooks rules
	{
		plugins: { 'react-hooks': reactHooksPlugin },
		rules: reactHooksPlugin.configs.recommended.rules,
	},

	// Prettier (must be last – disables formatting rules)
	prettierConfig,

	// Project-wide rule overrides
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			// react-hooks v7 introduced set-state-in-effect and immutability; the codebase pre-dates these rules
			'react-hooks/set-state-in-effect': 'warn',
			'react-hooks/immutability': 'warn',
			// Disable no-use-before-define false positives in component files
			'@typescript-eslint/no-use-before-define': 'off',
		},
	},

	// Allow require() in JS config files (jest.config.js etc.)
	{
		files: ['*.js', '*.cjs', '**/*.config.js'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},

	// Ignore generated / build output
	{
		ignores: [
			'.next/**',
			'.claude/**',
			'node_modules/**',
			'prisma/prisma/generated/**',
			'public/**',
		],
	},
);

