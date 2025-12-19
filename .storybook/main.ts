import type { StorybookConfig } from "@storybook/nextjs";
import { fileURLToPath } from "url";
import path from "path";
import webpack from "webpack";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set default environment variables for Storybook builds (must include https://)
const defaultAuthCoreBaseUrl = "https://auth-svc.example.workers.dev";
const defaultAuthAppUrl = "https://auth.example.workers.dev";
const defaultAuthRedirectUrl = "https://app.example.workers.dev";
if (!process.env.NEXT_PUBLIC_AUTH_SERVICE_URL) {
	process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = defaultAuthCoreBaseUrl;
}
if (!process.env.NEXT_PUBLIC_AUTH_APP_URL) {
	process.env.NEXT_PUBLIC_AUTH_APP_URL = defaultAuthAppUrl;
}
if (!process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL) {
	process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL = defaultAuthRedirectUrl;
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
				"process.env.NEXT_PUBLIC_AUTH_SERVICE_URL": JSON.stringify(
					process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || defaultAuthCoreBaseUrl,
				),
				"process.env.NEXT_PUBLIC_AUTH_APP_URL": JSON.stringify(
					process.env.NEXT_PUBLIC_AUTH_APP_URL || defaultAuthAppUrl,
				),
				"process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL": JSON.stringify(
					process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || defaultAuthRedirectUrl,
				),
			}),
		);

		// Mock next/navigation to prevent router errors in Storybook
		config.resolve = config.resolve || {};
		config.resolve.alias = {
			...config.resolve.alias,
			"next/navigation": path.resolve(__dirname, "./mockNextNavigation.ts"),
		};

		return config;
	},
};

export default config;
