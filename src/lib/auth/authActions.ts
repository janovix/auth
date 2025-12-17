"use client";

/**
 * Local auth actions for the auth app.
 *
 * These functions make direct fetch calls to the auth service and update
 * the local session store. This approach is simpler and doesn't have
 * code-splitting issues.
 */

import { getAuthCoreBaseUrl } from "./authCoreConfig";
import { setSession, clearSession } from "./sessionStore";
import type {
	Session,
	SessionUser,
	SessionData,
	SignInCredentials,
	SignUpCredentials,
	AuthResult,
} from "./types";

// Re-export types for convenience
export type { Session, SignInCredentials, SignUpCredentials, AuthResult };

/**
 * Response type from Better Auth sign-in/sign-up endpoints.
 */
type AuthResponse = {
	user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
		emailVerified: boolean;
		createdAt: string;
		updatedAt: string;
	};
	session: {
		id: string;
		userId: string;
		token: string;
		expiresAt: string;
		createdAt: string;
		updatedAt: string;
		ipAddress?: string;
		userAgent?: string;
	};
};

/**
 * Error response type from Better Auth.
 */
type ErrorResponse = {
	message?: string;
	error?: string;
};

/**
 * Parses auth response into Session object with proper Date types.
 */
function parseAuthResponse(data: AuthResponse): Session {
	return {
		user: {
			id: data.user.id,
			name: data.user.name,
			email: data.user.email,
			image: data.user.image,
			emailVerified: data.user.emailVerified,
			createdAt: new Date(data.user.createdAt),
			updatedAt: new Date(data.user.updatedAt),
		} satisfies SessionUser,
		session: {
			id: data.session.id,
			userId: data.session.userId,
			token: data.session.token,
			expiresAt: new Date(data.session.expiresAt),
			createdAt: new Date(data.session.createdAt),
			updatedAt: new Date(data.session.updatedAt),
			ipAddress: data.session.ipAddress,
			userAgent: data.session.userAgent,
		} satisfies SessionData,
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
	const baseUrl = getAuthCoreBaseUrl();
	const url = `${baseUrl}/api/auth/sign-in/email`;

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				email: credentials.email,
				password: credentials.password,
				rememberMe: credentials.rememberMe ?? false,
			}),
		});

		if (!response.ok) {
			const errorData = (await response
				.json()
				.catch(() => ({}))) as ErrorResponse;
			const message = errorData.message || errorData.error || "Sign in failed";
			return {
				success: false,
				data: null,
				error: new Error(message),
			};
		}

		const data = (await response.json()) as AuthResponse;
		const session = parseAuthResponse(data);

		// Update session store
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
	const baseUrl = getAuthCoreBaseUrl();
	const url = `${baseUrl}/api/auth/sign-up/email`;

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				email: credentials.email,
				password: credentials.password,
				name: credentials.name,
				image: credentials.image,
			}),
		});

		if (!response.ok) {
			const errorData = (await response
				.json()
				.catch(() => ({}))) as ErrorResponse;
			const message = errorData.message || errorData.error || "Sign up failed";
			return {
				success: false,
				data: null,
				error: new Error(message),
			};
		}

		const data = (await response.json()) as AuthResponse;
		const session = parseAuthResponse(data);

		// Update session store
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
	const baseUrl = getAuthCoreBaseUrl();
	const url = `${baseUrl}/api/auth/sign-out`;

	try {
		const response = await fetch(url, {
			method: "POST",
			credentials: "include",
		});

		// Clear session regardless of response (user wants to sign out)
		clearSession();

		if (!response.ok) {
			const errorData = (await response
				.json()
				.catch(() => ({}))) as ErrorResponse;
			const message = errorData.message || errorData.error || "Sign out failed";
			return {
				success: false,
				data: null,
				error: new Error(message),
			};
		}

		return {
			success: true,
			data: null,
			error: null,
		};
	} catch (err) {
		// Still clear session even on network error
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
 */
export async function recoverPassword(
	email: string,
): Promise<AuthResult<{ message: string }>> {
	const baseUrl = getAuthCoreBaseUrl();

	// Get current origin for redirect URL
	const redirectTo =
		typeof window !== "undefined"
			? `${window.location.origin}/recover/reset`
			: `${process.env.NEXT_PUBLIC_AUTH_APP_URL}/recover/reset`;

	const url = `${baseUrl}/api/auth/forget-password`;

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email,
				redirectTo,
			}),
		});

		if (!response.ok) {
			const errorData = (await response
				.json()
				.catch(() => ({}))) as ErrorResponse;
			const message =
				errorData.message || errorData.error || "Password recovery failed";
			return {
				success: false,
				data: null,
				error: new Error(message),
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
 */
export async function resetPassword(
	token: string,
	newPassword: string,
): Promise<AuthResult<{ message: string }>> {
	const baseUrl = getAuthCoreBaseUrl();
	const url = `${baseUrl}/api/auth/reset-password`;

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				token,
				newPassword,
			}),
		});

		if (!response.ok) {
			const errorData = (await response
				.json()
				.catch(() => ({}))) as ErrorResponse;
			const message =
				errorData.message || errorData.error || "Password reset failed";
			return {
				success: false,
				data: null,
				error: new Error(message),
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
