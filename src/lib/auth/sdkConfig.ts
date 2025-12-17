"use client";

import { createAuthConfig, isAuthConfigured } from "@algenium/auth-next";

let initialized = false;

// DEBUG: Hardcoded values to isolate environment variable issues
const HARDCODED_AUTH_SERVICE_URL = "https://auth-svc.janovix.workers.dev";
const HARDCODED_AUTH_APP_URL = "https://auth.janovix.workers.dev";

/**
 * Initialize the Algenium Auth SDK.
 *
 * Since this IS the auth app, both authServiceUrl and authAppUrl
 * can be derived from the same environment configuration.
 *
 * This function is idempotent - it only initializes once.
 */
export function initAuthSdk() {
	// DEBUG: Log initialization attempt
	console.log(
		"[initAuthSdk] Called. initialized:",
		initialized,
		"isAuthConfigured:",
		isAuthConfigured(),
	);

	// Only initialize once
	if (initialized || isAuthConfigured()) {
		console.log("[initAuthSdk] Already initialized, skipping");
		return;
	}

	// DEBUG: Use hardcoded values
	const authServiceUrl = HARDCODED_AUTH_SERVICE_URL;
	const authAppUrl = HARDCODED_AUTH_APP_URL;

	console.log("[initAuthSdk] Creating config with:", {
		authServiceUrl,
		authAppUrl,
	});

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
	console.log("[initAuthSdk] Config created successfully");
}

// Auto-initialize when this module is loaded (both server and client)
// This ensures SDK is ready before any component tries to use it
console.log("[sdkConfig] Module loaded, calling initAuthSdk()");
initAuthSdk();
console.log(
	"[sdkConfig] After initAuthSdk(), isAuthConfigured:",
	isAuthConfigured(),
);
