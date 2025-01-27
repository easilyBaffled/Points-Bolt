import config from "eslint-config-standard";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import sortKeysFixPlugin from "eslint-plugin-sort-keys-fix";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	// ...[].concat(config),
	{
		plugins: {
			"unused-imports": unusedImportsPlugin,
			"sort-keys-fix": sortKeysFixPlugin,
		},
		rules: {
			"unused-imports/no-unused-imports": "error",
			"unused-imports/no-unused-vars": [
				"warn",
				{ vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
			],
		},
	},
];
