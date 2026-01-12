import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ComplianceSettingsView } from "./ComplianceSettingsView";
import * as settingsClient from "@/lib/settings/settingsClient";

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
		});

		it("shows loading spinner while fetching settings", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockImplementation(
				() => new Promise(() => {}),
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockImplementation(
				() => new Promise(() => {}),
			);

			render(<ComplianceSettingsView />);

			expect(document.querySelector(".animate-spin")).toBeInTheDocument();
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

		it("shows compliance status - configured", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByText("settings.compliance.statusConfigured"),
				).toBeInTheDocument();
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
				expect(screen.getByText("Network error")).toBeInTheDocument();
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
				expect(
					screen.getByText("settings.compliance.saveChanges"),
				).toBeInTheDocument();
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
				expect(
					screen.getByText("settings.compliance.saveChanges"),
				).toBeInTheDocument();
			});

			await user.click(screen.getByText("settings.compliance.saveChanges"));

			await waitFor(() => {
				expect(
					settingsClient.createOrUpdateAmlComplianceSettings,
				).toHaveBeenCalledWith("org-1", {
					obligatedSubjectKey: "ABC010101XYZ",
					activityKey: "VEH",
				});
			});
		});

		it("shows reporting threshold information when activity is selected", async () => {
			vi.mocked(settingsClient.getAmlComplianceSettings).mockResolvedValue(
				mockAmlSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<ComplianceSettingsView />);

			await waitFor(() => {
				// The threshold info card shows when an activity is selected
				expect(
					screen.getByText("settings.compliance.thresholdUMA"),
				).toBeInTheDocument();
			});
		});
	});
});
