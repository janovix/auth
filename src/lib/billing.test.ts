import { afterEach, describe, expect, it, vi } from "vitest";
import {
	getFeatures,
	getStatusBadgeInfo,
	getSubscriptionStatus,
	getUsageDetails,
	hasActiveBillingForUsageLimits,
	hasAmlProductAccess,
	hasWatchlistProductAccess,
	prepareDowngrade,
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

describe("getUsageDetails", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("returns payload including overagePricing when API succeeds", async () => {
		const payload = {
			usage: {
				reports: 0,
				notices: 0,
				alerts: 0,
				operations: 0,
				clients: 0,
				users: 4,
				watchlistQueries: 1,
			},
			limits: {
				reports: 10,
				notices: 10,
				alerts: 10,
				operations: 10,
				clients: 10,
				users: 3,
				watchlistQueriesPerMonth: 50,
				maxOrganizations: 1,
			},
			period: {
				start: "2026-04-01T00:00:00.000Z",
				end: "2026-05-01T00:00:00.000Z",
			},
			overage: {
				enabled: true,
				spendLimitCents: null,
				periodChargeCents: 0,
				currency: "MXN",
			},
			overagePricing: {
				reports: { unitCents: 100, currency: "MXN" },
				notices: null,
				alerts: null,
				operations: null,
				clients: null,
				seat: {
					unitCents: 25000,
					currency: "MXN",
					interval: "month",
				},
			},
		};
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true, data: payload }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const result = await getUsageDetails();

		expect(result?.overagePricing?.seat?.unitCents).toBe(25000);
		expect(result?.overagePricing?.reports?.unitCents).toBe(100);
		expect(fetchMock).toHaveBeenCalledWith(
			"https://auth-svc.example.workers.dev/api/subscription/usage-details",
			expect.objectContaining({ credentials: "include" }),
		);
	});

	it("returns null when response is not ok", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 403 }),
		);
		expect(await getUsageDetails()).toBeNull();
	});
});

describe("prepareDowngrade", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("returns payload including seatPrice when API succeeds", async () => {
		const data = {
			targetPlan: "business",
			targetLimits: { maxOrganizations: 1, usersPerOrg: 2 },
			activeOrganizationCount: 1,
			excessOrganizationSlots: 0,
			organizations: [
				{
					id: "org-1",
					name: "E Corp",
					status: "active",
					memberCount: 4,
					exceedsUsersPerOrgAfterDowngrade: true,
				},
			],
			seatPrice: {
				amountCents: 25000,
				currency: "MXN",
				interval: "month",
			},
		};
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true, data }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const result = await prepareDowngrade("business");

		expect(result.seatPrice?.amountCents).toBe(25000);
		expect(result.seatPrice?.interval).toBe("month");
		expect(fetchMock).toHaveBeenCalledWith(
			"https://auth-svc.example.workers.dev/api/subscription/prepare-downgrade",
			expect.objectContaining({
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ targetPlan: "business" }),
			}),
		);
	});

	it("throws with API error message when request fails", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				json: async () => ({ success: false, error: "Unknown target plan" }),
			}),
		);
		await expect(prepareDowngrade("nope")).rejects.toThrow(
			"Unknown target plan",
		);
	});
});
