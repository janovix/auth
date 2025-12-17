"use client";

/**
 * Auth actions re-exported from the auth-next-sdk.
 *
 * IMPORTANT: We import sdkConfig first to ensure the SDK is initialized
 * in the client bundle. The SDK now uses globalThis with Symbol.for()
 * to store config, which survives across code-splitting chunks.
 *
 * This module re-exports the SDK's auth functions which properly update
 * the session store used by useAuthSession(). This ensures that after
 * login/logout/signup, the session state is immediately reflected in
 * all components using the useAuthSession hook.
 */

// Initialize SDK in this client bundle
import "./sdkConfig";

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
