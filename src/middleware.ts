import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_SVC_TIMEOUT_MS = 8000;

/**
 * Wraps fetch() with an AbortController timeout. If auth-svc does not respond
 * within timeoutMs, the request is aborted and the caller's catch block handles
 * the resulting AbortError. This prevents unbounded hangs that cause Cloudflare
 * to kill the middleware Worker with "Network connection lost."
 */
async function fetchWithTimeout(
	url: string,
	options: RequestInit,
	timeoutMs = AUTH_SVC_TIMEOUT_MS,
): Promise<Response> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(url, { ...options, signal: controller.signal });
	} finally {
		clearTimeout(timeout);
	}
}

/**
 * Helper to add Set-Cookie headers from auth-svc to a Next.js response.
 * This is CRITICAL for cookie cache refresh - without forwarding these headers,
 * the browser never receives refreshed session cookies and sessions expire prematurely.
 */
function addAuthCookies(
	response: NextResponse,
	cookies: string[],
): NextResponse {
	if (!cookies || cookies.length === 0) {
		return response;
	}

	// Add the auth-svc Set-Cookie headers to the response
	for (const cookie of cookies) {
		response.headers.append("Set-Cookie", cookie);
	}

	return response;
}

/**
 * Gets the auth service URL from environment variables.
 */
function getAuthServiceUrl(): string {
	const url = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
	if (!url || url.trim().length === 0) {
		throw new Error(
			"Missing required environment variable: NEXT_PUBLIC_AUTH_SERVICE_URL. " +
				"Check your .env.local file or Cloudflare build environment variables.",
		);
	}
	return url.trim().replace(/\/$/, "");
}

/**
 * Gets the auth app URL from environment variables.
 * Used for Origin header in cross-origin requests to auth service.
 */
function getAuthAppUrl(): string {
	const url = process.env.NEXT_PUBLIC_AUTH_APP_URL;
	if (!url || url.trim().length === 0) {
		throw new Error(
			"Missing required environment variable: NEXT_PUBLIC_AUTH_APP_URL. " +
				"Check your .env.local file or Cloudflare build environment variables.",
		);
	}
	return url.trim().replace(/\/$/, "");
}

/**
 * Gets the AML app URL used as the default redirect target after authentication.
 */
function getAmlAppUrl(): string {
	const url = process.env.NEXT_PUBLIC_AML_APP_URL;
	if (!url || url.trim().length === 0) {
		throw new Error(
			"Missing required environment variable: NEXT_PUBLIC_AML_APP_URL. " +
				"Check your .env.local file or Cloudflare build environment variables.",
		);
	}
	return url.trim().replace(/\/$/, "");
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
	/** User role: 'visitor', 'user', or 'admin' */
	role?: string;
	/** Whether the user is a visitor (beta waiting) */
	isVisitor?: boolean;
};

/**
 * Session validation result including user data, onboarding status, and Set-Cookie headers.
 */
type SessionResult =
	| {
			isValid: false;
			user: null;
			onboardingStatus: null;
			setCookieHeaders: string[];
	  }
	| {
			isValid: true;
			user: {
				id: string;
				name: string | null;
				email: string;
				banned?: boolean;
			};
			onboardingStatus: OnboardingStatus;
			setCookieHeaders: string[];
			/** Serialized full session JSON to pass to Server Components via request header. */
			sessionJson?: string;
	  };

/**
 * Build a NextResponse.next() that forwards the validated session data to Server Components
 * via the x-middleware-session request header. This lets getServerSession() skip a redundant
 * get-session HTTP call since the middleware has already validated the session.
 *
 * The incoming x-middleware-session header is always stripped to prevent client injection.
 */
function nextWithSession(
	request: NextRequest,
	sessionJson: string | null,
): NextResponse {
	const requestHeaders = new Headers(request.headers);
	requestHeaders.delete("x-middleware-session");
	if (sessionJson) {
		requestHeaders.set("x-middleware-session", sessionJson);
	}
	return NextResponse.next({ request: { headers: requestHeaders } });
}

/**
 * Validates the session with the auth service and returns user data + onboarding status.
 *
 * @param cookieHeader - Forwarded cookie header for auth-svc requests
 * @param options.requireFullOnboardingStatus - When true (e.g. for the /invite route) the fast
 *   path is bypassed so we always fetch onboarding-status and get accurate pendingInvitation data.
 *   Without this, an already-onboarded user visiting /invite would see pendingInvitation=null and
 *   get incorrectly redirected even though they have a real pending org invitation.
 * @returns Session result with validity, user info, and onboarding status
 */
async function getSessionWithOnboardingStatus(
	cookieHeader: string,
	options?: { requireFullOnboardingStatus?: boolean },
): Promise<SessionResult> {
	try {
		const authServiceUrl = getAuthServiceUrl();

		// First, validate the session
		const sessionResponse = await fetchWithTimeout(
			`${authServiceUrl}/api/auth/get-session`,
			{
				headers: {
					Cookie: cookieHeader,
					Origin: getAuthAppUrl(),
				},
				cache: "no-store",
			},
		);

		// CRITICAL: Capture Set-Cookie headers from auth-svc
		// These headers contain refreshed session cookies that MUST be forwarded to the browser
		// Without this, the cookie cache never refreshes and sessions expire prematurely
		const setCookieHeaders = sessionResponse.headers.getSetCookie?.() || [];

		if (!sessionResponse.ok) {
			return {
				isValid: false,
				user: null,
				onboardingStatus: null,
				setCookieHeaders,
			};
		}

		const sessionData = (await sessionResponse.json()) as {
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
			user?: {
				id?: string;
				name?: string | null;
				email?: string;
				emailVerified?: boolean;
				image?: string | null;
				createdAt?: string;
				updatedAt?: string;
				role?: string;
				banned?: boolean;
			};
		};

		if (
			!sessionData?.session ||
			!sessionData?.user ||
			!sessionData.user.id ||
			!sessionData.user.email
		) {
			return {
				isValid: false,
				user: null,
				onboardingStatus: null,
				setCookieHeaders,
			};
		}

		const userName = sessionData.user.name ?? null;
		const activeOrgId = sessionData.session.activeOrganizationId;

		// Fast path: if the user has a name AND an active organization, they have
		// completed onboarding. Skip the expensive onboarding-status HTTP call
		// (which triggers 7-9 DB queries + a potential Stripe call on auth-svc) and
		// return a synthetic "fully onboarded" status derived from the session data
		// we already have. Visitors never reach this path because they have no name.
		//
		// Exception: skip the fast path when the caller requires full onboarding data
		// (e.g. /invite route) so that pendingInvitation is always accurate — an
		// onboarded user can still receive invitations to additional organizations.
		if (
			!options?.requireFullOnboardingStatus &&
			userName &&
			userName.trim().length > 0 &&
			activeOrgId
		) {
			return {
				isValid: true,
				user: {
					id: sessionData.user.id,
					name: userName,
					email: sessionData.user.email,
					banned: sessionData.user.banned,
				},
				onboardingStatus: {
					profileComplete: true,
					hasOrganization: true,
					hasSubscription: true,
					subscriptionStatus: null,
					plan: null,
					pendingInvitation: null,
					canCreateOrganization: false,
				},
				setCookieHeaders,
				sessionJson: JSON.stringify(sessionData),
			};
		}

		// Slow path: user may need onboarding (no name, or no active org).
		// Fetch onboarding-status to get accurate state including pending invitations.
		const onboardingResponse = await fetchWithTimeout(
			`${authServiceUrl}/api/subscription/onboarding-status`,
			{
				headers: {
					Cookie: cookieHeader,
					Origin: getAuthAppUrl(),
				},
				cache: "no-store",
			},
		);

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
				banned: sessionData.user.banned,
			},
			onboardingStatus,
			setCookieHeaders,
			sessionJson: JSON.stringify(sessionData),
		};
	} catch {
		return {
			isValid: false,
			user: null,
			onboardingStatus: null,
			setCookieHeaders: [],
		};
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
	const isBetaAccessRoute = pathname.startsWith("/beta-access");
	const isProtectedRoute = isAccountRoute || isSettingsRoute;

	// Public routes that authenticated users should be redirected away from
	// (unless they need onboarding or are visitors)
	const isPublicAuthRoute =
		!isProtectedRoute &&
		!isOnboardingRoute &&
		!isInviteRoute &&
		!isBetaAccessRoute;

	// Beta-access is publicly accessible (visitors are signed out on the page itself)
	if (isBetaAccessRoute) {
		return NextResponse.next();
	}

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

	// Session cookie exists - validate it with auth service and get onboarding status.
	// For the /invite route we always need accurate pendingInvitation data even if the
	// user has already completed onboarding (name + activeOrg), so bypass the fast path.
	const sessionResult = await getSessionWithOnboardingStatus(cookieHeader, {
		requireFullOnboardingStatus: isInviteRoute,
	});
	const { setCookieHeaders } = sessionResult;

	if (!sessionResult.isValid) {
		// Invalid session - redirect to login if on protected, onboarding, invite, or beta-access route
		if (
			isProtectedRoute ||
			isOnboardingRoute ||
			isInviteRoute ||
			isBetaAccessRoute
		) {
			const loginUrl = new URL("/login", request.url);
			const redirectResponse = NextResponse.redirect(loginUrl);
			return addAuthCookies(redirectResponse, setCookieHeaders);
		}
		// Allow access to public routes so user can re-authenticate
		const nextResponse = NextResponse.next();
		return addAuthCookies(nextResponse, setCookieHeaders);
	}

	// Valid session - check onboarding status
	const { onboardingStatus } = sessionResult;
	const sessionJson = sessionResult.sessionJson ?? null;

	// Check if user is banned
	if (sessionResult.user && (sessionResult.user as any).banned) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("banned", "true");
		const redirectResponse = NextResponse.redirect(loginUrl);
		return addAuthCookies(redirectResponse, setCookieHeaders);
	}

	// Check if user is a visitor (beta access waiting)
	const isVisitor = onboardingStatus.isVisitor === true;

	// Handle visitor flow - visitors can only access /beta-access and /login
	if (isVisitor) {
		// Already on beta-access page - allow access
		if (isBetaAccessRoute) {
			const nextResponse = nextWithSession(request, sessionJson);
			return addAuthCookies(nextResponse, setCookieHeaders);
		}
		// On any other route - redirect to beta-access
		const redirectResponse = NextResponse.redirect(
			new URL("/beta-access", request.url),
		);
		return addAuthCookies(redirectResponse, setCookieHeaders);
	}

	// If on beta-access but not a visitor, redirect to appropriate page
	if (isBetaAccessRoute) {
		const userNeedsOnboarding = needsOnboarding(onboardingStatus);
		if (userNeedsOnboarding) {
			const redirectResponse = NextResponse.redirect(
				new URL("/onboarding", request.url),
			);
			return addAuthCookies(redirectResponse, setCookieHeaders);
		}
		const redirectResponse = NextResponse.redirect(
			new URL(getAmlAppUrl(), request.url),
		);
		return addAuthCookies(redirectResponse, setCookieHeaders);
	}

	const userNeedsOnboarding = needsOnboarding(onboardingStatus);

	// Handle invite route - user must be authenticated but can have incomplete onboarding
	// This allows users to accept invitations before completing full onboarding
	if (isInviteRoute) {
		// If user has a pending invitation, allow access to invite page
		if (onboardingStatus.pendingInvitation) {
			const nextResponse = nextWithSession(request, sessionJson);
			return addAuthCookies(nextResponse, setCookieHeaders);
		}
		// No pending invitation - redirect to onboarding or settings
		if (userNeedsOnboarding) {
			const redirectResponse = NextResponse.redirect(
				new URL("/onboarding", request.url),
			);
			return addAuthCookies(redirectResponse, setCookieHeaders);
		}
		const redirectResponse = NextResponse.redirect(
			new URL(getAmlAppUrl(), request.url),
		);
		return addAuthCookies(redirectResponse, setCookieHeaders);
	}

	// User needs onboarding (profile incomplete OR no organization)
	if (userNeedsOnboarding) {
		// Already on onboarding page - allow access
		if (isOnboardingRoute) {
			const nextResponse = nextWithSession(request, sessionJson);
			return addAuthCookies(nextResponse, setCookieHeaders);
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
			onboardingUrl.searchParams.set("redirect_to", getAmlAppUrl());
		}

		const redirectResponse = NextResponse.redirect(onboardingUrl);
		return addAuthCookies(redirectResponse, setCookieHeaders);
	}

	// User has completed onboarding - normal flow
	// If on onboarding page but doesn't need it, redirect away
	if (isOnboardingRoute) {
		const redirectTo = request.nextUrl.searchParams.get("redirect_to");
		const targetUrl = redirectTo || getAmlAppUrl();

		// Ensure we're not redirecting back to onboarding
		if (targetUrl.includes("/onboarding")) {
			const redirectResponse = NextResponse.redirect(
				new URL(getAmlAppUrl(), request.url),
			);
			return addAuthCookies(redirectResponse, setCookieHeaders);
		}

		const redirectResponse = NextResponse.redirect(
			new URL(targetUrl, request.url),
		);
		return addAuthCookies(redirectResponse, setCookieHeaders);
	}

	// Redirect authenticated users away from public auth routes
	if (isPublicAuthRoute) {
		const redirectTo = request.nextUrl.searchParams.get("redirect_to");
		const targetUrl = redirectTo || getAmlAppUrl();
		const redirectResponse = NextResponse.redirect(
			new URL(targetUrl, request.url),
		);
		return addAuthCookies(redirectResponse, setCookieHeaders);
	}

	// Allow access to protected routes
	const nextResponse = nextWithSession(request, sessionJson);
	return addAuthCookies(nextResponse, setCookieHeaders);
}

export const config = {
	// Apply middleware to all routes except static files, api, and monitoring (Sentry tunnel)
	matcher: [
		"/((?!api|monitoring|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
