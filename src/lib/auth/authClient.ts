"use client";

import { createAuthClient } from "better-auth/client";

import { getAuthCoreBaseUrl } from "./authCoreConfig";

/**
 * Better Auth client instance.
 *
 * Single source of truth for the Better Auth client. All auth operations
 * should use this instance to ensure consistent configuration.
 *
 * The `credentials: "include"` option is critical for cross-origin
 * cookie-based authentication between auth app and auth-svc.
 */
export const authClient = createAuthClient({
	baseURL: getAuthCoreBaseUrl(),
	fetchOptions: {
		credentials: "include",
	},
});

export type AuthClient = typeof authClient;
