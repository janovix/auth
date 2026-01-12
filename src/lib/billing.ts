/**
 * Billing API client for subscription management
 */

import { getAuthCoreBaseUrl } from "./auth/authCoreConfig";

const API_BASE = () => `${getAuthCoreBaseUrl()}/api`;

export interface UsageCheckResult {
	allowed: boolean;
	used: number;
	included: number;
	remaining: number;
	overage: number;
	planTier: "none" | "free" | "business" | "pro" | "enterprise";
}

export interface SubscriptionStatus {
	hasSubscription: boolean;
	isEnterprise: boolean;
	status:
		| "inactive"
		| "trialing"
		| "active"
		| "past_due"
		| "canceled"
		| "unpaid";
	planTier: "none" | "free" | "business" | "pro" | "enterprise";
	planName: string | null;
	currentPeriodStart: string | null;
	currentPeriodEnd: string | null;
	cancelAtPeriodEnd: boolean;
	usage: {
		notices: UsageCheckResult;
		users: UsageCheckResult;
		alerts?: UsageCheckResult;
		transactions?: UsageCheckResult;
	} | null;
	features: string[];
	stripeCustomerId: string;
}

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
		maxTransactions?: number;
		maxAlerts?: number;
	};
	features: string[];
	activatedAt: string | null;
	organizationId: string | null;
}

interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

/**
 * Get subscription status for current organization
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
	const response = await fetch(`${API_BASE()}/subscription`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch subscription status");
	}

	const result = (await response.json()) as ApiResponse<SubscriptionStatus>;
	return result.success ? (result.data ?? null) : null;
}

/**
 * Get available subscription plans
 */
export async function getPlans(): Promise<Plan[]> {
	const response = await fetch(`${API_BASE()}/subscription/plans`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch plans");
	}

	const result = (await response.json()) as ApiResponse<Plan[]>;
	return result.success ? (result.data ?? []) : [];
}

interface CheckoutSessionResult {
	sessionId: string;
	url: string;
}

interface PortalUrlResult {
	url: string;
}

interface ActivateLicenseResult {
	id: string;
	customerName: string;
	expiresAt: string;
	limits: {
		noticesPerMonth: number;
		maxUsers: number;
		maxTransactions?: number;
		maxAlerts?: number;
	};
	features: string[];
}

/**
 * Create a checkout session for subscribing to a plan
 */
export async function createCheckoutSession(
	planId: string,
	successUrl: string,
	cancelUrl: string,
): Promise<CheckoutSessionResult> {
	const response = await fetch(`${API_BASE()}/subscription/checkout`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ planId, successUrl, cancelUrl }),
	});

	if (!response.ok) {
		const result = (await response.json()) as ApiResponse<unknown>;
		throw new Error(result.error || "Failed to create checkout session");
	}

	const result = (await response.json()) as ApiResponse<CheckoutSessionResult>;
	if (!result.data) {
		throw new Error("Failed to create checkout session");
	}
	return result.data;
}

/**
 * Change subscription plan
 */
export async function changePlan(newPlanId: string): Promise<void> {
	const response = await fetch(`${API_BASE()}/subscription/change`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ newPlanId }),
	});

	if (!response.ok) {
		const result = (await response.json()) as ApiResponse<unknown>;
		throw new Error(result.error || "Failed to change plan");
	}
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(): Promise<void> {
	const response = await fetch(`${API_BASE()}/subscription/cancel`, {
		method: "POST",
		credentials: "include",
	});

	if (!response.ok) {
		const result = (await response.json()) as ApiResponse<unknown>;
		throw new Error(result.error || "Failed to cancel subscription");
	}
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(): Promise<void> {
	const response = await fetch(`${API_BASE()}/subscription/reactivate`, {
		method: "POST",
		credentials: "include",
	});

	if (!response.ok) {
		const result = (await response.json()) as ApiResponse<unknown>;
		throw new Error(result.error || "Failed to reactivate subscription");
	}
}

/**
 * Get invoice history
 */
export async function getInvoices(limit: number = 10): Promise<Invoice[]> {
	const response = await fetch(
		`${API_BASE()}/subscription/invoices?limit=${limit}`,
		{
			credentials: "include",
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch invoices");
	}

	const result = (await response.json()) as ApiResponse<Invoice[]>;
	return result.success ? (result.data ?? []) : [];
}

/**
 * Get Stripe Customer Portal URL
 */
export async function getPortalUrl(
	returnUrl: string,
): Promise<PortalUrlResult> {
	const response = await fetch(`${API_BASE()}/subscription/portal`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ returnUrl }),
	});

	if (!response.ok) {
		const result = (await response.json()) as ApiResponse<unknown>;
		throw new Error(result.error || "Failed to get portal URL");
	}

	const result = (await response.json()) as ApiResponse<PortalUrlResult>;
	if (!result.data) {
		throw new Error("Failed to get portal URL");
	}
	return result.data;
}

/**
 * Get current organization's license status
 */
export async function getLicenseStatus(): Promise<LicenseStatus | null> {
	const response = await fetch(`${API_BASE()}/licenses/current`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch license status");
	}

	const result = (await response.json()) as ApiResponse<LicenseStatus>;
	return result.success ? (result.data ?? null) : null;
}

/**
 * Activate a license for the current organization
 */
export async function activateLicense(
	licenseKey: string,
): Promise<ActivateLicenseResult> {
	const response = await fetch(`${API_BASE()}/licenses/activate`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ licenseKey }),
	});

	if (!response.ok) {
		const result = (await response.json()) as ApiResponse<unknown>;
		throw new Error(result.error || "Failed to activate license");
	}

	const result = (await response.json()) as ApiResponse<ActivateLicenseResult>;
	if (!result.data) {
		throw new Error("Failed to activate license");
	}
	return result.data;
}

/**
 * Format currency amount
 */
export function formatCurrency(
	amount: number,
	currency: string = "MXN",
): string {
	return new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: currency.toUpperCase(),
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
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
