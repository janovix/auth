"use client";

/**
 * Local auth actions for the auth app.
 *
 * These functions bypass the SDK's config system and use the Better Auth
 * client directly. This avoids code-splitting issues where different chunks
 * have separate instances of the SDK's globalConfig.
 *
 * For consumer apps, use @algenium/auth-next/client instead.
 */

import { authClient } from "./authClient";
import { getAuthCoreBaseUrl } from "./authCoreConfig";

/**
 * Session data structure matching Better Auth's response.
 */
export type Session = {
	user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
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
} | null;

/**
 * Credentials for email/password sign in.
 */
export type SignInCredentials = {
	email: string;
	password: string;
	rememberMe?: boolean;
};

/**
 * Credentials for email/password sign up.
 */
export type SignUpCredentials = {
	email: string;
	password: string;
	name: string;
	image?: string;
};

/**
 * Result of an auth operation.
 */
export type AuthResult<T = Session> =
	| { success: true; data: T; error: null }
	| { success: false; data: null; error: Error };

/**
 * Signs in a user with email and password using Better Auth client directly.
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

		if (!result.data) {
			return {
				success: false,
				data: null,
				error: new Error("Sign in failed - no data returned"),
			};
		}

		// Better Auth returns user data, we need to fetch the full session
		const sessionResult = await authClient.getSession();

		if (sessionResult.error || !sessionResult.data) {
			// Sign in succeeded but couldn't get session - still consider it a success
			// The user is authenticated via cookies
			return {
				success: true,
				data: null,
				error: null,
			};
		}

		const session: Session = {
			user: {
				...sessionResult.data.user,
				image: sessionResult.data.user.image ?? null,
			},
			session: sessionResult.data.session,
		};

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
 * Signs up a new user with email and password using Better Auth client directly.
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

		if (!result.data) {
			return {
				success: false,
				data: null,
				error: new Error("Sign up failed - no data returned"),
			};
		}

		// Better Auth returns user data, we need to fetch the full session
		const sessionResult = await authClient.getSession();

		if (sessionResult.error || !sessionResult.data) {
			// Sign up succeeded but couldn't get session - still consider it a success
			return {
				success: true,
				data: null,
				error: null,
			};
		}

		const session: Session = {
			user: {
				...sessionResult.data.user,
				image: sessionResult.data.user.image ?? null,
			},
			session: sessionResult.data.session,
		};

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
 * Signs out the current user using Better Auth client directly.
 */
export async function signOut(): Promise<AuthResult<null>> {
	try {
		const result = await authClient.signOut();

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
		return {
			success: false,
			data: null,
			error: err instanceof Error ? err : new Error("Sign out failed"),
		};
	}
}

/**
 * Sends a password recovery email using direct fetch to auth service.
 */
export async function recoverPassword(
	email: string,
): Promise<AuthResult<{ message: string }>> {
	try {
		const baseUrl = getAuthCoreBaseUrl();

		// Get current origin for redirect URL
		const redirectTo =
			typeof window !== "undefined"
				? `${window.location.origin}/recover/reset`
				: `${process.env.NEXT_PUBLIC_AUTH_APP_URL}/recover/reset`;

		const response = await fetch(`${baseUrl}/api/auth/forget-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				email,
				redirectTo,
			}),
		});

		if (!response.ok) {
			const errorData = (await response.json().catch(() => ({}))) as {
				message?: string;
				error?: string;
			};
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
 * Resets the user's password using a recovery token via direct fetch.
 */
export async function resetPassword(
	token: string,
	newPassword: string,
): Promise<AuthResult<{ message: string }>> {
	try {
		const baseUrl = getAuthCoreBaseUrl();

		const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				token,
				newPassword,
			}),
		});

		if (!response.ok) {
			const errorData = (await response.json().catch(() => ({}))) as {
				message?: string;
				error?: string;
			};
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
