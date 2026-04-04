import { afterEach, describe, expect, it, vi } from "vitest";
import {
	getFeatures,
	getStatusBadgeInfo,
	getSubscriptionStatus,
	hasActiveBillingForUsageLimits,
	hasAmlProductAccess,
	hasWatchlistProductAccess,
	type Feature,
	type UserSubscriptionStatus,
} from "./billing";

const basePaidActive: UserSubscriptionStatus = {
	hasSubscription: true,
	status: "active",
	plan: "business",
	limits: null,
	isTrialing: false,
	trialDaysRemaining: null,
	currentPeriodStart: null,
	currentPeriodEnd: null,
	cancelAtPeriodEnd: false,
	organizationsOwned: 1,
	organizationsLimit: 5,
};

describe("hasAmlProductAccess", () => {
	it("returns false when subscription is null", () => {
		expect(hasAmlProductAccess(null, [])).toBe(false);
	});

	it("returns false for watchlist plan", () => {
		expect(
			hasAmlProductAccess({ ...basePaidActive, plan: "watchlist" }, []),
		).toBe(false);
	});

	it("returns true for business, pro, ultra, enterprise when active", () => {
		for (const plan of ["business", "pro", "ultra", "enterprise"] as const) {
			expect(hasAmlProductAccess({ ...basePaidActive, plan }, [])).toBe(true);
		}
	});

	it("returns true for license-based subscription when active", () => {
		expect(
			hasAmlProductAccess(
				{ ...basePaidActive, plan: null, isLicenseBased: true },
				[],
			),
		).toBe(true);
	});

	it("falls back to product_aml feature for unknown plan", () => {
		const features: Feature[] = ["product_aml"];
		expect(
			hasAmlProductAccess(
				{ ...basePaidActive, plan: null, isLicenseBased: false },
				features,
			),
		).toBe(true);
		expect(
			hasAmlProductAccess(
				{ ...basePaidActive, plan: null, isLicenseBased: false },
				[],
			),
		).toBe(false);
	});

	it("returns false when subscription not active", () => {
		expect(
			hasAmlProductAccess({ ...basePaidActive, status: "canceled" }, [
				"product_aml",
			]),
		).toBe(false);
	});
});

describe("hasWatchlistProductAccess", () => {
	it("returns true for watchlist plan when active", () => {
		expect(
			hasWatchlistProductAccess({ ...basePaidActive, plan: "watchlist" }, []),
		).toBe(true);
	});

	it("returns true for business plan when active", () => {
		expect(hasWatchlistProductAccess(basePaidActive, [])).toBe(true);
	});

	it("falls back to product_watchlist feature", () => {
		expect(
			hasWatchlistProductAccess({ ...basePaidActive, plan: null }, [
				"product_watchlist",
			]),
		).toBe(true);
	});
});

describe("getStatusBadgeInfo", () => {
	it("returns pending-cancel translation key when active and cancelAtPeriodEnd", () => {
		expect(getStatusBadgeInfo("active", { cancelAtPeriodEnd: true })).toEqual({
			label: "",
			variant: "outline",
			translationKey: "settings.billing.pendingCancelBadge",
		});
	});

	it("returns pending-cancel for trialing when cancelAtPeriodEnd", () => {
		expect(getStatusBadgeInfo("trialing", { cancelAtPeriodEnd: true })).toEqual(
			{
				label: "",
				variant: "outline",
				translationKey: "settings.billing.pendingCancelBadge",
			},
		);
	});

	it("returns Active when cancelAtPeriodEnd is false", () => {
		expect(getStatusBadgeInfo("active", { cancelAtPeriodEnd: false })).toEqual({
			label: "Active",
			variant: "default",
		});
	});
});

describe("getSubscriptionStatus / getFeatures URL options", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("getSubscriptionStatus calls status endpoint without query by default", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true, data: null }),
		});
		vi.stubGlobal("fetch", fetchMock);

		await getSubscriptionStatus();

		expect(fetchMock).toHaveBeenCalledWith(
			"https://auth-svc.example.workers.dev/api/subscription/status",
			expect.objectContaining({ credentials: "include" }),
		);
	});

	it("getSubscriptionStatus appends resolveFromOrg=true when requested", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true, data: null }),
		});
		vi.stubGlobal("fetch", fetchMock);

		await getSubscriptionStatus({ resolveFromOrg: true });

		expect(fetchMock).toHaveBeenCalledWith(
			"https://auth-svc.example.workers.dev/api/subscription/status?resolveFromOrg=true",
			expect.objectContaining({ credentials: "include" }),
		);
	});

	it("getFeatures calls features endpoint without query by default", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true, data: { features: [] } }),
		});
		vi.stubGlobal("fetch", fetchMock);

		await getFeatures();

		expect(fetchMock).toHaveBeenCalledWith(
			"https://auth-svc.example.workers.dev/api/subscription/features",
			expect.objectContaining({ credentials: "include" }),
		);
	});

	it("getFeatures appends resolveFromOrg=true when requested", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true, data: { features: [] } }),
		});
		vi.stubGlobal("fetch", fetchMock);

		await getFeatures({ resolveFromOrg: true });

		expect(fetchMock).toHaveBeenCalledWith(
			"https://auth-svc.example.workers.dev/api/subscription/features?resolveFromOrg=true",
			expect.objectContaining({ credentials: "include" }),
		);
	});
});

describe("hasActiveBillingForUsageLimits", () => {
	it("returns false for null", () => {
		expect(hasActiveBillingForUsageLimits(null)).toBe(false);
	});

	it("returns false when canceled", () => {
		expect(
			hasActiveBillingForUsageLimits({
				...basePaidActive,
				status: "canceled",
			}),
		).toBe(false);
	});

	it("returns true for active Stripe subscription", () => {
		expect(hasActiveBillingForUsageLimits(basePaidActive)).toBe(true);
	});

	it("returns true for active enterprise license row", () => {
		expect(
			hasActiveBillingForUsageLimits({
				...basePaidActive,
				isLicenseBased: true,
				plan: "enterprise",
			}),
		).toBe(true);
	});
});
