import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuroraProvider } from "@/contexts/aurora-context";
import { OnboardingProvider } from "@/contexts/onboarding-context";

import { OnboardingView } from "./OnboardingView";

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

// Mock billing
vi.mock("@/lib/billing", () => ({
	startSubscription: vi
		.fn()
		.mockResolvedValue({ url: "https://stripe.example.com/checkout" }),
	getSubscriptionStatus: vi.fn().mockResolvedValue(null),
}));

// Mock auth client
vi.mock("@/lib/auth/authClient", () => ({
	authClient: {
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

describe("OnboardingView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockPush.mockClear();
		mockFetch.mockClear();

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
		render(
			<ThemeProvider>
				<OnboardingProvider>
					<AuroraProvider>
						<OnboardingView />
					</AuroraProvider>
				</OnboardingProvider>
			</ThemeProvider>,
		);

		// Should show loading state initially
		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it("provides proper context to children", async () => {
		// This test verifies that OnboardingProvider is properly wrapping the view
		// and the context is available
		const renderFn = () =>
			render(
				<ThemeProvider>
					<OnboardingProvider>
						<AuroraProvider>
							<OnboardingView />
						</AuroraProvider>
					</OnboardingProvider>
				</ThemeProvider>,
			);

		// Should not throw "useOnboarding must be used within an OnboardingProvider"
		expect(renderFn).not.toThrow();
	});

	it("accepts redirectTo prop", async () => {
		// This test verifies the component accepts the redirectTo prop
		const renderFn = () =>
			render(
				<ThemeProvider>
					<OnboardingProvider>
						<AuroraProvider>
							<OnboardingView redirectTo="https://custom.example.com" />
						</AuroraProvider>
					</OnboardingProvider>
				</ThemeProvider>,
			);

		expect(renderFn).not.toThrow();
	});
});
