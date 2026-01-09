import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const sentryEnvironment =
	process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || "development";

const nextConfig: NextConfig = {
	/* config options here */
	// Ensure environment variables are available during build
	env: {
		// These will be available at build time if set in the environment
		// Cloudflare Workers should set these as build environment variables
		NEXT_PUBLIC_AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
		NEXT_PUBLIC_AUTH_APP_URL: process.env.NEXT_PUBLIC_AUTH_APP_URL,
		NEXT_PUBLIC_AUTH_REDIRECT_URL: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL,
	},
};

export default withSentryConfig(nextConfig, {
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,
	silent: !process.env.CI,
	widenClientFileUpload: true,
	tunnelRoute: "/monitoring",
	release: {
		name: `auth@${sentryEnvironment}`,
	},
	webpack: {
		automaticVercelMonitors: true,
		treeshake: {
			removeDebugLogging: true,
		},
	},
});

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
