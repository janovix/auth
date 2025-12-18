import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	// Ensure environment variables are available during build
	env: {
		// These will be available at build time if set in the environment
		// Cloudflare Workers should set these as build environment variables
		NEXT_PUBLIC_AUTH_CORE_BASE_URL: process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL,
		NEXT_PUBLIC_AUTH_APP_URL: process.env.NEXT_PUBLIC_AUTH_APP_URL,
		NEXT_PUBLIC_AUTH_REDIRECT_URL: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL,
	},
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
