/**
 * Gets the auth service URL from environment variables.
 *
 * For Cloudflare Workers deployment, configure NEXT_PUBLIC_AUTH_SERVICE_URL
 * in your environment. This variable is available on both client and server.
 *
 * URLs MUST include the protocol (https://)
 *
 * @returns The base URL for the auth service (e.g., https://auth-svc.example.workers.dev)
 */
export const getAuthCoreBaseUrl = (): string => {
	const baseUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

	if (!baseUrl) {
		throw new Error(
			"NEXT_PUBLIC_AUTH_SERVICE_URL environment variable is not set. " +
				"Configure it with the full URL including https://",
		);
	}

	// Validate that the URL includes the protocol
	if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
		throw new Error(
			`NEXT_PUBLIC_AUTH_SERVICE_URL must include the protocol (https://). Got: "${baseUrl}"`,
		);
	}

	return baseUrl;
};

/**
 * Derives the environment name from the auth service URL for display purposes.
 * @returns "dev" or "prod" based on the URL pattern
 */
export const getAuthEnvironment = (): "dev" | "prod" => {
	const baseUrl = getAuthCoreBaseUrl();
	if (baseUrl.includes(".janovix.com")) {
		return "prod";
	}
	return "dev";
};

/**
 * Gets the AML app URL from environment variables.
 * @returns The base URL for the AML app (e.g., https://aml.janovix.workers.dev)
 */
export const getAmlAppUrl = (): string => {
	return (
		process.env.NEXT_PUBLIC_AML_APP_URL || "https://aml.janovix.workers.dev"
	);
};

/**
 * Gets the Watchlist app URL from environment variables.
 * @returns The base URL for the Watchlist app (e.g., https://watchlist.janovix.workers.dev)
 */
export const getWatchlistAppUrl = (): string => {
	return (
		process.env.NEXT_PUBLIC_WATCHLIST_APP_URL ||
		"https://watchlist.janovix.workers.dev"
	);
};

/**
 * Gets the Homepage URL for the marketing site.
 * @returns The base URL for the Janovix homepage (e.g., https://www.janovix.com)
 */
export const getHomepageUrl = (): string => {
	return process.env.NEXT_PUBLIC_HOMEPAGE_URL || "https://www.janovix.com";
};

/**
 * Gets the Settings app URL from environment variables.
 * @returns The base URL for the Settings app (e.g., https://settings.janovix.workers.dev)
 */
export const getSettingsAppUrl = (): string => {
	return (
		process.env.NEXT_PUBLIC_SETTINGS_APP_URL ||
		"https://settings.janovix.workers.dev"
	);
};
