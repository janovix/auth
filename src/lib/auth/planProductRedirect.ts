/**
 * Canonical plan slugs that may appear in `redirect_to` as opaque tokens after checkout.
 * Watchlist-only maps to the Watchlist app; all listed non-watchlist slugs map to AML.
 */

export const PLAN_SLUGS_FOR_PRODUCT_REDIRECT = [
	"watchlist",
	"business",
	"pro",
	"ultra",
	"enterprise",
] as const;

export type PlanSlugForProductRedirect =
	(typeof PLAN_SLUGS_FOR_PRODUCT_REDIRECT)[number];

const SLUG_SET = new Set<string>(PLAN_SLUGS_FOR_PRODUCT_REDIRECT);

export function isPlanSlugForProductRedirect(
	slug: string,
): slug is PlanSlugForProductRedirect {
	return SLUG_SET.has(slug);
}

export function planSlugUsesWatchlistApp(slug: string): boolean {
	return slug === "watchlist";
}
