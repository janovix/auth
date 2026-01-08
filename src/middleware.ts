import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { getDefaultRedirectUrl } from "@/lib/auth/redirectConfig";

/**
 * Gets the auth service URL from environment variables.
 * Returns a fallback URL if not configured (for development).
 */
function getAuthServiceUrl(): string {
	return (
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
		"https://auth-svc.example.workers.dev"
	);
}

/**
 * Validates the session with the auth service.
 * @returns true if session is valid, false otherwise
 */
async function isSessionValid(cookieHeader: string): Promise<boolean> {
	try {
		const authServiceUrl = getAuthServiceUrl();
		const response = await fetch(`${authServiceUrl}/api/auth/get-session`, {
			headers: {
				Cookie: cookieHeader,
				Origin: authServiceUrl,
			},
			cache: "no-store",
		});

		if (!response.ok) {
			return false;
		}

		const data = (await response.json()) as {
			session?: unknown;
			user?: unknown;
		};
		return !!(data?.session && data?.user);
	} catch {
		return false;
	}
}

/**
 * Next.js Middleware for route protection with session validation.
 *
 * This middleware runs BEFORE the page renders and validates the session
 * with the auth service. It ensures:
 * - Users with no session or invalid session cannot access /account routes
 * - Users with valid session are redirected away from public routes (login, etc.)
 *
 * For cross-subdomain cookies (like .janovix.workers.dev), the cookie will be
 * available to this middleware since it's set on the parent domain.
 *
 * @see https://www.better-auth.com/docs/integrations/next
 */
export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const sessionCookie = getSessionCookie(request);
	const cookieHeader = request.headers.get("cookie") || "";

	// Define route protection rules
	const isAccountRoute = pathname.startsWith("/account");

	// No session cookie at all
	if (!sessionCookie) {
		// Redirect to login if trying to access account routes
		if (isAccountRoute) {
			const loginUrl = new URL("/login", request.url);
			return NextResponse.redirect(loginUrl);
		}
		// Allow access to public routes (login, register, etc.)
		return NextResponse.next();
	}

	// Session cookie exists - validate it with auth service
	const isValid = await isSessionValid(cookieHeader);

	if (!isValid) {
		// Invalid session - redirect to login if on account route
		if (isAccountRoute) {
			const loginUrl = new URL("/login", request.url);
			return NextResponse.redirect(loginUrl);
		}
		// Allow access to public routes so user can re-authenticate
		return NextResponse.next();
	}

	// Valid session - redirect authenticated users away from public routes
	if (!isAccountRoute) {
		return NextResponse.redirect(getDefaultRedirectUrl());
	}

	return NextResponse.next();
}

export const config = {
	// Apply middleware to all routes except static files and api
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
