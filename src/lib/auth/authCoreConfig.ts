/**
 * Gets the auth core base URL from environment variables.
 * This should be set in wrangler.jsonc as NEXT_PUBLIC_AUTH_CORE_BASE_URL
 * for client-side access, or AUTH_CORE_BASE_URL for server-side.
 *
 * @returns The base URL for the auth core service (e.g., https://auth-svc.janovix.workers.dev)
 */
export const getAuthCoreBaseUrl = (): string => {
	// For client-side, use NEXT_PUBLIC_ prefix
	// For server-side, use the regular env var
	const baseUrl =
		typeof window !== "undefined"
			? process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL
			: process.env.AUTH_CORE_BASE_URL;

	if (!baseUrl) {
		throw new Error(
			"AUTH_CORE_BASE_URL or NEXT_PUBLIC_AUTH_CORE_BASE_URL environment variable is not set. Please configure it in wrangler.jsonc",
		);
	}

	// Ensure the URL includes the protocol
	if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
		return baseUrl;
	}

	return `https://${baseUrl}`;
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
