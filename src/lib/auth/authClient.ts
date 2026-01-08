"use client";

import { createAuthClient } from "better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";

import { getAuthCoreBaseUrl } from "./authCoreConfig";

/**
 * Better Auth client instance.
 *
 * Single source of truth for the Better Auth client. All auth operations
 * should use this instance to ensure consistent configuration.
 *
 * The `credentials: "include"` option is critical for cross-origin
 * cookie-based authentication between auth app and auth-svc.
 *
 * Plugins:
 * - emailOTPClient: Enables OTP-based email verification instead of link-based,
 *   preserving the user's flow and redirectTo parameters during signup.
 */
export const authClient = createAuthClient({
	baseURL: getAuthCoreBaseUrl(),
	fetchOptions: {
		credentials: "include",
	},
	plugins: [emailOTPClient()],
});

export type AuthClient = typeof authClient;
