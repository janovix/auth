/**
 * semantic-release configuration for @janovix/auth-ui package
 *
 * Uses semantic-release-monorepo to filter commits by path
 * Only commits affecting packages/ui/ will trigger a release
 *
 * - main: stable releases (e.g. 1.2.3)
 * - dev: prerelease channel "rc" (e.g. 1.2.4-rc.1) + GitHub prerelease
 */
module.exports = {
	branches: [
		"main",
		{
			name: "dev",
			channel: "rc",
			prerelease: "rc",
		},
	],
	tagFormat: "ui-v${version}",
	extends: "semantic-release-monorepo",
	plugins: [
		[
			"@semantic-release/commit-analyzer",
			{
				releaseRules: [
					{ type: "feat", release: "minor" },
					{ type: "fix", release: "patch" },
					{ type: "perf", release: "patch" },
					{ type: "refactor", release: "patch" },
				],
			},
		],
		"@semantic-release/release-notes-generator",
		[
			"@semantic-release/changelog",
			{
				changelogFile: "CHANGELOG.md",
			},
		],
		[
			"@semantic-release/npm",
			{
				npmPublish: true,
			},
		],
		[
			"@semantic-release/github",
			{
				releasedLabels: ["released"],
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["CHANGELOG.md", "package.json"],
				message:
					"chore(release): @janovix/auth-ui v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
			},
		],
	],
};
