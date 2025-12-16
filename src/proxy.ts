import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Next.js 16+ Proxy for optimistic route protection.
 *
 * This proxy runs BEFORE the page renders and checks for the existence of
 * a session cookie. If no cookie exists, it redirects to the login page.
 *
 * Important: This is an OPTIMISTIC check - it only verifies the cookie exists,
 * not that it's valid. Actual session validation should still happen in your
 * pages/components. This prevents the "blink" effect where users briefly see
 * protected content before being redirected.
 *
 * For cross-subdomain cookies (like .janovix.workers.dev), the cookie will be
 * available to this proxy since it runs on the same parent domain.
 *
 * @see https://www.better-auth.com/docs/integrations/next#nextjs-16-proxy
 */
export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Get the session cookie from the request
	// The cookie name matches Better Auth's default: "better-auth.session_token"
	const sessionCookie = getSessionCookie(request);

	// Define route protection rules
	const isProtectedRoute = pathname.startsWith("/account");
	const isAuthRoute =
		pathname.startsWith("/login") ||
		pathname.startsWith("/signup") ||
		pathname.startsWith("/recover");

	// Redirect unauthenticated users away from protected routes
	if (isProtectedRoute && !sessionCookie) {
		const loginUrl = new URL("/login", request.url);
		// Preserve the original destination for post-login redirect
		loginUrl.searchParams.set("next", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Redirect authenticated users away from auth routes (login, signup, etc.)
	if (isAuthRoute && sessionCookie) {
		return NextResponse.redirect(new URL("/account", request.url));
	}

	return NextResponse.next();
}

export const config = {
	// Apply proxy to protected and auth routes
	matcher: ["/account/:path*", "/login", "/signup", "/recover/:path*"],
};
