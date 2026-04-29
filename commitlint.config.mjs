/** @type {import('@commitlint/types').UserConfig} */
export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"header-max-length": [2, "always", 72],
		"scope-case": [2, "always", "lower-case"],
		"subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
		"subject-empty": [2, "never"],
		"subject-full-stop": [2, "never", "."],
		"type-enum": [
			2,
			"always",
			["feat", "fix", "refactor", "test", "docs", "style", "chore", "perf", "ci", "revert"],
		],
	},
};