import { cookies } from "next/headers";

import { getAuthCoreBaseUrl } from "./authCoreConfig";

/**
 * Session data returned from the auth service.
 * This matches Better Auth's session structure.
 */
export type ServerSession = {
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
		ipAddress?: string;
		userAgent?: string;
	};
} | null;

/**
 * Fetches the current session from the auth service on the server side.
 *
 * This function is designed to be called from Server Components or Server Actions
 * to pre-fetch the session before rendering. This eliminates the "blink" effect
 * where the UI briefly shows a loading or unauthenticated state.
 *
 * The session cookie is forwarded from the incoming request to the auth service,
 * allowing cross-subdomain cookie authentication to work properly.
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
export async function getServerSession(): Promise<ServerSession> {
	try {
		const cookieStore = await cookies();
		const cookieHeader = cookieStore.toString();

		// DEBUG: Log cookie info
		console.log(
			"[GET_SERVER_SESSION] Cookie header length:",
			cookieHeader?.length ?? 0,
		);
		console.log("[GET_SERVER_SESSION] Has cookies:", !!cookieHeader);

		// If no cookies, definitely no session
		if (!cookieHeader) {
			console.log("[GET_SERVER_SESSION] No cookies, returning null");
			return null;
		}

		const baseUrl = getAuthCoreBaseUrl();
		console.log(
			"[GET_SERVER_SESSION] Fetching from:",
			`${baseUrl}/api/auth/get-session`,
		);

		const response = await fetch(`${baseUrl}/api/auth/get-session`, {
			method: "GET",
			headers: {
				cookie: cookieHeader,
			},
			// Don't cache session requests
			cache: "no-store",
		});

		console.log("[GET_SERVER_SESSION] Response status:", response.status);

		if (!response.ok) {
			// Non-2xx response means no valid session
			console.log("[GET_SERVER_SESSION] Non-OK response, returning null");
			return null;
		}

		// Type the response data from Better Auth
		type SessionResponse = {
			user?: {
				id: string;
				name: string;
				email: string;
				image: string | null;
				emailVerified: boolean;
				createdAt: string;
				updatedAt: string;
			};
			session?: {
				id: string;
				userId: string;
				token: string;
				expiresAt: string;
				createdAt: string;
				updatedAt: string;
				ipAddress?: string;
				userAgent?: string;
			};
		} | null;

		const data: SessionResponse = await response.json();

		console.log("[GET_SERVER_SESSION] Response data:", {
			hasData: !!data,
			hasUser: !!data?.user,
			hasSession: !!data?.session,
			userId: data?.user?.id,
		});

		// Better Auth returns { user, session } or null
		if (!data || !data.user || !data.session) {
			console.log(
				"[GET_SERVER_SESSION] Missing user or session, returning null",
			);
			return null;
		}

		console.log(
			"[GET_SERVER_SESSION] Success! Returning session for user:",
			data.user.id,
		);

		// Parse date strings into Date objects
		return {
			user: {
				...data.user,
				createdAt: new Date(data.user.createdAt),
				updatedAt: new Date(data.user.updatedAt),
			},
			session: {
				...data.session,
				expiresAt: new Date(data.session.expiresAt),
				createdAt: new Date(data.session.createdAt),
				updatedAt: new Date(data.session.updatedAt),
			},
		};
	} catch (error) {
		// Log error but don't throw - treat as unauthenticated
		console.error("[GET_SERVER_SESSION] Failed to fetch session:", error);
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
