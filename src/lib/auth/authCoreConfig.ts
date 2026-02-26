import { requireEnv } from "@/lib/env";

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
	const baseUrl = requireEnv(
		"NEXT_PUBLIC_AUTH_SERVICE_URL",
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
	);

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
 * @returns The base URL for the AML app (e.g., https://aml.janovix.com)
 */
export const getAmlAppUrl = (): string => {
	return requireEnv(
		"NEXT_PUBLIC_AML_APP_URL",
		process.env.NEXT_PUBLIC_AML_APP_URL,
	);
};

/**
 * Gets the Watchlist app URL from environment variables.
 * @returns The base URL for the Watchlist app (e.g., https://watchlist.janovix.com)
 */
export const getWatchlistAppUrl = (): string => {
	return requireEnv(
		"NEXT_PUBLIC_WATCHLIST_APP_URL",
		process.env.NEXT_PUBLIC_WATCHLIST_APP_URL,
	);
};

/**
 * Gets the Homepage URL for the marketing site.
 * @returns The base URL for the Janovix homepage (e.g., https://www.janovix.com)
 */
export const getHomepageUrl = (): string => {
	return requireEnv(
		"NEXT_PUBLIC_HOMEPAGE_URL",
		process.env.NEXT_PUBLIC_HOMEPAGE_URL,
	);
};

/**
 * Gets the Notifications service URL from environment variables.
 * @returns The base URL for the Notifications service (e.g., https://notifications-svc.janovix.com)
 */
export const getNotificationsServiceUrl = (): string => {
	return requireEnv(
		"NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL",
		process.env.NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL,
	);
};
