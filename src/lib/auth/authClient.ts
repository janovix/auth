"use client";

import { createAuthClient } from "better-auth/client";
import {
	emailOTPClient,
	organizationClient,
	jwtClient,
} from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";

import { getAuthCoreBaseUrl } from "./authCoreConfig";

/**
 * Custom event detail for rate limit events.
 * Dispatched when the server returns HTTP 429 (Too Many Requests).
 */
export interface RateLimitEventDetail {
	/** Number of seconds until the user can retry, from X-Retry-After header (defaults to 60) */
	retryAfter: number;
	/** The URL that was rate limited */
	url?: string;
}

/**
 * Custom event name for rate limit notifications.
 * Components can listen for this event to show appropriate UI feedback.
 */
export const AUTH_RATE_LIMIT_EVENT = "auth:rate-limited";

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
 *   preserving the user's flow and redirectTo parameters during authentication.
 * - organizationClient: Enables organization management (required by aml-janovix).
 * - stripeClient: Enables subscription management via Better Auth Stripe plugin.
 * - jwtClient: Enables JWT token exchange for service-to-service authentication.
 *
 * Rate Limiting:
 * - Global onError handler detects HTTP 429 responses and dispatches AUTH_RATE_LIMIT_EVENT
 * - Components can listen for this event to show user-friendly rate limit messages
 * - The X-Retry-After header is parsed and included in the event detail
 *
 * Note: Cloudflare Turnstile captcha protection is handled via x-captcha-response
 * header in fetchOptions. Use useTurnstile() hook to get the token.
 */
export const authClient = createAuthClient({
	baseURL: getAuthCoreBaseUrl(),
	fetchOptions: {
		credentials: "include",
		onError: async (context) => {
			console.log("[Auth] onError callback triggered", {
				status: context.response.status,
				url: context.response.url,
			});

			const { response } = context;

			// Handle rate limit errors (HTTP 429)
			if (response.status === 429) {
				console.log("[Auth] 429 detected, processing rate limit...");

				const retryAfterHeader = response.headers.get("X-Retry-After");
				console.log("[Auth] X-Retry-After header value:", retryAfterHeader);

				if (!retryAfterHeader) {
					console.error(
						"[Auth] Rate limit error (429) but X-Retry-After header is missing!",
					);
					console.log(`[Auth] Response URL: ${response.url}`);
					console.log(
						`[Auth] All headers:`,
						Array.from(response.headers.entries()),
					);
					return;
				}

				const retryAfter = parseInt(retryAfterHeader, 10);
				console.log("[Auth] Parsed retryAfter value:", retryAfter);

				if (isNaN(retryAfter) || retryAfter <= 0) {
					console.error(
						`[Auth] Invalid X-Retry-After value: ${retryAfterHeader}`,
					);
					return;
				}

				console.warn(
					`[Auth] Rate limited. Retry after ${retryAfter} seconds (from X-Retry-After header)`,
				);

				// Dispatch custom event for UI components to handle
				// Do this synchronously to ensure it happens immediately
				if (typeof window !== "undefined") {
					const detail: RateLimitEventDetail = {
						retryAfter,
						url: response.url,
					};
					console.log(
						`[Auth] Dispatching ${AUTH_RATE_LIMIT_EVENT} event with detail:`,
						detail,
					);

					const event = new CustomEvent(AUTH_RATE_LIMIT_EVENT, { detail });
					window.dispatchEvent(event);

					console.log(`[Auth] Event dispatched successfully`);
				} else {
					console.error("[Auth] window is undefined, cannot dispatch event");
				}
			}
		},
	},
	plugins: [
		emailOTPClient(),
		organizationClient(),
		stripeClient({
			subscription: true, // Enable subscription management
		}),
		jwtClient(),
	],
});

export type AuthClient = typeof authClient;

/**
 * Helper to create fetch options with captcha headers
 *
 * @example
 * ```tsx
 * const { getCaptchaHeaders } = useTurnstile();
 *
 * await authClient.signIn.email({
 *   email,
 *   password,
 *   fetchOptions: withCaptcha(getCaptchaHeaders()),
 * });
 * ```
 */
export function withCaptcha(captchaHeaders: Record<string, string>): {
	credentials: "include";
	headers: Record<string, string>;
} {
	return {
		credentials: "include",
		headers: captchaHeaders,
	};
}

/**
 * Get a JWT token for API authentication (client-side).
 * Uses the better-auth JWT plugin to exchange session for a JWT.
 *
 * @returns The JWT token string if successful, null otherwise
 */
export async function getClientJwt(): Promise<string | null> {
	try {
		const result = await authClient.token();
		if (result.error || !result.data?.token) {
			console.error("Failed to get JWT:", result.error);
			return null;
		}
		return result.data.token;
	} catch (error) {
		console.error("Error fetching JWT:", error);
		return null;
	}
}
