import { cookies, headers } from "next/headers";

import { serverAuthClient } from "./serverAuthClient";
import type { Session } from "./types";

// Re-export types
export type { Session };

/**
 * @deprecated Use `Session` from `./types` directly
 */
export type ServerSession = Session;

/**
 * Fetches the current session from the auth service on the server side.
 *
 * This function is designed to be called from Server Components or Server Actions
 * to pre-fetch the session before rendering. This eliminates the "blink" effect
 * where the UI briefly shows a loading or unauthenticated state.
 *
 * Fast path: if the middleware already validated the session it forwards the raw
 * JSON via the x-middleware-session header, avoiding a redundant HTTP round-trip.
 * Fallback: uses serverAuthClient.getSession() which automatically forwards
 * cookies and the required Origin header.
 *
 * @returns The session data if authenticated, or null if not authenticated
 *
 * @example
 * ```tsx
 * // In a Server Component (page.tsx)
 * import { getServerSession } from "@/lib/auth/getServerSession";
 *
 * export default async function AccountPage() {
 *   const session = await getServerSession();
 *   return <AccountView initialSession={session} />;
 * }
 * ```
 */
export async function getServerSession(): Promise<Session> {
	try {
		// Fast path: if the middleware validated the session it forwards the raw
		// JSON via x-middleware-session to avoid a redundant get-session HTTP call.
		const incomingHeaders = await headers();
		const middlewareSessionJson = incomingHeaders.get("x-middleware-session");
		if (middlewareSessionJson) {
			try {
				const parsed = JSON.parse(middlewareSessionJson) as {
					user?: {
						id?: string;
						name?: string | null;
						email?: string;
						emailVerified?: boolean;
						image?: string | null;
						createdAt?: string;
						updatedAt?: string;
						role?: string;
					};
					session?: {
						id?: string;
						userId?: string;
						token?: string;
						expiresAt?: string;
						createdAt?: string;
						updatedAt?: string;
						ipAddress?: string | null;
						userAgent?: string | null;
						activeOrganizationId?: string | null;
					};
				};
				// Only use the header if it has the minimum required fields
				if (
					parsed.user?.id &&
					parsed.user.email &&
					parsed.session?.id &&
					parsed.session.token &&
					parsed.session.expiresAt
				) {
					return {
						user: {
							id: parsed.user.id,
							name: parsed.user.name ?? "",
							email: parsed.user.email,
							image: parsed.user.image ?? null,
							emailVerified: parsed.user.emailVerified ?? false,
							createdAt: new Date(parsed.user.createdAt ?? 0),
							updatedAt: new Date(parsed.user.updatedAt ?? 0),
							role: parsed.user.role,
						},
						session: {
							id: parsed.session.id,
							userId: parsed.session.userId ?? parsed.user.id,
							token: parsed.session.token,
							expiresAt: new Date(parsed.session.expiresAt),
							createdAt: new Date(parsed.session.createdAt ?? 0),
							updatedAt: new Date(parsed.session.updatedAt ?? 0),
							ipAddress: parsed.session.ipAddress ?? undefined,
							userAgent: parsed.session.userAgent ?? undefined,
							activeOrganizationId: parsed.session.activeOrganizationId,
						},
					};
				}
			} catch {
				// Malformed header - fall through to HTTP fetch
			}
		}

		// Fallback: use the server-side Better Auth client which automatically
		// forwards cookies and the Origin header via its onRequest hook.
		const result = await serverAuthClient.getSession();

		if (!result.data) {
			return null;
		}

		const { user, session } = result.data;

		return {
			user: {
				...user,
				createdAt: new Date(user.createdAt),
				updatedAt: new Date(user.updatedAt),
			},
			session: {
				...session,
				expiresAt: new Date(session.expiresAt),
				createdAt: new Date(session.createdAt),
				updatedAt: new Date(session.updatedAt),
			},
		};
	} catch (error) {
		// Log error but don't throw - treat as unauthenticated
		console.error("[getServerSession] Failed to fetch session:", error);
		return null;
	}
}

/**
 * Checks if there's a valid session without fetching full session data.
 * Useful for quick auth checks in Server Components.
 *
 * @returns true if a session cookie exists, false otherwise
 */
export async function hasSessionCookie(): Promise<boolean> {
	const cookieStore = await cookies();
	// Better Auth uses "better-auth.session_token" as the default cookie name
	const sessionCookie =
		cookieStore.get("better-auth.session_token") ||
		cookieStore.get("__Secure-better-auth.session_token");
	return !!sessionCookie;
}
