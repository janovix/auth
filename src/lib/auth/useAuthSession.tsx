"use client";

/**
 * Auth session management re-exported from the auth-next-sdk.
 *
 * IMPORTANT: We import sdkConfig first to ensure the SDK is initialized
 * in the same client bundle where these functions are used. This prevents
 * the "Auth config not initialized" error caused by code-splitting.
 *
 * This module re-exports the SDK's session management utilities which use
 * a centralized nanostore-based session store. This ensures that when
 * signIn/signUp/signOut are called, the session state is immediately
 * reflected in all components using useAuthSession().
 */

// Initialize SDK in this client bundle BEFORE importing SDK functions
import "./sdkConfig";

// Re-export all session management from SDK
export {
	useAuthSession,
	setSession,
	clearSession,
	SessionHydrator,
	AuthSessionProvider,
	createSessionStore,
	type SessionStore,
} from "@algenium/auth-next/client";

// Re-export SessionSnapshot type for backward compatibility
import type { SessionSnapshot } from "@algenium/auth-next";
export type AuthSessionSnapshot = SessionSnapshot;
export type AuthSessionStore =
	import("@algenium/auth-next/client").SessionStore;
