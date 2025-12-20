"use client";

/**
 * Auth actions using Better Auth client.
 *
 * All authentication operations use the Better Auth client instance
 * configured in authClient.ts.
 */

import { authClient } from "./authClient";
import { setSession, clearSession } from "./sessionStore";
import type {
	Session,
	SignInCredentials,
	SignUpCredentials,
	AuthResult,
} from "./types";

// Re-export types for convenience
export type { Session, SignInCredentials, SignUpCredentials, AuthResult };

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
 * Signs in a user with email and password.
 *
 * On success, automatically updates the session store.
 */
export async function signIn(
	credentials: SignInCredentials,
): Promise<AuthResult> {
	try {
		const result = await authClient.signIn.email({
			email: credentials.email,
			password: credentials.password,
			rememberMe: credentials.rememberMe ?? false,
		});

		if (result.error) {
			return {
				success: false,
				data: null,
				error: new Error(result.error.message || "Sign in failed"),
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

		return {
			success: true,
			data: session,
			error: null,
		};
	} catch (err) {
		return {
			success: false,
			data: null,
			error: err instanceof Error ? err : new Error("Sign in failed"),
		};
	}
}

/**
 * Signs up a new user with email and password.
 *
 * On success, automatically updates the session store (user is logged in).
 */
export async function signUp(
	credentials: SignUpCredentials,
): Promise<AuthResult> {
	try {
		const result = await authClient.signUp.email({
			email: credentials.email,
			password: credentials.password,
			name: credentials.name,
			image: credentials.image,
		});

		if (result.error) {
			return {
				success: false,
				data: null,
				error: new Error(result.error.message || "Sign up failed"),
			};
		}

		// Fetch full session after sign-up
		const sessionResult = await authClient.getSession();

		if (sessionResult.error || !sessionResult.data) {
			// Sign-up succeeded but couldn't get session
			return {
				success: true,
				data: null,
				error: null,
			};
		}

		const session = toSession(sessionResult.data);
		setSession(session);

		return {
			success: true,
			data: session,
			error: null,
		};
	} catch (err) {
		return {
			success: false,
			data: null,
			error: err instanceof Error ? err : new Error("Sign up failed"),
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
		return {
			success: false,
			data: null,
			error: err instanceof Error ? err : new Error("Sign out failed"),
		};
	}
}

/**
 * Sends a password recovery email to the specified address.
 *
 * Uses Better Auth client's requestPasswordReset method with Turnstile verification.
 * See: https://www.better-auth.com/docs/authentication/email-password#request-password-reset
 *
 * @param email - The email address to send the recovery link to
 * @param turnstileToken - Optional Cloudflare Turnstile token for bot protection
 */
export async function recoverPassword(
	email: string,
	turnstileToken?: string,
): Promise<AuthResult<{ message: string }>> {
	try {
		// Get current origin for redirect URL
		const redirectTo =
			typeof window !== "undefined"
				? `${window.location.origin}/recover/reset`
				: `${process.env.NEXT_PUBLIC_AUTH_APP_URL}/recover/reset`;

		const result = await authClient.requestPasswordReset({
			email,
			redirectTo,
			fetchOptions: turnstileToken
				? {
						body: {
							turnstileToken,
						},
					}
				: undefined,
		});

		if (result.error) {
			return {
				success: false,
				data: null,
				error: new Error(result.error.message || "Password recovery failed"),
			};
		}

		return {
			success: true,
			data: { message: "Recovery email sent" },
			error: null,
		};
	} catch (err) {
		return {
			success: false,
			data: null,
			error: err instanceof Error ? err : new Error("Password recovery failed"),
		};
	}
}

/**
 * Resets the user's password using a recovery token.
 *
 * Uses Better Auth client's resetPassword method.
 * See: https://www.better-auth.com/docs/authentication/email-password#request-password-reset
 */
export async function resetPassword(
	token: string,
	newPassword: string,
): Promise<AuthResult<{ message: string }>> {
	try {
		const result = await authClient.resetPassword({
			token,
			newPassword,
		});

		if (result.error) {
			return {
				success: false,
				data: null,
				error: new Error(result.error.message || "Password reset failed"),
			};
		}

		return {
			success: true,
			data: { message: "Password reset successfully" },
			error: null,
		};
	} catch (err) {
		return {
			success: false,
			data: null,
			error: err instanceof Error ? err : new Error("Password reset failed"),
		};
	}
}
