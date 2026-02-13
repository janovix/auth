"use client";

/**
 * Auth actions using Better Auth client.
 *
 * All authentication operations use the Better Auth client instance
 * configured in authClient.ts.
 *
 * This app uses passwordless OTP-based authentication:
 * - Sign-in: User enters email → receives OTP → enters OTP → session created
 * - New users are automatically created during OTP sign-in if they don't exist
 * - New users without a name are redirected to onboarding after login
 */

import { authClient } from "./authClient";
import { setSession, clearSession } from "./sessionStore";
import { broadcastSignOut, broadcastSessionUpdate } from "./sessionSync";
import type { Session, AuthResult } from "./types";

// Re-export types for convenience
export type { Session, AuthResult };

/**
 * Helper to convert Better Auth session response to our Session type.
 */
function toSession(data: {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
		emailVerified: boolean;
		createdAt: Date;
		updatedAt: Date;
	};
	session: {
		id: string;
		userId: string;
		token: string;
		expiresAt: Date;
		createdAt: Date;
		updatedAt: Date;
		ipAddress?: string | null;
		userAgent?: string | null;
	};
}): Session {
	return {
		user: {
			id: data.user.id,
			name: data.user.name,
			email: data.user.email,
			image: data.user.image ?? null,
			emailVerified: data.user.emailVerified,
			createdAt:
				data.user.createdAt instanceof Date
					? data.user.createdAt
					: new Date(data.user.createdAt),
			updatedAt:
				data.user.updatedAt instanceof Date
					? data.user.updatedAt
					: new Date(data.user.updatedAt),
		},
		session: {
			id: data.session.id,
			userId: data.session.userId,
			token: data.session.token,
			expiresAt:
				data.session.expiresAt instanceof Date
					? data.session.expiresAt
					: new Date(data.session.expiresAt),
			createdAt:
				data.session.createdAt instanceof Date
					? data.session.createdAt
					: new Date(data.session.createdAt),
			updatedAt:
				data.session.updatedAt instanceof Date
					? data.session.updatedAt
					: new Date(data.session.updatedAt),
			ipAddress: data.session.ipAddress ?? undefined,
			userAgent: data.session.userAgent ?? undefined,
		},
	};
}

/**
 * Signs in a user with email and OTP (passwordless).
 *
 * This is a two-step process:
 * 1. Call sendVerificationOtp(email, "sign-in") to send the OTP
 * 2. Call signInWithOtp(email, otp) to complete sign-in
 *
 * On success, automatically updates the session store.
 * If the user doesn't exist, they will be automatically registered.
 */
export async function signInWithOtp(
	email: string,
	otp: string,
): Promise<AuthResult> {
	try {
		const result = await authClient.signIn.emailOtp({
			email,
			otp,
		});

		if (result.error) {
			const errorMessage = result.error.message || "Sign in failed";
			return {
				success: false,
				data: null,
				error: createOtpError(errorMessage),
			};
		}

		// Fetch full session after sign-in
		const sessionResult = await authClient.getSession();

		if (sessionResult.error || !sessionResult.data) {
			// Sign-in succeeded but couldn't get session
			// User is still authenticated via cookies
			return {
				success: true,
				data: null,
				error: null,
			};
		}

		const session = toSession(sessionResult.data);
		setSession(session);
		broadcastSessionUpdate(); // Notify other tabs of sign-in

		return {
			success: true,
			data: session,
			error: null,
		};
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : "Sign in failed";
		return {
			success: false,
			data: null,
			error: createOtpError(errorMessage),
		};
	}
}

/**
 * Signs out the current user.
 *
 * Automatically clears the session store.
 */
export async function signOut(): Promise<AuthResult<null>> {
	try {
		const result = await authClient.signOut();

		// Clear session regardless of result
		clearSession();
		broadcastSignOut(); // Notify other tabs of sign-out

		if (result.error) {
			return {
				success: false,
				data: null,
				error: new Error(result.error.message || "Sign out failed"),
			};
		}

		return {
			success: true,
			data: null,
			error: null,
		};
	} catch (err) {
		// Still clear session even on error
		clearSession();
		broadcastSignOut(); // Notify other tabs even on error
		return {
			success: false,
			data: null,
			error: err instanceof Error ? err : new Error("Sign out failed"),
		};
	}
}

// Password recovery functions removed - this is a passwordless system.
// Users sign in via OTP codes sent to their email.

/**
 * OTP verification type options.
 */
export type OtpType = "email-verification" | "sign-in" | "forget-password";

/**
 * Options for sending verification OTP.
 */
export interface SendOtpOptions {
	/** Captcha response token (from Turnstile) */
	captchaToken?: string;
}

/**
 * Sends a verification OTP to the specified email address.
 *
 * Uses Better Auth client's emailOtp.sendVerificationOtp method.
 * This keeps users in the app during verification, preserving redirectTo.
 * See: https://www.better-auth.com/docs/plugins/email-otp
 *
 * @param email - The email address to send the OTP to
 * @param type - The type of OTP (defaults to email-verification)
 * @param options - Additional options including captcha token
 */
export async function sendVerificationOtp(
	email: string,
	type: OtpType = "email-verification",
	options?: SendOtpOptions,
): Promise<AuthResult<{ message: string; rateLimited?: boolean }>> {
	try {
		// Build fetch options with captcha header if token provided
		const fetchOptions: { headers?: Record<string, string> } = {};
		if (options?.captchaToken) {
			fetchOptions.headers = {
				"x-captcha-response": options.captchaToken,
			};
		}

		const result = await authClient.emailOtp.sendVerificationOtp(
			{
				email,
				type,
			},
			{
				...fetchOptions,
			},
		);

		if (result.error) {
			// Check if it's a rate limit error (HTTP 429)
			// Note: The X-Retry-After header is parsed by authClient and dispatched
			// via AUTH_RATE_LIMIT_EVENT. Components should listen for that event
			// to get the retry-after duration for displaying countdown to users.
			const errorStatus = (result.error as { status?: number }).status;
			if (errorStatus === 429) {
				return {
					success: false,
					data: null,
					error: createRateLimitError(
						"Too many OTP requests. Please wait before requesting another code.",
					),
				};
			}

			return {
				success: false,
				data: null,
				error: new Error(result.error.message || "Failed to send OTP"),
			};
		}

		// Check if rate limited (OTP already sent recently)
		const data = result.data as
			| { rateLimited?: boolean; message?: string }
			| undefined;
		const rateLimited = data?.rateLimited === true;

		return {
			success: true,
			data: {
				message: rateLimited
					? "An OTP code was already sent. Please check your email."
					: "OTP sent successfully",
				rateLimited,
			},
			error: null,
		};
	} catch (err) {
		// Check if the caught error indicates rate limiting
		if (
			err instanceof Error &&
			(err.message.toLowerCase().includes("rate limit") ||
				err.message.toLowerCase().includes("too many requests"))
		) {
			return {
				success: false,
				data: null,
				error: createRateLimitError(err.message),
			};
		}

		return {
			success: false,
			data: null,
			error: err instanceof Error ? err : new Error("Failed to send OTP"),
		};
	}
}

/**
 * OTP Error types returned by Better Auth.
 * These can be detected from the error message to provide better UX.
 */
export type OtpErrorCode =
	| "EXPIRED"
	| "INVALID"
	| "TOO_MANY_ATTEMPTS"
	| "BANNED"
	| "UNKNOWN";

/**
 * Extended error interface for OTP verification errors.
 * Includes error code for specific error handling in the UI.
 */
export interface OtpVerificationError extends Error {
	code: OtpErrorCode;
}

/**
 * Detects the OTP error type from an error message.
 * Better Auth returns errors like "OTP expired", "Invalid OTP", etc.
 * auth-svc returns "BANNED_USER" code for banned users.
 */
function detectOtpErrorCode(message: string): OtpErrorCode {
	const lowerMsg = message.toLowerCase();

	// Check for banned user (auth-svc returns "BANNED_USER" code or "banned" in message)
	if (lowerMsg.includes("banned") || lowerMsg.includes("bloqueado")) {
		return "BANNED";
	}
	if (lowerMsg.includes("expired") || lowerMsg.includes("expirado")) {
		return "EXPIRED";
	}
	if (
		lowerMsg.includes("too many") ||
		lowerMsg.includes("attempts") ||
		lowerMsg.includes("intentos")
	) {
		return "TOO_MANY_ATTEMPTS";
	}
	if (
		lowerMsg.includes("invalid") ||
		lowerMsg.includes("incorrect") ||
		lowerMsg.includes("wrong")
	) {
		return "INVALID";
	}

	return "UNKNOWN";
}

/**
 * Creates an OtpVerificationError with the appropriate error code.
 */
function createOtpError(message: string): OtpVerificationError {
	const error = new Error(message) as OtpVerificationError;
	error.code = detectOtpErrorCode(message);
	return error;
}

/**
 * Verifies the user's email using an OTP code.
 *
 * Uses Better Auth client's emailOtp.verifyEmail method.
 * On success, the user's email is marked as verified in the database.
 *
 * IMPORTANT: According to Better Auth documentation, verifyEmail() only marks
 * the email as verified - it does NOT create or refresh a session.
 * After verification, the user should sign in to get a valid session.
 *
 * Error Handling:
 * - Returns OtpVerificationError with `code` property for specific error types
 * - Codes: "EXPIRED", "INVALID", "TOO_MANY_ATTEMPTS", "UNKNOWN"
 *
 * See: https://www.better-auth.com/docs/plugins/email-otp
 *
 * @param email - The email address being verified
 * @param otp - The OTP code entered by the user
 */
export async function verifyEmailWithOtp(
	email: string,
	otp: string,
): Promise<AuthResult<{ message: string }>> {
	try {
		const result = await authClient.emailOtp.verifyEmail({
			email,
			otp,
		});

		if (result.error) {
			const errorMessage = result.error.message || "Invalid OTP";
			return {
				success: false,
				data: null,
				error: createOtpError(errorMessage),
			};
		}

		// Email verification succeeded in database.
		// NOTE: verifyEmail() does NOT create a session according to Better Auth docs.
		// The user needs to sign in after verification to get a valid session.
		// We clear any stale local session state to ensure clean login flow.
		clearSession();

		return {
			success: true,
			data: {
				message: "Email verified successfully",
			},
			error: null,
		};
	} catch (err) {
		const errorMessage =
			err instanceof Error ? err.message : "Email verification failed";
		return {
			success: false,
			data: null,
			error: createOtpError(errorMessage),
		};
	}
}

/**
 * Checks if an error is an expired OTP error.
 */
export function isOtpExpiredError(error: Error | null | undefined): boolean {
	if (!error) return false;
	return (error as OtpVerificationError).code === "EXPIRED";
}

/**
 * Checks if an error is a too many attempts error.
 */
export function isOtpTooManyAttemptsError(
	error: Error | null | undefined,
): boolean {
	if (!error) return false;
	return (error as OtpVerificationError).code === "TOO_MANY_ATTEMPTS";
}

/**
 * Checks if an error is a banned user error.
 * This occurs when a user has been banned from the application.
 */
export function isBannedUserError(error: Error | null | undefined): boolean {
	if (!error) return false;
	return (error as OtpVerificationError).code === "BANNED";
}

// ============================================================================
// Rate Limit Error Handling
// ============================================================================

/**
 * Translation key for rate limit error messages.
 * Components should use this key with the translation function to display
 * localized error messages.
 */
export const RATE_LIMIT_ERROR_TRANSLATION_KEY = "login.otp.rateLimited";

/**
 * Error code for rate limiting errors.
 */
export type RateLimitErrorCode = "RATE_LIMITED";

/**
 * Extended error interface for rate limit errors.
 * The retry-after duration is communicated via the AUTH_RATE_LIMIT_EVENT
 * which components listen to for displaying countdowns.
 */
export interface RateLimitError extends Error {
	/** Error code identifying this as a rate limit error */
	code: RateLimitErrorCode;
}

/**
 * Creates a RateLimitError.
 * Note: The retry-after duration comes from the X-Retry-After header
 * and is dispatched via AUTH_RATE_LIMIT_EVENT in authClient.
 *
 * @param message - Error message to display
 */
export function createRateLimitError(
	message: string = "Too many requests. Please wait before trying again.",
): RateLimitError {
	const error = new Error(message) as RateLimitError;
	error.code = "RATE_LIMITED";
	return error;
}

/**
 * Type guard to check if an error is a rate limit error.
 */
export function isRateLimitError(
	error: Error | null | undefined,
): error is RateLimitError {
	if (!error) return false;
	return (error as RateLimitError).code === "RATE_LIMITED";
}

/**
 * Updates the current user's profile.
 *
 * Uses Better Auth client's updateUser method.
 *
 * @param updates - The fields to update (name, image)
 */
export async function updateProfile(updates: {
	name?: string;
	image?: string;
}): Promise<AuthResult<Session>> {
	try {
		const result = await authClient.updateUser(updates);

		if (result.error) {
			return {
				success: false,
				data: null,
				error: new Error(result.error.message || "Update failed"),
			};
		}

		// Refresh session to get updated user data
		const sessionResult = await authClient.getSession();
		if (sessionResult.data) {
			const session = toSession(sessionResult.data);
			setSession(session);
			broadcastSessionUpdate(); // Notify other tabs of profile update
			return {
				success: true,
				data: session,
				error: null,
			};
		}

		return {
			success: true,
			data: null,
			error: null,
		};
	} catch (err) {
		return {
			success: false,
			data: null,
			error: err instanceof Error ? err : new Error("Update failed"),
		};
	}
}
