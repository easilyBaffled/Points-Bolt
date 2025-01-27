import globals from "globals";
import pluginJs from "@eslint/js";
import unusedImports from "eslint-plugin-unused-imports";
import sortKeysFix from "eslint-plugin-sort-keys-fix";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	{
		files: ["**/*.js", "**/*.jsx"], // Specify file types to apply this configuration
		languageOptions: {
			globals: globals.browser,
		},
		plugins: {
			"unused-imports": unusedImports,
			"sort-keys-fix": sortKeysFix,
		},
		rules: {
			"unused-imports/no-unused-imports": "error"
		},
	},
	pluginJs.configs.recommended,
];
