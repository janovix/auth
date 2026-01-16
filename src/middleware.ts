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
 * Onboarding status from auth service.
 */
type OnboardingStatus = {
	profileComplete: boolean;
	hasOrganization: boolean;
	hasSubscription: boolean;
	subscriptionStatus: string | null;
	plan: string | null;
	pendingInvitation: {
		id: string;
		organizationId: string;
		organizationName: string;
		organizationLogo: string | null;
		role: string;
		inviterName: string | null;
		inviterEmail: string | null;
		expiresAt: string | null;
	} | null;
	canCreateOrganization: boolean;
};

/**
 * Session validation result including user data and onboarding status.
 */
type SessionResult =
	| {
			isValid: false;
			user: null;
			onboardingStatus: null;
	  }
	| {
			isValid: true;
			user: {
				id: string;
				name: string | null;
				email: string;
			};
			onboardingStatus: OnboardingStatus;
	  };

/**
 * Validates the session with the auth service and returns user data + onboarding status.
 * @returns Session result with validity, user info, and onboarding status
 */
async function getSessionWithOnboardingStatus(
	cookieHeader: string,
): Promise<SessionResult> {
	try {
		const authServiceUrl = getAuthServiceUrl();

		// First, validate the session
		const sessionResponse = await fetch(
			`${authServiceUrl}/api/auth/get-session`,
			{
				headers: {
					Cookie: cookieHeader,
					Origin: getAuthAppUrl(),
				},
				cache: "no-store",
			},
		);

		if (!sessionResponse.ok) {
			return { isValid: false, user: null, onboardingStatus: null };
		}

		const sessionData = (await sessionResponse.json()) as {
			session?: unknown;
			user?: {
				id?: string;
				name?: string | null;
				email?: string;
			};
		};

		if (
			!sessionData?.session ||
			!sessionData?.user ||
			!sessionData.user.id ||
			!sessionData.user.email
		) {
			return { isValid: false, user: null, onboardingStatus: null };
		}

		// Then, get onboarding status
		const onboardingResponse = await fetch(
			`${authServiceUrl}/api/subscription/onboarding-status`,
			{
				headers: {
					Cookie: cookieHeader,
					Origin: getAuthAppUrl(),
				},
				cache: "no-store",
			},
		);

		const userName = sessionData.user.name ?? null;
		let onboardingStatus: OnboardingStatus = {
			profileComplete: userName !== null && userName.trim().length > 0,
			hasOrganization: false,
			hasSubscription: false,
			subscriptionStatus: null,
			plan: null,
			pendingInvitation: null,
			canCreateOrganization: false,
		};

		if (onboardingResponse.ok) {
			const onboardingData = (await onboardingResponse.json()) as {
				success: boolean;
				data?: OnboardingStatus;
			};
			if (onboardingData.success && onboardingData.data) {
				onboardingStatus = onboardingData.data;
			}
		}

		return {
			isValid: true,
			user: {
				id: sessionData.user.id,
				name: sessionData.user.name ?? null,
				email: sessionData.user.email,
			},
			onboardingStatus,
		};
	} catch {
		return { isValid: false, user: null, onboardingStatus: null };
	}
}

/**
 * Check if the user needs onboarding.
 * User needs onboarding if:
 * 1. Profile is incomplete (no name), OR
 * 2. Has no organization membership
 */
function needsOnboarding(status: OnboardingStatus): boolean {
	return !status.profileComplete || !status.hasOrganization;
}

/**
 * Next.js Middleware for route protection with session validation and onboarding check.
 *
 * This middleware runs BEFORE the page renders and validates the session
 * with the auth service. It ensures:
 * - Users with no session or invalid session cannot access protected routes
 * - Users with valid session can access protected routes
 * - Users with valid session but incomplete profile OR no organization are redirected to /onboarding
 * - Users with valid session and completed onboarding are redirected away from public routes
 *
 * Onboarding flow:
 * 1. Profile completion step (if no name/avatar)
 * 2. Subscription selection step (if no organization - choose plan, enter license, or wait for invite)
 * 3. Organization creation step (after subscription, if user hasn't been invited)
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
	const isInviteRoute = pathname.startsWith("/invite");
	const isProtectedRoute = isAccountRoute || isSettingsRoute;

	// Public routes that authenticated users should be redirected away from
	// (unless they need onboarding)
	const isPublicAuthRoute =
		!isProtectedRoute && !isOnboardingRoute && !isInviteRoute;

	// No session cookie at all
	if (!sessionCookie) {
		// Redirect to login if trying to access protected, onboarding, or invite routes
		if (isProtectedRoute || isOnboardingRoute || isInviteRoute) {
			const loginUrl = new URL("/login", request.url);
			return NextResponse.redirect(loginUrl);
		}
		// Allow access to public routes (login, register, etc.)
		return NextResponse.next();
	}

	// Session cookie exists - validate it with auth service and get onboarding status
	const sessionResult = await getSessionWithOnboardingStatus(cookieHeader);

	if (!sessionResult.isValid) {
		// Invalid session - redirect to login if on protected, onboarding, or invite route
		if (isProtectedRoute || isOnboardingRoute || isInviteRoute) {
			const loginUrl = new URL("/login", request.url);
			return NextResponse.redirect(loginUrl);
		}
		// Allow access to public routes so user can re-authenticate
		return NextResponse.next();
	}

	// Valid session - check onboarding status
	const { onboardingStatus } = sessionResult;
	const userNeedsOnboarding = needsOnboarding(onboardingStatus);

	// Handle invite route - user must be authenticated but can have incomplete onboarding
	// This allows users to accept invitations before completing full onboarding
	if (isInviteRoute) {
		// If user has a pending invitation, allow access to invite page
		if (onboardingStatus.pendingInvitation) {
			return NextResponse.next();
		}
		// No pending invitation - redirect to onboarding or settings
		if (userNeedsOnboarding) {
			return NextResponse.redirect(new URL("/onboarding", request.url));
		}
		return NextResponse.redirect(new URL(getDefaultRedirectUrl(), request.url));
	}

	// User needs onboarding (profile incomplete OR no organization)
	if (userNeedsOnboarding) {
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
			return NextResponse.redirect(
				new URL(getDefaultRedirectUrl(), request.url),
			);
		}

		return NextResponse.redirect(new URL(targetUrl, request.url));
	}

	// Redirect authenticated users away from public auth routes
	if (isPublicAuthRoute) {
		const redirectTo = request.nextUrl.searchParams.get("redirect_to");
		const targetUrl = redirectTo || getDefaultRedirectUrl();
		return NextResponse.redirect(new URL(targetUrl, request.url));
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
