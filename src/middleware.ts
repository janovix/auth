import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { getDefaultRedirectUrl } from "@/lib/auth/redirectConfig";

/**
 * Next.js Middleware for optimistic route protection.
 *
 * This middleware runs BEFORE the page renders and checks for the existence of
 * a session cookie. If no cookie exists, it redirects to the login page.
 *
 * Important: This is an OPTIMISTIC check - it only verifies the cookie exists,
 * not that it's valid. Actual session validation still happens server-side
 * in the page components. This prevents the "blink" effect where users briefly
 * see protected content before being redirected.
 *
 * For cross-subdomain cookies (like .janovix.workers.dev), the cookie will be
 * available to this middleware since it's set on the parent domain.
 *
 * @see https://www.better-auth.com/docs/integrations/next
 */
export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Get the session cookie from the request
	// The cookie name matches Better Auth's default: "better-auth.session_token"
	const sessionCookie = getSessionCookie(request);

	// Define route protection rules
	const isAccountRoute = pathname.startsWith("/account");

	// Redirect unauthenticated users away from account routes
	if (isAccountRoute && !sessionCookie) {
		const loginUrl = new URL("/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	// Redirect authenticated users to the default redirect URL
	// (except for /account which is the only allowed route for authenticated users in this app)
	if (!isAccountRoute && sessionCookie) {
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
