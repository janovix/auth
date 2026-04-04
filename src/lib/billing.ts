/**
 * Billing API client for subscription management
 *
 * User-based billing model:
 * - Users are Stripe customers (not organizations)
 * - Subscription management (checkout, cancel, upgrade) via Better Auth Stripe
 * - Usage tracking and org limits via custom endpoints
 */

import { authClient } from "./auth/authClient";
import { getAuthCoreBaseUrl } from "./auth/authCoreConfig";

const API_BASE = () => `${getAuthCoreBaseUrl()}/api`;

// ============================================================================
// Types
// ============================================================================

export interface PlanLimits {
	maxOrganizations: number;
	usersPerOrg: number;
	reportsPerMonth: number; // Metered: overage billed via Stripe
	noticesPerMonth: number; // Metered: overage billed via Stripe
	alertsPerMonth: number; // Metered: overage billed via Stripe
	operationsPerMonth: number; // Metered: overage billed via Stripe
	clientsPerMonth: number; // Metered: overage billed via Stripe
	watchlistQueriesPerMonth: number; // Per-organization monthly limit
}

export interface UserSubscriptionStatus {
	hasSubscription: boolean;
	status:
		| "trialing"
		| "active"
		| "canceled"
		| "past_due"
		| "unpaid"
		| "incomplete"
		| "incomplete_expired"
		| "paused"
		| null;
	plan: "watchlist" | "business" | "pro" | "ultra" | "enterprise" | null;
	limits: PlanLimits | null;
	isTrialing: boolean;
	trialDaysRemaining: number | null;
	currentPeriodStart: string | null;
	currentPeriodEnd: string | null;
	cancelAtPeriodEnd: boolean;
	// License info (enterprise licenses)
	isLicenseBased?: boolean;
	licenseExpiresAt?: string | null;
	organizationsOwned: number;
	organizationsLimit: number;
}

export interface OrganizationUsage {
	reports: number;
	notices: number;
	alerts: number;
	operations: number;
	clients: number;
	users: number;
}

export interface UsageResponse {
	usage: OrganizationUsage;
	limits: {
		reports: number;
		notices: number;
		alerts: number;
		operations: number;
		clients: number;
		users: number;
		watchlistQueriesPerMonth: number;
	} | null;
	period: {
		start: string;
		end: string;
	};
}

export interface OrgCreationCheck {
	allowed: boolean;
	reason?: string;
}

export type Feature =
	| "product_aml"
	| "product_watchlist"
	| "data_capture"
	| "compliance_validation"
	| "report_generation"
	| "acknowledgment_tracking"
	| "advanced_roles"
	| "approval_flows"
	| "report_templates"
	| "priority_support"
	| "dedicated_support"
	| "custom_integrations"
	| "sla_guarantee";

/**
 * Public plan pricing info (no sensitive Stripe IDs)
 */
export interface PublicPlanPrice {
	priceType: string; // "subscription", "seat", "extra_org", "overage_*"
	amount: number; // Amount in centavos (MXN)
	currency: string;
	interval: string | null; // "month", "year", or null for one-time
	description: string | null;
}

export interface PublicPlanInfo {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
	trialDays: number;
	limits: PlanLimits | null;
	prices: PublicPlanPrice[];
}

interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

/** Options for subscription HTTP calls that can resolve entitlements from the active org owner */
export interface BillingFetchOptions {
	/** When true, use the active organization's owner's plan (session must have active org). */
	resolveFromOrg?: boolean;
}

// ============================================================================
// Subscription Status (via custom endpoint)
// ============================================================================

/**
 * Get subscription status for the current user, or for the active org's owner when
 * `resolveFromOrg` is true (e.g. invited members should see the org's plan).
 */
export async function getSubscriptionStatus(
	options?: BillingFetchOptions,
): Promise<UserSubscriptionStatus | null> {
	const params = options?.resolveFromOrg ? "?resolveFromOrg=true" : "";
	const response = await fetch(`${API_BASE()}/subscription/status${params}`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch subscription status");
	}

	const result = (await response.json()) as ApiResponse<UserSubscriptionStatus>;
	return result.success ? (result.data ?? null) : null;
}

/**
 * Check if user can create a new organization
 */
export async function canCreateOrganization(): Promise<OrgCreationCheck> {
	const response = await fetch(`${API_BASE()}/subscription/can-create-org`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to check org creation limit");
	}

	const result = (await response.json()) as ApiResponse<OrgCreationCheck>;
	return result.data ?? { allowed: false, reason: "Unknown error" };
}

/**
 * Get plan features for the current user, or for the active org's owner when
 * `resolveFromOrg` is true (must match getSubscriptionStatus with the same flag).
 */
export async function getFeatures(
	options?: BillingFetchOptions,
): Promise<Feature[]> {
	const params = options?.resolveFromOrg ? "?resolveFromOrg=true" : "";
	const response = await fetch(`${API_BASE()}/subscription/features${params}`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch features");
	}

	const result = (await response.json()) as ApiResponse<{
		features: Feature[];
	}>;
	return result.data?.features ?? [];
}

// ============================================================================
// Public Pricing (no auth required)
// ============================================================================

/**
 * Get all public plans with pricing info
 * This is for pricing pages and subscription selection
 */
export async function getPublicPlans(): Promise<PublicPlanInfo[]> {
	const response = await fetch(`${API_BASE()}/pricing/plans/public`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch plans");
	}

	const result = (await response.json()) as ApiResponse<PublicPlanInfo[]>;
	return result.data ?? [];
}

/**
 * Get a single plan's public pricing info
 */
export async function getPublicPlanByName(
	name: string,
): Promise<PublicPlanInfo | null> {
	const response = await fetch(`${API_BASE()}/pricing/plans/public/${name}`, {
		credentials: "include",
	});

	if (!response.ok) {
		if (response.status === 404) return null;
		throw new Error("Failed to fetch plan");
	}

	const result = (await response.json()) as ApiResponse<PublicPlanInfo>;
	return result.data ?? null;
}

/**
 * Helper to get subscription price for a plan
 */
export function getSubscriptionPrice(
	plan: PublicPlanInfo,
): PublicPlanPrice | null {
	return plan.prices.find((p) => p.priceType === "subscription") ?? null;
}

/**
 * Helper to format price in MXN (amount is centavos; always two fraction digits)
 */
export function formatPriceMXN(amountInCentavos: number): string {
	return new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: "MXN",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amountInCentavos / 100);
}

// ============================================================================
// Usage Tracking (via custom endpoint)
// ============================================================================

/**
 * Get current organization's usage
 */
export async function getOrganizationUsage(): Promise<UsageResponse | null> {
	const response = await fetch(`${API_BASE()}/subscription/usage`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch usage");
	}

	const result = (await response.json()) as ApiResponse<UsageResponse>;
	return result.success ? (result.data ?? null) : null;
}

// ============================================================================
// Subscription Management (via Better Auth Stripe)
// ============================================================================

/**
 * Ensure a Stripe customer exists for the current user.
 * This should be called before starting a subscription to handle users
 * who signed up before Stripe was configured.
 */
export async function ensureStripeCustomer(): Promise<{
	customerId: string;
	existed: boolean;
}> {
	const response = await fetch(`${API_BASE()}/subscription/ensure-customer`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorData = (await response.json().catch(() => ({}))) as {
			error?: string;
		};
		throw new Error(errorData.error || "Failed to ensure Stripe customer");
	}

	const result = (await response.json()) as {
		success: boolean;
		data?: { customerId: string; existed: boolean };
		error?: string;
	};

	if (!result.success || !result.data) {
		throw new Error(result.error || "Failed to ensure Stripe customer");
	}

	return result.data;
}

/**
 * Start subscription upgrade/checkout flow
 * Uses Better Auth Stripe plugin
 *
 * Automatically ensures a Stripe customer exists before starting checkout.
 */
export async function startSubscription(
	plan: "watchlist" | "business" | "pro" | "ultra",
	successUrl: string,
	cancelUrl: string,
): Promise<{ url: string }> {
	// Ensure customer exists before starting subscription
	// This handles users who signed up before Stripe was configured
	try {
		await ensureStripeCustomer();
	} catch (error) {
		console.warn("Failed to ensure Stripe customer:", error);
		// Continue anyway - the upgrade call might still work if customer was created during signup
	}

	const result = await authClient.subscription.upgrade({
		plan,
		successUrl,
		cancelUrl,
		// Billing portal path (existing subscription) uses returnUrl; without it, "/" resolves to BETTER_AUTH_URL
		returnUrl: successUrl,
	});

	if (result.error) {
		throw new Error(result.error.message || "Failed to start subscription");
	}

	// The plugin returns the checkout URL
	return { url: result.data?.url || successUrl };
}

/**
 * Cancel subscription at period end
 * Uses Better Auth Stripe plugin
 */
export async function cancelSubscription(): Promise<void> {
	const result = await authClient.subscription.cancel({
		returnUrl: window.location.href,
	});

	if (result.error) {
		throw new Error(result.error.message || "Failed to cancel subscription");
	}
}

/**
 * List available plans
 *
 * @deprecated Use getPublicPlans() instead.
 * This function now fetches live plan data from the database via the API
 * instead of returning hardcoded values.
 */
export async function getPlans(): Promise<
	Array<{
		name: string;
		priceId: string;
		limits: PlanLimits;
	}>
> {
	const plans = await getPublicPlans();
	return plans
		.filter((p) => p.limits !== null)
		.map((p) => ({
			name: p.name,
			priceId: "",
			limits: p.limits as PlanLimits,
		}));
}

// ============================================================================
// Legacy Type Aliases (for backwards compatibility during migration)
// ============================================================================

/**
 * @deprecated Use UserSubscriptionStatus instead
 */
export type SubscriptionStatus = UserSubscriptionStatus;

/**
 * @deprecated Usage check is now part of UsageResponse
 */
export interface UsageCheckResult {
	allowed: boolean;
	used: number;
	included: number;
	remaining: number;
	overage: number;
	planTier: "none" | "free" | "business" | "pro" | "enterprise";
}

/**
 * @deprecated Use getPlans() return type instead
 */
export interface Plan {
	id: string;
	name: string;
	tier: "business" | "pro" | "enterprise";
	monthlyPrice: number;
	noticesIncluded: number;
	usersIncluded: number;
	overagePrice: number | null;
	features: string[];
	recommended?: boolean;
}

/**
 * @deprecated Invoices now handled via Stripe Customer Portal
 */
export interface Invoice {
	id: string;
	number: string | null;
	status: string;
	amountDue: number;
	amountPaid: number;
	currency: string;
	periodStart: number;
	periodEnd: number;
	created: number;
	hostedInvoiceUrl: string | null;
	invoicePdf: string | null;
}

/**
 * @deprecated Enterprise licenses removed in user-based model
 */
export interface LicenseStatus {
	id: string;
	customerName: string | null;
	isActive: boolean;
	isExpired: boolean;
	isRevoked: boolean;
	expiresAt: string;
	daysUntilExpiry: number;
	limits: {
		noticesPerMonth: number;
		maxUsers: number;
		maxOperations?: number;
		maxAlerts?: number;
	};
	features: string[];
	activatedAt: string | null;
	organizationId: string | null;
}

// ============================================================================
// Legacy Functions (stubs for backwards compatibility)
// ============================================================================

/**
 * @deprecated Use startSubscription instead
 */
export async function createCheckoutSession(
	planId: string,
	successUrl: string,
	cancelUrl: string,
): Promise<{ sessionId: string; url: string }> {
	let plan: "watchlist" | "business" | "pro" | "ultra" = "business";
	if (planId.includes("ultra")) {
		plan = "ultra";
	} else if (planId.includes("pro")) {
		plan = "pro";
	} else if (planId.includes("watchlist")) {
		plan = "watchlist";
	}
	const result = await startSubscription(plan, successUrl, cancelUrl);
	return { sessionId: "migrated", url: result.url };
}

/**
 * Undo a subscription scheduled to cancel at period end (Stripe cancel_at_period_end).
 * Uses Better Auth Stripe plugin (`/api/auth/subscription/restore`).
 */
export async function reactivateSubscription(): Promise<void> {
	const result = await authClient.subscription.restore({});

	if (result.error) {
		throw new Error(
			result.error.message || "Failed to reactivate subscription",
		);
	}
}

/**
 * @deprecated Invoices now accessed via Stripe Customer Portal
 */
export async function getInvoices(_limit: number = 10): Promise<Invoice[]> {
	console.warn("Invoices now accessed via Stripe Customer Portal");
	return [];
}

/**
 * Get Stripe Customer Portal URL for managing subscription
 * Use this for plan changes, payment method updates, or viewing invoices
 */
export async function getPortalUrl(
	returnUrl: string,
): Promise<{ url: string }> {
	const response = await fetch(`${API_BASE()}/subscription/portal`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ returnUrl }),
	});

	if (!response.ok) {
		const errorData = (await response.json().catch(() => ({}))) as {
			error?: string;
		};
		throw new Error(errorData.error || "Failed to create portal session");
	}

	const result = (await response.json()) as {
		success: boolean;
		data?: { url: string };
		error?: string;
	};

	if (!result.success || !result.data?.url) {
		throw new Error(result.error || "Failed to get portal URL");
	}

	return { url: result.data.url };
}

/**
 * @deprecated Enterprise licenses removed
 */
export async function getLicenseStatus(): Promise<LicenseStatus | null> {
	console.warn("Enterprise licenses deprecated in user-based model");
	return null;
}

/**
 * Activate an enterprise license key for the current user.
 * If the user has an active Stripe subscription it will be cancelled server-side.
 */
export interface LicenseActivationResult {
	message: string;
	plan: string;
	organizationName: string;
	previousPlanCancelled: boolean;
	previousPlan: string | null;
	limits: PlanLimits | null;
}

export async function activateLicenseKey(
	licenseKey: string,
): Promise<LicenseActivationResult> {
	const response = await fetch(`${API_BASE()}/subscription/license/activate`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ key: licenseKey }),
	});

	const result = (await response.json()) as {
		success: boolean;
		data?: LicenseActivationResult;
		error?: string;
	};

	if (!response.ok || !result.success || !result.data) {
		throw new Error(result.error || "Failed to activate license");
	}

	return result.data;
}

// ============================================================================
// Overage, usage details, downgrade (custom auth-svc routes)
// ============================================================================

export interface OverageSettingsData {
	overageEnabled: boolean;
	spendLimitCents: number | null;
	spendLimitCurrency: string;
	periodOverageChargeCents: number;
}

export async function getOverageSettings(): Promise<OverageSettingsData> {
	const response = await fetch(`${API_BASE()}/subscription/overage-settings`, {
		credentials: "include",
	});
	const result = (await response.json()) as ApiResponse<OverageSettingsData>;
	if (!response.ok || !result.success || !result.data) {
		throw new Error(result.error ?? "Failed to load overage settings");
	}
	return result.data;
}

export async function updateOverageSettings(input: {
	overageEnabled?: boolean;
	spendLimitCents?: number | null;
	spendLimitCurrency?: string;
}): Promise<OverageSettingsData> {
	const response = await fetch(`${API_BASE()}/subscription/overage-settings`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	const result = (await response.json()) as ApiResponse<OverageSettingsData>;
	if (!response.ok || !result.success || !result.data) {
		throw new Error(result.error ?? "Failed to update overage settings");
	}
	return result.data;
}

export interface UsageDetailsApi {
	usage: {
		reports: number;
		notices: number;
		alerts: number;
		operations: number;
		clients: number;
		users: number;
		watchlistQueries: number;
	};
	limits: {
		reports: number;
		notices: number;
		alerts: number;
		operations: number;
		clients: number;
		users: number;
		watchlistQueriesPerMonth: number;
		maxOrganizations: number;
	} | null;
	period: { start: string; end: string };
	overage: {
		enabled: boolean;
		spendLimitCents: number | null;
		periodChargeCents: number;
		currency: string;
	};
}

export async function getUsageDetails(): Promise<UsageDetailsApi | null> {
	const response = await fetch(`${API_BASE()}/subscription/usage-details`, {
		credentials: "include",
	});
	if (!response.ok) return null;
	const result = (await response.json()) as ApiResponse<UsageDetailsApi>;
	return result.success ? (result.data ?? null) : null;
}

export interface PrepareDowngradeResponse {
	targetPlan: string;
	targetLimits: { maxOrganizations: number; usersPerOrg: number };
	activeOrganizationCount: number;
	excessOrganizationSlots: number;
	organizations: Array<{
		id: string;
		name: string;
		status: string;
		memberCount: number;
		exceedsUsersPerOrgAfterDowngrade: boolean;
	}>;
}

export async function prepareDowngrade(
	targetPlan: string,
): Promise<PrepareDowngradeResponse> {
	const response = await fetch(`${API_BASE()}/subscription/prepare-downgrade`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ targetPlan }),
	});
	const result =
		(await response.json()) as ApiResponse<PrepareDowngradeResponse> & {
			error?: string;
		};
	if (!response.ok || !result.success || !result.data) {
		throw new Error(result.error ?? "Failed to prepare plan change");
	}
	return result.data;
}

export async function archiveOrganizationsForDowngrade(
	organizationIds: string[],
): Promise<void> {
	const response = await fetch(
		`${API_BASE()}/subscription/downgrade/archive-organizations`,
		{
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ organizationIds }),
		},
	);
	const result = (await response.json()) as {
		success: boolean;
		error?: string;
	};
	if (!response.ok || !result.success) {
		throw new Error(result.error ?? "Failed to archive organizations");
	}
}

/**
 * Change Stripe subscription plan (Better Auth Stripe plugin; proration in Stripe).
 * Returns a portal/checkout URL when the plugin requires a redirect.
 */
export async function changeSubscriptionPlan(
	plan: "watchlist" | "business" | "pro" | "ultra",
	successUrl?: string,
	cancelUrl?: string,
): Promise<{ redirectUrl: string | null }> {
	try {
		await ensureStripeCustomer();
	} catch {
		// continue — upgrade may still succeed
	}

	const origin = typeof window !== "undefined" ? window.location.origin : "";
	const okSuccess = successUrl ?? `${origin}/settings/billing?success=true`;
	const okCancel = cancelUrl ?? `${origin}/settings/billing?canceled=true`;

	const result = await authClient.subscription.upgrade({
		plan,
		successUrl: okSuccess,
		cancelUrl: okCancel,
		// Billing portal path (plan change) uses returnUrl; without it, "/" resolves to BETTER_AUTH_URL
		returnUrl: okSuccess,
	});

	if (result.error) {
		throw new Error(
			result.error.message || "Failed to change subscription plan",
		);
	}

	const url = result.data?.url;
	return {
		redirectUrl: typeof url === "string" && url.length > 0 ? url : null,
	};
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format currency amount (amount is minor units / centavos; always two fraction digits)
 */
export function formatCurrency(
	amount: number,
	currency: string = "MXN",
): string {
	return new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: currency.toUpperCase(),
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount / 100);
}

/**
 * Format date
 */
export function formatDate(timestamp: number | string): string {
	const date =
		typeof timestamp === "string"
			? new Date(timestamp)
			: new Date(timestamp * 1000);
	return new Intl.DateTimeFormat("es-MX", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}

/**
 * Check if user has an active subscription
 */
export function isSubscriptionActive(
	status: UserSubscriptionStatus | null,
): boolean {
	if (!status) return false;
	return (
		status.hasSubscription &&
		(status.status === "active" || status.status === "trialing")
	);
}

/**
 * Whether the current user may see org **Usage & limits** on billing settings.
 * True for an **active or trialing** Stripe subscription or an **active enterprise license**
 * (same rule as {@link isSubscriptionActive}; license-backed rows use `active`/`trialing` status).
 */
export function hasActiveBillingForUsageLimits(
	status: UserSubscriptionStatus | null,
): boolean {
	return isSubscriptionActive(status);
}

/**
 * Whether the user's subscription includes AML product access (PLD compliance
 * settings, AML app). Plan name is authoritative for watchlist-only vs AML;
 * falls back to `product_aml` in features for custom plans.
 */
export function hasAmlProductAccess(
	subscription: UserSubscriptionStatus | null,
	features?: Feature[],
): boolean {
	if (!subscription?.hasSubscription) return false;
	const isActive =
		subscription.status === "active" || subscription.status === "trialing";
	if (!isActive) return false;
	const plan = subscription.plan;
	if (plan === "watchlist") return false;
	if (
		plan === "business" ||
		plan === "pro" ||
		plan === "ultra" ||
		plan === "enterprise"
	) {
		return true;
	}
	if (subscription.isLicenseBased) return true;
	return features?.includes("product_aml") ?? false;
}

/**
 * Whether the user's subscription includes Watchlist product access.
 * Mirrors {@link hasAmlProductAccess} for the watchlist side of plan logic.
 */
/**
 * Whether org path URLs should use the Watchlist app host (watchlist-only plan).
 * AML and other plans use the AML app host.
 */
export function shouldUseWatchlistOrgPathPrefix(
	subscription: UserSubscriptionStatus | null,
): boolean {
	if (!subscription?.hasSubscription) return false;
	if (subscription.status !== "active" && subscription.status !== "trialing") {
		return false;
	}
	return subscription.plan === "watchlist";
}

export function hasWatchlistProductAccess(
	subscription: UserSubscriptionStatus | null,
	features?: Feature[],
): boolean {
	if (!subscription?.hasSubscription) return false;
	const isActive =
		subscription.status === "active" || subscription.status === "trialing";
	if (!isActive) return false;
	const plan = subscription.plan;
	if (plan === "watchlist") return true;
	if (
		plan === "business" ||
		plan === "pro" ||
		plan === "ultra" ||
		plan === "enterprise"
	) {
		return true;
	}
	if (subscription.isLicenseBased) return true;
	return features?.includes("product_watchlist") ?? false;
}

/** Badge copy for the current plan card (use {@link getStatusBadgeInfo}'s `translationKey` with `t()` when set). */
export type StatusBadgeInfo = {
	label: string;
	variant: "default" | "secondary" | "destructive" | "outline";
	/** When set, render `t(translationKey)` instead of `label`. */
	translationKey?: string;
};

/**
 * Get subscription status badge info.
 * When `cancelAtPeriodEnd` is true and status is still active/trialing, shows a pending-cancellation state.
 */
export function getStatusBadgeInfo(
	status: UserSubscriptionStatus["status"],
	options?: { cancelAtPeriodEnd?: boolean },
): StatusBadgeInfo {
	const cancelAtPeriodEnd = options?.cancelAtPeriodEnd ?? false;
	if (cancelAtPeriodEnd && (status === "active" || status === "trialing")) {
		return {
			label: "",
			variant: "outline",
			translationKey: "settings.billing.pendingCancelBadge",
		};
	}
	switch (status) {
		case "active":
			return { label: "Active", variant: "default" };
		case "trialing":
			return { label: "Trial", variant: "secondary" };
		case "canceled":
			return { label: "Canceled", variant: "outline" };
		case "past_due":
			return { label: "Past Due", variant: "destructive" };
		case "unpaid":
			return { label: "Unpaid", variant: "destructive" };
		default:
			return { label: "Inactive", variant: "outline" };
	}
}
