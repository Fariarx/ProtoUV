module.exports = {
	'settings': {
		'react': {
			'version': 'detect'
		}
	},
	'env': {
		'browser': true,
		'node': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended'
	],
	'ignorePatterns': ['node_modules/**/*.*', 'Shared/Contracts.ts'],
	'parser': '@typescript-eslint/parser',
	'plugins': [
		'@typescript-eslint',
		'import'
	],
	'rules': {
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/naming-convention': [
			'error',
			{
				'selector': 'typeLike',
				'format': ['PascalCase']
			},
			{
				'selector': 'interface',
				'format': ['PascalCase'],
				'custom': {
					'regex': '^I[A-Z]',
					'match': false
				}
			}
		],
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-use-before-define': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'react/prop-types': 'off',
		'func-style': ['error', 'expression'],
		'@typescript-eslint/member-delimiter-style': [
			'error',
			{
				'multiline': {
					'delimiter': 'semi',
					'requireLast': true
				},
				'singleline': {
					'delimiter': 'comma',
					'requireLast': false
				}
			}
		],
		'@typescript-eslint/quotes': [
			'error',
			'single'
		],
		'@typescript-eslint/semi': [
			'error',
			'always'
		],
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'curly': 'error',
		'eqeqeq': [
			'error',
			'always'
		],
		'indent': [
			'error',
			'tab',
			{
				'SwitchCase': 1
			}
		],
		'import/no-default-export': 'error',
		'import/order': ['error', {
			'groups': [
				['external', 'builtin'],
				['internal', 'index', 'sibling', 'parent']
			],
			'alphabetize': {
				'order': 'asc', /* sort in ascending order. Options: ["ignore", "asc", "desc"] */
				'caseInsensitive': true /* ignore case. Options: [true, false] */
			}
		}],
		'sort-imports': ['error', { 'ignoreDeclarationSort': true }],
		'linebreak-style': [
			'error', 'unix'
		],
		'no-multiple-empty-lines': ['error', { 'max': 1, 'maxBOF': 1 }],
		'no-bitwise': ['off'],
		'object-curly-spacing': ['error', 'always'],
		'no-debugger': 'error',
		'no-redeclare': 'error',
		'no-trailing-spaces': 'error',
		'no-unused-expressions': 'error',
		'no-var': 'error',
		'prefer-const': 'error',
		'react/display-name': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/react-in-tsx-scope': 'off',
	}
};
