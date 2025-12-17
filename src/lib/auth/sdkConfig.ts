"use client";

import { createAuthConfig, isAuthConfigured } from "@algenium/auth-next";

import { getAuthCoreBaseUrl } from "./authCoreConfig";

let initialized = false;

/**
 * Initialize the Algenium Auth SDK.
 *
 * Note: This is primarily for the SessionHydrator component from the SDK.
 * Auth actions (signIn, signUp, etc.) now use local implementations that
 * bypass the SDK's config system to avoid code-splitting issues.
 *
 * This function is idempotent - it only initializes once.
 */
export function initAuthSdk() {
	// Only initialize once
	if (initialized || isAuthConfigured()) {
		return;
	}

	// Get the auth service URL from environment
	const authServiceUrl = getAuthCoreBaseUrl();

	// For the auth app, the authAppUrl is the current origin (client)
	// or from environment variable (server-side rendering)
	let authAppUrl: string;
	if (typeof window !== "undefined") {
		authAppUrl = window.location.origin;
	} else {
		const envUrl = process.env.NEXT_PUBLIC_AUTH_APP_URL;
		if (!envUrl) {
			throw new Error(
				"NEXT_PUBLIC_AUTH_APP_URL environment variable is not set. " +
					"Configure it in wrangler.jsonc for Cloudflare Workers deployment.",
			);
		}
		authAppUrl = envUrl;
	}

	createAuthConfig({
		authServiceUrl,
		authAppUrl,
		routes: {
			afterLogin: "/account",
			afterLogout: "/login",
			login: "/login",
			signup: "/signup",
			recover: "/recover",
		},
	});

	initialized = true;
}

// Auto-initialize when this module is loaded (both server and client)
// This ensures SDK is ready before any component tries to use it
initAuthSdk();
