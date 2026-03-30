/**
 * Safe redirect resolution for post-auth flows (client + Edge middleware).
 * Prevents open redirects while allowing same-origin paths, trusted app origins,
 * and plan slugs that map to configured product URLs.
 */

export const DEFAULT_POST_AUTH_ROUTE = "/products";

/** Billing plan `name` values that may appear in `redirect_to` as opaque tokens */
export const KNOWN_PLAN_REDIRECT_SLUGS = new Set([
	"watchlist",
	"business",
	"pro",
	"ultra",
	"enterprise",
]);

function trimTrailingSlash(href: string): string {
	return href.replace(/\/$/, "");
}

/** Root-only URLs (/) as href often serialize with a trailing slash; normalize for stable redirects */
function normalizeRedirectHref(href: string): string {
	try {
		const u = new URL(href);
		if (u.pathname === "/" && !u.search && !u.hash) {
			return u.origin;
		}
	} catch {
		/* ignore */
	}
	return href;
}

function readEnvUrl(env: NodeJS.ProcessEnv, key: string): string | undefined {
	const v = env[key]?.trim();
	return v && v.length > 0 ? v : undefined;
}

/**
 * Origins trusted for absolute `redirect_to` values (plus the request base origin).
 */
export function collectTrustedRedirectOrigins(
	baseUrl: string,
	env: NodeJS.ProcessEnv,
): Set<string> {
	const origins = new Set<string>();
	try {
		origins.add(new URL(baseUrl).origin);
	} catch {
		// ignore invalid baseUrl
	}
	for (const key of [
		"NEXT_PUBLIC_AUTH_APP_URL",
		"NEXT_PUBLIC_AML_APP_URL",
		"NEXT_PUBLIC_WATCHLIST_APP_URL",
	] as const) {
		const raw = readEnvUrl(env, key);
		if (!raw) continue;
		try {
			origins.add(new URL(raw).origin);
		} catch {
			// skip invalid
		}
	}
	return origins;
}

/**
 * Maps a known plan slug to the default product app base URL (Stripe / onboarding).
 */
export function resolvePlanTokenToAppUrl(
	planSlug: string,
	env: NodeJS.ProcessEnv,
): string | null {
	if (!KNOWN_PLAN_REDIRECT_SLUGS.has(planSlug)) {
		return null;
	}
	try {
		if (planSlug === "watchlist") {
			const u = readEnvUrl(env, "NEXT_PUBLIC_WATCHLIST_APP_URL");
			if (!u) return null;
			return normalizeRedirectHref(trimTrailingSlash(new URL(u).href));
		}
		const u = readEnvUrl(env, "NEXT_PUBLIC_AML_APP_URL");
		if (!u) return null;
		return normalizeRedirectHref(trimTrailingSlash(new URL(u).href));
	} catch {
		return null;
	}
}

function defaultRedirectUrl(baseUrl: string): string {
	try {
		return normalizeRedirectHref(
			new URL(DEFAULT_POST_AUTH_ROUTE, baseUrl).toString(),
		);
	} catch {
		return DEFAULT_POST_AUTH_ROUTE;
	}
}

/**
 * Returns true if `value` is safe to echo into an onboarding `redirect_to` query param.
 */
export function isSafeRedirectToQueryValue(
	value: string,
	baseUrl: string,
	env: NodeJS.ProcessEnv,
): boolean {
	const trimmed = value.trim();
	if (!trimmed) return false;
	if (KNOWN_PLAN_REDIRECT_SLUGS.has(trimmed)) return true;
	if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
	try {
		const u = new URL(trimmed);
		if (u.protocol !== "http:" && u.protocol !== "https:") return false;
		return collectTrustedRedirectOrigins(baseUrl, env).has(u.origin);
	} catch {
		return false;
	}
}

/**
 * Resolves `redirect_to` to a full URL safe for `NextResponse.redirect` or `window.location.href`.
 */
export function resolveSafeRedirectUrl(
	redirectTo: string | null | undefined,
	baseUrl: string,
	env: NodeJS.ProcessEnv = process.env,
): string {
	const defaultUrl = defaultRedirectUrl(baseUrl);
	const trimmed = redirectTo?.trim();
	if (!trimmed) {
		return defaultUrl;
	}

	const planUrl = resolvePlanTokenToAppUrl(trimmed, env);
	if (planUrl) {
		return planUrl;
	}

	if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
		try {
			const base = new URL(baseUrl);
			const resolved = new URL(trimmed, base);
			if (resolved.origin !== base.origin) {
				return defaultUrl;
			}
			return normalizeRedirectHref(resolved.toString());
		} catch {
			return defaultUrl;
		}
	}

	try {
		const u = new URL(trimmed);
		if (u.protocol !== "http:" && u.protocol !== "https:") {
			return defaultUrl;
		}
		if (!collectTrustedRedirectOrigins(baseUrl, env).has(u.origin)) {
			return defaultUrl;
		}
		return normalizeRedirectHref(u.toString());
	} catch {
		return defaultUrl;
	}
}
