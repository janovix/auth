import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const sentryEnvironment =
	process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || "development";

const nextConfig: NextConfig = {
	/* config options here */
	// `xr-spatial-tracking` is omitted: Chromium may still log a "[Violation] … xr-spatial-tracking"
	// for Cloudflare Turnstile's *cross-origin* iframe; that is controlled by their document, not ours.
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "Permissions-Policy",
						value: [
							"camera=()",
							"microphone=()",
							"geolocation=()",
							"usb=()",
							"magnetometer=()",
							"gyroscope=()",
							"accelerometer=()",
						].join(", "),
					},
				],
			},
		];
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
