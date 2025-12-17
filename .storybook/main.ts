import type { StorybookConfig } from "@storybook/nextjs";
import webpack from "webpack";

// Set default environment variables for Storybook builds
const defaultAuthCoreBaseUrl = "auth-svc.janovix.workers.dev";
if (!process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL) {
	process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL = defaultAuthCoreBaseUrl;
}
if (!process.env.AUTH_CORE_BASE_URL) {
	process.env.AUTH_CORE_BASE_URL = defaultAuthCoreBaseUrl;
}

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
	addons: ["@storybook/addon-links", "@storybook/addon-a11y"],
	framework: {
		name: "@storybook/nextjs",
		options: {
			nextConfigPath: "../next.config.ts",
		},
	},
	docs: {
		autodocs: "tag",
	},
	webpackFinal: async (config) => {
		// Ensure environment variables are available at build time
		config.plugins = config.plugins || [];
		config.plugins.push(
			new webpack.DefinePlugin({
				"process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL": JSON.stringify(
					process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL || defaultAuthCoreBaseUrl,
				),
				"process.env.AUTH_CORE_BASE_URL": JSON.stringify(
					process.env.AUTH_CORE_BASE_URL || defaultAuthCoreBaseUrl,
				),
			}),
		);
		return config;
	},
};

export default config;
