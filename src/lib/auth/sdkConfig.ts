"use client";

import { createAuthConfig } from "@algenium/auth-next";

import { getAuthCoreBaseUrl } from "./authCoreConfig";

/**
 * Initialize the Algenium Auth SDK.
 *
 * Since this IS the auth app, both authServiceUrl and authAppUrl
 * can be derived from the same environment configuration.
 */
export function initAuthSdk() {
	// Get the auth service URL from environment
	const authServiceUrl = getAuthCoreBaseUrl();

	// For the auth app, the authAppUrl is the current origin
	// This is used for password recovery redirects, etc.
	const authAppUrl =
		typeof window !== "undefined"
			? window.location.origin
			: process.env.NEXT_PUBLIC_AUTH_APP_URL || authServiceUrl;

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
}
