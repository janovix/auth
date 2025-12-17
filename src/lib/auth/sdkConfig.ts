"use client";

import { createAuthConfig, isAuthConfigured } from "@algenium/auth-next";

import { getAuthCoreBaseUrl } from "./authCoreConfig";

let initialized = false;

/**
 * Initialize the Algenium Auth SDK.
 *
 * Since this IS the auth app, both authServiceUrl and authAppUrl
 * can be derived from the same environment configuration.
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

	initialized = true;
}

// Auto-initialize when this module is loaded on the client
if (typeof window !== "undefined") {
	initAuthSdk();
}
