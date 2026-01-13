import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { getDefaultRedirectUrl } from "@/lib/auth/redirectConfig";

/**
 * Gets the auth service URL from environment variables.
 * For middleware (Edge Runtime), prefer internal URL that doesn't need DNS resolution.
 * This allows local development where hosts file entries aren't available in Edge Runtime.
 */
function getAuthServiceUrl(): string {
	const internalUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL_INTERNAL;
	if (internalUrl) {
		return internalUrl;
	}
	return (
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
		"https://auth-svc.janovix.workers.dev"
	);
}

/**
 * Gets the auth app URL from environment variables.
 * Used for Origin header in cross-origin requests to auth service.
 */
function getAuthAppUrl(): string {
	return (
		process.env.NEXT_PUBLIC_AUTH_APP_URL || "https://auth.janovix.workers.dev"
	);
}

/**
 * Session validation result including user data.
 */
type SessionResult = {
	isValid: false;
	user: null;
} | {
	isValid: true;
	user: {
		id: string;
		name: string | null;
		email: string;
	};
};

/**
 * Validates the session with the auth service and returns user data.
 * @returns Session result with validity and user info
 */
async function getSessionWithUser(cookieHeader: string): Promise<SessionResult> {
	try {
		const authServiceUrl = getAuthServiceUrl();
		const response = await fetch(`${authServiceUrl}/api/auth/get-session`, {
			headers: {
				Cookie: cookieHeader,
				Origin: getAuthAppUrl(),
			},
			cache: "no-store",
		});

		if (!response.ok) {
			return { isValid: false, user: null };
		}

		const data = (await response.json()) as {
			session?: unknown;
			user?: {
				id?: string;
				name?: string | null;
				email?: string;
			};
		};

		if (!data?.session || !data?.user || !data.user.id || !data.user.email) {
			return { isValid: false, user: null };
		}

		return {
			isValid: true,
			user: {
				id: data.user.id,
				name: data.user.name ?? null,
				email: data.user.email,
			},
		};
	} catch {
		return { isValid: false, user: null };
	}
}

/**
 * Check if the user has completed onboarding (has a name set).
 */
function hasCompletedOnboarding(user: { name: string | null }): boolean {
	return user.name !== null && user.name.trim().length > 0;
}

/**
 * Next.js Middleware for route protection with session validation and onboarding check.
 *
 * This middleware runs BEFORE the page renders and validates the session
 * with the auth service. It ensures:
 * - Users with no session or invalid session cannot access protected routes
 * - Users with valid session can access protected routes
 * - Users with valid session but no name are redirected to /onboarding
 * - Users with valid session and name are redirected away from public routes
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

	// Define route types
	const isAccountRoute = pathname.startsWith("/account");
	const isSettingsRoute = pathname.startsWith("/settings");
	const isOnboardingRoute = pathname.startsWith("/onboarding");
	const isProtectedRoute = isAccountRoute || isSettingsRoute;

	// Public routes that authenticated users should be redirected away from
	// (unless they need onboarding)
	const isPublicAuthRoute = !isProtectedRoute && !isOnboardingRoute;

	// No session cookie at all
	if (!sessionCookie) {
		// Redirect to login if trying to access protected or onboarding routes
		if (isProtectedRoute || isOnboardingRoute) {
			const loginUrl = new URL("/login", request.url);
			return NextResponse.redirect(loginUrl);
		}
		// Allow access to public routes (login, register, etc.)
		return NextResponse.next();
	}

	// Session cookie exists - validate it with auth service
	const sessionResult = await getSessionWithUser(cookieHeader);

	if (!sessionResult.isValid) {
		// Invalid session - redirect to login if on protected or onboarding route
		if (isProtectedRoute || isOnboardingRoute) {
			const loginUrl = new URL("/login", request.url);
			return NextResponse.redirect(loginUrl);
		}
		// Allow access to public routes so user can re-authenticate
		return NextResponse.next();
	}

	// Valid session - check if user has completed onboarding
	const { user } = sessionResult;
	const needsOnboarding = !hasCompletedOnboarding(user);

	// User needs onboarding (no name set)
	if (needsOnboarding) {
		// Already on onboarding page - allow access
		if (isOnboardingRoute) {
			return NextResponse.next();
		}

		// On any other route - redirect to onboarding
		// Preserve the original destination for after onboarding
		const onboardingUrl = new URL("/onboarding", request.url);

		// Determine the redirect target after onboarding
		const existingRedirect = request.nextUrl.searchParams.get("redirect_to");
		if (existingRedirect) {
			// If there's already a redirect_to param, preserve it
			onboardingUrl.searchParams.set("redirect_to", existingRedirect);
		} else if (isProtectedRoute) {
			// If accessing a protected route, preserve that as the redirect target
			onboardingUrl.searchParams.set("redirect_to", request.url);
		} else {
			// For public routes, redirect to default after onboarding
			onboardingUrl.searchParams.set("redirect_to", getDefaultRedirectUrl());
		}

		return NextResponse.redirect(onboardingUrl);
	}

	// User has completed onboarding - normal flow
	// If on onboarding page but doesn't need it, redirect away
	if (isOnboardingRoute) {
		const redirectTo = request.nextUrl.searchParams.get("redirect_to");
		const targetUrl = redirectTo || getDefaultRedirectUrl();
		
		// Ensure we're not redirecting back to onboarding
		if (targetUrl.includes("/onboarding")) {
			return NextResponse.redirect(getDefaultRedirectUrl());
		}
		
		return NextResponse.redirect(targetUrl);
	}

	// Redirect authenticated users away from public auth routes
	if (isPublicAuthRoute) {
		const redirectTo = request.nextUrl.searchParams.get("redirect_to");
		const targetUrl = redirectTo || getDefaultRedirectUrl();
		return NextResponse.redirect(targetUrl);
	}

	// Allow access to protected routes
	return NextResponse.next();
}

export const config = {
	// Apply middleware to all routes except static files and api
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
