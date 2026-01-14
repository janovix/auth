"use client";

import { createAuthClient } from "better-auth/client";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";

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
 *   preserving the user's flow and redirectTo parameters during authentication.
 * - organizationClient: Enables organization management (required by aml-janovix).
 * - stripeClient: Enables subscription management via Better Auth Stripe plugin.
 *
 * Note: Cloudflare Turnstile captcha protection is handled via x-captcha-response
 * header in fetchOptions. Use useTurnstile() hook to get the token.
 */
export const authClient = createAuthClient({
	baseURL: getAuthCoreBaseUrl(),
	fetchOptions: {
		credentials: "include",
	},
	plugins: [
		emailOTPClient(),
		organizationClient(),
		stripeClient({
			subscription: true, // Enable subscription management
		}),
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
