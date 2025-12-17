"use client";

/**
 * Auth actions re-exported from the auth-next-sdk.
 *
 * This module re-exports the SDK's auth functions which properly update
 * the session store used by useAuthSession(). This ensures that after
 * login/logout/signup, the session state is immediately reflected in
 * all components using the useAuthSession hook.
 *
 * The SDK functions use the configuration from createAuthConfig() and
 * make direct fetch calls to the auth service endpoints.
 */

export {
	signIn,
	signUp,
	signOut,
	recoverPassword,
	resetPassword,
	type SignInCredentials,
	type SignUpCredentials,
	type AuthResult,
} from "@algenium/auth-next/client";

// Re-export Session type from SDK for compatibility
export type { Session } from "@algenium/auth-next";
