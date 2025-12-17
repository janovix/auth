/**
 * Server-side session utilities re-exported from the auth-next-sdk.
 *
 * For the auth app, we re-export the SDK's getServerSession which uses
 * the configuration from createAuthConfig() initialized in sdkConfig.ts.
 */

export { getServerSession, hasSessionCookie } from "@algenium/auth-next/server";

// Re-export Session type for convenience
export type { Session } from "@algenium/auth-next";

/**
 * @deprecated Use `Session` from `@algenium/auth-next` directly
 */
export type ServerSession = import("@algenium/auth-next").Session;
