import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ComplianceSettingsView } from "./ComplianceSettingsView";
import * as settingsClient from "@/lib/settings/settingsClient";
import * as billing from "@/lib/billing";
import type { UserSubscriptionStatus } from "@/lib/billing";
import { mockToast } from "@/test/setup";
import { environmentAtom } from "@/lib/environment-store";

const mockSubscriptionWithAml: UserSubscriptionStatus = {
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

// Mock the settings client
vi.mock("@/lib/settings/settingsClient", () => ({
	getAmlComplianceSettings: vi.fn(),
	createOrUpdateAmlComplianceSettings: vi.fn(),
	getOrganizationMembership: vi.fn(),
}));

// Mock language context
vi.mock("@/contexts/language-context", () => ({
	useLanguage: vi.fn(() => ({
		t: (key: string) => key,
		language: "en",
		setLanguage: vi.fn(),
	})),
}));

// Mock the auth session hook - no org by default
const mockUseAuthSession = vi.fn(() => ({
	data: {
		user: {
			id: "user-1",
			name: "Test User",
			email: "test@example.com",
			emailVerified: true,
		},
		session: { activeOrganizationId: null },
	},
	error: null,
	isPending: false,
}));

vi.mock("@/lib/auth/useAuthSession", () => ({
	useAuthSession: () => mockUseAuthSession(),
}));

vi.mock("@/lib/billing", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/billing")>();
	return {
		...actual,
		getSubscriptionStatus: vi.fn(),
		getFeatures: vi.fn(),
	};
});

const mockAmlSettings = {
	id: "aml-1",
	organizationId: "org-1",
	obligatedSubjectKey: "ABC010101XYZ",
	activityKey: "VEH",
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

const mockOwnerMembership = {
	role: "owner" as const,
	organizationId: "org-1",
};

const mockMemberMembership = {
	role: "member" as const,
	organizationId: "org-1",
};

describe("ComplianceSettingsView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(async () => {
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	it("shows message when no active organization", async () => {
		render(<ComplianceSettingsView />);

		await waitFor(() => {
			expect(
				screen.getByText("settings.organization.noOrg"),
			).toBeInTheDocument();
		});
	});

	describe("with active organization", () => {
		beforeEach(() => {
			mockUseAuthSession.mockReturnValue({
				data: {
					user: {
						id: "user-1",
						name: "Test User",
						email: "test@example.com",
						emailVerified: true,
					},
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					session: { activeOrganizationId: "org-1" } as any,
				},
				error: null,
				isPending: false,
			});
			vi.mocked(billing.getSubscriptionStatus).mockResolvedValue(
				mockSubscriptionWithAml,
			);
			vi.mocked(billing.getFeatures).mockResolvedValue([]);
			environmentAtom.set("production");
		});

		it("shows skeleton loader while fetching settings", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockImplementation(
				() => new Promise(() => {}),
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockImplementation(
				() => new Promise(() => {}),
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(billing.getSubscriptionStatus).toHaveBeenCalledWith({
					resolveFromOrg: true,
				});
				expect(billing.getFeatures).toHaveBeenCalledWith({
					resolveFromOrg: true,
				});
			});

			// Skeleton uses animate-pulse and data-testid="skeleton"
			expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
		});

		it("shows plan gate when AML product is not on subscription", async () => {
			vi.mocked(billing.getSubscriptionStatus).mockResolvedValue({
				...mockSubscriptionWithAml,
				plan: "watchlist",
			});

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByText("settings.compliance.notAvailableTitle"),
				).toBeInTheDocument();
			});

			expect(settingsClient.getAmlComplianceSettings).not.toHaveBeenCalled();
		});

		it("renders compliance settings page header", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByText("settings.compliance.title"),
				).toBeInTheDocument();
			});
		});

		it("shows shared AML settings notice when data environment is not production", async () => {
			environmentAtom.set("staging");
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByText("settings.compliance.sharedAcrossEnvironmentsTitle"),
				).toBeInTheDocument();
			});
			expect(
				screen.getByText("settings.compliance.sharedAcrossEnvironmentsDesc"),
			).toBeInTheDocument();
		});

		it("renders RFC input field", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(screen.getByText("settings.compliance.rfc")).toBeInTheDocument();
			});

			expect(screen.getByDisplayValue("ABC010101XYZ")).toBeInTheDocument();
		});

		it("renders vulnerable activity selector", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByText("settings.compliance.vulnerableActivity"),
				).toBeInTheDocument();
			});
		});

		it("shows legacy AVI activity when API returns removed catalog code", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue({
				...mockAmlSettings,
				activityKey: "AVI",
			});
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByText("Operaciones con Activos Virtuales"),
				).toBeInTheDocument();
			});
		});

		it("disables inputs for non-owners", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockMemberMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(screen.getByDisplayValue("ABC010101XYZ")).toBeInTheDocument();
			});

			const rfcInput = screen.getByDisplayValue("ABC010101XYZ");
			expect(rfcInput).toBeDisabled();
		});

		it("enables inputs for owners", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(screen.getByDisplayValue("ABC010101XYZ")).toBeInTheDocument();
			});

			const rfcInput = screen.getByDisplayValue("ABC010101XYZ");
			expect(rfcInput).not.toBeDisabled();
		});

		it("does not show warning when compliance is configured", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				// When configured, the warning alert should not be shown
				expect(
					screen.queryByText("settings.compliance.statusNotConfigured"),
				).not.toBeInTheDocument();
			});
		});

		it("shows 'not configured' when no AML settings", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				null,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByText("settings.compliance.statusNotConfigured"),
				).toBeInTheDocument();
			});
		});

		// ComplianceSettingsView disables inputs for non-owners but doesn't show a separate "view only" message

		it("shows error message when settings fail to load", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockRejectedValue(
				new Error("Network error"),
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(mockToast.error).toHaveBeenCalledWith("Network error");
			});
		});

		it("shows save button", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				const buttons = screen.getAllByText("settings.compliance.saveChanges");
				expect(buttons.length).toBeGreaterThan(0);
			});
		});

		it("calls createOrUpdateAmlComplianceSettings when form is submitted", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);
			vi.mocked(
				settingsClient.createOrUpdateAmlComplianceSettings,
			).mockResolvedValue(mockAmlSettings);

			const user = userEvent.setup();
			render(<ComplianceSettingsView />);

			await waitFor(() => {
				const buttons = screen.getAllByText("settings.compliance.saveChanges");
				expect(buttons.length).toBeGreaterThan(0);
			});

			// Click the first button (in the Obligated Subject section, not the disabled one in self-service)
			const buttons = screen.getAllByText("settings.compliance.saveChanges");
			await user.click(buttons[0]);

			await waitFor(() => {
				expect(
					settingsClient.createOrUpdateAmlComplianceSettings,
				).toHaveBeenCalledWith("org-1", {
					obligatedSubjectKey: "ABC010101XYZ",
					activityKey: "VEH",
				});
			});
		});

		it("shows reporting threshold section", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				// The reporting thresholds section should be visible
				expect(
					screen.getByText("settings.compliance.reportingThresholds"),
				).toBeInTheDocument();
			});
		});
	});
});
