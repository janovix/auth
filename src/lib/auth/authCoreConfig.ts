/**
 * Gets the auth core base URL from environment variables.
 *
 * For Cloudflare Workers deployment, configure in wrangler.jsonc:
 * - NEXT_PUBLIC_AUTH_CORE_BASE_URL: Used by client-side code (build-time, inlined)
 * - AUTH_CORE_BASE_URL: Used by server-side code (runtime)
 *
 * URLs MUST include the protocol (https://)
 *
 * @returns The base URL for the auth core service (e.g., https://auth-svc.janovix.workers.dev)
 */
export const getAuthCoreBaseUrl = (): string => {
	// For client-side, use NEXT_PUBLIC_ prefix (build-time variable)
	// For server-side, use the regular env var (runtime variable)
	// During build, try both as Next.js may not distinguish properly
	const baseUrl =
		process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL ||
		process.env.AUTH_CORE_BASE_URL;

	if (!baseUrl) {
		throw new Error(
			"AUTH_CORE_BASE_URL or NEXT_PUBLIC_AUTH_CORE_BASE_URL environment variable is not set. " +
				"Configure it in wrangler.jsonc with the full URL including https://",
		);
	}

	// Validate that the URL includes the protocol
	if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
		throw new Error(
			`AUTH_CORE_BASE_URL must include the protocol (https://). Got: "${baseUrl}"`,
		);
	}

	return baseUrl;
};

/**
 * Derives the environment name from the auth core base URL for display purposes.
 * @returns "dev" or "prod" based on the URL pattern
 */
export const getAuthEnvironment = (): "dev" | "prod" => {
	const baseUrl = getAuthCoreBaseUrl();
	if (baseUrl.includes(".janovix.ai")) {
		return "prod";
	}
	return "dev";
};
