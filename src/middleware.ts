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
	const isProtectedRoute = pathname.startsWith("/account");
	const isAuthRoute =
		pathname === "/" ||
		pathname.startsWith("/login") ||
		pathname.startsWith("/signup") ||
		pathname.startsWith("/recover");

	// Redirect unauthenticated users away from protected routes
	if (isProtectedRoute && !sessionCookie) {
		const loginUrl = new URL("/", request.url);
		// Preserve the original destination for post-login redirect
		loginUrl.searchParams.set("redirect_to", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Redirect authenticated users away from auth routes (login, signup, etc.)
	if (isAuthRoute && sessionCookie) {
		// Redirect to the default redirect URL (external app)
		return NextResponse.redirect(getDefaultRedirectUrl());
	}

	return NextResponse.next();
}

export const config = {
	// Apply middleware to protected and auth routes
	matcher: ["/account/:path*", "/", "/login", "/signup", "/recover/:path*"],
};
