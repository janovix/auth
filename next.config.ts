import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const sentryEnvironment =
	process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || "development";

const nextConfig: NextConfig = {
	/* config options here */
	// Delegate `xr-spatial-tracking` to Cloudflare Turnstile's iframe origin so Chrome does not log
	// a Permissions-Policy violation when their frame requests it via `allow="xr-spatial-tracking …"`.
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
							// Explicitly delegate xr-spatial-tracking to Cloudflare Turnstile's iframe origin
							// so Chrome does not log a Permissions-Policy violation for its cross-origin frame.
							// WebXR is still denied everywhere else.
							'xr-spatial-tracking=(self "https://challenges.cloudflare.com")',
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
