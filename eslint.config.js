import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';

export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['**/src-tauri/**'],
							message:
								'Frontend code must not import from src-tauri/. Use a service in your feature folder to wrap Tauri commands.'
						}
					]
				}
			]
		}
	},
	{
		ignores: ['.svelte-kit/**', 'build/**', 'node_modules/**', 'src-tauri/**']
	}
];
