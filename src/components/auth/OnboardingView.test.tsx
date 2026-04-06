import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuroraProvider } from "@/contexts/aurora-context";
import { OnboardingProvider } from "@/contexts/onboarding-context";

import { OnboardingView } from "./OnboardingView";

const mockGetPublicPlans = vi.fn();

vi.mock("@/lib/billing", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/billing")>();
	return {
		...actual,
		getPublicPlans: () => mockGetPublicPlans(),
		startSubscription: vi
			.fn()
			.mockResolvedValue({ url: "https://stripe.example.com/checkout" }),
		getSubscriptionStatus: vi.fn().mockResolvedValue(null),
	};
});

vi.mock("@/hooks/useFlags", () => ({
	useFlags: vi.fn(() => ({
		flags: { "stripe-billing-enabled": true },
		error: null,
		isLoading: false,
	})),
}));

vi.mock("@sentry/nextjs", () => ({
	captureException: vi.fn(),
}));

vi.mock("next/image", () => ({
	default: ({
		src,
		alt,
		...props
	}: {
		src: string;
		alt: string;
		[key: string]: unknown;
	}) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={src} alt={alt} {...props} />
	),
}));

import { useFlags } from "@/hooks/useFlags";

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush,
		refresh: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
	}),
	useSearchParams: () => mockSearchParams,
}));

// Mock auth actions
vi.mock("@/lib/auth/authActions", () => ({
	updateProfile: vi.fn().mockResolvedValue({ success: true }),
	signOut: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock auth config
vi.mock("@/lib/auth/authCoreConfig", () => ({
	getAuthCoreBaseUrl: () => "https://auth-svc.example.workers.dev",
	getAmlAppUrl: () => "https://app.example.workers.dev",
}));

// Mock auth client
vi.mock("@/lib/auth/authClient", () => ({
	authClient: {
		getSession: vi.fn().mockResolvedValue({
			data: { user: { name: "Test User", image: null } },
		}),
		organization: {
			create: vi
				.fn()
				.mockResolvedValue({ data: { id: "org-123" }, error: null }),
			setActive: vi.fn().mockResolvedValue({ error: null }),
			acceptInvitation: vi.fn().mockResolvedValue({ error: null }),
			rejectInvitation: vi.fn().mockResolvedValue({ error: null }),
		},
	},
}));

// Mock global fetch for API calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock window.location
const originalLocation = window.location;

function renderOnboarding(ui: React.ReactElement = <OnboardingView />) {
	return render(
		<ThemeProvider>
			<OnboardingProvider>
				<AuroraProvider>{ui}</AuroraProvider>
			</OnboardingProvider>
		</ThemeProvider>,
	);
}

function mockOnboardingStatusForPlanSelection() {
	mockFetch.mockImplementation((url: string) => {
		if (url.includes("/onboarding-status")) {
			return Promise.resolve({
				ok: true,
				json: async () => ({
					success: true,
					data: {
						profileComplete: true,
						hasOrganization: false,
						hasSubscription: false,
						subscriptionStatus: null,
						plan: null,
						pendingInvitation: null,
						pendingInvitations: [],
						canCreateOrganization: false,
					},
				}),
			});
		}
		return Promise.resolve({ ok: true, json: async () => ({}) });
	});
}

describe("OnboardingView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockPush.mockClear();
		mockFetch.mockClear();
		mockGetPublicPlans.mockReset();

		// Mock window.location.href as a writable property
		Object.defineProperty(window, "location", {
			value: {
				...originalLocation,
				href: "",
				origin: "https://auth.example.com",
			},
			writable: true,
		});

		// Default mock for fetch - always responds with loading state
		mockFetch.mockImplementation((url: string) => {
			if (url.includes("/onboarding-status")) {
				return Promise.resolve({
					ok: true,
					json: async () => ({
						success: true,
						data: {
							profileComplete: false,
							hasOrganization: false,
							hasSubscription: false,
							subscriptionStatus: null,
							plan: null,
							pendingInvitation: null,
							canCreateOrganization: false,
						},
					}),
				});
			}
			if (url.includes("/get-session")) {
				return Promise.resolve({
					ok: true,
					json: async () => ({
						user: { name: null, image: null },
					}),
				});
			}
			return Promise.resolve({ ok: true, json: async () => ({}) });
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders without crashing", async () => {
		renderOnboarding();

		// Should show skeleton loading state initially (no CLS spinner-only layout)
		expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
	});

	it("provides proper context to children", async () => {
		// This test verifies that OnboardingProvider is properly wrapping the view
		// and the context is available
		const renderFn = () => renderOnboarding();

		// Should not throw "useOnboarding must be used within an OnboardingProvider"
		expect(renderFn).not.toThrow();
	});

	it("accepts redirectTo prop", async () => {
		// This test verifies the component accepts the redirectTo prop
		const renderFn = () =>
			renderOnboarding(
				<OnboardingView redirectTo="https://custom.example.com" />,
			);

		expect(renderFn).not.toThrow();
	});

	it("shows plan selection when stripe billing is enabled and profile is complete", async () => {
		mockOnboardingStatusForPlanSelection();
		mockGetPublicPlans.mockResolvedValue([
			{
				id: "p1",
				name: "pro",
				displayName: "Pro",
				description: null,
				trialDays: 0,
				limits: null,
				prices: [
					{
						priceType: "subscription",
						amount: 100000,
						currency: "MXN",
						interval: "month",
						description: null,
					},
				],
			},
			{
				id: "w1",
				name: "watchlist",
				displayName: "Watchlist",
				description: null,
				trialDays: 0,
				limits: null,
				prices: [
					{
						priceType: "subscription",
						amount: 49900,
						currency: "MXN",
						interval: "month",
						description: null,
					},
				],
			},
		]);

		vi.mocked(useFlags).mockReturnValue({
			flags: { "stripe-billing-enabled": true },
			error: null,
			isLoading: false,
		});

		renderOnboarding();

		await waitFor(() => {
			expect(mockGetPublicPlans).toHaveBeenCalled();
		});

		await waitFor(() => {
			// src/test/setup.ts mocks useLanguage: unknown keys render as the key string
			expect(
				screen.getByRole("heading", { name: "onboarding.plans.title" }),
			).toBeInTheDocument();
		});
	});

	it("shows license-only onboarding when stripe billing is disabled and profile is complete", async () => {
		mockOnboardingStatusForPlanSelection();
		vi.mocked(useFlags).mockReturnValue({
			flags: { "stripe-billing-enabled": false },
			error: null,
			isLoading: false,
		});

		renderOnboarding();

		await waitFor(() => {
			expect(
				screen.getByRole("heading", {
					name: "onboarding.plans.licenseOnly.title",
				}),
			).toBeInTheDocument();
		});

		expect(mockGetPublicPlans).not.toHaveBeenCalled();
		expect(
			screen.queryByRole("heading", { name: "onboarding.plans.title" }),
		).not.toBeInTheDocument();
	});
});
