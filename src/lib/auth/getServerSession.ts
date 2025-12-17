/**
 * Server-side session utilities re-exported from the auth-next-sdk.
 *
 * IMPORTANT: We import sdkConfig first to ensure the SDK is initialized
 * before using getServerSession. This prevents the "Auth config not initialized"
 * error on the server side.
 *
 * For the auth app, we re-export the SDK's getServerSession which uses
 * the configuration from createAuthConfig() initialized in sdkConfig.ts.
 */

// Initialize SDK BEFORE importing SDK functions
import "./sdkConfig";

export { getServerSession, hasSessionCookie } from "@algenium/auth-next/server";

// Re-export Session type for convenience
export type { Session } from "@algenium/auth-next";

/**
 * @deprecated Use `Session` from `@algenium/auth-next` directly
 */
export type ServerSession = import("@algenium/auth-next").Session;
